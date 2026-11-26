-- Let people remove what they put on the portal:
--   * the owner deletes a passport with its versions, relations, comments and files;
--   * the owner deletes a single attachment;
--   * a comment is deleted by its author or by the owner of the passport;
--   * a user deletes their account together with everything they own.
-- Storage objects cannot be removed from SQL, so the client removes them through the
-- Storage API first (lt_remove_object below allows it) and then calls these functions.

create policy lt_remove_object on storage.objects for delete to authenticated
  using (bucket_id = 'lt-passport-files' and exists (
    select 1 from public.lt_files f join public.lt_passports p on p.id = f.passport
    where storage.objects.name = p.id::text || '/' || f.id::text and p.owner = (select auth.uid())
  ));

grant delete on table public.lt_comments to authenticated;
create policy lt_remove_comment on public.lt_comments for delete to authenticated
  using (author = (select auth.uid()) or exists (
    select 1 from public.lt_passports p where p.id = passport and p.owner = (select auth.uid())));

create function public.lt_delete_passport(passport_id uuid) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not exists (select 1 from public.lt_passports where id = passport_id and owner = auth.uid()) then
    raise exception 'forbidden';
  end if;
  delete from public.lt_relations where source = passport_id or target = passport_id;
  delete from public.lt_comments where passport = passport_id;
  delete from public.lt_files where passport = passport_id;
  delete from public.lt_versions where passport = passport_id;
  delete from public.lt_passports where id = passport_id;
end;
$$;

create function public.lt_delete_file(passport_id uuid, file_id uuid) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not exists (select 1 from public.lt_passports where id = passport_id and owner = auth.uid()) then
    raise exception 'forbidden';
  end if;
  delete from public.lt_files where id = file_id and passport = passport_id;
end;
$$;

create function public.lt_delete_account() returns void
language plpgsql security definer set search_path = ''
as $$
declare
  account uuid := auth.uid();
  owned uuid;
begin
  if account is null then raise exception 'signIn'; end if;
  for owned in select id from public.lt_passports where owner = account loop
    perform public.lt_delete_passport(owned);
  end loop;
  delete from public.lt_comments where author = account;
  delete from auth.users where id = account;
end;
$$;

revoke all on function public.lt_delete_passport(uuid), public.lt_delete_file(uuid, uuid), public.lt_delete_account()
  from public, anon, authenticated;
grant execute on function public.lt_delete_passport(uuid), public.lt_delete_file(uuid, uuid), public.lt_delete_account()
  to authenticated;
