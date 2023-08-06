const router = require("express").Router();
let Users = require("../models/users");
let Chats = require("../models/chat");
const auth = require("../middleware/auth");

router.route("/").get(async (req, res) => {
  const chats = await Chats.find();
  let chat = [];
  for (let i = 0; i < chats.length; i++) {
    const chat_user = await Users.findOne({
      _id: chats[i]?.user_id,
    });
    chat.push({
      id: chats[i]._id,
      msg: chats[i].msg,
      name: chat_user.name,
      user_id: chats[i].user_id,
      date: chats[i].createdAt,


    });
  }
  res.status(200).json(chat);

  try {
  } catch (err) {
    res.status(400).json("Error: " + err);
  }
});

///////////////////////////////////////////////
///////login/////////////////
router.route("/").post(auth, async (req, res) => {
  // Our login logic starts here
  try {
    // Get user input
    const { user_id, msg } = req.body;

    const user = req.user;

    if (user._id != user_id) {
      return res.status(400).json("invalid user");
    }
    const postChat = await Chats.create({
      user_id,
      msg,
    });

    res.status(200).json(postChat);
  } catch (err) {
    res.status(400).json("Error: " + err);
  }
  // Our register logic ends here
});
module.exports = router;
