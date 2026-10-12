-- Melonitor account storage. Safe to re-run in Supabase SQL Editor.

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

create or replace function public.melonitor_nickname_is_allowed(p_nickname text)
returns boolean
language plpgsql
immutable
parallel safe
as $$
declare
  v_nickname text := btrim(coalesce(p_nickname, ''));
  v_separator_free text;
  v_leet_like text;
  v_blocked_pattern text := '(씨+이*발+|시+이*발+|씨+팔+|시+팔+|씨벌|시벌|씨불|시불|씹새끼|개새끼|새끼|좆|좇|존나|존내|병신|븅신|빙신|지랄|염병|개년|개놈|미친년|미친놈|느금마|니애미|애미뒤|애비뒤|보지|자지|성폭행|강간|야동|포르노|따먹|후장|딸딸이|섹스|창녀|걸레|맘충|한남충|한녀충|짱깨|쪽바리|fuck|fuk|shit|bitch|bastard|motherfucker|asshole|jackass|dumbass|dick|pussy|cunt|slut|whore|porn|hentai|blowjob|handjob|masturbat|dildo|nigger|nigga|faggot|dyke|chink|kike|spic|tranny|retard|pedo|pedophile|heilhitler|whitepower|whitepride|kkk)';
  v_reserved_pattern text := '^(admin|administrator|moderator|staff|support|developer|official|운영자|관리자|개발자|고객센터|공식|melonitor|멜로니터)$|^(melonitor|멜로니터)(admin|administrator|moderator|staff|support|developer|official|운영자|관리자|개발자|공식)$|^(admin|administrator|moderator|staff|support|developer|official|운영자|관리자|개발자|공식)(melonitor|멜로니터)$|^(official|공식)(nmixx|rescene|yena|엔믹스|리센느|예나|최예나)$|^(nmixx|rescene|yena|엔믹스|리센느|예나|최예나)(official|공식)$';
begin
  if v_nickname !~ '^[가-힣A-Za-z0-9_]{2,16}$' then
    return false;
  end if;

  -- Variant 1 strips separators and digits between a blocked expression.
  v_separator_free := regexp_replace(lower(v_nickname), '[_0-9]+', '', 'g');
  v_separator_free := regexp_replace(v_separator_free, '(.)\1+', '\1', 'g');

  -- Variant 2 matches common leetspeak digits, such as 4 for a.
  v_leet_like := translate(lower(v_nickname), '0134578', 'oieastb');
  v_leet_like := regexp_replace(v_leet_like, '_+', '', 'g');
  v_leet_like := regexp_replace(v_leet_like, '(.)\1+', '\1', 'g');

  if v_separator_free ~ v_blocked_pattern or v_leet_like ~ v_blocked_pattern then
    return false;
  end if;
  if v_separator_free ~ v_reserved_pattern or v_leet_like ~ v_reserved_pattern then
    return false;
  end if;

  if v_nickname !~ '[A-Za-z가-힣]'
     and char_length(regexp_replace(v_nickname, '[^0-9]', '', 'g')) >= 8 then
    return false;
  end if;

  return true;
end;
$$;

revoke all on function public.melonitor_nickname_is_allowed(text) from public, anon;
grant execute on function public.melonitor_nickname_is_allowed(text) to authenticated;

create table if not exists public.melonitor_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null check (nickname ~ '^[가-힣A-Za-z0-9_]{2,16}$'),
  created_at timestamptz not null default now(),
  constraint melonitor_profiles_nickname_moderation_check
    check (public.melonitor_nickname_is_allowed(nickname))
);

create unique index if not exists melonitor_profiles_nickname_case_insensitive_unique
  on public.melonitor_profiles (lower(btrim(nickname)));

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
