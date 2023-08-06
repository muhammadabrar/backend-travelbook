const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const FollowsSchema = new Schema(
  {
    Follow: { type: String, required: true },
    Followby: { type: String, required: true },

    
  },
  {
    timestamps: true,
  }
);

const Follows = mongoose.model("Follows", FollowsSchema);

module.exports = Follows;
