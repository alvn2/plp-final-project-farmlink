# FarmLink API Reference

This document describes all public backend API endpoints for FarmLink, including authentication, crops, and tasks. All endpoints return JSON.

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
    "farmLocation": "Nairobi" // optional
  }
  ```
- **Response:**
  ```json
  {
    "message": "User registered successfully",
    "token": "<jwt>",
    "user": { "id": "...", "name": "...", "email": "...", "farmLocation": "..." }
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
    "message": "Login successful",
    "token": "<jwt>",
    "user": { "id": "...", "name": "...", "email": "...", "farmLocation": "..." }
  }
  ```
- **Auth:** Public

### Get Current User
- **GET** `/api/auth/me`
- **Description:** Get current user profile.
- **Headers:** `Authorization: Bearer <jwt>`
- **Response:**
  ```json
  {
    "user": { "id": "...", "name": "...", "email": "...", "farmLocation": "...", "createdAt": "..." }
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
    "message": "Profile updated successfully",
    "user": { ... }
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
    "message": "Crops retrieved successfully",
    "count": 2,
    "crops": [ ... ]
  }
  ```
- **Auth:** Private

### Get Single Crop
- **GET** `/api/crops/:id`
- **Description:** Get a single crop by ID (with tasks).
- **Headers:** `Authorization: Bearer <jwt>`
- **Response:**
  ```json
  {
    "message": "Crop retrieved successfully",
    "crop": { ... },
    "tasks": [ ... ]
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
    "notes": "Planted early."
  }
  ```
- **Response:**
  ```json
  {
    "message": "Crop created successfully",
    "crop": { ... }
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
    "message": "Crop updated successfully",
    "crop": { ... }
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
    "message": "Crop deleted successfully"
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
  - `status` (optional): e.g. `Pending`
  - `cropId` (optional): filter by crop
  - `sort` (optional): e.g. `dueDate`
- **Response:**
  ```json
  {
    "message": "Tasks retrieved successfully",
    "count": 3,
    "tasks": [ ... ]
  }
  ```
- **Auth:** Private

### Get Single Task
- **GET** `/api/tasks/:id`
- **Description:** Get a single task by ID.
- **Headers:** `Authorization: Bearer <jwt>`
- **Response:**
  ```json
  {
    "message": "Task retrieved successfully",
    "task": { ... }
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
    "priority": "High"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Task created successfully",
    "task": { ... }
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
    "priority": "Medium"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Task updated successfully",
    "task": { ... }
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
    "message": "Task deleted successfully"
  }
  ```
- **Auth:** Private

---

## Error Handling
- All errors return a JSON object with an `error` field and a relevant message.
- Example:
  ```json
  { "error": "Invalid token" }
  ```

---

For more details, see the code or contact the FarmLink team.