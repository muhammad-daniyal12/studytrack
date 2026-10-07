import { useEffect, useState } from 'react';
import api from '../services/api';
import StatCard from '../components/StatCard';

const formatCurrency = (value) => `Rs ${Number(value || 0).toLocaleString()}`;
const formatDate = (dateString) => {
  if (!dateString) return 'No date';

  try {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data.data);
      } catch (error) {
        console.error('Dashboard load error', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <div className="page-state">Loading dashboard...</div>;
  }

  if (!stats) {
    return <div className="page-state">Could not load dashboard data.</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Dashboard</h1>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard title="Total Tasks" value={stats.totalTasks} subtitle="All tasks" />
        <StatCard title="Pending Tasks" value={stats.pendingTasks} subtitle="Need attention" />
        <StatCard title="Completed Tasks" value={stats.completedTasks} subtitle={`${stats.completionRate}% complete`} />
        <StatCard title="High Priority Tasks" value={stats.highPriorityTasks} subtitle="Important tasks" />
        <StatCard title="Total Subjects" value={stats.totalSubjects} subtitle="Your subjects" />
        <StatCard title="Expenses This Month" value={formatCurrency(stats.monthlyExpenses)} subtitle="Current month" />
      </div>

      <div className="two-column-grid">
        <div className="panel-card">
          <h2>Upcoming deadlines</h2>
          {stats.upcomingTasks.length > 0 ? (
            <ul className="list-stack">
              {stats.upcomingTasks.map((task) => (
                <li key={task.id} className="list-item">
                  <div>
                    <strong>{task.title}</strong>
                    <p>{task.subject_name || 'General'}</p>
                  </div>
                  <span>Due: {formatDate(task.due_date)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">No upcoming tasks. Great job.</p>
          )}
        </div>

        <div className="panel-card">
          <h2>Recent expenses</h2>
          {stats.recentExpenses.length > 0 ? (
            <ul className="list-stack">
              {stats.recentExpenses.map((expense) => (
                <li key={expense.id} className="list-item">
                  <div>
                    <strong>{expense.title}</strong>
                    <p>{expense.category}</p>
                  </div>
                  <span>{formatCurrency(expense.amount)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">No recent expenses recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
