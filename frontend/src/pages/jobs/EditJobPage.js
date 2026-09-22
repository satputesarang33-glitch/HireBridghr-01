import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, ArrowLeft, Plus, X } from 'lucide-react';
import { useJob, useUpdateJob } from '../../hooks/useJobs.js';
import { Input } from '../../components/ui/Input.js';
import { Select } from '../../components/ui/Select.js';
import { Button } from '../../components/ui/Button.js';
import { Card } from '../../components/ui/Card.js';
import { Skeleton } from '../../components/ui/Skeleton.js';

export function EditJobPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: jobRes, isLoading } = useJob(id);
  const updateJobMutation = useUpdateJob();

  const [formData, setFormData] = useState(null);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (jobRes?.data) {
      setFormData(jobRes.data);
    }
  }, [jobRes]);

  if (isLoading || !formData) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills?.includes(newSkill.trim())) {
      setFormData({ ...formData, skills: [...(formData.skills || []), newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setFormData({ ...formData, skills: formData.skills.filter((s) => s !== skill) });
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateJobMutation.mutate(
      { id, data: formData },
      {
        onSuccess: () => {
          navigate(`/jobs/${id}`);
        },
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <Link to={`/jobs/${id}`} className="text-xs text-slate-400 hover:text-white transition-colors">
            &larr; Back to Job Requisition
          </Link>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Edit Requisition: {formData.title}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <Card className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Job Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <Input
              label="Client / Division"
              value={formData.client || ''}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
            />

            <Select
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              options={[
                { label: 'Engineering', value: 'Engineering' },
                { label: 'Design', value: 'Design' },
                { label: 'DevOps & SRE', value: 'DevOps & SRE' },
                { label: 'Artificial Intelligence', value: 'Artificial Intelligence' },
                { label: 'Customer Operations', value: 'Customer Operations' },
              ]}
            />

            <Select
              label="Workplace Type"
              value={formData.workplaceType}
              onChange={(e) => setFormData({ ...formData, workplaceType: e.target.value })}
              options={[
                { label: 'Hybrid', value: 'Hybrid' },
                { label: 'Remote', value: 'Remote' },
                { label: 'On-site', value: 'On-site' },
              ]}
            />

            <Input
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />

            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { label: 'Draft', value: 'DRAFT' },
                { label: 'Pending Admin Publication', value: 'PENDING_ADMIN_PUBLICATION' },
                { label: 'Published', value: 'PUBLISHED' },
                { label: 'Closed', value: 'CLOSED' },
              ]}
            />

            <Select
              label="Currency"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              options={[
                { label: 'USD ($)', value: 'USD' },
                { label: 'INR (₹)', value: 'INR' },
                { label: 'GBP (£)', value: 'GBP' },
                { label: 'EUR (€)', value: 'EUR' },
                { label: 'AED (د.إ)', value: 'AED' },
                { label: 'SAR (﷼)', value: 'SAR' },
                { label: 'CAD ($)', value: 'CAD' },
              ]}
            />

            <Input
              label="Minimum Salary"
              type="number"
              value={formData.salaryMin}
              onChange={(e) => setFormData({ ...formData, salaryMin: Number(e.target.value) })}
            />

            <Input
              label="Maximum Salary"
              type="number"
              value={formData.salaryMax}
              onChange={(e) => setFormData({ ...formData, salaryMax: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Job Description
            </label>
            <textarea
              rows={8}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="glass-input w-full rounded-xl p-3.5 text-xs font-mono leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Skills
            </label>
            <div className="flex items-center gap-2 mb-3">
              <Input
                placeholder="Add skill tag..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <Button variant="secondary" size="sm" onClick={addSkill} icon={Plus}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(formData.skills || []).map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/15 text-brand-300 border border-brand-500/30"
                >
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-white/10">
            <Button variant="ghost" onClick={() => navigate(`/jobs/${id}`)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={Save}
              isLoading={updateJobMutation.isPending}
            >
              Save Changes
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
