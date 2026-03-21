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

  const { data, error } = await supabase
    .from('skills')
    .update({
      description: body.description,
      parameters: body.parameters,
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
