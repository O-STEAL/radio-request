const USER_KEY = "user";

export function getUser() {
  return JSON.parse(localStorage.getItem(USER_KEY));
}

export async function login(username, password) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) return false;
  const user = await res.json();
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return true;
}

export async function register(username, password, nickname) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, nickname }),
  });
  return res.ok;
}

export function logout() {
  localStorage.removeItem(USER_KEY);
}
