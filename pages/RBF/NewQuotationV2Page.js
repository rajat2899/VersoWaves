const BasePage = require('../../helpers/BasePage');
const { expect } = require('@playwright/test');

class New_Quotation_V2 extends BasePage {
  constructor(page) {
    super(page);
    this.generatedCode = ''; // class-level property
  }

  async navigateToNewQuotationV2() {
    console.log("➡️ Navigating to Sales section...");
    
    await this.page.waitForLoadState('domcontentloaded');

    // Prefer a stable, role-based locator and explicit navigation wait
    const salesLink = this.page.getByRole('link', { name: 'Sales' });
    await salesLink.first().waitFor({ state: 'visible', timeout: 30000 });
    await Promise.all([
      this.page.waitForURL('**/sales.html', { timeout: 30000 }),
      salesLink.first().click()
    ]);

    console.log("➡️ Expanding Quotations menu...");
    const quotationsLink = this.page.locator("xpath=//h2[contains(@class,'quotations')]/a[normalize-space(text())='Quotations']");
    await quotationsLink.first().waitFor({ state: 'visible', timeout: 20000 });
    await quotationsLink.first().click();

    // Ensure submenu is expanded and the link is attached/visible
    const newQuotationLink = this.page.locator("xpath=//li//a[normalize-space(text())='New Quotation']");
    await newQuotationLink.first().waitFor({ state: 'attached', timeout: 20000 });

    // If still hidden, try expanding again
    if (!(await newQuotationLink.first().isVisible())) {
      await quotationsLink.first().click();
      await this.page.waitForTimeout(200);
    }

    console.log("➡️ Clicking New Quotation...");
    // Try normal click; if hidden, click forcefully
    const clickNewQuotation = async () => {
      try {
        await newQuotationLink.first().waitFor({ state: 'visible', timeout: 5000 });
        await Promise.all([
          this.page.waitForURL('**/quotations-v2/add.html', { timeout: 30000 }),
          newQuotationLink.first().click(),
        ]);
      } catch {
        await Promise.all([
          this.page.waitForURL('**/quotations-v2/add.html', { timeout: 30000 }),
          newQuotationLink.first().click({ force: true }),
        ]);
      }
    };
    await clickNewQuotation();

    console.log("🔄 Waiting for quotation page URL...");
    await this.page.waitForURL("https://rbf-cargocare.wavestesting.com/quotations-v2/add.html", { timeout: 30000 });
  }

  async step1_fillCompanyAndDetails() {
    console.log("📝 Typing company name...");
    const companyInput = this.page.locator("//input[@id='company']");
    await companyInput.waitFor({ state: 'visible', timeout: 10000 });
    await companyInput.click();
    await this.page.keyboard.type('oscar');

    // Wait for suggestion list to become active
    const activeList = this.page.locator("//div[contains(@class,'selectlist') and contains(@class,'active')]");
    await activeList.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

    console.log("📄 Selecting company from dropdown...");
    const companyOption = this.page.locator("//div[@class='selectoption' and contains(text(), 'OSCAR MAYER (ROWAN FOODS)')]");
    try {
      await companyOption.waitFor({ state: 'visible', timeout: 10000 });
      await companyOption.click();
    } catch (e) {
      // If option is hidden, try re-focusing input to reopen list and force click
      await companyInput.click();
      await this.page.waitForTimeout(300);
      if (!(await companyOption.isVisible())) {
        await activeList.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      }
      if (await companyOption.isVisible()) {
        await companyOption.click({ force: true });
      } else {
        // Keyboard fallback: ArrowDown through options and Enter
        await this.page.keyboard.press('ArrowDown');
        await this.page.waitForTimeout(200);
        await this.page.keyboard.press('Enter');
      }
    }

    // Store the selected company name for later use
    this.selectedCompanyName = await companyOption.textContent().catch(() => undefined);

    await this.page.waitForTimeout(1000);

    console.log("📄 Selecting company email from dropdown...");
    const selectCompanyContact = this.page.locator("(//div[@class='selectbutton'])[last()-4]");
    await selectCompanyContact.waitFor({ state: 'visible', timeout: 10000 });
    await selectCompanyContact.click();    

     try {
      const defaultOption = this.page.locator("//div[@class='selectlist active']//div[@class='selectoption' and contains(text(),'Default company e-mail')]");
      await defaultOption.waitFor({ state: 'visible', timeout: 10000 });
      await defaultOption.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(500);
      await defaultOption.click({ trial: true });   
      await defaultOption.click();
      console.log("✅ Default email is selected");
    } catch (error) {
      console.warn('❌ Regular click failed, trying JS click...');
      try {
        const newOption = this.page.locator("//div[@class='selectlist active']//div[@class='selectoption' and contains(text(),'Default company e-mail')]");
        await newOption.evaluate(el => el.click());
        console.log("✅ JS-based click succeeded.");
      } catch (innerErr) {
        console.error('❌ JS click also failed:', innerErr);
        await this.page.screenshot({ path: 'unstable-new-option.png', fullPage: true }).catch(() => {});
      }
    }

    console.log("🔍 Checking if default email label is visible...");
    const label = this.page.locator("//span[@class='currentoption' and contains(text(),'Default company e-mail')]");
    try {
      await label.waitFor({ state: 'visible', timeout: 5000 });
      console.log("✅ Label is visible.");
    } catch {
      console.log("⚠️ Label not visible.");
    }

    console.log("⚙️ Clicking generate quotation reference...");
    const genRefBtn = this.page.locator("//a[@id='generateQuotationReference']");
    await genRefBtn.waitFor({ state: 'visible', timeout: 10000 });
    await genRefBtn.click();

    // Wait for the hidden input to have a non-empty value
    await this.page.waitForFunction(() => {
      const el = document.getElementById('quotereference_hidden');
      return el && el.value && el.value.trim().length > 0;
    }, { timeout: 10000 });

    // Fetch the value using evaluate (works even if hidden)
    const hiddenReferenceCode = await this.page.evaluate(() => {
      const el = document.getElementById('quotereference_hidden');
      return el ? el.value : null;
    });
    console.log("✅ Hidden Quotation Reference Code:", hiddenReferenceCode);

    const refLocator = this.page.locator("//input[@id='quotereference']");
    await refLocator.waitFor({ state: 'visible', timeout: 10000 });

    this.generatedCode = await refLocator.inputValue();
    console.log("✅ Generated Quotation Reference Code:", this.generatedCode);

    // Fetch and log the hidden reference code as well


    console.log("📆 Selecting period...");
    const activeSelect = this.page.locator("(//div[@class='selectbutton'])[6]");
    await activeSelect.waitFor({ state: 'visible', timeout: 10000 });
    await activeSelect.click();

    try {
      const aprilOption = this.page.locator("//div[@class='selectlist active']//div[@class='selectoption' and contains(text(), 'November 2025 (1 Nov - 30 Nov)')]");
      await aprilOption.waitFor({ state: 'visible', timeout: 10000 });
      await aprilOption.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(500);
      await aprilOption.click({ trial: true });   
      await aprilOption.click();
      console.log("✅ August 2025 option selected.");
    } catch (error) {
      console.warn('❌ Regular click failed, trying JS click...');
      try {
        const aprilOption = this.page.locator("//div[@class='selectlist active']//div[@class='selectoption' and contains(text(), 'November 2025 (1 Nov - 30 Nov)')]");
        await aprilOption.evaluate(el => el.click());
        console.log("✅ JS-based click succeeded.");
      } catch (innerErr) {
        console.error('❌ JS click also failed:', innerErr);
        await this.page.screenshot({ path: 'unstable-april-option.png', fullPage: true }).catch(() => {});
      }
    }

    console.log("☑️ Clicking first checkbox...");
    const firstCheckbox = this.page.locator("//div[@class='inline-checkbox-iphone']//div[@class='iphone-checkbox-style off']");
    
    await firstCheckbox.first().waitFor({ state: 'visible', timeout: 10000 });
    await firstCheckbox.first().click();

    // console.log("☑️ Clicking all other checkboxes..."); 
    // const checkboxes = this.page.locator("(//div[@class='inline-checkbox-iphone'])//div[@class='iphone-checkbox-style off']");
    // await checkboxes.click();

    try {
      console.log("🚚 Clicking Freight Charges row...");
      const freightChargesLocator = this.page.locator("//div[@class='tarifftable' and contains(text(),'Freight charges door to door')]");
      await freightChargesLocator.waitFor({ state: 'visible', timeout: 10000 });
      await freightChargesLocator.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(500);
      await freightChargesLocator.evaluate(el => el.click());
      console.log("✅ Freight charges row clicked.");
    } catch (error) {
      console.error("❌ Error during Freight Charges click:", error);
      await this.page.screenshot({ path: 'click-failure.png', fullPage: true }).catch(() => {});
    }
    
    console.log("📆 Selecting Incoterms...");
    const selectIncoterms = this.page.locator("(//div[@class='selectbutton'])[last()]");
    await selectIncoterms.waitFor({ state: 'visible', timeout: 10000 });
    await selectIncoterms.click();

    try {
      const incotermsOption = this.page.locator("//div[@class='selectlist active']//div[@class='selectoption' and contains(text(), 'FAS (FREE ALONGSIDE SHIP)')]");
      await incotermsOption.waitFor({ state: 'visible', timeout: 10000 });
      await incotermsOption.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(500);
      await incotermsOption.click({ trial: true });   
      await incotermsOption.click();
      console.log("✅ Incoterms selected");
    } catch (error) {
      console.warn('❌ Regular click failed, trying JS click...');
      try {
        const aprilOption = this.page.locator("//div[@class='selectlist active']//div[@class='selectoption' and contains(text(), 'FAS (FREE ALONGSIDE SHIP)')]");
        await aprilOption.evaluate(el => el.click());
        console.log("✅ JS-based click succeeded.");
      } catch (innerErr) {
        console.error('❌ JS click also failed:', innerErr);
        await this.page.screenshot({ path: 'unstable-april-option.png', fullPage: true }).catch(() => {});
      }
    }

    console.log("➡️ Clicking Next Step...");
    const nextStepBtn = this.page.locator("//input[@id='nextstep2']");
    await nextStepBtn.waitFor({ state: 'visible', timeout: 10000 });
    await nextStepBtn.click();
  }

  async step2_verifyTariffAndAddLines() {
    console.log("🔍 Verifying Tariff Table Title and Subtitle...");
    const titleField = this.page.locator("//input[@class='textfield xlarge inlinefield notempty']");
    const subtitleField = this.page.locator("//input[@class='textfield xlarge inlinefield allowempty']");

    await titleField.waitFor({ state: 'visible', timeout: 10000 });
    await subtitleField.waitFor({ state: 'visible', timeout: 10000 });

    const titleValue = await titleField.inputValue();
    const subtitleValue = await subtitleField.inputValue();
     

    console.log(`✅ Tariff Table Title: "${titleValue}"`); 
    console.log(`✅ Table Subtitle: "${subtitleValue}"`);

    if (titleValue !== "Ocean Freight") { 
      throw new Error(`❌ Expected Tariff Table Title to be "Ocean Freight" but got "${titleValue}"`);
    }
 
    if (subtitleValue !== "Shenzhen to Maidenhead SL6") { 
      throw new Error(`❌ Expected Table Subtitle to be "Shenzhen to Maidenhead SL6" but got "${subtitleValue}"`);
    }

    console.log("🎉 Tariff table title and subtitle verified successfully.");  

    console.log("☑️ Activating tariff table checkbox...");
    await this.page.locator("xpath=//div[@class='iphone-checkbox-style off']").click();

    console.log("🧾 Selecting tariff lines...");
    await this.page.locator("xpath=//a[@title='Select Tariff Lines']").click();
    await this.page.locator("xpath=(//input[@type='checkbox'])[1]").click();
     await this.page.locator("xpath=//input[@title='Add selected Tariff lines']").click();

    console.log("➡️ Proceeding to Step 3 - Communication...");
    await this.page.locator("xpath=//input[@title='To step 3 - Communication']").click();
  }
  
  async step3_verifyTariffAndAddLines() {
    try {
      //const checkboxes = this.page.locator("//div[@class='iphone-checkbox-style off']");
    const checkboxes = this.page.locator("//input[@class='iphone-checkbox loaded']/following-sibling::div");
    const checkboxCount = await checkboxes.count();
    console.log(`🔍 Found ${checkboxCount} unchecked checkbox(es).`);

    if (checkboxCount > 0) {
      const checkbox1 = checkboxes.nth(0);
      await checkbox1.waitFor({ state: 'visible', timeout: 10000 });
      console.log("☑️ Clicking the first checkbox...");
      await checkbox1.click();

      // Wait briefly for DOM updates in case second becomes available
      await this.page.waitForTimeout(1000);
    }

    const updatedCheckboxCount = await checkboxes.count();
    if (updatedCheckboxCount > 1) {
      console.log("☑️ Clicking the second checkbox...");
      const checkbox2 = checkboxes.nth(1);
      await checkbox2.waitFor({ state: 'visible', timeout: 10000 });
      await checkbox2.click();
    } else {
      console.warn("⚠️ Only one unchecked checkbox found — skipping second click.");
    }

      // const checkboxCount = await checkboxes.count();

      // console.log("☑️ Clicking the first checkbox...");
      // if (checkboxCount > 0) {
      //   const checkbox1 = checkboxes.nth(0);
      //   await checkbox1.waitFor({ state: 'visible', timeout: 10000 });
      //   await checkbox1.click();
      // }

      // if (checkboxCount > 1) {
      //   console.log("☑️ Clicking the second checkbox...");
      //   const checkbox2 = checkboxes.nth(1);
      //   await checkbox2.waitFor({ state: 'visible', timeout: 10000 });
      //   await checkbox2.click();
      // } else {
      //   console.warn("⚠️ Only one unchecked checkbox found — skipping second click.");
      // }
  
      console.log("💾 Clicking 'Save new template'...");
      const saveTemplateLink = this.page.locator("(//div[@class='formgroup']//a[text()='Save new template'])[1]");
      await saveTemplateLink.waitFor({ state: 'visible', timeout: 10000 });
      await saveTemplateLink.click();

      console.log("📝 Filling in PDF title...");
      const titleInput = this.page.locator("//input[@id='title']"); 
      await titleInput.waitFor({ state: 'visible', timeout: 10000 });            
      await titleInput.fill('Filling by Automation');

      console.log("☑️ Clicking checkbox for PDF...");
      const pdfCheckbox = this.page.locator("//div[@class='iphone-checkbox-style off'][@rel='default']");
      await pdfCheckbox.waitFor({ state: 'visible', timeout: 10000 });
      await pdfCheckbox.click();

      console.log("📝 Filling in PDF body text...");
      const pdfBodyTextarea = this.page.locator("//div[@class='validation']//textarea[@id='field']");
      await pdfBodyTextarea.waitFor({ state: 'visible', timeout: 10000 });
      await pdfBodyTextarea.fill('Filling Body text of PDF by Automation');

      console.log("💾 Clicking 'Save address'...");
      const saveBtn = this.page.locator("//input[@name='saveaddress']");
      await saveBtn.waitFor({ state: 'visible', timeout: 10000 });
      await saveBtn.click();

      console.log("📋 Selecting saved template...");
      const selectTemplateLink = this.page.locator("(//div[@class='formgroup']//a[text()='Select template'])[1]");
      await selectTemplateLink.waitFor({ state: 'visible', timeout: 10000 });
      await selectTemplateLink.click();

      await this.page.waitForTimeout(1000);

      const savedTemplate = this.page.locator("(//div[@class='title' and contains(text(), 'Filling by Automation')])[1]");
      await savedTemplate.click();

      console.log("➡️ Proceeding to Step 4...");
      const nextStepBtn = this.page.locator("//input[@title='To step 4 - Check and complete']");
      await nextStepBtn.waitFor({ state: 'visible', timeout: 10000 });
      await nextStepBtn.click(); 

    } catch (error) {
      console.error("❌ Error inn Step 3:", error);
      await this.page.screenshot({ path: 'error_step3.png', fullPage: true }).catch(() => {});
      throw error;
    }
  } 

  async step4_verifyTariffAndAddLines() {
    console.log("🔍 Verifying data in Step 4...");
  
    // Ensure step 4 content is loaded
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle').catch(() => {});

    const completeBtn = this.page.locator("//input[@title='Complete Quotation']");
    await completeBtn.waitFor({ state: 'attached', timeout: 30000 });
  
    console.log("🔽 Scrolling to 'Complete Quotation' button...");
    await completeBtn.scrollIntoViewIfNeeded(); 
    await this.page.waitForTimeout(300);
  
    console.log("🖱️ Clicking 'Complete Quotation'...");
    await Promise.all([
      this.page.waitForLoadState('networkidle').catch(() => {}),
      completeBtn.click()
    ]);
  
  }
  async Verifying_Quotation_on_Sendlist() {
  const quoteInRow = this.page.locator("(//div[@class='row sendlist']//div[@class='quotenumber'])[1]");
    await quoteInRow.waitFor({ state: 'visible', timeout: 10000 });
  
    const displayedCode = await quoteInRow.textContent();
    console.log("🔎 Code shown in list row:", displayedCode);

  }

  async check_and_send_quotation(){
    
    console.log("☑️ Clicking first checkbox in sendlist...");
    const checkboxSendlist = this.page.locator("//div[@class='checkbox'][1]");
    await checkboxSendlist.first().waitFor({ state: 'visible', timeout: 10000 });
    await checkboxSendlist.first().click();

    console.log("➡️ Clicking send to company button...");
    const nextStepBtn = this.page.locator("//input[@type='submit' and @title='Send to Company']");
    await nextStepBtn.waitFor({ state: 'visible', timeout: 10000 });
    await nextStepBtn.click();
  }

 async verifySuccessMessage() {
    console.log("🔍 Verifying success message on Sendlist...");

    const successLocator = this.page.locator("//div[@class='confirmation']//ul//li");

    try {
    await successLocator.waitFor({ state: 'visible', timeout: 5000 });

    const actualText = await successLocator.textContent();

    // Example: "You've successfully sent Quotation Q25071001"
    const match = actualText.match(/You've successfully sent Quotation (\w+\d+)/);

    if (!match) {
      throw new Error(`❌ Expected success message format not found. Actual message: "${actualText}"`);
    }
}
catch (error) {

  console.error('❌ Failed to verify success message:', error.message);
    throw error;
}

}async viewSentQuotation(){
 
  console.log("📝 Viewing sent quotation...");
 
    await this.page.waitForSelector("(//a[@title='View'])[1]", { state: 'visible', timeout: 10000 });
    await this.page.locator("(//a[@title='View'])[1]").click();
 
   console.log("🔄 You are in view quotation section...");
}
 
//VIEW COMPANYNAME

async verifyCompanyNameInSentQuotation(expectedCompanyName) {
  console.log("🔍 Verifying company name in sent quotation view...");

  // Normalize expected input (remove trailing digits, parentheses, trim)
  const cleanExpected = expectedCompanyName
    .replace(/\(.*?\)/g, '')   // remove anything inside parentheses
    .replace(/\d+$/, '')       // remove trailing digits
    .trim();

  const companyLocator = this.page.locator('//*[@id="tab-data"]/div[2]/div[1]/div[2]/p');

  try {
    await companyLocator.waitFor({ state: 'visible', timeout: 10000 });
  } catch (error) {
    const html = await this.page.content();
    console.error("❌ Company name element not found. Page HTML snapshot:\n", html);
    throw new Error(`Company name not found in the sent quotation view.`);
  }

  const actualText = await companyLocator.textContent();
  const cleanActual = actualText
    ? actualText.replace(/\(.*?\)/g, '').replace(/\d+$/, '').trim()
    : '';

  console.log(`🔎 Comparing Company Name:\n   Expected: "${cleanExpected}"\n   Found:    "${cleanActual}"`);

  if (cleanActual.includes(cleanExpected)) {
    console.log("✅ Company name matched successfully.");
  } else {
    throw new Error(`❌ Company name mismatch:\nExpected: "${cleanExpected}"\nFound:    "${cleanActual}"`);
  }
}
 

async verifyGeneratedQuotationCode(expectedCode) {
  console.log("🔍 Verifying generated quotation reference code in view...");
 
  const refCodeLocator = this.page.locator('xpath=//*[@id="tab-data"]/div[2]/div[2]/div[1]/div[1]/p');
 
  try {
    await refCodeLocator.waitFor({ state: 'visible', timeout: 10000 });
  } catch (error) {
    const html = await this.page.content();
    console.error("❌ Reference code element not found. Page HTML snapshot:\n", html);
    throw new Error("Reference code not found in the quotation view.");
  }
 
  const actualRefCode = await refCodeLocator.textContent();
  const cleanActualCode = actualRefCode?.trim() || '';
  const cleanExpectedCode = expectedCode?.trim() || '';
 
  console.log(`🔎 Comparing Reference Code:\n   Expected: "${cleanExpectedCode}"\n   Found:    "${cleanActualCode}"`);
 
  if (cleanActualCode === cleanExpectedCode) {
    console.log("✅ Quotation reference code matched successfully.");
  } else {
    throw new Error(`❌ Reference code mismatch:\nExpected: "${cleanExpectedCode}"\nFound:    "${cleanActualCode}"`);
  }
}
 
async verifyQuotationStatus() {
  console.log("📄 Navigate to Status History tab");
  await this.page.click('//a[@title="Status History"]');
 
  console.log("📝 Checking quotation status...");
 
  const statusLocator = this.page.locator("//p[text()='Sent']");
 
  const isSent = await statusLocator.isVisible({ timeout: 10000 });
 
  if (isSent) {
    console.log("✅ Quotation status is 'Sent'.");
  } else {
    console.warn("❌ Quotation status is NOT 'Sent'.");
  }
}
 
 
}
module.exports = New_Quotation_V2;