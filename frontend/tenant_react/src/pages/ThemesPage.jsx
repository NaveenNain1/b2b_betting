import { useEffect, useState } from 'react';
import { Palette, Save, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import * as api from '../api/tenantApi';
import { useAuth } from '../contexts/AuthContext';

export default function ThemesPage() {
  const { tenant, updateTenant } = useAuth();
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    theme: tenant?.theme || 'default',
    website_title: tenant?.website_title || '',
    website_description: tenant?.website_description || '',
    custom_css: tenant?.custom_css || '',
    logo: null,
    favicon: null,
  });

  useEffect(() => {
    api.getThemes()
      .then((r) => setThemes(r.data.data.themes))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((f) => ({ ...f, [name]: files ? files[0] : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== undefined && v !== '') fd.append(k, v); });
      const res = await api.updateTheme(fd);
      updateTenant(res.data.data.tenant);
      toast.success('Theme updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Palette size={20} className="text-brand-400" /> Theme Settings
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">Customize your platform's appearance</p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Theme Selection */}
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-4">Select Theme</h3>
          {loading ? <p className="text-gray-500 text-sm">Loading...</p> : (
            <div className="space-y-3">
              {themes.map((t) => (
                <div
                  key={t.slug}
                  onClick={() => setForm((f) => ({ ...f, theme: t.slug }))}
                  className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${form.theme === t.slug ? 'border-brand-500 shadow-glow' : 'border-surface-border hover:border-brand-500/50'}`}
                >
                  <img src={t.image} alt={t.name} className="w-full h-28 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-3 flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{t.name}</span>
                    {form.theme === t.slug && <Check size={14} className="text-brand-400" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-white">Branding</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Website Title</label>
                <input name="website_title" value={form.website_title} onChange={handleChange} className="input" placeholder="My Casino" />
              </div>
              <div>
                <label className="label">Website Description</label>
                <input name="website_description" value={form.website_description} onChange={handleChange} className="input" placeholder="Best betting platform" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Logo</label>
                {tenant?.logo_url && (
                  <div className="mb-2">
                    <img src={tenant.logo_url} alt="Current logo" className="h-10 rounded-lg object-contain bg-surface p-1" />
                  </div>
                )}
                <input name="logo" type="file" accept="image/*" onChange={handleChange} className="input py-1.5 text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-600 file:text-white" />
              </div>
              <div>
                <label className="label">Favicon</label>
                {tenant?.favicon_url && (
                  <div className="mb-2">
                    <img src={tenant.favicon_url} alt="Current favicon" className="h-10 w-10 rounded-lg object-contain bg-surface p-1" />
                  </div>
                )}
                <input name="favicon" type="file" accept="image/*" onChange={handleChange} className="input py-1.5 text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-600 file:text-white" />
              </div>
            </div>
          </div>

          <div className="card p-5">
            <label className="label">Custom CSS</label>
            <textarea
              name="custom_css"
              value={form.custom_css}
              onChange={handleChange}
              className="input font-mono text-xs"
              rows={8}
              placeholder="/* Add custom CSS overrides here */&#10;:root {&#10;  --primary-color: #7c3aed;&#10;}"
            />
          </div>

          <button id="save-theme-btn" type="submit" disabled={saving} className="btn-primary">
            <Save size={16} />{saving ? 'Saving...' : 'Save Theme Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
