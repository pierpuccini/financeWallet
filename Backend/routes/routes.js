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

// Get Message
router.post("/text", (req, res) => {
  const { text } = req.body;
  console.log("[started]");
  res.send({ message: text });
});

/* Temp path creation for davi */
fs.mkdirSync("./temp/davi",{recursive: true});
fs.mkdirSync("./temp/davi/in",{recursive: true});
fs.mkdirSync("./temp/davi/movements",{recursive: true});
fs.mkdirSync("./temp/davi/overview",{recursive: true});
//TODO: THIS WILL BE REMOVED
fs.mkdirSync("./temp/davi/preventive",{recursive: true});

router.get("/davivienda-get-reports", daviviendaController.getReports);
router.get("/test", daviviendaController.test);

module.exports = router;
