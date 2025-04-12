import { getStories } from "../../data/api.js";
import StoryDB from "../../data/database.js";

export default class HomePage {
  static async render() {
    return `
      <section class="container" style="max-width: 1000px; margin: auto; padding: 20px;">
        <h1 style="text-align: center; margin-bottom: 30px;">Berbagi Cerita</h1>
        <div id="stories-container" class="stories-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
          <p class="loading" style="grid-column: 1 / -1; text-align: center;">Memuat cerita...</p>
        </div>
      </section>
    `;
  }

  static async afterRender() {
    const container = document.getElementById("stories-container");
    const token = localStorage.getItem("token");

    if (!token) {
      this.showNotLoggedIn();
      return;
    }

    try {
      const response = await getStories();
      console.log("Data stories dari API:", response);
      this.showStories(response.listStory);
    } catch (error) {
      console.error("Gagal memuat cerita:", error);
      this.showError(
        "Gagal memuat cerita, silakan login ulang atau coba lagi."
      );
    }
  }

  static showNotLoggedIn() {
    const container = document.getElementById("stories-container");
    if (container) {
      container.innerHTML = `
        <p style="grid-column: 1 / -1; text-align: center; font-size: 18px; color: #888;">
          Anda belum login. Silakan <a href="#/login">login</a> untuk melihat cerita dari pengguna lain.
        </p>
      `;
    }
  }

  static showStories(stories) {
    const container = document.getElementById("stories-container");
    if (!container) return;

    if (!stories || stories.length === 0) {
      container.innerHTML = `
        <p class="info" style="grid-column: 1 / -1; text-align: center;">
          Belum ada cerita. Yuk, tambahkan cerita pertama!
        </p>`;
      return;
    }

    container.innerHTML = "";

    stories.forEach((story) => {
      const storyElement = document.createElement("div");
      storyElement.classList.add("story-card");
      storyElement.style =
        "background: #fff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; display: flex; flex-direction: column;";

      storyElement.innerHTML = `
        <img src="${
          story.photoUrl
        }" alt="Gambar cerita" style="width: 100%; height: 200px; object-fit: cover;" />
        <div style="padding: 15px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <h2 style="margin: 0 0 10px 0; font-size: 20px; color: #333;">${
              story.name
            }</h2>
            <p style="font-size: 14px; color: #555;">${story.description.substring(
              0,
              100
            )}...</p>
         <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">
          <a href="#/story/${
            story.id
          }" style="padding: 10px; background-color: #007bff; color: white; text-align: center; border-radius: 8px; text-decoration: none;">
            Baca Selengkapnya
          </a>
          <button class="save-btn" data-id="${
            story.id
          }" style="padding: 10px; background-color: #28a745; color: white; border: none; border-radius: 8px;">
            Simpan Cerita
          </button>
        </div>

      `;

      container.appendChild(storyElement);
    });
    document.querySelectorAll(".save-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const selectedStory = stories.find((s) => s.id === id);

        try {
          console.log("Data yang akan disimpan:", selectedStory);
          await StoryDB.putStory(selectedStory);
          alert("Cerita berhasil disimpan ke cerita tersimpan!");
          btn.disabled = true;
          btn.textContent = "Sudah Disimpan";
          btn.style.backgroundColor = "#6c757d";
        } catch (error) {
          console.error("Gagal menyimpan cerita:", error);
          alert("Gagal menyimpan cerita.");
        }
      });
    });
  }

  static showError(errorMessage) {
    const container = document.getElementById("stories-container");
    if (container) {
      container.innerHTML = `
        <p class="error" style="color: red; text-align: center;">${errorMessage}</p>
      `;
    }
  }
}
