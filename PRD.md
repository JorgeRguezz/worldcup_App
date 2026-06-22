# PRD — App privada de predicciones del Mundial 2026

> **Estado:** especificación funcional cerrada para V1.  
> **Idioma de la interfaz:** español.  
> **Audiencia:** agente de IA de código / desarrollador.  
> **Objetivo:** construir una app privada, sencilla y fiable para que un único grupo de 10–15 amigos haga predicciones del Mundial 2026.

---

## 1. Decisiones de producto ya cerradas

| Tema | Decisión |
|---|---|
| Competición | Copa Mundial de la FIFA 2026 |
| Usuarios esperados | 10–15 |
| Ligas | Una única liga global; todos los usuarios compiten entre sí |
| Predicción de partidos | Marcador exacto, tanto en grupos como en eliminatorias |
| Edición de predicciones | Permitida hasta el instante exacto de inicio del partido; después, bloqueada |
| Puntos en fase de grupos | 3 por marcador exacto; 1 por ganador/empate correcto; 0 si falla |
| Puntos en eliminatorias | Mayor valor por ronda; tabla cerrada en la sección 6 |
| Predicciones especiales | Campeón, subcampeón y máximo goleador |
| Cuadro | Se construye automáticamente con los **resultados oficiales**, aplicando las reglas oficiales FIFA 2026 |
| Resultados oficiales | Los introduce/corrige un administrador desde la propia app |
| Tecnología | React + Vite + TypeScript + Supabase. No crear backend Express, Prisma ni Docker para V1 |
| Monetización / apuestas | Prohibidas. Es una porra privada sin dinero real |

### Interpretación funcional importante

La V1 **no debe crear un cuadro de eliminatorias distinto para cada usuario a partir de sus predicciones de grupos**.

- Las predicciones de los usuarios sirven para puntuar sus aciertos.
- La clasificación de grupos, los ocho mejores terceros y el cuadro que muestra la aplicación se calculan exclusivamente con los **resultados oficiales** introducidos por el administrador.
- Cuando se conocen los participantes reales de un partido eliminatorio, ese partido queda disponible para que los usuarios introduzcan o modifiquen su predicción hasta el saque inicial.

Esta restricción elimina ambigüedades de puntuación y mantiene el producto simple.

---

## 2. Objetivo de la V1

La app debe permitir que un grupo pequeño:

1. Cree una cuenta e inicie sesión.
2. Pronostique el marcador de cada partido disponible antes de su inicio.
3. Consulte sus predicciones y sepa cuáles están bloqueadas.
4. Vea resultados oficiales, clasificación de grupos, mejores terceros y cuadro de eliminatorias.
5. Vea una clasificación global actualizada automáticamente tras cada resultado oficial.
6. Haga predicciones especiales antes del primer partido del torneo.
7. Tenga un administrador capaz de cargar y corregir resultados oficiales.

La app no necesita ser una plataforma pública ni estar preparada para miles de usuarios.

---

## 3. Alcance explícitamente excluido

No implementar en V1:

- Varias ligas, ligas privadas, invitaciones, códigos de acceso o competiciones paralelas.
- Chat, comentarios, reacciones, red social o mensajería.
- Notificaciones push, correo, WhatsApp o automatizaciones.
- Pagos, apuestas, cuotas, premios económicos o integración con casas de apuestas.
- API externa de resultados en directo, scraping o actualización automática desde medios.
- Predicciones de alineaciones, tarjetas, posesión, corners u otras estadísticas.
- Un panel complejo de roles: basta con usuario normal y administrador.
- Un cuadro “personal” derivado de las predicciones de cada usuario.

---

## 4. Stack técnico obligatorio

### Frontend

- React.
- Vite.
- TypeScript estricto.
- React Router para navegación.
- Un sistema de componentes simple y accesible. No introducir un framework pesado si no aporta valor.
- Diseño mobile-first y responsive.

### Backend, autenticación y base de datos

Usar **Supabase** como único backend de V1:

- Supabase Auth para registro, inicio de sesión, cierre de sesión y recuperación de contraseña.
- Supabase PostgreSQL como base de datos.
- Supabase Row Level Security (RLS) para proteger datos.
- SQL migrations versionadas dentro del repositorio.
- Edge Functions solo si una operación no se puede proteger correctamente con SQL/RLS. No crear una API Express.

### Despliegue

- Frontend: Vercel o un hosting estático equivalente.
- Backend/BD: proyecto Supabase.
- Variables privadas nunca en el repositorio. Incluir `.env.example` sin secretos.

---

## 5. Reglas de usuarios y privacidad

### Roles

Hay dos roles:

- `user`: puede leer los datos públicos del torneo, crear y editar únicamente sus propias predicciones antes del bloqueo, y consultar el ranking.
- `admin`: además puede introducir/corregir resultados oficiales, gestionar el estado de partidos, confirmar el ganador de penaltis, definir los premios especiales oficiales y recalcular el torneo.

En V1 habrá un administrador inicial, pero el modelo puede contener `is_admin boolean` para evitar una arquitectura especial.

### Registro

- Usar email y contraseña con Supabase Auth.
- Al crear un usuario, crear automáticamente un perfil con nombre visible.
- La aplicación es privada por contexto, pero no requiere un sistema complejo de invitaciones en V1.

### Visibilidad de predicciones

- Un usuario normal solo puede leer/escribir sus propias predicciones.
- Los usuarios ven el ranking y el total de puntos de los demás, pero no sus pronósticos individuales antes del inicio de un partido.
- El administrador puede consultar y gestionar las predicciones para soporte.

---

## 6. Reglas de puntuación

### Principio general

Una predicción exacta **no acumula** los puntos de “ganador correcto”. Cada partido genera una única puntuación: exacto, resultado correcto o fallo.

### 6.1 Fase de grupos

| Situación | Puntos |
|---|---:|
| Marcador exacto | 3 |
| Ganador correcto o empate correcto, pero marcador no exacto | 1 |
| Cualquier otro caso | 0 |

Ejemplos:

| Predicción | Resultado oficial | Puntos | Motivo |
|---|---|---:|---|
| España 2–1 Uruguay | España 2–1 Uruguay | 3 | Marcador exacto |
| España 1–0 Uruguay | España 2–1 Uruguay | 1 | Gana España en ambos |
| España 1–1 Uruguay | España 2–1 Uruguay | 0 | Predice empate |
| Uruguay 1–0 España | España 2–1 Uruguay | 0 | Ganador incorrecto |

### 6.2 Eliminatorias

| Ronda | Marcador exacto | Ganador / equipo que avanza correcto |
|---|---:|---:|
| Dieciseisavos / Round of 32 | 6 | 2 |
| Octavos / Round of 16 | 9 | 3 |
| Cuartos de final | 12 | 4 |
| Semifinales | 15 | 5 |
| Partido por el tercer puesto | 15 | 5 |
| Final | 30 | 10 |

### 6.3 Empates en eliminatorias, prórroga y penaltis

El modelo debe soportar correctamente partidos decididos tras prórroga o penaltis.

- Los marcadores de la app representan el resultado al finalizar el partido, incluida la prórroga cuando exista, **sin sumar los lanzamientos de penalti**.
- Si el usuario pronostica empate en una eliminatoria, debe seleccionar también el equipo que avanzará/gana en penaltis.
- Si el pronóstico no termina empatado, el equipo que avanza se infiere del marcador.
- Para puntuar “ganador/equipo que avanza”, comparar el equipo que oficialmente avanza, no solo el resultado tras 90 minutos.
- Para puntuar “marcador exacto”, comparar únicamente los goles del partido hasta el final de la prórroga. Si coinciden, se otorgan los puntos de exactitud aunque el usuario falle el ganador por penaltis.

### 6.4 Predicciones especiales

Las predicciones especiales se rellenan antes del primer partido del torneo y se bloquean al inicio de ese partido.

| Predicción | Puntos |
|---|---:|
| Campeón | 25 |
| Subcampeón | 15 |
| Máximo goleador | 10 |

El administrador registrará manualmente el ganador oficial del Balón de Oro / Bota de Oro aplicable como “máximo goleador” de la porra. La app no debe intentar resolver por sí sola los desempates oficiales de premios individuales.

### 6.5 Ranking global

- `total_points = puntos de predicciones de partidos + puntos de predicciones especiales`.
- Recalcular inmediatamente tras confirmar o corregir un resultado oficial.
- Si dos usuarios empatan a puntos, mostrar la misma posición de ranking; ordenar visualmente por nombre para mantener consistencia.
- No inventar un desempate entre usuarios salvo que se añada explícitamente en una futura versión.

---

## 7. Bloqueo de predicciones

### Regla obligatoria

Una predicción es editable si y solo si:

```text
current_database_time < match.kickoff_at
```

En el momento exacto de `kickoff_at` queda bloqueada.

### Requisitos de implementación

- Guardar horarios en PostgreSQL como `timestamptz` en UTC.
- Mostrar horarios al usuario en `Europe/Madrid`.
- No confiar en la hora del navegador para autorizar una edición.
- Validar el bloqueo también en base de datos: RLS y/o trigger SQL debe impedir `INSERT`, `UPDATE` o `DELETE` de predicciones cuando el partido ya haya empezado.
- La interfaz debe mostrar el estado “Disponible”, “Se bloquea a las …” o “Bloqueada”.

---

## 8. Datos y modelo de base de datos

No exponer secretos de Supabase en el cliente. Usar solo `VITE_SUPABASE_URL` y una clave anónima pública adecuada; cualquier operación administrativa debe quedar protegida por RLS, RPC segura o servidor.

### 8.1 Tablas principales

#### `profiles`

Extiende `auth.users`.

| Campo | Tipo / regla |
|---|---|
| `id` | UUID PK, FK a `auth.users.id` |
| `display_name` | texto, obligatorio, visible en ranking |
| `is_admin` | boolean, `false` por defecto |
| `created_at` | `timestamptz` |

#### `teams`

| Campo | Tipo / regla |
|---|---|
| `id` | UUID o código estable |
| `name` | texto |
| `short_name` | texto |
| `fifa_code` | texto único |
| `group_letter` | `A`–`L` |
| `draw_position` | 1–4 |
| `fifa_ranking_order` | entero; respaldo para el último desempate reglamentario |

#### `matches`

Representa los 104 partidos oficiales. Un partido no se crea de forma dinámica: se siembra desde el calendario oficial y sus participantes se resuelven cuando corresponda.

| Campo | Tipo / regla |
|---|---|
| `id` | UUID PK |
| `fifa_match_number` | entero único, 1–104 |
| `stage` | `GROUP`, `R32`, `R16`, `QF`, `SF`, `THIRD_PLACE`, `FINAL` |
| `group_letter` | `A`–`L` o `NULL` |
| `kickoff_at` | `timestamptz`, obligatorio |
| `venue` | texto |
| `status` | `SCHEDULED`, `LIVE`, `FINAL` |
| `home_team_id` | nullable hasta que se resuelva el participante |
| `away_team_id` | nullable hasta que se resuelva el participante |
| `home_score` | entero nullable; goles al final del partido/prórroga |
| `away_score` | entero nullable |
| `penalties_home` | entero nullable |
| `penalties_away` | entero nullable |
| `winner_team_id` | nullable hasta resultado final |
| `decided_by` | `NORMAL_TIME`, `EXTRA_TIME`, `PENALTIES`, nullable |
| `result_updated_at` | `timestamptz` |

Restricciones:

- Marcadores y penaltis son enteros no negativos.
- `winner_team_id` debe coincidir con uno de los participantes.
- Un empate en una eliminatoria finalizada exige `winner_team_id` y `decided_by = PENALTIES`.
- Una eliminatoria no empatada exige que `winner_team_id` coincida con el equipo con mayor marcador.

#### `match_slots`

Define de dónde viene cada participante de un partido. Es necesario para poblar automáticamente el cuadro sin hardcodear la interfaz.

| Campo | Ejemplos |
|---|---|
| `match_id` | M79 |
| `side` | `HOME` o `AWAY` |
| `source_type` | `TEAM`, `GROUP_POSITION`, `THIRD_PLACE_ASSIGNMENT`, `MATCH_WINNER`, `MATCH_LOSER` |
| `source_value` | `A:1`, `A:2`, `M74`, `M101`, etc. |
| `resolved_team_id` | equipo resultante, nullable mientras no se conoce |

#### `group_team_stats`

Puede ser una vista/materialized view o una tabla recalculada. Debe reflejar la clasificación oficial por grupo.

| Campo | Contenido |
|---|---|
| `team_id`, `group_letter` | identidad |
| `played`, `wins`, `draws`, `losses` | estadísticas |
| `goals_for`, `goals_against`, `goal_difference`, `points` | estadísticas |
| `team_conduct_score` | dato de desempate FIFA, editable por administrador si hace falta |
| `rank` | posición final/calculada 1–4 |

#### `third_place_combinations`

Tabla de referencia obligatoria para las 495 combinaciones de los ocho mejores terceros de la FIFA.

| Campo | Contenido |
|---|---|
| `qualifying_groups_key` | clave única con 8 letras ordenadas, p. ej. `EFGHIJKL` |
| `for_1a`, `for_1b`, `for_1d`, `for_1e`, `for_1g`, `for_1i`, `for_1k`, `for_1l` | letra del grupo cuyo tercero se asigna a ese ganador de grupo |
| `source_option` | 1–495 para trazabilidad con el Anexo C de FIFA |

#### `predictions`

| Campo | Tipo / regla |
|---|---|
| `id` | UUID PK |
| `user_id` | FK `profiles.id` |
| `match_id` | FK `matches.id` |
| `predicted_home_score` | entero no negativo, máximo razonable 20 |
| `predicted_away_score` | entero no negativo, máximo razonable 20 |
| `predicted_advancing_team_id` | obligatorio solo si es eliminatoria y se pronostica empate |
| `points_awarded` | entero calculado, inicialmente 0 |
| `created_at`, `updated_at` | `timestamptz` |

Restricciones:

- `UNIQUE(user_id, match_id)`.
- Un usuario no puede predecir un partido sin dos participantes reales resueltos.
- Un usuario no puede usar un `predicted_advancing_team_id` que no sea uno de los dos participantes.
- RLS/trigger bloquea cualquier modificación cuando `now() >= kickoff_at`.

#### `special_predictions`

| Campo | Regla |
|---|---|
| `user_id` | único; FK a perfil |
| `champion_team_id` | obligatorio cuando se guarda la predicción |
| `runner_up_team_id` | obligatorio y distinto del campeón |
| `top_scorer_player_name` | texto; V1 no necesita catálogo completo de jugadores |
| `points_awarded` | suma calculada |
| `updated_at` | timestamp |

#### `official_awards`

Una única fila para los datos de cierre.

| Campo | Regla |
|---|---|
| `champion_team_id` | ganador de M104 |
| `runner_up_team_id` | perdedor de M104 |
| `top_scorer_player_name` | lo confirma manualmente el administrador |
| `updated_at` | timestamp |

#### `admin_audit_log`

Registrar acciones administrativas relevantes: creación/corrección de resultado, cambio de estado, modificación de premio, ejecución de recálculo y usuario responsable.

---

## 9. Políticas RLS mínimas

| Recurso | Usuario normal | Administrador |
|---|---|---|
| Equipos, partidos, grupos, cuadro, ranking | lectura | lectura/escritura de datos oficiales |
| Su propio perfil | lectura/edición limitada | lectura/escritura |
| Predicciones propias | lectura/alta/edición antes de kickoff | lectura/escritura para soporte |
| Predicciones de otros | no lectura antes del partido; no edición | lectura |
| Resultados oficiales | no escritura | escritura |
| Tabla de combinaciones FIFA | lectura | solo migraciones / administración controlada |

Las políticas deben cubrir también acceso directo por API de Supabase; no asumir que la UI es una barrera de seguridad.

---

## 10. Pantallas requeridas

### 10.1 Autenticación

- Registro.
- Inicio de sesión.
- Recuperación de contraseña.
- Cierre de sesión.

### 10.2 Inicio / Dashboard

- Posición y puntos del usuario actual.
- Top del ranking global.
- Próximos partidos con estado de predicción.
- CTA hacia “Mis predicciones”.

### 10.3 Predicciones de fase de grupos

- Agrupar por grupo A–L.
- Mostrar equipos, escudos/banderas si se dispone de activos libres/permitidos, fecha/hora local y dos inputs de marcador.
- Guardar automáticamente o con botón claro.
- Permitir editar hasta kickoff.
- Mostrar puntos obtenidos cuando el resultado sea final.

### 10.4 Clasificaciones de grupos

- Mostrar PJ, G, E, P, GF, GC, DG y puntos.
- Indicar 1.º, 2.º, tercero clasificado entre los ocho mejores o tercero eliminado.
- Aclarar que es clasificación oficial calculada desde resultados oficiales.

### 10.5 Cuadro de eliminatorias

- Vista visual responsive del cuadro desde dieciseisavos hasta final, incluyendo partido por tercer puesto.
- Mostrar `TBD` hasta que se resuelva un participante.
- Mostrar la ruta oficial de los encuentros; no reorganizar el cuadro según el usuario.
- En partidos con participantes conocidos, permitir la predicción si todavía no han empezado.

### 10.6 Predicciones especiales

- Campeón, subcampeón, máximo goleador.
- Bloqueo al inicio de M1.
- Tras cierre, mostrar las elecciones propias como solo lectura.

### 10.7 Ranking

- Posición, nombre, puntos totales.
- Opcionalmente mostrar desglose “partidos / especiales” si no complica la vista.

### 10.8 Administración

Restringida a administrador:

- Lista de partidos y estado.
- Formulario para introducir resultado, prórroga/penaltis y equipo ganador.
- Acción de corregir resultado ya finalizado con confirmación.
- Acción “recalcular competición” que actualiza: clasificación de grupos, terceros, participantes del cuadro, puntos y ranking.
- Registro de última actualización.

---

## 11. Flujo de datos obligatorio

1. Se siembran equipos, 104 partidos, horarios oficiales y dependencias del cuadro.
2. Los usuarios crean o editan predicciones antes de cada kickoff.
3. El administrador marca un partido como `FINAL` e introduce resultado oficial.
4. Una transacción/RPC recalcula puntos de las predicciones de ese partido.
5. Si era partido de grupos, se recalculan las estadísticas y clasificación de su grupo.
6. Al finalizar la fase de grupos, se determina el top 8 de terceros y se consulta la tabla FIFA de 495 combinaciones.
7. Se resuelven los participantes de M73–M88.
8. Tras cada eliminatoria, se propaga ganador/perdedor a los slots dependientes.
9. Se actualiza el ranking global.
10. Si un resultado se corrige, repetir el proceso de forma idempotente desde el partido afectado hacia delante.

No recalcular con lógica duplicada en cada componente React. Centralizar la lógica en SQL/RPC o en una única capa de dominio bien testeada.

---

## 12. Datos iniciales y validaciones de integridad

La semilla del torneo debe validar:

- 48 equipos.
- 12 grupos de 4 equipos: A–L.
- 72 partidos de grupos, numerados M1–M72.
- 16 partidos de Round of 32: M73–M88.
- 8 partidos de Round of 16: M89–M96.
- 4 cuartos: M97–M100.
- 2 semifinales: M101–M102.
- Partido por el tercer puesto: M103.
- Final: M104.
- 495 combinaciones de terceros en `third_place_combinations`.

El calendario oficial y la tabla completa de combinaciones se documentan en `WORLD_CUP_ENGINE.md`.

---

## 13. Criterios de aceptación de V1

La V1 se considera lista cuando se pueda demostrar lo siguiente:

1. Dos usuarios registran predicciones diferentes para un partido futuro.
2. Un usuario no puede modificar una predicción después del kickoff incluso si intenta llamar a Supabase directamente.
3. Al finalizar un partido de grupos, las puntuaciones 3/1/0 se asignan correctamente.
4. La tabla del grupo respeta los criterios oficiales de desempate implementados en el motor.
5. Con una simulación completa de grupos, se clasifican 24 equipos por posición y 8 terceros por ranking.
6. La app encuentra una y solo una combinación válida de los 495 casos FIFA y llena correctamente M73–M88.
7. Un resultado de eliminatoria propaga el ganador al siguiente partido correcto.
8. Un empate en eliminatoria con penaltis permite puntuar marcador y equipo que avanza de forma consistente.
9. Una corrección administrativa recalcula el ranking sin duplicar puntos.
10. Los usuarios solo pueden leer/escribir sus datos permitidos por RLS.

---

## 14. Fuentes oficiales que debe respetar el repositorio

- FIFA, **Regulations for the FIFA World Cup 26™**, edición de mayo de 2026. Incluye formato, criterios de desempate, cuadro y Anexo C con las 495 combinaciones de terceros:  
  `https://digitalhub.fifa.com/m/636f5c9c6f29771f/original/FWC2026_regulations_EN.pdf`
- FIFA, **FIFA World Cup 2026™ Match Schedule**, versión publicada el 10 de abril de 2026:  
  `https://digitalhub.fifa.com/asset/4b5d4417-3343-4732-9cdf-14b6662af407/FWC26-Match-Schedule_English.pdf`

No usar reglas de Mundiales anteriores ni inventar una asignación de terceros basada únicamente en orden de puntos.
