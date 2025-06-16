import { apiFetch } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const name = localStorage.getItem("name");
  const username = localStorage.getItem("username");

  document.getElementById("user-name").textContent = name
    ? `${name} (${username})`
    : "";
  document.getElementById("logout-btn").onclick = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const todaySongsOl = document.getElementById("todaySongs");
  const allSongsOl = document.getElementById("allSongs");
  const resultDiv = document.getElementById("result");

  const allToggle = document.getElementById("allToggle");
  let showAll = false;
  allToggle.onchange = () => {
    showAll = allToggle.checked;
    loadSongs();
  };

  const withStory = document.getElementById("withStory");
  const hasStory = document.getElementById("hasStory");
  const storyTextarea = document.getElementById("story");
  if (withStory && hasStory && storyTextarea) {
    withStory.addEventListener("change", () => {
      if (withStory.checked) hasStory.checked = false;
      if (withStory.checked) storyTextarea.disabled = false;
    });
    hasStory.addEventListener("change", () => {
      if (hasStory.checked) withStory.checked = false;
      if (hasStory.checked) {
        storyTextarea.value = "";
        storyTextarea.disabled = true;
      }
    });
    if (hasStory.checked) storyTextarea.disabled = true;
  }

  document
    .getElementById("songForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      if (!token) {
        resultDiv.textContent = "로그인 후 이용 가능합니다.";
        resultDiv.style.color = "red";
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
        return;
      }
      const songLink = document.getElementById("songLink").value.trim();
      const anonymous =
        document.querySelector('input[name="isAnonymous"]:checked').value ===
        "yes";
      const hasStory =
        document.querySelector('input[name="hasStory"]:checked').value ===
        "yes";
      const story =
        hasStory && storyTextarea.value.trim()
          ? storyTextarea.value.trim()
          : "";
      if (!songLink) {
        resultDiv.textContent = "신청곡 링크를 입력하세요.";
        resultDiv.style.color = "red";
        return;
      }
      try {
        const res = await apiFetch("/songs/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            anonymous,
            songLink,
            hasStory,
            story,
          }),
        });
        if (res.status === 201 || res.status === 200) {
          resultDiv.textContent = "곡이 성공적으로 제출되었습니다!";
          resultDiv.style.color = "green";
          document.getElementById("songForm").reset();
          if (withStory && hasStory && storyTextarea) {
            withStory.checked = false;
            hasStory.checked = true;
            storyTextarea.value = "";
            storyTextarea.disabled = true;
          }
          loadSongs();
        } else if (res.status === 401) {
          resultDiv.textContent = "인증이 필요합니다. 다시 로그인하세요.";
          resultDiv.style.color = "red";
          setTimeout(() => {
            window.location.href = "/";
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

  async function loadSongs() {
    todaySongsOl.innerHTML = "<li>불러오는 중...</li>";
    allSongsOl.innerHTML = "<li>불러오는 중...</li>";
    try {
      const res = await apiFetch("/songs/all");
      if (!res.ok) throw new Error();
      const songs = await res.json();

      todaySongsOl.innerHTML = "";
      songs
        .slice(-4)
        .reverse()
        .forEach((song, i) => {
          const li = document.createElement("li");
          const songTitle = song.songTitle || song.songLink || "";
          const storyHtml = song.story
            ? `<span class="story">${escapeHtml(song.story)}</span><br>`
            : "";
          li.innerHTML = `<span class="num">${
            4 - i
          }</span> <strong>${escapeHtml(songTitle)}</strong>${storyHtml}`;
          todaySongsOl.appendChild(li);
        });

      allSongsOl.innerHTML = "";
      const showList = showAll ? songs : songs.slice(-6);
      showList
        .map((song, i) => ({ ...song, idx: showList.length - i }))
        .forEach((song) => {
          const li = document.createElement("li");
          const songTitle = song.songTitle || song.songLink || "";
          const storyHtml = song.story
            ? `<span class="story">${escapeHtml(song.story)}</span><br>`
            : "";
          li.innerHTML = `<span class="num">${
            song.idx
          }</span> <strong>${escapeHtml(songTitle)}${storyHtml}</strong>`;
          allSongsOl.appendChild(li);
        });
    } catch (e) {
      todaySongsOl.innerHTML = "<li>신청곡을 불러오지 못했습니다.</li>";
      allSongsOl.innerHTML = "<li>신청곡을 불러오지 못했습니다.</li>";
    }
  }
  function escapeHtml(str) {
    if (!str) return "";
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
});
