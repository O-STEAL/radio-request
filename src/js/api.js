const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : API_URL + path;
  const token = localStorage.getItem("token");
  const headers = options.headers ? { ...options.headers } : {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(url, {
    ...options,
    headers,
  });
}
