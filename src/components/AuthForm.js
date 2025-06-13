export function AuthForm({ type }) {
  return `
    <form id="auth-form">
      <input type="text" name="username" placeholder="아이디" required />
      <input type="password" name="password" placeholder="비밀번호" required />
      ${
        type === "register"
          ? '<input type="text" name="nickname" placeholder="닉네임" required />'
          : ""
      }
      <button type="submit">${type === "login" ? "로그인" : "회원가입"}</button>
      <div>
        ${
          type === "login"
            ? '<a href="#register">회원가입</a>'
            : '<a href="#">로그인</a>'
        }
      </div>
    </form>
  `;
}
