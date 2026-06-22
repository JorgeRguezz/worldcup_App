-- Ejemplo trazable del Anexo C. No es la semilla completa de V1.
-- La semilla completa debe insertar las 495 filas antes de producción.

insert into public.third_place_combinations (
  qualifying_groups_key,
  for_1a,
  for_1b,
  for_1d,
  for_1e,
  for_1g,
  for_1i,
  for_1k,
  for_1l,
  source_option
) values (
  'EFGHIJKL',
  'E',
  'J',
  'I',
  'F',
  'H',
  'G',
  'L',
  'K',
  1
) on conflict (qualifying_groups_key) do nothing;
