import cors from "cors";
import express from "express";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { Server } from "socket.io";

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.get("/health", (request, response) => {
  response.json({ ok: true, service: "focus-room-server" });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST"]
  }
});

const players = new Map();

function getRoomState() {
  return Array.from(players.entries()).map(([id, player]) => ({
    id,
    ...player
  }));
}

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("room:join", (profile) => {
    players.set(socket.id, {
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl || "",
      color: profile.color,
      position: profile.position || { x: 120, y: 120 },
      pomodoro: { mode: "idle", remainingSeconds: null }
    });

    io.emit("room:state", getRoomState());
  });

  socket.on("player:move", (position) => {
    const player = players.get(socket.id);
    if (!player) return;

    player.position = position;
    socket.broadcast.emit("player:moved", { id: socket.id, position });
  });

  socket.on("pomodoro:update", (pomodoro) => {
    const player = players.get(socket.id);
    if (!player) return;

    player.pomodoro = pomodoro;
    io.emit("pomodoro:updated", { id: socket.id, pomodoro });
  });

  socket.on("chat:send", (message) => {
    const player = players.get(socket.id);
    if (!player || !message?.body?.trim()) return;

    io.emit("chat:message", {
      id: randomUUID(),
      body: message.body.trim(),
      senderId: socket.id,
      senderName: player.displayName,
      createdAt: new Date().toISOString()
    });
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
    players.delete(socket.id);
    io.emit("room:state", getRoomState());
  });
});

httpServer.listen(PORT, () => {
  console.log(`Focus Room server listening on http://localhost:${PORT}`);
});
