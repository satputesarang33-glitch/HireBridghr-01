import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  IndianRupee,
  Bookmark,
  Users,
  Calendar,
  Briefcase,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import {
  useCandidateJobs,
  useCandidateSavedJobs,
  useSaveJob,
  useRemoveSavedJob,
  useCandidateApplications,
} from '../../hooks/useCandidatePortal.js';
import { Button } from '../../components/ui/Button.js';
import { ApplyJobModal } from '../../components/candidate/ApplyJobModal.js';
import { cn } from '../../utils/cn.js';

export function CandidateJobsPage() {
  const { data: allJobs = [], isLoading } = useCandidateJobs();
  const { data: savedJobs = [] } = useCandidateSavedJobs();
  const { data: applications = [] } = useCandidateApplications();

  const saveJobMutation = useSaveJob();
  const removeSavedJobMutation = useRemoveSavedJob();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [jobTypeFilter, setJobTypeFilter] = useState('ALL');
  const [workModeFilter, setWorkModeFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [experienceFilter, setExperienceFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'salary' | 'title'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Selected job for apply modal
  const [selectedJobToApply, setSelectedJobToApply] = useState(null);

  const handleToggleSave = (jobId) => {
    const isSaved = savedJobs.some((j) => (typeof j === 'string' ? j === jobId : j.id === jobId));
    if (isSaved) {
      removeSavedJobMutation.mutate(jobId);
    } else {
      saveJobMutation.mutate(jobId);
    }
  };

  const isJobSaved = (jobId) => {
    return savedJobs.some((j) => (typeof j === 'string' ? j === jobId : j.id === jobId));
  };

  const isJobApplied = (jobId) => {
    return applications.some((a) => a.jobId === jobId);
  };

  // Filter & Sort Logic
  const filteredJobs = useMemo(() => {
    return allJobs
      .filter((job) => {
        // Search by Title, Skills, Company, Location
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          const matchTitle = job.title?.toLowerCase().includes(query);
          const matchCompany = job.company?.toLowerCase().includes(query);
          const matchLocation = job.location?.toLowerCase().includes(query);
          const matchSkills = job.skills?.some((s) => s.toLowerCase().includes(query));
          if (!matchTitle && !matchCompany && !matchLocation && !matchSkills) {
            return false;
          }
        }

        // Location Filter
        if (locationFilter !== 'ALL') {
          if (!job.location?.toLowerCase().includes(locationFilter.toLowerCase())) {
            return false;
          }
        }

        // Job Type Filter
        if (jobTypeFilter !== 'ALL') {
          const typeNormalized = (job.jobType || '').replace(/[-_]/g, '').toLowerCase();
          const filterNormalized = jobTypeFilter.replace(/[-_]/g, '').toLowerCase();
          if (!typeNormalized.includes(filterNormalized)) {
            return false;
          }
        }

        // Work Mode Filter
        if (workModeFilter !== 'ALL') {
          const modeNormalized = (job.workMode || '').toUpperCase();
          if (modeNormalized !== workModeFilter.toUpperCase()) {
            return false;
          }
        }

        // Department Filter
        if (departmentFilter !== 'ALL') {
          if ((job.department || '').toUpperCase() !== departmentFilter.toUpperCase()) {
            return false;
          }
        }

        // Experience Filter
        if (experienceFilter !== 'ALL') {
          if (experienceFilter === 'ENTRY' && (job.experienceMin || 0) > 2) return false;
          if (experienceFilter === 'MID' && ((job.experienceMin || 0) < 2 || (job.experienceMin || 0) > 5)) return false;
          if (experienceFilter === 'SENIOR' && (job.experienceMin || 0) < 5) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'salary') {
          const salA = a.salaryMax || 0;
          const salB = b.salaryMax || 0;
          return salB - salA;
        }
        if (sortBy === 'title') {
          return (a.title || '').localeCompare(b.title || '');
        }
        // Default: most recent
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [
    allJobs,
    searchTerm,
    locationFilter,
    jobTypeFilter,
    workModeFilter,
    departmentFilter,
    experienceFilter,
    sortBy,
  ]);

  // Paginated jobs
  const totalPages = Math.ceil(filteredJobs.length / pageSize) || 1;
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('ALL');
    setJobTypeFilter('ALL');
    setWorkModeFilter('ALL');
    setDepartmentFilter('ALL');
    setExperienceFilter('ALL');
    setSortBy('recent');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm ||
    locationFilter !== 'ALL' ||
    jobTypeFilter !== 'ALL' ||
    workModeFilter !== 'ALL' ||
    departmentFilter !== 'ALL' ||
    experienceFilter !== 'ALL';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-white/80 dark:border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Explore Available Careers
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Find and apply for opportunities matching your background and career ambitions.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Showing: <strong className="text-cyan-400">{filteredJobs.length}</strong> jobs found</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-5 space-y-3">
          {/* Main Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by job title, skills (React, Node, Cloud), company, or location..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="glass-input w-full pl-10 pr-10 py-2.5 text-sm rounded-xl"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Pills / Selects */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
            {/* Location */}
            <select
              value={locationFilter}
              onChange={(e) => {
                setLocationFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="glass-input text-xs rounded-xl px-2.5 py-2"
            >
              <option value="ALL">All Locations</option>
              <option value="San Francisco">San Francisco, CA</option>
              <option value="New York">New York, NY</option>
              <option value="Austin">Austin, TX</option>
              <option value="Pune">Pune, India</option>
              <option value="Bengaluru">Bengaluru, India</option>
              <option value="London">London, UK</option>
            </select>

            {/* Job Type */}
            <select
              value={jobTypeFilter}
              onChange={(e) => {
                setJobTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="glass-input text-xs rounded-xl px-2.5 py-2"
            >
              <option value="ALL">All Job Types</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="PART_TIME">Part Time</option>
              <option value="INTERNSHIP">Internship</option>
            </select>

            {/* Work Mode */}
            <select
              value={workModeFilter}
              onChange={(e) => {
                setWorkModeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="glass-input text-xs rounded-xl px-2.5 py-2"
            >
              <option value="ALL">Work Mode</option>
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ON_SITE">On-site</option>
            </select>

            {/* Department */}
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="glass-input text-xs rounded-xl px-2.5 py-2"
            >
              <option value="ALL">All Departments</option>
              <option value="ENGINEERING">Engineering</option>
              <option value="PRODUCT">Product</option>
              <option value="DESIGN">Design</option>
              <option value="MARKETING">Marketing</option>
              <option value="SALES">Sales</option>
            </select>

            {/* Experience */}
            <select
              value={experienceFilter}
              onChange={(e) => {
                setExperienceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="glass-input text-xs rounded-xl px-2.5 py-2"
            >
              <option value="ALL">All Experience</option>
              <option value="ENTRY">0–2 Years (Entry)</option>
              <option value="MID">2–5 Years (Mid)</option>
              <option value="SENIOR">5+ Years (Senior)</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="glass-input text-xs rounded-xl px-2.5 py-2"
            >
              <option value="recent">Most Recent</option>
              <option value="salary">Highest Salary</option>
              <option value="title">Job Title (A-Z)</option>
            </select>
          </div>

          {/* Active Filter Clearer */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-slate-400">Filters applied</span>
              <button
                onClick={clearFilters}
                className="text-cyan-400 hover:underline font-semibold flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Jobs Grid */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-400 mt-2">Loading available jobs...</p>
        </div>
      ) : paginatedJobs.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-white/80 dark:border-white/10">
          <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No matching jobs found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Try adjusting your search query or clearing some of the active filters to see more results.
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedJobs.map((job) => {
            const saved = isJobSaved(job.id);
            const applied = isJobApplied(job.id);

            return (
              <div
                key={job.id}
                className="glass-card glass-card-interactive rounded-2xl p-5 border border-white/80 dark:border-white/10 flex flex-col justify-between transition-all"
              >
                <div>
                  {/* Top Badges & Save Bookmark */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-500">
                          {job.jobType || 'Full-Time'}
                        </span>
                        <span className="text-slate-500 text-[10px]">&bull;</span>
                        <span className="text-[10px] font-medium text-purple-400">
                          {job.workMode || 'Remote'}
                        </span>
                        {job.openings && (
                          <>
                            <span className="text-slate-500 text-[10px]">&bull;</span>
                            <span className="text-[10px] text-slate-400">
                              {job.openings} opening{job.openings > 1 ? 's' : ''}
                            </span>
                          </>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                        {job.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {job.company || 'ApexTech Global'} &bull; {job.department || 'Engineering'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleSave(job.id)}
                      className={cn(
                        'p-2 rounded-xl border transition-colors shrink-0',
                        saved
                          ? 'bg-amber-500/20 border-amber-400 text-amber-400'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      )}
                      title={saved ? 'Remove saved job' : 'Save job'}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400 mt-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      {job.experienceMin || 2}–{job.experienceMax || 5} Years
                    </span>
                    <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                      <IndianRupee className="w-3.5 h-3.5 shrink-0" />
                      {job.salaryRange || '₹12L – ₹22L'}
                    </span>
                  </div>

                  {/* Short snippet */}
                  <p className="text-xs text-slate-400 line-clamp-2 mt-2.5 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Skills tags */}
                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.skills.slice(0, 5).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/5 border border-white/10 text-slate-300"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 5 && (
                        <span className="text-[10px] text-slate-500 self-center">
                          +{job.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  <Link
                    to={`/candidate/jobs/${job.id}`}
                    className="text-xs font-semibold text-cyan-400 hover:underline"
                  >
                    View Job &rarr;
                  </Link>

                  {applied ? (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Already Applied
                    </span>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedJobToApply(job)}
                    >
                      Apply Now
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-slate-400">
          <span>
            Page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={ChevronLeft}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={ChevronRight}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {selectedJobToApply && (
        <ApplyJobModal
          isOpen={!!selectedJobToApply}
          onClose={() => setSelectedJobToApply(null)}
          job={selectedJobToApply}
        />
      )}
    </div>
  );
}
