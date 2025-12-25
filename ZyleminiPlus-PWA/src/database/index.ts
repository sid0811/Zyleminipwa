/**
 * Database module exports
 * Main entry point for database operations
 */

export {
  initDatabase,
  getDatabase,
  saveDatabase,
  executeSql,
  executeSqlWrite,
  executeTransaction,
  closeDatabase,
  getDatabaseSize,
  startBulkOperation,
  endBulkOperation,
  type Transaction
} from './WebDatabase';

// Re-export CreateTable
export { CreateTable } from './CreateTable';

