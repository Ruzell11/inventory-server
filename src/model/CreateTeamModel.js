const mongoose = require("mongoose");

// Create schema for user
const TeamMemberModel = new mongoose.Schema({
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  email: {
    type: String,
    required: true,
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

const TeamMember = mongoose.model("Team_Member", TeamMemberModel);
// Export the user model
module.exports = TeamMember;
