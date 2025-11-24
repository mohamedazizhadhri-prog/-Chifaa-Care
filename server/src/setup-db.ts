#!/usr/bin/env node

/**
 * Database Setup Script
 * Creates the database and runs all migrations
 */

import { execSync } from 'child_process';
import { config } from 'dotenv';
import * as readline from 'readline';

config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const DB_NAME = process.env.DB_NAME || 'rami_db';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '5432';

function execCommand(command: string, ignoreError = false): void {
  try {
    console.log(`\n▶ Running: ${command}`);
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    if (!ignoreError) {
      console.error(`\n❌ Command failed: ${command}`);
      throw error;
    }
  }
}

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  Tunisian Rami - Database Setup       ║');
  console.log('╚════════════════════════════════════════╝\n');

  console.log('Configuration:');
  console.log(`  Database: ${DB_NAME}`);
  console.log(`  Host:     ${DB_HOST}:${DB_PORT}`);
  console.log(`  User:     ${DB_USER}\n`);

  const answer = await askQuestion('Do you want to continue? (y/n): ');
  
  if (answer.toLowerCase() !== 'y') {
    console.log('Setup cancelled.');
    rl.close();
    process.exit(0);
  }

  console.log('\n📦 Step 1: Creating database...');
  
  // Try to create database (ignore error if it already exists)
  execCommand(
    `psql -U ${DB_USER} -h ${DB_HOST} -p ${DB_PORT} -c "CREATE DATABASE ${DB_NAME};"`,
    true
  );

  console.log('\n✅ Database ready');

  console.log('\n📦 Step 2: Running migrations...');
  execCommand('npm run migrate');

  console.log('\n✅ All migrations completed');

  console.log('\n📦 Step 3: Verifying setup...');
  execCommand('npm run migrate:status');

  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  ✨ Setup Complete!                    ║');
  console.log('╚════════════════════════════════════════╝\n');

  console.log('You can now start the development server:');
  console.log('  npm run dev\n');

  rl.close();
  process.exit(0);
}

main().catch((error) => {
  console.error('\n❌ Setup failed:', error.message);
  rl.close();
  process.exit(1);
});
