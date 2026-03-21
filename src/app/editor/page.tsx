'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import type { Skill } from '@/lib/types';

export default function EditorListPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  const fetchSkills = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('skills')
      .select('*')
      .order('updated_at', { ascending: false });
    setSkills(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchSkills(); }, []);

  const handleDelete = async (name: string) => {
    if (!confirm(`Delete skill "${name}"? This cannot be undone.`)) return;
    setDeleting(name);
    await fetch(`/api/skills/${encodeURIComponent(name)}`, { method: 'DELETE' });
    await fetchSkills();
    setDeleting(null);
  };

  const filtered = skills.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Workspace · Editor</p>
          <h1 className="text-2xl font-bold text-white tracking-tight">Skills Editor</h1>
        </div>
        <Link
          href="/editor/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          New Skill
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search skills..."
          className="w-full pl-10 pr-4 py-2.5 bg-surface-900 border border-surface-700 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-brand-500/50 transition-colors"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-500 mb-4">
            {search ? 'No skills match your search.' : 'No skills yet.'}
          </p>
          {!search && (
            <Link
              href="/editor/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              Create your first skill
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((skill) => (
            <div
              key={skill.name}
              className="group flex items-center gap-4 bg-surface-900 border border-surface-700/50 rounded-xl px-5 py-4 hover:border-surface-600 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-slate-200 truncate">{skill.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{skill.description}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  href={`/editor/${skill.name}`}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-700 transition-colors"
                  title="Edit"
                >
                  <Pencil size={14} />
                </Link>
                <button
                  onClick={() => handleDelete(skill.name)}
                  disabled={deleting === skill.name}
                  className="p-2 rounded-lg text-slate-400 hover:text-accent-red hover:bg-accent-red/10 transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <span className="text-[10px] text-slate-600 font-mono shrink-0">
                {timeAgo(skill.updated_at)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
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
