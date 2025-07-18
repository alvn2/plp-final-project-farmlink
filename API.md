# FarmLink API Reference

This document describes all public backend API endpoints for FarmLink, including authentication, crops, tasks, and monitoring. All endpoints return JSON.

---

## Authentication

### Register
- **POST** `/api/auth/register`
- **Description:** Register a new user.
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "secret123",
    "farmLocation": "Nairobi", // optional
    "phoneNumber": "+254712345678" // optional
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": { "id": "...", "name": "...", "email": "...", "farmLocation": "...", "phoneNumber": "..." },
      "token": "<jwt>"
    }
  }
  ```
- **Auth:** Public

### Login
- **POST** `/api/auth/login`
- **Description:** Login user.
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "secret123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": { "id": "...", "name": "...", "email": "...", "farmLocation": "...", "phoneNumber": "..." },
      "token": "<jwt>"
    }
  }
  ```
- **Auth:** Public

### Get Profile
- **GET** `/api/auth/profile`
- **Description:** Get current user profile.
- **Headers:** `Authorization: Bearer <jwt>`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Profile retrieved successfully",
    "data": {
      "user": { "id": "...", "name": "...", "email": "...", "farmLocation": "...", "phoneNumber": "..." }
    }
  }
  ```
- **Auth:** Private

### Update Profile
- **PUT** `/api/auth/profile`
- **Description:** Update user profile.
- **Headers:** `Authorization: Bearer <jwt>`
- **Body:**
  ```json
  {
    "name": "New Name",
    "farmLocation": "New Location"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "data": { "user": { ... } }
  }
  ```
- **Auth:** Private

---

## Crops

### Get All Crops
- **GET** `/api/crops`
- **Description:** Get all crops for authenticated user.
- **Headers:** `Authorization: Bearer <jwt>`
- **Query Params:**
  - `sort` (optional): e.g. `-plantingDate`
  - `status` (optional): e.g. `Growing`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Crops retrieved successfully",
    "data": {
      "count": 2,
      "crops": [ ... ]
    }
  }
  ```
- **Auth:** Private

#### Crop Object Fields
- `name` (string, required)
- `plantingDate` (date, required)
- `expectedHarvestDate` (date, required)
- `notes` (string, optional, max 500 chars)
- `status` (string, enum: Planning, Planted, Growing, Harvested, Failed)
- `userId` (string, required)
- `createdAt`, `updatedAt` (date)
- Virtuals: `daysUntilHarvest`, `growthProgress`

### Get Single Crop
- **GET** `/api/crops/:id`
- **Description:** Get a single crop by ID (with tasks).
- **Headers:** `Authorization: Bearer <jwt>`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Crop retrieved successfully",
    "data": {
      "crop": { ... },
      "tasks": [ ... ]
    }
  }
  ```
- **Auth:** Private

### Create Crop
- **POST** `/api/crops`
- **Description:** Create a new crop.
- **Headers:** `Authorization: Bearer <jwt>`
- **Body:**
  ```json
  {
    "name": "Maize",
    "plantingDate": "2024-04-01",
    "expectedHarvestDate": "2024-08-01",
    "notes": "Planted early.",
    "status": "Growing"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Crop created successfully",
    "data": { "crop": { ... } }
  }
  ```
- **Auth:** Private

### Update Crop
- **PUT** `/api/crops/:id`
- **Description:** Update a crop.
- **Headers:** `Authorization: Bearer <jwt>`
- **Body:**
  ```json
  {
    "name": "Beans",
    "plantingDate": "2024-04-10",
    "expectedHarvestDate": "2024-08-10",
    "notes": "Changed crop type.",
    "status": "Growing"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Crop updated successfully",
    "data": { "crop": { ... } }
  }
  ```
- **Auth:** Private

### Delete Crop
- **DELETE** `/api/crops/:id`
- **Description:** Delete a crop (and its tasks).
- **Headers:** `Authorization: Bearer <jwt>`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Crop deleted successfully"
  }
  ```
- **Auth:** Private

### Crop Dashboard Stats
- **GET** `/api/crops/stats/dashboard`
- **Description:** Get crop statistics for dashboard (status counts, upcoming harvests).
- **Headers:** `Authorization: Bearer <jwt>`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Dashboard stats retrieved successfully",
    "data": { ... }
  }
  ```
- **Auth:** Private

---

## Tasks

### Get All Tasks
- **GET** `/api/tasks`
- **Description:** Get all tasks for authenticated user.
- **Headers:** `Authorization: Bearer <jwt>`
- **Query Params:**
  - `status` (optional): Pending, Completed, Overdue
  - `priority` (optional): Low, Medium, High, Critical
  - `category` (optional): Planting, Watering, Fertilizing, Pest Control, Harvesting, Maintenance, Other
  - `cropId` (optional): filter by crop
  - `sort` (optional): e.g. `dueDate`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Tasks retrieved successfully",
    "data": { "tasks": [ ... ] }
  }
  ```
- **Auth:** Private

#### Task Object Fields
- `cropId` (string, required)
- `description` (string, required, max 200 chars)
- `dueDate` (date, required)
- `status` (string, enum: Pending, Completed, Overdue)
- `priority` (string, enum: Low, Medium, High, Critical)
- `category` (string, optional)
- `estimatedDuration` (int, optional, minutes)
- `notes` (string, optional, max 1000 chars)
- `userId` (string, required)
- `createdAt`, `updatedAt` (date)
- Virtuals: `daysUntilDue`, `isOverdue`

### Get Single Task
- **GET** `/api/tasks/:id`
- **Description:** Get a single task by ID.
- **Headers:** `Authorization: Bearer <jwt>`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Task retrieved successfully",
    "data": { "task": { ... } }
  }
  ```
- **Auth:** Private

### Create Task
- **POST** `/api/tasks`
- **Description:** Create a new task.
- **Headers:** `Authorization: Bearer <jwt>`
- **Body:**
  ```json
  {
    "cropId": "...",
    "description": "Weed the maize field",
    "dueDate": "2024-05-01",
    "priority": "High",
    "category": "Watering",
    "estimatedDuration": 60,
    "notes": "Do early morning."
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Task created successfully",
    "data": { "task": { ... } }
  }
  ```
- **Auth:** Private

### Update Task
- **PUT** `/api/tasks/:id`
- **Description:** Update a task.
- **Headers:** `Authorization: Bearer <jwt>`
- **Body:**
  ```json
  {
    "description": "Water the beans",
    "dueDate": "2024-05-10",
    "status": "Completed",
    "priority": "Medium",
    "category": "Watering",
    "estimatedDuration": 30,
    "notes": "Done in afternoon."
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Task updated successfully",
    "data": { "task": { ... } }
  }
  ```
- **Auth:** Private

### Delete Task
- **DELETE** `/api/tasks/:id`
- **Description:** Delete a task.
- **Headers:** `Authorization: Bearer <jwt>`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Task deleted successfully"
  }
  ```
- **Auth:** Private

### Task Stats
- **GET** `/api/tasks/stats`
- **Description:** Get task statistics (status, priority, category counts).
- **Headers:** `Authorization: Bearer <jwt>`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "totalTasks": 10,
      "statusStats": { "Pending": 5, "Completed": 3, "Overdue": 2 },
      "priorityStats": { "High": 4, "Medium": 4, "Low": 2 },
      "categoryStats": { "Watering": 3, "Harvesting": 2 }
    }
  }
  ```
- **Auth:** Private

### Overdue Tasks
- **GET** `/api/tasks/overdue`
- **Description:** Get all overdue tasks for authenticated user.
- **Headers:** `Authorization: Bearer <jwt>`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "tasks": [ ... ],
      "count": 2
    }
  }
  ```
- **Auth:** Private

---

## Monitoring & System Health

All endpoints below are rate-limited and require authentication.

### Health Check
- **GET** `/api/monitoring/health`
- **Description:** Returns service health status.
- **Response:**
  ```json
  {
    "success": true,
    "message": "System healthy",
    "data": { ... }
  }
  ```

### Metrics
- **GET** `/api/monitoring/metrics`
- **Description:** Returns request, error, and performance metrics.
- **Response:**
  ```json
  {
    "success": true,
    "message": "Metrics retrieved successfully",
    "data": { ... }
  }
  ```

### System Status
- **GET** `/api/monitoring/status`
- **Description:** Returns system status, version, uptime, memory, and DB status.
- **Response:**
  ```json
  {
    "success": true,
    "message": "System status retrieved successfully",
    "data": { ... }
  }
  ```

### Performance Dashboard
- **GET** `/api/monitoring/performance`
- **Description:** Returns performance metrics (requests, response times, errors, DB ops).
- **Response:**
  ```json
  {
    "success": true,
    "message": "Performance metrics retrieved successfully",
    "data": { ... }
  }
  ```

### Error Summary
- **GET** `/api/monitoring/errors`
- **Description:** Returns error summary (by type, route, recent errors).
- **Response:**
  ```json
  {
    "success": true,
    "message": "Error summary retrieved successfully",
    "data": { ... }
  }
  ```

### Monitoring Report
- **GET** `/api/monitoring/report`
- **Description:** Returns a comprehensive monitoring report.
- **Response:**
  ```json
  {
    "success": true,
    "message": "Monitoring report generated successfully",
    "data": { ... }
  }
  ```

---

## Validation Rules (Summary)
- All string fields have max length limits.
- Dates must be valid ISO8601.
- Enums: status, priority, category, areaUnit, etc. must match allowed values.
- See validation middleware for full details.