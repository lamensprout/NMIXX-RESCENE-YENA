create table if not exists public.melonitor_rank_alert_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  enabled boolean not null default false,
  threshold integer not null default 1 check (threshold between 1 and 100),
  notify_rises boolean not null default true,
  notify_falls boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint melonitor_rank_alert_direction_check check (notify_rises or notify_falls)
);
create table if not exists public.melonitor_rank_alert_notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  artist_name text not null,
  song_title text not null,
  old_rank integer not null check (old_rank between 1 and 100),
  new_rank integer not null check (new_rank between 1 and 100),
  rank_change integer not null check (rank_change between -99 and 99 and rank_change <> 0),
  baseline_hour timestamptz not null,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  constraint melonitor_rank_alert_notification_unique unique
    (user_id, artist_name, song_title, baseline_hour, rank_change)
);
alter table public.melonitor_rank_alert_settings enable row level security;
alter table public.melonitor_rank_alert_notifications enable row level security;
create policy "Users manage own rank alert settings" on public.melonitor_rank_alert_settings
for all to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy "Users read own rank alert notifications" on public.melonitor_rank_alert_notifications
for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users mark own rank alert notifications read" on public.melonitor_rank_alert_notifications
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
grant select, insert, update, delete on public.melonitor_rank_alert_settings to authenticated;
grant select, update on public.melonitor_rank_alert_notifications to authenticated;
grant usage, select on sequence public.melonitor_rank_alert_notifications_id_seq to authenticated;
