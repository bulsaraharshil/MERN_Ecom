require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

//My Routes defination with path
const authRoutes = require("./routes/auth.js");
const userRoutes = require("./routes/user.js");

//mongoose.connect is the method to connect to mongodb(so this is DBConnection)
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("DB CONNECTED");
  });

//Middlewears(app.use() is to use something from express)
app.use(bodyParser.json()); //is used to load middlewear function(here bodyParser and it gives us properties like req.body, req.email, req.name, etc..)
app.use(cookieParser()); //is used to load middlewear function(here cookieParser) 'cookieParser' is used to put or delete some values in the cookies
app.use(cors()); //is used to load middlewear function(here cors)

//My Routes
app.use("/api", authRoutes);
app.use("/api", userRoutes);

//PORT
const port = process.env.PORT || 9000;

//Starting a Server
app.listen(port, () => {
  console.log(`app is running at ${port}`);
});
