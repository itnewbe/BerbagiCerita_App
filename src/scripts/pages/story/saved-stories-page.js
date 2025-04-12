import SavedStoriesPresenter from "./saved-stories-presenter";

export default class SavedStoriesPage {
  constructor() {
    this.presenter = new SavedStoriesPresenter();
  }

  async render() {
    return `
      <section class="container" style="max-width: 1000px; margin: auto; padding: 20px;">
        <h1 style="text-align: center; margin-bottom: 30px;">Cerita Tersimpan</h1>
        <div id="main-content" class="stories-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;"
          <p class="loading" style="grid-column: 1 / -1; text-align: center;">Memuat cerita tersimpan...</p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    await this.presenter.init();
  }
}
