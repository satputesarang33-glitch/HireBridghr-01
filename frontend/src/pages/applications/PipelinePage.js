import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Columns,
  List,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Eye,
  Star,
  User,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import {
  useApplications,
  useUpdateApplicationStage,
} from "../../hooks/useApplications.js";
import { useJobs } from "../../hooks/useJobs.js";
import { Button } from "../../components/ui/Button.js";
import { Input } from "../../components/ui/Input.js";
import { Select } from "../../components/ui/Select.js";
import { Card } from "../../components/ui/Card.js";

export function PipelinePage() {
  const navigate = useNavigate();
  const [selectedJob, setSelectedJob] = useState("");
  const [search, setSearch] = useState("");

  const { data: appsRes, isLoading } = useApplications();
  const { data: jobsRes } = useJobs();
  const updateStageMutation = useUpdateApplicationStage();

  const applications = appsRes?.data || [];
  const jobs = jobsRes?.data || [];

  const normalizeStage = (stage) => {
    if (!stage) return "NEW";
    const s = String(stage).toUpperCase();
    if (s === "APPLIED") return "NEW";
    return s;
  };

  // Group / deduplicate jobs for dropdown, preferring IDs with active applications
  const jobOptions = React.useMemo(() => {
    const jobMap = new Map();
    jobs.forEach((j) => {
      const existing = jobMap.get(j.title);
      const hasApps = applications.some((a) => a.jobId === j.id);
      if (!existing || (!existing.hasApps && hasApps)) {
        jobMap.set(j.title, { id: j.id, title: j.title, hasApps });
      }
    });
    return Array.from(jobMap.values()).map((j) => ({
      label: j.title,
      value: j.id,
    }));
  }, [jobs, applications]);

  const selectedJobObj = jobs.find(
    (j) => j.id === selectedJob || j.title === selectedJob,
  );
  const selectedJobTitle = selectedJobObj?.title?.trim()?.toLowerCase();

  // Filtered applications
  const filteredApps = applications.filter((app) => {
    const appJobTitle = (app.jobTitle || app.job?.title || "")
      .trim()
      .toLowerCase();

    const matchesJob =
      !selectedJob ||
      selectedJob === "ALL" ||
      selectedJob === "" ||
      app.jobId === selectedJob ||
      app.jobTitle === selectedJob ||
      (selectedJobObj && app.jobId === selectedJobObj.id) ||
      (selectedJobTitle &&
        (appJobTitle === selectedJobTitle ||
          appJobTitle.includes(selectedJobTitle) ||
          selectedJobTitle.includes(appJobTitle)));

    const matchesSearch =
      !search ||
      app.candidateName?.toLowerCase().includes(search.toLowerCase()) ||
      app.jobTitle?.toLowerCase().includes(search.toLowerCase());

    return matchesJob && matchesSearch;
  });

  const stages = [
    {
      id: "NEW",
      label: "New Applicants",
      color: "border-slate-500/40 text-slate-300",
    },
    {
      id: "SCREENING",
      label: "Screening",
      color: "border-cyan-500/40 text-cyan-300",
    },
    {
      id: "SHORTLISTED",
      label: "Shortlisted",
      color: "border-indigo-500/40 text-indigo-300",
    },
    {
      id: "INTERVIEW",
      label: "Interviewing",
      color: "border-purple-500/40 text-purple-300",
    },
    {
      id: "OFFER",
      label: "Offer Extended",
      color: "border-amber-500/40 text-amber-300",
    },
    {
      id: "HIRED",
      label: "Hired & Placed",
      color: "border-emerald-500/40 text-emerald-300",
    },
  ];

  const moveStage = (appId, targetStage) => {
    updateStageMutation.mutate({ id: appId, stage: targetStage });
  };

  const getAdjacentStages = (currentStage) => {
    const stageIds = stages.map((s) => s.id);
    const normalized = normalizeStage(currentStage);
    const index = stageIds.indexOf(normalized);
    return {
      prev: index > 0 ? stageIds[index - 1] : null,
      next:
        index >= 0 && index < stageIds.length - 1 ? stageIds[index + 1] : null,
    };
  };

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-8.5rem)]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Recruitment Pipeline
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visual recruitment pipeline. Progress candidates across screening,
            technical rounds, and offer approvals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={List}
            onClick={() => navigate("/applications")}
          >
            Table View
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel rounded-xl p-3.5 border border-white/10 flex flex-col sm:flex-row gap-3 items-center justify-between flex-shrink-0">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Filter candidates in board..."
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-72">
          <Select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            options={[
              { label: "All Job Requisitions", value: "" },
              ...jobOptions,
            ]}
          />
        </div>
      </div>

      {/* Horizontal Kanban Columns Container */}
      <div className="flex-1 overflow-x-auto flex gap-4 pb-4 min-h-0">
        {stages.map((col) => {
          const colApps = filteredApps.filter(
            (a) => normalizeStage(a.stage) === col.id,
          );
          return (
            <div
              key={col.id}
              className="kanban-column w-72 flex-shrink-0 flex flex-col rounded-2xl border p-3"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full border ${col.color} bg-current`}
                  />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    {col.label}
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-white/5 text-slate-300">
                  {colApps.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {colApps.length === 0 ? (
                  <div className="p-6 text-center text-[11px] text-slate-500 rounded-xl border border-dashed border-white/5">
                    No candidates in this stage
                  </div>
                ) : (
                  colApps.map((app) => {
                    const { prev, next } = getAdjacentStages(app.stage);
                    return (
                      <div
                        key={app.id}
                        className="glass-card rounded-xl p-3.5 border border-white/10 hover:border-brand-400/40 transition-all space-y-2.5 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to={`/candidates/${app.candidateId}`}
                            className="text-xs font-bold text-white hover:text-brand-300 block truncate"
                          >
                            {app.candidateName}
                          </Link>
                          <span className="flex items-center gap-0.5 text-[10px] font-mono font-bold text-amber-400">
                            <Star className="w-2.5 h-2.5 fill-amber-400" />
                            {app.rating || "4.8"}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-300 font-medium truncate">
                          {app.jobTitle}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
                          <span>{app.source}</span>
                          <span>
                            {new Date(app.appliedDate).toLocaleDateString(
                              "en-US",
                            )}
                          </span>
                        </div>

                        {/* Pipeline Stage Transition Controls */}
                        <div className="flex items-center justify-between pt-1 gap-1">
                          <div className="flex items-center gap-1">
                            {prev && (
                              <button
                                onClick={() => moveStage(app.id, prev)}
                                className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10"
                                title={`Move backward to ${prev}`}
                              >
                                <ArrowLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {next && (
                              <button
                                onClick={() => moveStage(app.id, next)}
                                className="p-1 rounded text-brand-400 hover:text-brand-300 hover:bg-brand-500/20"
                                title={`Advance to ${next}`}
                                aria-label={`Advance to ${next}`}
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => moveStage(app.id, "REJECTED")}
                              className="p-1 rounded text-slate-500 hover:text-rose-400"
                              title="Mark as Rejected"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                navigate(`/candidates/${app.candidateId}`)
                              }
                              className="p-1 text-[10px] h-6"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
