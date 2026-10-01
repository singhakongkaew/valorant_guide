import { useCallback, useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'valorant-guide-token';

async function request(path, token, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(data.message || 'Request failed'); error.status = response.status; throw error; }
  return data;
}

export default function Auth() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const loadSession = useCallback(async (currentToken) => {
    const data = await request('/auth/me', currentToken);
    setUser(data.user);
    if (data.user.role === 'admin') {
      const result = await request('/admin/users', currentToken);
      setUsers(result.users);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    setError('');
    loadSession(token).catch((err) => {
      if (err.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
        setUsers([]);
      } else {
        setError(err.message);
      }
    });
  }, [token, loadSession]);

  const submit = async (event) => {
    event.preventDefault(); setError(''); setNotice(''); setBusy(true);
    try {
      const data = await request(`/auth/${mode}`, null, { method: 'POST', body: JSON.stringify(form) });
      localStorage.setItem(TOKEN_KEY, data.token); window.location.assign(new URLSearchParams(window.location.search).get('returnTo') || '/');
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const updateUser = async (id, changes) => {
    setError(''); setNotice('');
    try {
      const result = await request(`/admin/users/${id}`, token, { method: 'PATCH', body: JSON.stringify(changes) });
      setUsers((current) => current.map((item) => item.id === id ? result.user : item));
      setNotice('à¸šà¸±à¸™à¸—à¸¶à¸à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸œà¸¹à¹‰à¹ƒà¸Šà¹‰à¹à¸¥à¹‰à¸§');
    } catch (err) { setError(err.message); }
  };

  const logout = () => { localStorage.removeItem(TOKEN_KEY); setToken(null); setUser(null); setUsers([]); setNotice('à¸­à¸­à¸à¸ˆà¸²à¸à¸£à¸°à¸šà¸šà¹à¸¥à¹‰à¸§'); };

  return <div className="auth-page">
    <header className="auth-topbar"><a className="auth-brand" href="/">V<span>/</span>GUIDE</a><a href="/">à¸à¸¥à¸±à¸šà¹„à¸›à¸«à¸™à¹‰à¸²à¹„à¸à¸”à¹Œ</a></header>
    <main className="auth-main">
      <p className="auth-kicker">VALORANT MECHANICS FIELD GUIDE</p>
      {!user ? <section className="auth-card">
        <p className="auth-kicker">ACCOUNT ACCESS</p><h1>{mode === 'login' ? 'à¹€à¸‚à¹‰à¸²à¸ªà¸¹à¹ˆà¸£à¸°à¸šà¸š' : 'à¸ªà¸£à¹‰à¸²à¸‡à¸šà¸±à¸à¸Šà¸µ'}</h1>
        <p className="auth-subtitle">{mode === 'login' ? 'à¹€à¸‚à¹‰à¸²à¸ªà¸¹à¹ˆà¸£à¸°à¸šà¸šà¹€à¸žà¸·à¹ˆà¸­à¸ˆà¸±à¸”à¸à¸²à¸£à¸šà¸±à¸à¸Šà¸µà¸‚à¸­à¸‡à¸„à¸¸à¸“' : 'à¸ªà¸¡à¸±à¸„à¸£à¸ªà¸¡à¸²à¸Šà¸´à¸à¹€à¸žà¸·à¹ˆà¸­à¹€à¸£à¸´à¹ˆà¸¡à¹ƒà¸Šà¹‰à¸‡à¸²à¸™à¸£à¸°à¸šà¸š'}</p>
        <form onSubmit={submit} className="auth-form">
          {mode === 'register' && <label>à¸Šà¸·à¹ˆà¸­à¸—à¸µà¹ˆà¹à¸ªà¸”à¸‡<input autoComplete="name" minLength="2" maxLength="80" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>}
          <label>à¸­à¸µà¹€à¸¡à¸¥<input type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label>à¸£à¸«à¸±à¸ªà¸œà¹ˆà¸²à¸™<input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength="8" maxLength="128" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
          {error && <p className="auth-message is-error" role="alert">{error}</p>}{notice && <p className="auth-message" role="status">{notice}</p>}
          <button className="auth-submit" disabled={busy}>{busy ? 'à¸à¸³à¸¥à¸±à¸‡à¸”à¸³à¹€à¸™à¸´à¸™à¸à¸²à¸£â€¦' : mode === 'login' ? 'à¹€à¸‚à¹‰à¸²à¸ªà¸¹à¹ˆà¸£à¸°à¸šà¸š' : 'à¸ªà¸¡à¸±à¸„à¸£à¸ªà¸¡à¸²à¸Šà¸´à¸'}</button>
        </form>
        <button className="auth-switch" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}> {mode === 'login' ? 'à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¸¡à¸µà¸šà¸±à¸à¸Šà¸µ? à¸ªà¸¡à¸±à¸„à¸£à¸ªà¸¡à¸²à¸Šà¸´à¸' : 'à¸¡à¸µà¸šà¸±à¸à¸Šà¸µà¹à¸¥à¹‰à¸§? à¹€à¸‚à¹‰à¸²à¸ªà¸¹à¹ˆà¸£à¸°à¸šà¸š'}</button>
      </section> : <section className="auth-dashboard">
        <div className="auth-welcome"><div><p className="auth-kicker">SIGNED IN AS {user.role.toUpperCase()}</p><h1>{user.name}</h1><p>{user.email}</p></div><button className="auth-logout" onClick={logout}>Sign out</button></div>
        {error && <p className="auth-message is-error" role="alert">{error}</p>}{notice && <p className="auth-message" role="status">{notice}</p>}
        {user.role === 'admin' ? <><section className="admin-overview"><div className="admin-overview-copy"><p className="auth-kicker">CONTROL ROOM / V/GUIDE</p><h2>Admin console</h2><p>Manage member access and keep community guides on track.</p></div><a className="admin-review-link" href="/admin/guides"><span className="admin-review-icon" aria-hidden="true">+</span><span><strong>Review guide posts</strong><small>Open the community review queue</small></span><b aria-hidden="true">&gt;</b></a></section><section className="admin-panel"><div className="admin-heading"><div><p className="auth-kicker">ADMIN CONSOLE</p><h2>à¸ˆà¸±à¸”à¸à¸²à¸£à¸œà¸¹à¹‰à¹ƒà¸Šà¹‰</h2></div><span>{users.length} ACCOUNTS</span></div>
          <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>à¸Šà¸·à¹ˆà¸­à¹à¸¥à¸°à¸­à¸µà¹€à¸¡à¸¥</th><th>à¸šà¸—à¸šà¸²à¸—</th><th>à¸ªà¸–à¸²à¸™à¸°</th><th>à¸ˆà¸±à¸”à¸à¸²à¸£</th></tr></thead><tbody>{users.map((item) => <UserRow key={item.id} user={item} onSave={(changes) => updateUser(item.id, changes)} />)}</tbody></table></div>
        </section></> : <section className="auth-card auth-profile"><p className="auth-kicker">YOUR PROFILE</p><h2>à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸šà¸±à¸à¸Šà¸µ</h2><p>à¸Šà¸·à¹ˆà¸­: {user.name}</p><p>à¸­à¸µà¹€à¸¡à¸¥: {user.email}</p><p>à¸šà¸—à¸šà¸²à¸—: à¸ªà¸¡à¸²à¸Šà¸´à¸</p></section>}
      </section>}
    </main>
  </div>;
}

function UserRow({ user, onSave }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  return <tr><td><div className="admin-user-edit"><input aria-label={`à¸Šà¸·à¹ˆà¸­ ${user.email}`} value={name} onChange={(e) => setName(e.target.value)} /><input aria-label={`à¸­à¸µà¹€à¸¡à¸¥ ${user.email}`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div></td>
    <td><select aria-label={`à¸šà¸—à¸šà¸²à¸— ${user.email}`} value={role} onChange={(e) => setRole(e.target.value)}><option value="user">user</option><option value="admin">admin</option></select></td>
    <td><span className={`status-pill ${user.isActive ? 'active' : ''}`}>{user.isActive ? 'à¹ƒà¸Šà¹‰à¸‡à¸²à¸™' : 'à¸›à¸´à¸”à¹ƒà¸Šà¹‰à¸‡à¸²à¸™'}</span></td>
    <td><div className="admin-actions"><button onClick={() => onSave({ name, email, role })}>à¸šà¸±à¸™à¸—à¸¶à¸</button><button className="admin-toggle" onClick={() => onSave({ isActive: !user.isActive })}>{user.isActive ? 'à¸›à¸´à¸”à¸šà¸±à¸à¸Šà¸µ' : 'à¹€à¸›à¸´à¸”à¸šà¸±à¸à¸Šà¸µ'}</button></div></td></tr>;
}
