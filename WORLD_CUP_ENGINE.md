# WORLD_CUP_ENGINE — Motor reglamentario del Mundial 2026

> **Fuente normativa primaria:** *Regulations for the FIFA World Cup 26™*, FIFA, mayo de 2026.  
> **Propósito:** especificar cómo debe implementar el código la clasificación, los mejores terceros y el cuadro oficial.  
> **Regla de oro:** este motor trabaja con **resultados oficiales**, no con predicciones personales de los usuarios.

---

## 1. Alcance del motor

El motor debe:

1. Calcular la clasificación de cada grupo con resultados oficiales.
2. Resolver todos los desempates reglamentarios de grupo.
3. Elegir y ordenar a los ocho mejores terceros de los doce grupos.
4. Consultar la tabla oficial FIFA de 495 combinaciones de terceros.
5. Poblar los dieciseisavos oficiales M73–M88.
6. Propagar ganadores y perdedores por el árbol de M89–M104.
7. Exponer datos consistentes para la interfaz y el cálculo de puntos de usuarios.

El motor no debe:

- Inferir partidos a partir de una regla inventada como “el mejor tercero va al mejor ganador”.
- Crear una versión del cuadro por usuario.
- Usar datos de UI como fuente de verdad.
- Reordenar partidos según orden cronológico o conveniencia visual: debe respetar los números de partido oficiales.

---

## 2. Formato oficial 2026

- 48 equipos.
- 12 grupos de cuatro equipos, A–L.
- Cada equipo juega tres partidos de grupo.
- Avanzan a Round of 32 / dieciseisavos:
  - los 12 ganadores de grupo;
  - los 12 segundos de grupo;
  - los 8 mejores terceros.
- Desde M73 hay eliminación directa: Round of 32, Round of 16, cuartos, semifinales, partido por el tercer puesto y final.

El torneo contiene 104 partidos: 72 de grupos y 32 de eliminatorias.

---

## 3. Datos de entrada necesarios

### 3.1 Resultado oficial de un partido

```ts
type OfficialMatchResult = {
  matchId: string;
  status: 'SCHEDULED' | 'LIVE' | 'FINAL';
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null; // resultado final incluyendo prórroga; no incluye penaltis
  awayScore: number | null;
  penaltiesHome: number | null;
  penaltiesAway: number | null;
  winnerTeamId: string | null; // obligatorio en eliminatorias finalizadas
  decidedBy: 'NORMAL_TIME' | 'EXTRA_TIME' | 'PENALTIES' | null;
};
```

### 3.2 Disciplina / team conduct score

El reglamento usa un **team conduct score** para desempates. No confundirlo con el premio FIFA Fair Play.

Para que el motor pueda resolver exactamente los casos raros, guardar por equipo y grupo el total de deducciones o, de forma equivalente, el score final. Las deducciones por partido son:

| Hecho | Deducción |
|---|---:|
| Tarjeta amarilla | -1 |
| Segunda amarilla / roja indirecta | -3 |
| Roja directa | -4 |
| Amarilla y roja directa | -5 |

Por jugador u oficial solo se aplica una deducción de la lista en el mismo partido. El mayor score (menos negativo) queda por delante.

Como V1 no integra una fuente deportiva externa, el administrador puede cargar o corregir este dato únicamente cuando sea necesario para resolver un empate real.

### 3.3 Ranking FIFA de respaldo

El último desempate usa la edición más reciente publicada del FIFA/Coca-Cola Men’s World Ranking y, si persistiera el empate, ediciones previas sucesivas.

Implementación V1:

- Sembrar un entero `fifa_ranking_order` por equipo antes del torneo.
- Permitir al admin corregirlo si FIFA publica una referencia aplicable distinta.
- No realizar llamadas automáticas al ranking en tiempo de ejecución.

---

## 4. Clasificación de los grupos A–L

### 4.1 Estadísticas básicas

Para cada grupo, calcular con sus seis partidos:

```text
victoria = 3 puntos
empate   = 1 punto
perder   = 0 puntos
```

También calcular:

```text
PJ, G, E, P, GF, GC, DG = GF - GC, puntos
```

El orden inicial es por `puntos DESC`.

### 4.2 Desempate oficial de equipos iguales a puntos

Cuando dos o más equipos del mismo grupo terminan igualados a puntos, aplicar exactamente esta secuencia.

#### Paso 1: mini-liga entre los equipos empatados

1. Mayor número de puntos obtenidos en los partidos entre los equipos empatados.
2. Mejor diferencia de goles en esos partidos entre los equipos empatados.
3. Mayor número de goles marcados en esos partidos entre los equipos empatados.

#### Paso 2: si el empate no queda resuelto

- Para los equipos que sigan empatados, repetir los criterios 1–3 usando solo los partidos entre esos equipos que aún permanecen empatados.
- Si siguen igualados, aplicar:
  4. Mejor diferencia de goles en todos los partidos de grupo.
  5. Mayor número de goles marcados en todos los partidos de grupo.
  6. Mayor team conduct score.

**Detalle esencial:** cuando un criterio separa a uno de los equipos pero deja empatados a otros, continuar con el siguiente criterio sobre los que siguen empatados. No reiniciar incorrectamente toda la cascada.

#### Paso 3: último respaldo

7. Mejor posición en la edición más reciente del FIFA/Coca-Cola Men’s World Ranking.
8. Si persiste, mejor posición en la edición inmediatamente anterior; continuar hacia atrás hasta resolverlo.

### 4.3 Pseudocódigo orientativo

```ts
function rankGroup(teams: GroupTeam[], results: GroupResult[]): RankedTeam[] {
  const byPoints = groupByEqualPoints(teams, results);

  return byPoints.flatMap((tiedBlock) => {
    if (tiedBlock.length === 1) return tiedBlock;

    const afterHeadToHead = rankTiedBlockRecursivelyByHeadToHead(tiedBlock, results);
    return resolveRemainingTies(afterHeadToHead, results, [
      'overallGoalDifference',
      'overallGoalsFor',
      'teamConductScore',
      'fifaRankingOrderCurrent',
      'fifaRankingOrderPrevious',
    ]);
  });
}
```

El pseudocódigo no sustituye pruebas. Crear casos de test para empate de dos, tres y cuatro equipos; en especial, una mini-liga de tres en la que el primer criterio separa a un equipo y deja a otros dos empatados.

---

## 5. Ranking de los terceros puestos

Una vez fijados los doce grupos, extraer los doce equipos que terminaron terceros.

Ordenarlos con estos criterios, sin enfrentamientos directos entre grupos:

1. Más puntos en todos los partidos de grupo.
2. Mejor diferencia de goles.
3. Más goles marcados.
4. Mejor team conduct score.
5. Mejor posición en el ranking FIFA más reciente aplicable.
6. Si persiste, mejor posición en ediciones anteriores del ranking FIFA.

Los ocho primeros se clasifican. Los otros cuatro quedan eliminados.

### Restricciones

- La clave que determina el cuadro depende de **qué grupos** aportan esos ocho terceros, no del orden 1.º–8.º de esos terceros.
- Aun así, almacenar la clasificación completa 1–12 por transparencia y UI.
- Resolver el top 8 únicamente cuando los doce grupos estén concluidos o cuando el administrador lo fuerce para pruebas.

---

## 6. Partido de Round of 32: fuentes oficiales de participantes

Los participantes de M73–M88 son los siguientes. Las expresiones `1A`, `2A` y `3A` significan ganador, segundo y tercero del Grupo A.

| Nº FIFA | Partido | Fuente de local | Fuente de visitante |
|---:|---|---|---|
| M73 | 2A vs 2B | Segundo A | Segundo B |
| M74 | 1E vs 3ABCDF | Ganador E | Mejor tercero asignado de A/B/C/D/F |
| M75 | 1F vs 2C | Ganador F | Segundo C |
| M76 | 1C vs 2F | Ganador C | Segundo F |
| M77 | 1I vs 3CDFGH | Ganador I | Mejor tercero asignado de C/D/F/G/H |
| M78 | 2E vs 2I | Segundo E | Segundo I |
| M79 | 1A vs 3CEFHI | Ganador A | Mejor tercero asignado de C/E/F/H/I |
| M80 | 1L vs 3EHIJK | Ganador L | Mejor tercero asignado de E/H/I/J/K |
| M81 | 1D vs 3BEFIJ | Ganador D | Mejor tercero asignado de B/E/F/I/J |
| M82 | 1G vs 3AEHIJ | Ganador G | Mejor tercero asignado de A/E/H/I/J |
| M83 | 2K vs 2L | Segundo K | Segundo L |
| M84 | 1H vs 2J | Ganador H | Segundo J |
| M85 | 1B vs 3EFGIJ | Ganador B | Mejor tercero asignado de E/F/G/I/J |
| M86 | 1J vs 2H | Ganador J | Segundo H |
| M87 | 1K vs 3DEIJL | Ganador K | Mejor tercero asignado de D/E/I/J/L |
| M88 | 2D vs 2G | Segundo D | Segundo G |

### Razonamiento de diseño

Ocho ganadores de grupo se enfrentan a un tercero. Los otros cuatro ganadores de grupo se enfrentan a segundos, y los segundos restantes se cruzan entre sí. La asignación concreta de los ocho terceros está fijada por el Anexo C de FIFA para evitar enfrentamientos entre equipos del mismo grupo en M73–M88.

---

## 7. Las 495 combinaciones de terceros: requisito crítico

### 7.1 Por qué no se puede deducir con una fórmula simple

De 12 terceros de grupo se clasifican 8. Hay:

```text
C(12, 8) = 495
```

posibles conjuntos de grupos clasificadores.

FIFA publicó en el **Anexo C** una asignación exacta para cada conjunto. El motor debe usar esa tabla como datos estáticos versionados, no intentar inventar un algoritmo alternativo.

### 7.2 Estructura de la tabla

Cada fila responde:

> “Si los ocho terceros clasificados vienen de estos grupos, ¿qué tercero se enfrenta a 1A, 1B, 1D, 1E, 1G, 1I, 1K y 1L?”

Columnas oficiales del Anexo C:

```text
1A | 1B | 1D | 1E | 1G | 1I | 1K | 1L
```

Correspondencia con partidos:

| Columna | Partido que recibe ese tercero |
|---|---|
| `1A` | M79 |
| `1B` | M85 |
| `1D` | M81 |
| `1E` | M74 |
| `1G` | M82 |
| `1I` | M77 |
| `1K` | M87 |
| `1L` | M80 |

### 7.3 Ejemplo oficial de fila

Si los terceros clasificados proceden de los grupos:

```text
E, F, G, H, I, J, K, L
```

la primera fila del Anexo C asigna:

| Ganador de grupo | Recibe al tercero de |
|---|---|
| 1A | E |
| 1B | J |
| 1D | I |
| 1E | F |
| 1G | H |
| 1I | G |
| 1K | L |
| 1L | K |

Representación recomendada:

```ts
const example: ThirdPlaceCombination = {
  qualifyingGroupsKey: 'EFGHIJKL',
  for1A: 'E',
  for1B: 'J',
  for1D: 'I',
  for1E: 'F',
  for1G: 'H',
  for1I: 'G',
  for1K: 'L',
  for1L: 'K',
  sourceOption: 1,
};
```

### 7.4 Semilla obligatoria

Crear una migración o un archivo de semilla versionado que contenga **las 495 filas completas** del Anexo C del reglamento FIFA de mayo de 2026.

La fuente que debe copiarse literalmente es:

```text
https://digitalhub.fifa.com/m/636f5c9c6f29771f/original/FWC2026_regulations_EN.pdf
```

El Anexo C ocupa las páginas 79–97 del PDF.

### 7.5 Validaciones obligatorias de la semilla

Antes de considerar listo el motor:

```ts
expect(rows).toHaveLength(495);
expect(new Set(rows.map((row) => row.qualifyingGroupsKey)).size).toBe(495);
```

Para cada fila verificar:

1. La clave contiene exactamente 8 grupos distintos de `A` a `L`, en orden alfabético.
2. Los ocho valores asignados contienen exactamente los mismos ocho grupos, sin duplicados.
3. Cada destino es compatible con las letras permitidas de M74/M77/M79/M80/M81/M82/M85/M87.
4. El tercero de un grupo no se enfrenta al ganador de ese mismo grupo.

### 7.6 Resolución de los terceros en código

```ts
function resolveRoundOf32ThirdPlaces(
  qualifiedThirds: RankedThirdPlace[],
  combinations: ThirdPlaceCombination[],
): Record<'M74' | 'M77' | 'M79' | 'M80' | 'M81' | 'M82' | 'M85' | 'M87', TeamId> {
  if (qualifiedThirds.length !== 8) {
    throw new Error('La fase de grupos no tiene exactamente 8 terceros clasificados');
  }

  const thirdByGroup = new Map(qualifiedThirds.map((item) => [item.groupLetter, item.teamId]));
  const key = [...thirdByGroup.keys()].sort().join('');
  const row = combinations.find((item) => item.qualifyingGroupsKey === key);

  if (!row) throw new Error(`No existe combinación FIFA para ${key}`);

  return {
    M79: mustGet(thirdByGroup, row.for1A),
    M85: mustGet(thirdByGroup, row.for1B),
    M81: mustGet(thirdByGroup, row.for1D),
    M74: mustGet(thirdByGroup, row.for1E),
    M82: mustGet(thirdByGroup, row.for1G),
    M77: mustGet(thirdByGroup, row.for1I),
    M87: mustGet(thirdByGroup, row.for1K),
    M80: mustGet(thirdByGroup, row.for1L),
  };
}
```

No usar el ranking 1.º–8.º de los terceros como clave de la tabla: la clave es el conjunto de **letras de grupo**.

---

## 8. Propagación oficial del cuadro desde M89

Una vez resueltos M73–M88, la estructura es fija.

### Round of 16

| Partido | Participantes |
|---|---|
| M89 | W74 vs W77 |
| M90 | W73 vs W75 |
| M91 | W76 vs W78 |
| M92 | W79 vs W80 |
| M93 | W83 vs W84 |
| M94 | W81 vs W82 |
| M95 | W86 vs W88 |
| M96 | W85 vs W87 |

### Cuartos

| Partido | Participantes |
|---|---|
| M97 | W89 vs W90 |
| M98 | W93 vs W94 |
| M99 | W91 vs W92 |
| M100 | W95 vs W96 |

### Semifinales

| Partido | Participantes |
|---|---|
| M101 | W97 vs W98 |
| M102 | W99 vs W100 |

### Cierre

| Partido | Participantes |
|---|---|
| M103, partido por el tercer puesto | L101 vs L102 |
| M104, final | W101 vs W102 |

`Wxx` significa ganador de partido y `Lxx` perdedor.

---

## 9. Orden de recálculo y consistencia

### 9.1 Transacción de resultado final

Al confirmar o corregir un resultado:

1. Validar que los dos participantes estén resueltos.
2. Validar coherencia de marcador, ganador, prórroga y penaltis.
3. Guardar resultado oficial y estado `FINAL`.
4. Recalcular puntos de todos los usuarios para ese partido de forma idempotente.
5. Si es un partido de grupos, recalcular el grupo afectado.
6. Si todos los grupos han terminado, recalcular terceros, consultar Anexo C y resolver M73–M88.
7. Si es una eliminatoria, resolver el slot dependiente de ganador o perdedor.
8. Recalcular ranking global.
9. Escribir en `admin_audit_log`.

### 9.2 Correcciones

El admin debe poder corregir un resultado, pero la operación debe ser explícita y auditada.

Al corregir:

- Recalcular desde el partido afectado hacia sus dependientes.
- Invalidar participantes previamente propagados que ya no correspondan.
- Nunca duplicar puntos: volver a calcular `points_awarded` a partir del estado actual, no sumar diferencias de forma acumulativa.
- Si hay predicciones de una eliminatoria que deja de tener los mismos participantes por una corrección excepcional, conservarlas para auditoría pero marcarlas como no puntuables hasta que un administrador decida cómo proceder. Este caso no debería ocurrir en el uso normal.

---

## 10. Integración con puntuación de usuarios

### 10.1 Fase de grupos

```ts
function getGroupPredictionPoints(prediction: ScorePrediction, actual: ScoreResult): number {
  if (prediction.home === actual.home && prediction.away === actual.away) return 3;

  const predictedOutcome = compareOutcome(prediction.home, prediction.away); // HOME | DRAW | AWAY
  const actualOutcome = compareOutcome(actual.home, actual.away);

  return predictedOutcome === actualOutcome ? 1 : 0;
}
```

### 10.2 Eliminatorias

```ts
function getKnockoutPredictionPoints(
  prediction: KnockoutPrediction,
  actual: KnockoutResult,
  stage: KnockoutStage,
): number {
  const score = SCORE_RULES[stage];

  const exactScore = prediction.home === actual.home && prediction.away === actual.away;
  if (exactScore) return score.exact;

  return prediction.advancingTeamId === actual.winnerTeamId ? score.winner : 0;
}
```

En una predicción no empatada, `advancingTeamId` puede derivarse del marcador antes de llamar a esta función. En una predicción empatada, debe estar seleccionado explícitamente.

### 10.3 Restricción de marcador exacto en penaltis

La comparación exacta usa el marcador tras 90/120 minutos, sin incluir el tanteo de la tanda. La tanda solo determina `winnerTeamId`.

---

## 11. Pruebas automatizadas mínimas

### Grupos

- Victoria, empate y derrota actualizan 3/1/0 correctamente.
- Dos equipos empatados a puntos se resuelven por head-to-head.
- Tres equipos empatados usan la mini-liga.
- Tras separar un equipo, los restantes siguen el orden reglamentario sin reiniciar indebidamente.
- Team conduct y ranking FIFA resuelven los últimos casos.

### Terceros

- Ordena por puntos, DG, GF, conduct y ranking FIFA.
- Selecciona exactamente 8 de 12.
- Usa la fila correcta de `third_place_combinations` para al menos 10 combinaciones de referencia, incluida `EFGHIJKL`.
- Falla explícitamente si no encuentra la clave o si la semilla no tiene 495 filas.

### Cuadro

- M73–M88 reciben los participantes correctos.
- Cada resultado propaga su ganador al match slot correcto.
- M103 recibe perdedores de M101 y M102; M104 recibe ganadores.
- No se puede resolver un partido hijo si el padre no está finalizado.

### Predicciones

- Predicción editable antes del kickoff y bloqueada exactamente al llegar.
- Puntuación 3/1/0 de grupos.
- Puntuación por ronda de eliminatorias.
- Empate con penaltis puntúa de acuerdo con las reglas definidas.
- Corrección de resultado no duplica puntos.

---

## 12. Referencias oficiales

1. **FIFA, Regulations for the FIFA World Cup 26™ (May 2026)** — arts. 12–14 y Anexo C.  
   `https://digitalhub.fifa.com/m/636f5c9c6f29771f/original/FWC2026_regulations_EN.pdf`
2. **FIFA, FIFA World Cup 2026™ Match Schedule (10 April 2026)** — calendario, números de partido, fechas y dependencias visuales.  
   `https://digitalhub.fifa.com/asset/4b5d4417-3343-4732-9cdf-14b6662af407/FWC26-Match-Schedule_English.pdf`

Si una fuente secundaria contradice estas referencias, prevalecen las regulaciones y el calendario oficiales de FIFA.
