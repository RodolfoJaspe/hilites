export interface Team {
  id: number;
  name: string;
  short_name?: string;
  logo_url?: string;
}

export interface Match {
  id: string;
  external_id: string;
  competition_name: string;
  competition_id?: string;
  match_date: string;
  status: string;
  home_score?: number;
  away_score?: number;
  home_team: Team;
  away_team: Team;
}

export interface Highlight {
  id: string;
  title: string;
  description: string;
  youtube_url?: string;
  thumbnail_url?: string;
  channel_name: string;
  view_count?: number;
  duration_seconds?: number;
  relevance_score?: number;
  published_at: string;
  placeholder?: boolean;
  embedUrl?: string;
}

export interface DateOption {
  value: string;
  label: string;
  isToday?: boolean;
  isYesterday?: boolean;
}
