// src/api.js
const API_URL = import.meta.env.VITE_API_URL;

export function apiFetch(path, options) {
  // path가 이미 http/https로 시작하면 그대로, 아니면 prefix
  const url = path.startsWith("http") ? path : API_URL + path;
  return fetch(url, options);
}
