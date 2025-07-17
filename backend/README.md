# FarmLink Backend

This is the backend for FarmLink: Smallholder Crop Manager. It provides a RESTful API for user authentication, crop management, and task tracking.

---

## Tech Stack
- Node.js
- Express
- MongoDB (Mongoose)
- JWT authentication
- CORS

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
- `routes/`: API endpoints (`auth.js`, `crops.js`, `tasks.js`)
- `models/`: Mongoose schemas (`User.js`, `Crop.js`, `Task.js`)
- `middleware/`: Auth middleware (`auth.js`)
- `seed.js`: Seed data script

---

## API Reference
See [../API.md](../API.md) for all endpoints, request/response formats, and examples.

---

## Usage Guide
See [../USEGUIDE.md](../USEGUIDE.md) for step-by-step instructions.

---

## Architecture
See [../ARCHITECTURE.md](../ARCHITECTURE.md) for system design and data flow.

---

## License
MIT