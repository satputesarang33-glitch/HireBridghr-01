import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Globe,
  Check,
  Copy,
  ExternalLink,
  Code,
  Radio,
  CheckCircle2,
  Sparkles,
  Search
} from 'lucide-react';
import { Button } from './Button.js';
import { syndicationService } from '../utils/syndicationService.js';
import './JobSyndicationModal.css';

export function JobSyndicationModal({
  isOpen,
  onClose,
  job
}) {
  if (!isOpen || !job) return null;

  const [activeTab, setActiveTab] = useState('channels'); // 'channels' | 'social' | 'seo'
  const [channels, setChannels] = useState([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const jobId = job.jobId || job.id;
  const publicUrl = `${window.location.origin}/jobs/${job.slug || job.id || jobId}`;

  useEffect(() => {
    if (jobId) {
      setChannels(syndicationService.getJobChannels(jobId));
    }
  }, [jobId]);

  const handleToggle = (channelId) => {
    const updated = syndicationService.toggleChannel(jobId, channelId);
    setChannels([...updated]);
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    }
  };

  const shareLinks = syndicationService.getShareLinks(job, publicUrl);
  const jsonLdSchema = syndicationService.generateGoogleJsonLd(job);
  const embedCode = syndicationService.generateEmbedSnippet(jobId, job.company || 'Company');

  return (
    <div className="ats-modal-overlay" onClick={onClose}>
      <div className="ats-syndication-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ats-modal-header border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Job Syndication & Distribution</h3>
              <p className="text-[11px] text-slate-500">
                Requisition: <strong className="text-slate-700">{job.title}</strong> • {job.company || 'Apex Global Tech'}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="ats-modal-close-btn text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50">
          <button
            type="button"
            className={`ats-offer-tab-btn ${activeTab === 'channels' ? 'active' : ''}`}
            onClick={() => setActiveTab('channels')}
          >
            Job Board Networks
          </button>
          <button
            type="button"
            className={`ats-offer-tab-btn ${activeTab === 'social' ? 'active' : ''}`}
            onClick={() => setActiveTab('social')}
          >
            Social & Direct Sharing
          </button>
          <button
            type="button"
            className={`ats-offer-tab-btn ${activeTab === 'seo' ? 'active' : ''}`}
            onClick={() => setActiveTab('seo')}
          >
            SEO Schema & Embed
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {activeTab === 'channels' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Automatically publish and syndicate this requisition across global talent aggregators and job boards:
              </p>

              <div className="space-y-2.5">
                {channels.map((ch) => (
                  <div key={ch.id} className="ats-channel-row">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{ch.logo}</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                          {ch.name}
                          {ch.status === 'ACTIVE' && (
                            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Synced ✓
                            </span>
                          )}
                        </h4>
                        <span className="text-[11px] text-slate-400">Reach: {ch.candidateReach}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggle(ch.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        ch.status === 'ACTIVE'
                          ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                          : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {ch.status === 'ACTIVE' ? 'Active Sync' : 'Publish to Board'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-4">
              {/* Direct Job Link */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Public Applicant Careers URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={publicUrl}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 font-mono text-slate-700"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={copiedLink ? Check : Copy}
                    onClick={() => handleCopy(publicUrl, 'link')}
                  >
                    {copiedLink ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>

              {/* Social Share Buttons */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Instant Social Network Dissemination
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href={shareLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="ats-social-btn bg-[#0A66C2] text-white hover:bg-[#004182]"
                  >
                    Share on LinkedIn
                  </a>
                  <a
                    href={shareLinks.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="ats-social-btn bg-slate-900 text-white hover:bg-slate-800"
                  >
                    Post to X (Twitter)
                  </a>
                  <a
                    href={shareLinks.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="ats-social-btn bg-[#25D366] text-white hover:bg-[#1da851]"
                  >
                    Send via WhatsApp
                  </a>
                  <a
                    href={shareLinks.email}
                    className="ats-social-btn bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200"
                  >
                    Send via Email
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-4">
              {/* Google for Jobs Schema */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-indigo-600" />
                    Google for Jobs JSON-LD Structured Data (SEO)
                  </label>
                  <span className="text-[10px] text-emerald-600 font-bold">Auto-injected into &lt;head&gt;</span>
                </div>
                <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 text-[10px] font-mono overflow-x-auto max-h-36">
                  {JSON.stringify(jsonLdSchema, null, 2)}
                </pre>
              </div>

              {/* Embed Snippet */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-sky-600" />
                    Embeddable Careers Widget Code
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopy(embedCode, 'snippet')}
                    className="text-[11px] font-bold text-indigo-600 hover:underline"
                  >
                    {copiedSnippet ? 'Copied Snippet ✓' : 'Copy HTML Snippet'}
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={2}
                  value={embedCode}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[11px] font-mono bg-slate-50 text-slate-700"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="ats-modal-footer border-t border-slate-200 px-6 py-4 flex items-center justify-between bg-slate-50">
          <span className="text-[11px] text-slate-500">
            Syndications update automatically when requisition details are edited.
          </span>
          <Button variant="primary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}

export default JobSyndicationModal;
