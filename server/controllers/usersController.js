const User = require('../models/User');
const Task = require('../models/Task');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const { default: mongoose } = require('mongoose');

// @desc GET all users
// @route GET /user
// @access Private
const getAllUsers = asyncHandler (async (req, res) => {
    const users = await User.find().select('-password').lean();
    if (!users?.length) {
        return res.status(404).json({ message: "No users found" });
    }
    res.json(users);
});

// @desc Create new user
// @route POST /user
// @access Private
const createNewUser = asyncHandler (async (req, res) => {
    const { username, fullname, email, password, roles } = req.body;
    // Confirm data
    if (!username || !fullname || !email || !password || !Array.isArray(roles)) {
        return res.status(400).json({ message: "All fields are required" });
    }
    // Check for duplicate username
    const duplicateUsername = await User.findOne({ username }).lean().exec();
    if (duplicateUsername) {
        return res.status(409).json({ message: "Username already exists" });
    }
    // Check for duplicate email
    const duplicateEmail = await User.findOne({ email }).lean().exec();
    if (duplicateEmail) {
        return res.status(409).json({ message: "Email already exists" });
    }
    // Hashed password
    const hashedPwd = await bcrypt.hash(password, 10);
    // Create and store new user
    const userObject = { username, fullname, email, 'password': hashedPwd, roles };
    const user = await User.create(userObject);
    // If created
    if (user) {
        res.status(201).json({ message: `New user ${ username } created` });
    } else {
        res.status(400).json({ message: `Invalid user data received` });
    }
});

// @desc Update a user
// @route PATCH /user
// @access Private
const updateUser = asyncHandler (async (req, res) => {
    const { id, username, fullname, email, roles, active, password } = req.body;
    // Confirm data
    if (
        !id ||
        !username ||
        !Array.isArray(roles) ||
        !roles.length ||
        typeof active !== 'boolean'
    ) {
        return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findById(id).exec();
    // Check for duplicates
    const duplicateUsername = await User.findOne({ username }).lean().exec();
    if (duplicateUsername && duplicateUsername?._id.toString() !== id) {
        return res.status(409).json({ message: "Username already exists" });
    }
    const duplicateEmail = await User.findOne({ email }).lean().exec();
    if (duplicateEmail && duplicateEmail?._id.toString() !== id) {
        return res.status(409).json({ message: "Email already exists" });
    }
    user.username = username;
    user.roles = roles;
    user.active = active;
    if (fullname) {
        user.fullname = fullname;
    }
    if (email) {
        user.email = email;
    }
    if (password) {
        user.password = await bcrypt.hash(password, 10);
    }
    const updatedUser = await user.save();
    res.json({ message: `${ updatedUser.username } updated` });
});

// @desc Delete a user
// @route DELETE /user
// @access Private
const deleteUser = asyncHandler (async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ message: "User ID required" });
    }
    const task = await Task.findOne({ userId: id }).lean().exec();
    if (task) {
        return res.status(400).json({ message: "User has assigned tasks"});
    }
    const user = await User.findById(id).exec();
    if (!user) {
        return res.status(404).json({ message: "User not found"});
    }
    const result = await user.deleteOne();
    const reply = `User ${ result.username } with ID ${ result.id } has been deleted`;
    res.status(201).json(reply);
});

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
};