import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/lucid'

const defaultConnection =
  env.get('DB_CONNECTION') || (env.get('DATABASE_URL') || env.get('DB_HOST') ? 'pg' : 'sqlite')

const dbConfig = defineConfig({
  /**
   * Default connection used for all queries.
   */
  connection: defaultConnection,

  connections: {
    /**
     * PostgreSQL connection (Production / Cloud / Docker).
     */
    pg: {
      client: 'pg',
      connection: env.get('DATABASE_URL')
        ? {
            connectionString: env.get('DATABASE_URL'),
            ssl: env.get('DB_SSL', false) ? { rejectUnauthorized: false } : undefined,
          }
        : {
            host: env.get('DB_HOST', '127.0.0.1'),
            port: env.get('DB_PORT', 5432),
            user: env.get('DB_USER', 'adonis'),
            password: env.get('DB_PASSWORD', 'secretpassword'),
            database: env.get('DB_DATABASE', 'sk_beringis_db'),
            ssl: env.get('DB_SSL', false) ? { rejectUnauthorized: false } : undefined,
          },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
      debug: app.inDev,
    },

    /**
     * SQLite connection (Local Development / Fallback).
     */
    sqlite: {
      client: 'better-sqlite3',
      connection: {
        filename: app.tmpPath('db.sqlite3'),
      },
      useNullAsDefault: true,
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
  },
})

export default dbConfig

