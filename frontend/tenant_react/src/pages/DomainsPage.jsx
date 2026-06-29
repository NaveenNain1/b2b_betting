import { useEffect, useState } from 'react';
import { Globe, Plus, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import * as api from '../api/tenantApi';
import { useAuth } from '../contexts/AuthContext';

export default function DomainsPage() {
  const { tenant } = useAuth();
  const [dnsRecords, setDnsRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [domain, setDomain] = useState(tenant?.primary_domain || '');
  const [connecting, setConnecting] = useState(false);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    api.getDnsRecords()
      .then((r) => setDnsRecords(r.data.data.records))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleConnect = async (e) => {
    e.preventDefault();
    setConnecting(true);
    try {
      await api.connectDomain({ domain });
      toast.success(`Domain changed to ${domain}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change domain');
    } finally {
      setConnecting(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const domainStatusBadge = { pending: 'badge-yellow', verified: 'badge-green', failed: 'badge-red' };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Globe size={20} className="text-brand-400" /> Domain Management
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">Configure your custom domain settings</p>
      </div>

      {/* Connect domain */}
      <div className="card p-5">
        <h3 className="font-semibold text-white mb-4">Change Domain</h3>
        <form onSubmit={handleConnect} className="flex gap-3">
          <input
            id="domain-input"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="casino.yourdomain.com"
            className="input flex-1"
            required
          />
          <button id="connect-domain-btn" type="submit" disabled={connecting} className="btn-primary whitespace-nowrap">
            <Plus size={16} />{connecting ? 'Saving...' : 'Change Domain'}
          </button>
        </form>
      </div>

      {/* Connected domains */}
      {(tenant?.connected_domains || []).length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-4">Connected Domains</h3>
          <div className="space-y-2">
            {(tenant.connected_domains || []).map((d) => (
              <div key={d._id} className="flex items-center justify-between p-3 rounded-lg bg-surface border border-surface-border">
                <div>
                  <p className="font-medium text-white">{d.domain}</p>
                  {d.verified_at && <p className="text-xs text-gray-500">Verified: {new Date(d.verified_at).toLocaleDateString()}</p>}
                </div>
                <span className={`badge ${domainStatusBadge[d.status] || 'badge-yellow'}`}>{d.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DNS Records */}
      <div className="card p-5">
        <h3 className="font-semibold text-white mb-1">Required DNS Records</h3>
        <p className="text-xs text-gray-500 mb-4">Add these DNS records to your domain provider to verify ownership</p>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {dnsRecords.map((record, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-surface border border-surface-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="badge badge-purple">{record.type}</span>
                  <span className={`badge ${record.status === 'verified' ? 'badge-green' : 'badge-yellow'}`}>{record.status}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Name / Host</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-cyan-400 bg-surface-hover px-2 py-1 rounded flex-1">{record.key}</code>
                      <button onClick={() => copyToClipboard(record.key, `key-${idx}`)} className="p-1.5 hover:text-brand-400 text-gray-500 transition-colors">
                        {copied === `key-${idx}` ? <CheckCircle size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Value / Target</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-cyan-400 bg-surface-hover px-2 py-1 rounded flex-1 truncate">{record.value}</code>
                      <button onClick={() => copyToClipboard(record.value, `val-${idx}`)} className="p-1.5 hover:text-brand-400 text-gray-500 transition-colors flex-shrink-0">
                        {copied === `val-${idx}` ? <CheckCircle size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
