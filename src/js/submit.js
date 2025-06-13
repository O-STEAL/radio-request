const token = localStorage.getItem("token");
const resultDiv = document.getElementById("result");
const mySongsUl = document.getElementById("mySongs");

if (!token) {
  resultDiv.textContent = "로그인 후 이용 가능합니다.";
  resultDiv.style.color = "red";
  setTimeout(() => {
    window.location.href = "index.html";
  }, 2000);
} else {
  document
    .getElementById("songForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      const songLink = document.getElementById("songLink").value;
      const story = document.getElementById("story").value;

      try {
        const res = await fetch("/api/songs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ songLink, story, token }),
        });
        if (res.status === 201) {
          resultDiv.textContent = "곡이 성공적으로 제출되었습니다!";
          resultDiv.style.color = "green";
          document.getElementById("songForm").reset();
          loadMySongs();
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

  async function loadMySongs() {
    mySongsUl.innerHTML = "<li>불러오는 중...</li>";
    try {
      const res = await fetch("/api/songs?token=" + encodeURIComponent(token));
      if (!res.ok) throw new Error();
      const songs = await res.json();
      if (songs.length === 0) {
        mySongsUl.innerHTML = "<li>아직 제출한 곡이 없습니다.</li>";
      } else {
        mySongsUl.innerHTML = "";
        songs.forEach((song) => {
          const li = document.createElement("li");
          li.textContent = `${song.songLink} - ${song.story}`;
          mySongsUl.appendChild(li);
        });
      }
    } catch (e) {
      mySongsUl.innerHTML = "<li>곡 목록을 불러오지 못했습니다.</li>";
    }
  }

  loadMySongs();
}
