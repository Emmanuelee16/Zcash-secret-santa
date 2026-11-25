export function pair<T>(items: T[]): { a: T; b: T }[] {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.map((a, i) => ({ a, b: pool[(i + 1) % pool.length] }));
}
