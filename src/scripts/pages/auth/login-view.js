const LoginView = {
  render() {
    return `
        <section class="login-container">
          <h2>Login</h2>
          <form id="login-form">
            <input type="email" id="email" placeholder="Email" required />
            <input type="password" id="password" placeholder="Password" required />
            <button type="submit">Login</button>
          </form>
          <p id="login-message"></p>
          <p>Belum punya akun? <a href="#/register" id="register-link">Daftar</a></p>
        </section>
      `;
  },

  showMessage(message, isError = false) {
    const messageContainer = document.getElementById("login-message");

    if (!messageContainer) {
      // Hindari error jika elemen belum ada
      console.warn("Elemen #login-message belum tersedia di DOM");
      return;
    }

    messageContainer.textContent = message;
    messageContainer.style.color = isError ? "red" : "green";
  },
};

export default LoginView;
