const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
    name: {
      type: String,
      //required: true
    },
    email: {
      type: String,
      required: true
    },
    username: {
      type: String,
      //required: true
    },
    password: {
      type: String,
      required: true
    },
    picture: {
      type: String,
      //required: true
    },
  },
  { timestamps: true }
);

module.exports = model("users", UserSchema);
