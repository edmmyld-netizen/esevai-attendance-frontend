import React, { useState } from 'react';
import api from '../utils/api';

const S = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '16px', fontFamily: "'Inter', sans-serif"
  },
  card: {
    background: '#fff', borderRadius: 16, padding: '40px 36px',
    width: '100%', maxWidth: 420, boxShadow: '0 25px 60px rgba(0,0,0,0.25)'
  },
  logoBar: {
    textAlign: 'center', marginBottom: 28
  },
  emblem: {
    width: 64, height: 64, marginBottom: 12,
    background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
    borderRadius: '50%', display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: 28, color: '#fff', fontWeight: 700
  },
  title: {
    fontFamily: "'Poppins', sans-serif", fontSize: 18,
    fontWeight: 700, color: '#1e3a8a', margin: '0 0 4px'
  },
  sub: { fontSize: 12, color: '#64748b', margin: 0 },
  divider: { height: 1, background: '#e2e8f0', margin: '24px 0' },
  sectionTitle: {
    fontSize: 14, fontWeight: 600, color: '#374151',
    marginBottom: 4, display: 'block'
  },
  label: { fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6, display: 'block' },
  input: {
    width: '100%', padding: '11px 14px', borderRadius: 8,
    border: '1.5px solid #e2e8f0', fontSize: 14, color: '#1f2937',
    outline: 'none', background: '#f8faff', marginBottom: 14,
    transition: 'border-color 0.2s', fontFamily: 'inherit'
  },
  btn: {
    width: '100%', padding: '13px', borderRadius: 8,
    background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
    color: '#fff', fontSize: 15, fontWeight: 600,
    border: 'none', cursor: 'pointer', marginTop: 4, fontFamily: 'inherit'
  },
  error: {
    background: '#fef2f2', border: '1px solid #fecaca',
    color: '#dc2626', padding: '10px 14px', borderRadius: 8,
    fontSize: 13, marginBottom: 14, textAlign: 'center'
  },
  tag: {
    background: '#eff6ff', color: '#1d4ed8', borderRadius: 6,
    padding: '3px 10px', fontSize: 11, fontWeight: 600,
    display: 'inline-block', marginBottom: 16
  }
};

export default function AdminLogin({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/admin/login', form);
      onLogin(data.token);
      window.location.href = '/admin';
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.logoBar}>
          <div style={S.emblem}>இ</div>
          <p style={S.title}>eSevai Training Attendance</p>
          <p style={S.sub}>District Administration, Coimbatore</p>
        </div>

        <div style={S.divider} />
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <span style={S.tag}>🔐 Admin Portal</span>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Sign in to manage attendance
          </p>
        </div>

        <form onSubmit={handle}>
          {error && <div style={S.error}>{error}</div>}

          <label style={S.label}>Username</label>
          <input
            style={S.input}
            type="text"
            placeholder="Enter username"
            value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            required autoFocus
            onFocus={e => { e.target.style.borderColor = '#2563eb'; }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; }}
          />

          <label style={S.label}>Password</label>
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <input
              style={{ ...S.input, marginBottom: 0, paddingRight: 44 }}
              type={showPass ? 'text' : 'password'}
              placeholder="Enter password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
              onFocus={e => { e.target.style.borderColor = '#2563eb'; }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; }}
            />
            <button
              type="button"
              onClick={() => setShowPass(s => !s)}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 16, color: '#64748b', padding: 0
              }}
            >{showPass ? '🙈' : '👁️'}</button>
          </div>

          <button style={S.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : '→ Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 24, marginBottom: 0 }}>
          Tamil Nadu e-District Programme • Government of Tamil Nadu
        </p>
      </div>
    </div>
  );
}
