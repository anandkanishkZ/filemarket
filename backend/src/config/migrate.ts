import fs from 'fs';
import path from 'path';
import { query } from './database';
import { logger } from '../utils/logger';

async function migrate() {
  try {
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);

    // Execute each statement
    for (const statement of statements) {
      try {
        await query(statement);
        logger.info(`Executed: ${statement.substring(0, 50)}...`);
      } catch (error) {
        logger.error(`Error executing statement: ${statement.substring(0, 50)}...`);
        throw error;
      }
    }

    logger.info('Database migration completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Database migration failed:', error);
    process.exit(1);
  }
}

migrate(); 