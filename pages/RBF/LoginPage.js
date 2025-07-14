const BasePage = require('../../helpers/BasePage');
const { expect } = require('@playwright/test');

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


    await this.page.waitForURL("https://rbf-cargocare.wavestesting.com/", { timeout: 20000 });



    console.log("Login successful.");        
  }


  async UserTakeOver_Quotation_Module(){

  await this.page.locator("xpath=//a[@title='Login as A. Administrator']//img").click();
  

  }

  
}

module.exports = LoginPage;
