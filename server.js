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
server.use(express.urlencoded({ extended: true, limit: "1kb" }));
// good. Important.
server.use(express.json({ limit: "100mb" }));

// very good. I was going to recommend this.
server.use(helmet());
// i believe this is taken care of by `helmet` and you don't need to do this yourself.
server.disable("x-powered-by");

//middleware
const limiter = require("express-rate-limit");
// Your rate limiter retains state. It needs to keep track of IP addresses and how frequently 
// each IP makes a request.
//
// [PROBLEM] Right now this state is stored in memory. this means that you cannot scale your server
// if you scale up, you will have n pieces of state for each of your n servers. 
//
// Try installing [one of the official data stores for this package](https://github.com/express-rate-limit/express-rate-limit#store) 
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
// [PROBLEM] 50mb is a pretty huge payload, I'd consider lowering this
server.use(bodyParser.json({ limit: "50mb" }));
// [PROBLEM] 50mb is a pretty huge payload, I'd consider lowering this
server.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

server.use(function (req, res, next) {
  // [PROBLEM] This URL should be in an environment variable
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
