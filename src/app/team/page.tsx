'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { Shield, UserCheck, Pencil, ChevronDown } from 'lucide-react';
import type { Profile } from '@/lib/types';

export default function TeamPage() {
  const [members, setMembers] = useState<Profile[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [changingRole, setChangingRole] = useState<string | null>(null);

  const fetchData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at');

    const current = profiles?.find((p) => p.id === user.id) as Profile | undefined;
    setCurrentUser(current || null);
    setMembers((profiles as Profile[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
    setChangingRole(userId);
    await fetch('/api/team', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role: newRole }),
    });
    await fetchData();
    setChangingRole(null);
  };

  const isAdmin = currentUser?.role === 'admin';
  const adminCount = members.filter((m) => m.role === 'admin').length;
  const userCount = members.filter((m) => m.role === 'user').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs text-slate-500 tracking-widest mb-1">Workspace <span className="text-slate-600">/</span> Organization</p>
          <h1 className="text-2xl font-bold text-white tracking-tight">Team & Permissions</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage access levels and monitor activity across your workspace.
          </p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Members table */}
        <div className="flex-1">
          <div className="bg-surface-900 border border-surface-700/50 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-700/50">
              <h3 className="text-sm font-semibold text-slate-300">
                Active Members <span className="text-slate-500 font-normal ml-1">{members.length} Total</span>
              </h3>
            </div>

            {/* Header */}
            <div className="grid grid-cols-[1fr,120px,120px,60px] gap-4 px-5 py-3 border-b border-surface-700/30 text-[10px] text-slate-500 uppercase tracking-widest">
              <span>Name</span>
              <span>Role</span>
              <span>Joined</span>
              <span></span>
            </div>

            {/* Rows */}
            {members.map((member) => (
              <div
                key={member.id}
                className="grid grid-cols-[1fr,120px,120px,60px] gap-4 px-5 py-4 border-b border-surface-700/20 hover:bg-surface-850 transition-colors items-center"
              >
                {/* Name & email */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-surface-700 flex items-center justify-center text-xs font-semibold text-slate-300 shrink-0">
                    {member.display_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-200 font-medium truncate">
                      {member.display_name}
                      {member.id === currentUser?.id && (
                        <span className="text-[10px] text-slate-500 ml-1.5">(you)</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{member.email}</p>
                  </div>
                </div>

                {/* Role badge */}
                <div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                      member.role === 'admin'
                        ? 'bg-accent-amber/10 text-accent-amber border border-accent-amber/20'
                        : 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                    }`}
                  >
                    {member.role === 'admin' ? <Shield size={10} /> : <UserCheck size={10} />}
                    {member.role}
                  </span>
                </div>

                {/* Joined date */}
                <span className="text-xs text-slate-500">
                  {new Date(member.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>

                {/* Actions */}
                <div>
                  {isAdmin && member.id !== currentUser?.id && (
                    <div className="relative group">
                      <button
                        disabled={changingRole === member.id}
                        className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-surface-700 transition-colors disabled:opacity-50"
                        title="Change role"
                      >
                        <Pencil size={13} />
                      </button>
                      <div className="absolute right-0 top-full mt-1 w-32 bg-surface-800 border border-surface-600 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        <button
                          onClick={() => handleRoleChange(member.id, 'admin')}
                          disabled={member.role === 'admin'}
                          className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-surface-700 disabled:text-slate-600 rounded-t-lg transition-colors"
                        >
                          Make Admin
                        </button>
                        <button
                          onClick={() => handleRoleChange(member.id, 'user')}
                          disabled={member.role === 'user'}
                          className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-surface-700 disabled:text-slate-600 rounded-b-lg transition-colors"
                        >
                          Make User
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar stats */}
        <div className="w-64 shrink-0 space-y-4">
          <div className="bg-surface-900 border border-surface-700/50 rounded-xl p-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Role Distribution</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Admins</span>
                <span className="text-sm font-semibold text-accent-amber">{adminCount}</span>
              </div>
              <div className="w-full h-1.5 bg-surface-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-amber rounded-full transition-all"
                  style={{ width: `${members.length ? (adminCount / members.length) * 100 : 0}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Users</span>
                <span className="text-sm font-semibold text-brand-400">{userCount}</span>
              </div>
              <div className="w-full h-1.5 bg-surface-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all"
                  style={{ width: `${members.length ? (userCount / members.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {!isAdmin && (
            <div className="bg-surface-900 border border-surface-700/50 rounded-xl p-5">
              <p className="text-xs text-slate-500">
                You have <span className="text-slate-300 font-medium">user</span> access. Contact an admin to change permissions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
