export function mulberry32(seed: number) {
  return function ({ lo = 0, hi = 1 }: RngParams) {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const x = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    return x * (hi - lo) + lo;
  };
}

export interface RngParams {
  lo?: number;
  hi?: number;
}

export function hashCode(str: string): number {
  var h: number = 0;
  for (var i = 0; i < str.length; i++) {
    h = 31 * h + str.charCodeAt(i);
  }
  return h & 0xffffffff;
}

export function pairs<T>(xs: Array<T>): Array<[T, T]> {
  const pairs = [];
  for (let i = 1; i < xs.length; i++) {
    const pair: [T, T] = [xs[i - 1], xs[i]];
    pairs.push(pair);
  }
  return pairs;
}

export function isBetween(x: number, lo: number, hi: number): boolean {
  return x > lo && x < hi;
}

// convert "TRUE"/"FALSE" strings to actual booleans
export function readGoogleSheetBoolean(x?: string): boolean {
  return x?.toUpperCase() === "TRUE";
}

export function extractGoogleDriveId(url: string): string | null {
  const patterns: RegExp[] = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export async function unpackModule(modFuture: () => Promise<any>) {
  const mod: any = await modFuture();
  return mod?.default;
}
