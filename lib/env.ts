export function env(key: string): string {
  const value = process.env[key];
  if (value === undefined) {
    throw `${key} is undefined`;
  }
  return value;
}
