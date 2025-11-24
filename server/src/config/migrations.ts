import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

interface Migration {
  id: number;
  name: string;
  executed_at: Date;
}

export class MigrationRunner {
  private pool: Pool;
  private migrationsDir: string;

  constructor(pool: Pool, migrationsDir: string) {
    this.pool = pool;
    this.migrationsDir = migrationsDir;
  }

  /**
   * Initialize migrations table if it doesn't exist
   */
  private async initMigrationsTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await this.pool.query(query);
  }

  /**
   * Get list of executed migrations
   */
  private async getExecutedMigrations(): Promise<string[]> {
    const result = await this.pool.query<Migration>(
      'SELECT name FROM migrations ORDER BY id ASC'
    );
    return result.rows.map(row => row.name);
  }

  /**
   * Get list of available migration files
   */
  private async getAvailableMigrations(): Promise<string[]> {
    const files = fs.readdirSync(this.migrationsDir);
    return files
      .filter(file => file.endsWith('.sql'))
      .sort();
  }

  /**
   * Execute a single migration
   */
  private async executeMigration(filename: string): Promise<void> {
    const filePath = path.join(this.migrationsDir, filename);
    const sql = fs.readFileSync(filePath, 'utf-8');

    // Extract only the "Up" section
    const upSection = this.extractUpSection(sql);

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      // Execute migration SQL
      await client.query(upSection);
      
      // Record migration
      await client.query(
        'INSERT INTO migrations (name) VALUES ($1)',
        [filename]
      );
      
      await client.query('COMMIT');
      console.log(`✅ Executed migration: ${filename}`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Failed to execute migration: ${filename}`);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Extract the "Up" section from migration file
   */
  private extractUpSection(sql: string): string {
    const lines = sql.split('\n');
    const upIndex = lines.findIndex(line => line.trim() === '-- Up');
    const downIndex = lines.findIndex(line => line.trim() === '-- Down');

    if (upIndex === -1) {
      return sql; // No sections, assume entire file is "up"
    }

    const endIndex = downIndex !== -1 ? downIndex : lines.length;
    return lines.slice(upIndex + 1, endIndex).join('\n');
  }

  /**
   * Run all pending migrations
   */
  async runMigrations(): Promise<void> {
    console.log('🔄 Starting database migrations...');
    
    await this.initMigrationsTable();
    
    const executedMigrations = await this.getExecutedMigrations();
    const availableMigrations = await this.getAvailableMigrations();
    
    const pendingMigrations = availableMigrations.filter(
      migration => !executedMigrations.includes(migration)
    );

    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations');
      return;
    }

    console.log(`📋 Found ${pendingMigrations.length} pending migration(s)`);

    for (const migration of pendingMigrations) {
      await this.executeMigration(migration);
    }

    console.log('✅ All migrations completed successfully');
  }

  /**
   * Rollback the last migration
   */
  async rollbackLastMigration(): Promise<void> {
    const executedMigrations = await this.getExecutedMigrations();
    
    if (executedMigrations.length === 0) {
      console.log('No migrations to rollback');
      return;
    }

    const lastMigration = executedMigrations[executedMigrations.length - 1];
    const filePath = path.join(this.migrationsDir, lastMigration);
    const sql = fs.readFileSync(filePath, 'utf-8');
    
    // Extract the "Down" section
    const downSection = this.extractDownSection(sql);

    if (!downSection.trim()) {
      throw new Error(`No rollback script found for migration: ${lastMigration}`);
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      // Execute rollback SQL
      await client.query(downSection);
      
      // Remove migration record
      await client.query(
        'DELETE FROM migrations WHERE name = $1',
        [lastMigration]
      );
      
      await client.query('COMMIT');
      console.log(`✅ Rolled back migration: ${lastMigration}`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ Failed to rollback migration: ${lastMigration}`);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Extract the "Down" section from migration file
   */
  private extractDownSection(sql: string): string {
    const lines = sql.split('\n');
    const downIndex = lines.findIndex(line => line.trim() === '-- Down');

    if (downIndex === -1) {
      return '';
    }

    return lines
      .slice(downIndex + 1)
      .map(line => line.replace(/^--\s*/, '')) // Uncomment down migration
      .join('\n');
  }

  /**
   * Get migration status
   */
  async getMigrationStatus(): Promise<void> {
    await this.initMigrationsTable();
    
    const executedMigrations = await this.getExecutedMigrations();
    const availableMigrations = await this.getAvailableMigrations();

    console.log('\n📊 Migration Status:');
    console.log('═'.repeat(50));

    for (const migration of availableMigrations) {
      const status = executedMigrations.includes(migration) ? '✅' : '⏳';
      console.log(`${status} ${migration}`);
    }

    console.log('═'.repeat(50));
    console.log(`Total: ${executedMigrations.length}/${availableMigrations.length} executed\n`);
  }
}
