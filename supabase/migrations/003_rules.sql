create table if not exists public.app_rules (
  id boolean primary key default true check (id),
  version integer not null default 1 check (version > 0),
  sections jsonb not null,
  updated_at timestamptz not null default now(),
  constraint single_app_rules_row check (id = true),
  constraint app_rules_sections_array check (jsonb_typeof(sections) = 'array')
);

create table if not exists public.rule_acknowledgements (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  rules_version integer not null check (rules_version > 0),
  accepted_at timestamptz not null default now()
);

alter table public.app_rules enable row level security;
alter table public.rule_acknowledgements enable row level security;

drop policy if exists "rules readable" on public.app_rules;
drop policy if exists "admins manage rules" on public.app_rules;
drop policy if exists "users read own rule acknowledgement" on public.rule_acknowledgements;
drop policy if exists "users insert own rule acknowledgement" on public.rule_acknowledgements;
drop policy if exists "users update own rule acknowledgement" on public.rule_acknowledgements;
drop policy if exists "admins read rule acknowledgements" on public.rule_acknowledgements;

create policy "rules readable" on public.app_rules for select to authenticated using (true);
create policy "admins manage rules" on public.app_rules for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "users read own rule acknowledgement" on public.rule_acknowledgements
for select to authenticated using (user_id = auth.uid() or public.is_admin());

create policy "users insert own rule acknowledgement" on public.rule_acknowledgements
for insert to authenticated with check (user_id = auth.uid() or public.is_admin());

create policy "users update own rule acknowledgement" on public.rule_acknowledgements
for update to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

create policy "admins read rule acknowledgements" on public.rule_acknowledgements
for select to authenticated using (public.is_admin());

notify pgrst, 'reload schema';
