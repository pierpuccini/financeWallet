const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");
const credentials = require("../../credentials.json");
const cheerio = require("cheerio");
var HTMLParser = require('node-html-parser');

const getReports = async (req, res) => {
  const { id, password } = credentials;
  console.log('\x1b[0m',"[started DAVIVIENDA]");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let data = [];
  try {
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
    await frameContent.waitForSelector("#formAutenticar\\:numeroDocumento", {
      timeout: 120000
    });
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
    let content;
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
    console.log('--- waiting for .type-one ---');
    await page.waitForSelector('.type-one', {
      timeout: 120000
    })
    pageContent = await page.content();
    console.log("[taking daviviendaLoggedInScreenshot]");
    await page.screenshot({ path: "temp/daviviendaLoggedInScreenshot.png" });

    console.log(" --- Writing html file --- ");
    fs.writeFileSync(
      "temp/daviviendaLoggedIn.html",
      pageContent,
      "utf8",
      err => {
        if (err) throw err;
        console.log("---- DaviviendaLoggedIn has been saved!");
      }
    );

    /* ----------------------------------- grabing basic info from html file  ----------------------------------- */
    console.log("[... getting basic info]");
    // basicInfo()

    let $ = cheerio.load(pageContent);

    let accountId = $(".type-one tbody tr td a").attr('id').split(':');
    let accountDivIds = [];
    let accounts = $(".type-one tbody").closest('tr').length
    console.log('accountId',accountId);
    for (let i = 0; i < accounts; i++) {    
      let divId = accountId
      divId[2] = i
      accountDivIds.push(divId.join('\\:'))
    }

    console.log('accountDivIds',accountDivIds);
    await page.click(`#${accountDivIds[0]}`)
    /* ----------------------------------- waiting for iframe ----------------------------------- */
    console.log("[waiting for iframe]");
    await page.waitForSelector("#dashboardform\\:dynamicIframe iframe", {
      timeout: 120000
    });
    await page.screenshot({ path: "temp/daviviendaAcc1.png" });
    pageContent = await page.content();
    fs.writeFileSync(`temp/daviviendaAcc1.html`,pageContent,"utf8",err => {
        if (err) throw err;
        console.log(`---- daviviendaAcc1 has been saved!`);
      }
    );
    const elementHandleDetails = await page.$("#dashboardform\\:dynamicIframe iframe");

    /* ----------------------------------- iFrame Loaded ----------------------------------- */
    console.log("[*** iFrame Loaded ***]");
    await elementHandleDetails.contentFrame().waitForSelector("center form table tbody", {
      timeout: 120000
    });
    const frameContentDetails = await elementHandleDetails.contentFrame();

    await page.screenshot({ path: "temp/daviviendaAccIframe1.png" });
    fs.writeFileSync(`temp/daviviendaAccIframe1.html`,frameContentDetails,"utf8",err => {
        if (err) throw err;
        console.log(`---- daviviendaAcc1 has been saved!`);
      }
    );

    await page.click('#dashboardform\\:goToResumen')
    await page.screenshot({ path: "temp/backToHome.png" });

    // accountDivIds.map(async (id,i)=>{
    //   await page.click(`#${id}`)
    //   pageContent = await page.content();
    //   fs.writeFileSync(
    //     `temp/daviviendaAcc${i}.html`,
    //     pageContent,
    //     "utf8",
    //     err => {
    //       if (err) throw err;
    //       console.log(`---- daviviendaAcc${i} has been saved!`);
    //     }
    //   );
    // })
            
    /* TODO END ID dashboardform:goToResumen */

    /* ----------------------------------- loging out and closing browser ----------------------------------- */
    console.log('\x1b[33m',"[closing]");
    console.log('\x1b[0m','data length: ', data.length);
    if (data.length === 0) {
      await page.click("#dashboardform\\:cerrarSesion");
      console.log('\x1b[33m',"[ closing sesion and waiting]");
      await page.waitForSelector("#personas-ingresar", {
        timeout: 120000
      });
      console.log('\x1b[32m',"[-- session closed! --]");
      console.log('\x1b[0m');
      await page.screenshot({ path: "temp/logoutScreenshot.png" });
      fs.writeFileSync(
        "temp/daviviendaLoggedOut.html",
        page.content(),
        "utf8",
        err => {
          if (err) throw err;
          console.log("---- daviviendaLoggedOut has been saved!");
        }
      );
    }
    await browser.close();

    console.log("[Sending data to postman or api caller]");
    res.sendFile(path.resolve("temp/daviviendaLoggedInScreenshot.png"));
    console.log('\x1b[32m',"[-- end succesfully--]");
    console.log('\x1b[0m');

  } catch (error) {
    console.log('\x1b[31m','!!! error in catch !!!', error);
    /* ----------------------------------- loging out and closing browser ----------------------------------- */
    console.log('data in catch', data.length);
    if (data.length !== 0 && error.code !== "already-logged-in") {
      await page.click("#dashboardform\\:cerrarSesion");
      await page.waitForSelector("#personas-ingresar");
      await page.screenshot({ path: "temp/logoutScreenshot.png" });
      fs.writeFileSync(
        "temp/daviviendaLoggedOut.html",
        content,
        "utf8",
        err => {
          if (err) throw err;
          console.log("---- daviviendaLoggedOut has been saved!");
        }
      );
    }
    await browser.close();

    console.log("[Sending error to postman or api caller]");
    if (data.length > 0) {
      res.send({ code: "already-logged-in", message: data[1] });
    } else {
      res.send({ code: "server error", message: error });
    }

    console.log('\x1b[31m',"[-- end with error --]");
    console.log('\x1b[0m');
  }
};

const basicInfo = async (req, res) => {
  console.log("[ --- parsing report --- ]");
  const davivienda = fs.readFileSync(
    path.resolve("temp/daviviendaLoggedIn.html"),
    "utf8",
    err => {
      if (err) throw err;
    }
  );

  /* TODO: migrate to cheerio */
  let root = HTMLParser.parse(davivienda);
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
  console.log("servicesInfo", servicesInfo);

  res.send(servicesInfo);
};

const test = (req, res) => {
  const pageContent = fs.readFileSync(
    path.resolve("temp/daviviendaLoggedIn--.html"),
    "utf8",
    err => {
      if (err) throw err;
    }
  );
  let $ = cheerio.load(pageContent);
  let accountId = $(".type-one tbody tr td a").attr('id').split(':');
  let accountDivIds = [];
  let accounts = $(".type-one tbody").closest('tr').length
  console.log('accountId',accountId);
  for (let i = 0; i < accounts; i++) {    
    let divId = accountId
    divId[2] = i
    accountDivIds.push(divId.join(':'))
  }
  console.log('accountDivIds',accountDivIds);
}

module.exports = { getReports, basicInfo, test };
