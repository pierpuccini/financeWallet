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
  const frame = await elementHandle.contentFrame();
  if ((await page.$("#closeButton")) !== null) {
    console.log("[! closing pop up !]");
    await page.click("#closeButton");
  }

  console.log("[--- Filling Document # ---]");
  console.log("[ - focusing on input - ]");
  await frame.focus("#formAutenticar\\:numeroDocumento");
  await frame.waitFor(500);

  console.log("[ - filling out input - ]");
  await frame.$eval(
    "#formAutenticar\\:numeroDocumento",
    el => (el.value = "0000")
  );
  await frame.waitFor(500);

  console.log("[ - continue to password - ]");
  await frame.click("#formAutenticar\\:btnSubmitCont");
  if ((await page.$("#closeButton")) !== null) {
    console.log("[! closing pop up !]");
    await page.click("#closeButton");
  }
  await frame.waitFor(500);

  console.log("[ --- PASSWORD INPUT --- ]");
  await frame.$eval(
    "#formAutenticar\\:claveVirtual",
    el => (el.value = "0000")
  );
  if ((await page.$("#closeButton")) !== null) {
    console.log("[! closing pop up !]");
    await page.click("#closeButton");
  }
  await frame.waitFor(500);

  console.log("!!! SUBMITING PASSWORD !!!");
  await frame.click("#formAutenticar\\:btnSubmitCont");
  if ((await page.$("#closeButton")) !== null) {
    console.log("[! closing pop up !]");
    await page.click("#closeButton");
  }
  await frame.waitFor(5000);

  console.log("[closing]");
  var content = await frame.content();
  console.log("[taking screenshot]");
  await page.screenshot({ path: "temp/screenshot.png" });
  await browser.close();

  fs.writeFile("temp/content.html", content, "utf8", err => {
    if (err) throw err;
    console.log("The file has been saved!");
  });

  res.sendFile(path.resolve("temp/screenshot.png"));
});

module.exports = router;
