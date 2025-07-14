const { getBaseURL } = require('./environment');

class BasePage {
  constructor(page) {
    this.page = page;
  }

  async navigate(path = '') {
    const baseURL = getBaseURL();
    await this.page.goto(`${baseURL}${path}`);
  }

  // Click operation
  async click(selector) {
    await this.page.click(selector);
  }

  // Type operation
  async type(selector, text) {
    await this.page.fill(selector, text);
  }

  async waitForSelector(selector, options = { timeout: 5000 }) {
    await this.page.waitForSelector(selector, options);
  }

  async isVisible(selector) {
    return await this.page.isVisible(selector);
  }

  async getText(selector) {
    return await this.page.textContent(selector);
  }

  async getAttribute(selector, attribute) {
    return await this.page.getAttribute(selector, attribute);
  }

  async reload() {
    await this.page.reload();
  }

  async goBack() {
    await this.page.goBack();
  }

  async goForward() {
    await this.page.goForward();
  }

  async getTitle() {
    return await this.page.title();
  }

  async getUrl() {
    return this.page.url();
  }
}

module.exports = BasePage;
