import { Link } from 'react-router-dom';
import { Zap, Shield, Globe, Users, Trophy, Play, Activity, Cpu } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="card p-6 hover:border-brand-500/30 transition-all duration-300 hover:-translate-y-1">
    <div className="w-12 h-12 rounded-2xl bg-brand-gradient flex items-center justify-center mb-4 shadow-glow">
      <Icon size={22} className="text-white" />
    </div>
    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
    <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
  </div>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface text-gray-100 flex flex-col selection:bg-brand-600/30 selection:text-white">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-600/5 rounded-full blur-[160px]" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[140px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-surface-border bg-surface/75 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-glow">
            <Zap size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">BSL iGaming</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold text-gray-300 hover:text-white transition-colors">Sign In</Link>
          <Link to="/register" className="btn-primary py-2 text-xs">Get Started</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-28 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-6 uppercase tracking-wider">
          <Cpu size={12} /> Next-Generation B2B iGaming Platform
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">
          Launch Your Own <span className="bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent">Betting & Casino</span> Platform
        </h1>
        <p className="text-gray-400 text-base md:text-xl max-w-2xl mt-6 leading-relaxed">
          The ultimate white-label software for sportsbooks, slots, live dealers, and custom gaming sub-brands. Launch in under 10 minutes with a robust admin panel.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link to="/register" className="btn-primary px-8 py-3.5 text-base shadow-glow flex items-center justify-center">
            Create Your Platform <Play size={16} />
          </Link>
          <Link to="/login" className="btn-secondary px-8 py-3.5 text-base flex items-center justify-center">
            Access Admin Console
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-surface-border">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white">Full-Suite Features</h2>
          <p className="text-sm text-gray-400 mt-2">Everything you need to scale your betting platform globally</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard icon={Trophy} title="Sports Betting" desc="Offer live odds on all soccer matches, basketball games, tennis tournaments, and virtual sports." />
          <FeatureCard icon={Globe} title="Custom Domains" desc="Connect your custom primary brand domain instantly with automatic secure SSL generation." />
          <FeatureCard icon={Shield} title="KYC Compliance" desc="Configure dynamic identification fields to secure customer registrations." />
          <FeatureCard icon={Users} title="Sub-Admin Delegation" desc="Assign customizable roles and permissions for your team members securely." />
        </div>
      </section>

      {/* Pricing section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-surface-border">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white">Flexible Pricing Plans</h2>
          <p className="text-sm text-gray-400 mt-2">Start with a 2-day free trial. Pay securely with cryptocurrency.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { name: 'Starter Plan', price: 99, sports: true, casino: false, users: 5 },
            { name: 'Pro Plan', price: 299, sports: true, casino: true, users: 15, highlight: true },
            { name: 'Enterprise Plan', price: 799, sports: true, casino: true, users: 50 },
          ].map((plan) => (
            <div key={plan.name} className={`card p-6 flex flex-col justify-between relative overflow-hidden ${plan.highlight ? 'border-brand-500 shadow-glow' : ''}`}>
              {plan.highlight && <span className="absolute top-3 right-3 badge badge-green">Popular</span>}
              <div>
                <h3 className="font-bold text-white text-lg">{plan.name}</h3>
                <p className="text-3xl font-extrabold text-brand-400 mt-2">${plan.price}<span className="text-sm text-gray-500 font-normal">/mo</span></p>
                <ul className="space-y-2.5 mt-6 text-sm text-gray-300">
                  <li className="flex items-center gap-2">✔ Up to {plan.users} sub-admins</li>
                  <li className="flex items-center gap-2">{plan.sports ? '✔' : '✖'} Live Sports Betting</li>
                  <li className="flex items-center gap-2">{plan.casino ? '✔' : '✖'} Live Casino Games</li>
                  <li className="flex items-center gap-2">✔ Custom Brand Theme Configuration</li>
                  <li className="flex items-center gap-2">✔ Free SSL Certificate & Domains</li>
                </ul>
              </div>
              <Link to="/register" className={`w-full justify-center text-center mt-8 ${plan.highlight ? 'btn-primary' : 'btn-secondary'}`}>
                Start Free Trial
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-surface-border py-8 text-center text-sm text-gray-500">
        <p>© 2026 B2B Betting Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
