import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Zap, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { loginUser, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', tenant_domain: '', two_factor_code: '' });
  const [showPass, setShowPass] = useState(false);
  const [needs2fa, setNeeds2fa] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await loginUser(form);
    if (result.success) {
      navigate('/');
    } else {
      if (result.message?.toLowerCase().includes('two factor')) setNeeds2fa(true);
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-violet-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-slide-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-gradient shadow-glow mb-4">
            <Zap size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Tenant Admin</h1>
          <p className="text-gray-500 text-sm mt-1">B2B iGaming Platform</p>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Sign In</h2>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              <AlertCircle size={16} /><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Platform Domain *</label>
              <input id="t-domain" name="tenant_domain" type="text" required value={form.tenant_domain} onChange={handleChange} className="input" placeholder="yourbrand.com" />
              <p className="text-xs text-gray-500 mt-1">Your platform's primary domain</p>
            </div>
            <div>
              <label className="label">Email Address</label>
              <input id="t-email" name="email" type="email" required value={form.email} onChange={handleChange} className="input" placeholder="admin@yourbrand.com" />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input id="t-password" name="password" type={showPass ? 'text' : 'password'} required value={form.password} onChange={handleChange} className="input pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {needs2fa && (
              <div>
                <label className="label">Two-Factor Code</label>
                <input id="t-2fa" name="two_factor_code" type="text" value={form.two_factor_code} onChange={handleChange} className="input" placeholder="000000" maxLength={6} />
              </div>
            )}
            <button id="t-login-btn" type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
              {loading ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Signing in...</span> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
