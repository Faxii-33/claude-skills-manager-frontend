import { createServerSupabase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Total skills count
  const { count: totalSkills } = await supabase
    .from('skills')
    .select('*', { count: 'exact', head: true });

  // Weekly invocations
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { count: weeklyInvocations } = await supabase
    .from('skill_invocations')
    .select('*', { count: 'exact', head: true })
    .gte('invoked_at', weekAgo.toISOString());

  // Previous week for comparison
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const { count: prevWeekInvocations } = await supabase
    .from('skill_invocations')
    .select('*', { count: 'exact', head: true })
    .gte('invoked_at', twoWeeksAgo.toISOString())
    .lt('invoked_at', weekAgo.toISOString());

  // Team member count
  const { count: teamCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // Recent activity (last 10 skill updates)
  const { data: recentSkills } = await supabase
    .from('skills')
    .select('name, updated_at, created_by')
    .order('updated_at', { ascending: false })
    .limit(10);

  // Invocations per skill (top 5)
  const { data: topSkills } = await supabase
    .from('skill_invocations')
    .select('skill_name')
    .gte('invoked_at', weekAgo.toISOString());

  // Count invocations per skill
  const skillCounts: Record<string, number> = {};
  topSkills?.forEach((inv) => {
    skillCounts[inv.skill_name] = (skillCounts[inv.skill_name] || 0) + 1;
  });

  const topSkillsList = Object.entries(skillCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  return NextResponse.json({
    totalSkills: totalSkills || 0,
    weeklyInvocations: weeklyInvocations || 0,
    prevWeekInvocations: prevWeekInvocations || 0,
    teamCount: teamCount || 0,
    recentSkills: recentSkills || [],
    topSkills: topSkillsList,
  });
}
