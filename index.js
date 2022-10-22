const express = require("express");
const morgan = require("morgan");
require("dotenv").config();
const config = require("./config/app");
const app = express();

const port = config.appPort || 5000;

if (process.env.NODE_ENV == "development") {
  app.use(morgan("dev"));
}

app.listen(port, () => {
  console.log(`Server listening on PORT ${port}`);
});
