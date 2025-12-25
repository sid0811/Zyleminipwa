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

    return db;
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
    const changes = database.getRowsModified();
    stmt.free();
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
 */
export function executeTransaction(callback: (tx: Transaction) => void): void {
  const database = getDatabase();
  
  try {
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
  } catch (error) {
    console.error('❌ Transaction error:', error);
    throw error;
  }
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

