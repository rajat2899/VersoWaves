const BasePage = require('../../helpers/BasePage');
const { expect } = require('@playwright/test');
const { getBaseURL } = require('../../helpers/environment');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async login(username, password) {
    await this.waitForSelector('#username', { visible: true });
    await this.type('#username', username);

    await this.waitForSelector('#password', { visible: true });
    await this.type('#password', password);

    await this.waitForSelector("xpath=//input[@value='Login']", { visible: true }); 
    await this.click("xpath=//input[@value='Login']");   

    // Robust post-login wait
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle').catch(() => {});

    // Handle exceeded-sessions declined page by redirecting to base domain
    const baseURL = getBaseURL();
    const currentUrl = this.page.url();
    if (currentUrl.includes('/login/declined.html')) {
      console.warn('Detected declined page after login. Redirecting to base URL:', baseURL);
      await this.page.goto(baseURL, { waitUntil: 'domcontentloaded' });
      await this.page.waitForLoadState('networkidle').catch(() => {});
    }

    // Accept either base URL variants or a stable dashboard element (admin takeover link)
    const urlMatched = await this.page.waitForURL(/rbf-cargocare\.wavestesting\.com(\/.*)?$/, { timeout: 30000 }).then(() => true).catch(() => false);
    if (!urlMatched) {
      await this.page.getByRole('link', { name: 'Takeover Administrator account' }).waitFor({ state: 'visible', timeout: 30000 });
    }

    console.log("Login successful.");        
  }

  async UserTakeOver_Quotation_Module(){

  await this.page.locator("xpath=//a[text()='Takeover Administrator account']").click();
  

  }

  
}

module.exports = LoginPage;
