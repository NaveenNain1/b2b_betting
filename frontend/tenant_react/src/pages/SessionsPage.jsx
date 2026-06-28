import { useEffect, useState } from 'react';
import { Monitor, Trash2, MapPin, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import * as api from '../api/tenantApi';
import ConfirmDialog from '../components/ConfirmDialog';

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revokeDialog, setRevokeDialog] = useState({ open: false, session: null });
  const [revokeLoading, setRevokeLoading] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await api.mySessions();
      setSessions(res.data.data.sessions);
    } catch (_) { toast.error('Failed to load sessions'); }
    setLoading(false);
  };

  useEffect(() => { fetchSessions(); }, []);

  const handleRevoke = async () => {
    setRevokeLoading(true);
    try {
      await api.logoutSession(revokeDialog.session._id);
      toast.success('Session revoked');
      setRevokeDialog({ open: false, session: null });
      fetchSessions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setRevokeLoading(false);
    }
  };

  const getDeviceName = (ua = '') => {
    if (ua.includes('Mobile')) return '📱 Mobile';
    if (ua.includes('Mac')) return '💻 Mac';
    if (ua.includes('Windows')) return '🖥️ Windows';
    return '🌐 Unknown';
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><Monitor size={20} className="text-brand-400" /> Active Sessions</h2>
        <p className="text-sm text-gray-500 mt-0.5">{sessions.length} active sessions</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : sessions.length === 0 ? (
        <div className="card p-12 text-center"><Monitor size={48} className="text-gray-600 mx-auto mb-3" /><p className="text-gray-400">No active sessions</p></div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s, idx) => (
            <div key={s._id} className="card p-4 flex items-center justify-between hover:border-brand-500/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-lg">
                  {getDeviceName(s.user_agent).split(' ')[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white">{getDeviceName(s.user_agent).slice(2)}</p>
                    {idx === 0 && <span className="badge badge-green">Current</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={11} /> {s.ip_address || 'Unknown'}</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={11} /> {new Date(s.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              {idx !== 0 && (
                <button onClick={() => setRevokeDialog({ open: true, session: s })} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog isOpen={revokeDialog.open} onClose={() => setRevokeDialog({ open: false, session: null })} onConfirm={handleRevoke} title="Revoke Session" message="This will log out that device immediately." confirmLabel="Revoke" loading={revokeLoading} />
    </div>
  );
}
