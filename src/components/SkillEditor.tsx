'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { Save, Eye, Code, ArrowLeft, Loader2 } from 'lucide-react';
import type { Skill } from '@/lib/types';

interface SkillEditorProps {
  initialSkill?: Skill;
  isNew: boolean;
}

export default function SkillEditor({ initialSkill, isNew }: SkillEditorProps) {
  const router = useRouter();
  const [name, setName] = useState(initialSkill?.name || '');
  const [description, setDescription] = useState(initialSkill?.description || '');
  const parameters = initialSkill?.parameters || 'query: str';
  const [instructions, setInstructions] = useState(initialSkill?.instructions || '');
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = useCallback(async () => {
    setError('');

    if (!name.trim()) { setError('Skill name is required'); return; }
    if (!description.trim()) { setError('Description is required'); return; }
    if (!instructions.trim()) { setError('Instructions are required'); return; }

    // Validate snake_case
    if (!/^[a-z][a-z0-9_]*$/.test(name)) {
      setError('Name must be snake_case (lowercase letters, numbers, underscores)');
      return;
    }

    setSaving(true);

    try {
      const method = isNew ? 'POST' : 'PUT';
      const url = isNew ? '/api/skills' : `/api/skills/${encodeURIComponent(initialSkill!.name)}`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, instructions }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      router.push('/editor');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }, [name, description, instructions, isNew, initialSkill, router]);

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/editor')}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-800 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-0.5">
              Editor · {isNew ? 'New Skill' : name}
            </p>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {isNew ? 'Create New Skill' : 'Edit Skill'}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showPreview
                ? 'bg-brand-600/20 text-brand-400 border border-brand-500/20'
                : 'text-slate-400 hover:text-white hover:bg-surface-800'
            }`}
          >
            {showPreview ? <Code size={14} /> : <Eye size={14} />}
            {showPreview ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {isNew ? 'Publish to MCP' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-accent-red bg-accent-red/10 border border-accent-red/20 rounded-lg px-4 py-2.5 mb-4">
          {error}
        </div>
      )}

      <div className="flex gap-6">
        {/* Left: Metadata */}
        <div className="w-80 shrink-0 space-y-5">
          <div className="bg-surface-900 border border-surface-700/50 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Skill Metadata</h3>

            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Skill Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                placeholder="my_skill_name"
                disabled={!isNew}
                className="w-full px-3 py-2.5 bg-surface-850 border border-surface-700 rounded-lg text-white text-sm font-mono placeholder-slate-600 focus:outline-none focus:border-brand-500/50 transition-colors disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="One sentence describing what this skill does"
                rows={3}
                className="w-full px-3 py-2.5 bg-surface-850 border border-surface-700 rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-brand-500/50 transition-colors resize-none"
              />
            </div>

            <p className="text-[10px] text-slate-500 leading-relaxed">
              Tip: Use {'{placeholders}'} in your instructions (e.g. {'{topic}'}, {'{audience}'}) and they'll become input fields for the skill automatically.
            </p>
          </div>
        </div>

        {/* Right: Instructions editor / preview */}
        <div className="flex-1">
          <div className="bg-surface-900 border border-surface-700/50 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-surface-700/50">
              <span className="text-xs text-slate-500 font-mono">
                {name || 'skill_name'}.md
              </span>
              <span className="text-[10px] text-slate-600">
                {instructions.length} chars
              </span>
            </div>

            {showPreview ? (
              <div className="p-6 min-h-[500px] markdown-preview">
                <ReactMarkdown>{instructions || '*No instructions yet...*'}</ReactMarkdown>
              </div>
            ) : (
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder={`Write your skill instructions here...\n\nExample:\nYou are an expert at writing {tone} emails.\n\nThe user wants: {query}\n\nRules:\n- Keep it professional\n- Be concise\n- End with a clear call to action`}
                className="w-full min-h-[500px] p-6 bg-transparent text-slate-200 text-sm font-mono leading-relaxed placeholder-slate-700 focus:outline-none resize-none"
                spellCheck={false}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
