
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { saveAuth } from '../auth';

export default function Login() {
  const [email, setEmail] = useState('admin@atlasid.com'); // לנוחות
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      saveAuth(token, user);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Email או סיסמה לא נכונים');
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', border: '1px solid #ccc', padding: 20, borderRadius: 8 }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>Email:</label><br />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Password:</label><br />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
