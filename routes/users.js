const router = require("express").Router();
let Users = require("../models/users");
let Posts = require("../models/Posts");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
let nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const Follows = require("../models/follows");
require("dotenv").config();
//! Use of Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/dps");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });
router.route("/").get(async (req, res) => {
  Users.find()
    .then((Posts) => res.json(Posts))
    .catch((err) => res.status(400).json("Error: " + err));
});

//////////////////////////////////////
///////////delete by id users////////////////
router.route("/:id").delete((req, res) => {
  Users.findByIdAndDelete(req.params.id)
    .then(() => res.json("user deleted."))
    .catch((err) => res.status(400).json("Error: " + err));
});

//////////////////////////////////////
///////////post Users////////////////
router.route("/").post(async (req, res) => {
  try {
    // Get user input
    var code = Math.floor(1000 + Math.random() * 9000);

    const { name, email, password } = req.body;

    // Validate user input
    if (!(email && password && name)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await Users.findOne({ email });

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await Users.create({
      name,
      status: false,
      code,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
      NoFollowers: 0,
    });

    // const mailData = {
    //   from: "smartsafedrivers@gmail.com",
    //   to: email,
    //   subject: `Your verification Link from travel book`,
    //   html: `<div style='text-align: center'>Please Verify your account <a href="http://localhost:5000/user/verify/${user._id}/${code}">Click To verify</a></div>`,
    // };
    // await transporter.sendMail(mailData);
    // return new user
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
  }
});

////////////////////////////////////////////////
///////verification/////////////////
router.get("/verify/:id/:code", async (req, res) => {
  try {
    const user = await Users.findOne({
      _id: req.params.id,
      code: req.params.code,
    });
    if (!user) {
      return res.status(400).send("Invalid link");
    }

    await Users.updateOne(
      { _id: user._id },
      {
        $set: {
          code: "",
          status: true,
        },
      }
    );
    res.send("email verified sucessfully");
  } catch (error) {
    console.log(error);
    res.status(400).send({ msg: "An error occured", error });
  }
});

////////////////////////////////////////////////
///////login/////////////////
router.route("/login").post(async (req, res) => {
  // Our login logic starts here
  try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }

    // Validate if user exist in our database
    let user = await Users.findOne({ email });

    if (!user) {
      res.status(401).send("user not found");
    }

    const bcryptPass = await bcrypt.compare(password, user.password);
    if (user && bcryptPass) {
      // Create token
      const token = jwt.sign({ user_id: user._id }, process.env.TOKEN_KEY);

      // save user token
      const updateuser = await Users.updateOne(
        { _id: user._id },
        {
          $set: {
            token,
          },
        }
      );

      // user
      res.status(200).json({ user, token });
    }
    res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
  // Our register logic ends here
});

////////////////////////////////////////////////
///////profile/////////////////
router.route("/profile/:id").get(async (req, res) => {
  try {
    const user = await Users.findOne({ _id: req.params.id });
    const posts = await Posts.find({ user_id: req.params.id });
    const Followers = await Follows.find({
      Follow: req.params.id,
    }).count();
    const Followings = await Follows.find({
      Followby: req.params.id,
    }).count();

    res.json({ user, posts, Followers, Followings });
  } catch (error) {
    res.status(400).json("Error: " + error);
  }
});

////////////////////////////////////////////////
///////follow/////////////////
router.route("/follow").post(auth, async (req, res) => {
  try {
    const data = req.body;

    const user = req.user;

    if (user._id != data.Followby) {
      return res.status(400).json("invalid user");
    }
    const Isvalidate = await Follows.findOne({
      Follow: data.Follow,
      Followby: data.Followby,
    });
    if (Isvalidate) {
      return res.status(400).json("you already following this user");
    }
    const following = await Follows.create({
      Follow: data.Follow,
      Followby: data.Followby,
    });

    res.json(following);
  } catch (error) {
    res.status(400).json("Error: " + error);
  }
});
////////////////////////////////////////////////
///////unfollow/////////////////
router.route("/unFollow/").post(auth, async (req, res) => {
  try {
    const data = req.body;
    const id = data.id;
    const user = req.user;

    if (user._id != data.Followby) {
      return res.status(400).json("invalid user");
    }

    const follow = await Follows.findByIdAndDelete(id);
    res.json(follow);
  } catch (error) {
    res.status(400).json("Error: " + error);
  }
});


////////////////////////////////////////////////
///////unfollow/////////////////
router.route("/unFollow/:id").delete( async (req, res) => {
  try {
    const id = req.params.id

    const follow = await Follows.findByIdAndDelete(id);
    res.json(follow);
  } catch (error) {
    res.status(400).json("Error: " + error);
  }
});
///////follow/////////////////
router.route("/follows").get(async (req, res) => {
  try {
    const follow = await Follows.find();
    res.json(follow);
  } catch (error) {
    res.status(400).json("Error: " + error);
  }
});
///////follow/////////////////
router.route("/IsFollow/:Follow/:Followby").get(async (req, res) => {
  try {
    const { Follow, Followby } = req.params;

    const follow = await Follows.findOne({
      Follow,
      Followby,
    });
    res.json(follow);
  } catch (error) {
    res.status(400).json("Error: " + error);
  }
});



///////followings/////////////////
router.route("/followings/:id").get(async (req, res) => {
  try {
    const follow = await Follows.find({
      Followby: req.params.id,
    });
    let Followings = [];
    for (let i = 0; i < follow.length; i++) {
      const Following = await Users.findOne({
        _id: follow[i]?.Follow,
      });
      Followings.push({ id: follow[i]._id, name: Following.name, Image: Following.Image, Follower_id: Following._id });
      // console.log(Following);
    }
    res.json(Followings);
  } catch (error) {
    res.status(400).json("Error: " + error);
  }
});

///////followings/////////////////
router.route("/followers/:id").get(async (req, res) => {
  try {
    const follow = await Follows.find({
      Follow: req.params.id,
    });
    let Followers = [];
    for (let i = 0; i < follow.length; i++) {
      const Follower = await Users.findOne({
        _id: follow[i]?.Followby,
      });
      Followers.push({ id: follow[i]._id, name: Follower.name, Image: Follower.Image, Follower_id: Follower._id });
      // console.log(Following);
    }
    res.json(Followers);
  } catch (error) {
    res.status(400).json("Error: " + error);
  }
});
////////////////////////////////////////////////
///////simple/////////////////
router.route("/profileEdit/:id").put(auth, async (req, res) => {
  try {
    const user = req.user;
      const data = req.body;
      const { id } = req.params;
      if (user._id != id) {
        return res.status(400).json("invalid user");
      }
      const updateuser = await Users.updateOne(
        { _id: id },
        {
          $set: data,
        }
      );
      res.json(updateuser);
    res.json(Users);
  } catch (error) {
    res.status(400).json("Error: " + error);
  }
});

////////////////////////////////////////////////
///////upload profile/////////////////
router
  .route("/:id/:token")
  .put(auth, upload.single("file"), async (req, res) => {
    try {
      const user = req.user;
      const data = JSON.parse(req.body.data);
      const Image = data.Image;
      const { id } = req.params;
      if (user._id != id) {
        return res.status(400).json("invalid user");
      }
      const updateuser = await Users.updateOne(
        { _id: id },
        {
          $set: {
            Image,
          },
        }
      );
      res.json(updateuser);
    } catch (error) {
      res.status(400).json("Error: " + error);
    }
  });

module.exports = router;
