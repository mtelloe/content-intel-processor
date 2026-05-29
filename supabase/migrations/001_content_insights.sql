create table public.content_insights (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz default now() not null,
  whatsapp_message_id text unique not null,
  input_type          text not null check (input_type in ('video_url', 'image', 'carousel')),
  source_url          text,
  source_platform     text,
  transcript          text,
  summary             text not null default '',
  strategies          jsonb not null default '[]'::jsonb,
  content_type        text check (content_type in ('herramienta', 'estrategia', 'tutorial', 'inspiración')),
  tags                text[] not null default '{}',
  apply_to            text[] not null default '{}',
  skool_draft         text not null default '',
  social_draft        text not null default '',
  status              text not null default 'processed' check (status in ('processed', 'error')),
  error_message       text
);

alter table public.content_insights enable row level security;
