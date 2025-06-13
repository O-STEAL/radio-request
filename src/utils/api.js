import { getUser } from "./auth.js";

export async function submitSong(songLink, story) {
  const user = getUser();
  const res = await fetch("/api/songs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ songLink, story, token: user?.token }),
  });
  return res.ok;
}

export async function fetchSongList() {
  const res = await fetch("/api/songs");
  if (!res.ok) return [];
  return res.json();
}

export async function deleteSong(id) {
  const user = getUser();
  await fetch(`/api/songs/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: user?.token }),
  });
}
