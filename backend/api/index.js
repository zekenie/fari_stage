require("dotenv").config();

const express = require("express");
const apiRouter = express.Router();

const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

const { getUserById } = require("../db");

apiRouter.get("/", async (req, res, next) => {
  res.send({ message: "Welcome to Fari" });
  next();
});

apiRouter.use(async (req, res, next) => {
  const prefix = "Bearer ";
  const auth = req.header("Authorization");
  if (!auth) {
    next();
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);
    try {
      const parsedToken = jwt.verify(token, JWT_SECRET);
      const id = parsedToken && parsedToken.id;
      if (id) {
        req.user = await getUserById(id);
        next();
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    next({
      name: "AuthorizationHeaderError",
      message: `Authorization token must start with ${prefix}`,
    });
  }
});

const usersRouter = require("./users");
apiRouter.use("/users", usersRouter);

const explorerRouter = require("./explorer");
apiRouter.use("/explorer", explorerRouter);

apiRouter.use((error, req, res, next) => {
  res.send(error);
});

module.exports = apiRouter;
