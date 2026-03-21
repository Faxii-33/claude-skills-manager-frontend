import { createServerSupabase } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
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
  const { email, displayName, password, role } = body;

  if (!email || !displayName || !password) {
    return NextResponse.json({ error: 'email, displayName, and password are required' }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  // Use service role client to create auth user
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRole) {
    return NextResponse.json({ error: 'Server misconfigured: missing service role key' }, { status: 500 });
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRole,
  );

  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 400 });
  }

  // Create profile for the new user
  const { data, error } = await adminClient
    .from('profiles')
    .upsert({
      id: newUser.user.id,
      email,
      display_name: displayName,
      role: role || 'user',
    }, { onConflict: 'id' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
