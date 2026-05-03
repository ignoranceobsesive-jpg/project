import { createServer } from 'http';
import { Server } from 'socket.io';

const PORT = 3003;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

interface Room {
  code: string;
  hostId: string;
  players: Map<string, {
    id: string;
    name: string;
    survivorId: string;
    isHost: boolean;
    isReady: boolean;
    health: number;
    position: [number, number, number];
  }>;
  difficulty: string;
  gameStarted: boolean;
}

const rooms = new Map<string, Room>();

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function getRoomByPlayer(socketId: string): Room | null {
  for (const room of rooms.values()) {
    if (room.players.has(socketId)) return room;
  }
  return null;
}

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Create a new room
  socket.on('create-room', (data: { name: string; survivorId: string; difficulty: string }) => {
    const code = generateCode();
    const room: Room = {
      code,
      hostId: socket.id,
      players: new Map(),
      difficulty: data.difficulty || 'normal',
      gameStarted: false,
    };
    room.players.set(socket.id, {
      id: socket.id,
      name: data.name,
      survivorId: data.survivorId,
      isHost: true,
      isReady: false,
      health: 100,
      position: [0, 1.6, 0],
    });
    rooms.set(code, room);
    socket.join(code);
    socket.emit('room-created', { code, playerId: socket.id });
    socket.emit('room-updated', {
      code,
      players: Array.from(room.players.values()),
      difficulty: room.difficulty,
    });
    console.log(`Room created: ${code} by ${data.name}`);
  });

  // Join an existing room
  socket.on('join-room', (data: { code: string; name: string; survivorId: string }) => {
    const room = rooms.get(data.code.toUpperCase());
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    if (room.players.size >= 4) {
      socket.emit('error', { message: 'Room is full' });
      return;
    }
    if (room.gameStarted) {
      socket.emit('error', { message: 'Game already in progress' });
      return;
    }

    room.players.set(socket.id, {
      id: socket.id,
      name: data.name,
      survivorId: data.survivorId,
      isHost: false,
      isReady: false,
      health: 100,
      position: [0, 1.6, 0],
    });
    socket.join(data.code.toUpperCase());
    socket.emit('room-joined', { code: data.code.toUpperCase(), playerId: socket.id });

    // Notify all players
    io.to(data.code.toUpperCase()).emit('room-updated', {
      code: data.code.toUpperCase(),
      players: Array.from(room.players.values()),
      difficulty: room.difficulty,
    });
    console.log(`${data.name} joined room ${data.code}`);
  });

  // Ready toggle
  socket.on('toggle-ready', () => {
    const room = getRoomByPlayer(socket.id);
    if (!room) return;
    const player = room.players.get(socket.id);
    if (player) {
      player.isReady = !player.isReady;
      io.to(room.code).emit('room-updated', {
        code: room.code,
        players: Array.from(room.players.values()),
        difficulty: room.difficulty,
      });
    }
  });

  // Change survivor
  socket.on('change-survivor', (data: { survivorId: string }) => {
    const room = getRoomByPlayer(socket.id);
    if (!room) return;
    const player = room.players.get(socket.id);
    if (player) {
      player.survivorId = data.survivorId;
      io.to(room.code).emit('room-updated', {
        code: room.code,
        players: Array.from(room.players.values()),
        difficulty: room.difficulty,
      });
    }
  });

  // Start game (host only)
  socket.on('start-game', () => {
    const room = getRoomByPlayer(socket.id);
    if (!room || room.hostId !== socket.id) return;

    const allReady = Array.from(room.players.values()).every((p) => p.isReady || p.id === room.hostId);
    if (!allReady) {
      socket.emit('error', { message: 'Not all players are ready' });
      return;
    }

    room.gameStarted = true;
    io.to(room.code).emit('game-started', {
      difficulty: room.difficulty,
      players: Array.from(room.players.values()),
    });
    console.log(`Game started in room ${room.code}`);
  });

  // Update player position
  socket.on('player-position', (data: { position: [number, number, number]; rotation: number }) => {
    const room = getRoomByPlayer(socket.id);
    if (!room) return;
    const player = room.players.get(socket.id);
    if (player) {
      player.position = data.position;
      socket.to(room.code).emit('player-moved', {
        playerId: socket.id,
        position: data.position,
        rotation: data.rotation,
      });
    }
  });

  // Player attack
  socket.on('player-attack', (data: { weapon: string; direction: [number, number, number] }) => {
    const room = getRoomByPlayer(socket.id);
    if (!room) return;
    socket.to(room.code).emit('player-attacked', {
      playerId: socket.id,
      weapon: data.weapon,
      direction: data.direction,
    });
  });

  // Player damaged
  socket.on('player-damaged', (data: { health: number }) => {
    const room = getRoomByPlayer(socket.id);
    if (!room) return;
    const player = room.players.get(socket.id);
    if (player) {
      player.health = data.health;
      io.to(room.code).emit('player-health-updated', {
        playerId: socket.id,
        health: data.health,
      });
    }
  });

  // Chat message
  socket.on('chat-message', (data: { message: string }) => {
    const room = getRoomByPlayer(socket.id);
    if (!room) return;
    const player = room.players.get(socket.id);
    if (player) {
      io.to(room.code).emit('chat-message', {
        playerId: socket.id,
        playerName: player.name,
        message: data.message,
        time: Date.now(),
      });
    }
  });

  // Ping
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: Date.now() });
  });

  // Kick player (host only)
  socket.on('kick-player', (data: { playerId: string }) => {
    const room = getRoomByPlayer(socket.id);
    if (!room || room.hostId !== socket.id) return;

    const targetPlayer = room.players.get(data.playerId);
    if (targetPlayer) {
      io.to(data.playerId).emit('kicked', { reason: 'Kicked by host' });
      room.players.delete(data.playerId);
      io.to(room.code).emit('room-updated', {
        code: room.code,
        players: Array.from(room.players.values()),
        difficulty: room.difficulty,
      });
    }
  });

  // Leave room
  socket.on('leave-room', () => {
    handleDisconnect(socket.id);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    handleDisconnect(socket.id);
  });
});

function handleDisconnect(socketId: string) {
  for (const [code, room] of rooms.entries()) {
    if (room.players.has(socketId)) {
      room.players.delete(socketId);

      if (room.players.size === 0) {
        rooms.delete(code);
        console.log(`Room ${code} deleted (empty)`);
      } else {
        // Host migration
        if (room.hostId === socketId) {
          const newHost = room.players.values().next().value;
          if (newHost) {
            room.hostId = newHost.id;
            newHost.isHost = true;
            io.to(newHost.id).emit('host-migrated', { isHost: true });
          }
        }
        io.to(code).emit('room-updated', {
          code,
          players: Array.from(room.players.values()),
          difficulty: room.difficulty,
        });
      }
      break;
    }
  }
}

httpServer.listen(PORT, () => {
  console.log(`🎮 Game Socket server running on port ${PORT}`);
});
