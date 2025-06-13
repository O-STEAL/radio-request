document
  .getElementById("songForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const songLink = document.getElementById("songLink").value;
    const story = document.getElementById("story").value;
    const token = localStorage.getItem("token");
    const resultDiv = document.getElementById("result");

    if (!token) {
      resultDiv.textContent = "로그인 후 제출 가능합니다.";
      resultDiv.style.color = "red";
      return;
    }

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
      } else if (res.status === 401) {
        resultDiv.textContent = "인증이 필요합니다. 다시 로그인하세요.";
        resultDiv.style.color = "red";
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
