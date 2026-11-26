begin;

create table public.lt_passports (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users (id),
  status text not null check (status in ('draft', 'published')),
  visibility text not null check (visibility in ('private', 'public')),
  version integer not null default 1,
  updated timestamptz not null default now(),
  data jsonb not null
);

create table public.lt_versions (
  passport uuid not null references public.lt_passports (id),
  version integer not null,
  status text not null,
  visibility text not null,
  updated timestamptz not null,
  data jsonb not null,
  primary key (passport, version)
);

create table public.lt_relations (
  source uuid not null references public.lt_passports (id),
  target uuid not null references public.lt_passports (id),
  type text not null check (type in ('part', 'contains', 'uses', 'function', 'derived', 'inherits', 'compatible')),
  note text not null,
  primary key (source, target, type),
  check (source <> target)
);

create table public.lt_comments (
  id uuid primary key default gen_random_uuid(),
  passport uuid not null references public.lt_passports (id),
  name text not null default left(coalesce(nullif(auth.jwt()->'user_metadata'->>'name', ''), 'Living Things'), 120),
  message text not null check (length(btrim(message)) between 1 and 4000),
  created timestamptz not null default now()
);

create table public.lt_files (
  id uuid primary key default gen_random_uuid(),
  passport uuid not null references public.lt_passports (id),
  name text not null check (length(name) between 1 and 200),
  category text not null check (category in ('cad', 'drawing', 'calculation', 'energy', 'system', 'data', 'protocol', 'image', 'other')),
  revision text not null check (length(revision) <= 100),
  size bigint not null check (size between 1 and 52428800),
  preview text check (preview in ('image/png', 'image/jpeg', 'image/webp')),
  created timestamptz not null default now(),
  ready boolean not null default false
);

create index lt_passport_owner on public.lt_passports (owner, updated desc);
create index lt_relation_target on public.lt_relations (target);
create index lt_comment_passport on public.lt_comments (passport, created);
create index lt_file_passport on public.lt_files (passport, created);

alter table public.lt_passports enable row level security;
alter table public.lt_versions enable row level security;
alter table public.lt_relations enable row level security;
alter table public.lt_comments enable row level security;
alter table public.lt_files enable row level security;

revoke all on table public.lt_passports, public.lt_versions, public.lt_relations,
  public.lt_comments, public.lt_files from anon, authenticated, public;
grant select on table public.lt_passports, public.lt_versions, public.lt_relations,
  public.lt_comments, public.lt_files to anon, authenticated;
grant insert (passport, message) on table public.lt_comments to authenticated;

create policy lt_read_passports on public.lt_passports for select to anon, authenticated
  using (owner = (select auth.uid()) or (status = 'published' and visibility = 'public'));
create policy lt_read_versions on public.lt_versions for select to anon, authenticated
  using (exists (select 1 from public.lt_passports p where p.id = passport
    and (p.owner = (select auth.uid()) or (lt_versions.status = 'published' and lt_versions.visibility = 'public'))));
create policy lt_read_relations on public.lt_relations for select to anon, authenticated
  using (exists (select 1 from public.lt_passports p where p.id = source)
     and exists (select 1 from public.lt_passports p where p.id = target));
create policy lt_read_comments on public.lt_comments for select to anon, authenticated
  using (exists (select 1 from public.lt_passports p where p.id = passport));
create policy lt_add_comments on public.lt_comments for insert to authenticated
  with check (exists (select 1 from public.lt_passports p where p.id = passport));
create policy lt_read_files on public.lt_files for select to anon, authenticated
  using (exists (select 1 from public.lt_passports p where p.id = passport
    and (ready or p.owner = (select auth.uid()))));

insert into storage.buckets (id, name, public, file_size_limit)
values ('lt-passport-files', 'lt-passport-files', false, 52428800);

create policy lt_upload_object on storage.objects for insert to authenticated
  with check (bucket_id = 'lt-passport-files' and exists (
    select 1 from public.lt_files f join public.lt_passports p on p.id = f.passport
    where storage.objects.name = p.id::text || '/' || f.id::text
      and not f.ready and p.owner = (select auth.uid())
  ));
create policy lt_read_object on storage.objects for select to anon, authenticated
  using (bucket_id = 'lt-passport-files' and exists (
    select 1 from public.lt_files f join public.lt_passports p on p.id = f.passport
    where storage.objects.name = p.id::text || '/' || f.id::text
      and (f.ready or p.owner = (select auth.uid()))
  ));
create policy lt_cancel_object on storage.objects for delete to authenticated
  using (bucket_id = 'lt-passport-files' and exists (
    select 1 from public.lt_files f join public.lt_passports p on p.id = f.passport
    where storage.objects.name = p.id::text || '/' || f.id::text
      and not f.ready and p.owner = (select auth.uid())
  ));

create function public.lt_save_passport(payload jsonb) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  account uuid := auth.uid();
  passport_id uuid := nullif(payload->>'id', '')::uuid;
  current_version integer;
  current_status text := payload->>'status';
  current_visibility text := payload->>'visibility';
  body jsonb := payload - array['id', 'version', 'status', 'visibility', 'owner', 'editable', 'updated', 'relations'];
  targets jsonb := coalesce(payload->'relations', '[]'::jsonb);
  claims jsonb := coalesce(payload->'claims', '[]'::jsonb);
  links jsonb := coalesce(payload->'links', '[]'::jsonb);
  relation jsonb;
  target_id uuid;
  item jsonb;
  changed_at timestamptz := now();
begin
  if account is null then raise exception 'signIn'; end if;
  if nullif(btrim(coalesce(body->>'title', '')), '') is null then raise exception 'titleRequired'; end if;
  if length(body->>'title') > 200 or pg_column_size(body) > 4194304
    or current_status is null or current_status not in ('draft', 'published')
    or current_visibility is null or current_visibility not in ('private', 'public')
    or jsonb_typeof(payload->'domains') is distinct from 'array'
    or jsonb_typeof(payload->'details') is distinct from 'object'
    or jsonb_typeof(targets) is distinct from 'array' or jsonb_array_length(targets) > 50
    or jsonb_typeof(claims) is distinct from 'array' or jsonb_array_length(claims) > 20
    or jsonb_typeof(links) is distinct from 'array' or jsonb_array_length(links) > 30 then
    raise exception 'invalid';
  end if;
  if jsonb_array_length(body->'domains') > 6
    or exists (select 1 from jsonb_array_elements_text(body->'domains') as d(area)
      where area is null or area not in ('buildings','transport','aviation','infrastructure','robotics','other'))
    or exists (select 1 from jsonb_each(body->'details') as d(area, value)
      where not (body->'domains' ? area) or jsonb_typeof(value) is distinct from 'object')
    or exists (select 1 from jsonb_array_elements(claims) as c(value)
      where jsonb_typeof(value) is distinct from 'object'
        or coalesce(value->>'property', '') not in ('','preservation','regulation','diagnosis','adaptation','recovery','inheritance')
        or coalesce(value->>'evidence', '') not in ('','author','simulation','experiment','operation')) then
    raise exception 'invalid';
  end if;
  for item in select value from jsonb_array_elements(links) loop
    if coalesce(item->>'url', '') !~* '^https?://[^[:space:]]+$' or length(item->>'url') > 2000 then
      raise exception 'invalidLink';
    end if;
  end loop;
  if current_status = 'published' then
    if coalesce(btrim(body->>'description'), '') = '' or coalesce(btrim(body->>'author'), '') = ''
      or coalesce(body->>'type', '') not in ('hardware', 'material', 'software', 'hybrid')
      or coalesce(body->>'level', '') not in ('whole', 'system', 'assembly', 'component')
      or coalesce(body->>'stage', '') not in ('concept', 'simulation', 'experiment', 'operation')
      or jsonb_array_length(body->'domains') = 0 then raise exception 'publicationFields'; end if;
    if jsonb_array_length(claims) = 0 then raise exception 'publicationClaims'; end if;
    for item in select value from jsonb_array_elements(claims) loop
      if coalesce(item->>'property', '') not in ('preservation','regulation','diagnosis','adaptation','recovery','inheritance')
        or coalesce(item->>'evidence', '') not in ('author','simulation','experiment','operation')
        or coalesce(btrim(item->>'mechanism'), '') = '' or coalesce(btrim(item->>'effect'), '') = ''
        or coalesce(btrim(item->>'limits'), '') = ''
        or (body->>'stage' <> 'concept' and coalesce(btrim(item->>'feedback'), '') = '')
        or (item->>'evidence' <> 'author' and coalesce(btrim(item->>'proof'), '') = '')
        or (body->>'level' <> 'whole' and coalesce(btrim(item->>'role'), '') = '') then
        raise exception 'publicationClaims';
      end if;
    end loop;
  end if;

  if passport_id is null then
    insert into public.lt_passports (owner, status, visibility, data, updated)
    values (account, current_status, current_visibility, body, changed_at)
    returning id, version into passport_id, current_version;
  else
    select version into current_version from public.lt_passports where id = passport_id and owner = account for update;
    if not found then raise exception 'forbidden'; end if;
    if current_version is distinct from (payload->>'version')::integer then raise exception 'stale'; end if;
    current_version := current_version + 1;
    update public.lt_passports set status = current_status, visibility = current_visibility,
      data = body, version = current_version, updated = changed_at where id = passport_id;
  end if;

  delete from public.lt_relations where source = passport_id;
  for relation in select value from jsonb_array_elements(targets) loop
    if coalesce(relation->>'target', '') !~* '^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$'
      or coalesce(relation->>'type', '') not in ('part','contains','uses','function','derived','inherits','compatible') then
      raise exception 'invalidRelation';
    end if;
    target_id := (relation->>'target')::uuid;
    if target_id = passport_id or not exists (select 1 from public.lt_passports p
      where p.id = target_id and (p.owner = account or (p.status = 'published' and p.visibility = 'public'))) then
      raise exception 'invalidRelation';
    end if;
    insert into public.lt_relations (source, target, type, note)
    values (passport_id, target_id, relation->>'type', left(coalesce(relation->>'note', ''), 2000));
  end loop;

  insert into public.lt_versions (passport, version, status, visibility, updated, data)
  values (passport_id, current_version, current_status, current_visibility, changed_at, body);
  return passport_id;
exception when unique_violation then
  raise exception 'invalidRelation';
end;
$$;

create function public.lt_begin_file(passport_id uuid, filename text, file_category text, file_revision text, byte_count bigint, preview_type text)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare file_id uuid;
begin
  perform 1 from public.lt_passports where id = passport_id and owner = auth.uid() for update;
  if not found then raise exception 'forbidden'; end if;
  if byte_count is null or byte_count not between 1 and 52428800 then raise exception 'fileInvalid'; end if;
  if (select coalesce(sum(size), 0) + byte_count > 262144000 or count(*) >= 100
      from public.lt_files where passport = passport_id) then
    raise exception 'fileQuota';
  end if;
  insert into public.lt_files (passport, name, category, revision, size, preview)
  values (passport_id, left(btrim(filename), 200), file_category, left(btrim(file_revision), 100), byte_count, preview_type)
  returning id into file_id;
  return file_id;
end;
$$;

create function public.lt_finish_file(passport_id uuid, file_id uuid)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if not exists (select 1 from public.lt_passports where id = passport_id and owner = auth.uid()) then
    raise exception 'forbidden';
  end if;
  update public.lt_files f set ready = true where f.id = file_id and f.passport = passport_id and exists (
    select 1 from storage.objects o where o.bucket_id = 'lt-passport-files'
      and o.name = passport_id::text || '/' || file_id::text
      and o.metadata->>'size' = f.size::text
      and (f.preview is null or o.metadata->>'mimetype' = f.preview)
  );
  if not found then raise exception 'fileInvalid'; end if;
end;
$$;

create function public.lt_cancel_file(passport_id uuid, file_id uuid)
returns void language sql security definer set search_path = ''
as $$
  delete from public.lt_files f where f.id = file_id and f.passport = passport_id and not f.ready
    and exists (select 1 from public.lt_passports p where p.id = passport_id and p.owner = auth.uid())
    and not exists (select 1 from storage.objects o where o.bucket_id = 'lt-passport-files'
      and o.name = passport_id::text || '/' || file_id::text);
$$;

revoke all on function public.lt_save_passport(jsonb),
  public.lt_begin_file(uuid, text, text, text, bigint, text),
  public.lt_finish_file(uuid, uuid), public.lt_cancel_file(uuid, uuid) from public, anon, authenticated;
grant execute on function public.lt_save_passport(jsonb),
  public.lt_begin_file(uuid, text, text, text, bigint, text),
  public.lt_finish_file(uuid, uuid), public.lt_cancel_file(uuid, uuid) to authenticated;

commit;
