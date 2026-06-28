# Mundial 2026 — calendario y árbol de la fase eliminatoria

> **Zona horaria de este documento:** hora peninsular española (**CEST, UTC+2**). En Canarias, resta una hora.
>
> **Actualizado:** 28 de junio de 2026. Los horarios se han convertido desde el calendario oficial de FIFA, publicado en horario del Este de Norteamérica (ET). FIFA indica que el calendario está sujeto a posibles cambios.

## Cómo leer el documento

- **M73**, **M74**, etc. son los identificadores oficiales de los partidos de FIFA.
- **G(Mxx)** significa “ganador del partido Mxx”.
- **P(Mxx)** significa “perdedor del partido Mxx”.
- Cada partido indica directamente a qué encuentro avanza su ganador. Esto permite construir el cuadro de manera determinista en la aplicación.
- Los partidos de la ronda de 32 ya muestran los emparejamientos confirmados tras la fase de grupos. En rondas posteriores se conservan las referencias a los ganadores de los partidos previos.

## Resumen de la ruta de avance

```text
Ronda de 32  →  Octavos  →  Cuartos  →  Semifinales  →  Final

M73 + M75  →  M90  ┐
M74 + M77  →  M89  ┘ → M97 ┐
                             ├ → M101 ┐
M83 + M84  →  M93  ┐ → M98 ┘         │
M81 + M82  →  M94  ┘                  │
                                        ├ → M104 (final)
M76 + M78  →  M91  ┐                  │
M79 + M80  →  M92  ┘ → M99 ┐         │
                             ├ → M102 ┘
M86 + M88  →  M95  ┐ → M100┘
M85 + M87  →  M96  ┘

Perdedor M101 + perdedor M102 → M103 (tercer puesto)
```

---

## Ronda de 32 (dieciseisavos)

| Partido | Fecha y hora en España | Encuentro | Estadio | Si gana, juega… |
|---|---:|---|---|---|
| **M73** | Domingo 28 jun · **21:00** | Sudáfrica vs Canadá | Los Ángeles | **M90** |
| **M74** | Lunes 29 jun · **22:30** | Alemania vs Paraguay | Boston | **M89** |
| **M75** | Martes 30 jun · **03:00** | Países Bajos vs Marruecos | Monterrey | **M90** |
| **M76** | Lunes 29 jun · **19:00** | Brasil vs Japón | Houston | **M91** |
| **M77** | Martes 30 jun · **23:00** | Francia vs Suecia | Nueva York/Nueva Jersey | **M89** |
| **M78** | Martes 30 jun · **19:00** | Costa de Marfil vs Noruega | Dallas | **M91** |
| **M79** | Miércoles 1 jul · **03:00** | México vs Ecuador | Ciudad de México | **M92** |
| **M80** | Miércoles 1 jul · **18:00** | Inglaterra vs R. D. del Congo | Atlanta | **M92** |
| **M81** | Jueves 2 jul · **02:00** | Estados Unidos vs Bosnia y Herzegovina | Área de la Bahía de San Francisco | **M94** |
| **M82** | Miércoles 1 jul · **22:00** | Bélgica vs Senegal | Seattle | **M94** |
| **M83** | Viernes 3 jul · **01:00** | Portugal vs Croacia | Toronto | **M93** |
| **M84** | Jueves 2 jul · **21:00** | España vs Austria | Los Ángeles | **M93** |
| **M85** | Viernes 3 jul · **05:00** | Suiza vs Argelia | Vancouver | **M96** |
| **M86** | Sábado 4 jul · **00:00** | Argentina vs Cabo Verde | Miami | **M95** |
| **M87** | Sábado 4 jul · **03:30** | Colombia vs Ghana | Kansas City | **M96** |
| **M88** | Viernes 3 jul · **20:00** | Australia vs Egipto | Dallas | **M95** |

---

## Octavos de final

| Partido | Fecha y hora en España | Cruce | Estadio | Si gana, juega… |
|---|---:|---|---|---|
| **M89** | Sábado 4 jul · **23:00** | G(M74) vs G(M77) | Filadelfia | **M97** |
| **M90** | Sábado 4 jul · **19:00** | G(M73) vs G(M75) | Houston | **M97** |
| **M91** | Domingo 5 jul · **22:00** | G(M76) vs G(M78) | Nueva York/Nueva Jersey | **M99** |
| **M92** | Lunes 6 jul · **02:00** | G(M79) vs G(M80) | Ciudad de México | **M99** |
| **M93** | Lunes 6 jul · **21:00** | G(M83) vs G(M84) | Dallas | **M98** |
| **M94** | Martes 7 jul · **02:00** | G(M81) vs G(M82) | Seattle | **M98** |
| **M95** | Martes 7 jul · **18:00** | G(M86) vs G(M88) | Atlanta | **M100** |
| **M96** | Martes 7 jul · **22:00** | G(M85) vs G(M87) | Vancouver | **M100** |

---

## Cuartos de final

| Partido | Fecha y hora en España | Cruce | Estadio | Si gana, juega… |
|---|---:|---|---|---|
| **M97** | Jueves 9 jul · **22:00** | G(M89) vs G(M90) | Boston | **M101** |
| **M98** | Viernes 10 jul · **21:00** | G(M93) vs G(M94) | Los Ángeles | **M101** |
| **M99** | Sábado 11 jul · **23:00** | G(M91) vs G(M92) | Miami | **M102** |
| **M100** | Domingo 12 jul · **03:00** | G(M95) vs G(M96) | Kansas City | **M102** |

---

## Semifinales

| Partido | Fecha y hora en España | Cruce | Estadio | Si gana / si pierde… |
|---|---:|---|---|---|
| **M101** | Martes 14 jul · **21:00** | G(M97) vs G(M98) | Dallas | Ganador → **M104** · Perdedor → **M103** |
| **M102** | Miércoles 15 jul · **21:00** | G(M99) vs G(M100) | Atlanta | Ganador → **M104** · Perdedor → **M103** |

---

## Partido por el tercer puesto y final

| Partido | Fecha y hora en España | Cruce | Estadio |
|---|---:|---|---|
| **M103 — tercer puesto** | Sábado 18 jul · **23:00** | P(M101) vs P(M102) | Miami |
| **M104 — final** | Domingo 19 jul · **21:00** | G(M101) vs G(M102) | Nueva York/Nueva Jersey |

---

# Camino de España

España entra como ganadora del Grupo H y tiene una ruta completamente fijada por número de partido y horario. El rival exacto de cada ronda posterior dependerá de los resultados, pero la fecha, hora y partido están predeterminados.

| Condición | Partido de España | Fecha y hora en España | Rival o procedencia del rival | Siguiente paso |
|---|---|---:|---|---|
| España disputa la ronda de 32 | **M84**: España vs Austria | Jueves 2 jul · **21:00** | Austria (2.ª del Grupo J) | Si gana → M93 |
| España gana M84 | **M93**: G(M83) vs España | Lunes 6 jul · **21:00** | Ganador de **Portugal vs Croacia** (M83) | Si gana → M98 |
| España gana M93 | **M98**: España vs G(M94) | Viernes 10 jul · **21:00** | Ganador de M94: G(Estados Unidos–Bosnia y Herzegovina) vs G(Bélgica–Senegal) | Si gana → M101 |
| España gana M98 | **M101**: G(M97) vs España | Martes 14 jul · **21:00** | Ganador de M97: G(M89) vs G(M90) | Si gana → M104; si pierde → M103 |
| España gana M101 | **M104 — final** | Domingo 19 jul · **21:00** | Ganador de M102 | Campeona del mundo si gana |
| España pierde M101 | **M103 — tercer puesto** | Sábado 18 jul · **23:00** | Perdedor de M102 | Disputa el tercer puesto |

## Camino de España, en una sola línea

```text
España–Austria (M84, jue 2 jul 21:00)
  → si gana: M93 (lun 6 jul 21:00) contra G(Portugal–Croacia)
    → si gana: M98 (vie 10 jul 21:00) contra G(M94)
      → si gana: M101 (mar 14 jul 21:00) contra G(M97)
        → si gana: Final M104 (dom 19 jul 21:00)
        → si pierde: Tercer puesto M103 (sáb 18 jul 23:00)
```

---

## Datos de implementación recomendados

Para que el cuadro se genere automáticamente, cada partido debería almacenar como mínimo:

```ts
{
  matchId: 84,
  stage: "round_of_32",
  kickoffSpain: "2026-07-02T21:00:00+02:00",
  homeSource: { type: "team", team: "Spain" },
  awaySource: { type: "team", team: "Austria" },
  winnerAdvancesTo: 93,
  loserAdvancesTo: null
}
```

Para partidos de rondas posteriores, las fuentes de los equipos deben ser referencias al ganador o perdedor de un partido anterior:

```ts
{
  matchId: 93,
  stage: "round_of_16",
  kickoffSpain: "2026-07-06T21:00:00+02:00",
  homeSource: { type: "winner_of", matchId: 83 },
  awaySource: { type: "winner_of", matchId: 84 },
  winnerAdvancesTo: 98,
  loserAdvancesTo: null
}
```

## Fuentes

- FIFA, **FIFA World Cup 2026 Match Schedule**, revisión de 28 de junio de 2026.
- FIFA, **Calendario de la fase de eliminatorias de la Copa Mundial de la FIFA 26™**.
- FIFA World Cup 2026 Hospitality, fichas de cada partido para confirmar los emparejamientos y horarios locales.
