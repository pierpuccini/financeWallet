const express = require("express");
const path = require("path");
const puppeteer = require("puppeteer");
const fs = require("fs");
const credentials = require("../../credentials.json");

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
  console.log("... waited 15000 ms");

  if ((await page.$("#closeButton")) !== null) {
    console.log("[! closing pop up !]");
    await page.click("#closeButton");
  }

  /* ----------------------------------- PREVENTIVE screenshot & content ----------------------------------- */
  console.log("[ PREVENTIVE screenshot & content]");

  let pageContent = await page.content();
  fs.writeFile("temp/preventiveDaviviendaLoggedIn.html", pageContent, "utf8", err => {
    if (err) throw err;
    console.log("preventiveDaviviendaLoggedIn been saved!");
  });

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
    }
  }

  /* ----------------------------------- taking screenshot and grabing content ----------------------------------- */
  console.log("[closing]");
  pageContent = await page.content();
  console.log("[taking daviviendaLoggedInScreenshot]");
  await page.screenshot({ path: "temp/daviviendaLoggedInScreenshot.png" });

  /* ----------------------------------- loging out and closing browser ----------------------------------- */
  if (data.length === 0) {
    await page.click("#dashboardform\\:cerrarSesion");
    await page.waitForSelector("#personas-ingresar");
    await page.screenshot({ path: "temp/logoutScreenshot.png" });
  }
  await browser.close();

  fs.writeFile("temp/daviviendaLoggedOut.html", content, "utf8", err => {
    if (err) throw err;
    console.log("---- daviviendaLoggedOut has been saved!");
  });

  fs.writeFile("temp/daviviendaLoggedIn.html", pageContent, "utf8", err => {
    if (err) throw err;
    console.log("---- DaviviendaLoggedIn has been saved!");
  });

  console.log("[Sending data to postman or api caller]");
  if (data.length > 0) {
    res.send({ code: "already-logged-in", message: data[1] });
  } else {
    res.sendFile(path.resolve("temp/daviviendaLoggedInScreenshot.png"));
  }
};

const parseHtmlForReport = async (req, res) => {

  console.log("[started]");
  fs.readFile(path.resolve("temp/daviviendaLoggedIn.html"))
};

module.exports = { getReports };
