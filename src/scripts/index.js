import "../styles/styles.css";
import App from "./pages/app";
import { registerServiceWorker } from "./utils/push-notification";

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });

  // Selalu tampilkan header
  const header = document.getElementById("header");
  if (header) header.style.display = "block";

  const renderContent = async () => {
    await app.renderPage();
  };

  const useViewTransition = async () => {
    if (document.startViewTransition) {
      document.startViewTransition(() => renderContent());
    } else {
      await renderContent();
    }
  };

  // Render halaman awal
  await useViewTransition();
  await registerServiceWorker();

  // Tangani navigasi hash routing
  window.addEventListener("hashchange", useViewTransition);
  window.addEventListener("popstate", useViewTransition);
});

// Fungsi login
export function loginUser(token) {
  localStorage.setItem("token", token);
  const header = document.getElementById("header");
  if (header) header.style.display = "block";
  window.location.hash = "#/";
}

// Fungsi logout
export function logoutUser() {
  localStorage.removeItem("token");
  window.location.hash = "#/login";
}
