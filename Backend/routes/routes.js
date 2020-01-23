/*
|--------------------------------------------------------------------------
| Route Files
|--------------------------------------------------------------------------
|File for handle route that api call
   
*/
const express = require("express");
const router = express.Router();
const path = require("path");
const puppeteer = require("puppeteer");
const fs = require("fs");
const credentials = require("../../credentials.json");

// Get Message
router.post("/text", (req, res) => {
  const { text } = req.body;
  console.log("[started]");
  res.send({ message: text });
});

router.get("/davivienda-get-reports", async (req, res) => {
  // if ((await page.$("#closeButton")) !== null) {
  //   console.log("[! closing pop up !]");
  //   await page.click("#closeButton");
  // }
  const { id, password } = credentials;
  console.log("[started]");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  /* ----------------------------------- getting page ----------------------------------- */
  console.log("[getting page]");
  await page.goto("https://www.davivienda.com/wps/portal/personas/nuevo");

  /* ----------------------------------- clicking Login ----------------------------------- */
  console.log("[clicking Login]");
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
  await frameContent.waitForSelector("#formAutenticar\\:numeroDocumento");
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

  if ((await page.$("#closeButton")) !== null) {
    console.log("[! closing pop up !]");
    await page.click("#closeButton");
  }

  /* ----------------------------------- PREVENTIVE screenshot & content ----------------------------------- */
  console.log("[ PREVENTIVE screenshot & content]");

  let pageContent = await page.content();
  fs.writeFile("temp/pageContent.html", pageContent, "utf8", err => {
    if (err) throw err;
    console.log("The file has been saved!");
  });

  await page.screenshot({ path: "temp/screenshotPreventive.png" });

  /* ----------------------------------- checking for errors ----------------------------------- */
  console.log("[ --- checking for errors ---]");
  let data = [],
    content;
  if ((await frameContent.$("#divMessageCodigo")) !== null) {
    console.log('[! ERROR PRESENT !]');
    data = await frameContent.evaluate(() => {
      const tds = Array.from(
        document.querySelectorAll(".tablaMessage tbody tr td")
      );
      return tds.map(td => td.textContent);
    });
    content = await frameContent.content();
  }

  /* ----------------------------------- Waiting on redirect ----------------------------------- */
  console.log('[... Waiting on redirect ... ]');
  await page.waitForNavigation({'waitUntil':'domcontentloaded'})

  /* ----------------------------------- closing ----------------------------------- */
  console.log("[closing]");
  pageContent = await page.content();
  console.log("[taking screenshot]");
  await page.screenshot({ path: "temp/screenshot.png" });
  await browser.close();

  fs.writeFile("temp/content.html", content, "utf8", err => {
    if (err) throw err;
    console.log("The file has been saved!");
  });

  fs.writeFile("temp/pageContent.html", pageContent, "utf8", err => {
    if (err) throw err;
    console.log("The file has been saved!");
  });

  if (data.length > 0) {
    res.send(data[1]);
  } else {
    res.sendFile(path.resolve("temp/screenshot.png"));
  }
});

module.exports = router;
