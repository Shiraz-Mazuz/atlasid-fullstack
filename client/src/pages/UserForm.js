
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

export default function UserForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      api.get(`/users/${id}`)
        .then(res => {
          const u = res.data;
          setName(u.name);
          setEmail(u.email);
          setRole(u.role);
        })
        .catch(err => {
          console.error(err);
          setError('Failed to load user');
        });
    }
  }, [id, isEdit]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    try {
      const body = { name, email, role };
      if (password) body.password = password;

      if (isEdit) {
        await api.put(`/users/${id}`, body);
      } else {
        if (!password) {
          return setError('Password נדרש ביצירה');
        }
        await api.post('/users', { ...body, password });
      }

      navigate('/users');
    } catch (err) {
      console.error(err);
      setError('Save failed');
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '50px auto' }}>
      <h2>{isEdit ? 'Edit user' : 'Create user'}</h2>
      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>Name:</label><br />
          <input value={name} onChange={e => setName(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Email:</label><br />
          <input value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Role:</label><br />
          <select value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%' }}>
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Password {isEdit ? '(optional)' : '(required)'}:</label><br />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <button type="submit">{isEdit ? 'Save changes' : 'Create user'}</button>
      </form>
    </div>
  );
}
