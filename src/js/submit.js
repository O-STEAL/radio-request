import { apiFetch } from "./api.js";

const token = localStorage.getItem("token");
const name = localStorage.getItem("name");
const username = localStorage.getItem("username");

// 사용자 name 표시/로그아웃
document.getElementById("user-name").textContent = name
  ? `${name} (${username})`
  : "";
document.getElementById("logout-btn").onclick = () => {
  localStorage.clear();
  window.location.href = "index.html";
};

// 오늘의 신청곡/전체 신청곡
const todaySongsOl = document.getElementById("todaySongs");
const allSongsOl = document.getElementById("allSongs");
const resultDiv = document.getElementById("result");

// ALL 토글
const allToggle = document.getElementById("allToggle");
let showAll = false;
allToggle.onchange = () => {
  showAll = allToggle.checked;
  loadSongs();
};

// 사연 여부 체크박스 동기화
const withStory = document.getElementById("withStory");
const withoutStory = document.getElementById("withoutStory");
const storyTextarea = document.getElementById("story");
withStory.addEventListener("change", () => {
  if (withStory.checked) withoutStory.checked = false;
  if (withStory.checked) storyTextarea.disabled = false;
});
withoutStory.addEventListener("change", () => {
  if (withoutStory.checked) withStory.checked = false;
  if (withoutStory.checked) {
    storyTextarea.value = "";
    storyTextarea.disabled = true;
  }
});
if (withoutStory.checked) storyTextarea.disabled = true;

// 폼 제출
document
  .getElementById("songForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!token) {
      resultDiv.textContent = "로그인 후 이용 가능합니다.";
      resultDiv.style.color = "red";
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
      return;
    }
    const songLink = document.getElementById("songLink").value.trim();
    const story =
      withStory.checked && storyTextarea.value.trim()
        ? storyTextarea.value.trim()
        : "";
    const isAnonymous =
      document.querySelector('input[name="isAnonymous"]:checked').value ===
      "yes";
    if (!songLink) {
      resultDiv.textContent = "신청곡 링크를 입력하세요.";
      resultDiv.style.color = "red";
      return;
    }
    try {
      const res = await apiFetch("/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          songLink,
          story,
          token,
          isAnonymous,
        }),
      });
      if (res.status === 201) {
        resultDiv.textContent = "곡이 성공적으로 제출되었습니다!";
        resultDiv.style.color = "green";
        document.getElementById("songForm").reset();
        withStory.checked = false;
        withoutStory.checked = true;
        storyTextarea.value = "";
        storyTextarea.disabled = true;
        loadSongs();
      } else if (res.status === 401) {
        resultDiv.textContent = "인증이 필요합니다. 다시 로그인하세요.";
        resultDiv.style.color = "red";
        setTimeout(() => {
          window.location.href = "index.html";
        }, 2000);
      } else {
        resultDiv.textContent =
          "제출에 실패했습니다. 잠시 후 다시 시도해 주세요.";
        resultDiv.style.color = "red";
      }
    } catch (err) {
      resultDiv.textContent = "서버와 연결할 수 없습니다.";
      resultDiv.style.color = "red";
    }
  });

// 신청곡 목록 불러오기
async function loadSongs() {
  todaySongsOl.innerHTML = "<li>불러오는 중...</li>";
  allSongsOl.innerHTML = "<li>불러오는 중...</li>";
  try {
    const res = await apiFetch("/songs");
    if (!res.ok) throw new Error();
    const songs = await res.json();

    // 오늘의 신청곡 (최신 4개)
    todaySongsOl.innerHTML = "";
    songs
      .slice(-4)
      .reverse()
      .forEach((song, i) => {
        const li = document.createElement("li");
        li.innerHTML = `<span class="num">${4 - i}</span> ${escapeHtml(
          song.songLink
        )}${song.story ? ` - ${escapeHtml(song.story)}` : ""}`;
        todaySongsOl.appendChild(li);
      });

    // 전체 신청곡 목록 (showAll: 전체, 아니면 6개만)
    allSongsOl.innerHTML = "";
    const showList = showAll ? songs : songs.slice(-6);
    showList
      .map((song, i) => ({ ...song, idx: showList.length - i }))
      .forEach((song) => {
        const li = document.createElement("li");
        // 예시: 3번째 항목 링크, 5번째 뱃지
        let songTitle = escapeHtml(song.songLink);
        if (song.idx === 3) songTitle = `<a href="#">${songTitle}</a>`;
        li.innerHTML = `<span class="num">${song.idx}</span> ${songTitle}${
          song.story ? ` - ${escapeHtml(song.story)}` : ""
        }`;
        if (song.idx === 5) li.innerHTML += `<span class="badge">조상철</span>`;
        allSongsOl.appendChild(li);
      });
  } catch (e) {
    todaySongsOl.innerHTML = "<li>신청곡을 불러오지 못했습니다.</li>";
    allSongsOl.innerHTML = "<li>신청곡을 불러오지 못했습니다.</li>";
  }
}
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, function (m) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[m];
  });
}
loadSongs();
