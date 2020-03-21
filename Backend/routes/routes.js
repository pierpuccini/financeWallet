/*
|--------------------------------------------------------------------------
| Route Files
|--------------------------------------------------------------------------
|File for handle route that api call
   
*/
/* Dependancies */
const express = require("express");
const fs = require("fs");
const router = express.Router();

/* Controllers */
const daviviendaController = require("../controller/daviviendaController")
const bancolombiaController = require("../controller/bancolombiaController")

// Get Message
router.post("/text", (req, res) => {
  const { text } = req.body;
  console.log("[started]");
  res.send({ message: text });
});

/* Routes & temp path creation for davi */
fs.mkdirSync("./temp/davi",{recursive: true});
fs.mkdirSync("./temp/davi/in",{recursive: true});
fs.mkdirSync("./temp/davi/movements",{recursive: true});
fs.mkdirSync("./temp/davi/overview",{recursive: true});
//TODO: THIS WILL BE REMOVED
fs.mkdirSync("./temp/davi/preventive",{recursive: true});

router.get("/davi-get-reports", daviviendaController.getReports);
router.get("/test", daviviendaController.test);

/* Routes & temp path creation for bcol */
fs.mkdirSync("./temp/bcol",{recursive: true});
fs.mkdirSync("./temp/bcol/in",{recursive: true});
fs.mkdirSync("./temp/bcol/movements",{recursive: true});
fs.mkdirSync("./temp/bcol/overview",{recursive: true});
//TODO: THIS WILL BE REMOVED
fs.mkdirSync("./temp/bcol/preventive",{recursive: true});

router.get("/bcol-get-reports", bancolombiaController.getReports);

module.exports = router;
