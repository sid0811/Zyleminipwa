/**
 * Database module exports
 * Main entry point for database operations
 */

// Core database functions
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
  createTables,
  type Transaction
} from './WebDatabase';

// Classes
export {
  WebDatabase,
  SQLManager,
  SqlDB,
  db1
} from './WebDatabase';

// Utility functions
export {
  insertDataWithErrorTolerance,
  getAllDataFromTable,
  getAllData,
  getUserData,
  deleteAllFromTable,
  clearAllTables,
  getTableCount,
  tableExists,
  getDatabaseStats,
  rawQuery,
  rawExecute,
  backupDatabase,
  restoreDatabase
} from './WebDatabase';

// Re-export CreateTable
export { CreateTable } from './CreateTable';

// Re-export helper functions
export * from './WebDatabaseHelpers';

