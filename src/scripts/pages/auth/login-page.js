import LoginView from "./login-view";
import LoginPresenter from "./login-presenter";

export default class LoginPage {
  async render() {
    return LoginView.render();
  }

  async init() {
    LoginPresenter.init();
  }
}
