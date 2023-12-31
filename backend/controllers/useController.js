const User = require("../models/UserSchema");
const sendToken = require("../utils/jwtToken.js");

exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password, avatar } = req.body;

    const user = await User.create({ name, email, password, avatar });
    sendToken(user, 201, res);
  } catch (err) {
    await res.status(500).send({ success: false, message: err.message });
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = await req.body;

    if (!email || !password) {
      await res
        .status(400)
        .json({ success: false, message: "Invalid Email or Password" });
      return;
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      await res
        .status(400)
        .json({ success: false, message: "Invalid Email or Password" });
      return;
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      await res
        .status(400)
        .json({ success: false, message: "Invalid Email or Password" });
      return;
    }

    sendToken(user, 200, res);
  } catch (err) {
    await res.json({ success: false, message: err.message });
  }
};

//Logout User

exports.logout = async (req, res, next) => {
  try {
    await res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });
    await res
      .status(200)
      .json({ success: true, message: "logged out successfully" });
  } catch (err) {
    await res.send({ success: false, message: err.message });
  }
};

//Get User Details
exports.getUserDetails = async (req, res, next) => {
  try {
    const cookie = req.headers.cookie;
    if (!cookie) {
      await res
        .status(404)
        .send({ success: false, message: "You have already Logged in !" });
      return;
    }

    const user = await User.findById(req.user.id);

    await res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    await res.status(400).send({ success: false, message: err.message });
  }
};

//Update User password

exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("+password");

    const isMatch = await user.comparePassword(req.body.oldPassword);

    if (!isMatch) {
      await res
        .status(400)
        .send({ success: false, message: "Old Password is incorrect" });
      return;
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
      await res.status(400).send({
        success: false,
        message: " New Password and Confirm Password does not match",
      });
      return;
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user, 200, res);
  } catch (err) {
    await res.send({ success: false, message: err.message });
  }
};

//Update User Profile

exports.updateProfile = async (req, res, next) => {
  try {
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
      avatar: req.body.avatar,
    };

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: true,
    });

    await res.status(200).json({ success: true, user: user });
  } catch (err) {
    await res.status(400).send({ success: false, message: err.message });
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    const userCount = await users.length;
    await res.status(200).send({ success: true, users, userCount });
  } catch (error) {
    await res.status(400).send({ success: false, message: err.message });
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.find({ _id: req.params.id });
    if (!user) {
      res.status(404).send({ success: false, error: "User not found" });
      return;
    }
    await User.findByIdAndDelete(req.params.id);

    res
      .status(200)
      .send({ success: true, message: "User deleted Successfully" });
  } catch (error) {
    await res.status(400).send({ success: false, message: err.message });
  }
};

exports.changeUserRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      await res
        .status(500)
        .send({ success: false, message: "User not found." });

      return;
    }

    user.role = req.body.role;
    await user.save();
    await res.status(200).send({
      success: true,
      message: "User Role Updated successfully !!",
      user,
    });
  } catch (error) {
    await res.status(400).send({ success: false, message: err.message });
  }
};

exports.applySinger = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    user.isAppliedForSinger = true;
    await user.save();
    await res.status(200).send({
      success: true,
      message: "You have Successfully applied for singer role",
    });
  } catch (err) {
    await res.status(400).send({ success: false, message: err.message });
  }
};

exports.usersWhoAppliedForSinger = async (req, res, next) => {
  try {
    const users = await User.find({
      $and: [
        {
          isAppliedForSinger: true,
        },
        { $or: [{ role: "admin" }, { role: "user" }] },
      ],
    });
    await res.status(200).send({
      success: true,
      count: users.length,
      users,
    });
  } catch (err) {
    await res.status(400).send({ success: false, message: err.message });
  }
};

//get latest artists

exports.latestArtists = async (req, res, next) => {
  try {
    const users = await User.find({ role: "singer" }).limit(8);
    await res.status(200).send({
      success: true,
      users,
    });
  } catch (err) {
    await res.status(400).send({ success: false, message: err.message });
  }
};
