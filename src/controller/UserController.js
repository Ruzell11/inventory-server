const UserModel = require("../model/UserModel");
const TeamMember = require("../model/CreateTeamModel");
const ProductModel = require("../model/ProductModel");
const bcrypt = require("bcrypt");
const { createTokens } = require("../middleware/index");
const { HTTP_BAD_REQUEST, FAILED, HTTP_OK, SUCCESS } = require("../global");
const mongoose = require("mongoose");

const userController = () => {
  const loginUser = async (req, res,) => {
    const { email, password } = req.body;
    let user_profile =
      (await UserModel.findOne({ email })) ||
      (await TeamMember.findOne({ email }));

    if (!user_profile) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ success: FAILED, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user_profile.password);

    if (!isMatch) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ success: FAILED, message: "Incorrect email or password!" });
    }

    const accessToken = createTokens(user_profile);

    res.cookie("access-token", accessToken, {
      maxAge: 60 * 60 * 24 * 30,
    });
    res.set("access-token", accessToken);
    res.status(HTTP_OK).json({
      success: SUCCESS,
      message: "User logged in",
      user_details: {
        role_id: user_profile.role_id,
        id: user_profile.id,
      },
    });
  };

  const userProfile = async (req, res, next) => {
    const { id } = req.params;

    const user_profile =
      (await UserModel.findById(id)) || (await TeamMember.findById(id));

    if (!user_profile) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ success: FAILED, message: "User does not exist" });
    }

    res.status(HTTP_OK).json({
      success: SUCCESS,
      message: "User details found",
      user_profile,
    });
  };

  const createTeamMembers = async (req, res, next) => {
    const created_by_id = req.query?.created_by_id;
    const { username, first_name, last_name, email, password, role_id } =
      req.body;
    const saltRounds = 10;

    if (
      !username ||
      !first_name ||
      !last_name ||
      !email ||
      !password ||
      !role_id) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ success: FAILED, message: "Missing fields are required" });
    }


    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newMember =
      role_id === 1
        ? new UserModel({
          email,
          username,
          password: hashedPassword,
          role_id,
          last_name,
          first_name,
        })
        : new TeamMember({
          created_by: created_by_id,
          username,
          first_name,
          last_name,
          email,
          password: hashedPassword,
          role_id,
        });

    await newMember.save();

    return res.status(HTTP_OK).json({
      success: SUCCESS,
      message: "Successfully added",
      team_member_details: newMember,
    });
  };

  const getTeamMembers = async (req, res) => {
    const created_by_id = req.params.id;

    let user_profile = await UserModel.findById(created_by_id) || await TeamMember.findById(created_by_id);

    if (!user_profile) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ success: FAILED, message: "User does not exist" });
    }


    const listOfMembers = await TeamMember.find({ created_by: created_by_id });

    if (listOfMembers.length === 0) {
      return res
        .status(HTTP_OK)
        .json({ success: SUCCESS, message: "No members found" });
    }

    return res.status(HTTP_OK).json({
      success: SUCCESS,
      message: "List of your team members",
      created_by: user_profile.username,
      listOfMembers,
    });
  };

  const editUserDetails = async (req, res) => {
    const { id } = req.params;
    const { body } = req;
    const saltRounds = 10;

    if (!id) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ success: FAILED, message: "Id is required" });
    }

    if (body.password == undefined || body.password == "") {
      delete body.password;  // Remove the password field from the body object
    }

    if (body.role_id == undefined || body.role_id === "") {
      delete body.role_id; // Remove the role_id field from the body object
    }

    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(body.password, salt);
    body.password = hashedPassword;

    const user_profile = await UserModel.findByIdAndUpdate(id, body, {
      new: true,
    }) || await TeamMember.findByIdAndUpdate(id, body, {
      new: true,
    });

    if (!user_profile) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ success: SUCCESS, message: "User does not exist." });
    }

    return res
      .status(HTTP_OK)
      .json({ success: SUCCESS, message: "User successfully updated." });
  };


  const deleteUserDetails = async (req, res) => {
    const { user_id, created_by_id } = req.query;

    if (!user_id || !created_by_id) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ success: FAILED, message: "Invalid Request" });
    }

    const teamMembers = await TeamMember.findById(user_id);

    if (!teamMembers) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ success: FAILED, message: "User does not exist" });
    }

    const team_member_created_by_id = teamMembers.created_by.toString();

    if (team_member_created_by_id != created_by_id) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ success: FAILED, message: "Permission denied" });
    }

    // Delete the user
    await TeamMember.findByIdAndDelete(user_id);

    // Delete the products related to the user
    await ProductModel.deleteMany({ created_by: user_id });

    return res
      .status(HTTP_OK)
      .json({ success: SUCCESS, message: "User and related products successfully deleted" });
  };

  return {
    loginUser,
    userProfile,
    createTeamMembers,
    getTeamMembers,
    editUserDetails,
    deleteUserDetails,
  };
};

module.exports = userController;
