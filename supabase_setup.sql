-- Run this once in Supabase: Project > SQL Editor > New query > paste > Run

create table if not exists portal_data (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table portal_data enable row level security;

-- Demo/internal-tool policy: allow the anon key to read and write.
-- (App-level login is handled inside the React app itself, not by
-- Supabase auth, so the anon key needs access to this table.)
create policy "Allow anon read" on portal_data
  for select using (true);

create policy "Allow anon write" on portal_data
  for insert with check (true);

create policy "Allow anon update" on portal_data
  for update using (true);
