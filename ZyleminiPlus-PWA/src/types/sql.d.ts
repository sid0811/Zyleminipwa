// Type augmentation for sql.js
// sql.js has incomplete type definitions, so we augment them here

declare module 'sql.js' {
  export interface Database {
    /**
     * Export the database to a Uint8Array
     */
    export(): Uint8Array;
    
    /**
     * Execute SQL statements
     */
    exec(sql: string, params?: any[]): QueryExecResult[];
    
    /**
     * Prepare an SQL statement
     */
    prepare(sql: string): Statement;
    
    /**
     * Close the database
     */
    close(): void;
    
    /**
     * Get the number of rows modified by the last INSERT, UPDATE or DELETE statement
     * Note: sql.js doesn't have this method, use changes() function instead
     */
    // getRowsModified(): number; // Not available in sql.js
  }

  export interface Statement {
    /**
     * Bind parameters to the prepared statement
     */
    bind(values?: any[]): boolean;
    
    /**
     * Execute the prepared statement and fetch the next row
     */
    step(): boolean;
    
    /**
     * Get the result as an object
     */
    getAsObject(params?: any): any;
    
    /**
     * Free the prepared statement
     */
    free(): void;
    
    /**
     * Reset the prepared statement
     */
    reset(): void;
  }

  export interface QueryExecResult {
    columns: string[];
    values: any[][];
  }

  export interface SqlJsStatic {
    Database: new (data?: ArrayLike<number> | Buffer) => Database;
  }

  export default function initSqlJs(config?: {
    locateFile?: (file: string) => string;
  }): Promise<SqlJsStatic>;
}

