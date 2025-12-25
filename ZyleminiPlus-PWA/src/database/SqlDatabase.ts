/**
 * SqlDatabase.ts - PWA Compatibility Layer
 * 
 * This file re-exports all functions from WebDatabaseHelpers.ts
 * to maintain backward compatibility with existing imports.
 * 
 * All database operations use the PWA-compatible WebDatabase implementation.
 */

// Re-export everything from WebDatabaseHelpers
export * from './WebDatabaseHelpers';

// Explicitly export SqlDB and createTables for backward compatibility
export { SqlDB, createTables } from './WebDatabaseHelpers';
