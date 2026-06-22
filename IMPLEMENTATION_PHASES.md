# Fases de implementación — Mundial App V1

> Basado en `PRD.md` y `WORLD_CUP_ENGINE.md`.
> Objetivo: construir una V1 privada, fiable y testeable para predicciones del Mundial 2026 usando React + Vite + TypeScript + Supabase.

---

## Principios de ejecución

- La fuente de verdad del torneo son los resultados oficiales introducidos por el administrador.
- No existe cuadro personal por usuario: el cuadro oficial se calcula una sola vez desde resultados reales.
- La seguridad de escritura y bloqueo vive en Supabase, no solo en React.
- El motor reglamentario debe estar testeado antes de conectarlo a pantallas críticas.
- Cada fase debe terminar con una app o módulo demostrable, aunque sea con datos semilla.

---

## Fase 0 — Base del proyecto

### Objetivo

Crear la base técnica mínima para poder desarrollar con TypeScript estricto, React, Supabase y pruebas.

### Alcance

- Crear proyecto React + Vite + TypeScript.
- Configurar rutas base con React Router.
- Configurar cliente de Supabase con variables públicas `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
- Crear `.env.example` sin secretos.
- Añadir scripts de desarrollo, build, lint y test.
- Definir estructura inicial:
  - `src/app`
  - `src/components`
  - `src/features`
  - `src/lib`
  - `src/domain`
  - `supabase/migrations`
  - `supabase/seed`

### Entregables

- App arranca localmente.
- TypeScript en modo estricto.
- Variables de entorno documentadas.
- Página inicial temporal conectada al router.

### Criterios de aceptación

- `npm run build` pasa.
- `npm test` o script equivalente ejecuta sin fallos.
- No hay secretos reales en el repositorio.

---

## Fase 1 — Modelo de datos, migraciones y RLS

### Objetivo

Construir el esquema de Supabase que soporta usuarios, torneo, predicciones, resultados oficiales, ranking y auditoría.

### Alcance

- Crear migraciones para:
  - `profiles`
  - `teams`
  - `matches`
  - `match_slots`
  - `group_team_stats`
  - `third_place_combinations`
  - `predictions`
  - `special_predictions`
  - `official_awards`
  - `admin_audit_log`
- Crear enums o checks para etapas, estados, lados, tipos de slot y modo de decisión.
- Crear trigger de perfil al registrar usuario en Supabase Auth.
- Implementar bloqueo de predicciones en base de datos usando `now() < matches.kickoff_at`.
- Implementar restricciones de integridad:
  - marcador no negativo;
  - máximo razonable de predicciones;
  - `winner_team_id` válido;
  - penaltis coherentes;
  - `predicted_advancing_team_id` válido;
  - `UNIQUE(user_id, match_id)`.
- Implementar políticas RLS mínimas del PRD.

### Entregables

- Migraciones versionadas.
- Políticas RLS activas.
- Funciones/triggers SQL para proteger escritura de predicciones.
- Documentación breve de cómo crear el primer administrador.

### Criterios de aceptación

- Usuario normal solo lee/escribe sus propias predicciones antes del kickoff.
- Usuario normal no puede modificar predicciones bloqueadas aunque llame directo a Supabase.
- Admin puede escribir resultados oficiales.
- Tabla `third_place_combinations` no queda editable por usuarios normales.

---

## Fase 2 — Semillas oficiales del torneo

### Objetivo

Sembrar datos oficiales suficientes para que el motor trabaje con 104 partidos, 48 equipos, slots del cuadro y las 495 combinaciones FIFA.

### Alcance

- Sembrar 48 equipos con:
  - grupo A-L;
  - posición de sorteo;
  - código FIFA;
  - orden de ranking FIFA de respaldo.
- Sembrar los 104 partidos oficiales:
  - M1-M72 fase de grupos;
  - M73-M88 dieciseisavos;
  - M89-M96 octavos;
  - M97-M100 cuartos;
  - M101-M102 semifinales;
  - M103 tercer puesto;
  - M104 final.
- Sembrar `match_slots`:
  - equipos fijos en grupos;
  - posiciones de grupo para M73-M88;
  - asignaciones de terceros;
  - ganadores/perdedores desde M89-M104.
- Cargar literalmente las 495 filas del Anexo C en `third_place_combinations`.
- Añadir validadores de semilla.

### Entregables

- Archivos de seed versionados.
- Script de validación de integridad.
- Datos iniciales reproducibles en un proyecto Supabase limpio.

### Criterios de aceptación

- Hay 48 equipos.
- Hay 12 grupos de 4 equipos.
- Hay 104 partidos con numeración única.
- Hay 495 combinaciones de terceros con claves únicas.
- Cada combinación contiene 8 grupos válidos y asignaciones compatibles con los destinos oficiales.

### Riesgo principal

La tabla de 495 combinaciones es crítica y debe venir del reglamento FIFA de mayo de 2026. No se debe sustituir por una fórmula inventada.

---

## Fase 3 — Motor reglamentario del Mundial

### Objetivo

Implementar y probar el dominio que calcula clasificaciones, mejores terceros y cuadro oficial.

### Alcance

- Calcular estadísticas de grupo:
  - PJ, G, E, P, GF, GC, DG, puntos.
- Implementar desempates oficiales:
  - mini-liga head-to-head;
  - repetición sobre subgrupos aún empatados;
  - DG total;
  - GF total;
  - team conduct score;
  - ranking FIFA de respaldo.
- Ordenar terceros:
  - puntos;
  - DG;
  - GF;
  - conduct;
  - ranking FIFA.
- Resolver los 8 terceros clasificados.
- Buscar la fila FIFA por clave de grupos, no por orden 1-8.
- Poblar M73-M88.
- Propagar ganadores y perdedores desde M89 hasta M104.
- Exponer funciones puras testeables y/o RPC transaccionales.

### Entregables

- Módulo `src/domain/worldCupEngine` o equivalente.
- Pruebas unitarias del motor.
- Función/RPC de recálculo de competición.

### Criterios de aceptación

- Empate de dos equipos resuelto por head-to-head.
- Empate de tres o cuatro equipos resuelto sin reiniciar mal la cascada.
- Team conduct y ranking FIFA resuelven últimos casos.
- Se seleccionan exactamente 8 terceros.
- La combinación `EFGHIJKL` asigna los terceros como indica el documento del motor.
- M73-M88 quedan poblados con los participantes correctos.
- M103 recibe perdedores de M101/M102 y M104 recibe ganadores.

---

## Fase 4 — Puntuación y ranking

### Objetivo

Implementar la puntuación de predicciones de partidos, predicciones especiales y ranking global.

### Alcance

- Puntuación fase de grupos:
  - 3 marcador exacto;
  - 1 resultado correcto;
  - 0 fallo.
- Puntuación eliminatorias:
  - Round of 32: 6 / 2;
  - Round of 16: 9 / 3;
  - cuartos: 12 / 4;
  - semifinales: 15 / 5;
  - tercer puesto: 15 / 5;
  - final: 30 / 10.
- Soportar empates decididos por penaltis.
- Puntuación especial:
  - campeón 25;
  - subcampeón 15;
  - máximo goleador 10.
- Ranking global con posiciones compartidas en empate.
- Recalcular de forma idempotente tras resultados y correcciones.

### Entregables

- Funciones de puntuación testeadas.
- RPC o flujo transaccional de actualización de resultado.
- Consulta de ranking lista para UI.

### Criterios de aceptación

- Marcador exacto no acumula puntos extra de ganador.
- Predicción de empate en eliminatoria exige equipo que avanza.
- Marcador exacto en partido decidido por penaltis ignora el tanteo de la tanda.
- Corrección administrativa no duplica puntos.
- Dos usuarios empatados muestran la misma posición.

---

## Fase 5 — Autenticación y estructura privada

### Objetivo

Permitir registro, inicio de sesión y navegación protegida para usuarios y administradores.

### Alcance

- Pantallas:
  - registro;
  - inicio de sesión;
  - recuperación de contraseña;
  - cierre de sesión.
- Crear sesión persistente con Supabase Auth.
- Cargar perfil del usuario actual.
- Proteger rutas privadas.
- Proteger rutas de administración por `is_admin`.
- Mostrar estados de carga y error de forma clara.

### Entregables

- Flujo completo de autenticación.
- Layout principal responsive.
- Guardas de ruta para usuario y admin.

### Criterios de aceptación

- Usuario puede registrarse y recibe perfil.
- Usuario autenticado entra al dashboard.
- Usuario no admin no accede a administración.
- Cierre de sesión limpia el estado local.

---

## Fase 6 — Predicciones de usuario

### Objetivo

Permitir que cada usuario pronostique partidos disponibles y predicciones especiales antes de su bloqueo.

### Alcance

- Dashboard:
  - posición y puntos del usuario;
  - top del ranking;
  - próximos partidos;
  - estado de predicción.
- Predicciones de grupos:
  - agrupadas por A-L;
  - inputs de marcador;
  - estado disponible/bloqueado;
  - puntos obtenidos cuando el partido sea final.
- Predicciones de eliminatorias:
  - disponibles solo cuando ambos participantes estén resueltos;
  - selección de equipo que avanza si el marcador pronosticado es empate.
- Predicciones especiales:
  - campeón;
  - subcampeón;
  - máximo goleador;
  - bloqueo al kickoff de M1.
- Validación de UI coherente con validación de base de datos.

### Entregables

- Pantallas de predicción completas.
- Componentes reutilizables para partido, marcador y estado de bloqueo.
- Manejo de errores cuando Supabase rechaza una edición bloqueada.

### Criterios de aceptación

- Dos usuarios guardan predicciones distintas para el mismo partido.
- Una predicción se puede editar antes del kickoff.
- Una predicción no se puede editar al llegar el kickoff.
- Un partido eliminatorio sin equipos resueltos muestra `TBD` y no permite predicción.

---

## Fase 7 — Vistas oficiales del torneo

### Objetivo

Mostrar el estado oficial de la competición calculado desde resultados reales.

### Alcance

- Clasificaciones de grupos:
  - PJ, G, E, P, GF, GC, DG, puntos;
  - posición 1-4;
  - indicador de tercero clasificado o eliminado.
- Ranking de terceros:
  - 12 terceros ordenados;
  - top 8 destacado.
- Cuadro de eliminatorias:
  - desde M73 hasta M104;
  - `TBD` cuando falten participantes;
  - ruta oficial fija por número FIFA;
  - responsive.
- Ranking global:
  - posición;
  - nombre;
  - puntos totales;
  - desglose partidos/especiales si no complica la consulta.

### Entregables

- Pantallas públicas internas del torneo.
- Componentes de tabla y bracket.
- Consultas Supabase optimizadas para lectura.

### Criterios de aceptación

- Las clasificaciones reflejan solo resultados oficiales.
- El cuadro no se reorganiza por usuario ni por cronología visual.
- Los terceros clasificados dependen del motor y de la tabla FIFA.
- El ranking cambia tras confirmar o corregir un resultado.

---

## Fase 8 — Administración

### Objetivo

Dar al administrador control seguro para introducir, corregir y recalcular resultados oficiales.

### Alcance

- Lista de partidos con filtros por fase, grupo, estado y número FIFA.
- Formulario de resultado:
  - marcador;
  - estado;
  - prórroga/penaltis;
  - ganador oficial;
  - validaciones de coherencia.
- Corrección de resultado con confirmación explícita.
- Acción de recalcular competición.
- Gestión de premios oficiales:
  - campeón;
  - subcampeón;
  - máximo goleador.
- Registro visible de última actualización.
- Escritura en `admin_audit_log`.

### Entregables

- Panel de administración protegido.
- Flujo transaccional de confirmación/corrección.
- Vista básica de auditoría.

### Criterios de aceptación

- Admin confirma un partido de grupos y se recalculan puntos, grupo y ranking.
- Admin confirma el último partido de grupos y se resuelven M73-M88.
- Admin confirma eliminatoria y se propaga ganador/perdedor.
- Admin corrige un resultado y el estado derivado se recalcula sin duplicar puntos.

---

## Fase 9 — Pruebas end-to-end y hardening

### Objetivo

Demostrar que los flujos críticos del PRD funcionan de punta a punta.

### Alcance

- Pruebas automatizadas o guiones verificables para:
  - registro de dos usuarios;
  - predicciones diferentes;
  - bloqueo por kickoff;
  - resultado oficial;
  - puntuación;
  - grupo con desempate;
  - top 8 terceros;
  - resolución de M73-M88;
  - propagación de eliminatorias;
  - corrección administrativa;
  - restricciones RLS.
- Revisión de responsive/mobile.
- Revisión de mensajes de error.
- Revisión de variables de entorno y despliegue.

### Entregables

- Suite de pruebas mínima.
- Checklist de QA manual.
- Build de producción validado.

### Criterios de aceptación

- Se cumplen los 10 criterios de aceptación de V1 del PRD.
- La app no depende de la hora del navegador para bloquear predicciones.
- No hay rutas administrativas visibles o utilizables por usuarios normales.
- El build de producción pasa sin errores.

---

## Fase 10 — Despliegue V1

### Objetivo

Publicar la aplicación privada con Supabase y hosting estático.

### Alcance

- Crear/configurar proyecto Supabase.
- Ejecutar migraciones y seeds.
- Crear administrador inicial.
- Configurar variables en hosting.
- Desplegar frontend en Vercel o equivalente.
- Ejecutar smoke test en producción.
- Documentar operaciones básicas:
  - alta de usuario;
  - convertir usuario en admin;
  - cargar resultado;
  - corregir resultado;
  - recalcular competición.

### Entregables

- URL de producción.
- Supabase configurado.
- Documento breve de operación.

### Criterios de aceptación

- Usuario real puede registrarse e iniciar sesión.
- Admin real puede introducir un resultado.
- Ranking real se actualiza.
- Variables privadas no aparecen en el repositorio ni en el bundle.

---

## Orden recomendado de trabajo

1. Fase 0: base técnica.
2. Fase 1: esquema y RLS.
3. Fase 2: semillas oficiales.
4. Fase 3: motor reglamentario.
5. Fase 4: puntuación y ranking.
6. Fase 5: autenticación.
7. Fase 6: predicciones.
8. Fase 7: vistas oficiales.
9. Fase 8: administración.
10. Fase 9: pruebas end-to-end.
11. Fase 10: despliegue.

Este orden reduce riesgo porque valida primero las reglas que no pueden corregirse solo desde la interfaz: RLS, bloqueo temporal, semillas FIFA, desempates y propagación del cuadro.

---

## Hitos de demo

### Demo 1 — Base segura

- Usuario se registra.
- Perfil se crea.
- Predicción futura se guarda.
- Predicción bloqueada falla desde base de datos.

### Demo 2 — Motor oficial

- Se cargan resultados de grupos simulados.
- Se calculan grupos y terceros.
- Se consulta una fila FIFA y se llenan M73-M88.

### Demo 3 — Porra funcional

- Dos usuarios predicen.
- Admin confirma resultados.
- Puntos y ranking se actualizan.
- Eliminatorias propagan participantes.

### Demo 4 — V1 completa

- Flujo completo desde registro hasta final del torneo simulado.
- Premios especiales se puntúan.
- Correcciones administrativas recalculan sin duplicados.

---

## Fuera de V1

- Ligas múltiples o privadas.
- Invitaciones y códigos de acceso.
- Chat, comentarios o notificaciones.
- Integración automática con APIs deportivas.
- Backend Express, Prisma o Docker.
- Cuadros personales basados en predicciones de grupo.
- Pagos, apuestas o premios económicos.
