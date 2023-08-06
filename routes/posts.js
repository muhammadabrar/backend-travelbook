const router = require("express").Router();
let Posts = require("../models/Posts");
let Users = require("../models/users");
let Ratings = require("../models/Rating");
const multer = require("multer");
const auth = require("../middleware/auth");

//! Use of Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

////////////////////////////////////
///////////get by all Posts////////////////
router.route("/").get(async (req, res) => {
  try {
    let posts = [];
    const getposts = await Posts.find();

    for (let i = 0; i < getposts.length; i++) {
      const user = await Users.findOne({
        _id: getposts[i]?.user_id,
      });
      posts.push({ post: getposts[i], user: user });
    }
    res.json(posts);
  } catch (error) {
    res.status(400).json("Error: " + error);
  }
});

////////////////////////////////////
///////////post like////////////////
router.route("/like").post(auth, async (req, res) => {
  try {
    const { user_id, post_id } = req.body;
    const user = req.user;

    if (user._id != user_id) {
      return res.status(400).json("invalid user");
    }

    const likes = await Posts.findOne(
      {_id: post_id, like: {$in: [user_id] } },
    );

    if(likes){
      const unlike = await Posts.updateOne(
        { _id: post_id },
        {
          $pull: {
            like: user_id,
          },
        }
      );
      return res.json({like: false});
    }

    const like = await Posts.updateOne(
      { _id: post_id },
      {
        $push: {
          like: user_id,
        },
      }
    );
    res.json({like: true});
  } catch (error) {
    res.status(400).json("Error: " + error);
  }
});


////////////////////////////////////
///////////get by id Posts////////////////
router.route("/:slug").get(async (req, res) => {
  try {
    const post = await Posts.findOne({ slug: req.params.slug });
    const user = await Users.findOne({
      _id: post?.user_id,
    });

    res.json({ post, user });
  } catch (err) {
    res.status(400).json("Error: " + err);
  }
});
//////////////////////////////////////
///////////post Posts////////////////
router.route("/:token").post(auth, upload.single("file"), async (req, res) => {
  const data = JSON.parse(req.body.data);

  const user = req.user;

  if (user._id != data.user_id) {
    return res.status(400).json("invalid user");
  }
  const addnewPosts = new Posts(data);

  await addnewPosts
    .save()
    .then(() => res.json({ data: addnewPosts }))
    .catch((err) => res.status(400).json("Error: " + err));
});

//////////////////////////////////////
///////////post Posts////////////////
router.route("/:id").put(auth, async (req, res) => {
  const data = req.body;
  const user = req.user;
  console.log(data);
  if (user._id != data.user_id) {
    return res.status(400).json("invalid user");
  }
  try {
    await Posts.updateOne({ _id: req.params.id }, { $set: data });

    res.json("post updated!");
  } catch (error) {
    res.status(400).json("Error: " + error);
  }
});

////////////////////////////////////////////////
///////get by id Posts/////////////////
router.route("/:id").get(async (req, res) => {
  try {
    res.json(Posts);
  } catch (error) {
    res.status(400).json("Error: " + error);
  }
});

////////////////////////////////////////////////
///////delete post/////////////////
router
  .route("/deletePost/:post_id/:user_id/:token")
  .delete(auth, async (req, res) => {
    try {
      const user = req.user;
      if (user._id != req.params.user_id) {
        return res.status(400).send("sorry invalid user");
      }
      await Posts.findByIdAndDelete(req.params.post_id);
      res.json("Post deleted.");
    } catch (error) {
      res.status(400).json("Error: " + error);
    }
  });
router.route("/deletePost/:post_id").delete(async (req, res) => {
  try {
    await Posts.findByIdAndDelete(req.params.post_id);
    res.json("Post deleted.");
  } catch (error) {
    res.status(400).json("Error: " + error);
  }
});

////////////////////////////////////////////////
///////post rating /////////////////
router.route("/rating/:token").post(auth, async (req, res) => {
  try {
    const data = req.body;
    console.log(data);
    const user = req.user;
    if (user._id != data.user_id) {
      return res.status(400).send("sorry invalid user");
    }
    const addnewRatings = await Ratings.create({
      stars: data.stars,
      comment: data.comment,
      user_id: data.user_id,
      Post_id: data.Post_id,
    });
    res.json(addnewRatings);
  } catch (err) {
    res.status(400).json("Error: " + err);
  }
});

////////////////////////////////////////////////
///////get rating /////////////////
router.route("/rating/:post_id").get(async (req, res) => {
  try {
    const Post_id = req.params.post_id;
    const ratings = await Ratings.find({
      Post_id,
    });
    let data = [];
    for (let i = 0; i < ratings.length; i++) {
      const user = await Users.findOne({
        _id: ratings[i]?.user_id,
      });
      data.push({
        id: ratings[i]?._id,
        user: user.name,
        user_id: ratings[i]?.user_id,
        user_Image: user?.Image,
        comment: ratings[i]?.comment,
        stars: ratings[i]?.stars,
        date: ratings[i]?.createdAt,
      });
    }
    res.json(data);
  } catch (err) {
    res.status(400).json("Error: " + error);
  }
});
////////////////////////////////////////////////
///////rating remove /////////////////
router
  .route("/removeRating/:rating_id/:token")
  .delete(auth, async (req, res) => {
    try {
      await Ratings.findByIdAndDelete(req.params.rating_id);
      res.json("Rating deleted.");
    } catch (error) {
      res.status(400).json("Error: " + error);
    }
  });

////////////////////////////////////////////////
///////rating remove /////////////////
router.route("/search/:q").get(async (req, res) => {
  try {
    const { q } = req.params;
    const query = { $text: { $search: q } };
    const search = await Posts.find(query);
    res.json(search);
  } catch (error) {
    res.status(400).json("Error: " + error);
  }
});
module.exports = router;
