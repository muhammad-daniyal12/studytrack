# StudyTrack

StudyTrack is a beginner-friendly student productivity app for managing tasks, subjects, deadlines, and expenses in one place.

## Features

- User registration and login with JWT authentication
- Protected routes for private data
- Dashboard with statistics and upcoming deadlines
- Task creation, editing, deletion, and status updates
- Subject management
- Expense tracking with filtering and search
- Profile page with name editing
- Responsive design for desktop, tablet, and mobile

## Technology Stack

Frontend:
- React
- Vite
- JavaScript
- React Router
- Axios
- Plain CSS

Backend:
- Node.js
- Express.js
- SQLite
- JWT
- bcryptjs

## Project Structure

studytrack/
  client/
    src/
  server/
  README.md
  .gitignore

## Installation

1. Open a terminal in the project root.
2. Install frontend dependencies:

   cd client
   npm install

3. Install backend dependencies:

   cd ../server
   npm install

### Windows: `npm` is not recognized

If PowerShell says that `npm` is not recognized after installing Node.js, close
the terminal and open a new PowerShell window so it reloads the system PATH.
Alternatively, run this once in the current PowerShell window:

```powershell
$env:Path += ";C:\Program Files\nodejs"
```

Then verify the installation:

```powershell
node --version
npm --version
```

## Environment Variables

Create a `.env` file inside `server` using the example file:

cp .env.example .env

The default values are:

PORT=5000
JWT_SECRET=studytrack_dev_secret_2026

## Run the App

Start the backend:

cd server
npm run dev

Start the frontend:

cd client
npm run dev

## Default URLs

Frontend: http://localhost:5173
Backend: http://localhost:5000

## API Overview

Auth:
- POST /api/auth/register
- POST /api/auth/login

User:
- GET /api/user/profile
- PUT /api/user/profile

Subjects:
- GET /api/subjects
- POST /api/subjects
- PUT /api/subjects/:id
- DELETE /api/subjects/:id

Tasks:
- GET /api/tasks
- GET /api/tasks/:id
- POST /api/tasks
- PUT /api/tasks/:id
- DELETE /api/tasks/:id

Expenses:
- GET /api/expenses
- GET /api/expenses/:id
- POST /api/expenses
- PUT /api/expenses/:id
- DELETE /api/expenses/:id

Dashboard:
- GET /api/dashboard/stats

## Database

The app uses SQLite. The database file is created automatically in `server/database/studytrack.db` when the server starts.

## Manual Test Scenario

1. Open http://localhost:5173
2. Register a new account.
3. Add subjects such as Data Structures and Software Engineering.
4. Create tasks and complete one.
5. Add expenses such as lunch or bus fare.
6. Check the dashboard for updated numbers.
7. Log out and confirm that /dashboard redirects to /login.
8. Log back in and confirm the saved data is still there.

## Future Improvements

- Add reminders and notifications
- Add charts for spending and task progress
- Add dark mode
- Add CSV export
- Add recurring tasks and expenses

## Screenshot Placeholder

Add screenshots here later when the app is running.
