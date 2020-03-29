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

    await frameContent.waitForSelector("#accaccount0");
    await frameContent.waitForSelector("#date_cards_option");
    await frameContent.$eval("#date_cards_option", element => element.click()); // Clicking the link will indirectly cause a navigation
    console.log("Clicked on card options");
    await frameContent.waitForSelector("#carcards0");
    console.log("waited for cards to load");
    const content = await frameContent.content();
    fs.writeFile(
      __dirname + `/../temp/bcol/in/content-page.html`,
      content,
      "utf8",
      err => {
        if (err) throw err;
      }
    );

    $ = cheerio.load(content);

    let accountId = $("#accaccount0").attr("id");
    let siblingAccounts = $("#accaccount0").siblings().length;
    let accountIds = [];

    let CardId = $("#carcards0").attr("id");
    let siblingCards = $("#carcards0").siblings().length;
    let CardsIds = [];

    if (siblingAccounts > 0) {
      for (let i = 0; i <= siblingAccounts; i++) {
        accountIds.push(accountId.replace(/.$/, i));
      }
    } else {
      accountIds.push(accountId);
    }

    if (siblingCards > 0) {
      for (let i = 0; i <= siblingCards; i++) {
        CardsIds.push(CardId.replace(/.$/, i));
      }
    } else {
      CardsIds.push(CardId);
    }

    /* ----------------------------------- getting accounts' info ----------------------------------- */

    console.log("Building overview...");
    info.overview = basicInfo(content, accountIds, CardsIds);
    fs.writeFile(
      __dirname + `/../temp/bcol/overview/overview#-#${id}.txt`,
      JSON.stringify(info.overview),
      "utf8",
      err => {
        if (err) throw err;
        console.log(`overview#-#${id} been saved!`);
      }
    );

    /* ----------------------------------- getting credit cards ----------------------------------- */

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
    res.send(info);
  } catch (error) {
    ///
  }
};

const basicInfo = (html, accounts, cards) => {
  $ = cheerio.load(html);
  let mappedAccounts = [],
    mappedCards = [];
  if (accounts.length > 1) {
    accounts.forEach(account => {
      mappedAccounts.push({
        type: $(`#${account} .panel_query_account_balances_left`).text(),
        number: $(`#${account} .panel_query_account_balances_center p`).children().first().text(),
        total: $(`#${account} .panel_query_account_balances_right`).text()
      });
    });
  } else if (accounts.length === 1) {
    mappedAccounts.push({
      type: $("#accaccount0 .panel_query_account_balances_left").text(),
      number: $("#accaccount0 .panel_query_account_balances_center p").children().first().text(),
      total: $("#accaccount0 .panel_query_account_balances_right").text()
    });
  }

  if (cards.length > 1) {
    cards.forEach(card => {
      mappedCards.push({
        cardType: $(`#${card} .panel_query_account_balances_left`).text(),
        number: $(`#${card} .panel_query_account_balances_center p`).children().first().text(),
        amountDueCop: $(`#${card} .panel_query_account_balances_right p br`)[0].previousSibling.nodeValue,
        amountDueUsd: $(`#${card} .panel_query_account_balances_right p br`)[0].nextSibling.nodeValue,
      });
    });
  } else if (cards.length === 1) {
    mappedCards.push({
      cardType: $("#carcards0 .panel_query_account_balances_left").text(),
      number: $("#carcards0 .panel_query_account_balances_center p").children().first().text(),
      amountDueCop: $("#carcards0 .panel_query_account_balances_right p br")[0].previousSibling.nodeValue,
      amountDueUsd: $("#carcards0 .panel_query_account_balances_right p br")[0].nextSibling.nodeValue,
    });
  } 
  return {accounts: mappedAccounts, cards: mappedCards}
};
module.exports = { getReports };
