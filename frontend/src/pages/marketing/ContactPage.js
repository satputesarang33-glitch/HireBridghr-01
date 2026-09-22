import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { Input } from '../../components/ui/Input.js';
import { Button } from '../../components/ui/Button.js';
import { Card } from '../../components/ui/Card.js';
import { useToast } from '../../context/ToastContext.js';

export function ContactPage() {
  const toast = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success('Inquiry Submitted', 'Our sales and support engineering team will follow up within 4 business hours.');
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-12 animate-fade-in">
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Get in Touch with Our Team
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
          Questions regarding enterprise deployment, ATS migration, or product onboarding? We&apos;re here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-5 space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Contact Details</h3>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-400" />
                <span>support@hirebridgehr.example.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-400" />
                <span>+1 (800) 555-0199</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-brand-400" />
                <span>500 Howard Street, San Francisco, CA</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-2 text-xs text-slate-400">
            <h4 className="font-bold text-white">Support Availability</h4>
            <p>24/7 Priority Support for Enterprise & Agency tiers.</p>
            <p>General inquiry response time: &lt; 4 hours.</p>
          </Card>
        </div>

        <div className="md:col-span-7">
          <Card className="p-6 sm:p-8">
            {submitted ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">Thank You</h3>
                <p className="text-xs text-slate-300">We have received your message and will be in touch shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Your Name"
                  placeholder="e.g. Sarah Connor"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <Input
                  label="Work Email"
                  type="email"
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Your Message
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your recruitment volume or questions..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="glass-input w-full rounded-xl p-3 text-xs leading-relaxed"
                    required
                  />
                </div>
                <Button type="submit" variant="primary" className="w-full" icon={Send}>
                  Send Message
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
