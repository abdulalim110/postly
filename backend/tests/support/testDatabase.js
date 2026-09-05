import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
export const backendRoot = path.resolve(currentDirectory, "../..");

function runPrismaCommand(arguments_, databaseUrl) {
  const result = spawnSync(
    process.execPath,
    [path.join(backendRoot, "prisma-cli.js"), ...arguments_],
    {
      cwd: backendRoot,
      encoding: "utf8",
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
      },
      windowsHide: true,
    },
  );

  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `Prisma command failed (${arguments_.join(" ")}):\n${output}`,
    );
  }

  return output;
}

export async function provisionTestDatabase(label) {
  const safeLabel = label.replaceAll(/[^a-z0-9-]/gi, "-").toLowerCase();
  const directory = await fs.mkdtemp(
    path.join(backendRoot, `.d08-${safeLabel}-`),
  );
  const databasePath = path.join(directory, "postly.db");
  const databaseUrl = `file:./${path.basename(directory)}/postly.db`;
  await fs.writeFile(databasePath, "");

  try {
    const migrationOutput = runPrismaCommand(
      ["migrate", "deploy"],
      databaseUrl,
    );
    const seedOutput = runPrismaCommand(["db", "seed"], databaseUrl);

    return {
      databasePath,
      databaseUrl,
      directory,
      migrationOutput,
      seedOutput,
    };
  } catch (error) {
    await removeTestDatabase({ directory });
    throw error;
  }
}

export async function removeTestDatabase(database) {
  const relativePath = path.relative(backendRoot, database.directory);
  const isInsideBackend =
    relativePath &&
    !relativePath.startsWith("..") &&
    !path.isAbsolute(relativePath) &&
    path.basename(database.directory).startsWith(".d08-");

  if (!isInsideBackend) {
    throw new Error(`Refusing to remove unexpected path: ${database.directory}`);
  }

  await fs.rm(database.directory, { recursive: true, force: true });
}
