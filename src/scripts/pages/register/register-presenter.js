import RegisterView from "./register-view";

const RegisterPresenter = {
  init() {
    const form = document.getElementById("register-form");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const response = await fetch(
          "https://story-api.dicoding.dev/v1/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, password }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message);
        }

        RegisterView.showMessage("Registrasi berhasil! Silakan login.");
      } catch (error) {
        RegisterView.showMessage("Gagal registrasi: " + error.message, true);
      }
    });
  },
};

export default RegisterPresenter;
