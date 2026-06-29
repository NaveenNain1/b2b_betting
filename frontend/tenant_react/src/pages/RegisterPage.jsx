import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../api/tenantApi';
import {
  Zap, AlertCircle, Eye, EyeOff,
  Globe, User, Monitor, Wallet, Users2, Share2, ShieldCheck,
  ChevronRight, ChevronLeft, Check
} from 'lucide-react';
import { toast } from 'react-toastify';

/* ─── Step metadata ─────────────────────────────────────────── */
const STEPS = [
  { id: 1, title: 'Platform Info',    icon: Globe },
  { id: 2, title: 'Admin Account',   icon: User },
  { id: 3, title: 'Platform Type',   icon: Monitor },
  { id: 4, title: 'Wallet System',   icon: Wallet },
  { id: 5, title: 'Agent System',    icon: Users2 },
  { id: 6, title: 'Affiliate',       icon: Share2 },
  { id: 7, title: 'KYC & Security',  icon: ShieldCheck },
];

/* ─── Tiny helpers ──────────────────────────────────────────── */
function toggle(arr, val) {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
}

function YesNo({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-surface-input border border-surface-border">
      <span className="text-sm text-gray-300">{label}</span>
      <div className="flex gap-2">
        {[true, false].map((opt) => (
          <button
            key={String(opt)}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              value === opt
                ? 'bg-brand-600 text-white shadow-glow'
                : 'bg-surface text-gray-400 border border-surface-border hover:border-brand-500'
            }`}
          >
            {opt ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
    </div>
  );
}

function MultiCheck({ options, selected, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(toggle(selected, opt))}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all border ${
              active
                ? 'bg-brand-600/20 border-brand-500 text-brand-300'
                : 'bg-surface border-surface-border text-gray-400 hover:border-brand-600/50'
            }`}
          >
            <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border ${
              active ? 'bg-brand-600 border-brand-500' : 'border-surface-border'
            }`}>
              {active && <Check size={10} className="text-white" />}
            </div>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function LevelPicker({ label, value, onChange, max = 5 }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex gap-2">
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all border ${
              value === n
                ? 'bg-brand-600 border-brand-500 text-white shadow-glow'
                : 'bg-surface border-surface-border text-gray-400 hover:border-brand-600/50'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Step components ───────────────────────────────────────── */
function Step1({ form, onChange }) {
  return (
    <div className="space-y-4">
      <SectionHead>Platform Details</SectionHead>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Brand Name *">
          <input id="reg-brand" name="brand_name" required value={form.brand_name} onChange={onChange} className="input" placeholder="BetKing" />
        </Field>
        <Field label="Primary Domain *">
          <input id="reg-domain" name="primary_domain" required value={form.primary_domain} onChange={onChange} className="input" placeholder="betking.com" />
        </Field>
        <Field label="Frontend URL *" className="md:col-span-2">
          <input id="reg-url" name="frontend_url" required value={form.frontend_url} onChange={onChange} className="input" placeholder="https://betking.com" />
        </Field>
        <Field label="Website Title">
          <input name="website_title" value={form.website_title} onChange={onChange} className="input" placeholder="BetKing – Best Odds" />
        </Field>
        <Field label="Website Description">
          <input name="website_description" value={form.website_description} onChange={onChange} className="input" placeholder="Top sports betting platform" />
        </Field>
        <Field label="Logo">
          <input name="logo" type="file" accept="image/*" onChange={onChange} className="input py-1.5 text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-600 file:text-white" />
        </Field>
        <Field label="Favicon">
          <input name="favicon" type="file" accept="image/*" onChange={onChange} className="input py-1.5 text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-600 file:text-white" />
        </Field>
      </div>
    </div>
  );
}

function Step2({ form, onChange, showPass, setShowPass }) {
  return (
    <div className="space-y-4">
      <SectionHead>Admin Account</SectionHead>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Your Name *">
          <input id="reg-name" name="admin_name" required value={form.admin_name} onChange={onChange} className="input" placeholder="John Doe" />
        </Field>
        <Field label="Email Address *">
          <input id="reg-email" name="admin_email" type="email" required value={form.admin_email} onChange={onChange} className="input" placeholder="admin@betking.com" />
        </Field>
        <Field label="Password *" className="md:col-span-2">
          <div className="relative">
            <input id="reg-password" name="admin_password" type={showPass ? 'text' : 'password'} required value={form.admin_password} onChange={onChange} className="input pr-10" placeholder="••••••••" />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>
      </div>
    </div>
  );
}

const PLATFORM_TYPES = ['Casino', 'Sportsbook', 'Live Casino', 'Lottery', 'Virtual Sports'];

function Step3({ ob, setOb }) {
  return (
    <div className="space-y-5">
      <SectionHead>What type of platform do you want?</SectionHead>
      <MultiCheck
        options={PLATFORM_TYPES}
        selected={ob.platform_types}
        onChange={(v) => setOb((p) => ({ ...p, platform_types: v }))}
      />

      <Field label="Target Audience / Region">
        <input value={ob.target_region} onChange={(e) => setOb((p) => ({ ...p, target_region: e.target.value }))} className="input" placeholder="e.g. Europe, Latin America, Southeast Asia…" />
      </Field>

      <Field label="Launch Date / Timeline">
        <input type="date" value={ob.launch_date} onChange={(e) => setOb((p) => ({ ...p, launch_date: e.target.value }))} className="input" />
      </Field>

      <Field label="Any Reference Platform?">
        <input value={ob.reference_platform} onChange={(e) => setOb((p) => ({ ...p, reference_platform: e.target.value }))} className="input" placeholder="e.g. bet365, 1xBet, Sportingbet…" />
      </Field>
    </div>
  );
}

function Step4({ ob, setOb }) {
  const set = (key, val) => setOb((p) => ({ ...p, wallet: { ...p.wallet, [key]: val } }));
  return (
    <div className="space-y-4">
      <SectionHead>Wallet System</SectionHead>
      <div className="space-y-2">
        <YesNo label="Single wallet for all games?" value={ob.wallet.single_wallet} onChange={(v) => set('single_wallet', v)} />
        <YesNo label="Separate wallet for each provider?" value={ob.wallet.separate_wallet_per_provider} onChange={(v) => set('separate_wallet_per_provider', v)} />
        <YesNo label="Auto wallet transfer?" value={ob.wallet.auto_wallet_transfer} onChange={(v) => set('auto_wallet_transfer', v)} />
        <YesNo label="Multi-currency wallet?" value={ob.wallet.multi_currency} onChange={(v) => set('multi_currency', v)} />
      </div>
    </div>
  );
}

const AGENT_STRUCTURE = ['Master Agent', 'Agent', 'Sub Agent', 'Player'];

function Step5({ ob, setOb }) {
  return (
    <div className="space-y-5">
      <SectionHead>Agent System</SectionHead>

      <div>
        <label className="label mb-2 block">Please confirm agent structure:</label>
        <MultiCheck
          options={AGENT_STRUCTURE}
          selected={ob.agent.structure}
          onChange={(v) => setOb((p) => ({ ...p, agent: { ...p.agent, structure: v } }))}
        />
      </div>

      <YesNo
        label="Multi-level commission required?"
        value={ob.agent.multi_level_commission}
        onChange={(v) => setOb((p) => ({ ...p, agent: { ...p.agent, multi_level_commission: v } }))}
      />

      {ob.agent.multi_level_commission && (
        <LevelPicker
          label="How many levels?"
          value={ob.agent.commission_levels}
          onChange={(v) => setOb((p) => ({ ...p, agent: { ...p.agent, commission_levels: v } }))}
        />
      )}
    </div>
  );
}

const AFFILIATE_MODELS = ['Multi Level Affiliate', 'CPA (Cost Per Action)', 'Revenue Share', 'Revshare', 'Hybrid Model'];

function Step6({ ob, setOb }) {
  return (
    <div className="space-y-5">
      <SectionHead>Affiliate System</SectionHead>

      <div>
        <label className="label mb-2 block">Which affiliate model do you need?</label>
        <MultiCheck
          options={AFFILIATE_MODELS}
          selected={ob.affiliate.models}
          onChange={(v) => setOb((p) => ({ ...p, affiliate: { ...p.affiliate, models: v } }))}
        />
      </div>

      <LevelPicker
        label="How many affiliate levels?"
        value={ob.affiliate.levels}
        onChange={(v) => setOb((p) => ({ ...p, affiliate: { ...p.affiliate, levels: v } }))}
      />
    </div>
  );
}

const KYC_OPTIONS = [
  { key: 'kyc_verification',    label: 'KYC Verification' },
  { key: 'aml',                 label: 'AML (Anti Money Laundering)' },
  { key: 'fraud_detection',     label: 'Fraud Detection' },
  { key: 'device_fingerprinting', label: 'Device Fingerprinting' },
  { key: 'geo_blocking',        label: 'Geo Blocking' },
  { key: 'realtime_reports',    label: 'Real-time Reports' },
  { key: 'responsible_gaming',  label: 'Responsible Gaming' },
];

function Step7({ ob, setOb }) {
  const toggle7 = (key) =>
    setOb((p) => ({ ...p, kyc_security: { ...p.kyc_security, [key]: !p.kyc_security[key] } }));

  return (
    <div className="space-y-4">
      <SectionHead>KYC & Security — Do you require?</SectionHead>
      <div className="space-y-2">
        {KYC_OPTIONS.map(({ key, label }) => {
          const active = ob.kyc_security[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle7(key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-left transition-all border ${
                active
                  ? 'bg-brand-600/15 border-brand-500 text-brand-300'
                  : 'bg-surface border-surface-border text-gray-400 hover:border-brand-600/40'
              }`}
            >
              <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border ${
                active ? 'bg-brand-600 border-brand-500' : 'border-surface-border'
              }`}>
                {active && <Check size={11} className="text-white" />}
              </div>
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Mini layout helpers ───────────────────────────────────── */
function SectionHead({ children }) {
  return (
    <p className="text-sm font-semibold text-gray-300 uppercase tracking-wider pb-1 border-b border-surface-border">
      {children}
    </p>
  );
}

function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

/* ─── Default onboarding state ──────────────────────────────── */
const defaultOnboarding = {
  platform_types: [],
  target_region: '',
  launch_date: '',
  reference_platform: '',
  wallet: {
    single_wallet: null,
    separate_wallet_per_provider: null,
    auto_wallet_transfer: null,
    multi_currency: null,
  },
  agent: {
    structure: [],
    multi_level_commission: null,
    commission_levels: null,
  },
  affiliate: {
    models: [],
    levels: null,
  },
  kyc_security: {
    kyc_verification: false,
    aml: false,
    fraud_detection: false,
    device_fingerprinting: false,
    geo_blocking: false,
    realtime_reports: false,
    responsible_gaming: false,
  },
};

/* ─── Main component ────────────────────────────────────────── */
export default function RegisterPage() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [form, setForm] = useState({
    brand_name: '', primary_domain: '', frontend_url: '',
    website_title: '', website_description: '',
    admin_name: '', admin_email: '', admin_password: '',
    logo: null, favicon: null,
  });

  const [ob, setOb] = useState(defaultOnboarding);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((f) => ({ ...f, [name]: files ? files[0] : value }));
  };

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const validate = () => {
    if (step === 1) {
      if (!form.brand_name || !form.primary_domain || !form.frontend_url)
        return 'Please fill in all required platform fields.';
    }
    if (step === 2) {
      if (!form.admin_name || !form.admin_email || !form.admin_password)
        return 'Please fill in all required account fields.';
      if (form.admin_password.length < 6)
        return 'Password must be at least 6 characters.';
    }
    return null;
  };

  const handleNext = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    next();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== '') fd.append(k, v);
      });
      fd.append('onboarding', JSON.stringify(ob));

      const res = await api.register(fd);
      const { token, user, tenant } = res.data.data;
      localStorage.setItem('tenant_token', token);
      localStorage.setItem('tenant_user', JSON.stringify(user));
      localStorage.setItem('tenant_data', JSON.stringify(tenant));
      localStorage.setItem('show_dns_setup', 'true');
      toast.success('Account created successfully!');
      navigate('/dashboard');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const isLast = step === STEPS.length;

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl animate-slide-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-gradient shadow-glow mb-3">
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create Your Platform</h1>
          <p className="text-gray-500 text-sm mt-1">B2B iGaming Platform Registration</p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          {/* Step pills */}
          <div className="flex items-center justify-between mb-3 overflow-x-auto gap-1 pb-1">
            {STEPS.map((s) => {
              const Icon = s.icon;
              const done = step > s.id;
              const active = step === s.id;
              return (
                <div key={s.id} className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    done ? 'bg-brand-600 shadow-glow' :
                    active ? 'bg-brand-600/30 border-2 border-brand-500' :
                    'bg-surface-input border border-surface-border'
                  }`}>
                    {done
                      ? <Check size={16} className="text-white" />
                      : <Icon size={16} className={active ? 'text-brand-400' : 'text-gray-500'} />
                    }
                  </div>
                  <span className={`text-[10px] text-center leading-tight w-14 ${
                    active ? 'text-brand-400 font-semibold' : done ? 'text-gray-400' : 'text-gray-600'
                  }`}>{s.title}</span>
                </div>
              );
            })}
          </div>
          {/* Progress line */}
          <div className="h-1 rounded-full bg-surface-border">
            <div
              className="h-1 rounded-full bg-brand-gradient transition-all duration-500"
              style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="card p-8">
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              <AlertCircle size={16} /><span>{error}</span>
            </div>
          )}

          <form onSubmit={isLast ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
            <div className="min-h-[340px]">
              {step === 1 && <Step1 form={form} onChange={handleChange} />}
              {step === 2 && <Step2 form={form} onChange={handleChange} showPass={showPass} setShowPass={setShowPass} />}
              {step === 3 && <Step3 ob={ob} setOb={setOb} />}
              {step === 4 && <Step4 ob={ob} setOb={setOb} />}
              {step === 5 && <Step5 ob={ob} setOb={setOb} />}
              {step === 6 && <Step6 ob={ob} setOb={setOb} />}
              {step === 7 && <Step7 ob={ob} setOb={setOb} />}
            </div>

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prev}
                  className="btn-secondary flex-1 justify-center gap-2"
                >
                  <ChevronLeft size={16} /> Back
                </button>
              )}

              {isLast ? (
                <button
                  id="reg-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 justify-center gap-2"
                >
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating...</>
                    : <><Check size={16} />Create Platform</>
                  }
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn-primary flex-1 justify-center gap-2"
                >
                  Next <ChevronRight size={16} />
                </button>
              )}
            </div>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
