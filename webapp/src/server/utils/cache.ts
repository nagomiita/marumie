import { unstable_cache } from "next/cache";

const isDevelopment = process.env.NODE_ENV === "development";
const DEFAULT_REVALIDATE_SECONDS = 3600;

type AsyncServerFn = (...args: any[]) => Promise<any>;

/**
 * Wraps a server function with Next.js cache in production while returning the
 * raw function in development to avoid writing to `.next/cache`.
 */
export function withServerCache<T extends AsyncServerFn>(
  fn: T,
  keyParts: string[],
  options?: Parameters<typeof unstable_cache>[2],
): T {
  if (isDevelopment) {
    return fn;
  }

  return unstable_cache(fn, keyParts, {
    revalidate: DEFAULT_REVALIDATE_SECONDS,
    ...options,
  });
}
