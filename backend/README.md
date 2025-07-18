# FarmLink Backend

This is the backend for FarmLink: Smallholder Crop Manager. It provides a RESTful API for user authentication, crop management, task tracking, and system monitoring.

---

## Tech Stack
- Node.js
- Express
- MongoDB (Mongoose)
- JWT authentication
- CORS
- Monitoring endpoints

---

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- MongoDB (local or cloud)

### Installation
```bash
cd backend
npm install
cp .env.example .env # Set your MONGO_URI and JWT_SECRET
npm run dev # or npm start
```

---

## Project Structure
- `server.js`: Main entry, Express app, middleware, error handling, route mounting
- `routes/`: API endpoints (`auth.js`, `crops.js`, `tasks.js`, `monitoring.js`)
- `models/`: Mongoose schemas (`User.js`, `Crop.js`, `Task.js`)
- `middleware/`: Auth, validation, monitoring
- `seed.js`: Seed data script

---

## API Reference
See [../API.md](../API.md) for all endpoints, request/response formats, and examples. Includes:
- Monitoring endpoints for health, metrics, and performance
- Extended crop and task fields (status, priority, category, notes, etc.)

---

## Usage Guide
See [../USEGUIDE.md](../USEGUIDE.md) for step-by-step instructions.

---

## Architecture
See [../ARCHITECTURE.md](../ARCHITECTURE.md) for system design and data flow.

---

## Validation
- All endpoints enforce strict validation for required fields, enums, and string lengths.
- See [../API.md](../API.md) for details on validation rules.

---

## License
MIT