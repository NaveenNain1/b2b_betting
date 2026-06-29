import { Globe, Copy, CheckCircle, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import Modal from './Modal';

export default function DnsSetupModal({ isOpen, onClose, primaryDomain }) {
  const [copied, setCopied] = useState(null);

  const dnsRecords = [
    { type: 'A', host: '@', value: '185.199.108.153', ttl: 'Automatic' },
    { type: 'CNAME', host: 'www', value: 'cname.naveenbet.in', ttl: 'Automatic' }
  ];

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Point Your Domain to Our DNS Records" size="lg">
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-brand-500/10 border border-brand-500/30 text-brand-400">
          <Globe size={20} className="flex-shrink-0" />
          <span className="text-sm">To route traffic for <strong>{primaryDomain}</strong> to your platform, you need to update your domain DNS settings.</span>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">How to Point Your Domain (Step-by-Step)</h3>
          <ol className="space-y-3.5 text-sm text-gray-300 list-decimal pl-5">
            <li>
              Log into the site where you bought your domain (e.g. <strong>GoDaddy, Namecheap, Cloudflare, or Google Domains</strong>).
            </li>
            <li>
              Navigate to the <strong>DNS Zone Settings / DNS Management</strong> panel.
            </li>
            <li>
              Create or replace your DNS records with the values listed below.
            </li>
            <li>
              Save changes and wait for propagation (usually takes 5 mins to 24 hours).
            </li>
          </ol>
        </div>

        <div className="space-y-3 mt-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Required DNS Records</h3>
          {dnsRecords.map((record, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-surface border border-surface-border">
              <div className="flex items-center justify-between mb-2">
                <span className="badge badge-purple">{record.type}</span>
                <span className="text-xs text-gray-500">TTL: {record.ttl}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Host / Name</p>
                  <div className="flex items-center gap-2 bg-surface-input px-3 py-1.5 rounded-lg border border-surface-border">
                    <code className="text-xs text-cyan-400 flex-1">{record.host}</code>
                    <button onClick={() => copyToClipboard(record.host, `host-${idx}`)} className="text-gray-500 hover:text-brand-400 transition-colors flex-shrink-0">
                      {copied === `host-${idx}` ? <CheckCircle size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Value / Target</p>
                  <div className="flex items-center gap-2 bg-surface-input px-3 py-1.5 rounded-lg border border-surface-border">
                    <code className="text-xs text-cyan-400 flex-1 truncate">{record.value}</code>
                    <button onClick={() => copyToClipboard(record.value, `val-${idx}`)} className="text-gray-500 hover:text-brand-400 transition-colors flex-shrink-0">
                      {copied === `val-${idx}` ? <CheckCircle size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4 border-t border-surface-border">
          <button onClick={onClose} className="btn-primary">
            Got It, Go to Dashboard <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </Modal>
  );
}
