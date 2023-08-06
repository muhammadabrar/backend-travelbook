const jwt = require("jsonwebtoken");
require("dotenv").config();
let Users = require("../models/users");
const config = process.env;

const verifyToken = async (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.params.token || req.headers["Authorization"];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    var decoded = jwt.verify(token, config.TOKEN_KEY);
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  const user = await Users.findOne({ _id: decoded.user_id, token: token })

  if(!user){
    return res.status(401).send("Invalid Token");
  }
  // console.log(user);
  req.user = user;
  return next();
};

module.exports = verifyToken;
