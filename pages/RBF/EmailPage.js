// const BasePage = require('../../helpers/BasePage');
// const { expect } = require('@playwright/test');

// class Email_Page extends BasePage {
//   constructor(page) {
//     super(page);
//     this.generatedCode = ''; // class-level property
//   }

  
//   async navigateToEmailHistroy() {
//     console.log("➡️ Navigating to Operational Module...");
//     await this.page.waitForSelector("xpath=//a[@title='Operational']", { state: 'visible', timeout: 10000 });
//     await this.page.locator("xpath=//a[@title='Operational']").click();

//     console.log("➡️ Expanding Email History menu...");

//     await this.page.scrollIntoViewIfNeeded();
//     await this.page.waitForSelector("", { state: 'visible', timeout: 10000 });
//     await this.page.locator("xpath=//h2[@class='noslide mailhistory ']//a[@title='E-mail History']").click();
//     await this.page.waitForTimeout(500);

//     console.log("➡️ Clicking on View email button for quotation...");
//     //todo
//     await this.page.waitForSelector("//div[@class='subject' and contains(text(), 'Your requested Quotation')]//following-sibling::div//a[@title='View E-mail']", { state: 'visible', timeout: 10000 });
//     await this.page.locator("//div[@class='subject' and contains(text(), 'Your requested Quotation')]//following-sibling::div//a[@title='View E-mail']").click();

//    console.log("🔄 You are in quotation email module...");
//   }

// }

// module.exports = Email_Page;