-- MyPet Diary — Supabase schema
-- Run this in the Supabase SQL editor (or `supabase db push`).
-- Mirrors the client data model (src/types/index.ts). Every row is owned by a
-- user (auth.users.id); Row-Level Security ensures users only see their own data.

-- ─────────────────────────────────────────────────────────────
-- Profiles (1:1 with auth.users)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row when a user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'nickname'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- Pets
-- ─────────────────────────────────────────────────────────────
create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  species text not null,
  breed text,
  birth_date date,
  adoption_date date,
  gender text,
  weight numeric,
  photo_url text,
  character_url text,
  character_template text,
  notes text,
  care_template text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Care checklist items
-- ─────────────────────────────────────────────────────────────
create table if not exists public.care_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  type text not null,
  title text not null,
  scheduled_at timestamptz not null,
  completed boolean not null default false,
  completed_at timestamptz,
  recurrence jsonb,
  metadata jsonb
);

-- ─────────────────────────────────────────────────────────────
-- Records
-- ─────────────────────────────────────────────────────────────
create table if not exists public.weights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  weight numeric not null,
  recorded_at timestamptz not null,
  note text
);

create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  recorded_at timestamptz not null,
  food_name text,
  amount text,
  note text
);

create table if not exists public.walks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  started_at timestamptz not null,
  duration_minutes integer not null default 0,
  had_bowel_movement boolean,
  weather text,
  note text,
  path jsonb,
  distance_meters numeric
);

create table if not exists public.medications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  name text not null,
  dosage text,
  start_date timestamptz not null,
  end_date timestamptz,
  recurrence jsonb not null,
  purpose text
);

create table if not exists public.supplements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  name text not null,
  recurrence jsonb not null,
  remaining_count integer,
  alert_threshold integer
);

create table if not exists public.hospitals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  visit_date timestamptz not null,
  hospital_name text not null,
  hospital_contact text,
  purpose text not null,
  diagnosis text,
  treatment text,
  cost numeric,
  next_visit_date timestamptz,
  attachments text[]
);

create table if not exists public.reptile_envs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  recorded_at timestamptz not null,
  humidity numeric,
  temperature numeric,
  shedding_status text,
  note text
);

-- ─────────────────────────────────────────────────────────────
-- Points & streaks
-- ─────────────────────────────────────────────────────────────
create table if not exists public.point_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.streaks (
  pet_id uuid primary key references public.pets (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  current_days integer not null default 0,
  best_days integer not null default 0,
  last_check_date date
);

-- ─────────────────────────────────────────────────────────────
-- Row-Level Security: each user only touches their own rows.
-- ─────────────────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','pets','care_items','weights','meals','walks',
    'medications','supplements','hospitals','reptile_envs',
    'point_transactions','streaks'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "own_rows" on public.%I;', t);
    if t = 'profiles' then
      execute 'create policy "own_rows" on public.profiles
        using (auth.uid() = id) with check (auth.uid() = id);';
    else
      execute format('create policy "own_rows" on public.%I
        using (auth.uid() = user_id) with check (auth.uid() = user_id);', t);
    end if;
  end loop;
end $$;

-- Helpful indexes for per-pet queries.
create index if not exists idx_care_items_pet on public.care_items (pet_id);
create index if not exists idx_weights_pet on public.weights (pet_id);
create index if not exists idx_meals_pet on public.meals (pet_id);
create index if not exists idx_walks_pet on public.walks (pet_id);
