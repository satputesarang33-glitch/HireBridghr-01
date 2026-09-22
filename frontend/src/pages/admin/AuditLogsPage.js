import React, { useState, useEffect } from 'react';
import { ScrollText, Search, Shield, Filter, Clock } from 'lucide-react';
import { adminService } from '../../services/adminService.js';
import { Input } from '../../components/ui/Input.js';
import { TableSkeleton } from '../../components/ui/Skeleton.js';

export function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminService.getAuditLogs().then((res) => {
      setLogs(res.data || []);
      setIsLoading(false);
    });
  }, []);

  const filtered = logs.filter((l) =>
    l.actor.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.entityName?.toLowerCase().includes(search.toLowerCase()) ||
    l.organization?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      <div className="border-b border-indigo-500/20 pb-4">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          System Audit Trail & Compliance Log
        </h1>
        <p className="text-xs text-indigo-300/70 mt-1">
          Immutable event stream capturing administrative actions, publication workflows, and candidate state transitions.
        </p>
      </div>

      <div className="w-full sm:w-80">
        <Input
          placeholder="Filter audit events by actor or action..."
          icon={Search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="glass-panel rounded-xl border border-indigo-500/20">
          <TableSkeleton rows={4} cols={6} />
        </div>
      ) : (
        <div className="glass-panel rounded-xl border border-indigo-500/20 overflow-x-auto">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Actor & Role</th>
                <th>Action Event</th>
                <th>Target Entity</th>
                <th>Organization</th>
                <th>Timestamp</th>
                <th>Client IP</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id}>
                  <td>
                    <div className="font-bold text-white">{log.actor}</div>
                    <span className="text-[10px] font-mono text-slate-400">{log.role}</span>
                  </td>
                  <td>
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-white/5 border border-white/10 text-indigo-300">
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <div className="text-xs text-slate-200 font-medium">{log.entityName}</div>
                    <span className="text-[10px] text-slate-400 font-mono">{log.entity} ({log.entityId})</span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-300">{log.organization}</span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(log.date).toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-400 font-mono">{log.ipAddress}</span>
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
