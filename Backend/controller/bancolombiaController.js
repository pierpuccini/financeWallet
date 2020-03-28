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
    defaultViewport: null,
    slowMo: 10
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36"
  );

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
        if (
          $(element)
            .text()
            .trim() == passwordArr[success]
        ) {
          cheerioEl = $(element);
          return false;
        }
      });

      if (cheerioEl != 0) {
        const divId = $(cheerioEl)
          .find("div")
          .attr("id");
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

    await frameContent.waitForSelector("#numACCaccount");

    console.log("Succesfully logged in!");

    const content = await frameContent.content();
    fs.writeFile(`temp/bcol/in/content-page.html`, content, "utf8", err => {
      if (err) throw err;
    });

    /* ----------------------------------- getting accounts ----------------------------------- */

    await frameContent.waitForSelector("#accaccount0");
    $ = cheerio.load(content);
    let IdAccount = $("#accaccount0").attr("id");
    let siblingAccounts = $("#accaccount0").siblings().length;
    let accountIds = [];

    if (siblingAccounts > 0) {
      let IdAccountDiv = IdAccount.split("");
      for (let i = 0; i <= siblingAccounts; i++) {
        let divAccId = IdAccountDiv;
        divAccId[10] = i;
        accountIds.push(divAccId.join(""));
      }
    } else {
      accountIds.push(IdAccount);
    }

    /* ----------------------------------- getting accounts' info ----------------------------------- */

    const basicInfo = id => {
      console.log("[ --- parsing report --- ]");
      const d = fs.readFileSync(
        path.resolve(`temp/bcol/in/content-page.html`),
        "utf8",
        err => {
          if (err) throw err;
        }
      );

      /* TODO: migrate to cheerio */
      let root = HTMLParser.parse(d);
      for (i = 0; i < accountIds.length; i++) {
        root = root.querySelectorAll(
          `#${accountIds[i]}` //accaccount0,accaccount1...
        );
        let servicesInfo = [];
        root.forEach(services => {
          typeAcc = services.querySelectorAll("div")[0].text;
          accNum = services.querySelectorAll("span")[0].text;
          name = typeAcc + " " + accNum;
          let account = {};
          account = {
            available: services.querySelectorAll("div")[2].text
          };
          servicesInfo = [...servicesInfo, { name, account }];
        });

        return servicesInfo;
      }
    };

    console.log("   Getting basic info ...");
    const overview = basicInfo(id);
    info.overview = overview;
    fs.writeFile(
      `temp/bcol/overview/overview#-#${id}.txt`,
      JSON.stringify(overview),
      "utf8",
      err => {
        if (err) throw err;
        console.log(`overview#-#${id} been saved!`);
      }
    );

    /* ----------------------------------- getting credit cards ----------------------------------- */

    await frameContent.waitForSelector("#date_cards_option");
    console.log("click encontrado");
    const [response] = await Promise.all([
      frameContent.waitForNavigation({ waitUntil: "domcontentloaded" }), // The navigation promise resolves after navigation has finished
      frameContent.click("#date_cards_option") // Clicking the link will indirectly cause a navigation
    ]);
    console.log("click dado");
    await frameContent.waitForSelector("#carcards0");

    const contentcc = await frameContent.content();
    fs.writeFile(`temp/bcol/in/contentcc.html`, contentcc, "utf8", err => {
      if (err) throw err;
    });

    /* ----------------------------------- loging out and closing browser ----------------------------------- */
    console.log("                              ");
    console.log("\x1b[33m", "[ --- Closing --- ]");
    console.log("                              ");
    await frameContent.click("#link_LogOut_SVP1");
    console.log("Opened logout modal");
    await frameContent.waitForSelector("#confirmationLogout");
    await frameContent.waitForSelector(".btn_Succed_Popup");
    /* TODO: cerrar sesion bancolombia */
    //await frameContent.click('.btn_Succed_Popup')
    await browser.close();
    console.log("Browser closed");
    res.send("success");
  } catch (error) {
    ///
  }
};
module.exports = { getReports };
