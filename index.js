const express = require("express");
const morgan = require("morgan");
require("dotenv").config();
const config = require("./config/app");
const app = express();
const router = require("./router");
const CORS = require("cors");
const helmet = require("helmet");
const http = require("http");

const port = config.appPort || 5000;

if (process.env.NODE_ENV == "development") {
  app.use(morgan("dev"));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  CORS({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/uploads"));
app.use(helmet());
app.use(router);
const server = http.createServer(app);
const {socketServer} = require("./socket");

socketServer(server);
server.listen(port, () => {
  console.log(`Server listening on PORT http://127.0.0.1:${port}`);
});
