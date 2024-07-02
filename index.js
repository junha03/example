const express = require("express");
const path = require("path");
const { createServer } = require("node:http");
const app = express();
const { Server } = require("socket.io");

const port = 3000;

console.log(__dirname);

const server = createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

server.listen(port, () => console.log("listening on port " + port));

const messages = [];
const users = [];
let started = false;
let turn = 0;

app.get("/info", (req, res) => {
  res.json({ started, messages, users, turn });
});

io.on("connection", (socket) => {
  const userId = socket.id;
  users.push(userId);
  socket.broadcast.emit("addMem", userId);
  socket.on("start", () => {
    if (started) return;
    started = true;
    io.emit("start", { turn });
  });

  socket.on("message", (msg) => {
    if (!started) return;
    if (users[turn] !== userId) {
      socket.emit("info", `당신의 차례가 아닙니다. 현재 차례 : ${users[0]}`);
      return;
    }
    turn = turn == users.length - 1 ? 0 : turn + 1;

    if (messages.length > 0) {
      const lastWord = messages[messages.length - 1][1];
      const lastChar = lastWord[lastWord.length - 1];

      if (msg[0] == lastChar) {
        messages.push([userId, msg]);
        io.emit("message", { userId, message: msg, turn });
      } else {
        socket.emit("info", "단어가 일치하지 않습니다.");
      }
    } else {
      messages.push([userId, msg]);
      io.emit("message", { userId, message: msg, turn });
    }
  });

  socket.on("disconnect", () => {
    users.splice(
      users.findIndex((v) => v == userId),
      1
    );
    io.emit("delMem", userId);
  });
});
