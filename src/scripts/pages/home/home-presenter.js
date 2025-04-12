import HomePage from "./home-page.js";

const HomePresenter = {
  async init() {
    const mainContent = document.getElementById("main-content");

    mainContent.innerHTML = await HomePage.render();

    await HomePage.afterRender();
  },
};

export default HomePresenter;
