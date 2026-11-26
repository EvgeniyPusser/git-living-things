-- Record which account wrote each comment. The display name comes from user metadata,
-- which the user can change, so it cannot identify the author for moderation.
-- Clients may insert only (passport, message), so the default cannot be overridden.
alter table public.lt_comments
  add column author uuid references auth.users (id) default auth.uid();

create index lt_comment_author on public.lt_comments (author);
