import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { toast } from 'react-toastify';
import * as api from '../api/superAdminApi';
import DataTable from '../components/DataTable';

export default function TenantLoginLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.tenantLoginLogs({ limit: 100 })
      .then((r) => setLogs(r.data.data.logs))
      .catch(() => toast.error('Failed to load logs'))
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
    {
      key: 'tenant', label: 'Tenant',
      render: (v) => v ? (
        <div>
          <p className="text-sm text-white">{v.brand_name}</p>
          <p className="text-xs text-gray-500">{v.primary_domain}</p>
        </div>
      ) : '—'
    },
    {
      key: 'status', label: 'Status',
      render: (v) => <span className={`badge ${v === 'success' ? 'badge-green' : 'badge-red'}`}>{v}</span>
    },
    { key: 'reason', label: 'Reason', render: (v) => <span className="text-gray-400 text-xs">{v || '—'}</span> },
    { key: 'ip_address', label: 'IP', render: (v) => <code className="text-xs text-cyan-400">{v || '—'}</code> },
    {
      key: 'createdAt', label: 'Date', sortable: true,
      render: (v) => v ? new Date(v).toLocaleString() : '—'
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Users size={20} className="text-brand-400" /> Tenant Login Logs
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">All tenant admin login activity</p>
      </div>
      <div className="card">
        <DataTable columns={columns} data={logs} loading={loading} emptyMessage="No tenant login logs found" />
      </div>
    </div>
  );
}
