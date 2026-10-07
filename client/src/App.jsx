import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import DashboardPage from './pages/DashboardPage';
import ExpensesPage, { ExpenseFormPage } from './pages/ExpensesPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import SubjectsPage from './pages/SubjectsPage';
import TasksPage, { TaskFormPage } from './pages/TasksPage';

function PublicOnlyRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="page-state">Loading...</div>;
  }

  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/tasks/new" element={<TaskFormPage />} />
            <Route path="/tasks/edit/:id" element={<TaskFormPage />} />
            <Route path="/subjects" element={<SubjectsPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/expenses/new" element={<ExpenseFormPage />} />
            <Route path="/expenses/edit/:id" element={<ExpenseFormPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
