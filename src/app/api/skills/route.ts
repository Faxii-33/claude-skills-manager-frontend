import { createServerSupabase } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/skills — list all skills
export async function GET() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('name');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/skills — create a new skill
export async function POST(req: NextRequest) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, description, parameters, instructions } = body;

  if (!name || !description || !instructions) {
    return NextResponse.json({ error: 'name, description, and instructions are required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('skills')
    .upsert({
      name,
      description,
      parameters: parameters || 'query: str',
      instructions,
      created_by: user.id,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'name' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
