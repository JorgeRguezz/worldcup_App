create table if not exists public.app_rules (
  id boolean primary key default true check (id),
  version integer not null default 1 check (version > 0),
  sections jsonb not null,
  updated_at timestamptz not null default now(),
  constraint single_app_rules_row check (id = true),
  constraint app_rules_sections_array check (jsonb_typeof(sections) = 'array')
);

alter table public.app_rules enable row level security;

drop policy if exists "rules readable" on public.app_rules;
drop policy if exists "admins manage rules" on public.app_rules;

create policy "rules readable" on public.app_rules for select to authenticated using (true);
create policy "admins manage rules" on public.app_rules for all to authenticated using (public.is_admin()) with check (public.is_admin());

notify pgrst, 'reload schema';
