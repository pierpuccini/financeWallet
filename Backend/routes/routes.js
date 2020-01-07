/*
|--------------------------------------------------------------------------
| Route Files
|--------------------------------------------------------------------------
|File for handle route that api call
   
*/
const express = require("express");
const router = express.Router();

// Get Message
router.post("/", (req, res) => {
  const { text } = req.body;
  res.send({ message: text });
});

module.exports = router;
