const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");
const credentials = require("../../credentials.json");
const cheerio = require('cheerio')

const getReports = async (req, res) => {
  const { id, password } = credentials;
  console.log("[started DAVIVIENDA]");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  /* ----------------------------------- getting page ----------------------------------- */
  await page.goto("https://www.davivienda.com/wps/portal/personas/nuevo");

  /* ----------------------------------- clicking Login ----------------------------------- */
  await page.click("#personas-ingresar");

  /* ----------------------------------- waiting for iframe ----------------------------------- */
  console.log("[waiting for iframe]");
  await page.waitForSelector("div#divIFrame iframe");
  const elementHandle = await page.$("div#divIFrame iframe");

  /* ----------------------------------- iFrame Loaded ----------------------------------- */
  console.log("[*** iFrame Loaded ***]");
  const frameContent = await elementHandle.contentFrame();
  if ((await page.$("#closeButton")) !== null) {
    console.log("[! closing pop up !]");
    await page.click("#closeButton");
  }
  
  /* ----------------------------------- Filling Document # ----------------------------------- */
  console.log("[--- Filling Document number & focusing on input ---]");
  await frameContent.waitForSelector("#formAutenticar\\:numeroDocumento", {timeout: 120000});
  await frameContent.focus("#formAutenticar\\:numeroDocumento");

  /* ----------------------------------- Filling out input ----------------------------------- */
  console.log("[ - filling out input - ]");
  await frameContent.$eval(
    "#formAutenticar\\:numeroDocumento",
    (el, value) => (el.value = value),
    id
  );

  /* ----------------------------------- continue to password ----------------------------------- */
  console.log("[ - continue to password - ]");
  await frameContent.click("#formAutenticar\\:btnSubmitCont");
  if ((await page.$("#closeButton")) !== null) {
    console.log("[! closing pop up !]");
    await page.click("#closeButton");
  }

  /* ----------------------------------- PASSWORD INPUT ----------------------------------- */
  console.log("[ --- PASSWORD INPUT --- ]");
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

  /* ----------------------------------- PREVENTIVE screenshot & content ----------------------------------- */
  console.log("[ PREVENTIVE screenshot & content]");

  let pageContent = await page.content();
  fs.writeFile(
    "temp/preventiveDaviviendaLoggedIn.html",
    pageContent,
    "utf8",
    err => {
      if (err) throw err;
      console.log("preventiveDaviviendaLoggedIn been saved!");
    }
  );

  await page.screenshot({ path: "temp/preventiveDaviviendaLoggedIn.png" });

  /* ----------------------------------- checking for error ----------------------------------- */
  console.log("[ --- checking for errors ---]");
  let data = [],
    content;
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
        res.send({ code: "already-logged-in", message: data[1] });
        throw new Error("already-logged-in")
      }
    }
  }

  /* ----------------------------------- taking screenshot and grabing content ----------------------------------- */
  console.log("[closing]");
  pageContent = await page.content();
  console.log("[taking daviviendaLoggedInScreenshot]");
  await page.screenshot({ path: "temp/daviviendaLoggedInScreenshot.png" });

  console.log(' --- Writing hmtl file --- ');
  fs.writeFileSync("temp/daviviendaLoggedIn.html", pageContent, "utf8", err => {
    if (err) throw err;
    console.log("---- DaviviendaLoggedIn has been saved!");
  });
  
  /* ----------------------------------- grabing basic info from html file  ----------------------------------- */
  console.log('[... getting basic info]');
  // basicInfo()

  const $ = cheerio.load(pageContent)
  let test = $('#dashboardform:pagepanel .content-resumen table tbody tr')
  console.log('test',test);

  // root.map(async (detailedInfo, i) => {
  //   const detailedInfoID = detailedInfo.querySelectorAll('td a').id;
  //   console.log('attributes',detailedInfoID);
  //   await page.click(detailedInfoID);
  //   fs.writeFileSync(`temp/${i}acc.hmtl`, page.content(), "utf8", err => {
  //     if (err) throw err;
  //     console.log("---- 1acc has been saved!");
  //   });
  // })


  /* ----------------------------------- loging out and closing browser ----------------------------------- */
  if (data.length === 0) {
    await page.click("#dashboardform\\:cerrarSesion");
    await page.waitForSelector("#personas-ingresar");
    await page.screenshot({ path: "temp/logoutScreenshot.png" });
    fs.writeFileSync("temp/daviviendaLoggedOut.html", content, "utf8", err => {
      if (err) throw err;
      console.log("---- daviviendaLoggedOut has been saved!");
    });
  }
  await browser.close();

  console.log("[Sending data to postman or api caller]");
  if (data.length > 0) {
    res.send({ code: "already-logged-in", message: data[1] });
  } else {
    res.sendFile(path.resolve("temp/daviviendaLoggedInScreenshot.png"));
  }

  console.log('[-- end --]')
};

const basicInfo = async (req, res) => {
  console.log("[ --- parsing report --- ]");
  const davivienda = fs.readFileSync(path.resolve("temp/daviviendaLoggedIn.html"), "utf8", (err) => {
    if (err) throw err;
  });

  let root = HTMLParser.parse(davivienda)
  root = root.querySelectorAll('#dashboardform:pagepanel .content-resumen table tbody tr')

  let servicesInfo = []
  root.forEach(services => {
    name = services.querySelectorAll('td table tbody tr td')[0].innerHTML
    let account = {}
    if (name.includes('Cuenta')) {
      account = {
        available: services.querySelectorAll('td table tbody tr td')[1].innerHTML,
        savings: services.querySelectorAll('td table tbody tr td')[3].innerHTML,
        total: services.querySelectorAll('td table tbody tr td')[5].innerHTML
      }
    } else {
      account = {
        available: services.querySelectorAll('td table tbody tr td')[1].innerHTML,
        minimumPayment: {
          ammount: services.querySelectorAll('td table tbody tr td')[2].innerHTML,
          dateDue: services.querySelectorAll('td table tbody tr td')[3].innerHTML
        },
        debt: services.querySelectorAll('td table tbody tr td')[4].innerHTML,
        totalPayment: services.querySelectorAll('td table tbody tr td')[5].innerHTML
      }
    }
    servicesInfo = [...servicesInfo, {name, account}]
  });
  console.log('servicesInfo', servicesInfo);

  res.send(servicesInfo)
};

module.exports = { getReports, basicInfo };
