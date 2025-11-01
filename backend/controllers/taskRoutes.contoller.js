import { taskModel } from "../db/taskModel.js";
import { asyncWrap } from "../utils/asyncWrap.js";
import AppError from "../utils/appError.js";

// Get all tasks for the authenticated user
export const getTasks = asyncWrap(async (req, res) => {
    const { view, page = 1, limit = 50 } = req.query;
    const userId = req.user.id;

    let query = { userId };
    let sort = { createdAt: -1 };

    // View-specific filters
    if (view === 'all') {
        // Return ALL tasks (for search functionality)
        sort = { createdAt: -1 };
    } else if (view === 'today') {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        query.dueDate = { $gte: startOfDay, $lte: endOfDay };
        query.completed = false;
        sort = { dueDate: 1, priority: -1 };
    } else if (view === 'upcoming') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        query.dueDate = { $gte: tomorrow };
        query.completed = false;
        sort = { dueDate: 1, priority: -1 };
    } else if (view === 'completed') {
        query.completed = true;
        sort = { completedAt: -1 };
    } else {
        // inbox/default - only non-completed tasks
        query.completed = false;
        sort = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

  
    

    const [tasks, total] = await Promise.all([
        taskModel.find(query)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit)),
        taskModel.countDocuments(query)
    ]);
    
    res.status(200).json({
        success: true,
        count: tasks.length,
        total,
        data: tasks,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
            hasNextPage: skip + tasks.length < total
        }
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

    console.log(newTask);
    

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
        data: { message: "Task deleted successfully" }
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
    

    
    res.status(200).json({
        success: true,
        data: task
    });
});