/*
|--------------------------------------------------------------------------
| Http server
|--------------------------------------------------------------------------
|
| This file bootstraps to start the HTTP server. .
| 
| """ loads files configurations """
|     
*/

const config = require(`./config/config`),
  { PORT } = require(`./config/config`),
  routes = require("./routes/routes.js"),
  express = require("express"),
  cors = require("express-cors"),
  app = express();

app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(express.json());

app.use("/text", routes);

app.listen(PORT, () => console.log("server started"));

module.exports = app;
