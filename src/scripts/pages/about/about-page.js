import AboutPresenter from "../about/about-presenter";

export default class AboutPage {
  constructor() {
    this.presenter = new AboutPresenter();
  }

  async render() {
    return this.presenter.getTemplate();
  }

  async afterRender() {
    this.presenter.afterRender();
  }
}
