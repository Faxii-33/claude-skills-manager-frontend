import { createServerSupabase } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/skills/[name]
export async function GET(req: NextRequest, { params }: { params: { name: string } }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('name', params.name)
    .single();

  if (error) return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
  return NextResponse.json(data);
}

// PUT /api/skills/[name]
export async function PUT(req: NextRequest, { params }: { params: { name: string } }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  // Auto-extract parameters from {placeholder} patterns in instructions
  const matches: string[] = body.instructions.match(/\{(\w+)\}/g)?.map((m: string) => m.slice(1, -1)) || [];
  const placeholders = matches.filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);
  const parameters = placeholders.length > 0
    ? placeholders.map((p: string) => `${p}: str`).join(', ')
    : 'query: str';

  const { data, error } = await supabase
    .from('skills')
    .update({
      description: body.description,
      parameters,
      instructions: body.instructions,
      updated_at: new Date().toISOString(),
    })
    .eq('name', params.name)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/skills/[name]
export async function DELETE(req: NextRequest, { params }: { params: { name: string } }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase
    .from('skills')
    .delete()
    .eq('name', params.name);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
