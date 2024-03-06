const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const fs = require("fs");
const https = require("https");

const feedRoute = require("./routes/feed");
const authRoute = require("./routes/auth");

const fileStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    callback(
      null,
      Math.floor(Math.random() * 1000000 + 1) + "-" + file.originalname
    );
  },
});

const fileFilter = (req, file, callback) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    callback(null, true);
  }
  callback(null, false);
};

const app = express();

const privateKey = fs.readFileSync("server.key");
const certificate = fs.readFileSync("server.cert");

app.use(helmet());
app.use(compression());

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);
app.use(morgan("combined", { stream: accessLogStream }));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/auth", authRoute);
app.use("/feed", feedRoute);

app.use("/images", express.static(path.join(__dirname, "images")));

app.use((error, req, res, next) => {
  res.sendStatus(error.statusCode);
  res.end();
});

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster21.g76vbhd.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority&appName=Cluster21`
  )
  .then((result) => {
    // const server = https
    //   .createServer({ key: privateKey, cert: certificate }, app)
    //   .listen(process.env.PORT || 3000);
    const server = app.listen(process.env.PORT || 3000);
    const io = require("./socket").init(server);
    io.on("connection", (socket) => {
      console.log("client connected");
    });
  })
  .catch((err) => console.log(err));
