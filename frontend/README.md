# FarmLink Frontend

This is the frontend for FarmLink: Smallholder Crop Manager. It is a React SPA for farmers to manage crops and tasks, visualize data, and interact with the backend API.

---

## Tech Stack
- React
- React Router
- Chart.js & react-chartjs-2
- Tailwind CSS
- Axios
- Vite

---

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn

### Installation
```bash
cd frontend
npm install
npm run dev
```
The app runs on [http://localhost:5173](http://localhost:5173) by default.

---

## Project Structure
- `src/`
  - `App.jsx`: Main entry, routing, context providers
  - `components/`: UI components (Navbar, Dashboard, CropList, CropForm, TaskList, TaskForm, Profile, Auth forms, etc.)
  - `context/`: AuthContext for authentication state and methods
  - `main.jsx`: App bootstrap
  - `index.css`: Global styles (Tailwind)
- `index.html`: HTML entry point

---

## Main Components
- **Navbar**: Navigation bar with user info and links
- **Dashboard**: Crop/task stats and charts
- **CropList**: List, filter, and manage crops
- **CropForm**: Add/edit crop details
- **TaskList**: List, filter, and manage tasks
- **TaskForm**: Add/edit farm tasks
- **Profile**: View and update user profile
- **Register/Login**: User authentication forms
- **AuthContext**: Provides authentication state and methods

---

## Usage Guide
See [../USEGUIDE.md](../USEGUIDE.md) for step-by-step instructions.

---

## Architecture
See [../ARCHITECTURE.md](../ARCHITECTURE.md) for system design and data flow.

---

## License
MIT