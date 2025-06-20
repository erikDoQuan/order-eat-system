/* eslint-disable @typescript-eslint/no-unsafe-argument */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isEqual(x: any, y: any): boolean {
  const ok = Object.keys;
  const tx = typeof x;
  const ty = typeof y;

  return x && y && tx === 'object' && tx === ty ? ok(x).length === ok(y).length && ok(x).every(key => isEqual(x[key], y[key])) : x === y;
}
