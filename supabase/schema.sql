-- ============================================================
--  PC DSA MENTOR — Supabase Schema
--  Paste this entire file into Supabase → SQL Editor → Run
-- ============================================================

-- 1. User profiles (auto-created on signup)
create table if not exists public.profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  full_name     text,
  username      text unique,
  avatar_url    text,
  bio           text,
  level_pref    text default 'Beginner' check (level_pref in ('Beginner','Intermediate','Advanced')),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- 2. Chat sessions (one per conversation)
create table if not exists public.sessions (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  title       text not null,
  topic       text,
  level       text default 'Beginner',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- 3. Individual messages inside each session
create table if not exists public.messages (
  id          uuid default gen_random_uuid() primary key,
  session_id  uuid references public.sessions(id) on delete cascade not null,
  user_id     uuid references auth.users(id) on delete cascade not null,
  role        text not null check (role in ('user','assistant')),
  content     text not null,
  created_at  timestamptz default now()
);

-- ── Row Level Security ─────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.sessions  enable row level security;
alter table public.messages  enable row level security;

-- profiles
create policy "select own profile" on public.profiles for select using (auth.uid() = id);
create policy "insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "update own profile" on public.profiles for update using (auth.uid() = id);

-- sessions
create policy "select own sessions" on public.sessions for select using (auth.uid() = user_id);
create policy "insert own sessions" on public.sessions for insert with check (auth.uid() = user_id);
create policy "update own sessions" on public.sessions for update using (auth.uid() = user_id);
create policy "delete own sessions" on public.sessions for delete using (auth.uid() = user_id);

-- messages
create policy "select own messages" on public.messages for select using (auth.uid() = user_id);
create policy "insert own messages" on public.messages for insert with check (auth.uid() = user_id);

-- ── Auto-create profile on signup ─────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
