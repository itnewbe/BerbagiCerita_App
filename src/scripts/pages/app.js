import routes from "../routes/routes";
import { parseActivePathname, getRoute } from "../routes/url-parser";
import { logout } from "../data/api";
import { subscribe } from "../utils/notification-helper";
import SavedStoriesPresenter from "../pages/story/saved-stories-presenter";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  _currentPage = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
    this._setupResizeHandler();

    window.addEventListener("hashchange", () => this.renderPage());
  }

  _setupDrawer() {
    const focusableElements = this.#navigationDrawer.querySelectorAll("a");
    let isDrawerOpen = false;

    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
      isDrawerOpen = this.#navigationDrawer.classList.contains("open");

      if (isDrawerOpen) {
        focusableElements[0]?.focus();
        document.addEventListener("keydown", trapFocus);
      } else {
        document.removeEventListener("keydown", trapFocus);
      }
    });

    document.body.addEventListener("click", (event) => {
      const clickedOutsideDrawer =
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target);

      if (clickedOutsideDrawer) {
        this.#navigationDrawer.classList.remove("open");
        isDrawerOpen = false;
        document.removeEventListener("keydown", trapFocus);
      }

      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
          isDrawerOpen = false;
          document.removeEventListener("keydown", trapFocus);
        }
      });
    });

    const trapFocus = (e) => {
      if (!isDrawerOpen) return;

      const focusables = [...focusableElements];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.key === "Tab") {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }

      if (e.key === "Escape") {
        this.#navigationDrawer.classList.remove("open");
        isDrawerOpen = false;
        this.#drawerButton.focus();
        document.removeEventListener("keydown", trapFocus);
      }
    };
  }

  _setupResizeHandler() {
    window.addEventListener("resize", () => {
      if (window.innerWidth > 1000) {
        this.#navigationDrawer.classList.remove("open");
      }
    });
  }

  async renderPage() {
    const parsedHash = window.location.hash;

    if (parsedHash === "#main-content") {
      const target = document.getElementById("main-content");
      if (target) {
        target.setAttribute("tabindex", "-1");
        target.focus();
        target.scrollIntoView({ behavior: "smooth" });
        history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search
        );
      }
      return;
    }

    const skipLink = document.getElementById("skip-link");
    if (skipLink && !skipLink.dataset.bound) {
      skipLink.dataset.bound = "true";
      skipLink.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.getElementById("main-content");
        if (target) {
          target.setAttribute("tabindex", "-1");
          target.focus();
          target.scrollIntoView({ behavior: "smooth" });
        }
      });
    }

    const parsedUrl = parseActivePathname();
    const route = getRoute(parsedHash.replace("#", "") || "/");
    const page = routes[route];

    if (!page) {
      this.#content.innerHTML = "<h1>404 - Halaman Tidak Ditemukan</h1>";
      this._currentPage = null;
      return;
    }

    if (this._currentPage === page) return;

    if (this._currentPage && typeof this._currentPage.destroy === "function") {
      this._currentPage.destroy();
    }

    const updateContent = async () => {
      this.#content.innerHTML = "";

      if (typeof page.init === "function") {
        this.#content.innerHTML = await (page.render?.() ?? "");
        await page.init();
      } else {
        this.#content.innerHTML = await page.render();
        await page.afterRender?.();
      }

      this._highlightActiveNav(route);
      this._setupLogoutButton();
      this._setupSubscriptionButtons();
    };

    if (document.startViewTransition) {
      document.startViewTransition(updateContent);
    } else {
      this.#content.classList.add("fade-out");
      setTimeout(async () => {
        await updateContent();
        this.#content.classList.remove("fade-out");
        this.#content.classList.add("fade-in");
        setTimeout(() => {
          this.#content.classList.remove("fade-in");
        }, 300);
      }, 300);
    }

    this._currentPage = page;
  }

  _setupLogoutButton() {
    const logoutButton = document.getElementById("logout-button");
    const token = localStorage.getItem("token");

    if (logoutButton) {
      logoutButton.style.display = token ? "block" : "none";

      if (!logoutButton.dataset.bound) {
        logoutButton.dataset.bound = "true";
        logoutButton.addEventListener("click", async (e) => {
          e.preventDefault();
          logoutButton.disabled = true;
          await logout();

          if (window.Swal) {
            Swal.fire({
              title: "Berhasil logout!",
              icon: "success",
              confirmButtonText: "OK",
            }).then(() => {
              window.location.hash = "#/login";
              logoutButton.disabled = false;
            });
          } else {
            this.#content.innerHTML = "<p>Berhasil logout. Mengalihkan...</p>";
            setTimeout(() => {
              window.location.hash = "#/login";
              logoutButton.disabled = false;
            }, 1500);
          }
        });
      }
    }
  }

  _setupSubscriptionButtons() {
    const token = localStorage.getItem("token");
    const subscribeBtn = document.getElementById("subscribe-button");
    const unsubscribeBtn = document.getElementById("unsubscribe-button");
    const loginBtn = document.getElementById("login-button");
    const logoutBtn = document.getElementById("logout-button");

    if (!subscribeBtn || !unsubscribeBtn || !loginBtn || !logoutBtn) return;

    let isSubscribed = localStorage.getItem("isSubscribed") === "true";

    const updateSubscribeButtons = () => {
      if (token) {
        loginBtn.classList.add("hidden");
        logoutBtn.classList.remove("hidden");

        if (isSubscribed) {
          subscribeBtn.classList.add("hidden");
          unsubscribeBtn.classList.remove("hidden");
        } else {
          subscribeBtn.classList.remove("hidden");
          unsubscribeBtn.classList.add("hidden");
        }
      } else {
        loginBtn.classList.remove("hidden");
        logoutBtn.classList.add("hidden");
        subscribeBtn.classList.add("hidden");
        unsubscribeBtn.classList.add("hidden");
      }
    };

    subscribeBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      try {
        await subscribe();
        isSubscribed = true;
        localStorage.setItem("isSubscribed", "true");

        Swal.fire(
          "Berhasil!",
          "Kamu telah berlangganan cerita baru.",
          "success"
        );
        updateSubscribeButtons();
      } catch (error) {
        console.error("Gagal berlangganan:", error);
        Swal.fire("Gagal", "Tidak bisa berlangganan notifikasi.", "error");
      }
    });

    unsubscribeBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
          await subscription.unsubscribe();
          console.log("Berhasil unsubscribe dari push manager");
        }

        isSubscribed = false;
        localStorage.setItem("isSubscribed", "false");

        Swal.fire("Berhasil!", "Kamu telah berhenti berlangganan.", "success");
        updateSubscribeButtons();
      } catch (err) {
        console.error("Gagal unsubscribe:", err);
        Swal.fire(
          "Gagal",
          "Tidak bisa berhenti berlangganan notifikasi.",
          "error"
        );
      }
    });

    // logoutBtn.addEventListener("click", (e) => {
    //   e.preventDefault();
    //   localStorage.removeItem("token");
    //   localStorage.removeItem("isSubscribed");
    //   Swal.fire("Logout", "Kamu telah keluar.", "info").then(() => {
    //     location.reload();
    //   });
    // });

    updateSubscribeButtons();
  }

  _highlightActiveNav(route) {
    const links = this.#navigationDrawer.querySelectorAll("a");
    links.forEach((link) => {
      const linkHref = link.getAttribute("href")?.replace("#", "") || "/";
      if (link.tagName.toLowerCase() === "a" && linkHref === route) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }
}

function setPageContent(contentHTML) {
  const container = document.getElementById("main-content");

  if (document.startViewTransition) {
    document.startViewTransition(() => {
      container.innerHTML = contentHTML;
    });
    return;
  }

  container.classList.add("view-exit");
  requestAnimationFrame(() => {
    container.classList.add("view-exit-active");

    container.addEventListener(
      "transitionend",
      () => {
        container.classList.remove("view-exit", "view-exit-active");

        container.innerHTML = contentHTML;

        container.classList.add("view-enter");
        requestAnimationFrame(() => {
          container.classList.add("view-enter-active");
          container.addEventListener(
            "transitionend",
            () => {
              container.classList.remove("view-enter", "view-enter-active");
            },
            { once: true }
          );
        });
      },
      { once: true }
    );
  });
}

export default App;
