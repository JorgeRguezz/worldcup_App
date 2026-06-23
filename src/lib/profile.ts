export function normalizeDisplayName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function validateDisplayName(value: string): string | null {
  const name = normalizeDisplayName(value);
  if (name.length < 2) return 'El nombre visible debe tener al menos 2 caracteres.';
  if (name.length > 24) return 'El nombre visible no puede tener más de 24 caracteres.';
  return null;
}

export function isDisplayNameTakenError(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? '';
  return error.code === '23505' || message.includes('duplicate key') || message.includes('already exists');
}
