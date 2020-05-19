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
const categoryRoutes = require("./routes/category.js");
const productRoutes = require("./routes/product");
const orderRoutes = require("./routes/order");
const paymentBRoutes = require("./routes/paymentBRoutes");

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

//Middlewears
app.use(bodyParser.json()); //is used to load middlewear function(here bodyParser)
app.use(cookieParser()); //is used to load middlewear function(here cookieParser) 'cookieParser' is used to put or delete some values in the cookies
app.use(cors()); //is used to load middlewear function(here cors)

//My Routes
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);
app.use("/api", orderRoutes);
app.use("/api", paymentBRoutes);
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static(__dirname + "/../client/build"));

  app.get("*", (req, res) => {
    res.sendFile(
      path.resolve(__dirname, "..", "client", "build", "index.html")
    );
  });
}

//PORT
const port = process.env.PORT || 9000;

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

//Starting a Server
app.listen(port, () => {
  console.log(`app is running at ${port}`);
});
