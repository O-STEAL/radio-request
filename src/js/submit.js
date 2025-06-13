const token = localStorage.getItem("token");
const nickname = localStorage.getItem("nickname");
const username = localStorage.getItem("username");
const resultDiv = document.getElementById("result");
const todaySongsOl = document.getElementById("todaySongs");
const allSongsOl = document.getElementById("allSongs");
const withStory = document.getElementById("withStory");
const withoutStory = document.getElementById("withoutStory");
const storyTextarea = document.getElementById("story");

// 사연 여부 체크박스 동기화 (둘 다 체크 불가)
withStory.addEventListener("change", () => {
  if (withStory.checked) withoutStory.checked = false;
});
withoutStory.addEventListener("change", () => {
  if (withoutStory.checked) withStory.checked = false;
  if (withoutStory.checked) storyTextarea.value = "";
});

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
    try {
      const res = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          songLink,
          story,
          token,
          isAnonymous, // 서버에서 익명처리 미구현시 사용X
        }),
      });
      if (res.status === 201) {
        resultDiv.textContent = "곡이 성공적으로 제출되었습니다!";
        resultDiv.style.color = "green";
        document.getElementById("songForm").reset();
        withStory.checked = true;
        withoutStory.checked = false;
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
    const res = await fetch("/api/songs");
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
    // 전체 신청곡 목록
    allSongsOl.innerHTML = "";
    songs
      .map((song, i) => ({ ...song, idx: i + 1 }))
      .forEach((song, i) => {
        const li = document.createElement("li");
        li.innerHTML = `<span class="num">${song.idx}</span> ${escapeHtml(
          song.songLink
        )}${song.story ? ` - ${escapeHtml(song.story)}` : ""}`;
        // 임시: 5번째 항목에 "조상철" 뱃지 부여 (샘플)
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
