import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

const PORT = 4000;

const app = express();
const players = new Map();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "Focus Room server is running" });
});

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("player:join", (player) => {
    const joinedPlayer = {
      ...player,
      id: socket.id
    };

    players.set(socket.id, joinedPlayer);

    socket.emit(
      "players:current",
      Array.from(players.values()).filter((savedPlayer) => savedPlayer.id !== socket.id)
    );

    socket.broadcast.emit("player:joined", joinedPlayer);

    console.log("Player joined:", socket.id);
  });

  socket.on("player:move", (position) => {
    const player = players.get(socket.id);

    if (!player) {
      return;
    }

    player.position = position;

    socket.broadcast.emit("player:moved", {
      ...player,
      position
    });
  });

  socket.on("chat:send", (message) => {
    const player = players.get(socket.id);

    if (!player || !message.body.trim()) {
      return;
    }

    io.emit("chat:message", {
      id: crypto.randomUUID(),
      body: message.body.trim(),
      senderId: socket.id,
      senderName: player.displayName
    });
  });

  socket.on("disconnect", () => {
    players.delete(socket.id);
    socket.broadcast.emit("player:left", socket.id);
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});