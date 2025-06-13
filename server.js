import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(__dirname));

let users = [
  {
    username: "admin",
    password: "admin",
    nickname: "관리자",
    token: "admintoken",
    isAdmin: true,
  },
];
let songs = [];
let songId = 1;

function auth(token) {
  return users.find((u) => u.token === token);
}

// 회원가입
app.post("/api/auth/register", (req, res) => {
  const { username, password, nickname } = req.body;
  if (users.some((u) => u.username === username)) return res.status(400).end();
  const token = Math.random().toString(36).slice(2);
  users.push({ username, password, nickname, token });
  res.status(201).end();
});

// 로그인
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  const found = users.find(
    (u) => u.username === username && u.password === password
  );
  if (!found) return res.status(400).end();
  res.json({
    username,
    nickname: found.nickname,
    token: found.token,
    isAdmin: found.isAdmin,
  });
});

// 노래 신청
app.post("/api/songs", (req, res) => {
  const { songLink, story, token } = req.body;
  const user = auth(token);
  if (!user) return res.status(401).end();
  songs.push({
    id: songId++,
    username: user.username,
    nickname: user.nickname,
    songLink,
    story,
  });
  res.status(201).end();
});

// 노래 목록
app.get("/api/songs", (req, res) => {
  res.json(songs);
});

// 삭제(관리자만)
app.delete("/api/songs/:id", (req, res) => {
  const { token } = req.body;
  const user = auth(token);
  if (!user?.isAdmin) return res.status(403).end();
  const id = parseInt(req.params.id, 10);
  songs = songs.filter((s) => s.id !== id);
  res.status(204).end();
});

const PORT = 3000;
app.listen(PORT, () => console.log(`서버 시작: http://localhost:${PORT}`));
