const fs = require("fs");
const puppeteer = require("puppeteer");
const credentials = require("../../credentials.json");
const cheerio = require("cheerio");

const getReports = async (req, res) => {
  const { id, password, url } = credentials.bbog;
  console.log("\x1b[0m", "[started BANCODEBOGOTA]");
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
    await page.goto(url, { waitUntil: "load" });
    /* ----------------------------------- Entering user name and submiting ----------------------------------- */
    console.log("-- Entering username");
    await page.waitForSelector("#identificationNumber");
    await page.click("#identificationNumber");
    await page.type("#identificationNumber", id, { delay: 100 });

    console.log("\x1b[0m", "Submited username");

    /* ----------------------------------- Filling out user password with keypad ----------------------------------- */
    await page.waitForSelector("#password");    
    await page.click("#password");
    console.log("Entering password");
    await page.type("#password", password, { delay: 100 });
    
    console.log("Typed password!");
    await page.waitForSelector("#btn-submit-login");
    await page.click("#btn-submit-login");
    console.log("Submited password!");

    await page.waitForSelector("#closeCovid19Modal");
    await page.click("#closeCovid19Modal");

    await page.waitForSelector("body > ion-app > ng-component > ion-nav > page-master > ion-split-pane > ion-nav > page-dashboard > ion-content > div.scroll-content > ion-grid > ion-row > ion-col.dashboard-content__second-col.col");
    const pageContent = await page.content();
    
    /* ----------------------------------- iFrame Loaded ----------------------------------- */
     
    fs.writeFile(
      __dirname + `/../temp/bbog/in/content-page.html`,
      pageContent,
      "utf8",
      (err) => {
      if (err) throw err;
    }
    );

    console.log("Succesfully logged in!");

    console.log("   Getting basic info ...");
    //Finding all the accounts
    $ = cheerio.load(pageContent);
    let accountName = [];
    $("body > ion-app > ng-component > ion-nav > page-master > ion-split-pane > ion-nav > page-dashboard > ion-content > div.scroll-content > ion-grid > ion-row > ion-col.dashboard-content__second-col.col > div")
      .find(".product")
      .each((i, op) => {
        let parsedOption = {
          name: $(op).find(".product-name").text()
        };
        accountName.push(parsedOption);
    });

    let accounts = [];
    let accountsId = [];
    $("body > ion-app > ng-component > ion-nav > page-master > ion-split-pane > ion-nav > page-dashboard > ion-content > div.scroll-content > ion-grid > ion-row > ion-col.dashboard-content__second-col.col > div")
      .children()
      .each((i, op) => {
      let parsedOption = {
        id: $(op).attr("id")
      };
      accounts.push(parsedOption);
    });
   
    for (j = 0 ; j < accounts.length; j++) {
      if (accounts[j].id !== undefined){
        accountsId.push(accounts[j].id);    
      } 
    } 


    //Selecting each account    
     for (i = 0; i < accountsId.length; i++) {
        await page.waitForSelector(`#${accountsId[i]}`);     
        await page.click(`#${accountsId[i]}`)/////////////////////////////////

        await page.waitForSelector(".card-detail-wrapper__subtitle")
        await page.waitForSelector("body > ion-app > ng-component > ion-nav > page-master > ion-split-pane > ion-nav > page-detail-and-txhistory > ion-content > div.scroll-content > pulse-flowtr > div:nth-child(1) > bdb-nav-options > div > div > div > div:nth-child(1) > div > svg-back")
        
        console.log("Building overview...", accountName[i].name);
        let accountContent = await page.content();
        let overview = basicInfo(accountContent, accountName[i].name); 
        
        if (accountName[i].name.includes("Cuenta de Ahorros")){
          await page.waitForSelector("body > ion-app > ng-component > ion-nav > page-master > ion-split-pane > ion-nav > page-detail-and-txhistory > ion-content > div.scroll-content > pulse-flowtr > div:nth-child(3) > div > div > bdb-title-generic-table > div > div.title-table-container__col-filters > div:nth-child(1)");
          await page.click("body > ion-app > ng-component > ion-nav > page-master > ion-split-pane > ion-nav > page-detail-and-txhistory > ion-content > div.scroll-content > pulse-flowtr > div:nth-child(3) > div > div > bdb-title-generic-table > div > div.title-table-container__col-filters > div:nth-child(1)");
          await page.click("#bsf-opt");
          await page.select("#bsf-opt", "lm");
          await page.waitForSelector("body > ion-app > ng-component > ion-nav > page-master > ion-split-pane > ion-nav > page-detail-and-txhistory > ion-content > div.scroll-content > pulse-flowtr > div:nth-child(3) > div:nth-child(1) > div > bdb-generic-table > div > div:nth-child(3) > div > div:nth-child(4)");
          console.log("Building movements...", accountName[i].name);
          let movements = movementInfo(accountContent, accountName[i].name);
          overview.movements = movements;
        }
        info.push(overview); 
        await page.click("#navbar0")
          
    } 
    
    fs.writeFile(
      __dirname + `/../temp/bbog/overview/info.txt`,
      JSON.stringify(info),
      "utf8",
      (err) => {
        if (err) throw err;
        console.log(`overview has been saved!`);
      }
    );
    // await page.waitForSelector(".content-sesion");
    // console.log("                              ");
    // console.log("\x1b[33m", "[ --- Closing --- ]");
    // console.log("                              ");
    // await page.click(".content-sesion");
    // await browser.close();
    // console.log("Browser closed");
    
    
  } catch (error) {
    
  }
  res.send(info);
};


const basicInfo = (html, type) => {
  $ = cheerio.load(html);
  //let type = $(".card-detail-wrapper__title").text().trim();
  if (type.includes("Cuenta de Ahorros")) {
    return {      
      name: type + " " + $(".card-detail-wrapper__subtitle").text().trim(),  
      account: {  
        ///optimizar los selectores    
        available: $("body > ion-app > ng-component > ion-nav > page-master > ion-split-pane > ion-nav > page-detail-and-txhistory > ion-content > div.scroll-content > pulse-flowtr > div:nth-child(2) > bdb-card-detail > pulse-card > div > div.pulse-grid > div.ng-trigger.ng-trigger-expandRow.ng-tns-c6-6.ng-star-inserted > div:nth-child(1) > div:nth-child(1) > div > div.col-xs-6.col-md-12.order-md-1.card-detail-wrapper__detail__value--highlight > div").text().trim(),
        savings: $("body > ion-app > ng-component > ion-nav > page-master > ion-split-pane > ion-nav > page-detail-and-txhistory > ion-content > div.scroll-content > pulse-flowtr > div:nth-child(2) > bdb-card-detail > pulse-card > div > div.pulse-grid > div.ng-trigger.ng-trigger-expandRow.ng-tns-c6-6.ng-star-inserted > div:nth-child(1) > div:nth-child(2) > div > div.col-xs-6.col-md-12.order-md-1.card-detail-wrapper__detail__value > div").text().trim(),
        total: $("body > ion-app > ng-component > ion-nav > page-master > ion-split-pane > ion-nav > page-detail-and-txhistory > ion-content > div.scroll-content > pulse-flowtr > div:nth-child(2) > bdb-card-detail > pulse-card > div > div.pulse-grid > div.ng-trigger.ng-trigger-expandRow.ng-tns-c6-6.ng-star-inserted > div:nth-child(1) > div:nth-child(3) > div > div.col-xs-6.col-md-12.order-md-1.card-detail-wrapper__detail__value > div").text().trim() 
      }      
    };
  } else if (type.includes("Libranzas")){
     return {       
       name: type + " " + $(".card-detail-wrapper__subtitle").text().trim(),
       account: {        
          ///optimizar los selectores
          available: $("body > ion-app > ng-component > ion-nav > page-master > ion-split-pane > ion-nav > page-detail-and-txhistory > ion-content > div.scroll-content > pulse-flowtr > div:nth-child(2) > bdb-card-detail > pulse-card > div > div.pulse-grid > div.ng-trigger.ng-trigger-expandRow.ng-tns-c6-11.ng-star-inserted > div:nth-child(1) > div:nth-child(1) > div > div.col-xs-6.col-md-12.order-md-1.card-detail-wrapper__detail__value--highlight > div").text().trim(),
          loan: $("body > ion-app > ng-component > ion-nav > page-master > ion-split-pane > ion-nav > page-detail-and-txhistory > ion-content > div.scroll-content > pulse-flowtr > div:nth-child(2) > bdb-card-detail > pulse-card > div > div.pulse-grid > div.ng-trigger.ng-trigger-expandRow.ng-tns-c6-11.ng-star-inserted > div:nth-child(1) > div:nth-child(2) > div > div.col-xs-6.col-md-12.order-md-1.card-detail-wrapper__detail__value > div").text().trim(),
          totalDebt: $("body > ion-app > ng-component > ion-nav > page-master > ion-split-pane > ion-nav > page-detail-and-txhistory > ion-content > div.scroll-content > pulse-flowtr > div:nth-child(2) > bdb-card-detail > pulse-card > div > div.pulse-grid > div.ng-trigger.ng-trigger-expandRow.ng-tns-c6-11.ng-star-inserted > div:nth-child(1) > div:nth-child(3) > div > div.col-xs-6.col-md-12.order-md-1.card-detail-wrapper__detail__value").text().trim()
        },
     };    
   }
};

////////////////

const movementInfo = (html, type) => {
  let $ = cheerio.load(html);

  let result = [];
  
result = $(".bdb-generic-table-container__body")
  .map((i, element) => ({
    date: $(element).find("div > div:nth-of-type(2)").text().trim(),
    amount: $(element).find("div > div:nth-of-type(4)").text().trim(),
    description: $(element).find("div > div:nth-of-type(3)").text().trim()
  })).get();
  

  return result;
};

module.exports = { getReports };