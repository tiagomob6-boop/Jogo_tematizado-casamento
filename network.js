// ============================================================================
// network.js - Gerenciador P2P WebRTC via PeerJS (Mobile 4G/5G + GitHub Pages)
// ============================================================================

const PEER_PREFIX = 'lua-de-mel-casamento-';
const FUN_CODES = [
  'AMOR', 'BOLO', 'ANEL', 'CASA', 'PROF',
  'VIDA', 'DOCE', 'FUGA', 'BEJO', 'NOIV',
  'LUA9', 'SIM2'
];

const PEER_OPTIONS = {
  debug: 2,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' }
    ]
  }
};

export class NetworkManager {
  constructor() {
    this.peer = null;
    this.conn = null;
    this.role = 'local'; // 'local' | 'host' | 'guest'
    this.roomCode = '';
    this.connected = false;
    this.handshakeDone = false;
    this.connTimeout = null;

    this.onConnected = null;
    this.onData = null;
    this.onDisconnected = null;
    this.onError = null;
    this.onStatusChange = null;
  }

  emitStatus(text, phase = 'waiting') {
    if (this.onStatusChange) {
      this.onStatusChange(text, phase, this.role);
    }
  }

  isReady() {
    return Boolean(this.connected && this.conn && this.conn.open && this.handshakeDone);
  }

  generateShortCode(attempt = 0) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    if (attempt < 3) {
      const word = FUN_CODES[Math.floor(Math.random() * FUN_CODES.length)].slice(0, 4);
      if (attempt === 0) return word;
      return word.slice(0, 3) + chars[Math.floor(Math.random() * chars.length)];
    }
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  clearPendingTimeout() {
    if (this.connTimeout) {
      clearTimeout(this.connTimeout);
      this.connTimeout = null;
    }
  }

  disconnect() {
    this.clearPendingTimeout();
    this.connected = false;
    this.handshakeDone = false;
    if (this.conn) {
      try { this.conn.close(); } catch (_) {}
      this.conn = null;
    }
    if (this.peer) {
      try { this.peer.destroy(); } catch (_) {}
      this.peer = null;
    }
    this.role = 'local';
    this.roomCode = '';
  }

  createRoom(onCodeReady, attempt = 0) {
    this.disconnect();
    if (!window.Peer) {
      if (this.onError) this.onError('Biblioteca PeerJS não carregou. Verifique sua conexão.');
      return;
    }

    this.role = 'host';
    this.roomCode = this.generateShortCode(attempt);
    const fullPeerId = PEER_PREFIX + this.roomCode;

    this.emitStatus('⏳ Gerando sala...', 'waiting');
    this.peer = new window.Peer(fullPeerId, PEER_OPTIONS);

    this.peer.on('open', () => {
      this.emitStatus(`⏳ Aguardando parceiro na sala ${this.roomCode}...`, 'waiting');
      if (onCodeReady) onCodeReady(this.roomCode);
    });

    this.peer.on('connection', (connection) => {
      if (this.conn && this.conn !== connection) {
        try { this.conn.close(); } catch (_) {}
      }
      this.handshakeDone = false;
      this.conn = connection;
      this.emitStatus('🔗 Parceiro entrando... Estabelecendo WebRTC...', 'waiting');
      this.setupConnectionEvents();
    });

    this.peer.on('disconnected', () => {
      if (this.peer && !this.peer.destroyed) {
        try { this.peer.reconnect(); } catch (_) {}
      }
    });

    this.peer.on('error', (err) => {
      if (err && err.type === 'unavailable-id' && attempt < 8) {
        this.createRoom(onCodeReady, attempt + 1);
        return;
      }
      if (this.onError) {
        this.onError('Erro na rede P2P: ' + (err.message || err.type || 'Tente novamente'));
      }
    });
  }

  joinRoom(rawCode) {
    const cleanCode = (rawCode || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
    if (cleanCode.length !== 4) {
      if (this.onError) this.onError('Digite um código válido de 4 letras/números (ex: AMOR).');
      return;
    }

    this.disconnect();
    if (!window.Peer) {
      if (this.onError) this.onError('Biblioteca PeerJS não carregou. Verifique sua conexão.');
      return;
    }

    this.role = 'guest';
    this.roomCode = cleanCode;
    this.emitStatus(`⏳ Conectando à sala ${this.roomCode}...`, 'waiting');

    this.peer = new window.Peer(PEER_OPTIONS);

    this.peer.on('open', () => {
      const targetId = PEER_PREFIX + this.roomCode;
      this.emitStatus(`⏳ Buscando ${this.roomCode} via STUN...`, 'waiting');
      this.conn = this.peer.connect(targetId, { reliable: true });

      this.clearPendingTimeout();
      this.connTimeout = setTimeout(() => {
        if (!this.isReady() && this.role === 'guest') {
          if (this.onError) {
            this.onError(`Tempo esgotado ao conectar em "${this.roomCode}". Confira o código ou peça para o Noivo gerar uma nova sala.`);
          }
          this.disconnect();
        }
      }, 20000);

      this.setupConnectionEvents(() => {
        this.clearPendingTimeout();
      });
    });

    this.peer.on('error', (err) => {
      this.clearPendingTimeout();
      let msg = `Não foi possível conectar na sala ${this.roomCode}.`;
      if (err && err.type === 'peer-unavailable') {
        msg = `Sala "${this.roomCode}" não encontrada! Confira o código com o Jogador 1.`;
      } else if (err && err.type === 'network') {
        msg = 'Sem conexão com o servidor PeerJS. Verifique sua internet.';
      }
      if (this.onError) this.onError(msg);
    });
  }

  setupConnectionEvents(onOpenCallback) {
    if (!this.conn) return;

    this.conn.on('open', () => {
      this.connected = true;
      if (onOpenCallback) onOpenCallback();
      this.emitStatus('🤝 Canal aberto! Confirmando parceiro...', 'waiting');
      // Handshake obrigatório (HELLO) para confirmar canal bidirecional antes de iniciar
      try {
        this.conn.send({ type: 'HELLO', role: this.role });
      } catch (_) {}
    });

    this.conn.on('data', (payload) => {
      if (!payload || typeof payload !== 'object') return;

      if (payload.type === 'HELLO') {
        if (!this.handshakeDone) {
          this.handshakeDone = true;
          try {
            if (this.conn && this.conn.open) {
              this.conn.send({ type: 'HELLO_ACK', role: this.role });
            }
          } catch (_) {}
          this.emitStatus('✅ Conectado!', 'ready');
          if (this.onConnected) this.onConnected(this.role, this.roomCode, payload);
        }
      } else if (payload.type === 'HELLO_ACK') {
        if (!this.handshakeDone) {
          this.handshakeDone = true;
          this.emitStatus('✅ Conectado!', 'ready');
          if (this.onConnected) this.onConnected(this.role, this.roomCode, payload);
        }
      }

      if (this.onData) this.onData(payload);
    });

    this.conn.on('close', () => {
      this.clearPendingTimeout();
      const wasReady = this.connected || this.handshakeDone;
      this.connected = false;
      this.handshakeDone = false;
      if (wasReady && this.onDisconnected) {
        this.onDisconnected();
      }
    });

    this.conn.on('error', () => {
      this.clearPendingTimeout();
      if (this.onError) this.onError('Conexão P2P interrompida. Tente reconectar.');
    });
  }

  send(payload) {
    if (this.conn && this.conn.open) {
      try {
        this.conn.send(payload);
      } catch (_) {}
    }
  }
}
