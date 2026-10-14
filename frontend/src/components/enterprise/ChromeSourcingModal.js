import React, { useState, useEffect } from 'react';
import {
  Globe,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Users,
  Search,
  Plus,
  Loader2,
  Mail,
  Phone,
  Github,
  Linkedin,
} from 'lucide-react';
import { sourcingService } from '../../services/enterprisePlatformService.js';
import { Button } from '../ui/Button.js';
import { Input } from '../ui/Input.js';
import { Select } from '../ui/Select.js';
import { Modal } from '../ui/Modal.js';
import { useToast } from '../../context/ToastContext.js';

export function ChromeSourcingModal({ isOpen, onClose, onCandidateImported }) {
  const toast = useToast();
  const [profileUrl, setProfileUrl] = useState('https://linkedin.com/in/tanyachen-architect');
  const [platform, setPlatform] = useState('LinkedIn');
  const [candidateName, setCandidateName] = useState('Tanya Chen');
  const [headline, setHeadline] = useState('Principal Distributed Systems Architect');
  const [company, setCompany] = useState('Stripe');
  const [skills, setSkills] = useState('Go, Kubernetes, Distributed Consensus, gRPC, AWS');
  const [selectedPool, setSelectedPool] = useState('pool-1');
  const [talentPools, setTalentPools] = useState([]);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichedData, setEnrichedData] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      sourcingService.getTalentPools().then((res) => {
        if (res.data) setTalentPools(res.data);
      });
    }
  }, [isOpen]);

  const handleEnrich = async () => {
    setIsEnriching(true);
    try {
      const res = await sourcingService.enrichCandidate({
        name: candidateName,
        profileUrl,
        platform,
      });
      setEnrichedData(res.data);
      toast.success(
        'Profile Enriched (97% Confidence)',
        `Discovered verified work email and social activity for ${candidateName}.`
      );
    } catch (e) {
      toast.error('Enrichment Failed', 'Could not fetch external social data.');
    } finally {
      setIsEnriching(false);
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    setIsImporting(true);
    try {
      const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await sourcingService.importCandidate({
        name: candidateName,
        headline,
        currentCompany: company,
        profileUrl,
        platform,
        skills: skillsArray,
        talentPoolId: selectedPool,
        email: enrichedData?.contactInfo?.verifiedWorkEmail,
      });

      toast.success(
        'Candidate Sourced Successfully!',
        `${candidateName} imported to talent pool and pipeline.`
      );
      if (onCandidateImported) onCandidateImported(res.data);
      onClose();
    } catch (e) {
      toast.error('Import Failed', 'Unable to import sourced candidate.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chrome Extension Talent Sourcing Copilot">
      <form onSubmit={handleImport} className="space-y-4">
        {/* Banner */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-brand-500/15 to-purple-500/15 border border-brand-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">HirebridgeHR Sourcing Extension v2.4</h4>
              <p className="text-[10px] text-slate-400">1-click scraping & contact discovery for LinkedIn, GitHub & Behance</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            EXTENSION CONNECTED
          </span>
        </div>

        {/* URL & Platform */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              label="Profile URL to Scrape"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              placeholder="https://linkedin.com/in/username"
              required
            />
          </div>
          <div>
            <Select
              label="Source Platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              options={[
                { label: 'LinkedIn', value: 'LinkedIn' },
                { label: 'GitHub', value: 'GitHub' },
                { label: 'Wellfound / AngelList', value: 'Wellfound' },
                { label: 'Behance / Dribbble', value: 'Behance' },
              ]}
            />
          </div>
        </div>

        {/* Candidate Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Candidate Full Name"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            required
          />
          <Input
            label="Current Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          />
        </div>

        <Input
          label="Headline / Current Role"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          required
        />

        <Input
          label="Skills (Comma-separated)"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="Go, Kubernetes, Python, AWS"
        />

        {/* Talent Pool Selection */}
        <div>
          <Select
            label="Target Talent Pool & CRM Segment"
            value={selectedPool}
            onChange={(e) => setSelectedPool(e.target.value)}
            options={talentPools.map((p) => ({
              label: `${p.name} (${p.candidateCount} candidates)`,
              value: p.id,
            }))}
          />
        </div>

        {/* Enrich Contact Section */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              AI Contact Enrichment & Social Verification
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleEnrich}
              isLoading={isEnriching}
            >
              Enrich Contact Info
            </Button>
          </div>

          {enrichedData && (
            <div className="mt-2 pt-2 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] animate-fade-in">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Mail className="w-3 h-3 text-brand-400" />
                <span className="font-mono text-white">{enrichedData.contactInfo.verifiedWorkEmail}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Phone className="w-3 h-3 text-emerald-400" />
                <span className="font-mono text-white">{enrichedData.contactInfo.phone}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 col-span-2">
                <Github className="w-3 h-3" />
                <span>{enrichedData.socialMetrics.github.publicRepos} GitHub Repos &bull; {enrichedData.socialMetrics.linkedin.connections} LinkedIn Connections</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={CheckCircle2}
            isLoading={isImporting}
          >
            Import to HirebridgeHR
          </Button>
        </div>
      </form>
    </Modal>
  );
}
