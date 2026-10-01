import { useCallback, useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'valorant-guide-token';

async function request(path, token, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง');
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
    loadSession(token).catch(() => { localStorage.removeItem(TOKEN_KEY); setToken(null); });
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
      setNotice('บันทึกข้อมูลผู้ใช้แล้ว');
    } catch (err) { setError(err.message); }
  };

  const logout = () => { localStorage.removeItem(TOKEN_KEY); setToken(null); setUser(null); setUsers([]); setNotice('ออกจากระบบแล้ว'); };

  return <div className="auth-page">
    <header className="auth-topbar"><a className="auth-brand" href="/">V<span>/</span>GUIDE</a><a href="/">กลับไปหน้าไกด์</a></header>
    <main className="auth-main">
      <p className="auth-kicker">VALORANT MECHANICS FIELD GUIDE</p>
      {!user ? <section className="auth-card">
        <p className="auth-kicker">ACCOUNT ACCESS</p><h1>{mode === 'login' ? 'เข้าสู่ระบบ' : 'สร้างบัญชี'}</h1>
        <p className="auth-subtitle">{mode === 'login' ? 'เข้าสู่ระบบเพื่อจัดการบัญชีของคุณ' : 'สมัครสมาชิกเพื่อเริ่มใช้งานระบบ'}</p>
        <form onSubmit={submit} className="auth-form">
          {mode === 'register' && <label>ชื่อที่แสดง<input autoComplete="name" minLength="2" maxLength="80" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>}
          <label>อีเมล<input type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label>รหัสผ่าน<input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength="8" maxLength="128" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
          {error && <p className="auth-message is-error" role="alert">{error}</p>}{notice && <p className="auth-message" role="status">{notice}</p>}
          <button className="auth-submit" disabled={busy}>{busy ? 'กำลังดำเนินการ…' : mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</button>
        </form>
        <button className="auth-switch" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}> {mode === 'login' ? 'ยังไม่มีบัญชี? สมัครสมาชิก' : 'มีบัญชีแล้ว? เข้าสู่ระบบ'}</button>
      </section> : <section className="auth-dashboard">
        <div className="auth-welcome"><div><p className="auth-kicker">SIGNED IN AS {user.role.toUpperCase()}</p><h1>{user.name}</h1><p>{user.email}</p></div><button className="auth-logout" onClick={logout}>Sign out</button></div>
        {error && <p className="auth-message is-error" role="alert">{error}</p>}{notice && <p className="auth-message" role="status">{notice}</p>}
        {user.role === 'admin' ? <><section className="admin-overview"><div className="admin-overview-copy"><p className="auth-kicker">CONTROL ROOM / V/GUIDE</p><h2>Admin console</h2><p>Manage member access and keep community guides on track.</p></div><a className="admin-review-link" href="/admin/guides"><span className="admin-review-icon" aria-hidden="true">+</span><span><strong>Review guide posts</strong><small>Open the community review queue</small></span><b aria-hidden="true">&gt;</b></a></section><section className="admin-panel"><div className="admin-heading"><div><p className="auth-kicker">ADMIN CONSOLE</p><h2>จัดการผู้ใช้</h2></div><span>{users.length} ACCOUNTS</span></div>
          <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>ชื่อและอีเมล</th><th>บทบาท</th><th>สถานะ</th><th>จัดการ</th></tr></thead><tbody>{users.map((item) => <UserRow key={item.id} user={item} onSave={(changes) => updateUser(item.id, changes)} />)}</tbody></table></div>
        </section></> : <section className="auth-card auth-profile"><p className="auth-kicker">YOUR PROFILE</p><h2>ข้อมูลบัญชี</h2><p>ชื่อ: {user.name}</p><p>อีเมล: {user.email}</p><p>บทบาท: สมาชิก</p></section>}
      </section>}
    </main>
  </div>;
}

function UserRow({ user, onSave }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  return <tr><td><div className="admin-user-edit"><input aria-label={`ชื่อ ${user.email}`} value={name} onChange={(e) => setName(e.target.value)} /><input aria-label={`อีเมล ${user.email}`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div></td>
    <td><select aria-label={`บทบาท ${user.email}`} value={role} onChange={(e) => setRole(e.target.value)}><option value="user">user</option><option value="admin">admin</option></select></td>
    <td><span className={`status-pill ${user.isActive ? 'active' : ''}`}>{user.isActive ? 'ใช้งาน' : 'ปิดใช้งาน'}</span></td>
    <td><div className="admin-actions"><button onClick={() => onSave({ name, email, role })}>บันทึก</button><button className="admin-toggle" onClick={() => onSave({ isActive: !user.isActive })}>{user.isActive ? 'ปิดบัญชี' : 'เปิดบัญชี'}</button></div></td></tr>;
}
