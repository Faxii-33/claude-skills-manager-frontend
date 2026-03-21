export interface Profile {
  id: string;
  display_name: string;
  email: string;
  role: 'admin' | 'user';
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  name: string;
  description: string;
  parameters: string;
  instructions: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface SkillStat extends Skill {
  created_by_name: string | null;
  total_invocations: number;
  weekly_invocations: number;
}

export interface SkillInvocation {
  id: number;
  skill_name: string;
  invoked_at: string;
  user_id: string | null;
}
