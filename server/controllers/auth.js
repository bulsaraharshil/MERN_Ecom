//same file name should be given to both route and controller as controller will control routes
const User = require("../models/user");
const { check, validationResult } = require("express-validator");
var jwt = require("jsonwebtoken");
var expressJwt = require("express-jwt");

exports.signup = (req, res) => {
  const errors = validationResult(req); //defining errrors as validationResult binds errors with req so we define errors= validationResult(req)

  if (!errors.isEmpty()) {				//all this thing is mentioned in documentation of express-validator
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }

  const user = new User(req.body); //"req.body" stores all the info passed in request body for further use.
  //It is the info which we are passing in postman in curly braces {} in the body raw data.
  //For parsing the req we are using bodyParser.json() in app.js, also we are parsing the data in JSON format
  user.save((err, user) => {
    console.log(err);
    if (err) {
      return res.status(400).json({
        err: "NOT able to save user in DB",
      });
    } else {
      res.json({
        name: user.name,
        email: user.email,
        id: user._id,
      });
    }
  });
};
// exports.signup = (req, res) => {
//   console.log("REQ BODY", req.body); //body parser handler
//   res.json({
//     message: "Signup route works!!!",
//   });
// };

exports.signin = (req, res) => {
  const errors = validationResult(req);
  const { email, password } = req.body; //extracting(destructuring of data) of email & password from req.body

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg, //to display error message
      //to show on which field error is use "err:errors.array()[0].param"
    });
  }

  User.findOne({ email }, (err, user) => {		    //it will find one user based on email address
    if (err || !user) {
      return res.status(400).json({
        error: "USER email does not exists",
      });
    }

    if (!user.authenticate(password)) {			// if authentication fails then it will execute this block, here authenticate method comes from user model where we have declared it based on password
      return res.status(401).json({
        error: "Email and password do not match",
      });
    }

    //create token
    const token = jwt.sign({ _id: user._id }, process.env.SECRET);
    //put token in cookie
    res.cookie("token", token, { expire: new Date() + 9999 }); //expire is used to define for how much time token should remain in cookie (this all is mentioned in documentation of express res.cookie)


    //send response to front end(this is important because it will give response to us in our postman including token and user object with id,name,email & role)
    const { _id, name, email, role } = user;
    return res.json( token, {user: { _id, name, email, role } });
  });
};

exports.signout = (req, res) => {
  res.clearCookie("token"); //clear the cookie whose name is 'token'
  res.json({
    message: "User signout successfully",
  });
};

//protected routes
exports.isSignedIn = expressJwt({
  //to check if user is signed in
  secret: process.env.SECRET,
  userProperty: "auth", //auth holds the id and it is same id which is given to us while signin in postman response
});

//custom middlewares
exports.isAuthenticated = (req, res, next) => {
  let checker = req.profile && req.auth && req.profile._id == req.auth._id; 
  //req.profile contains the info of authenticated user when we secure the route with JWT. If the user is not authenticated then req.profile is an empty object

  //checker will check if user is signedin or not(we are setting profile in front end so we use here it as req.profile)

  if (!checker) {
    return res.status(403).json({
      error: "ACCESS DENIED",
    });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
    return res.status(403).json({
      error: "You are not ADMIN, Access denied",
    });
  }
  next();
};
