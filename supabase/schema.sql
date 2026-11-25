-- Ejecutar una vez en Supabase > SQL Editor.
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.room_members (
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

create table if not exists public.answers (
  room_id uuid not null,
  member_id uuid not null,
  day_n smallint not null check (day_n between 1 and 24),
  value jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (room_id, member_id, day_n),
  foreign key (room_id, member_id) references public.room_members(room_id, user_id) on delete cascade
);

alter table public.rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.answers enable row level security;

create or replace function public.is_room_member(p_room_id uuid)
returns boolean
language sql stable security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.room_members m
    where m.room_id = p_room_id and m.user_id = (select auth.uid())
  );
$$;

create or replace function public.is_room_owner(p_room_id uuid)
returns boolean
language sql stable security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.room_members m
    where m.room_id = p_room_id and m.user_id = (select auth.uid()) and m.role = 'owner'
  );
$$;

revoke all on function public.is_room_member(uuid) from public;
revoke all on function public.is_room_owner(uuid) from public;
grant execute on function public.is_room_member(uuid) to authenticated;
grant execute on function public.is_room_owner(uuid) to authenticated;

drop policy if exists "Room members can read their room" on public.rooms;
create policy "Room members can read their room" on public.rooms
  for select to authenticated using (public.is_room_member(id));
drop policy if exists "Only the owner can rename a room" on public.rooms;
create policy "Only the owner can rename a room" on public.rooms
  for update to authenticated using (public.is_room_owner(id)) with check (public.is_room_owner(id));

drop policy if exists "Members can see room membership" on public.room_members;
create policy "Members can see room membership" on public.room_members
  for select to authenticated using (public.is_room_member(room_id));

drop policy if exists "Members can read own answers and owners can read all" on public.answers;
create policy "Members can read own answers and owners can read all" on public.answers
  for select to authenticated
  using (public.is_room_member(room_id) and (member_id = (select auth.uid()) or public.is_room_owner(room_id)));
drop policy if exists "Members can add own answers" on public.answers;
create policy "Members can add own answers" on public.answers
  for insert to authenticated
  with check (member_id = (select auth.uid()) and public.is_room_member(room_id));
drop policy if exists "Members can update own answers" on public.answers;
create policy "Members can update own answers" on public.answers
  for update to authenticated
  using (member_id = (select auth.uid()) and public.is_room_member(room_id))
  with check (member_id = (select auth.uid()) and public.is_room_member(room_id));
drop policy if exists "Members can delete own answers" on public.answers;
create policy "Members can delete own answers" on public.answers
  for delete to authenticated
  using (member_id = (select auth.uid()) and public.is_room_member(room_id));

grant select, update on public.rooms to authenticated;
grant select on public.room_members to authenticated;
grant select, insert, update, delete on public.answers to authenticated;

create or replace function public.create_room(p_room_name text, p_display_name text)
returns table(room_id uuid, code text, room_name text, member_id uuid, role text)
language plpgsql security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_room_id uuid := gen_random_uuid();
  v_code text;
  v_name text := coalesce(nullif(trim(p_room_name), ''), 'La Vecindad');
begin
  if auth.uid() is null then raise exception 'Debe iniciar una sesión.'; end if;
  if nullif(trim(p_display_name), '') is null then raise exception 'Escriba su nombre.'; end if;
  loop
    v_code := upper(encode(extensions.gen_random_bytes(5), 'hex'));
    exit when not exists (select 1 from public.rooms r where r.code = v_code);
  end loop;
  insert into public.rooms(id, code, name, owner_id) values (v_room_id, v_code, v_name, auth.uid());
  insert into public.room_members(room_id, user_id, display_name, role)
    values (v_room_id, auth.uid(), trim(p_display_name), 'owner');
  return query select v_room_id, v_code, v_name, auth.uid(), 'owner'::text;
end;
$$;

create or replace function public.join_room(p_code text, p_display_name text)
returns table(room_id uuid, code text, room_name text, member_id uuid, role text)
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  v_room public.rooms%rowtype;
  v_role text;
begin
  if auth.uid() is null then raise exception 'Debe iniciar una sesión.'; end if;
  if nullif(trim(p_display_name), '') is null then raise exception 'Escriba su nombre.'; end if;
  select * into v_room from public.rooms r where r.code = upper(trim(p_code));
  if not found then raise exception 'No encontramos esa sala. Revise el código de invitación.'; end if;
  insert into public.room_members(room_id, user_id, display_name, role)
    values (v_room.id, auth.uid(), trim(p_display_name), case when v_room.owner_id = auth.uid() then 'owner' else 'member' end)
    on conflict (room_id, user_id) do update set display_name = excluded.display_name;
  select m.role into v_role from public.room_members m where m.room_id = v_room.id and m.user_id = auth.uid();
  return query select v_room.id, v_room.code, v_room.name, auth.uid(), v_role;
end;
$$;

revoke all on function public.create_room(text, text) from public;
revoke all on function public.join_room(text, text) from public;
grant execute on function public.create_room(text, text) to authenticated;
grant execute on function public.join_room(text, text) to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'answers'
  ) then
    execute 'alter publication supabase_realtime add table public.answers';
  end if;
end $$;
