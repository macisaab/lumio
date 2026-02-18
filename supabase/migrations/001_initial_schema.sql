-- Lumio Database Schema
-- Run this migration to set up all required tables

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Children table
create table if not exists children (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  age integer not null check (age between 1 and 4),
  favorite_color text not null,
  favorite_color_hex text not null,
  interests text[] default '{}',
  created_at timestamptz default now() not null
);

-- Stories table
create table if not exists stories (
  id uuid primary key default uuid_generate_v4(),
  child_id uuid references children(id) on delete cascade not null,
  title text not null,
  paragraphs jsonb not null default '[]',
  tap_moments jsonb not null default '[]',
  audio_url text,
  redirect_history jsonb not null default '[]',
  created_at timestamptz default now() not null,
  completed_at timestamptz
);

-- Prizes table
create table if not exists prizes (
  id uuid primary key default uuid_generate_v4(),
  child_id uuid references children(id) on delete cascade not null,
  story_id uuid references stories(id) on delete cascade not null,
  sticker_type text not null,
  sticker_emoji text not null,
  earned_at timestamptz default now() not null
);

-- Milestones table
create table if not exists milestones (
  id uuid primary key default uuid_generate_v4(),
  child_id uuid references children(id) on delete cascade not null,
  milestone_type text not null,
  earned_at timestamptz default now() not null,
  unique (child_id, milestone_type)
);

-- Indexes
create index if not exists idx_children_user_id on children(user_id);
create index if not exists idx_stories_child_id on stories(child_id);
create index if not exists idx_stories_created_at on stories(created_at desc);
create index if not exists idx_prizes_child_id on prizes(child_id);
create index if not exists idx_milestones_child_id on milestones(child_id);

-- Row Level Security
alter table children enable row level security;
alter table stories enable row level security;
alter table prizes enable row level security;
alter table milestones enable row level security;

-- Children: users can only access their own children
create policy "Users can view own children"
  on children for select
  using (auth.uid() = user_id);

create policy "Users can insert own children"
  on children for insert
  with check (auth.uid() = user_id);

create policy "Users can update own children"
  on children for update
  using (auth.uid() = user_id);

create policy "Users can delete own children"
  on children for delete
  using (auth.uid() = user_id);

-- Stories: users can access stories for their children
create policy "Users can view stories for own children"
  on stories for select
  using (child_id in (select id from children where user_id = auth.uid()));

create policy "Users can insert stories for own children"
  on stories for insert
  with check (child_id in (select id from children where user_id = auth.uid()));

create policy "Users can update stories for own children"
  on stories for update
  using (child_id in (select id from children where user_id = auth.uid()));

-- Prizes: users can access prizes for their children
create policy "Users can view prizes for own children"
  on prizes for select
  using (child_id in (select id from children where user_id = auth.uid()));

create policy "Users can insert prizes for own children"
  on prizes for insert
  with check (child_id in (select id from children where user_id = auth.uid()));

-- Milestones: users can access milestones for their children
create policy "Users can view milestones for own children"
  on milestones for select
  using (child_id in (select id from children where user_id = auth.uid()));

create policy "Users can insert milestones for own children"
  on milestones for insert
  with check (child_id in (select id from children where user_id = auth.uid()));
