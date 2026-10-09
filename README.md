# Fede Pádel Stats v4

Dashboard privado conectado directamente a Supabase.

## Configuración requerida en Supabase

1. Crear al menos un usuario en Authentication > Users.
2. Habilitar RLS en las tablas base.
3. Permitir SELECT solamente al rol authenticated.
4. Asegurar que `partidos_view` y `torneos_view` sean consultables por authenticated.
5. En Authentication > URL Configuration agregar la URL publicada de GitHub Pages en Site URL y Redirect URLs.

La publishable key incluida en `config.js` puede utilizarse en frontend. No incluir una secret key ni service_role.
