import Base from "./lib/base";

export default class Page404 extends Base {
  async serve(req, res) {
    this.sendErrorHtml(res, 404, "Page not found");
  }
}
