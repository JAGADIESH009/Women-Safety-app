import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldAlert, 
  Copy, 
  Check,
  ExternalLink
} from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';
import type { ContactFormData } from '../types';

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    category: 'general',
    subject: '',
    message: '',
    honeypot: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<{ id: string; timestamp: string } | null>(null);
  const [copiedTicket, setCopiedTicket] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Spam honeypot detection
    if (formData.honeypot && formData.honeypot.trim() !== '') {
      newErrors.general = 'Spam submission detected.';
      setErrors(newErrors);
      return false;
    }

    // Name
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    } else if (formData.name.length > 70) {
      newErrors.name = 'Name cannot exceed 70 characters.';
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Subject
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required.';
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters.';
    } else if (formData.subject.length > 120) {
      newErrors.subject = 'Subject cannot exceed 120 characters.';
    }

    // Message
    if (!formData.message.trim()) {
      newErrors.message = 'Message content is required.';
    } else if (formData.message.trim().length < 20) {
      newErrors.message = 'Please provide more details (minimum 20 characters).';
    } else if (formData.message.length > 1500) {
      newErrors.message = 'Message cannot exceed 1500 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Generate real ticket reference
    const ticketId = `SH-${Math.floor(100000 + Math.random() * 900000)}`;
    const timestamp = new Date().toLocaleString();

    // Store in local storage for transparency
    try {
      const stored = JSON.parse(localStorage.getItem('safeher_support_inquiries') || '[]');
      stored.push({
        id: ticketId,
        date: timestamp,
        category: formData.category,
        subject: formData.subject,
        email: formData.email,
        name: formData.name,
      });
      localStorage.setItem('safeher_support_inquiries', JSON.stringify(stored));
    } catch {
      // Ignore local storage error
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedTicket({ id: ticketId, timestamp });
    }, 450);
  };

  const handleCopyTicket = () => {
    if (!submittedTicket) return;
    navigator.clipboard.writeText(submittedTicket.id);
    setCopiedTicket(true);
    setTimeout(() => setCopiedTicket(false), 2000);
  };

  const getMailtoLink = () => {
    const subject = encodeURIComponent(`[${submittedTicket?.id || 'Inquiry'}] ${formData.subject}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nCategory: ${formData.category}\nTicket: ${submittedTicket?.id || ''}\n\nMessage:\n${formData.message}`
    );
    return `mailto:${APP_CONFIG.supportEmail}?subject=${subject}&body=${body}`;
  };

  const handleResetForm = () => {
    setSubmittedTicket(null);
    setFormData({
      name: '',
      email: '',
      category: 'general',
      subject: '',
      message: '',
      honeypot: '',
    });
    setErrors({});
  };

  return (
    <section id="support" className="section support-section">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">
            <span className="badge badge-brand">Support & Feedback</span>
          </div>
          <h2>Contact SafeHer Engineering & Support</h2>
          <p>
            Have questions about the mobile app, IoT hardware integration, or safety incident reporting?
            Submit an inquiry below.
          </p>
        </div>

        <div className="support-grid">
          {/* Form Card */}
          <div className="card support-form-card">
            {submittedTicket ? (
              <div className="ticket-success-view">
                <div className="success-icon-wrap">
                  <CheckCircle2 size={44} className="text-emerald" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Inquiry Ticket Registered</h3>
                <p className="text-secondary text-sm mb-6">
                  Your inquiry has been cataloged. You can send it directly to the developer support inbox
                  using your mail client or keep your ticket reference for tracking.
                </p>

                {/* Ticket Reference Badge */}
                <div className="ticket-ref-box">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted">Ticket Reference ID</div>
                      <div className="font-mono text-lg font-bold text-brand">{submittedTicket.id}</div>
                    </div>
                    <button 
                      onClick={handleCopyTicket}
                      className="btn btn-secondary btn-sm"
                      title="Copy ticket ID to clipboard"
                    >
                      {copiedTicket ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                      <span>{copiedTicket ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="text-xs text-muted mt-2">
                    Logged at {submittedTicket.timestamp}
                  </div>
                </div>

                {/* Direct Mailto Action */}
                <div className="ticket-actions mt-6 flex flex-col gap-3">
                  <a 
                    href={getMailtoLink()}
                    className="btn btn-primary w-full"
                  >
                    <Mail size={16} />
                    <span>Send via Email to {APP_CONFIG.supportEmail}</span>
                    <ExternalLink size={14} />
                  </a>

                  <button 
                    onClick={handleResetForm}
                    className="btn btn-secondary w-full"
                  >
                    Submit Another Inquiry
                  </button>
                </div>

                <div className="config-notice mt-6">
                  <p className="text-xs text-muted leading-relaxed">
                    <strong>Technical Note:</strong> To protect against spam and maintain privacy without exposing 
                    SMTP server credentials in client-side code, direct communication is routed via verified email 
                    or the GitHub repository issue tracker.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="support-form">
                {/* Honeypot field (hidden from genuine users) */}
                <div style={{ display: 'none' }} aria-hidden="true">
                  <label htmlFor="hp_field">Do not fill this</label>
                  <input 
                    type="text" 
                    id="hp_field" 
                    tabIndex={-1} 
                    value={formData.honeypot} 
                    onChange={e => setFormData({ ...formData, honeypot: e.target.value })} 
                  />
                </div>

                {errors.general && (
                  <div className="alert-box alert-error mb-4">
                    <AlertCircle size={16} />
                    <span>{errors.general}</span>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group flex-1">
                    <label htmlFor="support-name" className="form-label">
                      Full Name <span className="text-rose">*</span>
                    </label>
                    <input 
                      type="text"
                      id="support-name"
                      className={`form-input ${errors.name ? 'input-error' : ''}`}
                      placeholder="e.g. Priya Sharma"
                      value={formData.name}
                      maxLength={70}
                      onChange={e => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: '' });
                      }}
                    />
                    {errors.name && <span className="error-hint">{errors.name}</span>}
                  </div>

                  <div className="form-group flex-1">
                    <label htmlFor="support-email" className="form-label">
                      Email Address <span className="text-rose">*</span>
                    </label>
                    <input 
                      type="email"
                      id="support-email"
                      className={`form-input ${errors.email ? 'input-error' : ''}`}
                      placeholder="e.g. priya@example.com"
                      value={formData.email}
                      maxLength={100}
                      onChange={e => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                    />
                    {errors.email && <span className="error-hint">{errors.email}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group flex-1">
                    <label htmlFor="support-category" className="form-label">
                      Inquiry Category
                    </label>
                    <select
                      id="support-category"
                      className="form-input form-select"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value as ContactFormData['category'] })}
                    >
                      <option value="general">General Question</option>
                      <option value="bug">Bug Report / Technical Issue</option>
                      <option value="sos-feedback">SOS & Alert System Feedback</option>
                      <option value="hardware-iot">IoT Hardware / Panic Pendant Inquiry</option>
                      <option value="emergency">Community Safety Suggestion</option>
                    </select>
                  </div>

                  <div className="form-group flex-1">
                    <label htmlFor="support-subject" className="form-label">
                      Subject <span className="text-rose">*</span>
                    </label>
                    <input 
                      type="text"
                      id="support-subject"
                      className={`form-input ${errors.subject ? 'input-error' : ''}`}
                      placeholder="Summary of inquiry"
                      value={formData.subject}
                      maxLength={120}
                      onChange={e => {
                        setFormData({ ...formData, subject: e.target.value });
                        if (errors.subject) setErrors({ ...errors, subject: '' });
                      }}
                    />
                    {errors.subject && <span className="error-hint">{errors.subject}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="support-message" className="form-label mb-0">
                      Detailed Message <span className="text-rose">*</span>
                    </label>
                    <span className="text-xs text-muted font-mono">
                      {formData.message.length} / 1500
                    </span>
                  </div>
                  <textarea 
                    id="support-message"
                    rows={5}
                    className={`form-input form-textarea ${errors.message ? 'input-error' : ''}`}
                    placeholder="Describe your question, device model, or feedback in detail..."
                    value={formData.message}
                    maxLength={1500}
                    onChange={e => {
                      setFormData({ ...formData, message: e.target.value });
                      if (errors.message) setErrors({ ...errors, message: '' });
                    }}
                  />
                  {errors.message && <span className="error-hint">{errors.message}</span>}
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn btn-primary w-full"
                >
                  <Send size={16} />
                  <span>{isSubmitting ? 'Registering Ticket...' : 'Submit Support Ticket'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Info Box */}
          <div className="support-info-col">
            <div className="card info-box-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="info-icon-circle">
                  <Mail size={20} className="text-brand" />
                </div>
                <div>
                  <h4 className="font-bold text-base">Direct Developer Contact</h4>
                  <p className="text-xs text-secondary">Official maintainer address</p>
                </div>
              </div>

              <div className="email-link-row">
                <span className="font-mono text-sm">{APP_CONFIG.supportEmail}</span>
              </div>

              <div className="support-hours-row mt-4">
                <Clock size={15} className="text-muted flex-shrink-0" />
                <span className="text-xs text-secondary">
                  Community and technical queries reviewed within 24-48 hours.
                </span>
              </div>
            </div>

            {/* Emergency Hotline Alert */}
            <div className="card emergency-distress-card mt-6">
              <div className="flex items-start gap-3">
                <ShieldAlert size={24} className="text-rose flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-rose mb-1">In Immediate Danger?</h4>
                  <p className="text-xs text-secondary leading-relaxed mb-3">
                    This contact form is for general and technical support only. If you are experiencing an 
                    active emergency, call your local emergency service immediately:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <a href="tel:112" className="badge badge-emergency font-mono font-bold">
                      National: 112
                    </a>
                    <a href="tel:1091" className="badge badge-emergency font-mono font-bold">
                      Women Helpline: 1091
                    </a>
                    <a href="tel:100" className="badge badge-emergency font-mono font-bold">
                      Police: 100
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
