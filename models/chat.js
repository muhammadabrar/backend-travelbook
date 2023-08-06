const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ChatsSchema = new Schema(
  {
    
    msg: { type: String },
    user_id: { type: String, required: true }
  },
  {
    timestamps: true,
  }
);

const Chats = mongoose.model("Chats", ChatsSchema);

module.exports = Chats;


