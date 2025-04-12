import StoryDB from "../../data/database";

export default class SavedStoriesPresenter {
  async init() {
    const container = document.getElementById("main-content");

    container.innerHTML = `
      <section class="container" style="max-width: 1000px; margin: auto; padding: 20px;">
        <h1 style="text-align: center; margin-bottom: 30px;">Cerita Tersimpan</h1>
        <div id="saved-stories-container" class="stories-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
          <p class="loading" style="grid-column: 1 / -1; text-align: center;">Memuat cerita tersimpan...</p>
        </div>
      </section>
    `;

    const gridContainer = document.getElementById("saved-stories-container");
    const stories = await StoryDB.getAllStories();

    if (!stories || stories.length === 0) {
      gridContainer.innerHTML = `
        <div class="empty-card" style="
          grid-column: 1 / -1;
          text-align: center;
          background: #f8f9fa;
          border: 2px dashed #ccc;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          max-width: 500px;
          margin: 2rem auto;
        ">
          <h3 style="margin-bottom: 0.5rem; font-size: 1.4rem; color: #333;">Tidak ada cerita ditemukan</h3>
          <p style="font-size: 1rem; color: #666;">Yuk mulai simpan cerita menarikmu sekarang!</p>
        </div>
      `;
      return;
    }

    gridContainer.innerHTML = "";

    for (const story of stories) {
      const storyElement = document.createElement("div");
      storyElement.classList.add("story-card");
      storyElement.style =
        "background: #fff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; display: flex; flex-direction: column;";

      storyElement.innerHTML = `
        <img src="${story.photoUrl}" alt="${story.name}" style="width: 100%; height: 200px; object-fit: cover;" />
        <div style="padding: 15px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <h2 style="margin: 0 0 10px 0; font-size: 20px; color: #333;">${story.name}</h2>
            <p style="font-size: 14px; color: #555;">${story.description}</p>
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">
            <a href="#/story/${story.id}" style="padding: 10px; background-color: #007bff; color: white; text-align: center; border-radius: 8px; text-decoration: none;">
              Baca Selengkapnya
            </a>
            <button data-id="${story.id}" class="delete-btn" style="padding: 10px; background-color: #dc3545; color: white; border: none; border-radius: 8px;">
              Hapus dari Favorit
            </button>
          </div>
        </div>
      `;

      gridContainer.appendChild(storyElement);
    }

    this.bindDeleteButtons();
  }

  bindDeleteButtons() {
    const buttons = document.querySelectorAll(".delete-btn");
    buttons.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        await StoryDB.deleteStory(id);

        // Hapus elemen dari tampilan
        const card = btn.closest(".story-card");
        card.remove();

        // Jika tidak ada lagi cerita, tampilkan pesan kosong
        const gridContainer = document.getElementById(
          "saved-stories-container"
        );
        if (gridContainer.children.length === 0) {
          gridContainer.innerHTML = `
            <div class="empty-card" style="
              grid-column: 1 / -1;
              text-align: center;
              background: #f8f9fa;
              border: 2px dashed #ccc;
              padding: 2rem;
              border-radius: 12px;
              box-shadow: 0 4px 10px rgba(0,0,0,0.05);
              max-width: 500px;
              margin: 2rem auto;
            ">
              <h3 style="margin-bottom: 0.5rem; font-size: 1.4rem; color: #333;">Tidak ada cerita ditemukan</h3>
              <p style="font-size: 1rem; color: #666;">Yuk mulai simpan cerita menarikmu sekarang!</p>
            </div>
          `;
        }
      });
    });
  }
}
