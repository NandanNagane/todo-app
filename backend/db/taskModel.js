import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxLength: 1000,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    dueDate: {
      type: Date,
    },
    // Relationship with User - this establishes the connection
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // References the User model
      required: true,
      index: true, // Index for faster queries
    },
    completedAt: {
      type: Date,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { 
    timestamps: true,
  }
);

// Compound index for efficient user-specific queries
taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ userId: 1, completed: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });

// Pre-save middleware to set completedAt timestamp
taskSchema.pre("save", function (next) {
  if (this.isModified("completed")) {
    if (this.completed) {
      this.completedAt = new Date();
    } else {
      this.completedAt = undefined;
    }
  }
  next();
});

// If you want hooks to work with findOneAndUpdate
taskSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.completed !== undefined) {
    if (update.completed) {
      update.completedAt = new Date();
    } else {
      update.completedAt = undefined;
    }
  }
  next();
});

// Virtual for checking if task is overdue
taskSchema.virtual("isOverdue").get(function () {
  return this.dueDate && !this.completed && new Date() > this.dueDate;
});

// Enable virtuals in JSON/Object responses
taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

// Static method to find tasks by user
taskSchema.statics.findByUser = function (userId, options = {}) {
  const query = { userId };
  
  // Add filters based on options
  if (options.completed !== undefined) {
    query.completed = options.completed;
  }
  
  if (options.dueDate) {
    query.dueDate = { $lte: new Date(options.dueDate) };
  }
  
  return this.find(query).sort({ order: 1, createdAt: -1 });
};

// Instance method to check if user owns this task
taskSchema.methods.isOwnedBy = function (userId) {
  return this.userId.toString() === userId.toString();
};

const taskModel = mongoose.model("Task", taskSchema);

export { taskModel };