-- Email the portal owner (through the notify-owner Edge Function) when someone confirms a
-- new account, publishes a public passport or comments. Private drafts are never reported.
-- The function checks a shared secret kept in Vault under the name "notify_secret";
-- create it once in the SQL editor: select vault.create_secret('<random>', 'notify_secret');
-- A failed notification never blocks the change that caused it.

create extension if not exists pg_net with schema extensions;

create function public.lt_notify_owner(event jsonb) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  secret text;
begin
  select decrypted_secret into secret from vault.decrypted_secrets where name = 'notify_secret' limit 1;
  if secret is null then return; end if;
  perform net.http_post(
    url := 'https://ojrkjqzgusanpmxnjuxa.supabase.co/functions/v1/notify-owner',
    body := event,
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-notify-secret', secret)
  );
exception when others then
  raise warning 'lt_notify_owner: %', sqlerrm;
end;
$$;
revoke all on function public.lt_notify_owner(jsonb) from public, anon, authenticated;

create function public.lt_notify_signup() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.email_confirmed_at is not null and (tg_op = 'INSERT' or old.email_confirmed_at is null) then
    perform public.lt_notify_owner(jsonb_build_object('kind', 'signup',
      'name', coalesce(new.raw_user_meta_data->>'name', ''), 'email', coalesce(new.email, '')));
  end if;
  return new;
end;
$$;

create function public.lt_notify_published() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.status = 'published' and new.visibility = 'public'
    and (tg_op = 'INSERT' or not (old.status = 'published' and old.visibility = 'public')) then
    perform public.lt_notify_owner(jsonb_build_object('kind', 'published', 'id', new.id,
      'title', coalesce(new.data->>'title', ''), 'author', coalesce(new.data->>'author', '')));
  end if;
  return new;
end;
$$;

create function public.lt_notify_comment() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  perform public.lt_notify_owner(jsonb_build_object('kind', 'comment', 'passport', new.passport,
    'title', coalesce((select p.data->>'title' from public.lt_passports p where p.id = new.passport), ''),
    'name', new.name, 'message', new.message));
  return new;
end;
$$;

revoke all on function public.lt_notify_signup(), public.lt_notify_published(), public.lt_notify_comment()
  from public, anon, authenticated;

create trigger lt_notify_signup after insert or update of email_confirmed_at on auth.users
  for each row execute function public.lt_notify_signup();
create trigger lt_notify_published after insert or update of status, visibility on public.lt_passports
  for each row execute function public.lt_notify_published();
create trigger lt_notify_comment after insert on public.lt_comments
  for each row execute function public.lt_notify_comment();
