const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");
const credentials = require("../../credentials.json");
const cheerio = require("cheerio");
var HTMLParser = require("node-html-parser");

const getReports = async (req, res) => {
  const { id, password, url } = credentials.bcol;
  console.log("\x1b[0m", "[started BANCOLOMBIA]");
  /* NOTE: Headless FALSE shows progress in real time */
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null
  });
  const page = await browser.newPage();
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
    console.log("-- Entering username", id);
    await page.waitForSelector("#username");
    await page.type("#username", id, { delay: 100 });

    console.log("\x1b[0m", "Submited username");
    await page.click("#btnGo");

    /* ----------------------------------- Filling out user password with keypad ----------------------------------- */
    await page.waitForSelector("#_KEYBRD");
    let pageContent = await page.content();
    fs.writeFile(`temp/bcol/page.html`, pageContent, "utf8", err => {
      if (err) throw err;
    });
    console.log("Password page loaded");

    let success = 0,
      cheerioEl;
    let passwordArr = password.toString().split("");

    while (success < passwordArr.length) {
      $ = cheerio.load(pageContent);

      $("#_KEYBRD > tbody > tr > td").each((i, element) => {
        if ($(element).text().trim() == passwordArr[success]) {
          cheerioEl = $(element);
          return false;
        }
      });

      if (cheerioEl != 0) {
        const divId = $(cheerioEl).find("div").attr("id");
        const [targetElement] = await page.$x(`//div[@id='${divId}']/..`);
        console.log("object", targetElement);
        await targetElement.click();
        success += 1;
      }
    }
    console.log("Typed password!");
    await page.click("#btnGo");
    console.log("Submited password!");

  } catch (error) {
    ///
  }
};

module.exports = { getReports };
