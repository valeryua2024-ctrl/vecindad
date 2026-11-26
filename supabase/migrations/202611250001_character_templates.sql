-- Run once in Supabase SQL Editor after the original schema.sql.
alter table public.room_members
  add column if not exists character_id text,
  add column if not exists face_data text;

do $$
begin
  if exists (
    select 1 from public.room_members group by room_id having count(*) > 26
  ) then
    raise exception 'A room has more than 26 members; add more unique character templates before migrating.';
  end if;
end $$;

with available(id, ord) as (values
  ('01-tree-ornaments',1),('02-elf-red',2),('03-santa-red',3),('04-reindeer-brown',4),('05-gingerbread',5),('06-bear-brown',6),('07-snowman-scarf',7),('08-penguin-red-scarf',8),('09-elf-skirt',9),('10-polar-bear',10),('11-penguin-knit',11),('12-tree-lights',12),('13-gingerbread-house',13),('14-reindeer-cocoa',14),('15-candy-cane',15),('16-elf-green',16),('18-santa-mrs',17),('19-penguin-frame',18),('20-elf-antlers',19),('21-santa-sleigh',20),('22-gift-elf',21),('23-snowman-top-hat',22),('24-gingerbread-dress',23),('25-tree-face',24),('26-reindeer-frame',25),('27-grinch',26)
), ranked as (
  select m.room_id,m.user_id,row_number() over(partition by m.room_id order by (m.role='owner') desc,m.joined_at,m.user_id) as n
  from public.room_members m where m.character_id is null
)
update public.room_members m set character_id=a.id
from ranked r join available a on a.ord=r.n
where m.room_id=r.room_id and m.user_id=r.user_id;

alter table public.room_members alter column character_id set not null;
create unique index if not exists room_members_unique_character_per_room on public.room_members(room_id,character_id);

drop function if exists public.create_room(text,text);
create function public.create_room(p_room_name text, p_display_name text)
returns table(room_id uuid, code text, room_name text, member_id uuid, role text, character_id text)
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
  insert into public.room_members(room_id,user_id,display_name,role,character_id)
    values(v_room_id,auth.uid(),trim(p_display_name),'owner','01-tree-ornaments');
  return query select v_room_id,v_code,v_name,auth.uid(),'owner'::text,'01-tree-ornaments'::text;
end;
$$;

create or replace function public.available_characters(p_code text)
returns table(character_id text)
language plpgsql stable security definer
set search_path = public, pg_temp
as $$
declare v_room_id uuid;
begin
  if auth.uid() is null then raise exception 'Debe iniciar una sesión.'; end if;
  select r.id into v_room_id from public.rooms r where r.code=upper(trim(p_code));
  if v_room_id is null then raise exception 'No encontramos esa sala. Revise el código de invitación.'; end if;
  return query
  select choices.id from (values
    ('01-tree-ornaments'),('02-elf-red'),('03-santa-red'),('04-reindeer-brown'),('05-gingerbread'),('06-bear-brown'),('07-snowman-scarf'),('08-penguin-red-scarf'),('09-elf-skirt'),('10-polar-bear'),('11-penguin-knit'),('12-tree-lights'),('13-gingerbread-house'),('14-reindeer-cocoa'),('15-candy-cane'),('16-elf-green'),('18-santa-mrs'),('19-penguin-frame'),('20-elf-antlers'),('21-santa-sleigh'),('22-gift-elf'),('23-snowman-top-hat'),('24-gingerbread-dress'),('25-tree-face'),('26-reindeer-frame'),('27-grinch')
  ) choices(id)
  where not exists(select 1 from public.room_members m where m.room_id=v_room_id and m.character_id=choices.id and m.user_id<>(select auth.uid()));
end;
$$;

create or replace function public.select_room_character(p_room_id uuid,p_character_id text,p_face_data text)
returns void
language plpgsql security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then raise exception 'Debe iniciar una sesión.'; end if;
  if p_face_data is null or length(p_face_data)>500000 then raise exception 'Suba una foto de cara válida.'; end if;
  update public.room_members m set character_id=p_character_id,face_data=p_face_data
  where m.user_id=auth.uid() and m.room_id=p_room_id
    and p_character_id in ('01-tree-ornaments','02-elf-red','03-santa-red','04-reindeer-brown','05-gingerbread','06-bear-brown','07-snowman-scarf','08-penguin-red-scarf','09-elf-skirt','10-polar-bear','11-penguin-knit','12-tree-lights','13-gingerbread-house','14-reindeer-cocoa','15-candy-cane','16-elf-green','18-santa-mrs','19-penguin-frame','20-elf-antlers','21-santa-sleigh','22-gift-elf','23-snowman-top-hat','24-gingerbread-dress','25-tree-face','26-reindeer-frame','27-grinch');
  if not found then raise exception 'Ese personaje ya lo escogió otra vecina, o no pertenece a su sala.'; end if;
exception when unique_violation then
  raise exception 'Ese personaje ya lo escogió otra vecina. Elija otro.';
end;
$$;

create or replace function public.join_room_with_character(p_code text,p_display_name text,p_character_id text,p_face_data text)
returns table(room_id uuid,code text,room_name text,member_id uuid,role text,character_id text)
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare v_room public.rooms%rowtype; v_role text;
begin
  if auth.uid() is null then raise exception 'Debe iniciar una sesión.'; end if;
  if nullif(trim(p_display_name),'') is null then raise exception 'Escriba su nombre.'; end if;
  if p_face_data is null or length(p_face_data)>500000 then raise exception 'Suba una foto de cara válida.'; end if;
  select * into v_room from public.rooms r where r.code=upper(trim(p_code));
  if not found then raise exception 'No encontramos esa sala. Revise el código de invitación.'; end if;
  if p_character_id not in ('01-tree-ornaments','02-elf-red','03-santa-red','04-reindeer-brown','05-gingerbread','06-bear-brown','07-snowman-scarf','08-penguin-red-scarf','09-elf-skirt','10-polar-bear','11-penguin-knit','12-tree-lights','13-gingerbread-house','14-reindeer-cocoa','15-candy-cane','16-elf-green','18-santa-mrs','19-penguin-frame','20-elf-antlers','21-santa-sleigh','22-gift-elf','23-snowman-top-hat','24-gingerbread-dress','25-tree-face','26-reindeer-frame','27-grinch') then
    raise exception 'Ese personaje no está disponible.';
  end if;
  v_role:=case when v_room.owner_id=auth.uid() then 'owner' else 'member' end;
  begin
    insert into public.room_members(room_id,user_id,display_name,role,character_id,face_data)
    values(v_room.id,auth.uid(),trim(p_display_name),v_role,p_character_id,p_face_data)
    on conflict(room_id,user_id) do update set display_name=excluded.display_name,character_id=excluded.character_id,face_data=excluded.face_data;
  exception when unique_violation then
    raise exception 'Ese personaje ya lo escogió otra vecina. Elija otro.';
  end;
  return query select v_room.id,v_room.code,v_room.name,auth.uid(),v_role,p_character_id;
end;
$$;

revoke all on function public.available_characters(text) from public;
revoke all on function public.select_room_character(uuid,text,text) from public;
revoke all on function public.join_room_with_character(text,text,text,text) from public;
grant execute on function public.available_characters(text) to authenticated;
grant execute on function public.select_room_character(uuid,text,text) to authenticated;
grant execute on function public.join_room_with_character(text,text,text,text) to authenticated;
grant select on public.room_members to authenticated;

do $$ begin
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='room_members') then
    execute 'alter publication supabase_realtime add table public.room_members';
  end if;
end $$;

