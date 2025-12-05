
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  async function loadUsers() {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load users (צריך להיות מחובר כאדמין)');
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm('בטוח למחוק?')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Users</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <div style={{ marginBottom: 10 }}>
        <Link to="/users/new">Create new user</Link>
      </div>

      <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <Link to={`/users/${u.id}/edit`}>Edit</Link>
                {' | '}
                <button onClick={() => handleDelete(u.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan="5">No users</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
