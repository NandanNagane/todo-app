import express from 'express';
import passport from 'passport'; 
import { 
    getTasks, 
    createTask, 
    getTask, 
    updateTask, 
    deleteTask, 
    toggleTaskCompletion 
} from '../controllers/taskRoutes.contoller.js';

const taskRouter = express.Router();

// JWT authentication middleware
const protect = passport.authenticate('jwt-access', { session: false });

// All routes require authentication
taskRouter.use(protect);

// Routes
taskRouter.route('/')
    .get(getTasks)           // GET /tasks - Get all user tasks
    .post(createTask);       // POST /tasks - Create a new task

taskRouter.route('/:taskId')
    .get(getTask)            // GET /tasks/:taskId - Get a single task
    .patch(updateTask)       // PATCH /tasks/:taskId - Update a task
    .delete(deleteTask);     // DELETE /tasks/:taskId - Delete a task

taskRouter.patch('/:taskId/toggle', toggleTaskCompletion); // PATCH /tasks/:taskId/toggle - Toggle completion

export default taskRouter;