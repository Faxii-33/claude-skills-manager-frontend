'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import Link from 'next/link';
import { Zap, TrendingUp, TrendingDown, Users, Clock, Pencil, Trash2, ExternalLink } from 'lucide-react';
import type { Skill } from '@/lib/types';

interface Stats {
  totalSkills: number;
  weeklyInvocations: number;
  prevWeekInvocations: number;
  teamCount: number;
  recentSkills: { name: string; updated_at: string; created_by: string | null }[];
  topSkills: { name: string; count: number }[];
}

export default function DashboardPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const [skillsRes, statsRes] = await Promise.all([
        supabase.from('skills').select('*').order('updated_at', { ascending: false }),
        fetch('/api/stats').then((r) => r.json()),
      ]);

      setSkills(skillsRes.data || []);
      setStats(statsRes);
      setLoading(false);
    };
    fetchData();
  }, []);

  const weeklyChange = stats
    ? stats.prevWeekInvocations > 0
      ? Math.round(((stats.weeklyInvocations - stats.prevWeekInvocations) / stats.prevWeekInvocations) * 100)
      : stats.weeklyInvocations > 0
      ? 100
      : 0
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Workspace · Dashboard</p>
          <h1 className="text-2xl font-bold text-white tracking-tight">Skills Dashboard</h1>
        </div>
        <Link
          href="/editor/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors"
        >
          + New Skill
        </Link>
      </div>

      <div className="flex gap-6">
        {/* Main content */}
        <div className="flex-1 space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              label="Total Skills"
              value={stats?.totalSkills || 0}
              sub={`${skills.length} active`}
              accent="cyan"
            />
            <StatCard
              label="Weekly Invocations"
              value={stats?.weeklyInvocations || 0}
              change={weeklyChange}
              accent="green"
            />
            <StatCard
              label="Team Members"
              value={stats?.teamCount || 0}
              accent="purple"
            />
          </div>

          {/* Skills grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Skills</h2>
              <Link href="/editor" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {skills.slice(0, 6).map((skill, i) => (
                <SkillCard key={skill.name} skill={skill} index={i} />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-72 shrink-0 space-y-4">
          {/* Recent Activity */}
          <div className="bg-surface-900 border border-surface-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {stats?.recentSkills?.slice(0, 5).map((s) => (
                <div key={s.name} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-surface-700 flex items-center justify-center mt-0.5 shrink-0">
                    <Pencil size={12} className="text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-200 truncate">
                      <span className="font-medium">{s.name}</span> updated
                    </p>
                    <p className="text-xs text-slate-500">{timeAgo(s.updated_at)}</p>
                  </div>
                </div>
              ))}
              {(!stats?.recentSkills || stats.recentSkills.length === 0) && (
                <p className="text-sm text-slate-500">No recent activity</p>
              )}
            </div>
          </div>

          {/* Top skills */}
          {stats?.topSkills && stats.topSkills.length > 0 && (
            <div className="bg-surface-900 border border-surface-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Most Used This Week</h3>
              <div className="space-y-3">
                {stats.topSkills.map((s, i) => (
                  <div key={s.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs text-slate-600 w-4">{i + 1}.</span>
                      <span className="text-sm text-slate-300 truncate">{s.name}</span>
                    </div>
                    <span className="text-xs text-slate-500 tabular-nums">{s.count} calls</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  change,
  accent,
}: {
  label: string;
  value: number;
  sub?: string;
  change?: number;
  accent: 'cyan' | 'green' | 'purple';
}) {
  const accentColors = {
    cyan: 'border-accent-cyan/20 bg-accent-cyan/5',
    green: 'border-accent-green/20 bg-accent-green/5',
    purple: 'border-accent-purple/20 bg-accent-purple/5',
  };
  const valueColors = {
    cyan: 'text-accent-cyan',
    green: 'text-accent-green',
    purple: 'text-accent-purple',
  };

  return (
    <div className={`rounded-xl border p-5 ${accentColors[accent]}`}>
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex items-end gap-3">
        <span className={`text-3xl font-bold tabular-nums ${valueColors[accent]}`}>
          {value.toLocaleString()}
        </span>
        {change !== undefined && (
          <span
            className={`flex items-center gap-0.5 text-xs font-medium mb-1 ${
              change >= 0 ? 'text-accent-green' : 'text-accent-red'
            }`}
          >
            {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(change)}%
          </span>
        )}
        {sub && <span className="text-xs text-slate-500 mb-1">{sub}</span>}
      </div>
    </div>
  );
}

function SkillCard({ skill, index }: { skill: Skill; index: number }) {
  return (
    <Link
      href={`/editor/${skill.name}`}
      className={`group block bg-surface-900 border border-surface-700/50 rounded-xl p-4 hover:border-brand-500/30 hover:bg-surface-850 transition-all animate-fade-in animate-fade-in-delay-${index + 1}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-surface-700 flex items-center justify-center">
          <Zap size={16} className="text-brand-400" />
        </div>
        <ExternalLink size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
      </div>
      <h3 className="text-sm font-semibold text-slate-200 mb-1 truncate">{skill.name}</h3>
      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{skill.description}</p>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-surface-700/50">
        <span className="text-[10px] text-slate-600 font-mono truncate">{skill.parameters}</span>
      </div>
    </Link>
  );
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
