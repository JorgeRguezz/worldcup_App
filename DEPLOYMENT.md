# Despliegue — Mundial App

## Estado actual

La web puede desplegarse como frontend Vite, pero todavia no esta lista para compartir con amigos como porra funcional completa.

Ahora mismo:

- El calendario y grupos del Mundial 2026 estan cargados como datos locales.
- Las clasificaciones se calculan en cliente desde esos datos locales.
- La autenticacion Supabase esta preparada.
- La base de datos Supabase esta definida en migraciones.
- La UI de ranking, predicciones y admin todavia no guarda ni lee datos reales de Supabase.

Antes de compartir la URL para uso real hay que conectar las pantallas a Supabase y completar las semillas oficiales.

## Paso 1 — Crear proyecto en Supabase

1. Entra en `https://supabase.com`.
2. Crea un proyecto nuevo.
3. Guarda estos datos:
   - Project URL.
   - anon public key.
   - database password.

## Paso 2 — Aplicar la migracion de base de datos

Opcion CLI:

```bash
supabase login
supabase link
supabase db push
```

Opcion manual:

1. Abre el SQL Editor de Supabase.
2. Copia el contenido de `supabase/migrations/001_initial_schema.sql`.
3. Ejecutalo.

## Paso 3 — Cargar datos iniciales

Hay que cargar:

- 48 equipos.
- 104 partidos oficiales.
- slots del cuadro.
- 495 combinaciones FIFA del Anexo C.

El repo solo incluye una fila de ejemplo para `EFGHIJKL`; no es suficiente para produccion.

## Paso 4 — Configurar autenticacion

En Supabase:

1. Activa Email/Password Auth.
2. Configura Site URL con la URL final de Vercel.
3. Anade Redirect URLs:
   - `https://tu-dominio.vercel.app/*`
   - `http://localhost:5173/*` para desarrollo local.

## Paso 5 — Crear administrador inicial

1. Registrate desde la app.
2. En Supabase SQL Editor, marca tu perfil como admin:

```sql
update public.profiles
set is_admin = true
where id = auth.uid();
```

Si lo haces desde SQL Editor, usa tu UUID real de `auth.users`:

```sql
update public.profiles
set is_admin = true
where id = 'TU_UUID';
```

## Paso 6 — Desplegar frontend en Vercel

1. Sube el repo a GitHub.
2. Entra en `https://vercel.com`.
3. Importa el repositorio.
4. Vercel deberia detectar Vite.
5. Build command: `npm run build`.
6. Output directory: `dist`.
7. Anade variables de entorno:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
8. Despliega.

## Paso 7 — Probar antes de compartir

1. Abre la URL final.
2. Registrate con un email real.
3. Comprueba que se crea el perfil.
4. Guarda una prediccion de un partido futuro.
5. Confirma que no se puede editar una prediccion bloqueada.
6. Entra como admin.
7. Carga un resultado.
8. Comprueba que ranking y puntos cambian.

## Bloqueadores antes de uso real

- Conectar `PredictionsPage` a Supabase.
- Conectar `RankingPage` a la vista `ranking`.
- Conectar `AdminPage` a escritura real de resultados.
- Crear seeds completos de equipos, partidos, slots y combinaciones FIFA.
- Probar RLS con al menos dos usuarios reales.
