import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = true, loading = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="sm">
      <div className="flex flex-col items-center text-center py-2">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${danger ? 'bg-red-500/20' : 'bg-brand-500/20'}`}>
          <AlertTriangle size={28} className={danger ? 'text-red-400' : 'text-brand-400'} />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3 w-full">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className={`flex-1 ${danger ? 'btn-danger' : 'btn-primary'}`}>
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
