import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const BLUE  = '#1e3a8a';
const BLUE2 = '#2563eb';

const S = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '0 0 40px', fontFamily: "'Inter', sans-serif"
  },
  header: {
    width: '100%',
    background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})`,
    color: '#fff', padding: '16px 20px', textAlign: 'center', marginBottom: 24
  },
  emblem: {
    width: 52, height: 52, borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 24, fontWeight: 700, marginBottom: 8
  },
  card: {
    background: '#fff', borderRadius: 16, padding: '28px 24px',
    width: '100%', maxWidth: 440,
    boxShadow: '0 8px 32px rgba(30,58,138,0.10)',
    border: '1px solid #dbeafe', margin: '0 16px'
  },
  label: { fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 },
  input: {
    width: '100%', padding: '12px 14px', borderRadius: 9,
    border: '1.5px solid #e2e8f0', fontSize: 15,
    fontFamily: 'inherit', outline: 'none', background: '#f8faff',
    color: '#1f2937', marginBottom: 4, transition: 'border-color 0.2s'
  },
  hint: { fontSize: 11, color: '#94a3b8', marginBottom: 14, display: 'block' },
  btn: {
    width: '100%', padding: '14px', borderRadius: 10,
    background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})`,
    color: '#fff', fontSize: 16, fontWeight: 700,
    border: 'none', cursor: 'pointer', marginTop: 8, fontFamily: 'inherit',
    transition: 'opacity 0.2s'
  },
};

const STATUS = { idle: 'idle', locating: 'locating', submitting: 'submitting', success: 'success', error: 'error', dup: 'dup', noloc: 'noloc' };

export default function AttendanceForm() {
  const [form, setForm] = useState({ full_name: '', esevai_centre: '', mobile_number: '' });
  const [status, setStatus]   = useState(STATUS.idle);
  const [message, setMessage] = useState('');
  const [coords, setCoords]   = useState(null);
  const [gpsStatus, setGpsStatus] = useState('idle'); // idle | locating | got | denied

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Request GPS on mount
  useEffect(() => {
    setGpsStatus('locating');
    if (!navigator.geolocation) {
      setGpsStatus('denied');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsStatus('got');
      },
      () => setGpsStatus('denied'),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, []);

  const retryLocation = () => {
    setGpsStatus('locating');
    setCoords(null);
    navigator.geolocation.getCurrentPosition(
      pos => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGpsStatus('got'); },
      () => setGpsStatus('denied'),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    if (gpsStatus === 'denied' || !coords) {
      setStatus(STATUS.noloc);
      return;
    }
    if (!form.full_name.trim() || !form.esevai_centre.trim() || !form.mobile_number.trim()) {
      setStatus(STATUS.error); setMessage('Please fill in all required fields.'); return;
    }
    if (!/^\d{10}$/.test(form.mobile_number)) {
      setStatus(STATUS.error); setMessage('Enter a valid 10-digit mobile number.'); return;
    }

    setStatus(STATUS.submitting);
    try {
      await api.post('/attendance/submit', {
        full_name: form.full_name.trim(),
        esevai_centre: form.esevai_centre.trim(),
        mobile_number: form.mobile_number.trim(),
        latitude: coords.lat,
        longitude: coords.lng
      });
      setStatus(STATUS.success);
    } catch (err) {
      const data = err.response?.data;
      if (data?.error === 'duplicate') {
        setStatus(STATUS.dup);
      } else {
        setStatus(STATUS.error);
        setMessage(data?.error || 'Submission failed. Please try again.');
      }
    }
  };

  /* ── GPS status bar ── */
  const GpsBar = () => {
    const styles = {
      got:      { bg: '#dcfce7', color: '#166534', icon: '✅', text: 'Location captured successfully' },
      locating: { bg: '#fef3c7', color: '#92400e', icon: '⏳', text: 'Getting your location...' },
      denied:   { bg: '#fef2f2', color: '#dc2626', icon: '❌', text: 'Location access denied' },
      idle:     { bg: '#f1f5f9', color: '#64748b', icon: '📍', text: 'Location pending...' },
    };
    const s = styles[gpsStatus] || styles.idle;
    return (
      <div style={{
        background: s.bg, color: s.color, borderRadius: 8,
        padding: '10px 14px', fontSize: 13, fontWeight: 500,
        marginBottom: 16, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 8
      }}>
        <span>{s.icon} {s.text}</span>
        {gpsStatus === 'denied' && (
          <button onClick={retryLocation} style={{
            background: '#dc2626', color: '#fff', border: 'none',
            borderRadius: 6, padding: '4px 10px', fontSize: 12,
            cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600
          }}>Retry</button>
        )}
      </div>
    );
  };

  /* ── Success screen ── */
  if (status === STATUS.success) {
    return (
      <div style={S.page}>
        <div style={S.header}>
          <div style={S.emblem}>இ</div>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>eSevai Training Attendance</p>
          <p style={{ margin: 0, fontSize: 11, opacity: 0.85 }}>District Administration, Coimbatore</p>
        </div>
        <div style={{ ...S.card, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <h2 style={{ color: '#166534', margin: '0 0 8px', fontSize: 22, fontFamily: "'Poppins', sans-serif" }}>
            Attendance Marked!
          </h2>
          <p style={{ color: '#374151', margin: '0 0 6px', fontSize: 15, fontWeight: 600 }}>{form.full_name}</p>
          <p style={{ color: '#64748b', margin: '0 0 20px', fontSize: 13 }}>{form.esevai_centre}</p>
          <div style={{
            background: '#dcfce7', border: '1px solid #bbf7d0',
            borderRadius: 10, padding: '14px 18px', marginBottom: 20
          }}>
            <p style={{ margin: 0, fontSize: 14, color: '#166534', fontWeight: 500 }}>
              📅 {new Date().toLocaleDateString('en-IN')} &nbsp;|&nbsp;
              🕐 {new Date().toLocaleTimeString('en-IN', { hour12: true })}
            </p>
            {coords && (
              <p style={{ margin: '6px 0 0', fontSize: 12, color: '#16a34a' }}>
                📍 {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              </p>
            )}
          </div>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
            Thank you for attending the eSevai Training Programme. You may close this page.
          </p>
        </div>
      </div>
    );
  }

  /* ── Duplicate screen ── */
  if (status === STATUS.dup) {
    return (
      <div style={S.page}>
        <div style={S.header}>
          <div style={S.emblem}>இ</div>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>eSevai Training Attendance</p>
          <p style={{ margin: 0, fontSize: 11, opacity: 0.85 }}>District Administration, Coimbatore</p>
        </div>
        <div style={{ ...S.card, textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>⚠️</div>
          <h2 style={{ color: '#b45309', margin: '0 0 12px', fontSize: 20 }}>Already Registered</h2>
          <div style={{
            background: '#fef3c7', border: '1px solid #fde68a',
            borderRadius: 10, padding: '14px 18px', marginBottom: 16
          }}>
            <p style={{ margin: 0, fontSize: 14, color: '#92400e', fontWeight: 600 }}>
              You have already marked your attendance.
            </p>
          </div>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Your attendance has been recorded earlier today. Contact the admin if this is an error.
          </p>
        </div>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <div style={S.page}>
      <div style={S.header}>
        <div style={S.emblem}>இ</div>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, fontFamily: "'Poppins', sans-serif" }}>
          eSevai Training Attendance
        </p>
        <p style={{ margin: 0, fontSize: 11, opacity: 0.85 }}>District Administration, Coimbatore</p>
      </div>

      <div style={S.card}>
        <div style={{
          background: '#eff6ff', border: '1px solid #bfdbfe',
          borderRadius: 10, padding: '12px 16px', marginBottom: 20
        }}>
          <p style={{ margin: 0, fontSize: 13, color: BLUE, fontWeight: 600 }}>
            📋 eSevai Training Programme 2025
          </p>
          <p style={{ margin: '3px 0 0', fontSize: 12, color: '#3b82f6' }}>
            Please fill all fields to mark your attendance
          </p>
        </div>

        <GpsBar />

        {status === STATUS.error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            color: '#dc2626', padding: '10px 14px', borderRadius: 8,
            fontSize: 13, marginBottom: 14, fontWeight: 500
          }}>❌ {message}</div>
        )}

        {status === STATUS.noloc && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            color: '#dc2626', padding: '12px 14px', borderRadius: 8,
            fontSize: 13, marginBottom: 14, fontWeight: 500
          }}>
            📍 Location access is mandatory to mark attendance.<br />
            <span style={{ fontSize: 12, fontWeight: 400, marginTop: 4, display: 'block' }}>
              Please enable location permission in your browser settings and tap Retry.
            </span>
          </div>
        )}

        <form onSubmit={submit} noValidate>
          <label style={S.label}>Full Name <span style={{ color: '#dc2626' }}>*</span></label>
          <input
            style={S.input}
            type="text"
            placeholder="Enter your full name"
            value={form.full_name}
            onChange={e => set('full_name', e.target.value)}
            required
            onFocus={e => e.target.style.borderColor = BLUE2}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />
          <span style={S.hint}>As per official records</span>

          <label style={S.label}>eSevai Centre Name <span style={{ color: '#dc2626' }}>*</span></label>
          <input
            style={S.input}
            type="text"
            placeholder="Enter your eSevai Centre name"
            value={form.esevai_centre}
            onChange={e => set('esevai_centre', e.target.value)}
            required
            onFocus={e => e.target.style.borderColor = BLUE2}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />
          <span style={S.hint}>E.g., Singanallur eSevai Centre</span>

          <label style={S.label}>Mobile Number <span style={{ color: '#dc2626' }}>*</span></label>
          <input
            style={S.input}
            type="tel"
            placeholder="10-digit mobile number"
            value={form.mobile_number}
            onChange={e => set('mobile_number', e.target.value.replace(/\D/g, '').slice(0, 10))}
            maxLength={10}
            required
            onFocus={e => e.target.style.borderColor = BLUE2}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />
          <span style={S.hint}>Used for duplicate check — one attendance per mobile</span>

          <button
            style={{ ...S.btn, opacity: status === STATUS.submitting ? 0.7 : 1 }}
            type="submit"
            disabled={status === STATUS.submitting}
          >
            {status === STATUS.submitting ? '⏳ Marking attendance...' : '✅ Mark Attendance'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 20, marginBottom: 0 }}>
          🔒 Your data is securely stored for official records only
        </p>
      </div>
    </div>
  );
}
