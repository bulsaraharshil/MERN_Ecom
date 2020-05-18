const express = require("express");

const app = express(); //using express

const port = 9000;

const admin = (req, res) => {
  return res.send("This is admin dashboard");
};

app.get("/", (req, res) => {
  return res.send("Home Page");
});

// app.get("/signout",(req,res)=>{
//     return res.send("You are signed out");
// });

// app.get("/hitesh",(req,res)=>{
//     return res.send("Hitesh uses instagram");
// });
const isloggedIn = (req, res, next) => {
  //this is a middlewear(anything which comes with 'next' is a middlewear)
  console.log("isloggedIn is running");
  next(); // pass control to the next handler
};

const isAdmin = (req, res, next) => {
  //this is a middlewear(anything which comes with 'next' is a middlewear)
  console.log("isAdmin is running");
  next(); // pass control to the next handler
};

app.get("/admin", isloggedIn, isAdmin, admin);

app.get("/login", (req, res) => {
  return res.send("You are visiting login route");
});

app.get("/signup", (req, res) => {
  return res.send("This is signup route");
});

app.listen(port, () => {
  console.log("Server is up and running...");
});

// const port = 3000

// app.get('/', (req, res) => res.send('Hello World!'))

// app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
