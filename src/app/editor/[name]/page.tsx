'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import SkillEditor from '@/components/SkillEditor';
import type { Skill } from '@/lib/types';

export default function EditSkillPage() {
  const params = useParams();
  const skillName = decodeURIComponent(params.name as string);
  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchSkill = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('name', skillName)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setSkill(data as Skill);
      }
      setLoading(false);
    };
    fetchSkill();
  }, [skillName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400 text-lg mb-2">Skill not found</p>
        <p className="text-slate-600 text-sm">"{skillName}" doesn't exist.</p>
      </div>
    );
  }

  return <SkillEditor initialSkill={skill!} isNew={false} />;
}
