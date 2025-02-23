const AppError = require("../utils/AppError");
const User = require("../models/userModel");

// getting all the users
exports.getAllUsers = async function (req, res, next) {
  try {
    const users = await User.find();

    if (!users || users.length === 0) {
      return next(new AppError("No users found", 404));
    }

    res.status(200).json({
      status: "Success",
      data: {
        count: users.length,
        users: users,
      },
    });
  } catch (err) {
    next(err); // Pass any errors to the error handling middleware
  }
};

exports.createUser = function (req, res) {
  res.status(500).json({
    status: "Error",
    message: "This route is not yet defined",
  });
};

exports.getUser = function (req, res) {
  res.status(500).json({
    status: "Error",
    message: "This route is not yet defined",
  });
};

exports.updateUser = function (req, res) {
  res.status(500).json({
    status: "Error",
    message: "This route is not yet defined",
  });
};

exports.deleteMe = async function (req, res, next) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return next(new AppError("User not found", 404));
    } else {
      res.status(204).json({
        status: "Success",
        data: null,
      });
    }
  } catch (err) {
    next(err);
  }
};

// implementing soft-delete
exports.delete = async function (req, res, next) {
  try {
    const { id } = req.params;

    // Update the document to set the deletedAt field to the current date
    const result = await User.findByIdAndUpdate(
      id,
      { deletedAt: new Date() },
      { new: true },
    );

    if (!result) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "User soft-deleted successfully",
      user: result,
    });
  } catch (err) {
    next(err);
  }
};

// reactivating the soft-deleted account.
exports.reactivateSoftDelete = async function (req, res, next) {
  try {
    const id = req.params.id;

    // update the document to remove the deletedAt field (reactivate user)
    const result = await User.findByIdAndUpdate(
      id,
      {
        deletedAt: null,
      },
      {
        new: true,
      },
    );

    res.status(200).json({
      status: "success",
      message: "User re-activated successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
