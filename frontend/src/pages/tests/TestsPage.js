import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  Plus,
  Search,
  Clock,
  Users,
  CheckCircle2,
  Send,
  Sparkles,
  BarChart3,
  Award,
  Filter,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.js';
import { Modal } from '../../components/ui/Modal.js';
import { useToast } from '../../context/ToastContext.js';

export function TestsPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  const [tests, setTests] = useState([
    {
      id: 'test-1',
      title: 'Senior Full Stack Engineering Challenge',
      category: 'ENGINEERING',
      duration: '90 mins',
      difficulty: 'Expert',
      skills: ['React', 'Node.js', 'PostgreSQL', 'System Design'],
      completedCount: 38,
      avgScore: '84%',
      passRate: '72%',
    },
    {
      id: 'test-2',
      title: 'Product Design & UI/UX Figma Exercise',
      category: 'DESIGN',
      duration: '60 mins',
      difficulty: 'Intermediate',
      skills: ['Design System', 'Wireframing', 'Prototyping', 'User Flows'],
      completedCount: 24,
      avgScore: '88%',
      passRate: '81%',
    },
    {
      id: 'test-3',
      title: 'DevOps & Cloud Infrastructure Assessment',
      category: 'ENGINEERING',
      duration: '45 mins',
      difficulty: 'Advanced',
      skills: ['Kubernetes', 'Terraform', 'AWS', 'Docker', 'CI/CD'],
      completedCount: 19,
      avgScore: '79%',
      passRate: '68%',
    },
    {
      id: 'test-4',
      title: 'Product Management Strategy & Roadmapping',
      category: 'PRODUCT',
      duration: '60 mins',
      difficulty: 'Advanced',
      skills: ['PRD Writing', 'Prioritization', 'Metrics & OKRs', 'Discovery'],
      completedCount: 15,
      avgScore: '91%',
      passRate: '86%',
    },
    {
      id: 'test-5',
      title: 'Data Engineering & SQL Analytics Test',
      category: 'DATA',
      duration: '60 mins',
      difficulty: 'Advanced',
      skills: ['SQL', 'Python', 'ETL Pipelines', 'Data Warehousing'],
      completedCount: 29,
      avgScore: '82%',
      passRate: '74%',
    },
  ]);

  const [newTest, setNewTest] = useState({
    title: '',
    category: 'ENGINEERING',
    duration: '60 mins',
    difficulty: 'Intermediate',
    skills: '',
  });

  const handleCreateTest = (e) => {
    e.preventDefault();
    if (!newTest.title) return;
    const created = {
      id: `test-${Date.now()}`,
      ...newTest,
      skills: newTest.skills.split(',').map((s) => s.trim()).filter(Boolean),
      completedCount: 0,
      avgScore: 'N/A',
      passRate: 'N/A',
    };
    setTests([created, ...tests]);
    setShowCreateModal(false);
    toast.success('Test Created', `Assessment "${newTest.title}" added to test library.`);
    setNewTest({
      title: '',
      category: 'ENGINEERING',
      duration: '60 mins',
      difficulty: 'Intermediate',
      skills: '',
    });
  };

  const filteredTests = tests.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = filterCategory === 'ALL' || t.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Skill Assessments &amp; Tests
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Standardized technical challenges, design exercises, and behavioral screening tests.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowCreateModal(true)}>
            Create New Test
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-sm">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Available Tests</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{tests.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-sm">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Tests Completed</p>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">125</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-sm">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Average Score</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">84.8%</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-sm">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Average Pass Rate</p>
          <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-1">76.2%</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search test or skill tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'ENGINEERING', 'DESIGN', 'PRODUCT', 'DATA'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Test Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTests.map((test) => (
          <div
            key={test.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 hover:border-indigo-400/40 shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
                  {test.category}
                </span>
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {test.duration}
                </span>
              </div>

              <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                {test.title}
              </h3>

              <div className="flex flex-wrap gap-1.5 mt-3 mb-4">
                {test.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-bold text-slate-900 dark:text-white">{test.completedCount}</span> completed &middot; avg {test.avgScore}
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={Send}
                onClick={() => {
                  setSelectedTest(test);
                  setShowSendModal(true);
                }}
              >
                Send Test
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Test Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Assessment Test"
        description="Add a technical or behavioral evaluation to your library"
      >
        <form onSubmit={handleCreateTest} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
              Test Title *
            </label>
            <input
              type="text"
              required
              value={newTest.title}
              onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
              placeholder="e.g. React Native Mobile App Architecture Test"
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={newTest.category}
                onChange={(e) => setNewTest({ ...newTest, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              >
                <option value="ENGINEERING">Engineering</option>
                <option value="DESIGN">Design</option>
                <option value="PRODUCT">Product</option>
                <option value="DATA">Data</option>
                <option value="SALES">Sales</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Duration
              </label>
              <select
                value={newTest.duration}
                onChange={(e) => setNewTest({ ...newTest, duration: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              >
                <option value="30 mins">30 mins</option>
                <option value="45 mins">45 mins</option>
                <option value="60 mins">60 mins</option>
                <option value="90 mins">90 mins</option>
                <option value="120 mins">120 mins</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
              Skills Covered (Comma Separated)
            </label>
            <input
              type="text"
              value={newTest.skills}
              onChange={(e) => setNewTest({ ...newTest, skills: e.target.value })}
              placeholder="React, TypeScript, Redux, Performance"
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
            <Button variant="glass" size="sm" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Plus}>
              Create Test
            </Button>
          </div>
        </form>
      </Modal>

      {/* Send Test Modal */}
      <Modal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        title={`Send ${selectedTest?.title || 'Test'} to Candidate`}
        description="The candidate will receive an invitation link with instructions"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
              Select Candidate
            </label>
            <select className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium">
              <option>Alexander Wright (alexander.w@example.com)</option>
              <option>Priya Sharma (priya.s@example.com)</option>
              <option>Chloe Tremblay (chloe.t@example.com)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
              Deadline / Expiry
            </label>
            <select className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium">
              <option>48 Hours</option>
              <option>72 Hours (Recommended)</option>
              <option>5 Days</option>
              <option>7 Days</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
            <Button variant="glass" size="sm" onClick={() => setShowSendModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Send}
              onClick={() => {
                setShowSendModal(false);
                toast.success('Test Dispatched', `Test link has been emailed to candidate.`);
              }}
            >
              Dispatch Test
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
