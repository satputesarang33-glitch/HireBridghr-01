import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Building,
  User,
  ExternalLink,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { adminService } from '../../services/adminService.js';
import { Button } from '../../components/ui/Button.js';
import { Card } from '../../components/ui/Card.js';
import { Modal } from '../../components/ui/Modal.js';
import { Select } from '../../components/ui/Select.js';
import { TableSkeleton } from '../../components/ui/Skeleton.js';
import { useToast } from '../../context/ToastContext.js';

export function PublicationQueuePage() {
  const toast = useToast();
  const [queue, setQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeItem, setActiveItem] = useState(null);
  const [internalNote, setInternalNote] = useState('');

  const fetchQueue = () => {
    setIsLoading(true);
    adminService.getPublicationQueue().then((res) => {
      setQueue(res.data || []);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleUpdateStatus = async (pubId, status) => {
    await adminService.updatePublicationStatus(pubId, {
      status,
      internalNotes: internalNote || 'Status updated by platform administrator.',
    });
    toast.success(
      'Publication Queue Updated',
      `Job requisition publication status marked as ${status}.`
    );
    setActiveItem(null);
    setInternalNote('');
    fetchQueue();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            Published
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
            Pending Admin Review
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            Processing
          </span>
        );
      case 'REJECTED':
      case 'FAILED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            {status}
          </span>
        );
      default:
        return <span className="text-xs text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      {/* Header */}
      <div className="border-b border-indigo-500/20 pb-4">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Admin Job Publication Queue
        </h1>
        <p className="text-xs text-indigo-300/70 mt-1">
          Review publication requests from customer organizations before syndicating to the public portal.
        </p>
      </div>

      {isLoading ? (
        <div className="glass-panel rounded-xl border border-indigo-500/20">
          <TableSkeleton rows={4} cols={6} />
        </div>
      ) : queue.length === 0 ? (
        <Card className="p-12 text-center text-xs text-slate-400">
          No publication requests in the queue.
        </Card>
      ) : (
        <div className="glass-panel rounded-xl border border-indigo-500/20 overflow-x-auto">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Job Requisition</th>
                <th>Tenant Organization</th>
                <th>Requested By</th>
                <th>Date Requested</th>
                <th>Target Platform</th>
                <th>Status</th>
                <th className="text-right">Admin Action</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="font-bold text-white">{item.jobTitle}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{item.jobId}</div>
                  </td>
                  <td>
                    <span className="text-xs text-slate-200 font-semibold">{item.organizationName}</span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-300">{item.requestedBy}</span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(item.requestedDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/5 border border-white/10 text-cyan-300">
                      {item.targetPlatform || 'MANUAL'}
                    </span>
                  </td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td className="text-right">
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() => {
                        setActiveItem(item);
                        setInternalNote(item.internalNotes || '');
                      }}
                      className="text-xs"
                    >
                      Review & Approve &rarr;
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={!!activeItem}
        onClose={() => setActiveItem(null)}
        title={`Review Requisition: ${activeItem?.jobTitle}`}
        description="Verify requisition specifications and change distribution status."
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Organization:</span>
              <span className="font-bold text-white">{activeItem?.organizationName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Requested By:</span>
              <span className="font-medium text-slate-200">{activeItem?.requestedBy}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Platform Channel:</span>
              <span className="font-mono text-cyan-400">{activeItem?.targetPlatform}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Current Status:</span>
              <span>{activeItem && getStatusBadge(activeItem.status)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Internal Admin Notes
            </label>
            <textarea
              rows={3}
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="Add verification notes, reasons for rejection, or compliance checks..."
              className="glass-input w-full rounded-xl p-2.5 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
            <Button
              variant="danger"
              size="sm"
              icon={XCircle}
              onClick={() => handleUpdateStatus(activeItem.id, 'REJECTED')}
            >
              Reject Publication
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleUpdateStatus(activeItem.id, 'PROCESSING')}
              >
                Mark In Processing
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle2}
                onClick={() => handleUpdateStatus(activeItem.id, 'PUBLISHED')}
              >
                Approve & Mark Published
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
