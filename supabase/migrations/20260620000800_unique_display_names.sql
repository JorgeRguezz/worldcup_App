update public.profiles
set display_name = regexp_replace(trim(display_name), '[[:space:]]+', ' ', 'g')
where display_name <> regexp_replace(trim(display_name), '[[:space:]]+', ' ', 'g');

update public.profiles
set display_name = 'Usuario ' || substr(id::text, 1, 6)
where length(trim(display_name)) < 2;

with duplicates as (
  select
    id,
    row_number() over (partition by lower(trim(display_name)) order by created_at asc, id asc) as duplicate_position
  from public.profiles
)
update public.profiles p
set display_name = left(trim(p.display_name), 17) || ' ' || substr(p.id::text, 1, 6)
from duplicates d
where p.id = d.id
  and d.duplicate_position > 1;

create unique index if not exists profiles_display_name_unique_ci
on public.profiles (lower(trim(display_name)));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_display_name text;
begin
  requested_display_name := regexp_replace(
    trim(coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), split_part(coalesce(new.email, ''), '@', 1), 'Usuario')),
    '[[:space:]]+',
    ' ',
    'g'
  );

  if length(requested_display_name) < 2 then
    requested_display_name := 'Usuario ' || substr(new.id::text, 1, 6);
  end if;

  insert into public.profiles (id, display_name)
  values (new.id, requested_display_name);

  return new;
end;
$$;
