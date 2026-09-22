import React, { useState, useEffect } from 'react';
import { Building, Search, Plus, ExternalLink, Users } from 'lucide-react';
import { adminService } from '../../services/adminService.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { TableSkeleton } from '../../components/ui/Skeleton.js';

export function AdminOrgsPage() {
  const [orgs, setOrgs] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminService.getOrganizations().then((res) => {
      setOrgs(res.data || []);
      setIsLoading(false);
    });
  }, []);

  const filtered = orgs.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.industry.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-500/20 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Tenant Organizations
          </h1>
          <p className="text-xs text-indigo-300/70 mt-1">
            Multi-tenant workspace isolation, subscription tiers, and company accounts.
          </p>
        </div>
      </div>

      <div className="w-full sm:w-80">
        <Input
          placeholder="Search organizations..."
          icon={Search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="glass-panel rounded-xl border border-indigo-500/20">
          <TableSkeleton rows={3} cols={6} />
        </div>
      ) : (
        <div className="glass-panel rounded-xl border border-indigo-500/20 overflow-x-auto">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Organization</th>
                <th>Type</th>
                <th>Industry</th>
                <th>HQ Location</th>
                <th>Active Jobs</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((org) => (
                <tr key={org.id}>
                  <td>
                    <div className="font-bold text-white">{org.name}</div>
                    <a
                      href={org.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      {org.website}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </td>
                  <td>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-white/5 border border-white/10 text-slate-300">
                      {org.type}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-300">{org.industry}</span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-300">{org.city}, {org.country}</span>
                  </td>
                  <td>
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      {org.activeJobsCount} roles
                    </span>
                  </td>
                  <td>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300">
                      {org.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
