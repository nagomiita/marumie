import "server-only";

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Try to ensure DATABASE_URL is loaded in a variety of dev working dirs
function tryLoadEnvCandidates() {
  if (process.env.DATABASE_URL) return;

  // candidate paths relative to current working directory
  const candidates = [
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(process.cwd(), "admin/.env.local"),
    path.resolve(process.cwd(), ".env.dev"),
    path.resolve(process.cwd(), "admin/.env"),
    path.resolve(process.cwd(), "../.env.local"),
  ];

  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        // load using dotenv dynamically to avoid adding it to runtime if not needed
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const dotenv = require("dotenv");
        const res = dotenv.config({ path: p });
        console.log(`[prisma] loaded env from: ${p}`, { parsed: !!res.parsed });
        if (process.env.DATABASE_URL) return;
      }
    } catch (e) {
      // ignore and continue
    }
  }
}

tryLoadEnvCandidates();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
