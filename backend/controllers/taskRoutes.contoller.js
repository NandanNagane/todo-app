import { taskModel } from "../db/taskModel.js";
import { asyncWrap } from "../utils/asyncWrap.js";
import AppError from "../utils/appError.js";

// Get all tasks for the authenticated user
export const getTasks = asyncWrap(async (req, res) => {
    const tasks = await taskModel.find({ userId: req.user.id }).sort({ createdAt: -1 });
    
    res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks
    });
});

// Create a new task
export const createTask = asyncWrap(async (req, res) => {
    const { title, description, dueDate, priority, labels } = req.body;

    // Validate required fields
    if (!title) {
        throw new AppError("Task title is required", 400);
    }

    // Create a new task
    const newTask = await taskModel.create({
        title,
        description,
        dueDate,
        priority,
        labels,
        userId: req.user.id,
    });

    res.status(201).json({
        success: true,
        data: newTask
    });
});

// Get a single task by ID
export const getTask = asyncWrap(async (req, res) => {
    const { taskId } = req.params;
    
    const task = await taskModel.findById(taskId);
    
    if (!task) {
        throw new AppError("Task not found", 404);
    }
    
    // Check if user owns this task
    if (!task.isOwnedBy(req.user.id)) {
        throw new AppError("You don't have permission to view this task", 403);
    }
    
    res.status(200).json({
        success: true,
        data: task
    });
});

// Update a task
export const updateTask = asyncWrap(async (req, res) => {
    const { taskId } = req.params;
    const updates = req.body;
    
    const task = await taskModel.findById(taskId);
    
    if (!task) {
        throw new AppError("Task not found", 404);
    }
    
    // Check if user owns this task
    if (!task.isOwnedBy(req.user.id)) {
        throw new AppError("You don't have permission to update this task", 403);
    }
    
    // Update the task
    const updatedTask = await taskModel.findByIdAndUpdate(
        taskId,
        updates,
        { new: true, runValidators: true }
    );
    
    res.status(200).json({
        success: true,
        data: updatedTask
    });
});

// Delete a task
export const deleteTask = asyncWrap(async (req, res) => {
    const { taskId } = req.params;
    
    const task = await taskModel.findById(taskId);
    
    if (!task) {
        throw new AppError("Task not found", 404);
    }
    
    // Check if user owns this task
    if (!task.isOwnedBy(req.user.id)) {
        throw new AppError("You don't have permission to delete this task", 403);
    }
    
    await taskModel.findByIdAndDelete(taskId);
    
    res.status(200).json({
        success: true,
        message: "Task deleted successfully"
    });
});

// Toggle task completion status
export const toggleTaskCompletion = asyncWrap(async (req, res) => {
    const { taskId } = req.params;
    
    const task = await taskModel.findById(taskId);
    
    if (!task) {
        throw new AppError("Task not found", 404);
    }
    
    // Check if user owns this task
    if (!task.isOwnedBy(req.user.id)) {
        throw new AppError("You don't have permission to update this task", 403);
    }
    
    // Toggle completion status
    task.completed = !task.completed;
    await task.save();
    
    console.log(task);
    
    res.status(200).json({
        success: true,
        data: task
    });
});