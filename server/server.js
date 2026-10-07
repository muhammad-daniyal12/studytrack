require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  // Vite moves to the next available port when 5173 is already occupied.
  // Allow local development clients on localhost/127.0.0.1 without opening
  // the API to arbitrary external origins.
  origin: /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/,
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'StudyTrack backend is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`StudyTrack server running on http://localhost:${PORT}`);
});
