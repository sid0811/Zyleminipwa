// Web-adapted database helper functions
// Placeholder for insertAllData and other database operations
// These will be implemented incrementally as needed

import { executeSqlWrite, executeSql, initDatabase, getDatabase } from './WebDatabase';
import { CreateTable } from './CreateTable';

/**
 * Create all database tables
 */
export const createTables = async () => {
  try {
    // Ensure database is initialized
    await initDatabase();
    
    // Import functions
    const { startBulkOperation, endBulkOperation, getDatabase } = await import('./WebDatabase');
    
    console.log('📋 Creating database tables...');
    
    // Start bulk operation to prevent saving after each table
    startBulkOperation();
    
    const database = getDatabase();
    
    // Create all tables from CreateTable directly (without going through executeSqlWrite)
    Object.values(CreateTable).forEach(query => {
      try {
        const stmt = database.prepare(query);
        stmt.step();
        stmt.free();
      } catch (error) {
        console.error('Error creating table:', error);
        // Continue with other tables even if one fails
      }
    });
    
    // End bulk operation and save once
    endBulkOperation();
    
    console.log('✅ Database tables created');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    // Make sure to end bulk operation even on error
    try {
      const { endBulkOperation } = await import('./WebDatabase');
      endBulkOperation();
    } catch (e) {
      // Ignore error if import fails
    }
    throw error;
  }
};

/**
 * Insert all data from API response
 * Basic implementation for critical tables - will be expanded incrementally
 */
export async function insertAllData(data: any) {
  const abc = await data;
  
  console.log('📥 Starting data insertion...');
  console.log('📋 Data keys:', Object.keys(abc || {}));
  
  try {
    // Ensure database is initialized
    await initDatabase();
    
    // Insert Settings (critical for app configuration)
    if (abc?.Settings?.length > 0) {
      console.log(`📊 Inserting Settings: ${abc.Settings.length} items`);
      await insertSettingData(abc.Settings);
    }
    
    // Insert PCustomer (shops) - critical for Shops screen
    if (abc?.PCustomer?.length > 0) {
      console.log(`📊 Inserting PCustomer: ${abc.PCustomer.length} items`);
      await insertPcustomer(abc.PCustomer);
    }
    
    // Insert PItem (products) - critical for Orders
    if (abc?.PItem?.length > 0) {
      console.log(`📊 Inserting PItem: ${abc.PItem.length} items`);
      await insertPItem(abc.PItem);
    }
    
    // Insert PDistributor - needed for orders and shops
    if (abc?.PDistributor?.length > 0) {
      console.log(`📊 Inserting PDistributor: ${abc.PDistributor.length} items`);
      await insertPDistributor(abc.PDistributor);
    }
    
    // Insert Sales data
    if (abc?.Sales?.length > 0) {
      console.log(`📊 Inserting Sales: ${abc.Sales.length} items`);
      await insertSalesData(abc.Sales);
    }
    
    // Insert OnlineParentArea - needed for area selection
    if (abc?.OnlineParentArea?.length > 0) {
      console.log(`📊 Inserting OnlineParentArea: ${abc.OnlineParentArea.length} items`);
      await insertOnlineParentArea(abc.OnlineParentArea);
    }
    
    // TODO: Add more tables as needed:
    // - RO_MultiEntityUser
    // - PaymentReceipt_Log
    // - Collections_Log
    // - VW_PendingOrders
    // - SalesYTD
    // - ReportControlMaster
    // - UOMMaster
    // - OrderMaster
    // - OrderDetails
    // - DiscountMaster
    // - SchemeMaster
    // - PriceListClassification
    // - PJPMaster
    // - Resources
    // - SurveyMaster
    // - Report
    // - Target
    // - And others...
    
    console.log('✅ Data insertion completed');
  } catch (error) {
    console.error('❌ Error in insertAllData:', error);
    throw error;
  }
}

/**
 * Insert Settings data
 */
async function insertSettingData(settingData: any[]) {
  if (!settingData || settingData.length === 0) {
    console.warn('insertSettingData: No data provided');
    return;
  }

  try {
    // Delete existing settings
    executeSqlWrite('DELETE FROM Settings', []);
    
    // Insert new settings
    for (const item of settingData) {
      if (item.Key && item.Value !== undefined) {
        executeSqlWrite(
          'INSERT INTO Settings(Key, Value) VALUES (?, ?)',
          [String(item.Key), String(item.Value)]
        );
      }
    }
    
    console.log(`✅ Inserted ${settingData.length} Settings records`);
  } catch (error) {
    console.error('❌ Error inserting Settings:', error);
    throw error;
  }
}

/**
 * Insert PCustomer (shops) data
 */
async function insertPcustomer(PcustomerData: any[]) {
  if (!PcustomerData || PcustomerData.length === 0) {
    console.warn('insertPcustomer: No data provided');
    return;
  }

  try {
    // Delete existing customers
    executeSqlWrite('DELETE FROM Pcustomer', []);
    
    // Insert new customers
    for (const item of PcustomerData) {
      executeSqlWrite(
        `INSERT INTO Pcustomer(CustomerId, Party, LicenceNo, IsActive, ERPCode, RouteID, RouteName, AREAID, AREA, 
          BRANCHID, BRANCH, CUSTOMERCLASSID, CUSTOMERCLASS, CUSTOMERCLASS2ID, CUSTOMERCLASS2, CUSTOMERGROUPID, 
          CUSTOMERGROUP, CUSTOMERSEGMENTID, CUSTOMERSEGMENT, CUSTOMERSUBSEGMENTID, CUSTOMERSUBSEGMENT, 
          LICENCETYPEID, LICENCETYPE, OCTROIZONEID, OCTROIZONE, Outlet_Info, DefaultDistributorId, SchemeID, 
          PriceListId, userid, Latitude, Longitude, isLatLongSynced, WeeklyOff, CreditLimit, CreditDays) 
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          String(item.CustomerId || ''),
          String(item.Party || ''),
          String(item.LicenceNo || ''),
          String(item.IsActive || ''),
          String(item.ERPCode || ''),
          String(item.RouteID || ''),
          String(item.RouteName || ''),
          String(item.AREAID || ''),
          String(item.AREA || ''),
          String(item.BRANCHID || ''),
          String(item.BRANCH || ''),
          String(item.CUSTOMERCLASSID || ''),
          String(item.CUSTOMERCLASS || ''),
          String(item.CUSTOMERCLASS2ID || ''),
          String(item.CUSTOMERCLASS2 || ''),
          String(item.CUSTOMERGROUPID || ''),
          String(item.CUSTOMERGROUP || ''),
          String(item.CUSTOMERSEGMENTID || ''),
          String(item.CUSTOMERSEGMENT || ''),
          String(item.CUSTOMERSUBSEGMENTID || ''),
          String(item.CUSTOMERSUBSEGMENT || ''),
          String(item.LICENCETYPEID || ''),
          String(item.LICENCETYPE || ''),
          String(item.OCTROIZONEID || ''),
          String(item.OCTROIZONE || ''),
          String(item.OUTLETINFO || ''),
          String(item.DefaultDistributorId || ''),
          String(item.SchemeID || ''),
          String(item.PriceListId || ''),
          String(item.userid || ''),
          String(item.Latitude || ''),
          String(item.Longitude || ''),
          String(item.isLatLongSynced || ''),
          String(item.WEEKOFF || ''),
          String(item.CreditLimit || ''),
          String(item.CreditDays || ''),
        ]
      );
    }
    
    console.log(`✅ Inserted ${PcustomerData.length} PCustomer records`);
  } catch (error) {
    console.error('❌ Error inserting PCustomer:', error);
    throw error;
  }
}

/**
 * Insert PItem (products) data
 */
async function insertPItem(PItemData: any[]) {
  if (!PItemData || PItemData.length === 0) {
    console.warn('insertPItem: No data provided');
    return;
  }

  try {
    // Delete existing items
    executeSqlWrite('DELETE FROM PItem', []);
    
    // Insert new items
    for (const item of PItemData) {
      executeSqlWrite(
        `INSERT INTO PItem(ItemId, Item, ItemAlias, BPC, BPC1, BPC2, ErpCode, Volume, ReportingQuantity, 
          MRP, PTR, BRANDID, BRAND, DIVISIONID, DIVISION, FLAVOURID, FLAVOUR, ITEMCLASSID, ITEMCLASS, 
          ITEMGROUPID, ITEMGROUP, ITEMSIZEID, ITEMSIZE, ITEMSUBGROUPID, ITEMSUBGROUP, ITEMTYPEID, ITEMTYPE, 
          ITEMSEQUENCE, Focus, IsSelectedBrand, IsSelectedBrandProduct, bottleQut, SchemeID, ScanCode, userid, GSTRate) 
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          String(item.ItemId || ''),
          String(item.Item || ''),
          String(item.ItemAlias || ''),
          String(item.BPC || ''),
          String(item.BPC1 || ''),
          String(item.BPC2 || ''),
          String(item.ErpCode || ''),
          String(item.Volume || ''),
          String(item.ReportingQuantity || ''),
          String(item.MRP || ''),
          String(item.PTR || ''),
          String(item.BRANDID || ''),
          String(item.BRAND || ''),
          String(item.DIVISIONID || ''),
          String(item.DIVISION || ''),
          String(item.FLAVOURID || ''),
          String(item.FLAVOUR || ''),
          String(item.ITEMCLASSID || ''),
          String(item.ITEMCLASS || ''),
          String(item.ITEMGROUPID || ''),
          String(item.ITEMGROUP || ''),
          String(item.ITEMSIZEID || ''),
          String(item.ITEMSIZE || ''),
          String(item.ITEMSUBGROUPID || ''),
          String(item.ITEMSUBGROUP || ''),
          String(item.ITEMTYPEID || ''),
          String(item.ITEMTYPE || ''),
          String(item.ITEMSEQUENCE || ''),
          String(item.ISFOCUS || ''),
          '',
          '',
          '0',
          String(item.SchemeID || ''),
          String(item.ScanCode || ''),
          String(item.userid || ''),
          String(item.GSTRate || ''),
        ]
      );
    }
    
    console.log(`✅ Inserted ${PItemData.length} PItem records`);
  } catch (error) {
    console.error('❌ Error inserting PItem:', error);
    throw error;
  }
}

/**
 * Insert PDistributor data
 */
async function insertPDistributor(PDistributorData: any[]) {
  if (!PDistributorData || PDistributorData.length === 0) {
    console.warn('insertPDistributor: No data provided');
    return;
  }

  try {
    // Delete existing distributors
    executeSqlWrite('DELETE FROM PDistributor', []);
    
    // Insert new distributors
    for (const item of PDistributorData) {
      executeSqlWrite(
        `INSERT INTO PDistributor(DistributorID, Distributor, DistributorAlias, ERPCode, AREAID, AREA, 
          BRANCHID, BRANCH, DISTRIBUTORGROUPID, DISTRIBUTORGROUP, IsSelectedDistributor, userid) 
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          String(item.DistributorId || ''),
          String(item.Distributor || ''),
          String(item.DistributorAlias || ''),
          String(item.ERPCode || ''),
          String(item.AREAID || ''),
          String(item.AREA || ''),
          String(item.BRANCHID || ''),
          String(item.BRANCH || ''),
          String(item.DISTRIBUTORGROUPID || ''),
          String(item.DISTRIBUTORGROUP || ''),
          '',
          String(item.userid || ''),
        ]
      );
    }
    
    console.log(`✅ Inserted ${PDistributorData.length} PDistributor records`);
  } catch (error) {
    console.error('❌ Error inserting PDistributor:', error);
    throw error;
  }
}

/**
 * Insert Sales data
 */
async function insertSalesData(SalesData: any[]) {
  if (!SalesData || SalesData.length === 0) {
    console.warn('insertSalesData: No data provided');
    return;
  }

  try {
    // Delete existing sales
    executeSqlWrite('DELETE FROM Sales', []);
    
    // Insert new sales
    for (const item of SalesData) {
      executeSqlWrite(
        `INSERT INTO Sales(UserID, DistributorID, CustomerID, Month, ItemID, Quantity, Value, user_id) 
          VALUES (?,?,?,?,?,?,?,?)`,
        [
          String(item.UserID || ''),
          String(item.DistributorID || ''),
          String(item.CustomerID || ''),
          String(item.Month || ''),
          String(item.ItemID || ''),
          String(item.Quantity || ''),
          String(item.Value || ''),
          String(item.user_id || ''),
        ]
      );
    }
    
    console.log(`✅ Inserted ${SalesData.length} Sales records`);
  } catch (error) {
    console.error('❌ Error inserting Sales:', error);
    throw error;
  }
}

/**
 * Insert OnlineParentArea data
 */
async function insertOnlineParentArea(OnlineParentAreaData: any[]) {
  if (!OnlineParentAreaData || OnlineParentAreaData.length === 0) {
    console.warn('insertOnlineParentArea: No data provided');
    return;
  }

  try {
    // Delete existing areas
    executeSqlWrite('DELETE FROM OnlineParentArea', []);
    
    // Insert new areas
    for (const item of OnlineParentAreaData) {
      executeSqlWrite(
        `INSERT INTO OnlineParentArea(AreaId, Area) VALUES (?, ?)`,
        [
          String(item.AreaId || ''),
          String(item.Area || ''),
        ]
      );
    }
    
    console.log(`✅ Inserted ${OnlineParentAreaData.length} OnlineParentArea records`);
  } catch (error) {
    console.error('❌ Error inserting OnlineParentArea:', error);
    throw error;
  }
}

/**
 * Get online parent area data
 */
export async function getOnlineParentAreaData(): Promise<any[]> {
  try {
    const query = 'SELECT AreaId, Area FROM OnlineParentArea ORDER BY Area ASC';
    const results = executeSql(query, []);
    return results;
  } catch (error) {
    console.error('Error getting online parent area data:', error);
    return [];
  }
}

/**
 * Get last sync time
 */
export async function getLastSync(): Promise<any[]> {
  try {
    const query = "SELECT Value FROM Settings WHERE Key = 'LastSync'";
    const results = executeSql(query, []);
    return results;
  } catch (error) {
    console.error('Error getting last sync:', error);
    return [{ Value: 'Never' }];
  }
}

/**
 * Get attendance for a date
 */
export async function getAttendance(date: string): Promise<any[]> {
  try {
    const query = `SELECT * FROM OrderMaster WHERE collection_type = 8 AND from_date = ?`;
    const results = executeSql(query, [date]);
    return results;
  } catch (error) {
    console.error('Error getting attendance:', error);
    return [];
  }
}

/**
 * Get attendance end day data
 */
export async function getAttendanceEndDay(date: string): Promise<any[]> {
  try {
    const query = `SELECT * FROM OrderMaster WHERE collection_type = 9 AND from_date = ?`;
    const results = executeSql(query, [date]);
    return results;
  } catch (error) {
    console.error('Error getting attendance end day:', error);
    return [];
  }
}

/**
 * Get attendance 2 (check out)
 */
export async function getAttendance2(date: string): Promise<any[]> {
  try {
    const query = `SELECT * FROM OrderMaster WHERE collection_type = 9 AND from_date = ?`;
    const results = executeSql(query, [date]);
    return results;
  } catch (error) {
    console.error('Error getting attendance 2:', error);
    return [];
  }
}

/**
 * Get total orders not synced
 */
export async function getTotalOrdersOfOrderMAsternotsync(): Promise<any[]> {
  try {
    const query = 'SELECT COUNT(*) as TotalCount FROM OrderMaster WHERE sync_flag = "N"';
    const results = executeSql(query, []);
    return results;
  } catch (error) {
    console.error('Error getting total orders not synced:', error);
    return [{ TotalCount: 0 }];
  }
}

/**
 * Get attendance settings
 */
export async function getAttendanceSettings(): Promise<any[]> {
  try {
    const query = "SELECT Value FROM Settings WHERE Key = 'AttendanceOptions'";
    const results = executeSql(query, []);
    return results;
  } catch (error) {
    console.error('Error getting attendance settings:', error);
    return [];
  }
}

/**
 * Get app side log writing setting
 */
export async function getAppsideLogWriting(): Promise<any[]> {
  try {
    const query = "SELECT Value FROM Settings WHERE Key = 'AppLogWritingEnabled'";
    const results = executeSql(query, []);
    return results;
  } catch (error) {
    console.error('Error getting app side log writing:', error);
    return [{ Value: '0' }];
  }
}

/**
 * Get apps external share flag
 */
export async function getAppsExtShare(): Promise<any[]> {
  try {
    const query = "SELECT Value FROM Settings WHERE Key = 'ExternalShare'";
    const results = executeSql(query, []);
    return results;
  } catch (error) {
    console.error('Error getting apps ext share:', error);
    return [{ Value: '0' }];
  }
}

/**
 * Get order confirm flag
 */
export async function getOrderConfirmFlag(): Promise<any[]> {
  try {
    const query = "SELECT Value FROM Settings WHERE Key = 'OrderConfirmationSignature'";
    const results = executeSql(query, []);
    return results;
  } catch (error) {
    console.error('Error getting order confirm flag:', error);
    return [{ Value: 'false' }];
  }
}

/**
 * Get for autosync setting
 */
export async function getForAutosync(): Promise<any[]> {
  try {
    const query = "SELECT Value FROM Settings WHERE Key = 'AutoSync'";
    const results = executeSql(query, []);
    return results;
  } catch (error) {
    console.error('Error getting for autosync:', error);
    return [{ Value: '0' }];
  }
}

/**
 * Get for sync on activity setting
 */
export async function getForSyncOnActivity(): Promise<any[]> {
  try {
    const query = "SELECT Value FROM Settings WHERE Key = 'SyncOnActivity'";
    const results = executeSql(query, []);
    return results;
  } catch (error) {
    console.error('Error getting for sync on activity:', error);
    return [{ Value: '0' }];
  }
}

/**
 * Get distributor master data
 */
export async function getDataDistributorMaster(): Promise<any[]> {
  try {
    const query = 'SELECT * FROM MultiEntityUser';
    const results = executeSql(query, []);
    return results;
  } catch (error) {
    console.error('Error getting distributor master:', error);
    return [];
  }
}

/**
 * Get distributor master first (for specific user)
 */
export async function getDataDistributorMasterFirst(id: number | string): Promise<any[]> {
  try {
    const query = 'SELECT * FROM MultiEntityUser WHERE UserId = ? LIMIT 1';
    const results = executeSql(query, [String(id)]);
    return results;
  } catch (error) {
    console.error('Error getting distributor master first:', error);
    return [];
  }
}

/**
 * Get outlet array route with geofence
 */
export async function getOutletArrayRouteWithGeofence(id: string): Promise<any[]> {
  try {
    // Union query for both Pcustomer and newpartyoutlet
    const query1 = `
      SELECT DISTINCT 
        CustomerId as id,
        Party as party,
        Outlet_Info as Outlet_Info,
        Latitude,
        Longitude,
        WeeklyOff as weeklyoff,
        0 as isNewParty
      FROM Pcustomer
      WHERE RouteID = ?
      UNION
      SELECT DISTINCT
        OrderID as id,
        OutletName as party,
        OutletAddress as Outlet_Info,
        Latitude,
        Longitude,
        WeeklyOff as weeklyoff,
        1 as isNewParty
      FROM newpartyoutlet
      WHERE BitID = ?
      ORDER BY party ASC
    `;
    const results = executeSql(query1, [id, id]);
    
    // Transform results to match expected format
    return results.map((item: any) => ({
      id: item.id,
      party: item.party,
      Outlet_Info: item.Outlet_Info,
      isEntered: false,
      latitude: item.Latitude || null,
      longitude: item.Longitude || null,
      weeklyoff: item.weeklyoff || null,
      isNewParty: item.isNewParty || null,
    }));
  } catch (error) {
    console.error('Error getting outlet array route with geofence:', error);
    return [];
  }
}

/**
 * Get route data
 */
export async function getRouteData(id: string | number): Promise<any[]> {
  try {
    const query = `
      SELECT RouteID, RouteName 
      FROM PJPMaster 
      WHERE userid = ?
      ORDER BY RouteName ASC
    `;
    const results = executeSql(query, [String(id)]);
    return results;
  } catch (error) {
    console.error('Error getting route data:', error);
    return [];
  }
}

/**
 * Get visit count for a date
 */
export async function getVisitcount(DATE: string): Promise<any[]> {
  try {
    const query = `
      SELECT COUNT(DISTINCT entity_id) as count 
      FROM OrderMaster 
      WHERE (collection_type = '4' AND to_date = ?) OR sync_flag = 'N'
    `;
    const results = executeSql(query, [DATE]);
    return results;
  } catch (error) {
    console.error('Error getting visit count:', error);
    return [{ count: 0 }];
  }
}

/**
 * Insert usage log
 */
export async function insertuses_log(
  menu_keys: string,
  uses_datetime: string,
  is_sync: string,
): Promise<void> {
  try {
    const query = `
      INSERT INTO uses_log (menu_keys, uses_datetime, is_sync)
      VALUES (?, ?, ?)
    `;
    executeSqlWrite(query, [String(menu_keys), String(uses_datetime), String(is_sync)]);
  } catch (error) {
    console.error('Error inserting usage log:', error);
    // Don't throw - logging should not break the app
  }
}

/**
 * Get location of outlets for geofencing
 */
export async function getLocationOfOutlets(routeId: string): Promise<any[]> {
  try {
    const query = `
      SELECT 
        CustomerId as ShopId,
        Party as ShopName,
        Latitude,
        Longitude
      FROM Pcustomer
      WHERE RouteID = ?
      UNION
      SELECT
        OrderID as ShopId,
        OutletName as ShopName,
        Latitude,
        Longitude
      FROM newpartyoutlet
      WHERE BitID = ?
    `;
    const results = executeSql(query, [routeId, routeId]);
    return results;
  } catch (error) {
    console.error('Error getting location of outlets:', error);
    return [];
  }
}

/**
 * Get outlet info
 */
export async function getOutletInfo(id: string | number): Promise<any[]> {
  try {
    const query = `
      SELECT 
        distinct CustomerId as id,
        Party as Party,
        Outlet_Info as Outlet_Info,
        NULL as Latitude,
        NULL as Longitude,
        NULL as RegisteredOn,
        NULL as MobileNo,
        NULL as Owner,
        NULL as ShopType,
        NULL as RegistrationNo,
        NULL as ShopId,
        NULL as ContactPerson,
        NULL as ShopArea
      FROM Pcustomer
      WHERE CustomerId = ?
      UNION
      SELECT
        distinct OrderID as id,
        OutletName as Party,
        OutletAddress as Outlet_Info,
        Latitude,
        Longitude,
        AddedDate as RegisteredOn,
        ContactNo as MobileNo,
        OwnersName as Owner,
        ShopType,
        RegistrationNo,
        ShopId,
        ContactPerson,
        ShopArea
      FROM newpartyoutlet
      WHERE OrderID = ?
      ORDER BY Party ASC
    `;
    const results = executeSql(query, [String(id), String(id)]);
    return results;
  } catch (error) {
    console.error('Error getting outlet info:', error);
    return [];
  }
}

/**
 * Get distributor name for a shop
 */
export async function getDistributorname(shopId: string | number): Promise<any[]> {
  try {
    const query = `
      SELECT Distributor
      FROM PDistributor
      WHERE Distributorid IN (
        SELECT DefaultDistributorId
        FROM Pcustomer
        WHERE CustomerId = ?
      )
    `;
    const results = executeSql(query, [String(shopId)]);
    return results;
  } catch (error) {
    console.error('Error getting distributor name:', error);
    return [];
  }
}

/**
 * Select customer for distributor
 */
export async function SelectCustForDist(id: string, uid: string | number): Promise<any[]> {
  try {
    const query = `
      SELECT distinct DefaultDistributorId
      FROM Pcustomer
      WHERE CustomerId = ? AND userid = ?
    `;
    const results = executeSql(query, [id, String(uid)]);
    return results;
  } catch (error) {
    console.error('Error selecting customer for distributor:', error);
    return [];
  }
}

/**
 * Get search remark setting
 */
export async function getSearchREMARK(): Promise<any[]> {
  try {
    const query = `
      SELECT Value
      FROM Settings
      WHERE Key = 'MandatoryRemark'
    `;
    const results = executeSql(query, []);
    return results;
  } catch (error) {
    console.error('Error getting search remark:', error);
    return [];
  }
}

/**
 * Get latitude and longitude from Pcustomer
 */
export async function getLatLongInPCustomer(custId: string): Promise<any[]> {
  try {
    const query = `
      SELECT Latitude, Longitude
      FROM Pcustomer
      WHERE CustomerId = ?
    `;
    const results = executeSql(query, [custId]);
    return results;
  } catch (error) {
    console.error('Error getting lat long in PCustomer:', error);
    return [];
  }
}

/**
 * Update latitude and longitude in Pcustomer
 */
export async function updateLatLongInPCustomer(
  lat: string | number,
  long: string | number,
  isSynced: string,
  custId: string,
): Promise<void> {
  try {
    const query = `
      UPDATE Pcustomer
      SET Latitude = ?,
          Longitude = ?,
          isLatLongSynced = ?
      WHERE CustomerId = ?
    `;
    executeSqlWrite(query, [String(lat), String(long), String(isSynced), String(custId)]);
  } catch (error) {
    console.error('Error updating lat long in PCustomer:', error);
    throw error;
  }
}

/**
 * Get new single outlet to geofence
 */
export async function getNewSingleOutletToGeofence(customerId: string): Promise<any[]> {
  try {
    const query = `
      SELECT 
        CustomerId as ShopId,
        Latitude,
        Longitude,
        Party as ShopName,
        RouteID
      FROM Pcustomer
      WHERE (Latitude != 'null' AND Latitude != '' AND Latitude != '0')
        AND CustomerId = ?
    `;
    const results = executeSql(query, [customerId]);
    return results;
  } catch (error) {
    console.error('Error getting new single outlet to geofence:', error);
    return [];
  }
}

/**
 * Get order ID for shop
 */
export async function getOrderIdForShop(entity_id: string, check_date: string): Promise<any[]> {
  try {
    const query = `
      SELECT id
      FROM OrderMaster
      WHERE entity_id = ? AND check_date = ?
      ORDER BY id DESC
      LIMIT 1
    `;
    const results = executeSql(query, [entity_id, check_date]);
    return results;
  } catch (error) {
    console.error('Error getting order ID for shop:', error);
    return [];
  }
}

/**
 * Insert record in OrderMaster for shop check-in
 */
export async function insertRecordInOrderMasterForShopCheckIn(
  id: string,
  Current_date_time: string,
  entity_type: string,
  entity_id: string | number,
  latitude: string | number,
  longitude: string | number,
  total_amount: string | number,
  from_date: string,
  to_date: string,
  collection_type: string | number,
  user_id: string | number,
  selected_flag: string,
  sync_flag: string,
  remark: string,
  check_date: string,
  DefaultDistributorId: string | number,
  ExpectedDeliveryDate: string,
  Activitystatus: string,
  activityStart: string,
  activityend: string,
  uid: string | number,
): Promise<void> {
  try {
    const query = `
      INSERT INTO OrderMaster (
        id, Current_date_time, entity_type, entity_id, latitude, longitude,
        total_amount, from_date, to_date, collection_type, user_id,
        selected_flag, sync_flag, remark, check_date, DefaultDistributorId,
        ExpectedDeliveryDate, ActivityStatus, ActivityStart, ActivityEnd, userid
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    executeSqlWrite(query, [
      String(id),
      String(Current_date_time),
      String(entity_type),
      String(entity_id),
      String(latitude),
      String(longitude),
      String(total_amount),
      String(from_date),
      String(to_date),
      String(collection_type),
      String(user_id),
      String(selected_flag),
      String(sync_flag),
      String(remark),
      String(check_date),
      String(DefaultDistributorId),
      String(ExpectedDeliveryDate),
      String(Activitystatus),
      String(activityStart),
      String(activityend),
      String(uid),
    ]);
  } catch (error) {
    console.error('Error inserting record in OrderMaster for shop check-in:', error);
    throw error;
  }
}

/**
 * Update checkout OrderMaster without start
 */
export async function updateCheckoutOrderMasterWOStart(
  orderId: string | number,
  collectiontype: string | number,
  shopId: string,
  checkDate: string,
  checkoutDatetime: string,
  latitude: string | number,
  longitude: string | number,
  remark: string,
): Promise<void> {
  try {
    const query = `
      UPDATE OrderMaster
      SET ActivityEnd = ?,
          latitude = ?,
          longitude = ?,
          remark = ?
      WHERE entity_id = ?
        AND collection_type = ?
        AND check_date = ?
        AND id = ?
    `;
    executeSqlWrite(query, [
      String(checkoutDatetime),
      String(latitude),
      String(longitude),
      String(remark),
      String(shopId),
      String(collectiontype),
      String(checkDate),
      String(orderId),
    ]);
  } catch (error) {
    console.error('Error updating checkout OrderMaster:', error);
    throw error;
  }
}

// Export database instance getter (for compatibility)
export const getDatabase = () => {
  // Return a mock object that matches the expected interface
  return {
    transaction: (callback: (tx: any) => void) => {
      // Web: Execute in a transaction-like manner
      const tx = {
        executeSql: (query: string, params: any[] = [], success?: any, error?: any) => {
          try {
            if (query.trim().toUpperCase().startsWith('SELECT')) {
              const results = executeSql(query, params);
              if (success) {
                const mockResults = {
                  rows: {
                    length: results.length,
                    item: (index: number) => results[index],
                    _array: results,
                  },
                  rowsAffected: results.length,
                  insertId: undefined,
                };
                success(tx, mockResults);
              }
            } else {
              const rowsAffected = executeSqlWrite(query, params);
              if (success) {
                const mockResults = {
                  rows: { length: 0, item: () => null, _array: [] },
                  rowsAffected,
                  insertId: undefined,
                };
                success(tx, mockResults);
              }
            }
          } catch (err) {
            if (error) {
              error(tx, err);
            } else {
              console.error('SQL Error:', err);
            }
          }
        },
      };
      callback(tx);
    },
  };
};

