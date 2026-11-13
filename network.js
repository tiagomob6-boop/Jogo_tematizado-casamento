// ============================================================================
// network.js - Gerenciador P2P WebRTC via PeerJS (Sem Backend Próprio)
// ============================================================================

const PEER_PREFIX = 'operacao-luademel-v1-';
const FUN_CODES = [
  'AMOR', 'BOLO', 'ANEL', 'CASA', 'PROF',
  'VIDA', 'DOCE', 'FUGA', 'BEJO', 'NOIV',
  'FESTA', 'LUA9'
];

export class NetworkManager {
  constructor() {
    this.peer = null;
    this.conn = null;
    this.role = 'local'; // 'local' | 'host' | 'guest'
    this.roomCode = '';
    this.connected = false;

    this.onConnected = null;
    this.onData = null;
    this.onDisconnected = null;
    this.onError = null;
  }

  generateShortCode(attempt = 0) {
    if (attempt < 3) {
      const word = FUN_CODES[Math.floor(Math.random() * FUN_CODES.length)].slice(0, 4);
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      if (attempt === 0) return word;
      return word.slice(0, 3) + chars[Math.floor(Math.random() * chars.length)];
    }
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  disconnect() {
    this.connected = false;
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
      if (this.onError) this.onError('Biblioteca PeerJS não carregou. Verifique sua internet.');
      return;
    }

    this.role = 'host';
    this.roomCode = this.generateShortCode(attempt);
    const fullPeerId = PEER_PREFIX + this.roomCode;

    this.peer = new window.Peer(fullPeerId, { debug: 1 });

    this.peer.on('open', () => {
      if (onCodeReady) onCodeReady(this.roomCode);
    });

    this.peer.on('connection', (connection) => {
      this.conn = connection;
      this.setupConnectionEvents();
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
      if (this.onError) this.onError('Digite um código válido de 4 caracteres (ex: AMOR).');
      return;
    }

    this.disconnect();
    if (!window.Peer) {
      if (this.onError) this.onError('Biblioteca PeerJS não carregou. Verifique sua internet.');
      return;
    }

    this.role = 'guest';
    this.roomCode = cleanCode;

    this.peer = new window.Peer({ debug: 1 });

    let connTimeout = null;

    this.peer.on('open', () => {
      const targetId = PEER_PREFIX + this.roomCode;
      this.conn = this.peer.connect(targetId, { reliable: true });

      connTimeout = setTimeout(() => {
        if (!this.connected && this.role === 'guest') {
          if (this.onError) {
            this.onError(`Tempo esgotado ao buscar a sala "${this.roomCode}". Verifique se o código está correto e se o Noivo já criou a sala.`);
          }
          this.disconnect();
        }
      }, 12000);

      this.setupConnectionEvents(() => {
        if (connTimeout) clearTimeout(connTimeout);
      });
    });

    this.peer.on('error', (err) => {
      if (connTimeout) clearTimeout(connTimeout);
      let msg = 'Não foi possível encontrar a sala ' + this.roomCode + '.';
      if (err && err.type === 'peer-unavailable') {
        msg = `Sala "${this.roomCode}" não encontrada! Confira o código com o Jogador 1.`;
      }
      if (this.onError) this.onError(msg);
    });
  }

  setupConnectionEvents(onOpenCallback) {
    if (!this.conn) return;

    this.conn.on('open', () => {
      this.connected = true;
      if (onOpenCallback) onOpenCallback();
      if (this.onConnected) this.onConnected(this.role, this.roomCode);
    });

    this.conn.on('data', (payload) => {
      if (this.onData) this.onData(payload);
    });

    this.conn.on('close', () => {
      const wasConnected = this.connected;
      this.connected = false;
      if (wasConnected && this.onDisconnected) {
        this.onDisconnected();
      }
    });

    this.conn.on('error', () => {
      if (this.onError) this.onError('Conexão interrompida com o outro aparelho.');
    });
  }

  send(payload) {
    if (this.connected && this.conn && this.conn.open) {
      try {
        this.conn.send(payload);
      } catch (_) {}
    }
  }
}
