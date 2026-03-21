import { createServerSupabase } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/team — list all team members
export async function GET() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// PUT /api/team — update a member's role (admin only)
export async function PUT(req: NextRequest) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check if requester is admin
  const { data: requester } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (requester?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const body = await req.json();
  const { userId, role } = body;

  if (!userId || !role || !['admin', 'user'].includes(role)) {
    return NextResponse.json({ error: 'Valid userId and role required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/team — invite a new member (admin only, creates Supabase user)
export async function POST(req: NextRequest) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: requester } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (requester?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const body = await req.json();
  const { email, displayName, role } = body;

  if (!email || !displayName) {
    return NextResponse.json({ error: 'email and displayName are required' }, { status: 400 });
  }

  // Note: Creating users via client-side Supabase requires the service_role key.
  // For MVP, admin creates users manually in Supabase dashboard,
  // or we use Supabase's invite function.
  // This endpoint just pre-creates the profile so when the user logs in, their role is set.

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: crypto.randomUUID(), // placeholder — will be replaced on first login
      email,
      display_name: displayName,
      role: role || 'user',
    }, { onConflict: 'id' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
