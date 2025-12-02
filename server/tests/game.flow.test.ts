import http from 'http';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { Server } from 'socket.io';
import { setupSocketHandlers } from '../src/socket/index';
import { gameEngine } from '../src/socket/handlers/game.handler';

// In-memory Redis mock
function createInMemoryRedis() {
  const store = new Map<string, string | Set<string>>();

  return {
    async connect() { return; },
    async quit() { store.clear(); },
    async get(key: string) {
      const v = store.get(key);
      if (typeof v === 'string') return v;
      return null;
    },
    async set(key: string, value: string, _opts?: any) {
      store.set(key, value);
      return 'OK';
    },
    async sMembers(key: string) {
      const v = store.get(key);
      if (v instanceof Set) return Array.from(v);
      return [];
    },
    async sAdd(key: string, member: string) {
      let s = store.get(key);
      if (!(s instanceof Set)) {
        s = new Set<string>();
      }
      s.add(member);
      store.set(key, s);
      return 1;
    },
    async sRem(key: string, member: string) {
      const v = store.get(key);
      if (v instanceof Set) {
        v.delete(member);
        return 1;
      }
      return 0;
    },
  } as any;
}

// Mock getRedis prior to importing anything that uses it
jest.mock('../src/config/redis', () => {
  const mockRedis = createInMemoryRedis();
  return {
    initializeRedis: async () => mockRedis,
    getRedis: () => mockRedis,
    closeRedis: async () => {},
  };
});

describe('Game flow via Socket.IO', () => {
  let httpServer: http.Server;
  let io: Server;
  let port: number;
  let clients: ClientSocket[] = [];

  beforeAll((done) => {
    httpServer = http.createServer();
    io = new Server(httpServer, { cors: { origin: '*' } });
    setupSocketHandlers(io);
    httpServer.listen(() => {
      // @ts-ignore
      port = (httpServer.address() as any).port;
      done();
    });
  });

  afterAll(async () => {
    for (const c of clients) c.close();
    io.close();
    httpServer.close();
  });

  test('4 players join, start, draw, play, discard, declare rami, end turn', async () => {
    // Create 4 clients
    const playerIds = ['p1', 'p2', 'p3', 'p4'];
    const playerNames = ['Alice', 'Bob', 'Cara', 'Dan'];

    function connectPlayer(i: number) {
      return new Promise<ClientSocket>((resolve) => {
        const socket = Client(`http://localhost:${port}`);
        clients.push(socket);
        socket.on('connect', () => {
          socket.emit('authenticate', {
            playerId: playerIds[i],
            playerName: playerNames[i],
            playerAvatar: `avatar${i}`,
          });
        });
        socket.on('authenticated', () => resolve(socket));
      });
    }

    const sockets = await Promise.all([0,1,2,3].map((i)=>connectPlayer(i)));

    const host = sockets[0];

    // Host creates a game
    const created = await new Promise<any>((resolve) => {
      host.emit('game:create', {});
      host.on('game:created', (data: any) => resolve(data));
    });

    expect(created).toBeDefined();
    const gameId = created.gameId;
    expect(gameId).toBeDefined();

    // Other players join
    const joinPromises = sockets.slice(1).map((s: ClientSocket, idx: number) => new Promise<any>((resolve) => {
      s.emit('game:join', {
        gameId,
        playerId: playerIds[idx+1],
        playerName: playerNames[idx+1],
        playerAvatar: `avatar${idx+1}`,
      });
      s.on('game:joined', (data: any) => resolve(data));
    }));

    const joined = await Promise.all(joinPromises);
    expect(joined.length).toBe(3);

    // Host starts the game
    const startedPromise = new Promise<any>((resolve) => {
      let count = 0;
      function handler(data: any) {
        count++;
        if (count === 4) resolve(data);
      }
      for (const s of sockets) s.on('game:started', handler);
    });

    host.emit('game:start', { gameId });
    await startedPromise;

    // Get current game and current player
    const game = gameEngine.getGame(gameId);
    expect(game.status).toBeDefined();
    const currentPlayerId = game.currentPlayerId;
    expect(currentPlayerId).toBeDefined();

    // Find socket for current player
    const cpIndex = playerIds.indexOf(currentPlayerId as string);
    const cpSocket = sockets[cpIndex];

    // Listen for draw events
    const drawPromise = new Promise<any>((resolve) => {
      cpSocket.on('game:card_drawn', (data: any) => resolve(data));
    });

    cpSocket.emit('game:draw', { gameId, fromDiscard: false });
    const drawData = await drawPromise;
    expect(drawData).toBeDefined();
    expect(drawData.game).toBeDefined();

    // Prepare a valid set meld for current player by mutating the engine state directly
    const playerState = game.players.find((p: any) => p.id === currentPlayerId)!;
    // Create three fake cards with same rank but different suits
    const c1 = { id: 'c1', suit: 'HEARTS', rank: 'ACE', deckNumber: 1 } as any;
    const c2 = { id: 'c2', suit: 'DIAMONDS', rank: 'ACE', deckNumber: 1 } as any;
    const c3 = { id: 'c3', suit: 'CLUBS', rank: 'ACE', deckNumber: 1 } as any;
    playerState.hand.push(c1, c2, c3);
    playerState.hasDrawn = true;

    // Listen for meld_created
    const meldPromise = new Promise<any>((resolve) => {
      for (const s of sockets) s.on('game:meld_created', (d: any) => resolve(d));
    });

    cpSocket.emit('game:play', { gameId, cardIds: ['c1','c2','c3'], meldType: 'SET' });
    const meldData = await meldPromise;
    expect(meldData).toBeDefined();
    expect(meldData.playerId).toBe(currentPlayerId);

    // Now test discard
    // Find a card in hand to discard (ensure player has at least one)
    const discardCard = playerState.hand[0]?.id;
    expect(discardCard).toBeDefined();

    const discardPromise = new Promise<any>((resolve) => {
      let count = 0;
      function handler(data: any) {
        count++;
        if (count === 1) resolve(data);
      }
      for (const s of sockets) s.on('game:card_discarded', handler as any);
    });

    cpSocket.emit('game:discard', { gameId, cardId: discardCard });
    const discardData = await discardPromise;
    expect(discardData).toBeDefined();
    expect(discardData.cardId).toBe(discardCard);

    // End turn should have been triggered after discard; check that currentPlayerId changed
    const gameAfterDiscard = gameEngine.getGame(gameId);
    expect(gameAfterDiscard.currentPlayerId).not.toBe(currentPlayerId);

    // Prepare a player to declare Rami: set their hand empty and melds non-empty
    const targetPlayer = gameAfterDiscard.players[1];
    targetPlayer.hand = [];
    targetPlayer.melds = [{ id: 'm1', type: 'SET', cards: [ { id: 'x1', suit: 'HEARTS', rank: 'TWO', deckNumber:1 } ] } as any];
    targetPlayer.hasMelded = true;
    // Force turn to target player
    gameAfterDiscard.currentPlayerId = targetPlayer.id;
    gameAfterDiscard.currentTurn = {
      playerId: targetPlayer.id,
      phase: 'WAITING_FOR_DISCARD' as any,
      drewCard: true,
      drawSource: null,
      drewCardId: null,
      playedMelds: [],
      playedLayoffs: [],
      startTime: new Date(),
      timeRemaining: null,
    } as any;

    // Save mutated game within engine map
    // (gameEngine already uses same object reference)

    // Listen for rami declaration
    const ramiPromise = new Promise<any>((resolve) => {
      for (const s of sockets) s.on('game:rami_declared', (d: any) => resolve(d));
    });

    // Find socket for target player
    const targetIndex = playerIds.indexOf(targetPlayer.id);
    const targetSocket = sockets[targetIndex];
    targetSocket.emit('game:declare', { gameId });
    const ramiData = await ramiPromise;
    expect(ramiData).toBeDefined();
    expect(ramiData.roundWinnerId).toBe(targetPlayer.id);

    // Cleanup sockets
    for (const s of sockets) s.close();
  }, 20000);
});
