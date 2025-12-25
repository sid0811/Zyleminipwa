import initSqlJs, { Database } from 'sql.js';

let db: Database | null = null;
let SQL: any = null;

/**
 * Initialize SQLite database using sql.js
 * Uses IndexedDB for persistence
 */
export async function initDatabase(): Promise<Database> {
  if (db) {
    return db;
  }

  try {
    // Initialize SQL.js
    SQL = await initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`
    });

    // Try to load from localStorage (IndexedDB alternative)
    const savedDb = localStorage.getItem('zylemini_db');
    
    if (savedDb) {
      try {
        const buf = Uint8Array.from(atob(savedDb), c => c.charCodeAt(0));
        db = new SQL.Database(buf);
        console.log('✅ Database loaded from localStorage');
      } catch (error) {
        console.error('❌ Error loading database:', error);
        // Create new database if loading fails
        db = new SQL.Database();
        // Import createTables from WebDatabaseHelpers to avoid circular dependency
        const { createTables: createTablesHelper } = await import('./WebDatabaseHelpers');
        await createTablesHelper();
      }
    } else {
      // Create new database
      db = new SQL.Database();
      // Import createTables from WebDatabaseHelpers to avoid circular dependency
      const { createTables: createTablesHelper } = await import('./WebDatabaseHelpers');
      await createTablesHelper();
    }

    if (!db) {
      throw new Error('Failed to initialize database');
    }

    return db as Database;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

// createTables is now in WebDatabaseHelpers.ts to avoid circular dependencies
// This function is kept for backward compatibility but delegates to WebDatabaseHelpers
export async function createTables() {
  const { createTables: createTablesHelper } = await import('./WebDatabaseHelpers');
  return createTablesHelper();
}

/**
 * Get the database instance
 */
export function getDatabase(): Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

// Flag to prevent saving during bulk operations
let isBulkOperation = false;
let saveTimeout: NodeJS.Timeout | null = null;

/**
 * Save database to localStorage (IndexedDB alternative)
 * Uses debouncing to prevent too many rapid saves
 */
export function saveDatabase(immediate: boolean = false) {
  if (!db) return;
  
  // Clear existing timeout if debouncing
  if (saveTimeout && !immediate) {
    clearTimeout(saveTimeout);
  }
  
  const performSave = () => {
    if (!db) return;
    
    try {
      const data = db.export();
      // Check if data is too large (localStorage has ~5-10MB limit)
      if (data.length > 4 * 1024 * 1024) { // 4MB limit
        console.warn('⚠️ Database too large to save to localStorage:', data.length);
        return;
      }
      
      // Use Array.from for large arrays to avoid stack overflow
      // Convert Uint8Array to base64 more safely for large arrays
      // Process in chunks to avoid stack overflow
      const chunkSize = 8192;
      let binaryString = '';
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, Math.min(i + chunkSize, data.length));
        binaryString += String.fromCharCode.apply(null, Array.from(chunk));
      }
      const base64 = btoa(binaryString);
      localStorage.setItem('zylemini_db', base64);
      console.log('💾 Database saved to localStorage');
    } catch (error) {
      console.error('❌ Error saving database:', error);
    }
  };
  
  // If immediate or bulk operation, save right away
  if (immediate || isBulkOperation) {
    performSave();
  } else {
    // Debounce saves to prevent stack overflow
    saveTimeout = setTimeout(performSave, 100);
  }
}

/**
 * Start bulk operation (disables auto-save during operation)
 */
export function startBulkOperation() {
  isBulkOperation = true;
}

/**
 * End bulk operation (saves database once)
 */
export function endBulkOperation() {
  isBulkOperation = false;
  saveDatabase(true); // Save immediately after bulk operation
}

/**
 * Execute SQL query and return results
 * Wrapper to match existing API pattern
 */
export function executeSql(query: string, params: any[] = []): any[] {
  const database = getDatabase();
  
  try {
    const stmt = database.prepare(query);
    stmt.bind(params);
    
    const results: any[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    
    return results;
  } catch (error) {
    console.error('❌ SQL Error:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  }
}

/**
 * Execute SQL query without returning results (INSERT, UPDATE, DELETE)
 */
export function executeSqlWrite(query: string, params: any[] = []): number {
  const database = getDatabase();
  
  try {
    const stmt = database.prepare(query);
    stmt.bind(params);
    stmt.step();
    stmt.free();
    // sql.js doesn't have getRowsModified, return 1 for success
    const changes = 1;
    saveDatabase(); // Auto-save after write
    return changes;
  } catch (error) {
    console.error('❌ SQL Write Error:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  }
}

/**
 * Execute transaction (sql.js doesn't have explicit transactions, but we can wrap)
 * Returns a Promise to match React Native SQLite behavior
 */
export function executeTransaction(callback: (tx: Transaction) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const database = getDatabase();
      
      const tx: Transaction = {
        executeSql: (query: string, params: any[] = [], success?: (tx: Transaction, results: any) => void, error?: (tx: Transaction, err: any) => void) => {
          try {
            const results = executeSql(query, params);
            if (success) {
              // Create a mock results object similar to React Native SQLite
              const mockResults = {
                rows: {
                  length: results.length,
                  item: (index: number) => results[index],
                  _array: results
                },
                rowsAffected: results.length,
                insertId: undefined
              };
              success(tx, mockResults);
            }
          } catch (err) {
            if (error) {
              error(tx, err);
            } else {
              throw err;
            }
          }
        }
      };
      
      callback(tx);
      saveDatabase();
      resolve();
    } catch (error) {
      console.error('❌ Transaction error:', error);
      reject(error);
    }
  });
}

/**
 * Transaction interface (similar to React Native SQLite)
 */
export interface Transaction {
  executeSql: (
    query: string,
    params?: any[],
    success?: (tx: Transaction, results: any) => void,
    error?: (tx: Transaction, err: any) => void
  ) => void;
}

/**
 * Close database connection
 */
export function closeDatabase() {
  if (db) {
    saveDatabase();
    db.close();
    db = null;
  }
}

/**
 * Get database size in bytes
 */
export function getDatabaseSize(): number {
  if (!db) return 0;
  
  try {
    const data = db.export();
    return data.length;
  } catch (error) {
    console.error('❌ Error getting database size:', error);
    return 0;
  }
}

/**
 * WebDatabase class wrapper for easier usage
 */
export class WebDatabase {
  private static instance: WebDatabase | null = null;

  private constructor() {}

  static getInstance(): WebDatabase {
    if (!WebDatabase.instance) {
      WebDatabase.instance = new WebDatabase();
    }
    return WebDatabase.instance;
  }

  async execute(query: string, params: any[] = []): Promise<any[]> {
    return executeSql(query, params);
  }

  async executeWrite(query: string, params: any[] = []): Promise<number> {
    return executeSqlWrite(query, params);
  }
}

/**
 * SQLManager class - compatible with React Native implementation
 * Provides insertEntity, getEntity, and executeQuery methods
 */
export class SQLManager {
  private static instance: SQLManager | null = null;
  private dbInstance: Database | null = null;

  private constructor() {
    // Initialize database
    this.setupSql();
  }

  private async setupSql() {
    try {
      this.dbInstance = await initDatabase();
      console.log('✅ SQLManager: Database initialized successfully');
    } catch (error) {
      console.error('❌ SQLManager: Error initializing database:', error);
    }
  }

  public static getInstance(): SQLManager {
    if (!SQLManager.instance) {
      SQLManager.instance = new SQLManager();
    }
    return SQLManager.instance;
  }

  /**
   * Insert entity into database
   * Compatible with React Native SQLite pattern
   * 
   * @param query - SQL INSERT query
   * @param data - Array of data to insert (single item or multiple)
   * @param isMultipleArrayData - If true, treats data as array of objects and inserts each
   */
  public insertEntity = async (
    query: string,
    data: any[],
    isMultipleArrayData?: boolean,
  ): Promise<void> => {
    try {
      const database = getDatabase();
      
      if (isMultipleArrayData && Array.isArray(data) && data.length > 0) {
        // Insert multiple items
        const keys = Object.keys(data[0]);
        startBulkOperation(); // Batch all inserts together
        
        for (const item of data) {
          try {
            const values = keys.map(key => item[key]);
            const stmt = database.prepare(query);
            stmt.bind(values);
            stmt.step();
            stmt.free();
          } catch (error) {
            console.error('❌ Error inserting item:', error, item);
            // Continue with next item even if one fails
          }
        }
        
        endBulkOperation(); // Save once after all inserts
        console.log('✅ Inserted multiple items:', data.length);
      } else {
        // Insert single item
        const stmt = database.prepare(query);
        stmt.bind(data);
        stmt.step();
        stmt.free();
        saveDatabase(); // Save after single insert
        console.log('✅ Inserted single item');
      }
    } catch (error) {
      console.error('❌ insertEntity ERROR:', error);
      console.error('Query:', query);
      console.error('Data:', data);
      throw error;
    }
  };

  /**
   * Get entity from database
   * Compatible with React Native SQLite pattern with callback
   * 
   * @param query - SQL SELECT query
   * @param getData - Callback function that receives results array
   */
  public getEntity = (query: string, getData?: (dataArray: any[]) => void): void => {
    try {
      const results = executeSql(query, []);
      if (getData) {
        getData(results);
      }
    } catch (error) {
      console.error('❌ getEntity ERROR:', error);
      console.error('Query:', query);
      if (getData) {
        getData([]); // Return empty array on error
      }
    }
  };

  /**
   * Get entity from database (async version)
   * Returns a Promise instead of using callback
   * 
   * @param query - SQL SELECT query
   * @returns Promise with results array
   */
  public getEntityAsync = async (query: string): Promise<any[]> => {
    try {
      return executeSql(query, []);
    } catch (error) {
      console.error('❌ getEntityAsync ERROR:', error);
      console.error('Query:', query);
      return [];
    }
  };

  /**
   * Execute any SQL query
   * Compatible with React Native SQLite pattern
   * 
   * @param query - SQL query to execute
   */
  public executeQuery = async (query: string): Promise<void> => {
    try {
      const database = getDatabase();
      const stmt = database.prepare(query);
      stmt.step();
      stmt.free();
      saveDatabase();
      console.log('✅ Query executed successfully');
    } catch (error) {
      console.error('❌ executeQuery ERROR:', error);
      console.error('Query:', query);
      throw error;
    }
  };

  /**
   * Execute query with parameters
   * 
   * @param query - SQL query with parameter placeholders
   * @param params - Parameters array
   */
  public executeQueryWithParams = async (query: string, params: any[] = []): Promise<void> => {
    try {
      executeSqlWrite(query, params);
      console.log('✅ Query with params executed successfully');
    } catch (error) {
      console.error('❌ executeQueryWithParams ERROR:', error);
      console.error('Query:', query);
      console.error('Params:', params);
      throw error;
    }
  };

  /**
   * Execute multiple queries in a batch (transaction-like)
   * 
   * @param queries - Array of query strings
   */
  public executeBatch = async (queries: string[]): Promise<void> => {
    try {
      const database = getDatabase();
      startBulkOperation();
      
      for (const query of queries) {
        try {
          const stmt = database.prepare(query);
          stmt.step();
          stmt.free();
        } catch (error) {
          console.error('❌ Error in batch query:', error, query);
          // Continue with next query
        }
      }
      
      endBulkOperation();
      console.log('✅ Batch executed successfully:', queries.length, 'queries');
    } catch (error) {
      console.error('❌ executeBatch ERROR:', error);
      throw error;
    }
  };
}

/**
 * Get the current database instance
 * Alias for getDatabase() for compatibility
 */
export const SqlDB = {
  transaction: (callback: (tx: Transaction) => void) => {
    return executeTransaction(callback);
  },
  executeSql: (query: string, params?: any[]) => {
    return executeSql(query, params || []);
  }
};

/**
 * Export db1 alias for backward compatibility with native code
 */
export const db1 = SqlDB;

/**
 * Utility function: Insert data with error tolerance
 * Continues on individual row failures (matches native implementation)
 * 
 * @param tableName - Name of table for logging
 * @param data - Array of data items to insert
 * @param insertQuery - SQL INSERT query
 * @param insertParams - Function to extract parameters from data item
 * @param validationFn - Function to validate each item
 * @returns Promise with success/error counts
 */
export const insertDataWithErrorTolerance = async (
  tableName: string,
  data: any[],
  insertQuery: string,
  insertParams: (item: any) => any[],
  validationFn: (item: any) => { isValid: boolean; errorMsg?: string },
): Promise<{
  successCount: number;
  errorCount: number;
  errorDetails: string[];
}> => {
  let successCount = 0;
  let errorCount = 0;
  const errorDetails: string[] = [];

  const database = getDatabase();
  startBulkOperation(); // Batch all inserts

  for (let index = 0; index < data.length; index++) {
    const item = data[index];

    // Validate item
    const validation = validationFn(item);
    if (!validation.isValid) {
      const errorMsg = `Invalid ${tableName} item at index ${index}: ${validation.errorMsg}`;
      console.error(errorMsg, item);
      errorCount++;
      errorDetails.push(errorMsg);
      continue;
    }

    // Execute insert
    try {
      const params = insertParams(item);
      const stmt = database.prepare(insertQuery);
      stmt.bind(params);
      stmt.step();
      stmt.free();
      successCount++;
      
      if ((index + 1) % 100 === 0) {
        console.log(`✅ Inserted ${tableName} item ${index + 1}/${data.length}`);
      }
    } catch (error: any) {
      const errorMsg = `SQL error inserting ${tableName} item ${index + 1}: ${error.message}`;
      console.error(errorMsg, { item, error });
      errorCount++;
      errorDetails.push(errorMsg);
      // Continue with next item - DON'T STOP
    }
  }

  endBulkOperation(); // Save once after all inserts

  console.log(
    `📊 ${tableName} insertion summary: ${successCount} successful, ${errorCount} failed`
  );
  
  if (errorCount > 0) {
    console.warn(
      `⚠️ ${errorCount} ${tableName} items failed but continuing with successful ones`
    );
    console.warn('Failed items details:', errorDetails);
  }

  return { successCount, errorCount, errorDetails };
};

/**
 * Get all data from a table
 * Generic function to retrieve all rows from any table
 * 
 * @param tableName - Name of the table
 * @returns Promise with array of all rows
 */
export async function getAllDataFromTable(tableName: string): Promise<any[]> {
  try {
    const results = executeSql(`SELECT * FROM ${tableName}`, []);
    return results;
  } catch (error) {
    console.error(`❌ Error getting all data from ${tableName}:`, error);
    return [];
  }
}

/**
 * Get all data from Sales table (backward compatibility)
 */
export async function getAllData(): Promise<any[]> {
  return getAllDataFromTable('Sales');
}

/**
 * Get user data from user table
 */
export async function getUserData(): Promise<any[]> {
  try {
    const results = executeSql('SELECT * FROM user', []);
    return results;
  } catch (error) {
    console.error('❌ Error getting user data:', error);
    return [];
  }
}

/**
 * Delete all data from a specific table
 * 
 * @param tableName - Name of the table to clear
 */
export async function deleteAllFromTable(tableName: string): Promise<void> {
  try {
    executeSqlWrite(`DELETE FROM ${tableName}`, []);
    console.log(`✅ Deleted all data from ${tableName}`);
  } catch (error) {
    console.error(`❌ Error deleting from ${tableName}:`, error);
    throw error;
  }
}

/**
 * Clear all tables (useful for logout or re-sync)
 */
export async function clearAllTables(): Promise<void> {
  const database = getDatabase();
  
  try {
    startBulkOperation();
    
    // Get all table names
    const tables = executeSql(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
      []
    );
    
    // Delete from each table
    for (const table of tables) {
      try {
        const stmt = database.prepare(`DELETE FROM ${table.name}`);
        stmt.step();
        stmt.free();
        console.log(`✅ Cleared table: ${table.name}`);
      } catch (error) {
        console.error(`❌ Error clearing table ${table.name}:`, error);
      }
    }
    
    endBulkOperation();
    console.log('✅ All tables cleared');
  } catch (error) {
    console.error('❌ Error clearing all tables:', error);
    endBulkOperation();
    throw error;
  }
}

/**
 * Get table row count
 * 
 * @param tableName - Name of the table
 * @returns Number of rows in the table
 */
export async function getTableCount(tableName: string): Promise<number> {
  try {
    const results = executeSql(`SELECT COUNT(*) as count FROM ${tableName}`, []);
    return results[0]?.count || 0;
  } catch (error) {
    console.error(`❌ Error getting count from ${tableName}:`, error);
    return 0;
  }
}

/**
 * Check if table exists
 * 
 * @param tableName - Name of the table
 * @returns True if table exists
 */
export async function tableExists(tableName: string): Promise<boolean> {
  try {
    const results = executeSql(
      "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
      [tableName]
    );
    return results.length > 0;
  } catch (error) {
    console.error(`❌ Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

/**
 * Get database statistics (useful for debugging)
 * 
 * @returns Object with table counts
 */
export async function getDatabaseStats(): Promise<{ [tableName: string]: number }> {
  try {
    const tables = executeSql(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
      []
    );
    
    const stats: { [tableName: string]: number } = {};
    
    for (const table of tables) {
      const count = await getTableCount(table.name);
      stats[table.name] = count;
    }
    
    return stats;
  } catch (error) {
    console.error('❌ Error getting database stats:', error);
    return {};
  }
}

/**
 * Execute a raw SQL query with results
 * For advanced usage when you need direct database access
 * 
 * @param query - SQL query string
 * @param params - Query parameters
 * @returns Array of result objects
 */
export async function rawQuery(query: string, params: any[] = []): Promise<any[]> {
  return executeSql(query, params);
}

/**
 * Execute a raw SQL command (INSERT, UPDATE, DELETE)
 * For advanced usage when you need direct database access
 * 
 * @param query - SQL command string
 * @param params - Query parameters
 * @returns Number of rows affected
 */
export async function rawExecute(query: string, params: any[] = []): Promise<number> {
  return executeSqlWrite(query, params);
}

/**
 * Backup database to a base64 string
 * Can be used to save database state
 * 
 * @returns Base64 encoded database
 */
export function backupDatabase(): string | null {
  try {
    const database = getDatabase();
    const data = database.export();
    
    // Convert to base64 in chunks to avoid stack overflow
    const chunkSize = 8192;
    let binaryString = '';
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, Math.min(i + chunkSize, data.length));
      binaryString += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    return btoa(binaryString);
  } catch (error) {
    console.error('❌ Error backing up database:', error);
    return null;
  }
}

/**
 * Restore database from a base64 string
 * Can be used to restore database state
 * 
 * @param base64Data - Base64 encoded database
 * @returns True if successful
 */
export async function restoreDatabase(base64Data: string): Promise<boolean> {
  try {
    const SQL = await initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`
    });
    
    // Convert base64 to Uint8Array
    const binaryString = atob(base64Data);
    const buf = Uint8Array.from(binaryString, c => c.charCodeAt(0));
    
    // Create new database from backup
    db = new SQL.Database(buf);
    
    // Save to localStorage
    localStorage.setItem('zylemini_db', base64Data);
    
    console.log('✅ Database restored successfully');
    return true;
  } catch (error) {
    console.error('❌ Error restoring database:', error);
    return false;
  }
}

