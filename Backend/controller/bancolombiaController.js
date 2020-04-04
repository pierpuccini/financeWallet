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
    slowMo: 10,
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36"
  );

  let data = [];
  let $;
  let info = {
    overview: {},
    movements: [],
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

    await frameContent.waitForSelector("#numACCaccount");

    console.log("Succesfully logged in!");

    await frameContent.waitForSelector("#accaccount0");
    await frameContent.waitForSelector("#date_cards_option");
    await frameContent.$eval("#date_cards_option", (element) =>
      element.click()
    ); // Clicking the link will indirectly cause a navigation
    console.log("Clicked on card options");
    await frameContent.waitForSelector("#carcards0");
    console.log("waited for cards to load");
    const content = await frameContent.content();

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
      (err) => {
        if (err) throw err;
        console.log(`overview#-#${id} been saved!`);
      }
    );
    /*-------------------------------------getting accounts' movements------------------------------------*/

    await frameContent.waitForSelector(
      "#menuContainer > div.navbar.navbar-blue > div > ul > li:nth-child(2)"
    );
    console.log("waitForSelector menu");
    await frameContent.hover(
      "#menuContainer > div.navbar.navbar-blue > div > ul > li:nth-child(2)"
    );
    await frameContent.click(
      "#menuContainer > div.navbar.navbar-blue > div > ul > li:nth-child(2)"
    );
    console.log("Selecting accounts");
    await frameContent.waitForSelector("#link_prod_cuenta");
    await frameContent.click("#link_prod_cuenta");
    await frameContent.waitForSelector(
      "#gridProductID_savings tbody tr:nth-child(2)"
    );
    await frameContent.click("#gridProductID_savings tbody tr:nth-child(2)");
    console.log("Account selected");
    await frameContent.waitForSelector(
      "#detail-grid_savings > #contenedor #accountId"
    );
    const inputDropdownValues = await frameContent.content();
    // fs.writeFile(
    //   __dirname + `/../temp/bcol/in/content-frame-page.html`,
    //   overviewAndMovements,
    //   "utf8",
    //   err => {
    //     if (err) throw err;
    //   }
    // );
    $ = cheerio.load(inputDropdownValues);
    let selectOptions = [];
    $("#accountId")
      .find("option")
      .each((i, op) => {
        let parsedOption = {
          value: $(op).attr("value"),
          selected: $(op).attr("selected"),
        };
        selectOptions.push(parsedOption);
      });

    console.log("dropdown options loaded");

    const movementsContent = await frameContent.content();
    console.log("movements loaded");

    //-----------------------------------loading table-------------------------------------------------------------

    let a = cheerio.load(movementsContent);
    let result = a("#gridDetail_savings tr")
      .map((i, element) => ({
        date: a(element).find("td:nth-of-type(1)").text().trim(),
        amount: a(element).find("td:nth-of-type(5)").text().trim(),
        reference: a(element).find("td:nth-of-type(4)").text().trim(),
        description: a(element).find("td:nth-of-type(3)").text().trim(),
      }))
      .get();
    e = result.shift();
    info.movements.push(result);

    fs.writeFileSync(
      `temp/bcol/movements/movementsData0#-#${id}.txt`,
      JSON.stringify(result),
      "utf8",
      (err) => {
        if (err) throw err;
        console.log(`---- movementsTable0#-#${id} has been saved!`);
      }
    );

    await frameContent.waitForSelector("#accountId");
    await frameContent.click("#accountId");
    const totalMovements = await frameContent.evaluate(() => {
      return document.querySelector("#accountId").length;
    });
    // Get the value of the first element

    //------------------------getting all movements-----------
    for (i = 2; i <= totalMovements; i++) {
      const name = await frameContent.evaluate(() => {
        return document.querySelector(
          `#accountId > option:nth-child(${[i + 1]})`
        ).innerHTML;
      });
      console.log(name);
      const value = await frameContent.evaluate(() => {
        return document.querySelector(
          `#accountId > option:nth-child(${[i + 1]})`
        ).value;
      });
      // Use it with page.select to select the item and trigger the change event

      await frameContent.select("#accountId", value);
      await frameContent.waitForSelector("#gridProductID_creditCardDetails");
      await frameContent.$eval("#gridProductID_creditCardDetails", (element) =>
        element.click()
      ); // Clicking the link will indirectly cause a navigation

      const totalmovementsContent = await frameContent.content();
      let a = cheerio.load(totalmovementsContent);
      if (name.includes("Cuenta")) {
        let results = a("#gridDetail_savings tr")
          .map((i, element) => ({
            date: a(element).find("td:nth-of-type(1)").text().trim(),
            amount: a(element).find("td:nth-of-type(5)").text().trim(),
            reference: a(element).find("td:nth-of-type(4)").text().trim(),
            description: a(element).find("td:nth-of-type(3)").text().trim(),
          }))
          .get();
        e = results.shift();
        info.movements.push(results);
        fs.writeFileSync(
          `temp/bcol/movements/movementsData${i - 1}#-#${id}.txt`,
          JSON.stringify(results),
          "utf8",
          (err) => {
            if (err) throw err;
            console.log(`---- movementsTable${i - 1}#-#${id} has been saved!`);
          }
        );
      } else {
        let results = a("#gridProductID_creditCardDetails tr")
          .map((i, element) => ({
            date: a(element).find("td:nth-of-type(1)").text().trim(),
            amount: a(element).find("td:nth-of-type(6)").text().trim(),
            currency: a(element).find("td:nth-of-type(5)").text().trim(),
            description: a(element).find("td:nth-of-type(2)").text().trim(),
            payments: a(element).find("td:nth-of-type(3)").text().trim(),
          }))
          .get();
        e = results.shift();
        info.movements.push(results);
        fs.writeFileSync(
          `temp/bcol/movements/movementsData${i - 1}#-#${id}.txt`,
          JSON.stringify(results),
          "utf8",
          (err) => {
            if (err) throw err;
            console.log(`---- movementsTable${i - 1}#-#${id} has been saved!`);
          }
        );
      }
    }

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
    // await browser.close();
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
    accounts.forEach((account) => {
      mappedAccounts.push({
        type: $(`#${account} .panel_query_account_balances_left`).text(),
        number: $(`#${account} .panel_query_account_balances_center p`)
          .children()
          .first()
          .text(),
        total: $(`#${account} .panel_query_account_balances_right`).text(),
      });
    });
  } else if (accounts.length === 1) {
    mappedAccounts.push({
      type: $("#accaccount0 .panel_query_account_balances_left").text(),
      number: $("#accaccount0 .panel_query_account_balances_center p")
        .children()
        .first()
        .text(),
      total: $("#accaccount0 .panel_query_account_balances_right").text(),
    });
  }

  if (cards.length > 1) {
    cards.forEach((card) => {
      mappedCards.push({
        cardType: $(`#${card} .panel_query_account_balances_left`).text(),
        number: $(`#${card} .panel_query_account_balances_center p`)
          .children()
          .first()
          .text(),
        amountDueCop: $(`#${card} .panel_query_account_balances_right p br`)[0]
          .previousSibling.nodeValue,
        amountDueUsd: $(`#${card} .panel_query_account_balances_right p br`)[0]
          .nextSibling.nodeValue,
      });
    });
  } else if (cards.length === 1) {
    mappedCards.push({
      cardType: $("#carcards0 .panel_query_account_balances_left").text(),
      number: $("#carcards0 .panel_query_account_balances_center p")
        .children()
        .first()
        .text(),
      amountDueCop: $("#carcards0 .panel_query_account_balances_right p br")[0]
        .previousSibling.nodeValue,
      amountDueUsd: $("#carcards0 .panel_query_account_balances_right p br")[0]
        .nextSibling.nodeValue,
    });
  }
  return { accounts: mappedAccounts, cards: mappedCards };
};

module.exports = { getReports };
