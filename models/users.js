const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UsersSchema = new Schema(
  {
    name: { type: String },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    token: { type: String },
    refresh_token: { type: String },
    bio: { type: String },

    code: { type: Number },
    status: { type: Boolean, required: true },
    Image: { type: String},
  },
  {
    timestamps: true,
  }
);

const Users = mongoose.model("Users", UsersSchema);

module.exports = Users;
