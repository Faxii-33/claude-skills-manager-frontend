'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, PenTool, Users, Settings, Plus, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase-browser';
import { Profile } from '@/lib/types';

interface SidebarProps {
  profile: Profile | null;
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/editor', label: 'Editor', icon: PenTool },
  { href: '/team', label: 'Team', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] bg-surface-800 border-r border-border flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-blue to-accent-cyan flex items-center justify-center">
            <span className="text-white font-bold text-sm">SK</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-text-primary leading-tight">Skills Manager</div>
            <div className="text-[10px] text-text-muted uppercase tracking-wider">Team Workspace</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const isAdminOnly = item.href === '/team';

          if (isAdminOnly && profile?.role !== 'admin') return null;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-accent-blue/15 text-accent-blue font-medium'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-700'
              }`}
            >
              <item.icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* New Skill Button */}
      <div className="px-3 pb-3">
        <Link
          href="/editor?new=true"
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-accent-blue text-white text-sm font-medium hover:bg-accent-blue/90 transition-colors"
        >
          <Plus size={16} />
          New Skill
        </Link>
      </div>

      {/* User */}
      <div className="px-3 pb-4 border-t border-border pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-surface-500 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-text-secondary">
                {profile?.display_name?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-sm text-text-primary truncate">{profile?.display_name || 'User'}</div>
              <div className="text-[10px] text-text-muted capitalize">{profile?.role || 'user'}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-text-muted hover:text-text-primary transition-colors"
            title="Log out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
