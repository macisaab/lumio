-- Add favorites and view tracking to stories
alter table stories add column if not exists is_favorite boolean not null default false;
alter table stories add column if not exists view_count integer not null default 0;
alter table stories add column if not exists last_viewed_at timestamptz;

-- Index for efficient favorite and view queries
create index if not exists idx_stories_is_favorite on stories(child_id, is_favorite) where is_favorite = true;
create index if not exists idx_stories_view_count on stories(child_id, view_count desc);
create index if not exists idx_stories_last_viewed on stories(child_id, last_viewed_at desc nulls last);
