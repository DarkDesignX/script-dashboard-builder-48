# Script Dashboard Builder

A full-stack application for managing PowerShell scripts with a React/TypeScript frontend and Node.js backend.

## Features

- ✅ **Frontend**: React/TypeScript with Tailwind CSS and shadcn/ui components
- ✅ **Backend**: Node.js/Express with SQLite database
- ✅ **CRUD Operations**: Create, read, update, and delete scripts
- ✅ **Customer Management**: Assign scripts to specific customers
- ✅ **Categories**: Organize scripts by category (Software, Sicherheit, Konfiguration, Befehl)
- ✅ **Script Editor**: PowerShell syntax highlighting
- ✅ **Search & Filters**: Advanced filtering by category, customer, and status

## Project Structure

```
script-dashboard-builder-48/
├── src/                    # Frontend React application
│   ├── components/         # UI components
│   ├── pages/             # Page components
│   ├── services/          # API service layer
│   └── types/             # TypeScript type definitions
├── server/                # Backend Node.js application
│   ├── database.js        # SQLite database configuration
│   ├── server.js          # Express server and API routes
│   └── scripts/           # Database initialization scripts
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation & Setup

1. **Install frontend dependencies:**
   ```bash
   npm install
   ```

2. **Install backend dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Initialize the database:**
   ```bash
   npm run init-db
   ```
   This will create the SQLite database and populate it with sample data.

### Running the Application

1. **Start the backend server:**
   ```bash
   cd server
   npm run dev
   ```
   The backend API will be available at `http://localhost:3001`

2. **Start the frontend (in a new terminal):**
   ```bash
   cd ..  # Back to project root
   npm run dev
   ```
   The frontend will be available at `http://localhost:8080`

### API Endpoints

The backend provides the following REST API endpoints:

#### Scripts
- `GET /api/scripts` - Get all scripts
- `GET /api/scripts/:id` - Get specific script
- `POST /api/scripts` - Create new script
- `PUT /api/scripts/:id` - Update script
- `DELETE /api/scripts/:id` - Delete script

#### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create new customer

#### Health Check
- `GET /api/health` - Server health check

### Database Schema

#### Scripts Table
- `id` (TEXT PRIMARY KEY)
- `name` (TEXT NOT NULL)
- `command` (TEXT NOT NULL)
- `description` (TEXT)
- `category` (TEXT) - 'software', 'sicherheit', 'konfiguration', 'befehl'
- `isGlobal` (INTEGER) - 0/1 boolean
- `autoEnrollment` (INTEGER) - 0/1 boolean
- `createdAt` (DATETIME)
- `updatedAt` (DATETIME)

#### Customers Table
- `id` (TEXT PRIMARY KEY)
- `name` (TEXT NOT NULL UNIQUE)

#### Script_Customers Table (Junction)
- `scriptId` (TEXT, FK to scripts.id)
- `customerId` (TEXT, FK to customers.id)

## Development

### Frontend Development
The frontend is built with:
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Router** for routing
- **React Query** for API state management

### Backend Development
The backend uses:
- **Express.js** for the web framework
- **SQLite** for the database
- **CORS** enabled for cross-origin requests
- **Morgan** for request logging

### Available Scripts

#### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

#### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run init-db` - Initialize database with schema and sample data

## License

This project is for demonstration purposes.

---

## Original Lovable Project Info

**URL**: https://lovable.dev/projects/47cdeb0d-bb5c-4a4c-96e6-d3d623c5b06d

This project was originally built with Lovable and enhanced with a full Node.js backend.
