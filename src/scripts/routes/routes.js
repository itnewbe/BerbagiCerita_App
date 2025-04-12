import HomePresenter from "../pages/home/home-presenter.js";
import AboutPage from "../pages/about/about-page.js";
import StoryDetailPage from "../pages/story/story-detail-page.js";
import AddStoryPage from "../pages/story/add-story-page.js";
import LoginPage from "../pages/auth/login-page.js";
import RegisterPage from "../pages/register/register-page.js";
import SavedStoriesPage from "../pages/story/saved-stories-presenter.js";

const routes = {
  "/": HomePresenter,
  "/login": new LoginPage(),
  "/register": new RegisterPage(),
  "/story/:id": new StoryDetailPage(),
  "/add-story": new AddStoryPage(),
  "/about": new AboutPage(),
  "/saved-stories": new SavedStoriesPage(),
};

export default routes;
