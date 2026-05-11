import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

export default function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Signed in as</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            {user?.email ?? 'Unknown'}
          </div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>
            role: <b>{user?.role}</b>
            {user?.hospitalId ? ` · hospitalId: ${user.hospitalId}` : ''}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/login">Login</Link>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      <hr style={{ margin: '16px 0' }} />
      <div style={{ opacity: 0.85 }}>
        Next: super admin dashboard for creating hospitals + hospital admins.
      </div>
    </div>
  );
}

