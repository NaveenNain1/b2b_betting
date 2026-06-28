import { ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function DataTable({ columns, data, loading, emptyMessage = 'No data found' }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const cmp = String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? ''));
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : data;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-surface-border">
            {columns.map((col) => (
              <th key={col.key} className={`table-th ${col.sortable ? 'cursor-pointer select-none hover:text-white transition-colors' : ''}`} onClick={() => col.sortable && handleSort(col.key)}>
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && sortKey === col.key && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length} className="table-td text-center py-12">
              <div className="flex justify-center"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
              <p className="mt-3 text-gray-500 text-sm">Loading...</p>
            </td></tr>
          ) : sorted.length === 0 ? (
            <tr><td colSpan={columns.length} className="table-td text-center py-12 text-gray-500">{emptyMessage}</td></tr>
          ) : sorted.map((row, idx) => (
            <tr key={row._id || idx} className="border-b border-surface-border/50 hover:bg-surface-hover/50 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="table-td">
                  {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
