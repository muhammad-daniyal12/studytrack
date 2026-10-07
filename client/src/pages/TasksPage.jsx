import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const priorityValues = ['Low', 'Medium', 'High'];
const statusValues = ['Pending', 'Completed'];

const formatDate = (value) => {
  if (!value) return 'No date';
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filters, setFilters] = useState({
    status: 'All',
    priority: 'All',
    subject: 'All',
    search: '',
    sort: 'due_date',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const [tasksResponse, subjectsResponse] = await Promise.all([
        api.get('/tasks'),
        api.get('/subjects'),
      ]);

      setTasks(tasksResponse.data.data);
      setSubjects(subjectsResponse.data.data);
    } catch (err) {
      setError('Could not load tasks or subjects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (filters.status !== 'All') {
      result = result.filter((task) => task.status === filters.status);
    }

    if (filters.priority !== 'All') {
      result = result.filter((task) => task.priority === filters.priority);
    }

    if (filters.subject !== 'All') {
      result = result.filter((task) => String(task.subject_id) === String(filters.subject));
    }

    if (filters.search.trim()) {
      const keyword = filters.search.toLowerCase();
      result = result.filter((task) => task.title.toLowerCase().includes(keyword));
    }

    result.sort((a, b) => {
      if (filters.sort === 'priority') {
        const priorityRank = { High: 3, Medium: 2, Low: 1 };
        return priorityRank[b.priority] - priorityRank[a.priority];
      }

      if (filters.sort === 'newest') {
        return new Date(b.created_at) - new Date(a.created_at);
      }

      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date) - new Date(b.due_date);
    });

    return result;
  }, [tasks, filters]);

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) {
      return;
    }

    try {
      await api.delete(`/tasks/${taskId}`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Task could not be deleted.');
    }
  };

  const handleToggleStatus = async (task) => {
    try {
      await api.put(`/tasks/${task.id}`, {
        ...task,
        status: task.status === 'Completed' ? 'Pending' : 'Completed',
      });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update task.');
    }
  };

  if (loading) {
    return <div className="page-state">Loading tasks...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">Tasks</p>
          <h1>Task management</h1>
          <p className="page-subtitle">Plan your workload and keep important deadlines visible.</p>
        </div>
      </div>

      {error ? <div className="error-box">{error}</div> : null}

      <div className="section-toolbar">
        <div>
          <strong>{filteredTasks.length} task{filteredTasks.length === 1 ? '' : 's'}</strong>
          <span> matching your current view</span>
        </div>
        <Link to="/tasks/new" className="primary-button">Create task</Link>
      </div>

      <div className="filter-bar panel-card">
        <input
          type="text"
          placeholder="Search tasks by title"
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
        />

        <select value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}>
          <option value="All">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>

        <select value={filters.priority} onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}>
          <option value="All">All priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <select value={filters.subject} onChange={(e) => setFilters((prev) => ({ ...prev, subject: e.target.value }))}>
          <option value="All">All subjects</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>{subject.name}</option>
          ))}
        </select>

        <select value={filters.sort} onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}>
          <option value="due_date">Due date</option>
          <option value="priority">Priority</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      {filteredTasks.length > 0 ? (
        <div className="task-grid">
          {filteredTasks.map((task) => {
            const isOverdue = task.status === 'Pending' && task.due_date && new Date(task.due_date) < new Date(new Date().setHours(0, 0, 0, 0));

            return (
              <div key={task.id} className={`task-card ${task.status === 'Completed' ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}>
                <div className="task-card-header">
                  <div>
                    <h3>{task.title}</h3>
                    <p>{task.subject_name || 'No subject'}</p>
                  </div>
                  <span className={`task-pill ${task.priority.toLowerCase()}`}>{task.priority}</span>
                </div>

                <p className="task-description">{task.description || 'No description provided.'}</p>

                <div className="task-meta">
                  <span>Due: {formatDate(task.due_date)}</span>
                  <span>Status: {task.status}</span>
                </div>

                {isOverdue ? <span className="overdue-badge">OVERDUE</span> : null}

                <div className="button-row task-actions">
                  <button type="button" className="secondary-button" onClick={() => navigate(`/tasks/edit/${task.id}`)}>Edit</button>
                  <button type="button" className="secondary-button" onClick={() => handleToggleStatus(task)}>
                    {task.status === 'Completed' ? 'Mark pending' : 'Complete'}
                  </button>
                  <button type="button" className="danger-button" onClick={() => handleDelete(task.id)}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-box">
          <h3>No tasks found</h3>
          <p>You haven&apos;t created any tasks yet.</p>
          <Link to="/tasks/new" className="primary-button">Add your first task</Link>
        </div>
      )}
    </div>
  );
}

export function TaskFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    subject_id: '',
    due_date: '',
    priority: 'Medium',
    status: 'Pending',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const subjectResponse = await api.get('/subjects');
        setSubjects(subjectResponse.data.data);

        if (isEditing) {
          const taskResponse = await api.get(`/tasks/${id}`);
          const task = taskResponse.data.data;
          setForm({
            title: task.title,
            description: task.description || '',
            subject_id: task.subject_id ? String(task.subject_id) : '',
            due_date: task.due_date || '',
            priority: task.priority,
            status: task.status,
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load form data.');
      } finally {
        setLoading(false);
      }
    };

    loadFormData();
  }, [id, isEditing]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const payload = {
        ...form,
        subject_id: form.subject_id || null,
      };

      if (isEditing) {
        await api.put(`/tasks/${id}`, payload);
      } else {
        await api.post('/tasks', payload);
      }

      navigate('/tasks');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save task.');
    }
  };

  if (loading) {
    return <div className="page-state">Loading task form...</div>;
  }

  return (
    <div className="page-container narrow-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">Tasks</p>
          <h1>{isEditing ? 'Edit task' : 'Add task'}</h1>
        </div>
      </div>

      <div className="panel-card">
        {error ? <div className="error-box">{error}</div> : null}

        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Task title
            <input type="text" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required />
          </label>

          <label>
            Description
            <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} rows="4" />
          </label>

          <label>
            Subject
            <select value={form.subject_id} onChange={(e) => setForm((prev) => ({ ...prev, subject_id: e.target.value }))}>
              <option value="">Select a subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
          </label>

          <label>
            Due date
            <input type="date" value={form.due_date} onChange={(e) => setForm((prev) => ({ ...prev, due_date: e.target.value }))} />
          </label>

          <label>
            Priority
            <select value={form.priority} onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}>
              {priorityValues.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>

          <label>
            Status
            <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
              {statusValues.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>

          <div className="button-row">
            <button type="submit" className="primary-button">{isEditing ? 'Update task' : 'Save task'}</button>
            <button type="button" className="secondary-button" onClick={() => navigate('/tasks')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
