-- MyPet Diary — Supabase schema (v2, sync-ready)
-- Run this in the Supabase SQL editor. Safe to re-run (drops & recreates the
-- data tables). Profiles + the new-user trigger are preserved.
--
-- Notes for cloud sync:
--  * Primary keys are TEXT (the app generates string ids like "pet_ab12").
--  * date/time columns are TEXT (exact ISO round-trip with the client).
--  * pet_id has NO foreign key on purpose — the app keeps records locally even
--    after a pet is removed, so an FK would break sync upserts. RLS by user_id
--    still fully isolates each user's data.

-- ─────────────────────────────────────────────────────────────
-- Profiles (1:1 with auth.users)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

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
-- Data tables (drop & recreate)
-- ─────────────────────────────────────────────────────────────
drop table if exists public.pets cascade;
drop table if exists public.care_items cascade;
drop table if exists public.weights cascade;
drop table if exists public.meals cascade;
drop table if exists public.walks cascade;
drop table if exists public.medications cascade;
drop table if exists public.supplements cascade;
drop table if exists public.hospitals cascade;
drop table if exists public.reptile_envs cascade;
drop table if exists public.symptoms cascade;
drop table if exists public.treats cascade;
drop table if exists public.photos cascade;
drop table if exists public.point_transactions cascade;

create table public.pets (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  species text not null,
  breed text,
  birth_date text,
  adoption_date text,
  gender text,
  weight numeric,
  photo_url text,
  character_url text,
  character_template text,
  notes text,
  care_template text[] not null default '{}',
  created_at text
);

create table public.care_items (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_id text,
  type text not null,
  title text not null,
  scheduled_at text not null,
  completed boolean not null default false,
  completed_at text,
  recurrence jsonb,
  metadata jsonb
);

create table public.weights (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_id text,
  weight numeric not null,
  recorded_at text not null,
  note text
);

create table public.meals (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_id text,
  recorded_at text not null,
  food_name text,
  amount text,
  note text
);

create table public.walks (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_id text,
  started_at text not null,
  duration_minutes numeric not null default 0,
  had_bowel_movement boolean,
  weather text,
  note text,
  path jsonb,
  distance_meters numeric
);

create table public.medications (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_id text,
  name text not null,
  dosage text,
  start_date text not null,
  end_date text,
  recurrence jsonb not null,
  purpose text
);

create table public.supplements (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_id text,
  name text not null,
  recurrence jsonb not null,
  remaining_count numeric,
  alert_threshold numeric
);

create table public.hospitals (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_id text,
  visit_date text not null,
  hospital_name text not null,
  hospital_contact text,
  purpose text not null,
  diagnosis text,
  treatment text,
  cost numeric,
  next_visit_date text,
  attachments text[]
);

create table public.reptile_envs (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_id text,
  recorded_at text not null,
  humidity numeric,
  temperature numeric,
  shedding_status text,
  note text
);

create table public.symptoms (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_id text,
  recorded_at text not null,
  kinds text[] not null default '{}',
  severity text,
  note text
);

create table public.treats (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_id text,
  recorded_at text not null,
  name text,
  amount text,
  note text
);

create table public.photos (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_id text,
  photo_url text not null,
  taken_at text not null,
  caption text
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
    'symptoms','treats','photos'
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

create index if not exists idx_care_items_pet on public.care_items (pet_id);
create index if not exists idx_weights_pet on public.weights (pet_id);
create index if not exists idx_walks_pet on public.walks (pet_id);
create index if not exists idx_photos_pet on public.photos (pet_id);
