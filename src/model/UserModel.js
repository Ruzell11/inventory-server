const mongoose = require("mongoose");

// Create schema for user
const UserModel = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
  },
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role_id: {
    type: Number,
    required: true,
  },
});
// Create model for todo

const User = mongoose.model("User", UserModel);
// Export the user model
module.exports = User;
