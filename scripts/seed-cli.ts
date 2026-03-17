/**
 * Seed CLI — Unified entry point
 * Usage: tsx scripts/seed-cli.ts --size <small|medium|full|test> [--sanitize]
 */
import { execSync } from 'child_process';
import path from 'path';

const args = process.argv.slice(2);
const sizeIdx = args.indexOf('--size');
const size = sizeIdx >= 0 ? args[sizeIdx + 1] : 'test';
const sanitize = args.includes('--sanitize');

const projectRoot = path.resolve(__dirname, '..');

if (size === 'test') {
  console.log('Running test seed (small, deterministic)...');
  execSync(`tsx ${path.join(projectRoot, 'prisma/seed-test.ts')}`, { stdio: 'inherit', cwd: projectRoot });
} else {
  const sanitizeFlag = sanitize ? ' --sanitize' : '';
  console.log(`Running large seed (size: ${size})...`);
  execSync(`tsx ${path.join(projectRoot, 'prisma/seed-large.ts')} --size ${size}${sanitizeFlag}`, { stdio: 'inherit', cwd: projectRoot });
}
