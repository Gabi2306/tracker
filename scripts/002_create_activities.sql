create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('food', 'transport')),
  name text not null,
  emissions numeric(10,4) not null default 0,
  details text,
  created_at timestamptz default now()
);

alter table public.activities enable row level security;

create policy "activities_select_own" on public.activities
  for select using (auth.uid() = user_id);

create policy "activities_insert_own" on public.activities
  for insert with check (auth.uid() = user_id);

create policy "activities_update_own" on public.activities
  for update using (auth.uid() = user_id);

create policy "activities_delete_own" on public.activities
  for delete using (auth.uid() = user_id);

-- Index for fast queries by user and date
create index if not exists idx_activities_user_created
  on public.activities (user_id, created_at desc);
