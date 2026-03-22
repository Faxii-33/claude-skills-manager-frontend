'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Pencil, Users, Settings, Plus, LogOut, Terminal, BookOpen } from 'lucide-react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/editor', label: 'Editor', icon: Pencil },
  { href: '/team', label: 'Team', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/installation', label: 'Installation Guide', icon: BookOpen },
];

interface SidebarProps {
  userRole: 'admin' | 'user';
  displayName: string;
}

export default function Sidebar({ userRole, displayName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const filteredNav = navItems.filter((item) => {
    if (item.href === '/team' && userRole !== 'admin') return false;
    return true;
  });

  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] bg-surface-900 border-r border-surface-700/50 flex flex-col z-50">
      <div className="p-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <Terminal size={16} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100 tracking-tight">BSE Claude</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest">Skills Manager</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 pt-4 space-y-0.5">
        {filteredNav.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-brand-600/20 text-brand-400 border border-brand-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-800'
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-3">
        <Link
          href="/editor/new"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          New Skill
        </Link>
      </div>

      <div className="p-3 border-t border-surface-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-surface-700 flex items-center justify-center text-xs font-semibold text-slate-300 shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm text-slate-200 font-medium truncate">{displayName}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">{userRole}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-surface-800 transition-colors"
            title="Log out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}