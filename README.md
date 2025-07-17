# FarmLink: Smallholder Crop Manager

## Overview
FarmLink is a full-stack web application designed to help smallholder farmers in Kenya manage their crops and farm tasks efficiently. It provides a user-friendly dashboard, crop and task management, and insightful analytics to improve farm productivity.

- **Frontend:** React, React Router, Chart.js, Tailwind CSS ([see frontend/README.md](frontend/README.md))
- **Backend:** Node.js, Express, MongoDB, JWT authentication ([see backend/README.md](backend/README.md))

---

## Table of Contents
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [API Reference](#api-reference)
- [Frontend Components](#frontend-components)
- [Usage Guide](#usage-guide)
- [License](#license)

---

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- MongoDB database (local or cloud)

### Installation

#### Backend
See [backend/README.md](backend/README.md) for backend setup and details.

#### Frontend
See [frontend/README.md](frontend/README.md) for frontend setup and details.

---

## Architecture
See [ARCHITECTURE.md](ARCHITECTURE.md) for a detailed overview of the system design, data flow, and technology stack.

---

## API Reference
See [API.md](API.md) for a full list of backend endpoints, request/response formats, and example usage.

---

## Frontend Components

### Main Components
- **Navbar**: Responsive navigation bar with user info and links.
- **Dashboard**: Displays crop/task stats and charts.
- **CropList**: List, filter, and manage crops.
- **CropForm**: Add/edit crop details.
- **TaskList**: List, filter, and manage tasks.
- **TaskForm**: Add/edit farm tasks.
- **Profile**: View and update user profile.
- **Register/Login**: User authentication forms.
- **AuthContext**: Provides authentication state and methods to the app.

#### Example: Using AuthContext
```jsx
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { user, login, logout } = useAuth();
  // ...
}
```

#### Example: Protected Route
```jsx
import { useAuth } from './context/AuthContext';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}
```

---

## Usage Guide
See [USEGUIDE.md](USEGUIDE.md) for step-by-step instructions on using the app as a farmer or admin.

---

## License
MIT