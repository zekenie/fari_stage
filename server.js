"use strict";
require("dotenv").config();
const PORT = process.env.PORT || 3000;

const express = require("express");
const server = express();
const cluster = require("cluster");
const http = require("http");
const os = require("os");
const helmet = require("helmet");
const numCPU = os.cpus().length;

const client = require("./backend/db/client");
client.connect();

const hpp = require("hpp");
server.use(hpp());

server.use(express.static("public", { extensions: ["html"] }));
server.use(express.urlencoded({ extended: false, limit: "1kb" }));
server.use(express.json({ limit: "100mb" }));

server.use(helmet());
server.disable("x-powered-by");

//middleware
const limiter = require("express-rate-limit");
server.use(
  limiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 75, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  })
);

const cors = require("cors");
server.use(cors());
server.use(cors({ origin: "*" }));

const bodyParser = require("body-parser");
server.use(bodyParser.json({ limit: "50mb" }));
server.use(bodyParser.urlencoded({ extended: false, limit: "50mb" }));

server.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://fari-stage.netlify.app");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Request-With, Content-Type, Accept, Authorization, Cookies"
  );
  next();
});

const morgan = require("morgan");
server.use(morgan("dev"));

//Router API
server.use("/api", require("./backend/api"));

if (cluster.isMaster) {
  for (let index = 0; index < numCPU; index++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  server.listen(PORT, async () => {
    console.log(`Welcome to Fari! Listening on Port: ${PORT}`);
  });
}
