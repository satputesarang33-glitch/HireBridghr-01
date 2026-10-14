import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Briefcase,
  Laptop,
  FileText,
  UserCheck,
  DollarSign,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { onboardingService } from '../../services/enterprisePlatformService.js';
import { Card } from '../ui/Card.js';
import { Button } from '../ui/Button.js';
import { Select } from '../ui/Select.js';
import { useToast } from '../../context/ToastContext.js';

export function OnboardingWorkflowCard({ candidateId, candidateName = 'Alexander Rivera' }) {
  const toast = useToast();
  const [bgCheck, setBgCheck] = useState(null);
  const [checklist, setChecklist] = useState(null);
  const [selectedHris, setSelectedHris] = useState('Workday');
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionResult, setProvisionResult] = useState(null);

  useEffect(() => {
    onboardingService.getBackgroundCheck(candidateId).then((res) => {
      if (res.data) setBgCheck(res.data);
    });
    onboardingService.getOnboardingChecklist(candidateId).then((res) => {
      if (res.data) setChecklist(res.data);
    });
  }, [candidateId]);

  const handleToggleChecklistItem = async (itemId) => {
    try {
      const res = await onboardingService.updateChecklistItem(candidateId, itemId, {});
      setChecklist((prev) => ({
        ...prev,
        progressPercentage: res.data.progressPercentage,
        items: res.data.items,
      }));
      toast.success('Checklist Updated', 'Onboarding progress updated in real-time.');
    } catch (e) {
      toast.error('Update Error', 'Could not update checklist item.');
    }
  };

  const handleProvisionHris = async () => {
    setIsProvisioning(true);
    try {
      const res = await onboardingService.provisionHris({
        candidateId,
        candidateName,
        targetHris: selectedHris,
        jobTitle: 'Lead Product Architect',
        department: 'Product Engineering',
        baseSalary: '$155,000',
      });
      setProvisionResult(res.data);
      toast.success(
        `Provisioned to ${selectedHris}!`,
        `Assigned Employee ID: ${res.data.employeeId}. Welcome kit dispatched.`
      );
    } catch (e) {
      toast.error('Provisioning Error', 'Unable to provision employee to HRIS.');
    } finally {
      setIsProvisioning(false);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-white">New Hire Preboarding & Background Verification</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              OFFER ACCEPTED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated criminal/employment background verification and day-one onboarding checklist.
          </p>
        </div>

        {/* HRIS Provisioning Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="w-36">
            <Select
              value={selectedHris}
              onChange={(e) => setSelectedHris(e.target.value)}
              options={[
                { label: 'Workday HRIS', value: 'Workday' },
                { label: 'Rippling Payroll', value: 'Rippling' },
                { label: 'BambooHR', value: 'BambooHR' },
                { label: 'Gusto Platform', value: 'Gusto' },
              ]}
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={UserCheck}
            isLoading={isProvisioning}
            onClick={handleProvisionHris}
          >
            Provision to HRIS
          </Button>
        </div>
      </div>

      {provisionResult && (
        <div className="p-4 rounded-xl bg-purple-500/15 border border-purple-500/30 space-y-2 animate-fade-in text-xs">
          <div className="flex items-center justify-between text-purple-300 font-bold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Employee Provisioned to {provisionResult.targetHris}
            </span>
            <span className="font-mono text-white bg-purple-500/30 px-2 py-0.5 rounded">
              ID: {provisionResult.employeeId}
            </span>
          </div>
          <p className="text-slate-300">
            Work Email: <strong className="text-white font-mono">{provisionResult.workEmail}</strong> &bull; Start Date: {provisionResult.startDate} &bull; Payroll Direct Deposit: Ready
          </p>
        </div>
      )}

      {/* Background Check Card */}
      {bgCheck && (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Background Check Report ({bgCheck.provider})
              </h4>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              STATUS: {bgCheck.status} ({bgCheck.adjudication})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
            {(bgCheck.checks || []).map((chk) => (
              <div
                key={chk.name}
                className="flex items-center justify-between p-2 rounded-lg bg-black/20 text-slate-300"
              >
                <span>{chk.name}</span>
                <span className="font-mono font-bold text-emerald-400 text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {chk.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day-One Onboarding Checklist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white">Day-One Onboarding Checklist</h4>
            <p className="text-xs text-slate-400">
              {checklist?.progressPercentage || 0}% Completed ({checklist?.completedCount || 0} of {checklist?.totalItems || 6} items)
            </p>
          </div>
          <div className="w-32 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-white/10 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${checklist?.progressPercentage || 0}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          {(checklist?.items || []).map((item) => (
            <div
              key={item.id}
              onClick={() => handleToggleChecklistItem(item.id)}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                item.status === 'COMPLETED'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={item.status === 'COMPLETED'}
                  onChange={() => {}} // Controlled via card click
                  className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 bg-slate-900 border-white/20 cursor-pointer"
                />
                <div>
                  <div className={`text-xs font-bold ${item.status === 'COMPLETED' ? 'text-white' : 'text-slate-200'}`}>
                    {item.title}
                  </div>
                  <div className="text-[10px] text-slate-400">{item.description}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400">{item.dueDate}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.status === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
