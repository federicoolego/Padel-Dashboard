-- Aplicar los GRANT sobre las vistas usadas por el dashboard
revoke all on public.partidos_view from anon;
revoke all on public.torneos_view from anon;
grant select on public.partidos_view to authenticated;
grant select on public.torneos_view to authenticated;

-- IMPORTANTE: las políticas RLS deben configurarse en las tablas base de las vistas.
-- Ejemplo para una tabla base `partidos`:
-- alter table public.partidos enable row level security;
-- create policy "authenticated can read partidos" on public.partidos for select to authenticated using (true);
-- Repetir para las tablas base que alimentan ambas vistas.
