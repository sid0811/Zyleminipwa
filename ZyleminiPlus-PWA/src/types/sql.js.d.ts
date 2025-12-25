declare module 'sql.js' {
  export interface Database {
    run(sql: string, params?: any[]): void;
    exec(sql: string): { columns: string[]; values: any[][] };
    prepare(sql: string): Statement;
    close(): void;
  }

  export interface Statement {
    bind(values: any[]): void;
    step(): boolean;
    get(): any[];
    getAsObject(): any;
    reset(): void;
    free(): void;
  }

  export interface InitSqlJsStatic {
    (config?: { locateFile?: (file: string) => string }): Promise<SqlJsStatic>;
  }

  export interface SqlJsStatic {
    Database: {
      new (data?: Uint8Array): Database;
    };
  }

  const initSqlJs: InitSqlJsStatic;
  export default initSqlJs;
  export { Database };
}

