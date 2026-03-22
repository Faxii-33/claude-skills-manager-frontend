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
  const { name, description, instructions } = body;

  if (!name || !description || !instructions) {
    return NextResponse.json({ error: 'name, description, and instructions are required' }, { status: 400 });
  }

  // Auto-extract parameters from {placeholder} patterns in instructions
  const placeholders = [...new Set(instructions.match(/\{(\w+)\}/g)?.map((m: string) => m.slice(1, -1)) || [])];
  const parameters = placeholders.length > 0
    ? placeholders.map((p: string) => `${p}: str`).join(', ')
    : 'query: str';

  const { data, error } = await supabase
    .from('skills')
    .upsert({
      name,
      description,
      parameters,
      instructions,
      created_by: user.id,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'name' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
