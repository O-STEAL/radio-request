export function SongForm() {
  return `
    <form id="song-form">
      <input type="text" name="songLink" placeholder="노래 링크(YouTube 등)" required />
      <textarea name="story" placeholder="사연을 입력하세요" required></textarea>
      <button type="submit">제출하기</button>
    </form>
  `;
}
