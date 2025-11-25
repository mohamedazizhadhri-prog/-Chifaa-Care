#!/usr/bin/env node

/**
 * Database Migration CLI
 * Usage:
 *   npm run migrate        - Run all pending migrations
 *   npm run migrate:status - Check migration status
 *   npm run migrate:down   - Rollback last migration
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { pool } from './config/database';
import { MigrationRunner } from './config/migrations';

// Load environment variables
config();

const migrationsDir = resolve(__dirname, '../migrations');
const migrationRunner = new MigrationRunner(pool, migrationsDir);

const command = process.argv[2] || 'up';

async function main() {
  try {
    switch (command) {
      case 'up':
        await migrationRunner.runMigrations();
        break;

      case 'down':
        await migrationRunner.rollbackLastMigration();
        break;

      case 'status':
        await migrationRunner.getMigrationStatus();
        break;

      default:
        console.log('Unknown command:', command);
        console.log('Available commands: up, down, status');
        process.exit(1);
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    await pool.end();
    process.exit(1);
  }
}

main();
