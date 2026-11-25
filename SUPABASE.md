# Activar salas compartidas

La app conserva el modo de prototipo local cuando no encuentra variables de Supabase. Para que distintas personas compartan respuestas:

1. Cree un proyecto en Supabase y abra **SQL Editor**.
2. Pegue y ejecute el contenido de `supabase/schema.sql`.
3. En **Authentication > Sign In / Providers**, active **Anonymous Sign-Ins**.
4. En Vercel, abra **Settings > Environment Variables** y agregue:
   - `NEXT_PUBLIC_SUPABASE_URL`: la URL del proyecto.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: la clave pública `anon`/publishable del proyecto.
5. Aplique las variables a Production y haga un nuevo deployment.

No agregue una `service_role` key al navegador ni al prefijo `NEXT_PUBLIC_`. La base tiene políticas RLS: cada vecina solo puede leer sus propias respuestas y la dueña de la sala puede leer todas. La dueña comparte el enlace que aparece en Ajustes; el código también puede escribirse manualmente.

Las sesiones anónimas se guardan en el navegador. Si alguien borra los datos del sitio o cambia de dispositivo, debe volver a entrar con el código y el nombre.
