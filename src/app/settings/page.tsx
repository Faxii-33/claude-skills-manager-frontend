'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { Save, Loader2, Copy, Check, UserPlus } from 'lucide-react';
import type { Profile } from '@/lib/types';

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'user' | 'admin'>('user');
  const [addingUser, setAddingUser] = useState(false);
  const [addUserMsg, setAddUserMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const mcpUrl = process.env.NEXT_PUBLIC_MCP_SERVER_URL
    ? `${process.env.NEXT_PUBLIC_MCP_SERVER_URL}/mcp`
    : 'https://claude-skills-manager-production.up.railway.app/mcp';

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile(data as Profile);
        setDisplayName(data.display_name);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from('profiles')
      .update({ display_name: displayName })
      .eq('id', profile.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCopy = () => {
    const config = JSON.stringify({
      mcpServers: {
        'team-skills': {
          type: 'streamablehttp',
          url: mcpUrl,
        },
      },
    }, null, 2);
    navigator.clipboard.writeText(config);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddUser = async () => {
    if (!newUserEmail || !newUserName || !newUserPassword) return;
    setAddingUser(true);
    setAddUserMsg(null);

    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newUserEmail, displayName: newUserName, password: newUserPassword, role: newUserRole }),
      });
      const data = await res.json();

      if (!res.ok) {
        setAddUserMsg({ type: 'error', text: data.error || 'Failed to add user' });
      } else {
        setAddUserMsg({ type: 'success', text: `User ${newUserEmail} added successfully` });
        setNewUserEmail('');
        setNewUserName('');
        setNewUserPassword('');
        setNewUserRole('user');
      }
    } catch {
      setAddUserMsg({ type: 'error', text: 'Network error' });
    }
    setAddingUser(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <p className="text-xs text-slate-500 tracking-widest mb-1">Workspace <span className="text-slate-600">/</span> Settings</p>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
      </div>

      {/* Profile section */}
      <div className="bg-surface-900 border border-surface-700/50 rounded-xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-5">Profile</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Email</label>
            <input
              type="text"
              value={profile?.email || ''}
              disabled
              className="w-full px-3 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-slate-400 text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Role</label>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                  profile?.role === 'admin'
                    ? 'bg-accent-amber/10 text-accent-amber border border-accent-amber/20'
                    : 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                }`}
              >
                {profile?.role}
              </span>
              {profile?.role === 'user' && (
                <span className="text-xs text-slate-600">Contact an admin to change</span>
              )}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || displayName === profile?.display_name}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : saved ? (
              <Check size={14} />
            ) : (
              <Save size={14} />
            )}
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* MCP Connection section */}
      <div className="bg-surface-900 border border-surface-700/50 rounded-xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-2">MCP Connection</h3>
        <p className="text-xs text-slate-500 mb-4">
          Share this config with your team so they can connect Claude Desktop to your skills server.
        </p>

        <div className="relative">
          <pre className="bg-surface-950 border border-surface-700/50 rounded-lg p-4 text-xs text-slate-300 font-mono overflow-x-auto">
{JSON.stringify({
  mcpServers: {
    'team-skills': {
      type: 'streamablehttp',
      url: mcpUrl,
    },
  },
}, null, 2)}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-white text-xs transition-colors"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div className="mt-4 space-y-2 text-xs text-slate-500">
          <p><span className="text-slate-400 font-medium">1.</span> Open Claude Desktop → Settings → Developer → Edit Config</p>
          <p><span className="text-slate-400 font-medium">2.</span> Paste the config above and save</p>
          <p><span className="text-slate-400 font-medium">3.</span> Restart Claude Desktop</p>
        </div>
      </div>

      {/* Add User section (admin only) */}
      {profile?.role === 'admin' && (
        <div className="bg-surface-900 border border-surface-700/50 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <UserPlus size={16} className="text-slate-300" />
            <h3 className="text-sm font-semibold text-slate-300">Add User</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Create a new user account. They can sign in immediately with the email and password you set here.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Email</label>
              <input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="user@company.com"
                className="w-full px-3 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-brand-500/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Display Name</label>
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-3 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-brand-500/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Password</label>
              <input
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full px-3 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-brand-500/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Role</label>
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value as 'user' | 'admin')}
                className="w-full px-3 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-500/50 transition-colors"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {addUserMsg && (
              <div className={`text-sm px-4 py-2.5 rounded-lg border ${
                addUserMsg.type === 'success'
                  ? 'text-accent-green bg-accent-green/10 border-accent-green/20'
                  : 'text-accent-red bg-accent-red/10 border-accent-red/20'
              }`}>
                {addUserMsg.text}
              </div>
            )}

            <button
              onClick={handleAddUser}
              disabled={addingUser || !newUserEmail || !newUserName || !newUserPassword}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              {addingUser ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <UserPlus size={14} />
              )}
              Add User
            </button>
          </div>
        </div>
      )}

      {/* Danger zone */}
      <div className="bg-surface-900 border border-accent-red/20 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-accent-red mb-2">Danger Zone</h3>
        <p className="text-xs text-slate-500 mb-4">
          These actions are irreversible. Proceed with caution.
        </p>
        <button
          onClick={async () => {
            if (!confirm('Are you sure you want to sign out?')) return;
            const supabase = createClient();
            await supabase.auth.signOut();
            window.location.href = '/login';
          }}
          className="px-4 py-2 rounded-lg border border-accent-red/30 text-accent-red text-sm font-medium hover:bg-accent-red/10 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
