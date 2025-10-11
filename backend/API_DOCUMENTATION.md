# Task API Endpoints

Base URL: `http://localhost:3001` (development)

All endpoints require JWT authentication via `passport-jwt` middleware.

## Endpoints

### 1. Get All Tasks
**GET** `/tasks`

Get all tasks for the authenticated user.

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Complete project",
      "description": "Finish the todo app",
      "completed": false,
      "priority": "high",
      "dueDate": "2025-10-08T00:00:00.000Z",
      "labels": ["work", "urgent"],
      "userId": "507f191e810c19729de860ea",
      "order": 0,
      "createdAt": "2025-10-07T10:00:00.000Z",
      "updatedAt": "2025-10-07T10:00:00.000Z"
    }
  ]
}
```

---

### 2. Create Task
**POST** `/tasks`

Create a new task for the authenticated user.

**Request Body:**
```json
{
  "title": "Complete project",
  "description": "Finish the todo app",
  "dueDate": "2025-10-08",
  "priority": "high",
  "labels": ["work", "urgent"]
}
```

**Required Fields:**
- `title` (string)

**Optional Fields:**
- `description` (string, max 1000 chars)
- `dueDate` (Date)
- `priority` (enum: "low", "medium", "high", "urgent")
- `labels` (array of strings)

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Complete project",
    "description": "Finish the todo app",
    "completed": false,
    "priority": "high",
    "dueDate": "2025-10-08T00:00:00.000Z",
    "labels": ["work", "urgent"],
    "userId": "507f191e810c19729de860ea",
    "order": 0,
    "createdAt": "2025-10-07T10:00:00.000Z",
    "updatedAt": "2025-10-07T10:00:00.000Z"
  }
}
```

---

### 3. Get Single Task
**GET** `/tasks/:taskId`

Get a specific task by ID.

**URL Parameters:**
- `taskId` - MongoDB ObjectId

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Complete project",
    "completed": false,
    ...
  }
}
```

**Error Responses:**
- `404` - Task not found
- `403` - User doesn't own this task

---

### 4. Update Task
**PATCH** `/tasks/:taskId`

Update a specific task.

**URL Parameters:**
- `taskId` - MongoDB ObjectId

**Request Body:** (all fields optional)
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "completed": true,
  "priority": "medium",
  "dueDate": "2025-10-09",
  "labels": ["updated", "work"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Updated title",
    ...
  }
}
```

**Error Responses:**
- `404` - Task not found
- `403` - User doesn't own this task

---

### 5. Delete Task
**DELETE** `/tasks/:taskId`

Delete a specific task.

**URL Parameters:**
- `taskId` - MongoDB ObjectId

**Response:**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

**Error Responses:**
- `404` - Task not found
- `403` - User doesn't own this task

---

### 6. Toggle Task Completion
**PATCH** `/tasks/:taskId/toggle`

Toggle the completion status of a task.

**URL Parameters:**
- `taskId` - MongoDB ObjectId

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Complete project",
    "completed": true,
    "completedAt": "2025-10-07T12:30:00.000Z",
    ...
  }
}
```

**Error Responses:**
- `404` - Task not found
- `403` - User doesn't own this task

---

## Authentication

All endpoints require a valid JWT access token passed in cookies.

**Cookie Name:** `accessToken`

If authentication fails:
```json
{
  "error": "Unauthorized"
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

Common status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (no/invalid token)
- `403` - Forbidden (no permission)
- `404` - Not Found
- `500` - Internal Server Error
