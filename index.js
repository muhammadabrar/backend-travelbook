const mongoose = require("mongoose");
const express = require("express");
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
var cors = require("cors");
// app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(cors());
// inside public directory.
app.use("/public", express.static("public"));
app.use(bodyParser.json());

//database=============================================================
const uri = "mongodb+srv://Asquare:Locker143@cluster0.7y43i.mongodb.net/";
mongoose.connect(uri, {});
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});









//database=============================================================

//routers================================================

//users apis================================================
let userRoutes = require("./routes/users");
app.use("/user", userRoutes);
//posts apis================================================
let postsRoutes = require("./routes/posts");
app.use("/post", postsRoutes);
let chatsRoutes = require("./routes/chats");

app.use("/chat", chatsRoutes);

app.listen(process.env.port || 5000);

console.log(
  "Web Server is listening at port http://localhost:" +
    (process.env.port || 5000)
);
