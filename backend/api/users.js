const express = require("express");
const usersRouter = express.Router();
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const { JWT_SECRET_RESET } = process.env;
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

const profilePosterUpdate = upload.single("channel-poster");

const profileAvatarUpdate = upload.single("avatar");


const cors = require("cors");
usersRouter.use(cors());

const {
  createUser,
  getUser,
  addLocation,
  addBio,	
  getUserByUsername,
  getUserByEmail,
  getAllUsers,
  getAllChannels,
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
  getJustVendors,
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

usersRouter.get("/", requireUser, async (req, res, next) => {
  try {
    const allUsers = await getAllUsers();
    res.send({
      users: allUsers,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

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


usersRouter.get("/usernames/:username", check('username').not().isEmpty().trim().escape(), async (req, res, next) => {
  const { username } = req.params;
  let errors = validationResult(req);
     if (!errors.isEmpty()) {
   return res.status(400).send({name: 'Validation Error', message: errors.array()[0].msg});
}else{
  try {
    const usersName = await getUsersByUsername(username);
    res.send({
      users: usersName,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
}	

});


usersRouter.get("/myprofile", requireUser, async (req, res, next) => {
  try {
    const { username, id } = req.user;
    const me = await getUserProfile(username);  
    res.send({ profile: me });
  } catch (error) {
    console.log("Could not get user channel", error);
  }
 
});


usersRouter.patch('/addbio/:id', requireUser, check('bio').trim().escape(), check('id').not().isEmpty().isNumeric().withMessage('Not a valid value').trim().escape(), async(req, res, next) => {
const { id } = req.params;
const bio = req.body.bio; 	
let errors = validationResult(req);
     if (!errors.isEmpty()) {
   return res.status(400).send({name: 'Validation Error', message: errors.array()[0].msg});
}else{
  try {
    const data = {
    bio: bio,
    };
    const biography = await addBio(id, data);
    res.send({ user: biography});
  } catch(error) {
    console.log(error)
  next({ name: "ErrorSettiingBio", message: "Could not add biography" });
  }
}


})

usersRouter.patch('/addlocation/:id', requireUser, check('location').trim().escape(), check('id').not().isEmpty().isNumeric().withMessage('Not a valid value').trim().escape(), async(req, res, next) => {
const { id } = req.params;
const location = req.body.location; 	
let errors = validationResult(req);
     if (!errors.isEmpty()) {
   return res.status(400).send({name: 'Validation Error', message: errors.array()[0].msg});
}else{
  try {
    const data = {
    location: location,
    };
    const userLocation = await addLocation(id, data);
    res.send({ user: userLocation});
  } catch(error) {
    console.log(error)
  next({ name: "ErrorSettiingLocation", message: "Could not add location" });
  }
}

})





usersRouter.get(
  "/myprofile/channel/:username",
  requireUser,
   check('username').not().isEmpty().trim().escape(),	
  async (req, res, next) => {
  let errors = validationResult(req);
     if (!errors.isEmpty()) {
   return res.status(400).send({name: 'Validation Error', message: errors.array()[0].msg});
}else{	  
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
  "/myprofile/channel-post/:channelid",
  requireUser,
  check('channelid').not().isEmpty().isNumeric().withMessage('Not a valid value').trim().escape(),	
  async (req, res, next) => {
      const { username } = req.user;
      const { channelid } = req.params;
  let errors = validationResult(req);
     if (!errors.isEmpty()) {
   return res.status(400).send({name: 'Validation Error', message: errors.array()[0].msg});
}else{	  
    try {
      const uploads = await getPostByChannelID(channelid);
      res.send({ channelUploads: uploads });
    } catch (error) {
      console.log("Could not get user post");
    }
}
  }
);


usersRouter.get("/user-subscriptions/:userid", requireUser, check('userid').not().isEmpty().isNumeric().withMessage('Not a valid value').trim().escape(),  async (req, res, next) => {
  const { userid } = req.params;
  let errors = validationResult(req);
 if (!errors.isEmpty()) {
  return res.status(400).send({name: 'Validation Error', message: errors.array()[0].msg});
}else{ 
  try {
    const userSubs = await getUserSubs(userid);
    res.send({ mysubscriptions: userSubs});
  } catch(error){
      next({ name: "ErrorGettingUserSubs", message: "Could not get subscriptions" });
  }
}
});


usersRouter.get("/vendor-verification/:vendorid", cors(), requireUser, check('vendorid').not().isEmpty().isNumeric().withMessage('Not a valid value').trim().escape(), async (req, res, next) => {
 const { vendorid } = req.params;
 let errors = validationResult(req);  
 if (!errors.isEmpty()) {
    return res.status(400).send({name: 'Validation Error', message: errors.array()[0].msg});
}else{ 
  try {
    const checkVerified = await verifiedVendors(vendorid);
    res.send({ vendor: checkVerified });
  } catch (error) {
    console.log("Oops, could not check verification of vendor", error);
  }
}
});





module.exports = usersRouter;
