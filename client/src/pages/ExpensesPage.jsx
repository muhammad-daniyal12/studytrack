import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const formatCurrency = (value) => `Rs ${Number(value || 0).toLocaleString()}`;
const formatDate = (value) => {
  if (!value) return 'No date';
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const categories = ['Food', 'Transport', 'Hostel', 'Study', 'Entertainment', 'Shopping', 'Other'];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [category, setCategory] = useState('All');
  const [month, setMonth] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadExpenses = async () => {
    try {
      const response = await api.get('/expenses');
      setExpenses(response.data.data);
    } catch (err) {
      setError('Could not load expenses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const categoryMatches = category === 'All' || expense.category === category;
      const monthMatches = month === 'All' || expense.date.startsWith(month);
      const searchMatches = !search || expense.title.toLowerCase().includes(search.toLowerCase());
      return categoryMatches && monthMatches && searchMatches;
    });
  }, [expenses, category, month, search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;

    try {
      await api.delete(`/expenses/${id}`);
      loadExpenses();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete expense.');
    }
  };

  if (loading) {
    return <div className="page-state">Loading expenses...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">Expenses</p>
          <h1>Track your spending</h1>
          <p className="page-subtitle">Keep a clear view of where your money goes.</p>
        </div>
      </div>

      {error ? <div className="error-box">{error}</div> : null}

      <div className="section-toolbar">
        <div>
          <strong>{filteredExpenses.length} expense{filteredExpenses.length === 1 ? '' : 's'}</strong>
          <span> matching your current view</span>
        </div>
        <Link to="/expenses/new" className="primary-button">Record expense</Link>
      </div>

      <div className="filter-bar panel-card">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search expenses" />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="All">All categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="All">All months</option>
          <option value="2026-10">October 2026</option>
          <option value="2026-11">November 2026</option>
          <option value="2026-12">December 2026</option>
        </select>
      </div>

      {filteredExpenses.length > 0 ? (
        <div className="expenses-grid">
          {filteredExpenses.map((expense) => (
            <div key={expense.id} className="expense-card">
              <div className="expense-head">
                <div>
                  <h3>{expense.title}</h3>
                  <p>{expense.category}</p>
                </div>
                <strong>{formatCurrency(expense.amount)}</strong>
              </div>

              <div className="expense-details">
                <span>{formatDate(expense.date)}</span>
                <span>{expense.description || 'No notes'}</span>
              </div>

              <div className="button-row">
                <Link to={`/expenses/edit/${expense.id}`} className="secondary-button inline-button">Edit</Link>
                <button type="button" className="danger-button" onClick={() => handleDelete(expense.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-box">
          <h3>No expenses recorded yet</h3>
          <p>You haven&apos;t added any expenses.</p>
          <Link to="/expenses/new" className="primary-button">Add your first expense</Link>
        </div>
      )}
    </div>
  );
}

export function ExpenseFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'Food',
    date: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadExpense = async () => {
      try {
        if (isEditing) {
          const response = await api.get(`/expenses/${id}`);
          const expense = response.data.data;
          setForm({
            title: expense.title,
            amount: expense.amount,
            category: expense.category,
            date: expense.date,
            description: expense.description || '',
          });
        } else {
          setForm((prev) => ({ ...prev, date: new Date().toISOString().slice(0, 10) }));
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load form data.');
      } finally {
        setLoading(false);
      }
    };

    loadExpense();
  }, [id, isEditing]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      if (isEditing) {
        await api.put(`/expenses/${id}`, form);
      } else {
        await api.post('/expenses', form);
      }

      navigate('/expenses');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save expense.');
    }
  };

  if (loading) {
    return <div className="page-state">Loading expense form...</div>;
  }

  return (
    <div className="page-container narrow-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">Expenses</p>
          <h1>{isEditing ? 'Edit expense' : 'Add expense'}</h1>
        </div>
      </div>

      <div className="panel-card">
        {error ? <div className="error-box">{error}</div> : null}

        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Title
            <input type="text" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required />
          </label>

          <label>
            Amount (Rs)
            <input type="number" min="1" value={form.amount} onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))} required />
          </label>

          <label>
            Category
            <select value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}>
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>

          <label>
            Date
            <input type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} required />
          </label>

          <label>
            Description
            <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} rows="4" />
          </label>

          <div className="button-row">
            <button type="submit" className="primary-button">{isEditing ? 'Update expense' : 'Save expense'}</button>
            <button type="button" className="secondary-button" onClick={() => navigate('/expenses')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
