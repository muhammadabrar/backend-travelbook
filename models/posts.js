const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PostsSchema = new Schema(
  {
    title: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    Image: { type: String, required: true },
    Location: { type: String, required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    like: [
      // {
      //   user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
      // },
    ],
  },

  {
    timestamps: true,
  }
);
PostsSchema.index({ title: 1 });
const Posts = mongoose.model("Posts", PostsSchema);

module.exports = Posts;
