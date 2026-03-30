# Inventory Management System — Frontend

A React-based frontend for managing inventory items, built as part of the Enterprise Software Engineering module. Connects to a Django REST API backend for authentication, CRUD operations, stock monitoring, and audit logging.

## Live Demo

- **Frontend:** https://inventory-frontend-i2y1.onrender.com
- **Backend API:** https://inventory-backend-2775.onrender.com/api
- **Backend Repo:** https://github.com/Ri928d/django-backend

> **Note:** The backend runs on Render's free tier and may take up to 60 seconds to respond on the first request after inactivity. Please be patient when first loading the app.

## Features

### Authentication
- User registration with username, email, and password
- Login with JWT token management (access + refresh)
- Password reset via email (SendGrid integration)
- Protected routes — unauthenticated users are redirected to login
- Persistent sessions using localStorage

### Inventory Management
- **Create** — add items with name, description, quantity, category, and low stock threshold
- **Read** — view all items in a card-based list with status badges
- **Update** — inline editing of all item fields, plus quick +/- quantity buttons
- **Delete** — remove items with confirmation dialog
- Search by name, description, or category
- Filter by stock status (all, low stock, in stock)
- Sort by date, quantity, or name
- Dashboard summary cards (total items, low stock count, total units)

### Stock Audit History
- View the change history for any item via "Show Stock History" button
- Tracks every quantity change with old/new values, reason, and timestamp
- Reasons are categorised: Created, Increased, Decreased, Edited

### User Profiles
- View and update email address
- Upload profile image via Cloudinary
- Username display with avatar fallback

## Tech Stack

- **React 18** — UI library
- **React Router 6** — client-side routing
- **Vite** — build tool and dev server
- **Axios** — HTTP client for API requests
- **JWT** — token-based authentication stored in localStorage
- **Cloudinary** — image uploads for profile pictures
- **CSS** — custom styling (no UI framework)

## Project Structure

```
moz-todo-react/
├── src/
│   ├── components/
│   │   ├── InventoryApp.jsx      # Main inventory page (CRUD, search, audit log)
│   │   ├── Authentication.jsx    # Login, Register, Password Reset forms
│   │   ├── Navigation.jsx        # Top navigation bar
│   │   ├── Home.jsx              # Landing page
│   │   ├── Profile.jsx           # User profile management
│   │   └── ProtectedRoute.jsx    # Auth guard for protected pages
│   ├── hooks/
│   │   └── useInventory.js       # Custom hook for inventory CRUD state
│   ├── services/
│   │   └── api.js                # Axios instance and all API call functions
│   ├── AuthContext.jsx            # React Context for authentication state
│   ├── App.jsx                    # Root component with routing
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Global styles
├── public/
│   └── _redirects                 # Redirect rules for SPA on Render
├── index.html
├── vite.config.js
├── package.json
└── .env
```

## Architecture

The frontend follows a clear separation of concerns:

- **Components** handle UI rendering and user interaction
- **Hooks** (`useInventory`) manage data fetching and state for inventory items
- **Services** (`api.js`) handle all HTTP communication with the backend
- **Context** (`AuthContext`) manages authentication state globally
- **ProtectedRoute** guards authenticated pages, redirecting to login if needed

The frontend communicates **only** with the Django REST API middleware layer — it never accesses the database directly. This matches the three-layer enterprise architecture required by the assignment.

## Local Setup

### Prerequisites
- Node.js 18+ (tested with 22.22.0)
- npm
- Git
- The backend server running locally or accessible via URL

### Steps

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd moz-todo-react

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Create a .env file in the project root:
```

```env
VITE_DJANGO_API_URL=http://localhost:8000/api
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name       # Optional
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset  # Optional
```

```bash
# 4. Start the development server
npm run dev
```

The app will be available at http://localhost:3000 (or the port Vite assigns).

### Connecting to the Backend

**Local development:** Start the Django backend in a separate terminal:
```bash
cd django-backend
python manage.py runserver
```
Make sure `.env` has `VITE_DJANGO_API_URL=http://localhost:8000/api`.

**Production backend:** Update `.env` to point at the deployed API:
```env
VITE_DJANGO_API_URL=https://inventory-backend-2775.onrender.com/api
```

> **Important:** Vite bakes environment variables into the build at compile time. After changing `.env`, you must restart the dev server or rebuild.

## Deployment (Render)

The frontend is deployed as a Static Site on Render.

### Build Settings
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`

### Environment Variables on Render
```
VITE_DJANGO_API_URL=https://inventory-backend-2775.onrender.com/api
VITE_CLOUDINARY_CLOUD_NAME=dxjlref2c
VITE_CLOUDINARY_UPLOAD_PRESET=todo-preset
```

### SPA Redirect Rule
A rewrite rule is configured so that all paths serve `index.html`, which lets React Router handle client-side routing:
- **Source:** `/*`
- **Destination:** `/index.html`
- **Action:** Rewrite

## Available Scripts

```bash
npm run dev       # Start dev server
npm run build     # Production build to dist/
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

## Key Technical Decisions

- **Custom hook (`useInventory`)** encapsulates all inventory CRUD logic and state, keeping the main component focused on rendering. This makes it easier to test and reuse.
- **Axios interceptor** automatically attaches the JWT token to authenticated requests. Public endpoints (register, login, password reset) are excluded from this.
- **ProtectedRoute component** handles auth guarding at the route level rather than inside each component. This is a standard enterprise pattern.
- **Inline editing** was chosen over a separate edit page to reduce navigation and keep the user flow simple — you click Edit, change fields in place, and save.
- **Stock history** is fetched on demand (when the user clicks "Show Stock History") rather than loaded with every item, to keep the initial page load fast.
- **CSS is custom** rather than using a framework like Tailwind or Bootstrap — this was a deliberate choice to demonstrate understanding of styling and to keep the bundle size small.

## Use of AI

AI tools were used for research and debugging assistance during development.