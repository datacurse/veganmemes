
import { promises as fs } from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import type { Migration, MigrationProvider } from 'kysely';

/** Converts Windows paths to file:// URLs so Node ≥22 will import them. */
export class WinFileMigrationProvider implements MigrationProvider {
  constructor(private folder: string) { }

  async getMigrations(): Promise<Record<string, Migration>> {
    const files = await fs.readdir(this.folder);
    const out: Record<string, Migration> = {};

    for (const name of files.filter((n) => n.match(/\.[cm]?tsx?$/))) {
      const abs = path.join(this.folder, name);
      const mod = await import(pathToFileURL(abs).href);   // ← magic line
      out[name] = { up: mod.up, down: mod.down };
    }
    return out;
  }
}
