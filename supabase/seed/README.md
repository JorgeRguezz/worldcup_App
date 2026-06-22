# Semillas oficiales

Esta carpeta debe contener los datos versionados del torneo:

- 48 equipos.
- 104 partidos oficiales.
- `match_slots` del cuadro.
- 495 filas completas del Anexo C de FIFA en `third_place_combinations`.

La V1 no debe generar la tabla de terceros mediante una fórmula. Debe copiarse desde:

`https://digitalhub.fifa.com/m/636f5c9c6f29771f/original/FWC2026_regulations_EN.pdf`

El archivo `src/domain/worldCupEngine/thirdPlaceCombinations.ts` incluye validación de integridad y la fila de ejemplo `EFGHIJKL`, pero no sustituye la semilla oficial completa.
