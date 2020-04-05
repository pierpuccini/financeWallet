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
    slowMo: 50,
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36"
  );

  let $;
  let info = [];

  try {
    /* ----------------------------------- getting page ----------------------------------- */
    await page.goto(url, { waitUntil: "networkidle0" });
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

    await frameContent.content();

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
    await frameContent.$eval("#link_prod_cuenta", (element) => element.click()); // Clicking the link will indirectly cause a navigation
    // await frameContent.waitForSelector("#link_prod_cuenta");
    // await frameContent.click("#link_prod_cuenta");
    await frameContent.waitForSelector(
      "#gridProductID_savings tbody tr:nth-child(2)"
    );
    await frameContent.click("#gridProductID_savings tbody tr:nth-child(2)");
    console.log("Account selected");
    await frameContent.waitForSelector(
      "#detail-grid_savings > #contenedor #accountId",
      {
        visible: true,
      }
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
          name: $(op).text(),
        };
        selectOptions.push(parsedOption);
      });
    console.log("dropdown options loaded");
    for (i = 0; i < selectOptions.length; i++) {
      console.log("selecting item");
      await frameContent.select("#accountId", selectOptions[i].value);

      if (selectOptions[i].name.includes("Tarjeta de")) {
        await frameContent.waitForSelector("#ecard");
      } else {
        await frameContent.waitForSelector("#popoverSalT");
      }

      const selectFrame = await frameContent.content();
      // fs.writeFile(
      //   __dirname + `/../temp/bcol/in/content-frame-page.html`,
      //   selectFrame,
      //   "utf8",
      //   (err) => {
      //     if (err) throw err;
      //   }
      // );
      console.log("frame content loaded");

      console.log("Building overview...", selectOptions[i].name);
      let overview = basicInfo(selectFrame, selectOptions[i].name);

      console.log("Building movements...", selectOptions[i].name);
      let movements = movementInfo(selectFrame, selectOptions[i].name);
      overview.movements = movements;
      info.push(overview);
    }
    fs.writeFile(
      __dirname + `/../temp/bcol/overview/info#-#${id}.txt`,
      JSON.stringify(info),
      "utf8",
      (err) => {
        if (err) throw err;
        console.log(`overview#-#${id} been saved!`);
      }
    );

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

const basicInfo = (html, type) => {
  $ = cheerio.load(html);

  if (type.includes("Cuenta de Ahorro")) {
    return {
      name: type,
      account: {
        available: $(".pg_pgd_frm_ctnt dl #popoverSalD").parent().next().text(),
        savings: $(".pg_pgd_frm_ctnt dl #popoverSalCaBol")
          .parent()
          .next()
          .text(),
        total: $(".pg_pgd_frm_ctnt dl #popoverSalT").parent().next().text(),
      },
    };
  } else if (type.includes("Tarjeta de")) {
    const columnOne = $(".dl-horizontal.dl_horizontal_desc").get(0).children;
    const [
      dateDue,
      minimumPaymentCOP,
      totalPaymentCOP,
      debtCOP,
      advanceAvailable,
      available,
    ] = columnOne.filter((child) => child.name === "dd");

    const columnTwo = $(".dl-horizontal.dl_horizontal_desc").get(1).children;
    const [
      cardType,
      minimumPaymentUSD,
      totalPaymentUSD,
      debtUSD,
      _,
      exchangeRate,
    ] = columnTwo.filter((child) => child.name === "dd");
    return {
      name: type,
      exchangeRate: {
        indicator: "COP/USD",
        rate: exchangeRate.children[0].data,
      },
      account: {
        available: available.children[0].data,
        minimumPayment: {
          ammount: {
            cop: minimumPaymentCOP.children[0].data,
            usd: minimumPaymentUSD.children[0].data,
          },
          dateDue: dateDue.children[0].data,
        },
        debt: {
          cop: debtCOP.children[0].data,
          usd: debtUSD.children[0].data,
        },
        totalPayment: {
          cop: totalPaymentCOP.children[0].data,
          usd: totalPaymentUSD.children[0].data,
        },
      },
    };
  }
};

const movementInfo = (html, type) => {
  let $ = cheerio.load(html);

  let result = [];
  if (type.includes("Cuenta")) {
    result = $("#gridDetail_savings tr")
      .map((i, element) => ({
        date: $(element).find("td:nth-of-type(1)").text().trim(),
        amount: $(element).find("td:nth-of-type(5)").text().trim(),
        id: $(element).find("td:nth-of-type(4)").text().trim(),
        description: $(element).find("td:nth-of-type(3)").text().trim(),
      }))
      .get();
  } else if (type.includes("Tarjeta")) {
    result = $("#gridProductID_creditCardDetails tbody tr")
      .map((i, element) => ({
        date: $(element).find("td:nth-of-type(1)").text().trim(),
        amount: {
          value: $(element).find("td:nth-of-type(6)").text().trim(),
          currency: $(element).find("td:nth-of-type(5)").text().trim(),
        },
        description: $(element).find("td:nth-of-type(2)").text().trim(),
      }))
      .get();
  }

  return result;
};

module.exports = { getReports };
