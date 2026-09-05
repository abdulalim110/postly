import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const prismaCliPath = fileURLToPath(
  import.meta.resolve("prisma/build/index.js"),
);
const result = spawnSync(
  process.execPath,
  [prismaCliPath, ...process.argv.slice(2)],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      // Work around prisma/prisma#29355 while keeping command output visible.
      RUST_LOG: process.env.RUST_LOG ?? "info",
    },
  },
);

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
