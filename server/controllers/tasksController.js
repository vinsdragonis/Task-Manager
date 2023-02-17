const Task = require('../models/Task')
const User = require('../models/User')
const asyncHandler = require('express-async-handler')

// @desc Get all tasks 
// @route GET /tasks
// @access Private
const getAllTasks = asyncHandler(async (req, res) => {
    // Get all tasks
    const tasks = await Task.find().lean();
    // If no tasks
    if (!tasks?.length) {
        return res.status(400).json({ message: 'No tasks found' });
    }
    const userTasks = await Promise.all(tasks.map(async (task) => {
        const user = await User.findById(task.user).lean().exec();
        return {...task, username: user.username};
    }));
    res.json(userTasks);
});

// @desc Create new task
// @route POST /tasks
// @access Private
const createNewTask = asyncHandler(async (req, res) => {
    const { user, title, text } = req.body;
    // Confirm data
    if (
        !user ||
        !title ||
        !text
    ) {
        return res.status(400).json({ message: "All fields are required" });
    }
    //Check if username is valid
    const validUser = await User.findOne({ 'user': user.username }).lean().exec();
    if (!validUser) {
        return res.status(404).json({ message: "User not found" });
    }
    // Check for duplicate title
    const duplicate = await Task.findOne({ title }).lean().exec();
    if (duplicate) {
        return res.status(409).json({ message: "Task with similar title found"});
    }
    // Create new task
    try {
        const taskUser = await User.findOne({ 'user': user._id }).select('_id').lean();
        await Task.create({ 'user': taskUser, title, text });
        return res.status(201).json({ message: "Task created" });
    } catch (err) {
        return res.status(400).json({ message: "Invalid task data received" });
    }
});

// @desc Update a note
// @route PATCH /notes
// @access Private
const updateTask = asyncHandler(async (req, res) => {
    const {id, user, title, text, completed } = req.body;
    // Confirm data
    if (
        !id ||
        !user ||
        !title ||
        !text ||
        typeof completed !== 'boolean'
    ) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    // Confirm if task exists
    const task = await Task.findById(id).exec();
    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }
    //Check for duplicate title
    const duplicate = await Task.findOne({ title }).lean().exec();
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Task with similar title found' });
    }
    //Check if username is valid
    const validUser = await User.findOne({ 'user': user.username }).lean().exec();
    if (!validUser) {
        return res.status(404).json({ message: "User not found" });
    }
    const taskUser = await User.findOne({ 'user': user._id }).select('_id').lean();
    task.user = taskUser;
    task.title = title;
    task.text = text;
    task.completed = completed;
    // Update task
    try {
        const updatedTask = await task.save();
        res.status(200).json({ message: `${ updatedTask.title } has been updated` });
    } catch (err) {
        return res.status(400).json({ message: `Unable to update ${ task.title }` });
    }
});

// @desc Delete a task
// @route DELETE /tasks
// @access Private
const deleteTask = asyncHandler(async (req, res) => {
    const { id } = req.body;
    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Task ID required' });
    }
    const task = await Task.findById(id).exec();
    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }
    const result = await task.deleteOne();
    const reply = `${ result.title } with ID ${ result.id } has been successfully deleted`;
    res.status(201).json(reply);
});

module.exports = {
    getAllTasks,
    createNewTask,
    updateTask,
    deleteTask
};