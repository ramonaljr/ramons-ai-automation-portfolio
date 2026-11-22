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
