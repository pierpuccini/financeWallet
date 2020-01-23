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

  console.log("[getting page]");
  await page.goto("https://www.davivienda.com/wps/portal/personas/nuevo");

  console.log("[clicking Login]");
  await page.click("#personas-ingresar");

  console.log("[waiting for iframe]");
  await page.waitFor(5000);

  const elementHandle = await page.$("div#divIFrame iframe");
  console.log("[*** iFrame Loaded ***]");
  const frameContent = await elementHandle.contentFrame();
  if ((await page.$("#closeButton")) !== null) {
    console.log("[! closing pop up !]");
    await page.click("#closeButton");
  }

  console.log("[--- Filling Document # ---]");
  console.log("[ - focusing on input - ]");
  await frameContent.waitForSelector("#formAutenticar\\:numeroDocumento");
  await frameContent.focus("#formAutenticar\\:numeroDocumento");

  console.log("[ - filling out input - ]");
  await frameContent.$eval(
    "#formAutenticar\\:numeroDocumento",
    (el, value) => (el.value = value),
    id
  );

  console.log("[ - continue to password - ]");
  await frameContent.click("#formAutenticar\\:btnSubmitCont");
  if ((await page.$("#closeButton")) !== null) {
    console.log("[! closing pop up !]");
    await page.click("#closeButton");
  }

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
  console.log("[ PREVENTIVE screenshot & content]");

  // let content = await frameContent.content();
  // fs.writeFile("temp/content.html", content, "utf8", err => {
  //   if (err) throw err;
  //   console.log("The file has been saved!");
  // });

  let pageContent = await page.content();
  fs.writeFile("temp/pageContent.html", pageContent, "utf8", err => {
    if (err) throw err;
    console.log("The file has been saved!");
  });

  await page.screenshot({ path: "temp/screenshotPreventive.png" });

  console.log("[ --- checking for errors ---]");
  let data = [], content;
  if ((await frameContent.$("#divMessageCodigo")) !== null) {
    data = await frameContent.evaluate(() => {
      const tds = Array.from(
        document.querySelectorAll(".tablaMessage tbody tr td")
      );
      return tds.map(td => td.textContent);
    });
    content = await frameContent.content();
  }

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
