-- Private client dashboard (/dashboard) — run once in the Supabase SQL editor.
--
-- One row per client engagement: checklist ticks, Opportunity Matrix rows and
-- ROI calculator inputs. Row-level security limits every row to the account
-- that created it, so the public anon key in the browser can read nothing
-- without a signed-in session, and a second account would only ever see its
-- own (empty) list.
--
-- After running this:
--   1. Authentication → Users → Add user: create your login (email + password,
--      tick "Auto Confirm User").
--   2. Authentication → Sign In / Providers → turn OFF "Allow new users to sign up",
--      so nobody else can create an account.
--   3. Project Settings → API: copy the Project URL and the anon / publishable
--      key into Vercel as NEXT_PUBLIC_SUPABASE_URL and
--      NEXT_PUBLIC_SUPABASE_ANON_KEY, then redeploy.

create table if not exists public.engagements (
  id          uuid primary key default gen_random_uuid(),
  owner       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  client      text not null check (char_length(client) between 1 and 200),
  project     text not null default '' check (char_length(project) <= 200),
  checks      jsonb not null default '{}'::jsonb,
  opps        jsonb not null default '[]'::jsonb,
  roi         jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists engagements_owner_idx on public.engagements (owner, created_at);

alter table public.engagements enable row level security;

drop policy if exists "Owner reads own engagements" on public.engagements;
drop policy if exists "Owner creates own engagements" on public.engagements;
drop policy if exists "Owner updates own engagements" on public.engagements;
drop policy if exists "Owner deletes own engagements" on public.engagements;

create policy "Owner reads own engagements" on public.engagements
  for select to authenticated using (owner = auth.uid());

create policy "Owner creates own engagements" on public.engagements
  for insert to authenticated with check (owner = auth.uid());

create policy "Owner updates own engagements" on public.engagements
  for update to authenticated using (owner = auth.uid()) with check (owner = auth.uid());

create policy "Owner deletes own engagements" on public.engagements
  for delete to authenticated using (owner = auth.uid());

-- Keep updated_at honest without trusting the browser's clock.
-- Empty search_path, per Supabase's security advisor for functions.
create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists engagements_touch on public.engagements;
create trigger engagements_touch before update on public.engagements
  for each row execute function public.touch_updated_at();

-- ── Redesigned desk (2026-11-22) ─────────────────────────────────────
-- Safe to re-run. Adds timeline tasks and meetings to each engagement,
-- per-account desk settings, and a private bucket for uploaded wallpapers.

alter table public.engagements
  add column if not exists tasks  jsonb not null default '[]'::jsonb,
  add column if not exists events jsonb not null default '[]'::jsonb;

create table if not exists public.desk_settings (
  owner       uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.desk_settings enable row level security;

drop policy if exists "Owner reads own desk settings" on public.desk_settings;
drop policy if exists "Owner creates own desk settings" on public.desk_settings;
drop policy if exists "Owner updates own desk settings" on public.desk_settings;

create policy "Owner reads own desk settings" on public.desk_settings
  for select to authenticated using (owner = (select auth.uid()));
create policy "Owner creates own desk settings" on public.desk_settings
  for insert to authenticated with check (owner = (select auth.uid()));
create policy "Owner updates own desk settings" on public.desk_settings
  for update to authenticated using (owner = (select auth.uid())) with check (owner = (select auth.uid()));

drop trigger if exists desk_settings_touch on public.desk_settings;
create trigger desk_settings_touch before update on public.desk_settings
  for each row execute function public.touch_updated_at();

-- Private bucket; each account only reads and writes its own folder (<uid>/...).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('desk-wallpapers', 'desk-wallpapers', false, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

drop policy if exists "Owner reads own wallpapers" on storage.objects;
drop policy if exists "Owner uploads own wallpapers" on storage.objects;
drop policy if exists "Owner deletes own wallpapers" on storage.objects;

create policy "Owner reads own wallpapers" on storage.objects
  for select to authenticated
  using (bucket_id = 'desk-wallpapers' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Owner uploads own wallpapers" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'desk-wallpapers' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Owner deletes own wallpapers" on storage.objects
  for delete to authenticated
  using (bucket_id = 'desk-wallpapers' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- ---------------------------------------------------------------------------
-- Desk content key (2026-11-23)
--
-- The playbook text and app code ship encrypted inside public/dashboard/index.html
-- (this repo is public). The page fetches this key after sign-in and decrypts in
-- the browser. Read-only for the owner; set or rotate it from the SQL editor.
-- The key value itself is never committed here.
-- ---------------------------------------------------------------------------

create table if not exists public.desk_keys (
  owner uuid primary key references auth.users (id) on delete cascade,
  content_key text not null,
  updated_at timestamptz not null default now()
);

alter table public.desk_keys enable row level security;

drop policy if exists "desk_keys: owner reads" on public.desk_keys;
create policy "desk_keys: owner reads" on public.desk_keys
  for select to authenticated using (owner = (select auth.uid()));

revoke insert, update, delete on public.desk_keys from anon, authenticated;
