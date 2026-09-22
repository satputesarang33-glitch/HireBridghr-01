import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, MapPin, Briefcase, ArrowRight, ExternalLink } from 'lucide-react';
import { useJobs } from '../../hooks/useJobs.js';
import { Button } from '../../components/ui/Button.js';
import { Card } from '../../components/ui/Card.js';
import { Skeleton } from '../../components/ui/Skeleton.js';

export function CompanyCareersPage() {
  const { companySlug } = useParams();
  const { data: jobsRes, isLoading } = useJobs();

  const jobs = (jobsRes?.data || []).filter((j) => j.status === 'PUBLISHED');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-brand-500/30 selection:text-brand-200">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-accent-600 flex items-center justify-center text-white">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="text-base font-extrabold tracking-tight">
            Apex Global Tech <span className="text-brand-400 font-normal">Careers</span>
          </span>
        </Link>
        <Link to="/">
          <Button variant="ghost" size="sm">HirebridgeHR Platform</Button>
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Build the Future With Us
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            We are looking for ambitious innovators, engineers, and product specialists to expand our enterprise software solutions.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Open Requisitions ({jobs.length})
          </h2>

          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <Card key={job.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-semibold text-brand-400 uppercase tracking-wider">
                      {job.department}
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">{job.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </span>
                      <span>&bull;</span>
                      <span>{job.workplaceType} ({job.employmentType})</span>
                    </p>
                  </div>

                  <Link to={`/jobs/${job.slug}`}>
                    <Button variant="primary" size="sm">
                      View Position &rarr;
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
