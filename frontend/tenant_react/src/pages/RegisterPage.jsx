import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../api/tenantApi';
import { Zap, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    brand_name: '', primary_domain: '', frontend_url: '', website_title: '',
    website_description: '', admin_name: '', admin_email: '', admin_password: '',
    logo: null, favicon: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((f) => ({ ...f, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== '') fd.append(k, v); });
      const res = await api.register(fd);
      const { token, user, tenant } = res.data.data;
      localStorage.setItem('tenant_token', token);
      localStorage.setItem('tenant_user', JSON.stringify(user));
      localStorage.setItem('tenant_data', JSON.stringify(tenant));
      toast.success('Account created successfully!');
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl animate-slide-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-gradient shadow-glow mb-4">
            <Zap size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create Your Platform</h1>
          <p className="text-gray-500 text-sm mt-1">B2B iGaming Platform Registration</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              <AlertCircle size={16} /><span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Platform Info</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="label">Brand Name *</label>
                  <input id="reg-brand" name="brand_name" required value={form.brand_name} onChange={handleChange} className="input" placeholder="BetKing" />
                </div>
                <div>
                  <label className="label">Primary Domain *</label>
                  <input id="reg-domain" name="primary_domain" required value={form.primary_domain} onChange={handleChange} className="input" placeholder="betking.com" />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Frontend URL *</label>
                  <input id="reg-url" name="frontend_url" required value={form.frontend_url} onChange={handleChange} className="input" placeholder="https://betking.com" />
                </div>
                <div>
                  <label className="label">Website Title</label>
                  <input name="website_title" value={form.website_title} onChange={handleChange} className="input" placeholder="BetKing - Best Odds" />
                </div>
                <div>
                  <label className="label">Website Description</label>
                  <input name="website_description" value={form.website_description} onChange={handleChange} className="input" placeholder="Top sports betting platform" />
                </div>
                <div>
                  <label className="label">Logo</label>
                  <input name="logo" type="file" accept="image/*" onChange={handleChange} className="input py-1.5 text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-600 file:text-white" />
                </div>
                <div>
                  <label className="label">Favicon</label>
                  <input name="favicon" type="file" accept="image/*" onChange={handleChange} className="input py-1.5 text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-600 file:text-white" />
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Admin Account</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="label">Your Name *</label>
                  <input id="reg-name" name="admin_name" required value={form.admin_name} onChange={handleChange} className="input" placeholder="John Doe" />
                </div>
                <div>
                  <label className="label">Email Address *</label>
                  <input id="reg-email" name="admin_email" type="email" required value={form.admin_email} onChange={handleChange} className="input" placeholder="admin@betking.com" />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Password *</label>
                  <div className="relative">
                    <input id="reg-password" name="admin_password" type={showPass ? 'text' : 'password'} required value={form.admin_password} onChange={handleChange} className="input pr-10" placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button id="reg-submit-btn" type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating...</span> : 'Create Platform'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
