import { GROUP_LETTERS, type GroupLetter, type RankedThirdPlace, type RoundOf32ThirdPlaceMap, type TeamId, type ThirdPlaceCombination } from './types';

const DESTINATION_ALLOWED_GROUPS: Record<keyof Omit<ThirdPlaceCombination, 'qualifyingGroupsKey' | 'sourceOption'>, GroupLetter[]> = {
  for1A: ['C', 'E', 'F', 'H', 'I'],
  for1B: ['E', 'F', 'G', 'I', 'J'],
  for1D: ['B', 'E', 'F', 'I', 'J'],
  for1E: ['A', 'B', 'C', 'D', 'F'],
  for1G: ['A', 'E', 'H', 'I', 'J'],
  for1I: ['C', 'D', 'F', 'G', 'H'],
  for1K: ['D', 'E', 'I', 'J', 'L'],
  for1L: ['E', 'H', 'I', 'J', 'K'],
};

export const exampleThirdPlaceCombination: ThirdPlaceCombination = {
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

export function validateThirdPlaceCombinations(rows: ThirdPlaceCombination[], requireComplete = true): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  if (requireComplete && rows.length !== 495) errors.push(`La semilla debe tener 495 filas; tiene ${rows.length}`);

  rows.forEach((row) => {
    const keyLetters = row.qualifyingGroupsKey.split('') as GroupLetter[];
    const sortedKey = [...keyLetters].sort().join('');
    const assigned = [row.for1A, row.for1B, row.for1D, row.for1E, row.for1G, row.for1I, row.for1K, row.for1L];

    if (seen.has(row.qualifyingGroupsKey)) errors.push(`Clave duplicada: ${row.qualifyingGroupsKey}`);
    seen.add(row.qualifyingGroupsKey);
    if (keyLetters.length !== 8 || new Set(keyLetters).size !== 8) errors.push(`Clave invalida: ${row.qualifyingGroupsKey}`);
    if (sortedKey !== row.qualifyingGroupsKey) errors.push(`Clave no ordenada alfabeticamente: ${row.qualifyingGroupsKey}`);
    if (keyLetters.some((letter) => !GROUP_LETTERS.includes(letter))) errors.push(`Clave con grupo fuera de A-L: ${row.qualifyingGroupsKey}`);
    if (new Set(assigned).size !== 8 || assigned.sort().join('') !== row.qualifyingGroupsKey) {
      errors.push(`Asignaciones no coinciden con la clave: ${row.qualifyingGroupsKey}`);
    }

    (Object.keys(DESTINATION_ALLOWED_GROUPS) as Array<keyof typeof DESTINATION_ALLOWED_GROUPS>).forEach((destination) => {
      const assignedGroup = row[destination];
      if (!DESTINATION_ALLOWED_GROUPS[destination].includes(assignedGroup)) {
        errors.push(`${row.qualifyingGroupsKey}: ${destination} no permite grupo ${assignedGroup}`);
      }
    });
  });

  if (requireComplete && seen.size !== 495) errors.push(`La semilla debe tener 495 claves unicas; tiene ${seen.size}`);
  return errors;
}

function mustGet(map: Map<GroupLetter, TeamId>, groupLetter: GroupLetter): TeamId {
  const value = map.get(groupLetter);
  if (!value) throw new Error(`No hay tercero clasificado para el grupo ${groupLetter}`);
  return value;
}

export function resolveRoundOf32ThirdPlaces(
  qualifiedThirds: RankedThirdPlace[],
  combinations: ThirdPlaceCombination[],
): RoundOf32ThirdPlaceMap {
  if (qualifiedThirds.length !== 8) {
    throw new Error('La fase de grupos no tiene exactamente 8 terceros clasificados');
  }

  const thirdByGroup = new Map(qualifiedThirds.map((item) => [item.groupLetter, item.team.id]));
  const key = [...thirdByGroup.keys()].sort().join('');
  const row = combinations.find((item) => item.qualifyingGroupsKey === key);
  if (!row) throw new Error(`No existe combinacion FIFA para ${key}`);

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
