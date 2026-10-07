import { useEffect, useState } from 'react';
import api from '../services/api';

const formatDate = (value) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const response = await api.get('/user/profile');
      setProfile(response.data.data);
      setName(response.data.data.name);
    } catch (err) {
      setError('Could not load profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const response = await api.put('/user/profile', { name });
      const updatedUser = response.data.data;
      const storedUser = JSON.parse(localStorage.getItem('studytrack_user') || '{}');
      storedUser.name = updatedUser.name;
      localStorage.setItem('studytrack_user', JSON.stringify(storedUser));
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update profile.');
    }
  };

  if (loading) {
    return <div className="page-state">Loading profile...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">Profile</p>
          <h1>Your account</h1>
        </div>
      </div>

      {error ? <div className="error-box">{error}</div> : null}

      <div className="two-column-grid">
        <div className="panel-card">
          <h2>Profile details</h2>
          {profile ? (
            <ul className="profile-list">
              <li><strong>Name:</strong> {profile.name}</li>
              <li><strong>Email:</strong> {profile.email}</li>
              <li><strong>Created:</strong> {formatDate(profile.created_at)}</li>
            </ul>
          ) : null}
        </div>

        <div className="panel-card">
          <h2>Edit name</h2>
          <form onSubmit={handleSubmit} className="form-grid">
            <label>
              Name
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>

            <button type="submit" className="primary-button">Update profile</button>
          </form>
        </div>
      </div>

      <div className="stats-grid simple-grid">
        <div className="stat-card">
          <div className="stat-title">Tasks created</div>
          <div className="stat-value">{profile?.stats?.totalTasks || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Completed tasks</div>
          <div className="stat-value">{profile?.stats?.completedTasks || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Subjects</div>
          <div className="stat-value">{profile?.stats?.totalSubjects || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Expenses</div>
          <div className="stat-value">{profile?.stats?.totalExpenses || 0}</div>
        </div>
      </div>
    </div>
  );
}
