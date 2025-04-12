import { login } from "../../data/api";
import { loginUser } from "../../index"; // atau sesuaikan path bila perlu
import LoginView from "./login-view";

const LoginPresenter = {
  init() {
    const form = document.getElementById("login-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    // Fokus ke password saat Enter di email
    emailInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        passwordInput.focus();
      }
    });

    // Submit form saat Enter di password
    passwordInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        form.requestSubmit(); // submit secara programatik
      }
    });

    // Handler form submit
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = emailInput.value;
      const password = passwordInput.value;

      // Tampilkan pesan sedang login
      LoginView.showMessage("Sedang login, mohon tunggu...", false);

      try {
        const result = await login(email, password);

        if (result.error) throw new Error(result.message);

        loginUser(result.loginResult.token); // Simpan token dan redirect

        LoginView.showMessage("Login berhasil! Mengalihkan...", false);
      } catch (error) {
        LoginView.showMessage(error.message || "Gagal login", true);
      }
    });
    emailInput.focus();
  },
};

export default LoginPresenter;
