# Stack Overflow Fix - Database Save Optimization

## Issue
**Error**: `RangeError: Maximum call stack size exceeded` when saving database during table creation.

## Root Cause
1. `createTables()` was calling `executeSqlWrite()` for each table
2. Each `executeSqlWrite()` was calling `saveDatabase()` immediately
3. With many tables (60+), this caused too many rapid saves
4. `saveDatabase()` was using `String.fromCharCode.apply()` on large arrays, causing stack overflow

## Solution

### 1. Bulk Operation Mode
Added `startBulkOperation()` and `endBulkOperation()` functions to:
- Disable auto-save during bulk operations
- Save only once after all operations complete

### 2. Chunked Base64 Encoding
Modified `saveDatabase()` to process large arrays in chunks:
- Processes data in 8KB chunks
- Prevents stack overflow for large databases
- More memory efficient

### 3. Direct Table Creation
Modified `createTables()` to:
- Use direct database operations instead of `executeSqlWrite()`
- Call `startBulkOperation()` before creating tables
- Call `endBulkOperation()` after all tables are created
- Save database only once at the end

### 4. Debouncing
Added debouncing to `saveDatabase()`:
- Regular saves are debounced by 100ms
- Immediate saves (during bulk operations) save right away
- Prevents too many rapid saves

## Files Modified

1. **`WebDatabase.ts`**:
   - Added `startBulkOperation()` and `endBulkOperation()` functions
   - Modified `saveDatabase()` with chunked encoding and debouncing
   - Removed duplicate `createTables()` (delegates to WebDatabaseHelpers)

2. **`WebDatabaseHelpers.ts`**:
   - Modified `createTables()` to use bulk operations
   - Uses direct database operations instead of `executeSqlWrite()`

3. **`index.ts`**:
   - Exported new bulk operation functions

## Expected Behavior

- ✅ No more stack overflow errors
- ✅ Database saves only once after all tables are created
- ✅ Faster table creation (no save overhead)
- ✅ More efficient memory usage
- ✅ Handles large databases (up to 4MB limit)

## Testing

After these fixes:
- Splash screen should load without errors
- Login should work without stack overflow
- Database operations should be faster
- No "Maximum call stack size exceeded" errors


