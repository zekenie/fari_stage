require("dotenv").config();
const express = require("express");
const usersRouter = express.Router();
const { JWT_SECRET, JWT_SECRET_RESET } = process.env;
const jwt = require("jsonwebtoken");
const { requireUser } = require("./utils");
const path = require("path");
const limiter = require("express-rate-limit");
const { body, check, validationResult } = require("express-validator");
const ddos = limiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per `window` (here, per 15 minutes)
});
const cors = require("cors");
usersRouter.use(cors());

// const redis = require("redis");
// let redisClient = redis.createClient({
//   url: process.env.REDIS_URL,
//   socket: {
//     tls: true,
//     rejectUnauthorized: false,
//   },
// });

const { uploadFile, uploadThumbnails } = require("../aws");

const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./useruploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fieldSize: 10 * 1024 * 1024 },
});

const profilePosterUpdate = upload.single("channel-poster");

const profileAvatarUpdate = upload.single("avatar");

const {
  createUser,
  getUser,
  addLocation,
  addBio,
  getUserByUsername,
  getUserByEmail,
  getAllUsers,
  getAllChannels,
  verifiedVendors,
  getUserSubs,
  getUserChannelByChannelID,
  getPostByChannelID,
  getUserChannel,
  getUserProfile,
  updateAvatar,
  updatePosters,
  updateUploadsPicture,
  updateCommentsPic,
  getUserById,
  createSubs,
  updateChannelSubs,
  zeroSubs,
  getUserSubsLimit,
  removeChannelSub,
  removeSubs,
  myLikes,
  myDisLikes,
  getUserStatSubForChannel,
  getChannelByName,
  getLiveChannels,
  userSearch,
  getAllUsersUsername,
  updatePassword,
  getUsersByUsername,
  updateVendorSubscription,
  updateUserSubscription,
  verifyUserSubscriptionStatus,
  updateChannelSubsStatus,
} = require("../db");

usersRouter.get("/", async (req, res, next) => {
  try {
    const allUsers = await getAllUsers();
    res.send({
      users: allUsers,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

usersRouter.get("/me", requireUser, async (req, res, next) => {
  try {
    res.send({ user: req.user });
  } catch (error) {
    console.error("Hmm, can't seem to get that user", error);
    next(error);
  }
});

usersRouter.get("/usernames", requireUser, async (req, res, next) => {
  // let getCache = await redisClient.get("fariUsers");
  // await redisClient.expire("fariUsers", 1800);
  // if (getCache && getCache != null) {
  //   console.log("cache found");
  //   res.send({ users: JSON.parse(getCache) });
  // } else if (!getCache) {
  console.log("no cache found");
  try {
    const allUsernames = await getAllUsersUsername();
    let setData = await redisClient.set(
      "fariUsers",
      JSON.stringify(allUsernames)
    );
    res.send({ users: allUsernames });
  } catch ({ name, message }) {
    next({ name, message });
  }
  // }
});

usersRouter.get(
  "/usernames/:username",
  check("username").not().isEmpty().trim().escape(),
  async (req, res, next) => {
    const { username } = req.params;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .send({ name: "Validation Error", message: errors.array()[0].msg });
    } else {
      try {
        const usersName = await getUsersByUsername(username);
        res.send({
          users: usersName,
        });
      } catch ({ name, message }) {
        next({ name, message });
      }
    }
  }
);

usersRouter.get(
  "/usersearch/:query",
  check("query").not().isEmpty().trim().escape(),
  async (req, res, next) => {
    const { query } = req.params;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .send({ name: "Validation Error", message: errors.array()[0].msg });
    } else {
      try {
        const usersSearch = await userSearch(query);
        res.send({ users: usersSearch });
      } catch (error) {
        console.log("Oops could not find search results", error);
        next({
          name: "ErrorGettingSearchResults",
          message: "Could not get the search results",
        });
      }
    }
  }
);

usersRouter.get("/channels", async (req, res, next) => {
  try {
    const allChannels = await getAllChannels();
    res.send({ allChannels });
  } catch ({ name, message }) {
    next({
      name: "ErrorGettingChannels",
      message: "Could not retrieve channels",
    });
  }
});

usersRouter.get(
  "/livechannels/:userid",
  check("userid")
    .not()
    .isEmpty()
    .isNumeric()
    .withMessage("Not a valid value")
    .trim()
    .escape(),
  async (req, res, next) => {
    const { userSubed } = req.params;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .send({ name: "Validation Error", message: errors.array()[0].msg });
    } else {
      try {
        const liveChannels = await getLiveChannels(userid);
        res.send({ live: liveChannels });
      } catch (error) {
        console.log(error);
        next({
          name: "ErrorGettingLiveChannels",
          message: "Could not retrieve live channels",
        });
      }
    }
  }
);

usersRouter.post(
  "/register",
  ddos,
  check("username")
    .not()
    .isEmpty()
    .withMessage("Please provide a valid username")
    .trim()
    .escape()
    .isLength({ min: 3 })
    .withMessage({ message: "Username must have a min of 4 characters" }),
  check("email")
    .not()
    .isEmpty()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  check("location").trim().escape(),
  check("password")
    .not()
    .isEmpty()
    .trim()
    .escape()
    .isLength({ min: 8 })
    .withMessage({
      message: "Password does not meet the min requirements of 8 characters",
    })
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, "i")
    .withMessage({
      message:
        "Password must include one lowercase character, one uppercase character, a number, and a special character.",
    }),
  check("confirmpassword")
    .not()
    .isEmpty()
    .trim()
    .escape()
    .isLength({ min: 8 })
    .withMessage({
      message: "Password does not meet the min requirements of 8 characters",
    })
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, "i")
    .withMessage({
      message:
        "Password must include one lowercase character, one uppercase character, a number, and a special character.",
    }),
  async (req, res, next) => {
    const { username, email, password, confirmpassword, location } = req.body;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .send({ name: "Validation Error", message: errors.array()[0].msg });
    } else {
      try {
        const _user = await getUserByUsername(username);
        if (_user) {
          next({
            error: "UserExistsError",
            message: "A user by that username already exists",
          });
          return false;
        }

        const _email = await getUserByEmail(email);
        if (_email) {
          next({
            error: "EmailExistsError",
            message: "A user with that email already exists",
          });
          return false;
        }

        if (password.length < 8) {
          next({
            error: "PasswordNotStrongEnough",
            message: "Password not strong enough, minimum 8 characters",
          });
          return false;
        }

        if (password != confirmpassword) {
          next({
            error: "PasswordsMatchError",
            message: "Your password and confirmed password don't match.",
          });
          return false;
        }
        const user = await createUser({
          username,
          email,
          password,
          confirmpassword,
          location,
        });
        if (!user) {
          next({
            message: "Ooop, could not create your account, please try again.",
          });
        } else {
          const token = jwt.sign(
            {
              id: user.id,
              username,
            },
            process.env.JWT_SECRET
          );

          res.send({
            success: "SuccessfulRegistration",
            message: "Thank you for signing up, please return to login.",
            user,
            token,
          });
        }
      } catch (error) {
        console.error(error, errors);
        next(error);
      }
    }
  }
);

usersRouter.post(
  "/login",
  ddos,
  check("username")
    .not()
    .isEmpty()
    .trim()
    .escape()
    .withMessage({ message: "Please provide a valid username" }),
  check("password")
    .not()
    .isEmpty()
    .trim()
    .escape()
    .withMessage({ message: "Please provide a valid password" }),
  async (req, res, next) => {
    const { username, password } = req.body;

    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .send({ name: "Validation Error", message: errors.array()[0].msg });
    } else {
      try {
        const user = await getUser({ username, password });
        if (user) {
          const token = jwt.sign(user, process.env.JWT_SECRET);
          next({
            success: "SuccsessfulLogin",
            message: "Welcome to Fari!",
            token,
          });
        } else {
          next({
            error: "IncorrectCredentialsError",
            message: "Your username or password is invalid.",
          });
        }
      } catch (error) {
        console.error(error, errors);
        next(error);
      }
    }
  }
);

usersRouter.patch(
  "/addbio/:id",
  requireUser,
  check("bio").trim().escape(),
  check("id")
    .not()
    .isEmpty()
    .isNumeric()
    .withMessage("Not a valid value")
    .trim()
    .escape(),
  async (req, res, next) => {
    const { id } = req.params;
    const bio = req.body.bio;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .send({ name: "Validation Error", message: errors.array()[0].msg });
    } else {
      try {
        const data = {
          bio: bio,
        };
        const biography = await addBio(id, data);
        res.send({ user: biography });
      } catch (error) {
        console.log(error);
        next({ name: "ErrorSettiingBio", message: "Could not add biography" });
      }
    }
  }
);

usersRouter.patch(
  "/addlocation/:id",
  requireUser,
  check("location").trim().escape(),
  check("id")
    .not()
    .isEmpty()
    .isNumeric()
    .withMessage("Not a valid value")
    .trim()
    .escape(),
  async (req, res, next) => {
    const { id } = req.params;
    const location = req.body.location;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .send({ name: "Validation Error", message: errors.array()[0].msg });
    } else {
      try {
        const data = {
          location: location,
        };
        const userLocation = await addLocation(id, data);
        res.send({ user: userLocation });
      } catch (error) {
        console.log(error);
        next({
          name: "ErrorSettiingLocation",
          message: "Could not add location",
        });
      }
    }
  }
);

usersRouter.get(
  "/loggedin/:id",
  requireUser,
  check("id")
    .not()
    .isEmpty()
    .isNumeric()
    .withMessage("Not a valid value")
    .trim()
    .escape(),
  async (req, res, next) => {
    const { id } = req.params;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .send({ name: "Validation Error", message: errors.array()[0].msg });
    } else {
      try {
        const loggedIn = await getUserById(id);
        res.send({ user: loggedIn });
      } catch (error) {
        console.error("Hmm, can't seem to get that user", error);
        next(error);
      }
    }
  }
);

usersRouter.get("/myprofile", requireUser, async (req, res, next) => {
  try {
    const { username, id } = req.user;
    const me = await getUserProfile(username);
    res.send({ profile: me });
  } catch (error) {
    console.log("Could not get user channel", error);
  }
});

usersRouter.get(
  "/myprofile/channel/:username",
  requireUser,
  check("username").not().isEmpty().trim().escape(),
  async (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .send({ name: "Validation Error", message: errors.array()[0].msg });
    } else {
      try {
        const { username } = req.params;
        const channel = await getUserChannel(username);
        res.send({ profile: channel });
      } catch (error) {
        console.log("Could not get user channel");
      }
    }
  }
);

usersRouter.get(
  "/myprofile/post/:channelid",
  requireUser,
  check("channelid")
    .not()
    .isEmpty()
    .isNumeric()
    .withMessage("Not a valid value")
    .trim()
    .escape(),
  async (req, res, next) => {
    const { username } = req.user;
    const { channelid } = req.params;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .send({ name: "Validation Error", message: errors.array()[0].msg });
    } else {
      try {
        const uploads = await getPostByChannelID(channelid);
        res.send({ channelUploads: uploads });
      } catch (error) {
        console.log("Could not get user post");
      }
    }
  }
);

usersRouter.put(
  "/myprofile/update/posters/:channelname",
  cors(),
  profilePosterUpdate,
  requireUser,
  check("channelname").not().isEmpty().trim().escape(),
  async (req, res, next) => {
    const { channelname } = req.params;
    const cloudfront = "https://drotje36jteo8.cloudfront.net";
    const pic2 = req.file;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send(errors.array());
    } else {
      if (
        req.file.mimetype === "image/jpeg" ||
        req.file.mimetype === "image/png" ||
        req.file.mimetype === "image/jpg" ||
        req.file.mimetype === "image/gif"
      ) {
        try {
          const result1 = await uploadThumbnails(pic2);
          const updateData = {
            slider_pic1: cloudfront + "/" + result1.Key,
          };

          const updatedchannel = await updatePosters(channelname, updateData);
          res.send({ channel: updatedchannel });
        } catch (error) {
          console.error("Could not update user profile", error);
          next(error);
        }
      } else {
        return res.status(400).send({
          name: "Invalid file type or no file found",
          message: "Invalid file type or no file found",
        });
      }
    }
  }
);

usersRouter.put(
  "/myprofile/update/avatar/:channelname",
  cors(),
  profileAvatarUpdate,
  requireUser,
  check("channelname").not().isEmpty().trim().escape(),
  async (req, res, next) => {
    const { channelname } = req.params;
    const channel_name = channelname;
    const commentorName = channelname;
    const cloudfront = "https://drotje36jteo8.cloudfront.net";
    const pic1 = req.file;

    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send(errors.array());
    } else {
      if (
        req.file.mimetype === "image/jpeg" ||
        req.file.mimetype === "image/png" ||
        req.file.mimetype === "image/jpg" ||
        req.file.mimetype === "image/gif"
      ) {
        try {
          const result = await uploadThumbnails(pic1);
          const updatedAvi = {
            profile_avatar: cloudfront + "/" + result.Key,
          };
          const updateChannelPic = {
            channelpic: cloudfront + "/" + result.Key,
          };

          const updateCommentPicture = {
            commentorpic: cloudfront + "/" + result.Key,
          };
          const updatedchannel = await updateAvatar(
            channelname,
            updatedAvi,
            updateChannelPic
          );
          const updatedPic = await updateUploadsPicture(
            channel_name,
            updateChannelPic
          );
          const updateCommentphoto = await updateCommentsPic(
            commentorName,
            updateCommentPicture
          );
          res.send({ channel: updatedchannel });
        } catch (error) {
          console.error("Could not update user profile", error);
          next(error);
        }
      } else {
        return res.status(400).send({
          name: "Invalid file type or no file found",
          message: "Invalid file type or no file found",
        });
      }
    }
  }
);

usersRouter.get(
  "/channel/:channelid",
  requireUser,
  check("channelid")
    .not()
    .isEmpty()
    .isNumeric()
    .withMessage("Not a valid value")
    .trim()
    .escape(),
  async (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .send({ name: "Validation Error", message: errors.array()[0].msg });
    } else {
      try {
        const { channelid } = req.params;
        const userChannel = await getUserChannelByChannelID(channelid);
        res.send({ channel: userChannel });
      } catch (error) {
        return res.status(400).send({
          name: "Could not get user channel",
          message: "Could not get user channel",
        });
      }
    }
  }
);

usersRouter.post(
  "/subscribe/:channelname",
  requireUser,
  check("userSubed").not().isEmpty().trim().escape(),
  async (req, res, next) => {
    const userSubed = req.body.userSubed;
    const channelID = req.body.channelID;
    const channel_avi = req.body.channel_avi;
    const channel = req.body.channel;
    const subscriber_count = req.body.subscriber_count;
    const { channelname } = req.params;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .send({ name: "Validation Error", message: errors.array()[0].msg });
    } else {
      try {
        const subedData = {
          userSubed: userSubed,
          channelID: channelID,
          channel: channel,
          channel_avi: channel_avi,
        };
        const mySubs = await createSubs(subedData);
        const userSubs = await updateChannelSubs(channelname);
        res.send({ mySubs: mySubs });
      } catch (error) {
        console.log(error);
        next({
          name: "ErrorSettiingUserSub",
          message: "Could not sub to this channel",
        });
      }
    }
  }
);

usersRouter.delete(
  "/unsubscribe/:channelname/:userid",
  requireUser,
  check("channelname").not().isEmpty().trim().escape(),
  check("userid")
    .not()
    .isEmpty()
    .isNumeric()
    .withMessage("Not a valid value")
    .trim()
    .escape(),
  async (req, res, next) => {
    const { channelname, userid } = req.params;
    const channel = channelname;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .send({ name: "Validation Error", message: errors.array()[0].msg });
    } else {
      try {
        const myunSubs = await removeSubs(userid, channel);
        const userunSubs = await removeChannelSub(channelname);
        res.send({ removedSub: myunSubs });
      } catch (error) {
        console.log(error);
        next({
          name: "ErrorSettiingUserUnSub",
          message: "Could not unsub to this channel",
        });
      }
    }
  }
);

usersRouter.get(
  "/substatus/:userid/:channelID",
  requireUser,
  check("userid")
    .not()
    .isEmpty()
    .isNumeric()
    .withMessage("Not a valid value")
    .trim()
    .escape(),
  check("channelID")
    .not()
    .isEmpty()
    .isNumeric()
    .withMessage("Not a valid value")
    .trim()
    .escape(),
  async (req, res, next) => {
    const { userid, channelID } = req.params;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .send({ name: "Validation Error", message: errors.array()[0].msg });
    } else {
      try {
        const subStat = await getUserStatSubForChannel(userid, channelID);
        res.send({ subedChannel: subStat });
      } catch (error) {
        console.log("Oops, could not determine sub status", error);
        next({
          name: "ErrorGettingSubsStatus",
          message: "Could set Subs status",
        });
      }
    }
  }
);

usersRouter.get(
  "/getChannel/:channelName",
  requireUser,
  check("userSubed").not().isEmpty().trim().escape(),
  async (req, res, next) => {
    const { channelName } = req.params;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .send({ name: "Validation Error", message: errors.array()[0].msg });
    } else {
      try {
        const channel = await getChannelByName(channelName);
        res.send({ channels: channel });
      } catch (error) {
        console.log("Oops, could not get channel", error);
        next({ name: "ErrorGettingChannel", message: "Could get channel" });
      }
    }
  }
);

usersRouter.get("/password-reset/:id/:token", async (req, res, next) => {
  const { id, token } = req.params;
  try {
    const _user2 = await getUserById(id);
    const payload = jwt.verify(token, JWT_SECRET_RESET);
    res.set(
      "Content-Security-Policy",
      "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'"
    );
    res.sendFile(path.join(__dirname, "../public/password-reset.html"));
  } catch (error) {
    console.log(error);
    res.sendFile(path.join(__dirname, "../public/password-reset-link.html"));
  }
});

usersRouter.post(
  "/password-reset/:id/:token",
  check("id")
    .not()
    .isEmpty()
    .isNumeric()
    .withMessage("Not a valid value")
    .trim()
    .escape(),
  check("password")
    .not()
    .isEmpty()
    .trim()
    .escape()
    .isLength({ min: 8 })
    .withMessage("Password does not meet the min requirements of 8 characters")
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, "i")
    .withMessage(
      "Password must include one lowercase character, one uppercase character, a number, and a special character."
    ),
  check("confirmpassword")
    .not()
    .isEmpty()
    .trim()
    .escape()
    .isLength({ min: 8 })
    .withMessage("Password does not meet the min requirements of 8 characters")
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, "i")
    .withMessage(
      "Password must include one lowercase character, one uppercase character, a number, and a special character."
    ),
  async (req, res, next) => {
    const { id, token } = req.params;
    const { password, confirmpassword } = req.body;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .send({ name: "Validation Error", message: errors.array()[0].msg });
    } else {
      try {
        const updatedPassword = {
          password: password,
          confirmpassword: confirmpassword,
        };
        if (password != confirmpassword) {
          next({
            error: "PasswordsMatchError",
            message: "Your password and confirmed password does not match",
          });
          return false;
        }
        const updatingUser = await updatePassword(id, updatedPassword);
        res.sendFile(
          path.join(__dirname, "../public/password-reset-success.html")
        );
      } catch (error) {
        console.log("Oops, could not update user password", error);
        res.sendFile(
          path.join(__dirname, "../public/password-reset-unsucessful.html")
        );
        next(error);
      }
    }
  }
);

usersRouter.patch(
  "/vendor-subscription-update/:id",
  requireUser,
  check("id")
    .not()
    .isEmpty()
    .isNumeric()
    .withMessage("Not a valid value")
    .trim()
    .escape(),
  async (req, res, next) => {
    const { id } = req.params;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .send({ name: "Validation Error", message: errors.array()[0].msg });
    } else {
      try {
        const updatingVendor = await updateVendorSubscription(id);
        res.send({ updatedSubscription: updatingVendor });
      } catch (error) {
        console.log("Oops, could not update vendor subscription status", error);
      }
    }
  }
);

usersRouter.patch(
  "/user-subscription-update/:id",
  requireUser,
  check("id")
    .not()
    .isEmpty()
    .isNumeric()
    .withMessage("Not a valid value")
    .trim()
    .escape(),
  async (req, res, next) => {
    const { id } = req.params;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .send({ name: "Validation Error", message: errors.array()[0].msg });
    } else {
      try {
        const updatingUser = await updateUserSubscription(id);
        res.send({ updatedSubscription: updatingUser });
      } catch (error) {
        console.log("Oops, could not update user subscription status", error);
      }
    }
  }
);

usersRouter.get(
  "/user-sub-verified/:id",
  cors(),
  requireUser,
  check("id")
    .not()
    .isEmpty()
    .isNumeric()
    .withMessage("Not a valid value")
    .trim()
    .escape(),
  async (req, res, next) => {
    const { id } = req.params;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .send({ name: "Validation Error", message: errors.array()[0].msg });
    } else {
      try {
        const checkVerified = await verifyUserSubscriptionStatus(id);
        res.send({ user: checkVerified });
      } catch (error) {
        console.log("Oops, could not check verification of vendor", error);
      }
    }
  }
);

usersRouter.patch(
  "/updatechannelsub/:id",
  cors(),
  requireUser,
  check("id")
    .not()
    .isEmpty()
    .isNumeric()
    .withMessage("Not a valid value")
    .trim()
    .escape(),
  async (req, res, next) => {
    const { id } = req.params;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .send({ name: "Validation Error", message: errors.array()[0].msg });
    } else {
      try {
        const channelsubstatus = await updateChannelSubsStatus(id);
        res.send({ user: channelsubstatus });
      } catch (error) {
        console.log("Oops, could not check verification of vendor", error);
      }
    }
  }
);

usersRouter.get(
  "/vendor-verified/:vendorid",
  cors(),
  requireUser,
  check("id")
    .not()
    .isEmpty()
    .isNumeric()
    .withMessage("Not a valid value")
    .trim()
    .escape(),
  async (req, res, next) => {
    const { vendorid } = req.params;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .send({ name: "Validation Error", message: errors.array()[0].msg });
    } else {
      try {
        const checkVerified = await verifiedVendors(vendorid);
        res.send({ vendor: checkVerified });
      } catch (error) {
        console.log("Oops, could not check verification of vendor", error);
      }
    }
  }
);

module.exports = usersRouter;
