import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const formatDate = (value) => {
  if (!value) return 'No due date';
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadSubjects = async () => {
    try {
      const response = await api.get('/subjects');
      setSubjects(response.data.data);
    } catch (err) {
      setError('Could not load subjects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setError('Subject name cannot be empty.');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/subjects/${editingId}`, { name });
      } else {
        await api.post('/subjects', { name });
      }

      setName('');
      setEditingId(null);
      setError('');
      loadSubjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save subject.');
    }
  };

  const handleEdit = (subject) => {
    setEditingId(subject.id);
    setName(subject.name);
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subject?')) return;

    try {
      await api.delete(`/subjects/${id}`);
      loadSubjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete subject.');
    }
  };

  if (loading) {
    return <div className="page-state">Loading subjects...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">Subjects</p>
          <h1>Manage your subjects</h1>
        </div>
      </div>

      <div className="two-column-grid">
        <div className="panel-card">
          <h2>{editingId ? 'Edit subject' : 'Add subject'}</h2>
          {error ? <div className="error-box">{error}</div> : null}
          <form onSubmit={handleSubmit} className="form-grid">
            <label>
              Subject name
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>

            <div className="button-row">
              <button type="submit" className="primary-button">
                {editingId ? 'Update subject' : 'Add subject'}
              </button>
              {editingId ? (
                <button type="button" className="secondary-button" onClick={() => { setEditingId(null); setName(''); }}>
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="panel-card">
          <h2>Your subjects</h2>
          {subjects.length > 0 ? (
            <ul className="list-stack">
              {subjects.map((subject) => (
                <li key={subject.id} className="list-item item-flex">
                  <div>
                    <strong>{subject.name}</strong>
                    <p>Created {formatDate(subject.created_at)}</p>
                  </div>
                  <div className="button-row small-gap">
                    <button type="button" className="secondary-button" onClick={() => handleEdit(subject)}>Edit</button>
                    <button type="button" className="danger-button" onClick={() => handleDelete(subject.id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">No subjects yet. Add your first subject.</p>
          )}
        </div>
      </div>
    </div>
  );
}
