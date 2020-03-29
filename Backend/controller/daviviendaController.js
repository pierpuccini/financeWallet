const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");
const credentials = require("../../credentials.json");
const cheerio = require("cheerio");
var HTMLParser = require("node-html-parser");

const getReports = async (req, res) => {
  const { id, password, url } = credentials.davi;
  console.log("\x1b[0m", "[started DAVI]");
  /* NOTE: Headless FALSE shows progress in real time */
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let data = [];
  let info = {
    overview: {},
    movements: []
  };

  // await page.setRequestInterception(true);

  // page.on("request", req => {
  //   if (
  //     req.resourceType() == "stylesheet" ||
  //     req.resourceType() == "font" ||
  //     req.resourceType() == "image"
  //   ) {
  //     req.abort();
  //   } else {
  //     req.continue();
  //   }
  // });

  try {
    /* ----------------------------------- getting page ----------------------------------- */
    await page.goto(url);

    /* ----------------------------------- clicking Login ----------------------------------- */
    await page.click("#personas-ingresar");

    /* ----------------------------------- waiting for iframe ----------------------------------- */
    console.log("waiting for iframe ...");
    await page.waitForSelector("div#divIFrame iframe");
    const elementHandle = await page.$("div#divIFrame iframe");

    /* ----------------------------------- iFrame Loaded ----------------------------------- */
    console.log("         ---         ");
    console.log("*** iFrame Loaded ***");
    console.log("         ---         ");
    const frameContent = await elementHandle.contentFrame();
    if ((await page.$("#closeButton")) !== null) {
      console.log("[! closing pop up !]");
      await page.click("#closeButton");
    }

    /* ----------------------------------- Filling Document # ----------------------------------- */
    console.log("-- Filling Document number & focusing on input");
    await frameContent.waitForSelector("#formAutenticar\\:numeroDocumento", {
      timeout: 120000
    });
    await frameContent.focus("#formAutenticar\\:numeroDocumento");

    /* ----------------------------------- Filling out input ----------------------------------- */
    console.log(" -- Filling out input");
    await frameContent.$eval(
      "#formAutenticar\\:numeroDocumento",
      (el, value) => (el.value = value),
      id
    );

    /* ----------------------------------- continue to password ----------------------------------- */
    console.log("  -- Wait for password");
    await frameContent.waitForSelector('#formAutenticar\\:btnSubmitCont');
    console.log("  -- Continue to password");
    await frameContent.click("#formAutenticar\\:btnSubmitCont");
    if ((await page.$("#closeButton")) !== null) {
      console.log("[! closing pop up !]");
      await page.click("#closeButton");
    }

    /* ----------------------------------- PASSWORD INPUT ----------------------------------- */
    console.log("   -- PASSWORD INPUT");
    await frameContent.waitForSelector("#formAutenticar\\:claveVirtual");
    await page.keyboard.type(password.toString(), { delay: 100 });
    await frameContent.$eval(
      "#formAutenticar\\:claveVirtual",
      (el, value) => (el.value = value),
      password
    );
    if ((await page.$("#closeButton")) !== null) {
      console.log("[! closing pop up !]");
      await page.click("#closeButton");
    }

    /* ----------------------------------- SUBMITING PASSWORD ----------------------------------- */
    console.log("!!! SUBMITING PASSWORD !!!");
    await frameContent.click("#formAutenticar\\:btnSubmitCont");

    if ((await page.$("#closeButton")) !== null) {
      console.log("[! closing pop up !]");
      await page.click("#closeButton");
    }

    await frameContent.waitFor(15000);
    console.log("... waited 15000 ms");

    if ((await page.$("#closeButton")) !== null) {
      console.log("[! closing pop up !]");
      await page.click("#closeButton");
    }

    /* ----------------------------------- PREVENTIVE content ----------------------------------- */
    console.log("               ---                ");
    console.log("[ PREVENTIVE content ]");
    console.log("               ---                ");

    let pageContent = await page.content();
    fs.writeFile(
      __dirname + `/../temp/davi/preventive/preventiveLoggedIn#-#${id}.html`,
      pageContent,
      "utf8",
      err => {
        if (err) throw err;
        console.log(`preventiveLoggedIn#-#${id} been saved!`);
      }
    );

    /* ----------------------------------- checking for error ----------------------------------- */
    console.log("[ --- Checking for errors ---]");
    if (!frameContent.isDetached()) {
      if ((await frameContent.$("#divMessageCodigo")) !== null) {
        console.log("[! ERROR PRESENT !]");
        data = await frameContent.evaluate(() => {
          const tds = Array.from(
            document.querySelectorAll(".tablaMessage tbody tr td")
          );
          return tds.map(td => td.textContent);
        });
        content = await frameContent.content();
        await browser.close();
        console.log("[Sending error to postman or api caller]");
        if (data.length > 0) {
          throw { code: "already-logged-in", message: data[1] };
        }
      }
    }

    /* ----------------------------------- taking screenshot and grabing content ----------------------------------- */
    console.log('Waiting for ".type-one" ...');
    await page.waitForSelector(".type-one");
    pageContent = await page.content();

    console.log(" --- Writing html file --- ");
    fs.writeFileSync(
      __dirname + `/../temp/davi/in/in#-#${id}.html`,
      pageContent,
      "utf8",
      err => {
        if (err) throw err;
        console.log(`---- LoggedIn#-#${id} has been saved!`);
      }
    );

    /* ----------------------------------- grabing basic info from html file  ----------------------------------- */
    console.log("   Getting basic info ...");
    const overview = basicInfo(id);
    info.overview = overview;
    fs.writeFile(
      `temp/davi/overview/overview#-#${id}.txt`,
      JSON.stringify(overview),
      "utf8",
      err => {
        if (err) throw err;
        console.log(`overview#-#${id} been saved!`);
      }
    );

    let $ = cheerio.load(pageContent);

    let accountId = $(".type-one tbody tr td a")
      .attr("id")
      .split(":");
    let accountDivIds = [];
    let accounts = $(".type-one tbody").closest("tr").length;
    for (let i = 0; i < accounts; i++) {
      let divId = accountId;
      divId[2] = i;
      accountDivIds.push(divId.join("\\:"));
    }

    for (let i = 0; i < accountDivIds.length; i++) {
      await page.waitForSelector(`#${accountDivIds[i]}`, {
        timeout: 120000
      });
      await page.click(`#${accountDivIds[i]}`);
      /* ----------------------------------- waiting for iframe ----------------------------------- */
      console.log("Waiting for iframe ...");
      await page.waitForSelector("#dashboardform\\:dynamicIframe iframe", {
        timeout: 120000
      });
      const elementHandleDetails = await page.$(
        "#dashboardform\\:dynamicIframe iframe"
      );

      /* ----------------------------------- iFrame Loaded ----------------------------------- */
      console.log("[*** iFrame Loaded ***]");
      const frameContentDetails = await elementHandleDetails.contentFrame();
      await frameContentDetails.waitForXPath("//a[contains(., 'Últimos')]", {
        timeout: 120000
      });
      console.log("\x1b[33m", "*** Last movements loaded ***");
      let movements = await frameContentDetails.$x(
        "//a[contains(., 'Últimos')]"
      );

      if (movements.length > 0) {
        await movements[0].click();
        await frameContentDetails.waitFor(15000);
        let movementsTable = await frameContentDetails.$eval(
          "center form",
          element => element.innerHTML
        );
        let $ = cheerio.load(movementsTable);
        const result = $("tr")
          .map((i, element) => ({
            date: $(element)
              .find("td:nth-of-type(1)")
              .text()
              .trim(),
            amount: $(element)
              .find("td:nth-of-type(2)")
              .text()
              .trim(),
            id: $(element)
              .find("td:nth-of-type(3)")
              .text()
              .trim(),
            description: $(element)
              .find("td:nth-of-type(4)")
              .text()
              .trim()
          }))
          .get();
        info.movements.push(result);
        fs.writeFileSync(
          `temp/davi/movements/movementsData${i}#-#${id}.txt`,
          JSON.stringify(result),
          "utf8",
          err => {
            if (err) throw err;
            console.log(`---- movementsTable${i}#-#${id} has been saved!`);
          }
        );
      } else {
        throw new Error("Link not found");
      }

      console.log("*** Succesfully retrevived past movements ***");
      await page.click("#dashboardform\\:goToResumen");
    }

    /* ----------------------------------- loging out and closing browser ----------------------------------- */
    console.log("                              ");
    console.log("\x1b[33m", "[ --- Closing --- ]");
    console.log("                              ");
    await page.click("#dashboardform\\:cerrarSesion");
    await page.screenshot({ path: `temp/davi/LoggedScreenshot#-#${id}.png` });
    console.log("\x1b[0m");
    console.log("\x1b[32m", "[-- session closed! --]");
    console.log("[Sending data to postman or api caller]");
    res.send(info);
    await browser.close();
    console.log("\x1b[32m", "[-- end succesfully--]");
    console.log("\x1b[0m");
  } catch (error) {
    console.log("\x1b[31m", "!!! error in catch !!!", error);
    /* ----------------------------------- loging out and closing browser ----------------------------------- */
    console.log("data in catch", data.length);
    if (data.length === 0 || error.code !== "already-logged-in") {
      await page.click("#dashboardform\\:cerrarSesion");
      await page.waitForSelector("#personas-ingresar");
      await browser.close();
    } else {
      await browser.close();
    }

    console.log("[Sending error to postman or api caller]");
    if (data.length > 0) {
      res.send({ code: "already-logged-in", message: data[1] });
    } else {
      res.send({ code: "server error", message: error });
    }

    console.log("\x1b[31m", "[-- end with error --]");
    console.log("\x1b[0m");
  }
};

const basicInfo = id => {
  console.log("[ --- parsing report --- ]");
  const d = fs.readFileSync(
    path.resolve(`temp/davi/in/in#-#${id}.html`),
    "utf8",
    err => {
      if (err) throw err;
    }
  );

  /* TODO: migrate to cheerio */
  let root = HTMLParser.parse(d);
  root = root.querySelectorAll(
    "#dashboardform:pagepanel .content-resumen table tbody tr"
  );

  let servicesInfo = [];
  root.forEach(services => {
    name = services.querySelectorAll("td table tbody tr td")[0].innerHTML;
    let account = {};
    if (name.includes("Cuenta")) {
      account = {
        available: services.querySelectorAll("td table tbody tr td")[1]
          .innerHTML,
        savings: services.querySelectorAll("td table tbody tr td")[3].innerHTML,
        total: services.querySelectorAll("td table tbody tr td")[5].innerHTML
      };
    } else {
      account = {
        available: services.querySelectorAll("td table tbody tr td")[1]
          .innerHTML,
        minimumPayment: {
          ammount: services.querySelectorAll("td table tbody tr td")[2]
            .innerHTML,
          dateDue: services.querySelectorAll("td table tbody tr td")[3]
            .innerHTML
        },
        debt: services.querySelectorAll("td table tbody tr td")[4].innerHTML,
        totalPayment: services.querySelectorAll("td table tbody tr td")[5]
          .innerHTML
      };
    }
    servicesInfo = [...servicesInfo, { name, account }];
  });

  return servicesInfo;
};

const test = (req, res) => {
  const pageContent = fs.readFileSync(
    path.resolve("temp/davi/movements/movementsTable.html"),
    "utf8",
    err => {
      if (err) throw err;
    }
  );
  let $ = cheerio.load(pageContent);
  const result = $("tr")
    .map((i, element) => ({
      date: $(element)
        .find("td:nth-of-type(1)")
        .text()
        .trim(),
      amount: $(element)
        .find("td:nth-of-type(2)")
        .text()
        .trim(),
      id: $(element)
        .find("td:nth-of-type(3)")
        .text()
        .trim(),
      description: $(element)
        .find("td:nth-of-type(4)")
        .text()
        .trim()
    }))
    .get();
  console.log(JSON.stringify(result));
  res.send(result);
};

module.exports = { getReports, test };
