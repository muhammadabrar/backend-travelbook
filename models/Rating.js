const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const RatingsSchema = new Schema(
  {
    stars: { type: Number, required: true },
    comment: { type: String, required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    Post_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  },

  {
    timestamps: true,
  }
);

const Ratings = mongoose.model("Ratings", RatingsSchema);

module.exports = Ratings;


