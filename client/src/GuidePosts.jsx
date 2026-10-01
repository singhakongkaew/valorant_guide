import { useEffect, useState } from 'react';
import { Footer, Header } from './Gunplay.jsx';
import { upload } from '@vercel/blob/client';
const API = import.meta.env.VITE_API_URL || '/api';
const TOKEN = 'valorant-guide-token';
const categories = ['gunplay', 'movement', 'agents', 'other'], levels = ['beginner', 'intermediate', 'advanced'];
async function api(path, options = {}) { const token = localStorage.getItem(TOKEN); const response = await fetch(`${API}/guides${path}`, { ...options, headers: { ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } }); const data = await response.json().catch(() => ({})); if (!response.ok) { const error = new Error(data.message || 'Request failed.'); error.fields = data.fields || {}; throw error; } return data; }
const statusText = (status) => ({ pending: '◷ Pending review', rejected: '! Rejected', hidden: '◉ Hidden', approved: '✓ Approved' }[status] || status);
const dateText = (date) => new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
export default function GuidePosts() { const path = location.pathname.replace(/\/$/, '') || '/guides'; const id = path.match(/^\/guides\/([^/]+)$/)?.[1]; if (path === '/guides/new' || path.endsWith('/edit')) return <PostForm id={path.endsWith('/edit') ? path.split('/')[2] : null} />; if (path === '/guides/mine') return <Mine />; if (path === '/admin/guides') return <Admin />; if (id) return <Detail id={id} />; return <Feed />; }
function Shell({ children }) { return <div className="gunplay-site"><Header activeSection="guides" /><main className="gunplay-main guide-main">{children}</main><Footer /></div>; }
function Feed() { const [posts, setPosts] = useState([]), [category, setCategory] = useState(''), [level, setLevel] = useState(''), [q, setQ] = useState(''), [error, setError] = useState(''), [page, setPage] = useState(1), [pages, setPages] = useState(1); useEffect(() => { const params = new URLSearchParams({ page: String(page), limit: '12' }); if (category) params.set('category', category); if (level) params.set('level', level); if (q) params.set('q', q); api(`/?${params}`).then((x) => { setPosts((current) => page === 1 ? x.posts || [] : [...current, ...(x.posts || [])]); setPages(x.pages || 1); setError(''); }).catch((e) => setError(e.message)); }, [category, level, q, page]); const filter = (setter) => (value) => { setter(value); setPage(1); }; return <Shell><div className="gunplay-intro"><p className="gunplay-eyebrow">Member discoveries</p><div className="guide-title-row"><h1>Guide Posts</h1><a className="guide-button" href={localStorage.getItem(TOKEN) ? '/guides/new' : '/auth?returnTo=%2Fguides%2Fnew'}>New post</a></div><p>Practical mechanics shared by the V/GUIDE community.</p></div><div className="guide-filter-row"><div className="level-filters">{['', ...categories].map((x) => <button key={x || 'all'} aria-pressed={category === x} onClick={() => filter(setCategory)(x)}>{x || 'All categories'}</button>)}</div><div className="level-filters">{['', ...levels].map((x) => <button key={x || 'any'} aria-pressed={level === x} onClick={() => filter(setLevel)(x)}>{x || 'Any level'}</button>)}</div><input aria-label="Search guide posts" placeholder="Search guides" value={q} onChange={(e) => filter(setQ)(e.target.value)} /></div>{error && <p role="alert">{error}</p>}{posts.length ? <section className="guide-grid">{posts.map((post) => <Card key={post._id} post={post} />)}</section> : <p className="guide-empty">No guides yet. Be the first to share one.</p>}{page < pages && <button className="guide-button" onClick={() => setPage((value) => value + 1)}>Load more</button>}</Shell>; }
function Card({ post }) { const cover = post.images?.[0]?.url || (post.videoYoutubeId ? `https://img.youtube.com/vi/${post.videoYoutubeId}/hqdefault.jpg` : ''); return <a className="guide-card" href={`/guides/${post._id}`}><div className="guide-cover">{cover ? <img src={cover} alt="" /> : <span>V/G</span>}</div><div className="guide-card-body"><div className="guide-badges"><span>{post.category}</span><span>{post.level}</span></div><strong>{post.title}</strong><span className="guide-byline">{post.author?.name || 'Member'} · {dateText(post.createdAt)}</span>{post.patchVersion && <small>Tested on patch {post.patchVersion}</small>}</div></a>; }
function PostForm({ id }) {
  const [form, setForm] = useState({ title: '', description: '', category: 'gunplay', agent: '', level: 'beginner', patchVersion: '', videoYoutubeId: '', agreed: false });
  const [images, setImages] = useState([]), [error, setError] = useState(''), [fields, setFields] = useState({}), [busy, setBusy] = useState(false), [loading, setLoading] = useState(Boolean(id));
  const token = localStorage.getItem(TOKEN);
  useEffect(() => {
    if (!token) { location.replace('/auth?returnTo=' + encodeURIComponent(id ? `/guides/${id}/edit` : '/guides/new')); return; }
    if (!id) return;
    api(`/${id}`).then(({ post }) => {
      if (!post.isMine) throw new Error('You can only edit your own guide posts.');
      setForm({ title: post.title || '', description: post.description || '', category: post.category || 'gunplay', agent: post.agent || '', level: post.level || 'beginner', patchVersion: post.patchVersion || '', videoYoutubeId: post.videoYoutubeId ? `https://youtu.be/${post.videoYoutubeId}` : '', agreed: false });
      setImages(post.images || []);
    }).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [id]);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const chooseFiles = async (event) => {
    const files = Array.from(event.target.files || []); event.target.value = '';
    if (images.length + files.length > 4) { setError('Choose up to 4 images.'); return; }
    if (files.some((file) => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024)) { setError('Choose JPG, PNG, or WebP images up to 5 MB each.'); return; }
    setError(''); setBusy(true);
    try {
      const sessionResponse = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      const session = await sessionResponse.json().catch(() => ({}));
      if (!sessionResponse.ok) throw new Error(session.message || 'Your session has expired.');
      const user = session.user;
      const uploaded = await Promise.all(files.map(async (file) => {
        const blob = await upload(`guide-posts/${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`, file, {
          access: 'public', handleUploadUrl: `${API}/guides/upload-token`, clientPayload: token,
        });
        return { url: blob.url, publicId: blob.pathname, width: 0, height: 0 };
      }));
      setImages((current) => [...current, ...uploaded]);
    } catch (e) { setError(e.message || 'Image upload failed.'); }
    finally { setBusy(false); }
  };
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setFields({});
    try {
      const result = await api(id ? `/${id}` : '/', { method: id ? 'PUT' : 'POST', body: JSON.stringify({ ...form, images }) });
      location.assign(`/guides/${result.post._id}`);
    } catch (e) { setError(e.message); setFields(e.fields || {}); setBusy(false); }
  };
  const fieldError = (key) => fields[key] && <small role="alert">{fields[key]}</small>;
  if (loading) return <Shell><p>Loading guide…</p></Shell>;
  return <Shell><div className="gunplay-intro"><p className="gunplay-eyebrow">Community knowledge</p><h1>{id ? 'Edit guide' : 'Share a guide'}</h1><p>Upload images directly to Vercel Blob and share what you have learned.</p></div>
    <form className="guide-form" onSubmit={submit}>
      {error && <p role="alert">{error}</p>}
      <label>Title<input required minLength="5" maxLength="100" value={form.title} aria-invalid={Boolean(fields.title)} onChange={(e) => update('title', e.target.value)} />{fieldError('title')}</label>
      <label>Description<textarea required minLength="20" maxLength="2000" rows="7" value={form.description} aria-invalid={Boolean(fields.description)} onChange={(e) => update('description', e.target.value)} />{fieldError('description')}</label>
      <div className="guide-form-row"><label>Category<select value={form.category} onChange={(e) => update('category', e.target.value)}>{categories.map((x) => <option key={x} value={x}>{x}</option>)}</select>{fieldError('category')}</label><label>Experience level<select value={form.level} onChange={(e) => update('level', e.target.value)}>{levels.map((x) => <option key={x} value={x}>{x}</option>)}</select>{fieldError('level')}</label></div>
      {form.category === 'agents' && <label>Agent<input maxLength="40" value={form.agent} onChange={(e) => update('agent', e.target.value)} />{fieldError('agent')}</label>}
      <div className="guide-form-row"><label>Patch version<input maxLength="10" value={form.patchVersion} onChange={(e) => update('patchVersion', e.target.value)} />{fieldError('patchVersion')}</label><label>YouTube video (optional)<input type="url" placeholder="https://youtu.be/..." value={form.videoYoutubeId} onChange={(e) => update('videoYoutubeId', e.target.value)} />{fieldError('videoYoutubeId')}</label></div>
      <label>Images<input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy || images.length >= 4} onChange={chooseFiles} /><small>Up to 4 JPG, PNG, or WebP images; 5 MB maximum per image. Files upload directly to Blob.</small>{fieldError('images')}</label>
      {images.length > 0 && <div className="guide-media">{images.map((image) => <div key={image.url}><img src={image.url} alt="Selected guide" /><button type="button" className="guide-button secondary" onClick={() => setImages((current) => current.filter((item) => item.url !== image.url))}>Remove image</button></div>)}</div>}
      <label className="guide-consent"><input type="checkbox" checked={form.agreed} onChange={(e) => update('agreed', e.target.checked)} />I have permission to share this content.</label>{fieldError('agreed')}
      <div className="guide-actions"><button className="guide-button" disabled={busy}>{busy ? 'Uploading…' : id ? 'Save guide' : 'Publish guide'}</button><a className="guide-button secondary" href={id ? `/guides/${id}` : '/guides'}>Cancel</a></div>
    </form>
  </Shell>;
}
function Detail({ id }) { const [post, setPost] = useState(null), [error, setError] = useState(''), [notice, setNotice] = useState(''); useEffect(() => { api(`/${id}`).then((x) => setPost(x.post)).catch((e) => setError(e.message)); }, [id]); const remove = async () => { if (confirm('Delete this guide post?')) { await api(`/${id}`, { method: 'DELETE' }); location.assign('/guides/mine'); } }; const report = async () => { if (confirm('Report this guide post for review?')) { try { await api(`/${id}/report`, { method: 'POST', body: JSON.stringify({ reason: 'Community report' }) }); setNotice('Report received.'); } catch (e) { setNotice(e.message); } } }; return <Shell>{error && <p role="alert">{error}</p>}{notice && <p role="status">{notice}</p>}{post && <><a className="back-link" href="/guides">← Community guides</a><article className="guide-detail"><div className="guide-media">{post.images?.map((image) => <img key={image.publicId || image.url} src={image.url} alt="Guide illustration" />)}{post.videoYoutubeId && <iframe title="Guide video" src={`https://www.youtube-nocookie.com/embed/${post.videoYoutubeId}`} allowFullScreen />}</div><div className="guide-copy"><div className="guide-badges"><span>{post.category}</span><span>{post.level}</span>{post.status !== 'approved' && <span>{statusText(post.status)}</span>}</div><h1>{post.title}</h1><span className="title-underline" /><p className="guide-byline">{post.author?.name} · {dateText(post.createdAt)}</p>{post.patchVersion && <p>Tested on patch {post.patchVersion}</p>}<p className="guide-description">{post.description}</p>{post.rejectionReason && <p>Review note: {post.rejectionReason}</p>}<div className="guide-actions">{post.isMine && <><a className="guide-button" href={`/guides/${id}/edit`}>Edit</a><button className="guide-button secondary" onClick={remove}>Delete</button></>}{localStorage.getItem(TOKEN) && !post.isMine && <button className="guide-button secondary" onClick={report}>Report</button>}</div></div></article></>}</Shell>; }
function Mine() { const [posts, setPosts] = useState([]), [error, setError] = useState(''); useEffect(() => { if (!localStorage.getItem(TOKEN)) location.replace('/auth?returnTo=%2Fguides%2Fmine'); else api('/mine').then((x) => setPosts(x.posts)).catch((e) => setError(e.message)); }, []); return <Shell><div className="gunplay-intro"><h1>My guide posts</h1></div>{error && <p role="alert">{error}</p>}<div className="guide-list">{posts.map((post) => <div className="guide-list-row" key={post._id}><a href={`/guides/${post._id}`}>{post.title}</a><span>{statusText(post.status)}</span><a href={`/guides/${post._id}/edit`}>Edit</a><button onClick={async () => { if (confirm('Delete this guide post?')) { await api(`/${post._id}`, { method: 'DELETE' }); setPosts((xs) => xs.filter((x) => x._id !== post._id)); } }}>Delete</button></div>)}</div></Shell>; }
function Admin() { const [posts, setPosts] = useState([]), [error, setError] = useState(''); useEffect(() => { api('/admin/pending').then((x) => setPosts(x.posts)).catch((e) => setError(e.message)); }, []); const decide = async (post, status) => { const reason = status === 'rejected' ? prompt('Reason for rejection?') : ''; if (status === 'rejected' && !reason) return; try { await api(`/${post._id}/status`, { method: 'PATCH', body: JSON.stringify({ status, reason }) }); setPosts((xs) => xs.filter((x) => x._id !== post._id)); } catch (e) { setError(e.message); } }; return <Shell><div className="gunplay-intro"><h1>Guide post review</h1></div>{error && <p role="alert">{error}</p>}{posts.map((post) => <article className="guide-review" key={post._id}><h2>{post.title}</h2><p>{post.description}</p><small>{post.author?.name} · {statusText(post.status)} · {post.reportCount} reports</small><div><button onClick={() => decide(post, 'approved')}>Approve</button><button onClick={() => decide(post, 'rejected')}>Reject</button></div></article>)}</Shell>; }
