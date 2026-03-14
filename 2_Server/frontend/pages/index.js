import { useEffect, useState } from 'react';
import { getUsers, createUser, toggleUser, deleteUser, getLogs } from '../lib/api';

const EXTENSIONS = [
  { id: 'ext_viral_post_finder', label: 'Viral Post Finder' },
  // Add more extensions here as you build them
];

export default function Dashboard() {
  const [users, setUsers]       = useState([]);
  const [logs, setLogs]         = useState([]);
  const [tab, setTab]           = useState('users');
  const [extFilter, setExtFilter] = useState('');
  const [newUser, setNewUser]   = useState({ name: '', email: '', extension_id: 'ext_viral_post_finder' });
  const [loading, setLoading]   = useState(false);
  const [copied, setCopied]     = useState(null);
  const [search, setSearch]     = useState('');

  const load = async () => {
    const [u, l] = await Promise.all([getUsers(), getLogs(200, extFilter || null)]);
    setUsers(u.data);
    setLogs(l.data);
  };

  useEffect(() => { load(); }, [extFilter]);

  const handleCreate = async () => {
    if (!newUser.name.trim()) return alert('Enter a name');
    setLoading(true);
    const res = await createUser(newUser);
    setLoading(false);
    setNewUser({ name: '', email: '', extension_id: newUser.extension_id });
    load();
    // Auto-copy new key
    await navigator.clipboard.writeText(res.data.license_key);
    alert(`✅ Key created & copied:\n${res.data.license_key}`);
  };

  const handleToggle = async (id) => { await toggleUser(id); load(); };
  const handleDelete = async (id) => {
    if (!confirm('Delete this user permanently?')) return;
    await deleteUser(id); load();
  };

  const copyKey = async (key, id) => {
    await navigator.clipboard.writeText(key);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const activeCount   = users.filter(u => u.enabled).length;
  const disabledCount = users.filter(u => !u.enabled).length;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color:'#1a1a2e' }}>🔑 Extension Control Panel</h1>
          <p style={{ fontSize: 12, color:'#888', marginTop: 4 }}>Viral Post Finder — License Manager</p>
        </div>
        <div style={{ display:'flex', gap: 12 }}>
          {[
            { label: 'Total', value: users.length, color: '#1877f2' },
            { label: 'Active', value: activeCount, color: '#27ae60' },
            { label: 'Disabled', value: disabledCount, color: '#e74c3c' },
          ].map(s => (
            <div key={s.label} style={{ textAlign:'center', padding:'8px 16px',
              background:'white', borderRadius: 8, boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color:'#888' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap: 8, marginBottom: 20 }}>
        {['users','logs'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:'8px 20px', borderRadius: 6, border:'none', cursor:'pointer', fontWeight: 600,
            background: tab === t ? '#1877f2' : 'white',
            color: tab === t ? 'white' : '#555',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
          }}>
            {t === 'users' ? `👥 Users (${users.length})` : `📋 Activity Logs (${logs.length})`}
          </button>
        ))}
        <select value={extFilter} onChange={e => setExtFilter(e.target.value)}
          style={{ marginLeft:'auto', padding:'8px 12px', borderRadius:6, border:'1px solid #ddd',
            background:'white', fontSize: 13, cursor:'pointer' }}>
          <option value="">All Extensions</option>
          {EXTENSIONS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
        </select>
      </div>

      {/* USERS TAB */}
      {tab === 'users' && (
        <div>
          {/* Add new user */}
          <div style={{ background:'white', padding: 16, borderRadius: 10,
            boxShadow:'0 1px 4px rgba(0,0,0,0.08)', marginBottom: 20,
            display:'flex', gap: 10, flexWrap:'wrap', alignItems:'center' }}>
            <input placeholder="Name *" value={newUser.name}
              onChange={e => setNewUser({...newUser, name: e.target.value})}
              style={{ padding:'9px 12px', border:'1px solid #ddd', borderRadius: 6,
                fontSize: 13, width: 160 }} />
            <input placeholder="Email (optional)" value={newUser.email}
              onChange={e => setNewUser({...newUser, email: e.target.value})}
              style={{ padding:'9px 12px', border:'1px solid #ddd', borderRadius: 6,
                fontSize: 13, width: 200 }} />
            <select value={newUser.extension_id}
              onChange={e => setNewUser({...newUser, extension_id: e.target.value})}
              style={{ padding:'9px 12px', border:'1px solid #ddd', borderRadius: 6,
                fontSize: 13, cursor:'pointer' }}>
              {EXTENSIONS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
            </select>
            <button onClick={handleCreate} disabled={loading} style={{
              padding:'9px 18px', background:'#27ae60', color:'white', border:'none',
              borderRadius: 6, fontWeight: 700, cursor:'pointer', fontSize: 13 }}>
              {loading ? 'Creating...' : '+ Generate Key'}
            </button>
            <input placeholder="Search users..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ marginLeft:'auto', padding:'9px 12px', border:'1px solid #ddd',
                borderRadius: 6, fontSize: 13, width: 180 }} />
          </div>

          {/* Users table */}
          <div style={{ background:'white', borderRadius: 10, boxShadow:'0 1px 4px rgba(0,0,0,0.08)', overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background:'#f8f9fa' }}>
                  {['Name','Email','Extension','License Key','Status','Last Seen','Actions'].map(h => (
                    <th key={h} style={{ padding:'11px 14px', textAlign:'left',
                      borderBottom:'1px solid #eee', fontWeight:600, color:'#555', fontSize:12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} style={{ borderBottom:'1px solid #f0f0f0' }}>
                    <td style={{ padding:'11px 14px', fontWeight:600 }}>{u.name}</td>
                    <td style={{ padding:'11px 14px', color:'#888' }}>{u.email || '—'}</td>
                    <td style={{ padding:'11px 14px', fontSize:11, color:'#666' }}>
                      {EXTENSIONS.find(e => e.id === u.extension_id)?.label || u.extension_id}
                    </td>
                    <td style={{ padding:'11px 14px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap: 6 }}>
                        <code style={{ fontSize:11, background:'#f4f4f4', padding:'3px 6px',
                          borderRadius: 4, letterSpacing:0.5 }}>{u.license_key}</code>
                        <button onClick={() => copyKey(u.license_key, u.id)}
                          style={{ padding:'2px 8px', fontSize:11, background: copied===u.id ? '#27ae60' :'#eee',
                            color: copied===u.id ? 'white':'#555', border:'none', borderRadius:4, cursor:'pointer' }}>
                          {copied === u.id ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </td>
                    <td style={{ padding:'11px 14px' }}>
                      <span style={{ padding:'3px 10px', borderRadius:12, fontSize:11, fontWeight:700,
                        background: u.enabled ? '#e8f5e9':'#fdecea',
                        color: u.enabled ? '#27ae60':'#e74c3c' }}>
                        {u.enabled ? '● Active' : '● Disabled'}
                      </span>
                    </td>
                    <td style={{ padding:'11px 14px', color:'#999', fontSize:11 }}>
                      {u.last_seen ? new Date(u.last_seen).toLocaleString() : 'Never'}
                    </td>
                    <td style={{ padding:'11px 14px' }}>
                      <div style={{ display:'flex', gap: 6 }}>
                        <button onClick={() => handleToggle(u.id)} style={{
                          padding:'5px 12px', fontSize:11, fontWeight:700, border:'none',
                          borderRadius:5, cursor:'pointer', color:'white',
                          background: u.enabled ? '#f39c12':'#27ae60' }}>
                          {u.enabled ? 'Disable' : 'Enable'}
                        </button>
                        <button onClick={() => handleDelete(u.id)} style={{
                          padding:'5px 12px', fontSize:11, fontWeight:700, border:'none',
                          borderRadius:5, cursor:'pointer', color:'white', background:'#e74c3c' }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr><td colSpan={7} style={{ padding:30, textAlign:'center', color:'#aaa' }}>
                    No users found
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LOGS TAB */}
      {tab === 'logs' && (
        <div style={{ background:'white', borderRadius:10, boxShadow:'0 1px 4px rgba(0,0,0,0.08)', overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'#f8f9fa' }}>
                {['User','Extension','Service URL','Device ID','Time'].map(h => (
                  <th key={h} style={{ padding:'11px 14px', textAlign:'left',
                    borderBottom:'1px solid #eee', fontWeight:600, color:'#555', fontSize:12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id} style={{ borderBottom:'1px solid #f0f0f0' }}>
                  <td style={{ padding:'11px 14px', fontWeight:600 }}>{l.user_name}</td>
                  <td style={{ padding:'11px 14px', fontSize:11, color:'#666' }}>{l.extension_id}</td>
                  <td style={{ padding:'11px 14px', fontSize:11, color:'#1877f2',
                    maxWidth:250, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {l.service_url || '—'}
                  </td>
                  <td style={{ padding:'11px 14px', fontFamily:'monospace', fontSize:11, color:'#888' }}>
                    {l.device_fingerprint?.slice(0,14)}...
                  </td>
                  <td style={{ padding:'11px 14px', color:'#999', fontSize:11 }}>
                    {new Date(l.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={5} style={{ padding:30, textAlign:'center', color:'#aaa' }}>
                  No activity yet
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
