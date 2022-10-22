const express = require("express");
const morgan = require("morgan");
require("dotenv").config();
const config = require("./config/app");
const app = express();
const router = require("./router");

const port = config.appPort || 5000;

if (process.env.NODE_ENV == "development") {
  app.use(morgan("dev"));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(router);
app.listen(port, () => {
  console.log(`Server listening on PORT http://127.0.0.1:${port}`);
});
