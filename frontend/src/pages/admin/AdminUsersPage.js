import React, { useState, useEffect } from 'react';
import { Users2, Search, Mail, ShieldCheck } from 'lucide-react';
import { adminService } from '../../services/adminService.js';
import { Input } from '../../components/ui/Input.js';
import { TableSkeleton } from '../../components/ui/Skeleton.js';

export function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminService.getUsers().then((res) => {
      setUsers(res.data || []);
      setIsLoading(false);
    });
  }, []);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.organizationName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      <div className="border-b border-indigo-500/20 pb-4">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Global Platform Accounts
        </h1>
        <p className="text-xs text-indigo-300/70 mt-1">
          Registered recruiters, hiring managers, and workspace administrators across all tenants.
        </p>
      </div>

      <div className="w-full sm:w-80">
        <Input
          placeholder="Search global users..."
          icon={Search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="glass-panel rounded-xl border border-indigo-500/20">
          <TableSkeleton rows={4} cols={5} />
        </div>
      ) : (
        <div className="glass-panel rounded-xl border border-indigo-500/20 overflow-x-auto">
          <table className="glass-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Organization</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-white/20" />
                      <div>
                        <div className="font-bold text-white">{u.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs text-slate-200 font-medium">{u.organizationName}</span>
                  </td>
                  <td>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-300 font-mono">{u.phone}</span>
                  </td>
                  <td>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                      {u.status}
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
