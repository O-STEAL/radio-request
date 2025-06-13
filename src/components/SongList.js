import { getUser } from "../utils/auth.js";
export function SongList({ list, admin }) {
  if (!list.length) return `<div>아직 제출된 곡이 없습니다.</div>`;
  return `
    <ul>
      ${list
        .map(
          (song) => `
        <li>
          <div><b>${song.nickname}</b> (${song.username})</div>
          <div><a href="${song.songLink}" target="_blank">${
            song.songLink
          }</a></div>
          <div>${song.story}</div>
          ${
            admin
              ? `<button class="delete-btn" data-id="${song.id}">삭제</button>`
              : ""
          }
        </li>
      `
        )
        .join("")}
    </ul>
  `;
}
