const express = require("express");
const mailRouter = express.Router();
const nodemailer = require("nodemailer");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { JWT_SECRET_RESET } = process.env;
const { RESET_PASSWORD, SEVER_URL } = process.env;
const { check, validationResult } = require('express-validator');
const path = require('path');
const { Mailer_Password } = process.env;
const hbs = require("nodemailer-express-handlebars")
mailRouter.use(cors());


mailRouter.get("/", async (req, res) => {
res.send({message: "Email Route, Welcome"})
})

const {
  getUserByUsername,
  getUserByEmail,
} = require("../db");


//Welecome Email

mailRouter.post("/welcome/:email", check('email').not().isEmpty().isEmail().withMessage('Not a valid email').normalizeEmail(), async (req, res) => {
   let { email } = req.params;
  let errors = validationResult(req);
     if (!errors.isEmpty()) {
   return res.status(400).send({name: 'Validation Error', message: errors.array()[0].msg});
}else{
  let transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    service: 'outlook', 
    port: 587,
    secure: false, 
    auth: {
      user: 'admin@letsfari.com', 
      pass: process.env.Mailer_Password, 
    },
  });


let handlebarOptions = {
  viewEngine: {
    extName: ".handlebars",
    partialsDir: path.resolve(__dirname, "../email-templates"),
    defaultLayout: false,
  },
  viewPath: path.resolve(__dirname, "../email-templates"),
  extName: ".handlebars",
};
  
  transporter.use(
  "compile",
  hbs(handlebarOptions)
);

  let mailOptions = {
    from:'"Fari" <admin@letsfari.com>', 
    to: email, 
    subject:"Welcome to Fari!", 
    template:'welcome',
  };

 transporter.sendMail(mailOptions, (error, info) => {
 if (error){
 return console.log(error);
 }else {
    res.send({
      name: "success",
      message: "Check Your Email to Confirm Your Account",
    });
    console.log("Email sent: " + info.response);
  }
  
 })
}
});


//ForgotPassword

mailRouter.post("/forgotpassword/:email", check('email').not().isEmpty().isEmail().withMessage('Not a valid email').normalizeEmail(), async (req, res, next) => {
  let { email, username } = req.params;
let errors = validationResult(req);
     if (!errors.isEmpty()) {
   return res.status(400).send({name: 'Validation Error', message: errors.array()[0].msg});
}else{
  try{
    const _email = await getUserByEmail(email);
    if (!_email) {
      next({
        error: "EmailDoesNotExistsError",
        message: "We do not have a user with that email.",
      });
      return false;
    }else if(_email){
   
  const token = jwt.sign({id:_email.id}, process.env.JWT_SECRET_RESET, {expiresIn: '15m'});

      
  let transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    service: 'outlook', 
    port: 587,
    secure: false, 
    auth: {
      user: 'admin@letsfari.com', 
      pass: process.env.Mailer_Password, 
    },
  });


let handlebarOptions = {
  viewEngine: {
    extName: ".handlebars",
    partialsDir: path.resolve(__dirname, "../email-templates"),
    defaultLayout: false,
  },
  viewPath: path.resolve(__dirname, "../email-templates"),
  extName: ".handlebars",
};

transporter.use(
  "compile",
  hbs(handlebarOptions)
);

  let mailOptions = {
    from:'"Fari" <admin@letsfari.com>', 
    to: email, 
    subject:"Fari - Password Reset Request", 
    template:'forgotpassword',
     context: {
          url: `${process.env.SEVER_URL}/users/password-reset/${_email.id}/${token}`,
          name: _email.username
        }
  };

 
 transporter.sendMail(mailOptions, (error, info) => {
 if (error){
 return console.log(error);
 }else {
    res.send({
      name: "success",
      message: "An email link has been sent to reset your password",
    });
    console.log("Email sent: " + info.response);
  }
 })
       
       res.send({
        success: "EmailSent",
        message: "An email has been sent.",
        name: "UserFound",
        _email,
        token, 
      }) 
    }
   }catch(error){
    console.log(error)
 };
}
});

//New Message

mailRouter.post("/newmessage/:email", check('email').not().isEmpty().isEmail().withMessage('Not a valid email').normalizeEmail(), async (req, res) => {
   let { email } = req.params;
  let errors = validationResult(req);
     if (!errors.isEmpty()) {
   return res.status(400).send({name: 'Validation Error', message: errors.array()[0].msg});
}else{
  const _email = await getUserByEmail(email);
  let transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    service: 'outlook', 
    port: 587,
    secure: false, 
    auth: {
      user: 'notifications@letsfari.com', 
      pass: process.env.Mailer_Password, 
    },
  });


let handlebarOptions = {
  viewEngine: {
    extName: ".handlebars",
    partialsDir: path.resolve(__dirname, "../email-templates"),
    defaultLayout: false,
  },
  viewPath: path.resolve(__dirname, "../email-templates"),
  extName: ".handlebars",
};
  
  transporter.use(
  "compile",
  hbs(handlebarOptions)
);

  let mailOptions = {
    from:'"Fari" <notifications@letsfari.com>', 
    to: email, 
    subject:"Fari - New Message", 
    template:'newmessage',
    context: {
     name: _email.username
    }
  };

 transporter.sendMail(mailOptions, (error, info) => {
 if (error){
 return console.log(error);
 }else {
    res.send({
      name: "success",
      message: "Check Your Messages",
    });
    console.log("Email sent: " + info.response);
  }
  
 })
}
});


//New Shop Purchase

mailRouter.post("/newsale/marketplace/:email", check('email').not().isEmpty().isEmail().withMessage('Not a valid email').normalizeEmail(), async (req, res) => {
   let { email } = req.params;
  let errors = validationResult(req);
     if (!errors.isEmpty()) {
   return res.status(400).send({name: 'Validation Error', message: errors.array()[0].msg});
}else{
  let transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    service: 'outlook', 
    port: 587,
    secure: false, 
    auth: {
      user: 'notifications@letsfari.com', 
      pass: process.env.Mailer_Password, 
    },
  });


let handlebarOptions = {
  viewEngine: {
    extName: ".handlebars",
    partialsDir: path.resolve(__dirname, "../email-templates"),
    defaultLayout: false,
  },
  viewPath: path.resolve(__dirname, "../email-templates"),
  extName: ".handlebars",
};
  
  transporter.use(
  "compile",
  hbs(handlebarOptions)
);

  let mailOptions = {
    from:'"Fari" <notifications@letsfari.com>', 
    to: email, 
    subject:"Fari - New Sale", 
    template:'newmarketplacesale',
  };

 transporter.sendMail(mailOptions, (error, info) => {
 if (error){
 return console.log(error);
 }else {
    res.send({
      name: "success",
      message: "You've made a sale in the marketplace",
    });
    console.log("Email sent: " + info.response);
  }
  
 })
}
});


//New Movie Rental Sale

mailRouter.post("/newsale/movierental/:email", check('email').not().isEmpty().isEmail().withMessage('Not a valid email').normalizeEmail(), async (req, res) => {
   let { email } = req.params;
  let errors = validationResult(req);
     if (!errors.isEmpty()) {
   return res.status(400).send({name: 'Validation Error', message: errors.array()[0].msg});
}else{
  let transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    service: 'outlook', 
    port: 587,
    secure: false, 
    auth: {
      user: 'admin@letsfari.com', 
      pass: process.env.Mailer_Password, 
    },
  });


let handlebarOptions = {
  viewEngine: {
    extName: ".handlebars",
    partialsDir: path.resolve(__dirname, "../email-templates"),
    defaultLayout: false,
  },
  viewPath: path.resolve(__dirname, "../email-templates"),
  extName: ".handlebars",
};
  
  transporter.use(
  "compile",
  hbs(handlebarOptions)
);

  let mailOptions = {
    from:'"Fari" <admin@letsfari.com>', 
    to: email, 
    subject:"Fari - New Sale", 
    template:'newmovierentalsale',
  };

 transporter.sendMail(mailOptions, (error, info) => {
 if (error){
 return console.log(error);
 }else {
    res.send({
      name: "success",
      message: "Someone bought one of your movies.",
    });
    console.log("Email sent: " + info.response);
  }
  
 })
}
});






module.exports = mailRouter;
