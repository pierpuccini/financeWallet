const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");
const credentials = require("../../credentials.json");
const cheerio = require("cheerio");

const getReports = async (req, res) => {
  const { id, password, url } = credentials.bcol;
  console.log("\x1b[0m", "[started BANCOLOMBIA]");
  /* NOTE: Headless FALSE shows progress in real time */
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    slowMo: 10
  });
  const page = await browser.newPage();
  await page.setUserAgent('5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');

  let data = [];
  let $;
  let info = {
    overview: {},
    movements: []
  };

  try {
    /* ----------------------------------- getting page ----------------------------------- */
    await page.goto(url);

    /* ----------------------------------- Entering user name and submiting ----------------------------------- */
    console.log("-- Entering username");
    await page.waitForSelector("#username");
    await page.type("#username", id, { delay: 100 });

    console.log("\x1b[0m", "Submited username");
    await page.click("#btnGo");

    /* ----------------------------------- Filling out user password with keypad ----------------------------------- */
    await page.waitForSelector("#_KEYBRD");
    console.log("Password page loaded");

    let logginContent = await page.content();

    let success = 0,
      cheerioEl;
    let passwordArr = password.toString().split("");

    while (success < passwordArr.length) {
      $ = cheerio.load(logginContent);

      $("#_KEYBRD > tbody > tr > td").each((i, element) => {
        if ($(element).text().trim() == passwordArr[success]) {
          cheerioEl = $(element);
          return false;
        }
      });

      if (cheerioEl != 0) {
        const divId = $(cheerioEl).find("div").attr("id");
        const [targetElement] = await page.$x(`//div[@id='${divId}']/..`);
        await targetElement.click();
        success += 1;
      }
    }
    console.log("Typed password!");
    await page.click("#btnGo");
    console.log("Submited password!");

    await page.waitForSelector("#ifrm");
    const elementHandle = await page.$("#ifrm");
    /* ----------------------------------- iFrame Loaded ----------------------------------- */
    console.log("         ---         ");
    console.log("*** iFrame Loaded ***");
    console.log("         ---         ");
    const frameContent = await elementHandle.contentFrame();
   
    await frameContent.waitForSelector('#link_LogOut_SVP1');

    console.log("Succesfully logged in!");

    const content = await frameContent.content()
    fs.writeFile(`temp/bcol/content-page.html`, content, "utf8",
      err => {
        if (err) throw err;
      }
    ); 

    /* ----------------------------------- loging out and closing browser ----------------------------------- */
    console.log("                              ");
    console.log("\x1b[33m", "[ --- Closing --- ]");
    console.log("                              ");
    await frameContent.click('#link_LogOut_SVP1')
    console.log('Opened logout modal');
    await frameContent.waitForSelector('#confirmationLogout')
    await frameContent.waitForSelector('.btn_Succed_Popup')
    await frameContent.click('.btn_Succed_Popup')
    await browser.close();
    console.log('Browser closed');
    res.send('success');
  } catch (error) {
    ///
  }
};

module.exports = { getReports };
