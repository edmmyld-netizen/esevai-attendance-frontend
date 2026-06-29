import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../utils/api';

/* ─── Palette ───────────────────────────────────────────────────────────────── */
const BLUE   = '#1e3a8a';
const BLUE2  = '#2563eb';
const LIGHT  = '#eff6ff';
const GREEN  = '#166534';
const GBG    = '#dcfce7';
const RED    = '#dc2626';
const RBGC   = '#fef2f2';
const GRAY   = '#64748b';
const BORDER = '#e2e8f0';

/* ─── Shared styles ─────────────────────────────────────────────────────────── */
const card = {
  background: '#fff', borderRadius: 12, padding: '20px 22px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: `1px solid ${BORDER}`
};
const badge = (bg, color) => ({
  background: bg, color, padding: '3px 10px',
  borderRadius: 20, fontSize: 11, fontWeight: 600, display: 'inline-block'
});
const btn = (bg, color = '#fff') => ({
  background: bg, color, border: 'none', borderRadius: 8,
  padding: '9px 16px', fontWeight: 600, fontSize: 13,
  cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex',
  alignItems: 'center', gap: 6
});
const input = {
  padding: '9px 13px', borderRadius: 8, border: `1.5px solid ${BORDER}`,
  fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#f8faff',
  color: '#1f2937', width: '100%'
};

/* ─── Sub-components ─────────────────────────────────────────────────────────── */
function StatCard({ icon, label, value, color = BLUE, bg = LIGHT }) {
  return (
    <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 140 }}>
      <div style={{
        width: 50, height: 50, borderRadius: 12, background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, flexShrink: 0
      }}>{icon}</div>
      <div>
        <p style={{ margin: 0, fontSize: 26, fontWeight: 700, color, lineHeight: 1.2 }}>{value}</p>
        <p style={{ margin: 0, fontSize: 12, color: GRAY, marginTop: 2 }}>{label}</p>
      </div>
    </div>
  );
}

function QRModal({ onClose }) {
  const [sessionName, setSessionName] = useState('eSevai Training Programme — Coimbatore 2025');
  const [qrImg, setQrImg] = useState('');
  const [attendanceUrl, setAttendanceUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    api.get('/admin/qr').then(({ data }) => {
      if (data.qr_data) { setQrImg(data.qr_data); setGenerated(true); }
      if (data.session_name) setSessionName(data.session_name);
    }).catch(() => {});
  }, []);

  const generate = async () => {
    const url = attendanceUrl || `${window.location.origin}/attendance`;
    setLoading(true);
    try {
      const { data } = await api.post('/admin/generate-qr', { attendanceUrl: url, sessionName });
      setQrImg(data.qrDataUrl);
      setGenerated(true);
    } catch { alert('QR generation failed'); }
    setLoading(false);
  };

  const printQR = () => {
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>Attendance QR</title>
    <style>body{font-family:Arial,sans-serif;text-align:center;padding:40px}
    h2{color:#1e3a8a;font-size:22px}p{color:#555;font-size:14px}
    img{width:280px;height:280px;border:3px solid #1e3a8a;border-radius:12px;padding:8px;margin:16px 0}
    @media print{button{display:none}}</style></head><body>
    <h2>eSevai Training Attendance</h2>
    <p>District Administration, Coimbatore</p>
    <p>${sessionName}</p>
    <img src="${qrImg}" alt="QR Code" /><br>
    <p style="font-size:12px;color:#888">Scan to mark your attendance</p>
    <button onclick="window.print()" style="padding:10px 24px;background:#1e3a8a;color:#fff;border:none;border-radius:6px;font-size:14px;cursor:pointer;margin-top:12px">🖨️ Print</button>
    </body></html>`);
    w.document.close();
  };

  const overlay = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: 16
  };

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...card, width: '100%', maxWidth: 480, padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: BLUE, fontSize: 16, fontWeight: 700 }}>📱 Generate QR Code</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: GRAY }}>✕</button>
        </div>

        <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Session Name</label>
        <input style={{ ...input, marginBottom: 12 }} value={sessionName} onChange={e => setSessionName(e.target.value)} />

        <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>
          Attendance URL (leave blank for auto)
        </label>
        <input style={{ ...input, marginBottom: 16 }}
          placeholder={`${window.location.origin}/attendance`}
          value={attendanceUrl} onChange={e => setAttendanceUrl(e.target.value)}
        />

        <button style={{ ...btn(BLUE2), width: '100%', justifyContent: 'center', padding: '11px' }}
          onClick={generate} disabled={loading}>
          {loading ? '⏳ Generating...' : '✨ Generate QR Code'}
        </button>

        {generated && qrImg && (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <div style={{
              border: `3px solid ${BLUE}`, borderRadius: 12,
              padding: 12, display: 'inline-block', background: '#fff'
            }}>
              <img src={qrImg} alt="QR Code" style={{ width: 200, height: 200, display: 'block' }} />
            </div>
            <p style={{ fontSize: 12, color: GRAY, margin: '8px 0 14px' }}>
              Participants scan this to open the attendance form
            </p>
            <button style={btn('#059669')} onClick={printQR}>🖨️ Print QR</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────────────────────────── */
export default function AdminDashboard({ onLogout }) {
  const [stats, setStats]     = useState({ total: 0, todayCount: 0, centres: [] });
  const [records, setRecords] = useState([]);
  const [search, setSearch]   = useState('');
  const [centreFilter, setCentreFilter] = useState('');
  const [showQR, setShowQR]   = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const timerRef = useRef(null);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data);
    } catch {}
  }, []);

  const fetchRecords = useCallback(async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (centreFilter) params.centre = centreFilter;
      const { data } = await api.get('/admin/attendance', { params });
      setRecords(data);
      setLastRefresh(new Date());
    } catch {}
  }, [search, centreFilter]);

  useEffect(() => {
    fetchStats();
    fetchRecords();
    timerRef.current = setInterval(() => {
      fetchStats();
      fetchRecords();
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [fetchStats, fetchRecords]);

  const deleteRecord = async (id) => {
    if (!window.confirm('Delete this attendance record?')) return;
    setDeleting(id);
    try {
      await api.delete(`/admin/attendance/${id}`);
      fetchRecords(); fetchStats();
    } catch { alert('Delete failed'); }
    setDeleting(null);
  };

  const exportExcel = () => {
    const token = localStorage.getItem('esevai_token');
    window.open(`/api/admin/export-excel?token=${token}`, '_blank');
    // Fallback: use header-based download
    api.get('/admin/export-excel', { responseType: 'blob' }).then(({ data }) => {
      const url = URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `eSevai_Attendance_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
    }).catch(() => {});
  };

  const printTable = () => window.print();

  /* ── Layout ── */
  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', fontFamily: "'Inter', sans-serif" }}>
      {showQR && <QRModal onClose={() => setShowQR(false)} />}

      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})`,
        color: '#fff', padding: '0 24px'
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 0', flexWrap: 'wrap', gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 700
            }}>இ</div>
            <div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, fontFamily: "'Poppins', sans-serif" }}>
                eSevai Training Attendance
              </p>
              <p style={{ margin: 0, fontSize: 11, opacity: 0.85 }}>
                District Administration, Coimbatore — Admin Dashboard
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{
              background: 'rgba(255,255,255,0.15)', padding: '4px 12px',
              borderRadius: 20, fontSize: 12
            }}>
              🔄 Last: {lastRefresh.toLocaleTimeString('en-IN')}
            </span>
            <button style={btn('rgba(255,255,255,0.2)')} onClick={() => setShowQR(true)}>
              📱 QR Code
            </button>
            <button style={btn('#059669')} onClick={exportExcel}>
              📊 Excel
            </button>
            <button style={btn('#fff', BLUE)} onClick={printTable}>
              🖨️ Print
            </button>
            <button style={btn('#dc2626')} onClick={onLogout}>
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
          <StatCard icon="👥" label="Total Registrations" value={stats.total} />
          <StatCard icon="📅" label="Attendance Today" value={stats.todayCount} color="#059669" bg="#dcfce7" />
          <StatCard icon="🔴" label="Live Count" value={records.length} color="#7c3aed" bg="#ede9fe" />
          <StatCard icon="🏢" label="eSevai Centres" value={stats.centres?.length || 0} color="#b45309" bg="#fef3c7" />
        </div>

        {/* Filters */}
        <div style={{ ...card, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <input style={input} placeholder="🔍 Search by name or mobile..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <select style={{ ...input }}
                value={centreFilter} onChange={e => setCentreFilter(e.target.value)}>
                <option value="">All eSevai Centres</option>
                {stats.centres?.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button style={btn('#64748b')} onClick={() => { setSearch(''); setCentreFilter(''); }}>
              ✕ Clear
            </button>
            <span style={badge(LIGHT, BLUE)}>
              {records.length} record{records.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Table */}
        <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})` }}>
                  {['#', 'Name', 'eSevai Centre', 'Mobile', 'Date', 'Time', 'Latitude', 'Longitude', 'Location', 'Action'].map(h => (
                    <th key={h} style={{
                      padding: '12px 14px', color: '#fff', fontWeight: 600,
                      textAlign: 'left', whiteSpace: 'nowrap', fontSize: 12
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{
                      textAlign: 'center', padding: '3rem', color: GRAY, fontSize: 14
                    }}>
                      📋 No attendance records found
                    </td>
                  </tr>
                ) : records.map((r, i) => (
                  <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : '#f8faff' }}>
                    <td style={{ padding: '11px 14px', color: GRAY, fontWeight: 600 }}>{i + 1}</td>
                    <td style={{ padding: '11px 14px', fontWeight: 600, color: '#1f2937', whiteSpace: 'nowrap' }}>
                      {r.full_name}
                    </td>
                    <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                      <span style={badge(LIGHT, BLUE)}>{r.esevai_centre}</span>
                    </td>
                    <td style={{ padding: '11px 14px', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                      {r.mobile_number}
                    </td>
                    <td style={{ padding: '11px 14px', whiteSpace: 'nowrap', color: GRAY }}>{r.date}</td>
                    <td style={{ padding: '11px 14px', whiteSpace: 'nowrap', color: GRAY }}>{r.time}</td>
                    <td style={{ padding: '11px 14px', fontSize: 11, color: GRAY }}>{r.latitude?.toFixed(5)}</td>
                    <td style={{ padding: '11px 14px', fontSize: 11, color: GRAY }}>{r.longitude?.toFixed(5)}</td>
                    <td style={{ padding: '11px 14px' }}>
                      {r.maps_link ? (
                        <a href={r.maps_link} target="_blank" rel="noreferrer"
                          style={{ color: BLUE2, fontSize: 12, fontWeight: 500 }}>
                          📍 View Map
                        </a>
                      ) : '—'}
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <button
                        style={{ ...btn('#fef2f2', RED), padding: '5px 10px', fontSize: 12 }}
                        onClick={() => deleteRecord(r.id)}
                        disabled={deleting === r.id}
                      >
                        {deleting === r.id ? '...' : '🗑️'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div style={{
            padding: '10px 16px', borderTop: `1px solid ${BORDER}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: '#f8faff', fontSize: 12, color: GRAY, flexWrap: 'wrap', gap: 8
          }}>
            <span>Showing {records.length} records • Auto-refresh every 5 seconds</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
              Live
            </span>
          </div>
        </div>

        {/* Recent section */}
        {stats.recent?.length > 0 && (
          <div style={{ ...card, marginTop: 16 }}>
            <h4 style={{ margin: '0 0 14px', color: BLUE, fontSize: 14, fontWeight: 700 }}>
              🕐 Recent Attendance (Latest 5)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stats.recent.map(r => (
                <div key={r.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', background: '#f8faff',
                  borderRadius: 8, border: `1px solid ${BORDER}`, flexWrap: 'wrap'
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: LIGHT, color: BLUE,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 14, flexShrink: 0
                  }}>
                    {r.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: '#1f2937' }}>{r.full_name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: GRAY }}>{r.esevai_centre} • {r.mobile_number}</p>
                  </div>
                  <span style={{ fontSize: 12, color: GRAY, whiteSpace: 'nowrap' }}>
                    {r.date} {r.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 24 }}>
          Tamil Nadu e-District Programme • Government of Tamil Nadu • District Administration, Coimbatore
        </p>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          button, .no-print { display: none !important; }
          body { background: #fff !important; }
          div[style*="linear-gradient"] { background: #1e3a8a !important; -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}
