/*
|--------------------------------------------------------------------------
| Route Files
|--------------------------------------------------------------------------
|File for handle route that api call asdada
   
*/
const express = require("express");
const router = express.Router();
const daviviendaController = require("../controller/daviviendaController")

// Get Message
router.post("/text", (req, res) => {
  const { text } = req.body;
  console.log("[started]");
  res.send({ message: text });
});

router.get("/davivienda-get-reports", daviviendaController.getReports);
router.get("/test", daviviendaController.test);

module.exports = router;
