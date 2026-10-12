-- Melonitor account storage
-- Supabase SQL Editor에서 전체 내용을 한 번 실행하세요.

create table if not exists public.melonitor_user_searches (
  user_id uuid not null references auth.users(id) on delete cascade,
  artist_name text not null check (char_length(btrim(artist_name)) between 2 and 100),
  search_count bigint not null default 0 check (search_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, artist_name)
);

create table if not exists public.melonitor_favorite_artists (
  user_id uuid not null references auth.users(id) on delete cascade,
  artist_name text not null check (char_length(btrim(artist_name)) between 2 and 100),
  created_at timestamptz not null default now(),
  primary key (user_id, artist_name)
);

alter table public.melonitor_user_searches enable row level security;
alter table public.melonitor_favorite_artists enable row level security;

drop policy if exists "Users can read their own search counts" on public.melonitor_user_searches;
create policy "Users can read their own search counts"
on public.melonitor_user_searches for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own search counts" on public.melonitor_user_searches;
create policy "Users can insert their own search counts"
on public.melonitor_user_searches for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own search counts" on public.melonitor_user_searches;
create policy "Users can update their own search counts"
on public.melonitor_user_searches for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own search counts" on public.melonitor_user_searches;
create policy "Users can delete their own search counts"
on public.melonitor_user_searches for delete to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can read their own favorite artists" on public.melonitor_favorite_artists;
create policy "Users can read their own favorite artists"
on public.melonitor_favorite_artists for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own favorite artists" on public.melonitor_favorite_artists;
create policy "Users can insert their own favorite artists"
on public.melonitor_favorite_artists for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own favorite artists" on public.melonitor_favorite_artists;
create policy "Users can update their own favorite artists"
on public.melonitor_favorite_artists for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own favorite artists" on public.melonitor_favorite_artists;
create policy "Users can delete their own favorite artists"
on public.melonitor_favorite_artists for delete to authenticated
using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.melonitor_user_searches to authenticated;
grant select, insert, update, delete on public.melonitor_favorite_artists to authenticated;

create or replace function public.record_melonitor_search(
  p_artist_name text,
  p_count integer default 1
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_artist text := btrim(coalesce(p_artist_name, ''));
  v_count integer := greatest(1, least(coalesce(p_count, 1), 1000000));
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if char_length(v_artist) < 2 or char_length(v_artist) > 100 then
    raise exception 'Invalid artist name';
  end if;

  insert into public.melonitor_user_searches (user_id, artist_name, search_count, updated_at)
  values (v_user_id, v_artist, v_count, now())
  on conflict (user_id, artist_name)
  do update set
    search_count = public.melonitor_user_searches.search_count + excluded.search_count,
    updated_at = now();
end;
$$;

revoke all on function public.record_melonitor_search(text, integer) from public, anon;
grant execute on function public.record_melonitor_search(text, integer) to authenticated;


-- Required nickname profile, created only after the user's email is verified.
-- Nicknames accept 2-16 Korean/English letters, digits, and underscores.
create table if not exists public.melonitor_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null check (nickname ~ '^[가-힣A-Za-z0-9_]{2,16}$'),
  nickname_key text generated always as (lower(nickname)) stored unique,
  created_at timestamptz not null default now()
);

alter table public.melonitor_profiles enable row level security;

drop policy if exists "Users can read their own profile" on public.melonitor_profiles;
create policy "Users can read their own profile"
on public.melonitor_profiles for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own profile" on public.melonitor_profiles;
create policy "Users can insert their own profile"
on public.melonitor_profiles for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own profile" on public.melonitor_profiles;
create policy "Users can update their own profile"
on public.melonitor_profiles for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

grant select, insert, update on public.melonitor_profiles to authenticated;
