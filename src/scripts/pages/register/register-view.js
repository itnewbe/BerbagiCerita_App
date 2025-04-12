const RegisterView = {
  render() {
    return `
        <section class="container register-container">
          <h1>Register</h1>
          <form id="register-form">
            <input type="text" id="name" placeholder="Nama Lengkap" required />
            <input type="email" id="email" placeholder="Email" required />
            <input type="password" id="password" placeholder="Password" required minlength="8"/>
            <button type="submit">Daftar</button>
          </form>
          <p id="register-message"></p>
          <p>Sudah punya akun? <a href="#/login">Login di sini</a></p>
        </section>
      `;
  },

  showMessage(message, isError = false) {
    const messageContainer = document.getElementById("register-message");
    messageContainer.textContent = message;
    messageContainer.style.color = isError ? "red" : "green";
  },
};

export default RegisterView;
