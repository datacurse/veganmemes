import {
  DummyDriver,
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
} from 'kysely'
import { defineConfig } from 'kysely-ctl'
import { db } from '../src/lib/db'

export default defineConfig({
  kysely: db,
  destroyOnExit: true,
  migrations: {
    migrationFolder: "src/migrations",
    allowJS: false
  },
  seeds: {
    seedFolder: "src/seeds",
    allowJS: false
  }
})
