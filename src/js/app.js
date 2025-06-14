import {
  renderLogin,
  renderRegister,
  renderSongForm,
  renderSongList,
} from "./pages.js";

const root = document.getElementById("root");
const nav = document.getElementById("nav");

function getUser() {
  // 로그인 여부를 localStorage 기준으로 판단
  return localStorage.getItem("token");
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("name");
}

function route() {
  const hash = window.location.hash.replace("#", "");
  nav.innerHTML = getUser() ? `<button id="logout-btn">로그아웃</button>` : "";
  if (hash === "register") renderRegister(root);
  else if (hash === "submit") renderSongForm(root);
  else if (hash === "admin") renderSongList(root, true);
  else if (getUser()) renderSongList(root);
  else renderLogin(root);
}

window.addEventListener("hashchange", route);
window.addEventListener("DOMContentLoaded", route);

nav.addEventListener("click", (e) => {
  if (e.target.id === "logout-btn") {
    logout();
    window.location.hash = "";
    route();
  }
});
