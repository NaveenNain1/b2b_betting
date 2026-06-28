import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { toast } from 'react-toastify';
import * as api from '../api/tenantApi';
import DataTable from '../components/DataTable';

const ACTION_COLORS = {
  create_user: 'badge-green', update_user: 'badge-blue', delete_user: 'badge-red',
  update_profile: 'badge-blue', change_password: 'badge-yellow', enable_2fa: 'badge-green',
  disable_2fa: 'badge-red', update_theme: 'badge-purple', save_kyc_settings: 'badge-purple',
  connect_domain: 'badge-blue', update_maintenance_mode: 'badge-yellow', update_subscription: 'badge-green',
};

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.activityLogs({ limit: 100 })
      .then((r) => setLogs(r.data.data.logs))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      key: 'admin', label: 'Admin',
      render: (v) => v ? (
        <div>
          <p className="font-medium text-white">{v.name}</p>
          <p className="text-xs text-gray-500">{v.email}</p>
        </div>
      ) : '—'
    },
    { key: 'action', label: 'Action', render: (v) => <span className={`badge ${ACTION_COLORS[v] || 'badge-blue'}`}>{v?.replace(/_/g, ' ')}</span> },
    { key: 'module', label: 'Module', render: (v) => <span className="badge badge-purple">{v}</span> },
    { key: 'description', label: 'Description', render: (v) => <span className="text-gray-400 text-xs">{v || '—'}</span> },
    { key: 'ip_address', label: 'IP', render: (v) => <code className="text-xs text-cyan-400">{v || '—'}</code> },
    { key: 'createdAt', label: 'Date', sortable: true, render: (v) => v ? new Date(v).toLocaleString() : '—' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><Zap size={20} className="text-brand-400" /> Activity Logs</h2>
        <p className="text-sm text-gray-500 mt-0.5">Track all admin actions on your platform</p>
      </div>
      <div className="card">
        <DataTable columns={columns} data={logs} loading={loading} emptyMessage="No activity logs found" />
      </div>
    </div>
  );
}
