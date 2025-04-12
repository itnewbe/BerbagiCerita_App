import StoryDetailPresenter from "../story/story-detail-presenter";

export default class StoryDetailPage {
  constructor() {
    this.presenter = new StoryDetailPresenter();
  }

  async render() {
    return `
      <section class="container" style="max-width: 800px; margin: auto; padding: 20px;">
        <h1 style="text-align: center; margin-bottom: 20px;">Detail Cerita</h1>
        <div id="story-detail" style="background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);"></div>
        <div id="map" style="height: 300px; margin-top: 20px; border-radius: 10px; overflow: hidden;"></div>
      </section>
    `;
  }

  async afterRender() {
    this.presenter.init();
  }
}
