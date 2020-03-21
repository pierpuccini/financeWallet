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
    defaultViewport: null
  });
  const page = await browser.newPage();
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
    console.log("-- Entering username", id);
    await page.waitForSelector("#username");
    await page.type("#username", id, { delay: 100 });

    console.log("\x1b[0m", "Submited username");
    await page.click("#btnGo");

    /* ----------------------------------- Filling out user password with keypad ----------------------------------- */
    await page.waitForSelector("#_KEYBRD");
    let pageContent = await page.content();
    fs.writeFile(`temp/bcol/page.html`, pageContent, "utf8", err => {
      if (err) throw err;
    });
    console.log("Password page loaded");

    let success = 0,
      cheerioEl;
    let passwordArr = password.toString().split("");

    while (success < passwordArr.length) {
      $ = cheerio.load(pageContent);

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
        console.log("id", divId);
        // await page.click($(cheerioEl).parent().attr("class"));
        const [targetElement] = await page.$x(`//div[@id='${divId}']/..`);
        console.log("object", targetElement);
        await targetElement.click();
        success += 1;
      }
    }
    console.log("Entered password!");
    // async function enterPassword() {
    //   let root = HTMLParser.parse(pageContent);
    //   root = root.querySelectorAll("#_KEYBRD tbody tr");

    //   const sizeRow = root.querySelector("#_KEYBRD tbody").closest("tr").length;
    //   const sizeVer = root.querySelector("#_KEYBRD tbody tr").closest("td")
    //     .length;

    //   success = 0;
    //   while (success < password.length) {}

    //   //ciclo del tamaño de la contraseña
    //   for (let i = 0; i < sizeRow; i++) {
    //     for (let j = 0; j < sizeVer; i++) {
    //       name = root.querySelectorAll("#_KEYBRD tbody tr")[i].innerHTML; //cada fila
    //       const num = name.find("div").text()[j]; //cada columna dentro de cada fila
    //       var car = password.slice(i, i + 1);
    //       console.log("contraseña dividida");
    //       if (num == car) {
    //         console.log("[i+1] caracter encontrado]");
    //         page.click(".bg_buttonSmall");
    //         console.log("click dado");
    //       }
    //     }
    //   }
    // }
  } catch (error) {
    ///
  }
};

module.exports = { getReports };
