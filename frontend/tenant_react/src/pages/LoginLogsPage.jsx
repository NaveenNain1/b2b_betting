import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { toast } from 'react-toastify';
import * as api from '../api/tenantApi';
import DataTable from '../components/DataTable';

export default function LoginLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.loginLogs({ limit: 100 })
      .then((r) => setLogs(r.data.data.logs))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'email', label: 'Email', sortable: true },
    { key: 'status', label: 'Status', render: (v) => <span className={`badge ${v === 'success' ? 'badge-green' : 'badge-red'}`}>{v}</span> },
    { key: 'reason', label: 'Reason', render: (v) => <span className="text-gray-400 text-xs">{v || '—'}</span> },
    { key: 'ip_address', label: 'IP', render: (v) => <code className="text-xs text-cyan-400">{v || '—'}</code> },
    { key: 'createdAt', label: 'Date', sortable: true, render: (v) => v ? new Date(v).toLocaleString() : '—' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><Activity size={20} className="text-brand-400" /> Login Logs</h2>
        <p className="text-sm text-gray-500 mt-0.5">Platform admin login history</p>
      </div>
      <div className="card">
        <DataTable columns={columns} data={logs} loading={loading} emptyMessage="No login logs found" />
      </div>
    </div>
  );
}
