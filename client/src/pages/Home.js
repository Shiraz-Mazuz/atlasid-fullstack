
import { Link, useNavigate } from 'react-router-dom';
import { getUser, logout } from '../auth';

export default function Home() {
  const user = getUser();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <p>Not logged in.</p>
        <Link to="/login">Go to login</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Welcome, {user.name}</h1>
      <p>Role: {user.role}</p>

      <div style={{ marginTop: 20 }}>
        <Link to="/users">Go to Users list</Link>
      </div>

      <button onClick={handleLogout} style={{ marginTop: 20 }}>
        Logout
      </button>
    </div>
  );
}
