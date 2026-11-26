-- Run once in the Supabase SQL Editor for an existing project.
-- Adds the newly supplied drummer elf to random assignment, preserving uniqueness per room.

create or replace function public.create_room(p_room_name text,p_display_name text)
returns table(room_id uuid,code text,room_name text,member_id uuid,role text,character_id text)
language plpgsql security definer
set search_path=public,extensions,pg_temp
as $$
declare v_room_id uuid:=gen_random_uuid(); v_code text; v_name text:=coalesce(nullif(trim(p_room_name),''),'La Vecindad'); v_character_id text;
begin
  if auth.uid() is null then raise exception 'Debe iniciar una sesión.'; end if;
  if nullif(trim(p_display_name),'') is null then raise exception 'Escriba su nombre.'; end if;
  select c.id into v_character_id from (values
    ('01-tree-ornaments'),('02-elf-red'),('03-santa-red'),('04-reindeer-brown'),('05-gingerbread'),('06-bear-brown'),('07-snowman-scarf'),('08-penguin-red-scarf'),('09-elf-skirt'),('10-polar-bear'),('11-penguin-knit'),('12-tree-lights'),('13-gingerbread-house'),('14-reindeer-cocoa'),('15-candy-cane'),('16-elf-green'),('17-drummer-elf'),('18-santa-mrs'),('19-penguin-frame'),('20-elf-antlers'),('21-santa-sleigh'),('22-gift-elf'),('23-snowman-top-hat'),('24-gingerbread-dress'),('25-tree-face'),('26-reindeer-frame'),('27-grinch')
  ) c(id) order by random() limit 1;
  loop
    v_code:=upper(encode(extensions.gen_random_bytes(5),'hex'));
    exit when not exists(select 1 from public.rooms r where r.code=v_code);
  end loop;
  insert into public.rooms(id,code,name,owner_id) values(v_room_id,v_code,v_name,auth.uid());
  insert into public.room_members(room_id,user_id,display_name,role,character_id)
    values(v_room_id,auth.uid(),trim(p_display_name),'owner',v_character_id);
  return query select v_room_id,v_code,v_name,auth.uid(),'owner'::text,v_character_id;
end;
$$;

create or replace function public.join_room_random(p_code text,p_display_name text,p_face_data text)
returns table(room_id uuid,code text,room_name text,member_id uuid,role text,character_id text)
language plpgsql security definer
set search_path=public,pg_temp
as $$
declare v_room public.rooms%rowtype; v_role text; v_character_id text;
begin
  if auth.uid() is null then raise exception 'Debe iniciar una sesión.'; end if;
  if nullif(trim(p_display_name),'') is null then raise exception 'Escriba su nombre.'; end if;
  if p_face_data is null or length(p_face_data)>500000 then raise exception 'Suba una foto de cara válida.'; end if;
  select * into v_room from public.rooms r where r.code=upper(trim(p_code)) for update;
  if not found then raise exception 'No encontramos esa sala. Revise el código de invitación.'; end if;
  v_role:=case when v_room.owner_id=auth.uid() then 'owner' else 'member' end;
  select m.character_id into v_character_id from public.room_members m where m.room_id=v_room.id and m.user_id=auth.uid();
  if found then
    update public.room_members set display_name=trim(p_display_name),face_data=p_face_data where room_id=v_room.id and user_id=auth.uid();
  else
    select c.id into v_character_id from (values
      ('01-tree-ornaments'),('02-elf-red'),('03-santa-red'),('04-reindeer-brown'),('05-gingerbread'),('06-bear-brown'),('07-snowman-scarf'),('08-penguin-red-scarf'),('09-elf-skirt'),('10-polar-bear'),('11-penguin-knit'),('12-tree-lights'),('13-gingerbread-house'),('14-reindeer-cocoa'),('15-candy-cane'),('16-elf-green'),('17-drummer-elf'),('18-santa-mrs'),('19-penguin-frame'),('20-elf-antlers'),('21-santa-sleigh'),('22-gift-elf'),('23-snowman-top-hat'),('24-gingerbread-dress'),('25-tree-face'),('26-reindeer-frame'),('27-grinch')
    ) c(id) where not exists(select 1 from public.room_members m where m.room_id=v_room.id and m.character_id=c.id) order by random() limit 1;
    if v_character_id is null then raise exception 'La vecindad ya ocupó todos los personajes.'; end if;
    insert into public.room_members(room_id,user_id,display_name,role,character_id,face_data)
      values(v_room.id,auth.uid(),trim(p_display_name),v_role,v_character_id,p_face_data);
  end if;
  return query select v_room.id,v_room.code,v_room.name,auth.uid(),v_role,v_character_id;
end;
$$;

revoke all on function public.create_room(text,text) from public;
revoke all on function public.join_room_random(text,text,text) from public;
grant execute on function public.create_room(text,text) to authenticated;
grant execute on function public.join_room_random(text,text,text) to authenticated;
