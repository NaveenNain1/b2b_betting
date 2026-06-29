import { useEffect, useState } from 'react';
import { Shield, Copy, CheckCircle, Smartphone, AlertTriangle, ArrowRight, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import * as api from '../api/tenantApi';
import Modal from './Modal';
import { useAuth } from '../contexts/AuthContext';

export default function CryptoPaymentModal({ isOpen, onClose, plan }) {
  const { tenant, updateTenant } = useAuth();
  const [networks, setNetworks] = useState([]);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Load available networks
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getPaymentNetworks()
        .then((r) => {
          setNetworks(r.data.data.networks || []);
          if (r.data.data.networks?.length > 0) {
            setSelectedNetwork(r.data.data.networks[0]);
          }
        })
        .catch(() => toast.error('Failed to load payment options'))
        .finally(() => setLoading(false));
    } else {
      // Reset
      setPaymentDetails(null);
      setSelectedNetwork(null);
      setPaymentSuccess(false);
    }
  }, [isOpen]);

  // Timer countdown
  useEffect(() => {
    if (!paymentDetails || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [paymentDetails, timeLeft]);

  // Poll subscription status
  useEffect(() => {
    if (!paymentDetails || paymentSuccess) return;
    const poll = setInterval(() => {
      api.me()
        .then((res) => {
          const updatedTenant = res.data.data.tenant;
          if (updatedTenant?.subscription?.status === 'active') {
            updateTenant(updatedTenant);
            setPaymentSuccess(true);
            toast.success('Subscription activated successfully!');
            clearInterval(poll);
          }
        })
        .catch(() => {});
    }, 5000);
    return () => clearInterval(poll);
  }, [paymentDetails, paymentSuccess]);

  const handleInitiate = async () => {
    if (!selectedNetwork) return;
    setLoading(true);
    try {
      const res = await api.initiatePayment({
        plan_id: plan._id,
        pay_currency: 'USDT',
        network: selectedNetwork.network
      });
      setPaymentDetails(res.data.data);
      setTimeLeft((res.data.data.lifetime || 60) * 60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    if (!paymentDetails?.address) return;
    navigator.clipboard.writeText(paymentDetails.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={paymentSuccess ? "Payment Successful" : `Pay for ${plan?.name}`} size="md">
      {loading && !paymentDetails ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-gray-400 text-sm mt-3">Preparing white-label payment details...</p>
        </div>
      ) : paymentSuccess ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle size={36} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Platform Activated!</h3>
            <p className="text-sm text-gray-400 mt-1">Your subscription to <strong>{plan?.name}</strong> is now active.</p>
          </div>
          <button onClick={onClose} className="btn-primary w-full justify-center mt-4">
            Go to Dashboard <ArrowRight size={16} />
          </button>
        </div>
      ) : !paymentDetails ? (
        <div className="space-y-5">
          <div className="p-3 bg-violet-500/10 border border-violet-500/30 rounded-lg text-violet-400 text-sm flex gap-2">
            <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Select your preferred cryptocurrency network to pay the subscription fee of <strong>${plan?.price_per_month} USD</strong>.</span>
          </div>

          {networks.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-sm">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              No payment networks configured. Please contact Super Admin.
            </div>
          ) : (
            <div className="space-y-3">
              <label className="label">Available Networks</label>
              <div className="grid grid-cols-2 gap-2">
                {networks.map((net) => (
                  <button
                    key={net._id}
                    onClick={() => setSelectedNetwork(net)}
                    className={`p-3 rounded-lg border text-left flex items-center justify-between transition-all ${selectedNetwork?._id === net._id ? 'border-brand-500 bg-brand-500/10' : 'border-surface-border bg-surface-hover hover:border-brand-500/50'}`}
                  >
                    <div>
                      <p className="font-semibold text-white text-sm">{net.network}</p>
                      <p className="text-xs text-gray-500">Instant Deposit</p>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleInitiate}
                className="btn-primary w-full justify-center py-3 mt-4"
              >
                Proceed to Payment
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          <div className="text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Send Exactly</p>
            <p className="text-2xl font-black text-brand-400 mt-1">
              {paymentDetails.amount} {paymentDetails.pay_currency}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Network: <strong>{paymentDetails.network}</strong></p>
          </div>

          {/* QR Code */}
          <div className="p-3 bg-white rounded-xl w-44 h-44 mx-auto flex items-center justify-center shadow-glow">
            <img
              src={paymentDetails.qr_code}
              alt="Deposit QR Address"
              className="w-40 h-40"
            />
          </div>

          {/* Address input */}
          <div className="space-y-1.5">
            <label className="label text-xs">Deposit Address</label>
            <div className="flex gap-2">
              <input
                readOnly
                value={paymentDetails.address}
                className="input font-mono text-xs flex-1 bg-surface-input"
              />
              <button
                onClick={copyAddress}
                className="btn-secondary px-3"
                title="Copy Address"
              >
                {copied ? <CheckCircle size={16} className="text-emerald-400" /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* Timer & Status */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-surface-border">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-gray-300">Awaiting Deposit...</span>
            </div>
            <span className="text-xs font-mono text-red-400">Expires in: {formatTime(timeLeft)}</span>
          </div>

          <p className="text-xs text-gray-500 text-center leading-relaxed">
            Please only send {paymentDetails.pay_currency} on the {paymentDetails.network} network. Sending any other asset or using a different network will result in permanent loss.
          </p>
        </div>
      )}
    </Modal>
  );
}
