// PWA-adapted version of SqlDatabase.ts
// All business logic, queries, and function signatures preserved exactly from native
// Only database connection mechanism changed for web compatibility

import moment from 'moment';
import {CreateTable} from './CreateTable';
import {databaseName} from '../utility/utils';
import {
  AddDiscountIfPresent,
  Bank,
  BrandSearch,
  DefaultDistributorId,
  Distributor,
  DistributorData,
  IdFromOMaster,
  InfoOutletData,
  JoinPcustOMaster,
  LocationMaster,
  MultiEntityUserTable,
  NotSyncedDataCount,
  OrderPreviewBrandList,
  OutStandingDetailsCollections,
  OutletArrayData,
  OutletArrayFromShop,
  OutletArrayWithGeofenceData,
  PcustLatLong,
  QRPItem,
  RouteData,
  SettingTable,
  ShopsGelocationBody,
  SurveyMasterTable,
  TABLE_TEMP_ORDER_DETAILS,
  VisitCount,
  getAllOrdersType,
  getBrands_OP_Report,
  getDetailsItemOMaster,
  getOrderDataFromTempOrderDetailsType,
  getOutletParty_OP_Report,
  getRemarkDetails,
  getSKU_OP_Report,
  getSize_OP_Report,
  pendingDiscount,
  pendingOrderDetail,
  pendingOrders,
  presentTempOrder,
} from '../types/types';

// PWA: Import web database functions
// Note: initDatabase is imported dynamically in createTables to avoid circular dependency
import { 
  getDatabase,
  executeTransaction,
  type Transaction 
} from './WebDatabase';

// PWA: Create SqlDB compatible with native pattern
const SqlDB = {
  transaction: (callback: (tx: Transaction) => void) => {
    return executeTransaction(callback);
  }
};

const createTables = async () => {
  // Dynamic import to avoid circular dependency with WebDatabase.ts
  const { initDatabase } = await import('./WebDatabase');
  await initDatabase();
  
  // Create all tables using CreateTable definitions (same as native version)
  SqlDB.transaction(tx => {
    for (const tableName in CreateTable) {
      const createTableQuery = CreateTable[tableName];
      tx.executeSql(
        createTableQuery,
        [],
        () => {
          // Table created successfully
        },
        (_, error) => {
          console.error(`Error creating table ${tableName}:`, error);
        },
      );
    }
  });
};

export {SqlDB, createTables};

// PWA: Use SqlDB for db1 (same as native)
let db1 = SqlDB;

// Now copying ALL functions from native SqlDatabase.ts...
// ============================================================

// âœ… UTILITY FUNCTION: Insert data with error tolerance - continues on individual row failures
const insertDataWithErrorTolerance = async (
  tableName: string,
  data: any[],
  insertQuery: string,
  insertParams: (item: any) => any[],
  validationFn: (item: any) => {isValid: boolean; errorMsg?: string},
  tx: any,
): Promise<{
  successCount: number;
  errorCount: number;
  errorDetails: string[];
}> => {
  return new Promise(resolve => {
    let successCount = 0;
    let errorCount = 0;
    const errorDetails: string[] = [];

    const insertNextItem = (index: number) => {
      if (index >= data.length) {
        console.log(
          `ðŸ“Š ${tableName} insertion summary: ${successCount} successful, ${errorCount} failed`,
        );
        if (errorCount > 0) {
          console.warn(
            `âš ï¸ ${errorCount} ${tableName} items failed but continuing with successful ones`,
          );
          console.warn('Failed items details:', errorDetails);
        }
        resolve({successCount, errorCount, errorDetails});
        return;
      }

      const item = data[index];

      // Validate item data
      const validation = validationFn(item);
      if (!validation.isValid) {
        const errorMsg = `Invalid ${tableName} item at index ${index}: ${validation.errorMsg}`;
        console.error(errorMsg, item);
        errorCount++;
        errorDetails.push(errorMsg);
        insertNextItem(index + 1); // Continue with next item
        return;
      }

      // Execute insert
      tx.executeSql(
        insertQuery,
        insertParams(item),
        (tx: any, results: any) => {
          successCount++;
          console.log(
            `âœ… Inserted ${tableName} item ${index + 1}/${data.length}`,
          );
          insertNextItem(index + 1);
        },
        (tx: any, error: any) => {
          const errorMsg = `SQL error inserting ${tableName} item ${
            index + 1
          }: ${error.message}`;
          console.error(errorMsg, {item, error});
          errorCount++;
          errorDetails.push(errorMsg);
          insertNextItem(index + 1); // Continue with next item - DON'T STOP
        },
      );
    };

    // Start inserting items
    insertNextItem(0);
  });
};

export async function insertAllData(data: any) {
  const abc = await data;

  if (abc?.Settings?.length > 0) {
    await insertSettingData(abc?.Settings);
  }
  if (abc?.RO_MultiEntityUser?.length > 0) {
    await insertMultiEntityUser(abc?.RO_MultiEntityUser);
  }

  if (abc?.Sales?.length > 0) {
    await insertSalesData(abc?.Sales);
  }
  if (abc?.PaymentReceipt_Log?.length > 0) {
    await insertPaymentData(abc?.PaymentReceipt_Log);
  }
  if (abc?.Collections_Log?.length > 0) {
    await insertCollectionData(abc?.Collections_Log);
  }
  if (abc?.CollectionsDetails_Log?.length > 0) {
    await insertCollectionDeatailData(abc?.CollectionsDetails_Log);
  }

  if (abc?.VW_PendingOrders?.length > 0) {
    await insertVW_PendingOrders(abc?.VW_PendingOrders);
  }

  if (abc?.SalesYTD?.length > 0) {
    await insertSalesYTD(abc?.SalesYTD);
  }

  if (abc?.ReportControlMaster?.length > 0) {
    await insertReportControlMaster(abc?.ReportControlMaster);
  }

  if (abc?.UOMMaster?.length > 0) {
    await insertuommaster(abc?.UOMMaster);
  }

  if (abc?.OrderMaster?.length > 0) {
    await insertOrderMaster(abc?.OrderMaster);
  }
  /////////sid
  if (abc?.DiscountMaster?.length > 0) {
    await insert_DiscountMaster(abc?.DiscountMaster);
  }
  if (abc?.SchemeMaster?.length > 0) {
    await insert_SchemeMaster(abc?.SchemeMaster);
  }
  if (abc?.PriceListClassification?.length > 0) {
    await insert_PriceListClassification(abc?.PriceListClassification);
  }

  if (abc?.PJPMaster?.length > 0) {
    await insert_PJPMaster(abc?.PJPMaster);
  }

  // if (abc?.ZyleminiNewParty?.length > 0) {
  //   await insertnewpartyoutlet(abc?.ZyleminiNewParty);
  // }

  if (abc?.OrderDetails?.length > 0) {
    await insertOrderDetailsGetData(abc?.OrderDetails);
  }

  if (abc?.Resources?.length > 0) {
    await insertResources(abc?.Resources);
  }

  if (abc?.OnlineParentArea?.length > 0) {
    await insertOnlineParentArea(abc?.OnlineParentArea);
  }

  if (abc?.AssetPlacementVerification?.length > 0) {
    await insertAssetData1(abc?.AssetPlacementVerification);
  }

  if (abc?.AssetTypeClassificationList?.length > 0) {
    await insertoutletAssetTypeClassificationList(
      abc?.AssetTypeClassificationList,
    );
  }

  if (abc?.DistributorDataStatus?.length > 0) {
    await insertDistributorDataStatus(abc?.DistributorDataStatus);
  }

  if (abc?.DistributorContacts?.length > 0) {
    await insertDistributorContacts(abc?.DistributorContacts);
  }
  /////
  if (abc?.OutletAssetInformation?.length > 0) {
    await insertoutletAssetInformation(abc?.OutletAssetInformation);
  }

  if (abc?.SurveyMaster?.length > 0) {
    await insertSurveyMaster(abc?.SurveyMaster);
  }

  if (abc?.Report?.length > 0) {
    await insertReport(abc?.Report);
  }

  if (abc?.PCustomer?.length > 0) {
    await insertPcustomer(abc?.PCustomer);
  }
  if (abc?.PDistributor?.length > 0) {
    await insertPDistributor(abc?.PDistributor);
  }
  if (abc?.PItem?.length > 0) {
    await insertPItem(abc?.PItem);
  }

  if (abc?.Target?.length > 0) {
    await insertTargetData(abc?.Target);
  }
  //if for mjp
  if (abc?.MJPMaster?.length > 0) {
    await insertMJPMaster(abc?.MJPMaster);
  }

  if (abc?.MJPMasterDetails?.length > 0) {
    await insertMJPMasterDetails(abc?.MJPMasterDetails);
  }

  if (abc?.SubGroupMaster?.length > 0) {
    await insertSubGroupMaster(abc?.SubGroupMaster);
  }

  ////added by vibha 22Jan
  if (abc?.SchemeDetails?.length > 0) {
    await insertSchemeDetails_data(abc?.SchemeDetails);
  }
  //Aftab change 02/08/2021
  if (abc?.OutstandingDetails?.length > 0) {
    await insert_OutstandingDetails(abc?.OutstandingDetails);
  }
  //Aftab change 12/08/2021
  if (abc?.ChequeReturnDetails?.length > 0) {
    await insert_ChequeReturnDetails(abc?.ChequeReturnDetails);
  }

  //New party
  if (abc?.ZyleminiNewParty?.length > 0) {
    await delete_ZyleminiNewParty(abc?.ZyleminiNewParty);
  }

  //RO_BankCustomer
  if (abc?.RO_BankCustomer?.length > 0) {
    await insertRO_BankCustomer(abc?.RO_BankCustomer);
  } else {
    await deleteRO_BankCustomer();
  }
  // if (abc?.PendingOrdersDiscount) {
  //     //console.log("in sales insert")
  //     let pendingOrdersDiscount = abc?.PendingOrdersDiscount;
  //     insertPendingOrdersDiscount(pendingOrdersDiscount);
  // }

  // if (abc?.PendingOrdersDetails) {
  //     //console.log("in sales insert")
  //     let pendingOrdersDetails = abc?.PendingOrdersDetails;
  //     insertPendingOrdersDetails(pendingOrdersDetails);
  // }

  // if (abc?.PendingOrdersMaster) {
  //     //console.log("in sales insert")
  //     let pendingOrdersMaster = abc?.PendingOrdersMaster;
  //     insertPendingOrdersMaster(pendingOrdersMaster);
  // }

  // if (abc?.CollectionType?.length > 0) {
  //   let CollectionType = (abc?.CollectionType)
  //   insertCollectionType(CollectionType)
  // }

  // if (abc?.Discount?.length > 0) {
  //   let Discount = (abc?.Discount)
  //   insertDiscount(Discount)
  // }
}

//Aftab changes 02/08/2021
export async function insert_OutstandingDetails(OutstandingDetails: any) {
  db1.transaction(tx => {
    tx.executeSql('DELETE from OutstandingDetails', [], (tx, results) => {
      for (let i = 0; i < OutstandingDetails?.length; i++) {
        tx.executeSql(
          `insert into OutstandingDetails(ID , PartyCode , Document , Date ,DisPactchDate ,Amount,OSAmount,OSDocument,InvoiceDate,DiscountAc,PdcAmt,PdcDate,CDStatus,Narration,TpNo,LedgerCode,CDPercentage,ChqNo,PayslipNo,ReceivedAmt,Lag,UnAllocated,NetOsAmt,VhrNo ,PartyName,Location,userid) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            String(OutstandingDetails[i].ID),
            String(OutstandingDetails[i].PartyCode),
            String(OutstandingDetails[i].Document),
            String(OutstandingDetails[i].Date),
            String(OutstandingDetails[i].DisPactchDate),
            String(OutstandingDetails[i].Amount),
            String(OutstandingDetails[i].OSAmount),
            String(OutstandingDetails[i].OSDocument),
            String(OutstandingDetails[i].InvoiceDate),
            String(OutstandingDetails[i].DiscountAc),
            String(OutstandingDetails[i].PdcAmt),
            String(OutstandingDetails[i].PdcDate),
            String(OutstandingDetails[i].CDStatus),
            String(OutstandingDetails[i].Narration),
            String(OutstandingDetails[i].TpNo),
            String(OutstandingDetails[i].LedgerCode),
            String(OutstandingDetails[i].CDPercentage),
            String(OutstandingDetails[i].ChqNo),
            String(OutstandingDetails[i].PayslipNo),
            String(OutstandingDetails[i].ReceivedAmt),
            String(OutstandingDetails[i].Lag),
            String(OutstandingDetails[i].UnAllocated),
            String(OutstandingDetails[i].NetOsAmt),
            String(OutstandingDetails[i].VhrNo),
            String(OutstandingDetails[i].PartyName),
            String(OutstandingDetails[i].Location),
            String(OutstandingDetails[i].userid),
          ],
          (tx, results) => {},
          err => {
            console.log('os error -->', err);
          },
        );
      }
    });
  });
}

//Aftab changes 02/08/2021
export async function insert_ChequeReturnDetails(ChequeReturnDetails: any) {
  db1.transaction(tx => {
    tx.executeSql('DELETE from ChequeReturnDetails', [], (tx, results) => {
      for (let i = 0; i < ChequeReturnDetails?.length; i++) {
        tx.executeSql(
          `insert into ChequeReturnDetails(ID , PartyCode , ReceiptNo , ReceiptDate ,ChqNo ,ChqDate,ChqAmt,BankName,Branch,BounceDate,userid) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
          [
            String(ChequeReturnDetails[i].ID),
            String(ChequeReturnDetails[i].PartyCode),
            String(ChequeReturnDetails[i].ReceiptNo),
            String(ChequeReturnDetails[i].ReceiptDate),
            String(ChequeReturnDetails[i].ChqNo),
            String(ChequeReturnDetails[i].ChqDate),
            String(ChequeReturnDetails[i].ChqAmt),
            String(ChequeReturnDetails[i].BankName),
            String(ChequeReturnDetails[i].Branch),
            String(ChequeReturnDetails[i].BounceDate),
            String(ChequeReturnDetails[i].userid),
          ],
          (tx, results) => {},
          err => {},
        );
      }
    });
  });
}
///////////////////////////

////////////
export async function insert_DiscountMaster(DiscountMaster: any) {
  db1.transaction(tx => {
    tx.executeSql('DELETE from DiscountMaster', [], (tx, results) => {
      for (let i = 0; i < DiscountMaster?.length; i++) {
        tx.executeSql(
          `insert into DiscountMaster(ID, Code , DT_DESC, userid) VALUES (?,?,?,?)`,
          [
            String(DiscountMaster[i].ID),
            String(DiscountMaster[i].Code),
            String(DiscountMaster[i].DT_DESC),
            String(DiscountMaster[i].userid),
          ],
          (tx, results) => {},
          err => {},
        );
      }
    });
  });
}

export async function insert_PriceListClassification(
  PriceListClassification: any,
) {
  db1.transaction(tx => {
    tx.executeSql('DELETE from PriceListClassification', [], (tx, results) => {
      for (let i = 0; i < PriceListClassification?.length; i++) {
        tx.executeSql(
          `insert into PriceListClassification(ClassificationId,ItemId,Price,DistributorId,userid) VALUES (?,?,?,?,?)`,
          [
            String(PriceListClassification[i].ClassificationId),
            String(PriceListClassification[i].ItemId),
            String(PriceListClassification[i].Price),
            String(PriceListClassification[i].DistributorId),
            String(PriceListClassification[i].userid),
          ],
          (tx, results) => {},
          err => {},
        );
      }
    });
  });
}
export async function insert_SchemeMaster(SchemeMaster: any) {
  db1.transaction(tx => {
    tx.executeSql('DELETE from SchemeMaster', [], (tx, results) => {
      for (let i = 0; i < SchemeMaster?.length; i++) {
        tx.executeSql(
          `insert into SchemeMaster(ID, Code, DT_DESC, userid) VALUES (?,?,?,?)`,
          [
            String(SchemeMaster[i].ID),
            String(SchemeMaster[i].Code),
            String(SchemeMaster[i].DT_DESC),
            String(SchemeMaster[i].userid),
          ],
          (tx, results) => {},
          err => {},
        );
      }
    });
  });
}
//
export async function insert_PJPMaster(PJPMaster: any) {
  db1.transaction(tx => {
    tx.executeSql('DELETE from PJPMaster', [], (tx, results) => {
      for (let i = 0; i < PJPMaster?.length; i++) {
        tx.executeSql(
          `insert into PJPMaster(RouteID, RouteName, userid) VALUES (?,?,?)`,
          [
            String(PJPMaster[i].RouteID),
            String(PJPMaster[i].RouteName),
            String(PJPMaster[i].userid),
          ],
          (tx, results) => {},
          err => {},
        );
      }
    });
  });
}
//////////////////////
export async function insert_uses_logMaster(uses_log_data: any) {
  // Validate input data first
  if (!uses_log_data || uses_log_data.length === 0) {
    console.warn('insert_uses_logMaster: No data provided, skipping operation');
    return;
  }

  return new Promise<void>((resolve, reject) => {
    db1.transaction(
      tx => {
        try {
          // Step 1: Create backup of existing uses_log data
          tx.executeSql(
            'CREATE TEMPORARY TABLE uses_log_Backup AS SELECT * FROM uses_log',
            [],
            (tx, results) => {
              console.log('Backup created for uses_log');

              // Step 2: Delete old data
              tx.executeSql('DELETE from uses_log', [], (tx, results) => {
                console.log(
                  `Deleted ${results.rowsAffected} old uses_log records`,
                );

                // Step 3: Insert new data with error tracking
                let successCount = 0;
                let errorCount = 0;

                const insertNextItem = (index: number) => {
                  if (index >= uses_log_data.length) {
                    // All items processed
                    if (successCount === uses_log_data.length) {
                      // All successful - drop backup and resolve
                      tx.executeSql(
                        'DROP TABLE uses_log_Backup',
                        [],
                        (tx, results) => {
                          console.log(
                            `âœ… Successfully inserted ${successCount} uses_log records`,
                          );
                          resolve();
                        },
                        (tx, error) => {
                          console.warn(
                            'Warning: Could not drop backup table:',
                            error,
                          );
                          resolve(); // Still resolve since main operation succeeded
                        },
                      );
                    } else {
                      // Some failed - restore from backup
                      console.error(
                        `âŒ Only ${successCount}/${uses_log_data.length} inserts succeeded. Restoring backup...`,
                      );
                      tx.executeSql(
                        'DELETE from uses_log',
                        [],
                        (tx, results) => {
                          tx.executeSql(
                            'INSERT INTO uses_log SELECT * FROM uses_log_Backup',
                            [],
                            (tx, results) => {
                              tx.executeSql(
                                'DROP TABLE uses_log_Backup',
                                [],
                                (tx, results) => {
                                  reject(
                                    new Error(
                                      `Failed to insert uses_log: Only ${successCount}/${uses_log_data.length} succeeded`,
                                    ),
                                  );
                                },
                                (tx, error) => {
                                  reject(
                                    new Error(
                                      `Failed to insert uses_log: Only ${successCount}/${uses_log_data.length} succeeded`,
                                    ),
                                  );
                                },
                              );
                            },
                            (tx, error) => {
                              reject(
                                new Error(
                                  `Failed to restore uses_log from backup: ${error.message}`,
                                ),
                              );
                            },
                          );
                        },
                        (tx, error) => {
                          reject(
                            new Error(
                              `Failed to clear uses_log before restore: ${error.message}`,
                            ),
                          );
                        },
                      );
                    }
                    return;
                  }

                  const item = uses_log_data[index];

                  // Validate item data
                  if (!item.MenuKeys || !item.UsageDateTime) {
                    console.error('Invalid uses_log item:', item);
                    errorCount++;
                    insertNextItem(index + 1);
                    return;
                  }

                  tx.executeSql(
                    `INSERT INTO uses_log(menu_keys,uses_datetime,is_sync) VALUES (?,?,?)`,
                    [
                      String(item.MenuKeys),
                      String(item.UsageDateTime),
                      String('True'),
                    ],
                    (tx, results) => {
                      successCount++;
                      console.log(
                        `Inserted uses_log item ${index + 1}/${
                          uses_log_data.length
                        }`,
                      );
                      insertNextItem(index + 1);
                    },
                    (tx, error) => {
                      errorCount++;
                      console.error(
                        `Error inserting uses_log item ${index + 1}:`,
                        error,
                      );
                      insertNextItem(index + 1);
                    },
                  );
                };

                // Start inserting items
                insertNextItem(0);
              });
            },
            (tx, error) => {
              console.error('Error creating backup:', error);
              reject(new Error(`Failed to create backup: ${error.message}`));
            },
          );
        } catch (error: any) {
          console.error('Transaction error in insert_uses_logMaster:', error);
          reject(error);
        }
      })
      .catch((error: any) => {
        console.error('Transaction failed in insert_uses_logMaster:', error);
        reject(error);
      })
      .then(() => {
        console.log('Transaction completed in insert_uses_logMaster');
      });
  });
}

//Shankar changes 04/02/2025
export async function GetOutstandingDetails_Data(uid: string) {
  return new Promise<OutStandingDetailsCollections[]>(resolve => {
    let query =
      'select ID, PartyCode,Document, max(date)as Date, sum(OSAllAmount)as OSAmount, DisPactchDate,sum(Amount)as Amount ,OSDocument,InvoiceDate,DiscountAc,PdcAmt,PdcDate,CDStatus ,Narration,TpNo,LedgerCode,CDPercentage ,ChqNo,PayslipNo,ReceivedAmt,Lag,UnAllocated,NetOsAmt,VhrNo,PartyName,Location from (SELECT CASE  when AllMinusOS.AlMinusAmount is NULL then OSAmount else OSAmount-AllMinusOS.AlMinusAmount end as OSAllAmount,* FROM OutstandingDetails LEFT join (select  ifnull(sum(MinusOS.AlAmount),0) as AlMinusAmount, InvoiceCode from (select  sum(AllocatedAmount) as AlAmount, InvoiceCode from TX_Collections group by InvoiceCode UNION select  sum(amount) as AlAmount,InvoiceCode from TX_CollectionsDetails group by CollectionID) as MinusOS group by InvoiceCode) as AllMinusOS ON  OutstandingDetails.Document = AllMinusOS.InvoiceCode where ifnull(OSAmount,0)-ifnull(AllMinusOS.AlMinusAmount,0) >0) as OutStandingFinalAmount where OSAmount>0 and userid= "' +
      uid +
      '" group by partycode';

    // console.log('Query for the GetOutstandingDetails_Data', query);

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let temp = [];
        for (let i = 0; i < results.rows.length; i++) {
          temp.push(results.rows.item(i));
        }
        resolve(temp);
      });
    });
  });
}

//Shankar changes 04/02/2025
export async function GetOutstandingDetails_Data_Shops(
  uid: string,
  shopId: any,
) {
  return new Promise<OutStandingDetailsCollections[]>(resolve => {
    let query =
      'select ID, PartyCode,Document, max(date)as Date, sum(OSAllAmount)as OSAmount, DisPactchDate,sum(Amount)as Amount ,OSDocument,InvoiceDate,DiscountAc,PdcAmt,PdcDate,CDStatus ,Narration,TpNo,LedgerCode,CDPercentage ,ChqNo,PayslipNo,ReceivedAmt,Lag,UnAllocated,NetOsAmt,VhrNo,PartyName,Location from (SELECT CASE  when AllMinusOS.AlMinusAmount is NULL then OSAmount else OSAmount-AllMinusOS.AlMinusAmount end as OSAllAmount,* FROM OutstandingDetails LEFT join (select  ifnull(sum(MinusOS.AlAmount),0) as AlMinusAmount, InvoiceCode from (select  sum(AllocatedAmount) as AlAmount, InvoiceCode from TX_Collections group by InvoiceCode UNION select  sum(amount) as AlAmount,InvoiceCode from TX_CollectionsDetails group by CollectionID) as MinusOS group by InvoiceCode) as AllMinusOS ON  OutstandingDetails.Document = AllMinusOS.InvoiceCode where ifnull(OSAmount,0)-ifnull(AllMinusOS.AlMinusAmount,0) >0) as OutStandingFinalAmount where OSAmount>0 and userid= "' +
      uid +
      '" and PartyCode= "' +
      shopId +
      '" group by partycode';

    // console.log('Query for the GetOutstandingDetails_Data', query);

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let temp = [];
        for (let i = 0; i < results.rows.length; i++) {
          temp.push(results.rows.item(i));
        }
        resolve(temp);
      });
    });
  });
}
export async function GetOutstandingDetails_Data1(
  PartyCode: string | number,
  uid: string | number,
) {
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        // "SELECT * FROM OutstandingDetails where PartyCode='" +
        //     PartyCode +
        //     "' and OSAmount > 0",
        'SELECT CASE when AllMinusOS.AlMinusAmount is NULL then OSAmount else OSAmount-AllMinusOS.AlMinusAmount end as OSAmount,ID, PartyCode,Document,Date,DisPactchDate,Amount,  OSDocument,InvoiceDate,DiscountAc, PdcAmt ,PdcDate ,CDStatus ,Narration ,TpNo ,LedgerCode ,CDPercentage ,ChqNo ,PayslipNo ,ReceivedAmt ,Lag ,UnAllocated ,NetOsAmt ,VhrNo ,PartyName ,Location  FROM OutstandingDetails LEFT join (select  ifnull(sum(MinusOS.AlAmount),0) as AlMinusAmount, InvoiceCode from  (select  sum(AllocatedAmount) as AlAmount, InvoiceCode from TX_Collections group by InvoiceCode UNION select  sum(amount) as AlAmount,InvoiceCode  from TX_CollectionsDetails group by CollectionID) as MinusOS group by InvoiceCode) as AllMinusOS ON  OutstandingDetails.Document = AllMinusOS.InvoiceCode where ifnull(OSAmount,0)-ifnull(AllMinusOS.AlMinusAmount,0) >0 and OSAmount>0 and partycode ="' +
          PartyCode +
          '" and userid = "' +
          uid +
          '"',
        [],
        (tx, results) => {
          let temp = [];
          for (let i = 0; i < results.rows.length; i++) {
            temp.push(results.rows.item(i));
          }
          resolve(temp);
        },
      );
    });
  });
}
export async function GetRemarkDetails(PartyCode: string) {
  // CHANGED * TO THIS NEW SELECT STATEMENT
  return new Promise<getRemarkDetails[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        "SELECT ExpectedDeliveryDate, ActivityStart, ActivityEnd, remark FROM OrderMaster  where remark IS NOT NULL and remark != '' and collection_type ='4' and entity_id='" +
          PartyCode +
          "' group by ActivityEnd",
        [],
        (tx, results) => {
          let temp = [];
          for (let i = 0; i < results.rows.length; i++) {
            temp.push(results.rows.item(i));
          }
          resolve(temp);
        },
      );
    });
  });
}
//Shankar changes 06/08/2021
export async function GetAllPandingInvoice(PartyCode: string) {
  console.log('query 17sep', PartyCode);
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        // "SELECT * FROM OutstandingDetails where PartyCode='" +
        //     PartyCode +
        //     "' and OSAmount > 0",
        "SELECT CASE when AllMinusOS.AlMinusAmount is NULL then OSAmount else OSAmount-AllMinusOS.AlMinusAmount end as OSAmount,ID, PartyCode,Document,Date,DisPactchDate,Amount,  OSDocument,InvoiceDate,DiscountAc, PdcAmt ,PdcDate ,CDStatus ,Narration ,TpNo ,LedgerCode ,CDPercentage ,ChqNo ,PayslipNo ,ReceivedAmt ,CASE WHEN Lag != 'null' AND Lag != '' THEN CAST(Lag AS INTEGER) ELSE 0 END AS Lag ,UnAllocated ,NetOsAmt ,VhrNo ,PartyName ,Location  FROM OutstandingDetails LEFT join (select  ifnull(sum(MinusOS.AlAmount),0) as AlMinusAmount, InvoiceCode from  (select  sum(AllocatedAmount) as AlAmount, InvoiceCode from TX_Collections group by InvoiceCode UNION select  sum(amount) as AlAmount,InvoiceCode  from TX_CollectionsDetails group by CollectionID) as MinusOS group by InvoiceCode) as AllMinusOS ON  OutstandingDetails.Document = AllMinusOS.InvoiceCode where ifnull(OSAmount,0)-ifnull(AllMinusOS.AlMinusAmount,0) >0 and OSAmount>0 and partycode ='" +
          PartyCode +
          "' order by Lag DESC",
        [],
        (tx, results) => {
          // tx.executeSql("SELECT * FROM OutstandingDetails where VhrNo='" + VhrNo +"'", [], (tx, results) => {
          let temp = [];
          for (let i = 0; i < results.rows.length; i++) {
            temp.push(results.rows.item(i));
          }
          resolve(temp);
        },
      );
    });
  });
}
//Shankar changes 13/08/2021
export async function GetAllOutstangListWithPartyCode(PartyCode: string) {
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        // "SELECT * FROM OutstandingDetails where PartyCode='" +
        //     PartyCode +
        //     "' and OSAmount > 0",
        "SELECT CASE when AllMinusOS.AlMinusAmount is NULL then OSAmount else OSAmount-AllMinusOS.AlMinusAmount end as OSAmount,ID, PartyCode,Document,Date,DisPactchDate,Amount,  OSDocument,InvoiceDate,DiscountAc, PdcAmt ,PdcDate ,CDStatus ,Narration ,TpNo ,LedgerCode ,CDPercentage ,ChqNo ,PayslipNo ,ReceivedAmt ,CASE WHEN Lag != 'null' AND Lag != '' THEN CAST(Lag AS INTEGER) ELSE 0 END AS Lag,UnAllocated ,NetOsAmt ,VhrNo ,PartyName ,Location  FROM OutstandingDetails LEFT join (select  ifnull(sum(MinusOS.AlAmount),0) as AlMinusAmount, InvoiceCode from  (select  sum(AllocatedAmount) as AlAmount, InvoiceCode from TX_Collections group by InvoiceCode UNION select  sum(amount) as AlAmount,InvoiceCode  from TX_CollectionsDetails group by CollectionID) as MinusOS group by InvoiceCode) as AllMinusOS ON  OutstandingDetails.Document = AllMinusOS.InvoiceCode where ifnull(OSAmount,0)-ifnull(AllMinusOS.AlMinusAmount,0) >0 and OSAmount>0 and partycode ='" +
          PartyCode +
          "' order by Lag DESC",
        [],
        (tx, results) => {
          let temp = [];
          for (let i = 0; i < results.rows.length; i++) {
            temp.push(results.rows.item(i));
          }
          resolve(temp);
        },
      );
    });
  });
}
///////////////////////////////
export async function GetCollectionDetails(uid: string) {
  // console.log(
  //   'query hit 1 --> \n',
  //   'select *,OutstandingDetails.PartyName from OutstandingDetails inner join TX_PaymentReceipt on OutstandingDetails.PartyCode==TX_PaymentReceipt.OutletID inner join TX_Collections on TX_Collections.MobileGenPrimaryKey==TX_PaymentReceipt.ID where OutstandingDetails.userid ="' +
  //     uid +
  //     '" group by TX_PaymentReceipt.ID order by PaymentMode DESC',
  // );

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        'select *,OutstandingDetails.PartyName from OutstandingDetails inner join TX_PaymentReceipt on OutstandingDetails.PartyCode==TX_PaymentReceipt.OutletID inner join TX_Collections on TX_Collections.MobileGenPrimaryKey==TX_PaymentReceipt.ID where OutstandingDetails.userid ="' +
          uid +
          '" group by TX_PaymentReceipt.ID order by PaymentMode DESC',
        [],
        (tx, results) => {
          let temp = [];
          for (let i = 0; i < results.rows.length; i++) {
            temp.push(results.rows.item(i));
          }
          resolve(temp);
        },
      );
    });
  });
}
export async function GetCollectionDetailslog(uid: string) {
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        'select *,OutstandingDetails.PartyName from OutstandingDetails,TX_Collections_log,TX_PaymentReceipt_log where TX_Collections_log.MobileGenPrimaryKey==TX_PaymentReceipt_log.ID  and OutstandingDetails.PartyCode==TX_PaymentReceipt_log.OutletID and OutstandingDetails.userid ="' +
          uid +
          '"  group by MobileGenPrimaryKey',
        [],
        (tx, results) => {
          let temp = [];
          for (let i = 0; i < results.rows.length; i++) {
            temp.push(results.rows.item(i));
          }
          resolve(temp);
        },
      );
    });
  });
}

///////////////////////////collectionHistorychange by SG

export async function GetCollectionDetailslogHistory(uid: string) {
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        'SELECT COALESCE(TX_Collections_log.MobileGenPrimaryKey, TX_PaymentReceipt_log.ID) AS MobileGenPrimaryKey,TX_Collections_log.InvoiceCode,TX_Collections_log.AllocatedAmount,TX_PaymentReceipt_log.ReceivedDateTime as CollectionDatetime, TX_PaymentReceipt_log.OutletID as PartyCode, TX_PaymentReceipt_log.ID,TX_PaymentReceipt_log.ReceivedDateTime,TX_PaymentReceipt_log.PaymentMode,TX_PaymentReceipt_log.ChequeNo, TX_PaymentReceipt_log.ChequeDated,TX_PaymentReceipt_log.BankDetails,TX_PaymentReceipt_log.Amount,TX_PaymentReceipt_log.OutletID,TX_PaymentReceipt_log.Narration, TX_PaymentReceipt_log.ExecutiveID, OutstandingDetails.PartyName FROM OutstandingDetails INNER JOIN TX_PaymentReceipt_log ON OutstandingDetails.PartyCode = TX_PaymentReceipt_log.OutletID LEFT JOIN TX_Collections_log ON TX_Collections_log.MobileGenPrimaryKey = TX_PaymentReceipt_log.ID WHERE OutstandingDetails.userid = "' +
          uid +
          '" GROUP BY TX_PaymentReceipt_log.ID',
        [],
        (tx, results) => {
          let temp = [];
          for (let i = 0; i < results.rows.length; i++) {
            temp.push(results.rows.item(i));
          }
          resolve(temp);
        },
      );
    });
  });
}

/////////////////////
export async function GetCollectionDetails1(uid: string) {
  // console.log(
  //   'query hit 2 --> \n',
  //   'select *,OutstandingDetails.PartyName from OutstandingDetails inner join TX_PaymentReceipt on OutstandingDetails.PartyCode==TX_PaymentReceipt.OutletID inner join TX_Collections on TX_Collections.MobileGenPrimaryKey==TX_PaymentReceipt.ID where OutstandingDetails.userid ="' +
  //     uid +
  //     '"  group by TX_PaymentReceipt.ID order by PartyName',
  // );
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        'select *,OutstandingDetails.PartyName from OutstandingDetails inner join TX_PaymentReceipt on OutstandingDetails.PartyCode==TX_PaymentReceipt.OutletID inner join TX_Collections on TX_Collections.MobileGenPrimaryKey==TX_PaymentReceipt.ID where OutstandingDetails.userid ="' +
          uid +
          '"  group by TX_PaymentReceipt.ID order by PartyName',
        [],
        (tx, results) => {
          let temp = [];
          for (let i = 0; i < results.rows.length; i++) {
            temp.push(results.rows.item(i));
          }
          resolve(temp);
        },
      );
    });
  });
}
export async function GetCollectionDetails1log(uid: string) {
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        'select *,OutstandingDetails.PartyName from OutstandingDetails,TX_Collections_log,TX_PaymentReceipt_log where TX_Collections_log.MobileGenPrimaryKey==TX_PaymentReceipt_log.ID  and OutstandingDetails.PartyCode==TX_PaymentReceipt_log.OutletID and OutstandingDetails.userid ="' +
          uid +
          '"  group by MobileGenPrimaryKey order by PartyName',
        [],
        (tx, results) => {
          let temp = [];
          for (let i = 0; i < results.rows.length; i++) {
            temp.push(results.rows.item(i));
          }
          resolve(temp);
        },
      );
    });
  });
}
////////////////////
export async function GetCollectionDetails2(uid: string) {
  // console.log(
  //   'query hit 3 --> \n',
  //   'select *,OutstandingDetails.PartyName from OutstandingDetails inner join TX_PaymentReceipt on OutstandingDetails.PartyCode==TX_PaymentReceipt.OutletID inner join TX_Collections on TX_Collections.MobileGenPrimaryKey==TX_PaymentReceipt.ID where OutstandingDetails.userid ="' +
  //     uid +
  //     '"  group by TX_PaymentReceipt.ID order by PartyName',
  // );
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        'select *,OutstandingDetails.PartyName from OutstandingDetails inner join TX_PaymentReceipt on OutstandingDetails.PartyCode==TX_PaymentReceipt.OutletID inner join TX_Collections on TX_Collections.MobileGenPrimaryKey==TX_PaymentReceipt.ID where OutstandingDetails.userid ="' +
          uid +
          '"  group by TX_PaymentReceipt.ID order by PartyName',
        [],
        (tx, results) => {
          let temp = [];
          for (let i = 0; i < results.rows.length; i++) {
            temp.push(results.rows.item(i));
          }
          resolve(temp);
        },
      );
    });
  });
}
export async function GetCollectionDetails2log(uid: string) {
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        'select *,OutstandingDetails.PartyName from OutstandingDetails,TX_Collections_log,TX_PaymentReceipt_log where TX_Collections_log.MobileGenPrimaryKey==TX_PaymentReceipt_log.ID  and OutstandingDetails.PartyCode==TX_PaymentReceipt_log.OutletID and OutstandingDetails.userid ="' +
          uid +
          '"  group by MobileGenPrimaryKey order by PaymentMode',
        [],
        (tx, results) => {
          let temp = [];
          for (let i = 0; i < results.rows.length; i++) {
            temp.push(results.rows.item(i));
          }
          resolve(temp);
        },
      );
    });
  });
}
//////

//Aftab changes 12/08/2021

export async function GetChequeReturnDetails(uid: string) {
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        'select ChequeReturnDetails.ID,ChequeReturnDetails.PartyCode,ChequeReturnDetails.ReceiptNo,ChequeReturnDetails.ReceiptDate,ChequeReturnDetails.ChqNo,ChequeReturnDetails.ChqDate,ChequeReturnDetails.ChqAmt,ChequeReturnDetails.BankName,ChequeReturnDetails.Branch,ChequeReturnDetails.BounceDate,Pcustomer.Party FROM ChequeReturnDetails,Pcustomer where ChequeReturnDetails.PartyCode= Pcustomer.CustomerId and ChequeReturnDetails.userid ="' +
          uid +
          '"  order by BounceDate desc',
        [],
        (tx, results) => {
          let temp = [];
          for (let i = 0; i < results.rows.length; i++) {
            temp.push(results.rows.item(i));
          }
          resolve(temp);
        },
      );
    });
  });
}

//Aftab changes
//Aftab changes 13/08/2021
export async function GetAllChequeReturnDetails(uid: string) {
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM ChequeReturnDetails where userid ="' +
          uid +
          '"  order by BounceDate',
        [],
        (tx, results) => {
          let temp = [];
          for (let i = 0; i < results.rows.length; i++) {
            temp.push(results.rows.item(i));
          }
          resolve(temp);
        },
      );
    });
  });
}

//Aftab changes 14/08/2021
export async function insert_TX_PaymentReceipt(
  ReceivedDateTime: string,
  PaymentMode: string,
  ChequeNo: string | number,
  ChequeDated: string,
  BankDetails: string,
  Amount: string | number,
  OutletID: string,
  Narration: string,
  ID: string | number,
  ExecutiveID: string | number,
  uid: string,
) {
  // console.log('Amount -->', Amount, BankDetails);
  db1.transaction(tx => {
    tx.executeSql(
      `insert into TX_PaymentReceipt( ReceivedDateTime , PaymentMode , ChequeNo ,ChequeDated ,BankDetails,Amount,OutletID,Narration,ID,ExecutiveID, userid) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [
        String(ReceivedDateTime),
        String(PaymentMode),
        String(ChequeNo),
        String(ChequeDated),
        String(BankDetails),
        String(Amount),
        String(OutletID),
        String(Narration),
        String(ID),
        String(ExecutiveID),
        String(uid),
      ],
      (tx, results) => {
        // console.log('SUCCESSSTORY', results);
      },
      err => {
        console.log('ERRORO INSERTIME::', err);
      },
    );
  });
}

export async function insert_TX_CollectionsDetails(
  CollectionID: string,
  Amount: string | number,
  DiscountType: string,
  InvoiceCode: string | number,
) {
  db1.transaction(tx => {
    tx.executeSql(
      `insert into TX_CollectionsDetails(CollectionID ,Amount,DiscountType ,InvoiceCode) VALUES (?,?,?,?)`,
      [
        String(CollectionID),
        String(Amount),
        String(DiscountType),
        String(InvoiceCode),
      ],
      (tx, results) => {
        // console.log('SUCCESSSTORY', results);
      },
      err => {
        console.log('ERRORO INSERTIME::', err);
      },
    );
  });
}

export async function insert_TX_Collections(
  MobileGenPrimaryKey: string,
  InvoiceCode: string | number,
  AllocatedAmount: string | number,
  CollectionDatetime: string,
  PartyCode: string | number,
  uid: string,
) {
  // console.log('tx col -->', InvoiceCode);
  db1.transaction(tx => {
    tx.executeSql(
      `insert into TX_Collections(MobileGenPrimaryKey,InvoiceCode ,AllocatedAmount,CollectionDatetime ,PartyCode, userid) VALUES (?,?,?,?,?,?)`,
      [
        String(MobileGenPrimaryKey),
        String(InvoiceCode),
        String(AllocatedAmount),
        String(CollectionDatetime),
        String(PartyCode),
        String(uid),
      ],
      (tx, results) => {
        // console.log('SUCCESSSTORY', results);
      },
      err => {
        console.log('ERRORO INSERTIME::', err);
      },
    );
  });
}

export async function Get_TX_PaymentReceipt() {
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql('SELECT * FROM TX_PaymentReceipt ', [], (tx, results) => {
        let temp = [];
        for (let i = 0; i < results.rows.length; i++) {
          temp.push(results.rows.item(i));
        }
        resolve(temp);
      });
    });
  });
}

export async function insertSettingData(settingData: any) {
  // Validate input data first
  if (!settingData || settingData.length === 0) {
    console.warn('insertSettingData: No data provided, skipping operation');
    return;
  }

  return new Promise<void>((resolve, reject) => {
    db1.transaction(
      tx => {
        try {
          // Step 1: Create backup of existing Settings data
          tx.executeSql(
            'CREATE TEMPORARY TABLE Settings_Backup AS SELECT * FROM Settings',
            [],
            (tx, results) => {
              console.log('Backup created for Settings');

              // Step 2: Reset sequence and delete old data
              tx.executeSql(
                "UPDATE SQLITE_SEQUENCE SET seq = 0 WHERE name = 'Settings'",
                [],
                (tx, results) => {
                  tx.executeSql('DELETE from Settings', [], (tx, results) => {
                    console.log(
                      `Deleted ${results.rowsAffected} old Settings records`,
                    );

                    // Step 3: Insert new data with error tracking
                    let successCount = 0;
                    let errorCount = 0;

                    const insertNextItem = (index: number) => {
                      if (index >= settingData.length) {
                        // All items processed
                        if (successCount === settingData.length) {
                          // All successful - drop backup and resolve
                          tx.executeSql(
                            'DROP TABLE Settings_Backup',
                            [],
                            (tx, results) => {
                              console.log(
                                `âœ… Successfully inserted ${successCount} Settings records`,
                              );
                              resolve();
                            },
                            (tx, error) => {
                              console.warn(
                                'Warning: Could not drop backup table:',
                                error,
                              );
                              resolve(); // Still resolve since main operation succeeded
                            },
                          );
                        } else {
                          // Some failed - restore from backup
                          console.error(
                            `âŒ Only ${successCount}/${settingData.length} inserts succeeded. Restoring backup...`,
                          );
                          tx.executeSql(
                            'DELETE from Settings',
                            [],
                            (tx, results) => {
                              tx.executeSql(
                                'INSERT INTO Settings SELECT * FROM Settings_Backup',
                                [],
                                (tx, results) => {
                                  tx.executeSql(
                                    'DROP TABLE Settings_Backup',
                                    [],
                                    (tx, results) => {
                                      reject(
                                        new Error(
                                          `Failed to insert Settings: Only ${successCount}/${settingData.length} succeeded`,
                                        ),
                                      );
                                    },
                                    (tx, error) => {
                                      reject(
                                        new Error(
                                          `Failed to insert Settings: Only ${successCount}/${settingData.length} succeeded`,
                                        ),
                                      );
                                    },
                                  );
                                },
                                (tx, error) => {
                                  reject(
                                    new Error(
                                      `Failed to restore Settings from backup: ${error.message}`,
                                    ),
                                  );
                                },
                              );
                            },
                            (tx, error) => {
                              reject(
                                new Error(
                                  `Failed to clear Settings before restore: ${error.message}`,
                                ),
                              );
                            },
                          );
                        }
                        return;
                      }

                      const item = settingData[index];

                      // Validate item data
                      if (!item.Key || item.Value === undefined) {
                        console.error('Invalid Settings item:', item);
                        errorCount++;
                        insertNextItem(index + 1);
                        return;
                      }

                      tx.executeSql(
                        `INSERT INTO Settings( Key , Value ) VALUES (?,?)`,
                        [String(item.Key), String(item.Value)],
                        (tx, results) => {
                          successCount++;
                          console.log(
                            `Inserted Settings item ${index + 1}/${
                              settingData.length
                            }`,
                          );
                          insertNextItem(index + 1);
                        },
                        (tx, error) => {
                          errorCount++;
                          console.error(
                            `Error inserting Settings item ${index + 1}:`,
                            error,
                          );
                          insertNextItem(index + 1);
                        },
                      );
                    };

                    // Start inserting items
                    insertNextItem(0);
                  });
                },
                (tx, error) => {
                  console.error('Error updating SQLITE_SEQUENCE:', error);
                  reject(
                    new Error(
                      `Failed to update SQLITE_SEQUENCE: ${error.message}`,
                    ),
                  );
                },
              );
            },
            (tx, error) => {
              console.error('Error creating backup:', error);
              reject(new Error(`Failed to create backup: ${error.message}`));
            },
          );
        } catch (error: any) {
          console.error('Transaction error in insertSettingData:', error);
          reject(error);
        }
      })
      .catch((error: any) => {
        console.error('Transaction failed in insertSettingData:', error);
        reject(error);
      })
      .then(() => {
        console.log('Transaction completed in insertSettingData');
      });
  });
}

export async function insertPDistributor(PDistributorData: any) {
  db1.transaction(tx => {
    tx.executeSql('DELETE from PDistributor', [], (tx, results) => {
      let len = PDistributorData?.length;
      let count = 0;

      for (let item of PDistributorData) {
        tx.executeSql(
          `insert into PDistributor(DistributorID ,Distributor ,DistributorAlias ,
                  ERPCode ,AREAID ,AREA ,BRANCHID ,BRANCH ,DISTRIBUTORGROUPID ,
                  DISTRIBUTORGROUP ,IsSelectedDistributor,userid )
                                        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            String(item.DistributorId),
            String(item.Distributor),
            String(item.DistributorAlias),
            String(item.ERPCode),
            String(item.AREAID),
            String(item.AREA),
            String(item.BRANCHID),
            String(item.BRANCH),
            String(item.DISTRIBUTORGROUPID),
            String(item.DISTRIBUTORGROUP),
            '',
            String(item.userid),
          ],
          (tx, results) => {},
          err => {
            console.error('error=', err);
          },
        );
      }
    });
  });
}
///////////////////////////////////////////////////////////////PENDING ORDERS///////////
export async function insertPendingOrdersDiscount(PendingOrdersDiscount: any) {
  db1.transaction(tx => {
    tx.executeSql('DELETE from PendingOrdersDiscount', [], (tx, results) => {
      db1.transaction(tx => {
        let len = PendingOrdersDiscount?.length;
        let count = 0;

        for (let item of PendingOrdersDiscount) {
          tx.executeSql(
            `insert into PendingOrdersDiscount(Id,POD_POM_ID,POD_PARTY_CODE,POM_DOC_NO,POD_LEDGER_CODE,POD_LEDGER_NAME,POD_RNP,POD_RATE,POD_QUANTITY,POD_TOTALDISCOUNT,POD_SALESMAN_CODE,DistributorID,POM_INSERTEDDATE )
                                      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              String(item.Id),
              String(item.POD_POM_ID),
              String(item.POD_PARTY_CODE),
              String(item.POM_DOC_NO),
              String(item.POD_LEDGER_CODE),
              String(item.POD_LEDGER_NAME),
              String(item.POD_RNP),
              String(item.POD_RATE),
              String(item.POD_QUANTITY),
              String(item.POD_TOTALDISCOUNT),
              String(item.POD_SALESMAN_CODE),
              String(item.DistributorID),
              String(item.POM_INSERTEDDATE),
            ],
            (tx, results) => {},
            err => {
              console.error('error=', err);
            },
          );
        }
      });
    }, (tx, error) => {
      console.error('Error deleting PendingOrdersDiscount:', error);
    });
  });
}

export async function insertPendingOrdersDetails(PendingOrdersDetails: any) {
  db1.transaction(tx => {
    tx.executeSql('DELETE from PendingOrdersDetails', [], (tx, results) => {
      db1.transaction(tx => {
        let len = PendingOrdersDetails?.length;
        let count = 0;

        for (let item of PendingOrdersDetails) {
          tx.executeSql(
            `insert into PendingOrdersDetails(Id,DistributorID,POD_POM_ID,POD_PAM_PARTY_CODE,POD_DOC_NO,POD_ITEM_CODE,POD_ITEM_NAME,POD_SQTY,POD_FQTY,POD_RATE,POD_AMOUNT,POD_SALESMAN_CODE,POD_DIST_NAME,POD_LASTEDITDATE,POD_INSERTEDDATE )
                                      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              String(item.Id),
              String(item.DistributorID),
              String(item.POD_POM_ID),
              String(item.POD_PAM_PARTY_CODE),
              String(item.POD_DOC_NO),
              String(item.POD_ITEM_CODE),
              String(item.POD_ITEM_NAME),
              String(item.POD_SQTY),
              String(item.POD_FQTY),
              String(item.POD_RATE),
              String(item.POD_AMOUNT),
              String(item.POD_SALESMAN_CODE),
              String(item.POD_DIST_NAME),
              String(item.POD_LASTEDITDATE),
              String(item.POD_INSERTEDDATE),
            ],
            (tx, results) => {},
            err => {
              console.error('error=', err);
            },
          );
        }
      });
    }, (tx, error) => {
      console.error('Error deleting PendingOrdersDetails:', error);
    });
  });
}
export async function insertPendingOrdersMaster(PendingOrdersMaster: any) {
  db1.transaction(tx => {
    tx.executeSql('DELETE from PendingOrdersMaster', [], (tx, results) => {
      db1.transaction(tx => {
        let len = PendingOrdersMaster?.length;
        let count = 0;

        for (let item of PendingOrdersMaster) {
          tx.executeSql(
            `insert into PendingOrdersMaster(Id,DistributorID,POM_PAM_PARTY_CODE,POM_DOC_NO,POM_DOC_DATE,POM_DOC_TYPE,POM_DOC_AMOUNT,POM_SALESMAN_CODE,POM_DIST_NAME,POM_LASTEDITDATE,POM_INSERTEDDATE)
                                      VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
            [
              String(item.Id),
              String(item.DistributorID),
              String(item.POM_PAM_PARTY_CODE),
              String(item.POM_DOC_NO),
              String(item.POM_DOC_DATE),
              String(item.POM_DOC_TYPE),
              String(item.POM_DOC_AMOUNT),
              String(item.POM_SALESMAN_CODE),
              String(item.POM_DIST_NAME),
              String(item.POM_LASTEDITDATE),
              String(item.POM_INSERTEDDATE),
            ],
            (tx, results) => {},
            err => {
              console.error('error=', err);
            },
          );
        }
      });
    }, (tx, error) => {
      console.error('Error deleting PendingOrdersMaster:', error);
    });
  });
}
export async function insertVW_PendingOrders(VW_PendingOrders: any) {
  db1.transaction(tx => {
    tx.executeSql('DELETE from VW_PendingOrders', [], (tx, results) => {
      let len = VW_PendingOrders?.length;
      let count = 0;

      for (let item of VW_PendingOrders) {
        tx.executeSql(
          `insert into VW_PendingOrders(Party,Id,POM_DOC_NO,POM_DOC_DATE,POM_DOC_AMOUNT,POD_ITEM_NAME,POD_SQTY,POD_FQTY,POD_LEDGER_NAME,POD_RNP,POD_RATE,POD_QUANTITY,POD_TOTALDISCOUNT,userid)
                                        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            String(item.Party),
            String(item.Id),
            String(item.POM_DOC_NO),
            String(item.POM_DOC_DATE),
            String(item.POM_DOC_AMOUNT),
            String(item.POD_ITEM_NAME),
            String(item.POD_SQTY),
            String(item.POD_FQTY),
            String(item.POD_LEDGER_NAME),
            String(item.POD_RNP),
            String(item.POD_RATE),
            String(item.POD_QUANTITY),
            String(item.POD_TOTALDISCOUNT),
            String(item.userid),
          ],
          (tx, results) => {},
          err => {
            console.error('error=', err);
          },
        );
      }
    });
  });
}
export async function insertMultiEntityUser(RO_MultiEntityUser: any) {
  db1.transaction(tx => {
    tx.executeSql('DELETE from MultiEntityUser', [], (tx, results) => {
      let len = RO_MultiEntityUser?.length;
      let count = 0;

      for (let item of RO_MultiEntityUser) {
        tx.executeSql(
          `insert into MultiEntityUser(UserId,DistributorId,DivisionId,Distributor)
                                        VALUES (?,?,?,?)`,
          [
            String(item.UserId),
            String(item.DistributorId),
            String(item.DivisionId),
            String(item.Distributor),
          ],
          (tx, results) => {},
          err => {
            console.error('error multi=', err);
          },
        );
      }
    });
  });
}
//////////////////////////////////////////////////////////////////

export async function insertSalesData(SalesData: any) {
  // Validate input data first
  if (!SalesData || SalesData.length === 0) {
    console.warn('insertSalesData: No data provided, skipping operation');
    return;
  }

  return new Promise<void>((resolve, reject) => {
    db1.transaction(
      tx => {
        try {
          // Step 1: Create backup of existing Sales data
          tx.executeSql(
            'CREATE TEMPORARY TABLE Sales_Backup AS SELECT * FROM Sales',
            [],
            (tx, results) => {
              console.log('Backup created for Sales');

              // Step 2: Delete old data
              tx.executeSql('DELETE from Sales', [], (tx, results) => {
                console.log(
                  `Deleted ${results.rowsAffected} old Sales records`,
                );

                // Step 3: Insert new data with error tracking - CONTINUE ON ERRORS
                let successCount = 0;
                let errorCount = 0;
                const errorDetails: string[] = [];

                const insertNextItem = (index: number) => {
                  if (index >= SalesData.length) {
                    // All items processed - RESOLVE REGARDLESS OF ERRORS
                    console.log(
                      `ðŸ“Š Sales insertion summary: ${successCount} successful, ${errorCount} failed`,
                    );

                    if (errorCount > 0) {
                      console.warn(
                        `âš ï¸ ${errorCount} Sales items failed but continuing with successful ones`,
                      );
                      console.warn('Failed items details:', errorDetails);
                    }

                    // Always drop backup and resolve - don't rollback on partial failures
                    tx.executeSql(
                      'DROP TABLE Sales_Backup',
                      [],
                      (tx, results) => {
                        console.log(
                          `âœ… Sales insertion completed: ${successCount}/${SalesData.length} records inserted`,
                        );
                        if (errorCount > 0) {
                          console.warn(
                            `âš ï¸ Note: ${errorCount} records were skipped due to errors`,
                          );
                        }
                        resolve();
                      },
                      (tx, error) => {
                        console.warn(
                          'Warning: Could not drop backup table:',
                          error,
                        );
                        resolve(); // Still resolve since main operation succeeded
                      },
                    );
                    return;
                  }

                  const item = SalesData[index];

                  // Validate item data
                  if (!item.UserID || !item.DistributorID || !item.CustomerID) {
                    const errorMsg = `Invalid Sales item at index ${index}: Missing required fields (UserID: ${!!item.UserID}, DistributorID: ${!!item.DistributorID}, CustomerID: ${!!item.CustomerID})`;
                    console.error(errorMsg, item);
                    errorCount++;
                    errorDetails.push(errorMsg);
                    insertNextItem(index + 1); // Continue with next item
                    return;
                  }

                  tx.executeSql(
                    `INSERT INTO Sales(UserID ,DistributorID ,CustomerID ,Month ,ItemID ,Quantity ,Value,user_id) VALUES (?,?,?,?,?,?,?,?)`,
                    [
                      String(item.UserID),
                      String(item.DistributorID),
                      String(item.CustomerID),
                      String(item.Month || ''),
                      String(item.ItemID || ''),
                      String(item.Quantity || '0'),
                      String(item.Value || '0'),
                      String(item.userid1 || ''),
                    ],
                    (tx, results) => {
                      successCount++;
                      console.log(
                        `âœ… Inserted Sales item ${index + 1}/${
                          SalesData.length
                        }`,
                      );
                      insertNextItem(index + 1);
                    },
                    (tx, error) => {
                      const errorMsg = `SQL error inserting Sales item ${
                        index + 1
                      }: ${error.message}`;
                      console.error(errorMsg, {item, error});
                      errorCount++;
                      errorDetails.push(errorMsg);
                      insertNextItem(index + 1); // Continue with next item - DON'T STOP
                    },
                  );
                };

                // Start inserting items
                insertNextItem(0);
              });
            },
            (tx, error) => {
              console.error('Error creating backup:', error);
              reject(new Error(`Failed to create backup: ${error.message}`));
            },
          );
        } catch (error: any) {
          console.error('Transaction error in insertSalesData:', error);
          reject(error);
        }
      })
      .catch((error: any) => {
        console.error('Transaction failed in insertSalesData:', error);
        reject(error);
      })
      .then(() => {
        console.log('Transaction completed in insertSalesData');
      });
  });
}
export async function insertPaymentData(SalesData: any) {
  // Validate input data first
  if (!SalesData || SalesData.length === 0) {
    console.warn('insertPaymentData: No data provided, skipping operation');
    return;
  }

  return new Promise<void>((resolve, reject) => {
    db1.transaction(
      tx => {
        try {
          // Step 1: Create backup of existing PaymentReceipt_log data
          tx.executeSql(
            'CREATE TEMPORARY TABLE TX_PaymentReceipt_log_Backup AS SELECT * FROM TX_PaymentReceipt_log',
            [],
            (tx, results) => {
              console.log('Backup created for TX_PaymentReceipt_log');

              // Step 2: Delete old data
              tx.executeSql(
                'DELETE from TX_PaymentReceipt_log',
                [],
                (tx, results) => {
                  console.log(
                    `Deleted ${results.rowsAffected} old TX_PaymentReceipt_log records`,
                  );

                  // Step 3: Insert new data with error tracking - CONTINUE ON ERRORS
                  let successCount = 0;
                  let errorCount = 0;
                  const errorDetails: string[] = [];

                  const insertNextItem = (index: number) => {
                    if (index >= SalesData.length) {
                      // All items processed - RESOLVE REGARDLESS OF ERRORS
                      console.log(
                        `ðŸ“Š PaymentReceipt insertion summary: ${successCount} successful, ${errorCount} failed`,
                      );

                      if (errorCount > 0) {
                        console.warn(
                          `âš ï¸ ${errorCount} PaymentReceipt items failed but continuing with successful ones`,
                        );
                        console.warn('Failed items details:', errorDetails);
                      }

                      // Always drop backup and resolve - don't rollback on partial failures
                      tx.executeSql(
                        'DROP TABLE TX_PaymentReceipt_log_Backup',
                        [],
                        (tx, results) => {
                          console.log(
                            `âœ… PaymentReceipt insertion completed: ${successCount}/${SalesData.length} records inserted`,
                          );
                          if (errorCount > 0) {
                            console.warn(
                              `âš ï¸ Note: ${errorCount} records were skipped due to errors`,
                            );
                          }
                          resolve();
                        },
                        (tx, error) => {
                          console.warn(
                            'Warning: Could not drop backup table:',
                            error,
                          );
                          resolve(); // Still resolve since main operation succeeded
                        },
                      );
                      return;
                    }

                    const item = SalesData[index];

                    // Validate item data
                    if (!item.MobileGenPrimaryKey || !item.Amount) {
                      const errorMsg = `Invalid PaymentReceipt item at index ${index}: Missing required fields (MobileGenPrimaryKey: ${!!item.MobileGenPrimaryKey}, Amount: ${!!item.Amount})`;
                      console.error(errorMsg, item);
                      errorCount++;
                      errorDetails.push(errorMsg);
                      insertNextItem(index + 1); // Continue with next item
                      return;
                    }

                    tx.executeSql(
                      `INSERT INTO TX_PaymentReceipt_log( ReceivedDateTime , PaymentMode , ChequeNo ,ChequeDated ,BankDetails,Amount,OutletID,Narration,ID,ExecutiveID) VALUES (?,?,?,?,?,?,?,?,?,?)`,
                      [
                        String(item.ReceivedDateTime || ''),
                        String(item.PaymentMode || ''),
                        String(item.ChequeNo || ''),
                        String(item.ChequeDated || ''),
                        String(item.BankDetails || ''),
                        String(item.Amount || '0'),
                        String(item.OutletID || ''),
                        String(item.Narration || ''),
                        String(item.MobileGenPrimaryKey),
                        String(item.ExecutiveID || ''),
                      ],
                      (tx, results) => {
                        successCount++;
                        console.log(
                          `âœ… Inserted TX_PaymentReceipt_log item ${
                            index + 1
                          }/${SalesData.length}`,
                        );
                        insertNextItem(index + 1);
                      },
                      (tx, error) => {
                        const errorMsg = `SQL error inserting PaymentReceipt item ${
                          index + 1
                        }: ${error.message}`;
                        console.error(errorMsg, {item, error});
                        errorCount++;
                        errorDetails.push(errorMsg);
                        insertNextItem(index + 1); // Continue with next item - DON'T STOP
                      },
                    );
                  };

                  // Start inserting items
                  insertNextItem(0);
                },
              );
            },
            (tx, error) => {
              console.error('Error creating backup:', error);
              reject(new Error(`Failed to create backup: ${error.message}`));
            },
          );
        } catch (error: any) {
          console.error('Transaction error in insertPaymentData:', error);
          reject(error);
        }
      })
      .catch((error: any) => {
        console.error('Transaction failed in insertPaymentData:', error);
        reject(error);
      })
      .then(() => {
        console.log('Transaction completed in insertPaymentData');
      });
  });
}
export async function insertCollectionData(SalesData: any) {
  // Validate input data first
  if (!SalesData || SalesData.length === 0) {
    console.warn('insertCollectionData: No data provided, skipping operation');
    return;
  }

  return new Promise<void>((resolve, reject) => {
    db1.transaction(
      tx => {
        try {
          // Step 1: Create backup of existing Collections_log data
          tx.executeSql(
            'CREATE TEMPORARY TABLE TX_Collections_log_Backup AS SELECT * FROM TX_Collections_log',
            [],
            (tx, results) => {
              console.log('Backup created for TX_Collections_log');

              // Step 2: Delete old data
              tx.executeSql(
                'DELETE from TX_Collections_log',
                [],
                (tx, results) => {
                  console.log(
                    `Deleted ${results.rowsAffected} old TX_Collections_log records`,
                  );

                  // Step 3: Insert new data with error tracking - CONTINUE ON ERRORS
                  let successCount = 0;
                  let errorCount = 0;
                  const errorDetails: string[] = [];

                  const insertNextItem = (index: number) => {
                    if (index >= SalesData.length) {
                      // All items processed - RESOLVE REGARDLESS OF ERRORS
                      console.log(
                        `ðŸ“Š Collections_log insertion summary: ${successCount} successful, ${errorCount} failed`,
                      );

                      if (errorCount > 0) {
                        console.warn(
                          `âš ï¸ ${errorCount} Collections_log items failed but continuing with successful ones`,
                        );
                        console.warn('Failed items details:', errorDetails);
                      }

                      // Always drop backup and resolve - don't rollback on partial failures
                      tx.executeSql(
                        'DROP TABLE TX_Collections_log_Backup',
                        [],
                        (tx, results) => {
                          console.log(
                            `âœ… Collections_log insertion completed: ${successCount}/${SalesData.length} records inserted`,
                          );
                          if (errorCount > 0) {
                            console.warn(
                              `âš ï¸ Note: ${errorCount} records were skipped due to errors`,
                            );
                          }
                          resolve();
                        },
                        (tx, error) => {
                          console.warn(
                            'Warning: Could not drop backup table:',
                            error,
                          );
                          resolve(); // Still resolve since main operation succeeded
                        },
                      );
                      return;
                    }

                    const item = SalesData[index];

                    // Validate item data
                    if (!item.MobileGenPrimaryKey || !item.InvoiceCode) {
                      const errorMsg = `Invalid Collections_log item at index ${index}: Missing required fields (MobileGenPrimaryKey: ${!!item.MobileGenPrimaryKey}, InvoiceCode: ${!!item.InvoiceCode})`;
                      console.error(errorMsg, item);
                      errorCount++;
                      errorDetails.push(errorMsg);
                      insertNextItem(index + 1); // Continue with next item
                      return;
                    }

                    tx.executeSql(
                      `INSERT INTO TX_Collections_log(MobileGenPrimaryKey,InvoiceCode ,AllocatedAmount,CollectionDatetime ,PartyCode) VALUES (?,?,?,?,?)`,
                      [
                        String(item.MobileGenPrimaryKey),
                        String(item.InvoiceCode),
                        String(item.AllocatedAmount || '0'),
                        String(item.CollectionDatetime || ''),
                        String(item.PartyCode || ''),
                      ],
                      (tx, results) => {
                        successCount++;
                        console.log(
                          `âœ… Inserted TX_Collections_log item ${index + 1}/${
                            SalesData.length
                          }`,
                        );
                        insertNextItem(index + 1);
                      },
                      (tx, error) => {
                        const errorMsg = `SQL error inserting Collections_log item ${
                          index + 1
                        }: ${error.message}`;
                        console.error(errorMsg, {item, error});
                        errorCount++;
                        errorDetails.push(errorMsg);
                        insertNextItem(index + 1); // Continue with next item - DON'T STOP
                      },
                    );
                  };

                  // Start inserting items
                  insertNextItem(0);
                },
              );
            },
            (tx, error) => {
              console.error('Error creating backup:', error);
              reject(new Error(`Failed to create backup: ${error.message}`));
            },
          );
        } catch (error: any) {
          console.error('Transaction error in insertCollectionData:', error);
          reject(error);
        }
      })
      .catch((error: any) => {
        console.error('Transaction failed in insertCollectionData:', error);
        reject(error);
      })
      .then(() => {
        console.log('Transaction completed in insertCollectionData');
      });
  });
}
export async function insertCollectionDeatailData(SalesData: any) {
  db1.transaction(tx => {
    tx.executeSql(
      'DELETE from TX_CollectionsDetails_log',
      [],
      (tx, results) => {
        let len = SalesData?.length;
        let count = 0;
        for (let item of SalesData) {
          tx.executeSql(
            `insert into TX_CollectionsDetails_log(CollectionID ,Amount,DiscountType ,InvoiceCode) VALUES (?,?,?,?)`,
            [
              String(item.MobileGenPrimaryKey),
              String(item.Amount),
              String(item.DiscountType),
              String(item.InvoiceCode),
            ],
            (tx, results) => {
              null;
            },
            err => {
              console.error('error col detai=', err);
            },
          );
        }
      },
    );
  });
}

export async function insertTargetData(TargetData: any) {
  db1.transaction(tx => {
    tx.executeSql('DELETE from Target', [], (tx, results) => {
      let len = TargetData?.length;
      let count = 0;
      for (let item of TargetData) {
        tx.executeSql(
          `insert into Target(UserID ,TDate ,ClassificationID ,ClassificationName ,Target  )
                                                          VALUES (?,?,?,?,?)`,
          [
            String(item.UserID),
            String(item.TDate),
            String(item.ClassificationID),
            String(item.ClassificationName),
            parseFloat(item.Target),
          ],
          (tx, results) => {},
          err => {
            console.error('error targ=', err);
          },
        );
      }
    });
  });
}

export async function insertPcustomer(PcustomerData: any) {
  db1.transaction(tx => {
    tx.executeSql('DELETE from Pcustomer', [], (tx, results) => {
      //  let len = PcustomerData.length;
      let count = 0;
      for (let item of PcustomerData) {
        tx.executeSql(
          `insert into Pcustomer(CustomerId ,Party ,LicenceNo ,IsActive ,ERPCode ,RouteID ,RouteName ,AREAID ,AREA 
                  ,BRANCHID ,BRANCH ,CUSTOMERCLASSID ,CUSTOMERCLASS ,CUSTOMERCLASS2ID ,CUSTOMERCLASS2 ,CUSTOMERGROUPID ,
                  CUSTOMERGROUP ,CUSTOMERSEGMENTID ,CUSTOMERSEGMENT ,CUSTOMERSUBSEGMENTID , CUSTOMERSUBSEGMENT ,
                  LICENCETYPEID ,LICENCETYPE ,OCTROIZONEID ,OCTROIZONE,Outlet_Info,DefaultDistributorId,SchemeID,PriceListId,userid,Latitude,Longitude,isLatLongSynced,WeeklyOff,CreditLimit,CreditDays)
                                                                      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            String(item.CustomerId),
            String(item.Party),
            String(item.LicenceNo),
            String(item.IsActive),
            String(item.ERPCode),
            String(item.RouteID),
            String(item.RouteName),
            String(item.AREAID),
            String(item.AREA),
            String(item.BRANCHID),
            String(item.BRANCH),
            String(item.CUSTOMERCLASSID),
            String(item.CUSTOMERCLASS),
            String(item.CUSTOMERCLASS2ID),
            String(item.CUSTOMERCLASS2),
            String(item.CUSTOMERGROUPID),
            String(item.CUSTOMERGROUP),
            String(item.CUSTOMERSEGMENTID),
            String(item.CUSTOMERSEGMENT),
            String(item.CUSTOMERSUBSEGMENTID),
            String(item.CUSTOMERSUBSEGMENT),
            String(item.LICENCETYPEID),
            String(item.LICENCETYPE),
            String(item.OCTROIZONEID),
            String(item.OCTROIZONE),
            String(item.OUTLETINFO),
            String(item.DefaultDistributorId),
            String(item.SchemeID),
            String(item.PriceListId),
            String(item.userid),
            String(item?.Latitude),
            String(item?.Longitude),
            String(item?.isLatLongSynced),
            String(item?.WEEKOFF),
            String(item?.CreditLimit),
            String(item?.CreditDays),
          ],
          (tx, results) => {},
          err => {
            console.error('error p cus=', err);
          },
        );
      }
    });
  });
}

export async function insertDistributorContacts(DistributorContactsData: any) {
  db1.transaction(tx => {
    tx.executeSql('DELETE from DistributorContacts', [], (tx, results) => {
      // let len = DistributorContactsData?.length;
      let count = 0;

      for (let item of DistributorContactsData) {
        tx.executeSql(
          `insert into DistributorContacts(DistributorID ,SequenceNo ,ContactPerson ,ContactNumber,userid )
                                                                  VALUES (?,?,?,?,?)`,
          [
            String(item.DistributorID),
            String(item.SequenceNo),
            String(item.ContactPerson),
            String(item.ContactNumber),
            String(item.userid),
          ],
          (tx, results) => {},
          err => {
            console.error('error disc con=', err);
          },
        );
      }
    });
  });
}

export async function insertDistributorDataStatus(
  DistributorDataStatusData: any,
) {
  db1.transaction(tx => {
    tx.executeSql('DELETE from DistributorDataStatus', [], (tx, results) => {
      // let len = DistributorDataStatusData?.length;
      let count = 0;

      for (let item of DistributorDataStatusData) {
        tx.executeSql(
          `insert into DistributorDataStatus(Branch , DistributorID , Area , Day7 , Day6 ,Day5 , Day4 , Day3 , Day2 , Day1 , LastUploadDate , LastInvoiceDate, userid )
                                                                      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            String(item.Branch),
            String(item.DistributorID),
            String(item.Area),
            String(item.Day7),
            String(item.Day6),
            String(item.Day5),
            String(item.Day4),
            String(item.Day3),
            String(item.Day2),
            String(item.Day1),
            String(item.LastUploadDate),
            String(item.LastInvoiceDate),
            String(item.userid),
          ],
          (tx, results) => {},
          err => {
            console.error('error=', err);
          },
        );
      }
    });
  });
}

export async function insertSalesYTD(SalesYTDData: any) {
  db1.transaction(tx => {
    tx.executeSql('DELETE from SalesYTD', [], (tx, results) => {
      // let len = SalesYTDData?.length;
      let count = 0;
      for (let item of SalesYTDData) {
        tx.executeSql(
          `insert into SalesYTD(UserID , DistributorID , CustomerID , ItemID , Quantity , Value, user_id  )
                                                                    VALUES (?,?,?,?,?,?,?)`,
          [
            String(item.UserID),
            String(item.DistributorID),
            String(item.CustomerID),
            String(item.ItemID),
            String(item.Quantity),
            String(item.Value),
            String(item.userid1),
          ],
          (tx, results) => {},
          err => {
            console.error('error s ytd=', err);
          },
        );
      }
    });
  });
}

export async function insertReportControlMaster(ReportControlMasterData: any) {
  db1.transaction(tx => {
    tx.executeSql(
      "UPDATE SQLITE_SEQUENCE SET seq = 0 WHERE name = 'ReportControlMaster'",
      [],
      (tx, results) => {
        tx.executeSql('DELETE from ReportControlMaster', [], (tx, results) => {
          // let len = ReportControlMasterData?.length;
          let count = 0;

          for (let item of ReportControlMasterData) {
            tx.executeSql(
              `insert into ReportControlMaster(ControlName , ControlId , ReferenceColumn )
                                                                    VALUES (?,?,?)`,
              [
                String(item.ControlName),
                String(item.ControlId),
                String(item.ReferenceColumn),
              ],
              (tx, results) => {
                // console.log('ReportControlMaster--->', results);
              },
              err => {
                console.error('error=', err);
              },
            );
          }
        });
      },
    );
  });
}

export async function insertReport(ReportData: any) {
  db1.transaction(tx => {
    tx.executeSql('DELETE from Report', [], (tx, results) => {
      // let len = ReportData?.length;
      let count = 0;

      for (let item of ReportData) {
        tx.executeSql(
          `insert into Report(MenuKey , Classification , ComboClassification ,LabelName ,IsActive)
                                                                    VALUES (?,?,?,?,?)`,
          [
            String(item.MenuKey),
            String(item.Classification),
            String(item.ComboClassification),
            String(item.LabelName),
            String(item.IsActive),
          ],
          (tx, results) => {},
          err => {
            console.error('error=', err);
          },
        );
      }
    });
  });
}

export async function insertAreaParentList(AreaParentListData: any) {
  db1.transaction(tx => {
    // let len = AreaParentListData?.length;
    let count = 0;
    for (let item of AreaParentListData) {
      tx.executeSql(
        `insert into AreaParentList(Areaid , Area ,AreaParentId )
                                                                  VALUES (?,?,?)`,
        [String(item.Areaid), String(item.Area), String(item.AreaParentId)],
        (tx, results) => {},
        err => {
          console.error('error=', err);
        },
      );
    }
  });
}

export async function insertPItem(PItemData: any) {
  db1.transaction(tx => {
    tx.executeSql('DELETE from PItem', [], (tx, results) => {
      //   let len = PItemData.length;
      let count = 0;
      for (let item of PItemData) {
        tx.executeSql(
          `insert into PItem(ItemId , Item , ItemAlias , BPC , BPC1 , BPC2 ,ErpCode , Volume , ReportingQuantity , 
                MRP , PTR , BRANDID , BRAND , DIVISIONID , DIVISION , FLAVOURID , FLAVOUR ,ITEMCLASSID ,
                 ITEMCLASS, ITEMGROUPID , ITEMGROUP , ITEMSIZEID  , ITEMSIZE ,
                  ITEMSUBGROUPID , ITEMSUBGROUP, ITEMTYPEID, ITEMTYPE, ITEMSEQUENCE , Focus ,
                  IsSelectedBrand ,IsSelectedBrandProduct,bottleQut,SchemeID,ScanCode,userid,GSTRate)
                  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            String(item.ItemId),
            String(item.Item),
            String(item.ItemAlias),
            String(item.BPC),
            String(item.BPC1),
            String(item.BPC2),
            String(item.ErpCode),
            String(item.Volume),
            String(item.ReportingQuantity),
            String(item.MRP),
            String(item.PTR),
            String(item.BRANDID),
            String(item.BRAND),
            String(item.DIVISIONID),
            String(item.DIVISION),
            String(item.FLAVOURID),
            String(item.FLAVOUR),
            String(item.ITEMCLASSID),
            String(item.ITEMCLASS),
            String(item.ITEMGROUPID),
            String(item.ITEMGROUP),
            String(item.ITEMSIZEID),
            String(item.ITEMSIZE),
            String(item.ITEMSUBGROUPID),
            String(item.ITEMSUBGROUP),
            String(item.ITEMTYPEID),
            String(item.ITEMTYPE),
            String(item.ITEMSEQUENCE),
            String(item.ISFOCUS),
            '',
            '',
            '0',
            String(item.SchemeID),
            String(item.ScanCode),
            String(item.userid),
            String(item.GSTRate),
          ],
          (tx, results) => {
            // console.log('Pitem inserted -->', results);
          },
          err => {
            console.error('error=', err);
          },
        );
      }
    });
  });
}

export async function insertSIPREPORT(SIPREPORTData: any) {
  db1.transaction(tx => {
    let len = SIPREPORTData?.length;
    let count = 0;

    for (let item of SIPREPORTData) {
      tx.executeSql(
        `insert into SIPREPORT(UserId ,ReportMonth ,SrNo ,AEID ,AMID ,AM ,Executive ,FromDate ,ToDate ,
              TargetPoints ,TotalPoints ,TargetAcheived ,TeamAcheived ,TeamAcheivementQuantity ,TeamTargetQuantity ,
              IsManager ,Percentage ,Bucket   )
                                                                  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          String(item.UserId),
          String(item.ReportMonth),
          String(item.SrNo),
          String(item.AEID),
          String(item.AMID),
          String(item.AM),
          String(item.Executive),
          String(item.FromDate),
          String(item.ToDate),
          String(item.TargetPoints),
          String(item.TotalPoints),
          String(item.TargetAcheived),
          String(item.TeamAcheived),
          String(item.TeamAcheivementQuantity),
          String(item.TeamTargetQuantity),
          String(item.IsManager),
          String(item.Percentage),
          String(item.Bucket),
        ],
        (tx, results) => {},
        err => {
          console.error('error=', err);
        },
      );
    }
  });
}

export async function insertTABLE_TEMP_OrderMaster(
  id: number | string,
  Current_date_time: string,
  entity_type: string,
  entity_id: number | string,
  latitude: number | string,
  longitude: number | string,
  total_amount: number | string,
  collection_type: string,
  user_id: string,
  selected_flag: string,
) {
  console.log('temp o mast--->', id);
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        `insert into TABLE_TEMP_OrderMaster(id,Current_date_time,entity_type,entity_id,latitude,
              longitude ,total_amount ,collection_type ,user_id,selected_flag   )
                                                                  VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [
          String(id),
          String(Current_date_time),
          String(entity_type),
          String(entity_id),
          String(latitude),
          String(longitude),
          String(total_amount),
          String(collection_type),
          String(user_id),
          String(selected_flag),
        ],
        (tx, results) => {
          resolve(results);
        },
        err => {
          console.error('error=', err);
        },
      );
    });
  });
}

export async function insertRO_BankCustomer(RO_BankCustomer: any) {
  db1.transaction(tx => {
    tx.executeSql('DELETE from RO_BankCustomer', [], (tx, results) => {
      let len = RO_BankCustomer?.length;
      let count = 0;

      for (let item of RO_BankCustomer) {
        tx.executeSql(
          `insert into RO_BankCustomer(Id,BankName,UserId,BankPriority,CustomerId)
                                        VALUES (?,?,?,?,?)`,
          [
            String(item.Id),
            String(item.BankName),
            String(item.UserId),
            String(item.BankPriority),
            String(item.CustomerId),
          ],
          (tx, results) => {},
          err => {
            console.error('error insertRO_BankCustomer=', err);
          },
        );
      }
    });
  });
}

export async function deleteRO_BankCustomer() {
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql('DELETE from RO_BankCustomer', [], (tx, results) => {
        resolve(results);
      });
    });
  });
}

/////////////
export async function deleteTempDiscount(
  orderId: number | string,
  itemId: string,
) {
  return new Promise(resolve => {
    let query =
      'delete from TABLE_DISCOUNT where flag="D" and OrderID = "' +
      orderId +
      '" and OrderedItemID ="' +
      itemId +
      '"';

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        resolve(results);
      });
    });
  });
}

export async function deleteTableDiscountForSideOrder(
  orderId: string,
  itemId: string,
  DiscType: string,
  DiscAmt: string | number,
  RNP: string,
) {
  return new Promise(resolve => {
    let query =
      'delete from TABLE_DISCOUNT where flag="D" and OrderID = "' +
      orderId +
      '" and OrderedItemID ="' +
      itemId +
      '" and DiscountType ="' +
      DiscType +
      '" and RNP ="' +
      RNP +
      '" and DiscountAmount ="' +
      String(DiscAmt) +
      '"';

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        resolve(results);
      });
    });
  });
}

export async function deleteTempDiscount2(OID: string, itemId: string) {
  console.log('delete table disc -->', OID);

  return new Promise(resolve => {
    let query =
      'delete from TABLE_DISCOUNT where flag="S" and  OrderID = "' +
      OID +
      '" and OrderedItemID ="' +
      itemId +
      '"';

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        console.log('ress delete disc');

        resolve(results);
      });
    });
  });
}

export async function getTableDiscount(orderID: string) {
  return new Promise(resolve => {
    let query = 'SELECT * FROM TABLE_DISCOUNT WHERE OrderID= "' + orderID + '"';
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getInsertedsTempOrder = [];
        for (let i = 0; i < results.rows.length; i++) {
          getInsertedsTempOrder.push(results.rows.item(i));
        }
        resolve(getInsertedsTempOrder);
      });
    });
  });
}

export async function getDiscountedData(orderID: string) {
  let query =
    `SELECT TABLE_DISCOUNT.OrderID, TABLE_DISCOUNT.DiscountType, TABLE_DISCOUNT.DiscountAmount, TABLE_DISCOUNT.OnAmount, TABLE_DISCOUNT.RNP, TABLE_DISCOUNT.Rate, TABLE_DISCOUNT.BrandCode, OrderDetails.item_id, OrderDetails.quantity_one, OrderDetails.quantity_two, OrderDetails.Amount, PItem.Item, PItem.BPC,PItem.BRAND, PItem.DIVISION, PItem.FLAVOUR
            FROM OrderDetails
            INNER JOIN TABLE_DISCOUNT
            ON TABLE_DISCOUNT.OrderID = OrderDetails.order_id
            INNER JOIN PItem
            ON Pitem.ItemId = OrderDetails.item_id
            WHERE OrderDetails.order_id = "` +
    orderID +
    '"AND BrandCode IS NOT NULL GROUP BY Item';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let len = results.rows.length;
        let checkorder = [];
        for (let i = 0; i < results.rows.length; i++) {
          checkorder.push(results.rows.item(i));
        }
        resolve(checkorder);
      });
    });
  });
}

export async function getTABLE_DISCOUNTforEdit(
  id: string | number,
  orderID: string,
) {
  return new Promise(resolve => {
    let query =
      "SELECT * FROM TABLE_DISCOUNT WHERE id ='" +
      id +
      "' AND OrderID = '" +
      orderID +
      "' ";
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getInsertedsTempOrder = [];
        for (let i = 0; i < results.rows.length; i++) {
          getInsertedsTempOrder.push(results.rows.item(i));
        }
        resolve(getInsertedsTempOrder);
      });
    });
  });
}

export async function getDISCOUNTEDItemforEdit(
  id: string | number,
  orderID: string,
) {
  return new Promise(resolve => {
    let query =
      "SELECT TABLE_DISCOUNT.id, TABLE_DISCOUNT.BrandCode,PItem.Item, PItem.DIVISION, PItem.FLAVOUR FROM TABLE_DISCOUNT INNER JOIN TABLE_TEMP_CategoryDiscountItem ON TABLE_TEMP_CategoryDiscountItem.DiscountId = TABLE_DISCOUNT.id INNER JOIN PItem ON PItem.ItemId = TABLE_TEMP_CategoryDiscountItem.ItemId WHERE TABLE_DISCOUNT.id ='" +
      id +
      "' AND TABLE_DISCOUNT.OrderId = '" +
      orderID +
      "' ";
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getInsertedsTempOrder = [];
        for (let i = 0; i < results.rows.length; i++) {
          getInsertedsTempOrder.push(results.rows.item(i));
        }
        resolve(getInsertedsTempOrder);
      });
    });
  });
}

export async function getDISCOUNTEDItemforCNOEdit(id: number) {
  return new Promise(resolve => {
    let query =
      "SELECT TABLE_DISCOUNT.BrandCode, PItem.ItemId, PItem.Item, PItem.DIVISION, PItem.FLAVOUR FROM PItem INNER JOIN TABLE_TEMP_CategoryDiscountItem ON TABLE_TEMP_CategoryDiscountItem.ItemId = PItem.ItemId INNER JOIN TABLE_DISCOUNT ON TABLE_TEMP_CategoryDiscountItem.DiscountId = TABLE_DISCOUNT.id WHERE TABLE_TEMP_CategoryDiscountItem.DiscountId ='" +
      id +
      "' ";

    console.log('query -->', query);

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getInsertedsTempOrder = [];
        for (let i = 0; i < results.rows.length; i++) {
          getInsertedsTempOrder.push(results.rows.item(i));
        }
        resolve(getInsertedsTempOrder);
      });
    });
  });
}

////////////
export async function insertTABLE_DISCOUNT(
  OrderID: string,
  DiscountType: string,
  DiscountAmount: string | number,
  discountadd: string,
  discountless: string,
  RNP: string,
  OnAmount: string | number,
  OnAmountSmallUnit: string | number,
  Rate: string | number,
  BookCode: string,
  OrderedItemID: string,
  BrandCode: string,
  ItemCode: string,
  syncFlag: string,
  discountOnType: string,
  cases: string | number,
  btl: string | number,
  amount: string | number,
  bpc: string | number,
  btlConv: string | number,
  flag: string,
  ItemName: string,
) {
  console.log('tab disc -->', OrderID, DiscountType);

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        `insert into TABLE_DISCOUNT(OrderID, DiscountType, DiscountAmount, discountadd , discountless , 
              RNP ,OnAmount ,OnAmountSmallUnit ,Rate ,BookCode ,OrderedItemID ,BrandCode ,ItemCode,syncFlag, discountOnType, Cases, Bottle, Amount, BPC, BtlConversion, flag,ItemName  )
                                                                  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          String(OrderID),
          String(DiscountType),
          String(DiscountAmount),
          String(discountadd),
          String(discountless),
          String(RNP),
          String(OnAmount),
          String(OnAmountSmallUnit),
          String(Rate),
          String(BookCode),
          String(OrderedItemID),
          String(BrandCode),
          String(ItemCode),
          String(syncFlag),
          String(discountOnType),
          String(cases),
          String(btl),
          String(amount),
          String(bpc),
          String(btlConv),
          String(flag),
          String(ItemName),
        ],
        (tx, results) => {
          resolve(results);
        },
        err => {
          console.error('error=', err);
        },
      );
    });
  });
}

export async function deleteTABLE_DISCOUNT1(id: string | number) {
  return new Promise(resolve => {
    let query = "DELETE FROM TABLE_DISCOUNT WHERE id ='" + id + "' ";

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getInsertedsTempOrder = [];
        for (let i = 0; i < results.rows.length; i++) {
          getInsertedsTempOrder.push(results.rows.item(i));
        }
        resolve(getInsertedsTempOrder);
      });
    });
  });
}

export async function checkIsRowExistInTABLEDICOUNT(
  order_id: string,
  itemId: string,
  flag: string,
) {
  //console.log("saar", order_id)
  return new Promise(resolve => {
    let query =
      'SELECT id FROM TABLE_DISCOUNT where OrderID ="' +
      order_id +
      '" and OrderedItemID ="' +
      itemId +
      '" and flag ="' +
      flag +
      '"';
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let checkorder = [];
        for (let i = 0; i < results.rows.length; i++) {
          checkorder.push(results.rows.item(i));
        }
        resolve(checkorder);
      });
    });
  });
}

//change by Manish
export async function updateTABLE_DISCOUNTForSideOrder(
  DiscountType: string,
  DiscountAmount: string,
  RNP: string,
  Rate: string,
  order_id: string,
  item_id: string,
  flag: string,
) {
  return new Promise(resolve => {
    console.log(
      order_id,
      item_id,
      flag,
      DiscountType,
      DiscountAmount,
      RNP,
      Rate,
    );

    db1.transaction(tx => {
      tx.executeSql(
        'UPDATE TABLE_DISCOUNT SET DiscountType = ?, DiscountAmount = ?, RNP = ?, Rate = ? WHERE OrderId = "' +
          order_id +
          '" and OrderedItemID = "' +
          item_id +
          '" and flag = "' +
          flag +
          '"',
        [
          String(DiscountType),
          String(DiscountAmount),
          String(RNP),
          String(Rate),
        ],
        (tx, results) => {
          resolve(results);
        },
      );
    });
  });
}

export async function deleteTABLE_TEMP_CategoryDiscountItem(
  id: number | string,
) {
  return new Promise(resolve => {
    let query =
      "DELETE FROM TABLE_TEMP_CategoryDiscountItem WHERE DiscountId ='" +
      id +
      "' ";
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getInsertedsTempOrder = [];
        for (let i = 0; i < results.rows.length; i++) {
          getInsertedsTempOrder.push(results.rows.item(i));
        }
        resolve(getInsertedsTempOrder);
      });
    });
  });
}

export async function updateTABLE_DISCOUNT1(
  DiscountType: string,
  DiscountAmount: string | number,
  RNP: string,
  OnAmount: string | number,
  Rate: string | number,
  BrandCode: string,
  discountOnType: string,
  orderID: string | number,
  id: string | number,
  cases: string | number,
  btl: string | number,
  amount: string | number,
  bpc: string | number,
  btlConv: string | number,
) {
  return new Promise(resolve => {
    let query =
      "UPDATE TABLE_DISCOUNT SET DiscountType ='" +
      DiscountType +
      "',DiscountAmount = '" +
      DiscountAmount +
      "',RNP ='" +
      RNP +
      "' , OnAmount ='" +
      OnAmount +
      "' , Rate ='" +
      Rate +
      "' , BrandCode ='" +
      BrandCode +
      "' , discountOnType ='" +
      discountOnType +
      "' , Cases ='" +
      cases +
      "' , Bottle ='" +
      btl +
      "' , Amount ='" +
      amount +
      "' , BPC ='" +
      bpc +
      "' , BtlConversion ='" +
      btlConv +
      "' WHERE id = '" +
      id +
      "' AND OrderID = '" +
      orderID +
      "' ";

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getInsertedsTempOrder = [];
        for (let i = 0; i < results.rows.length; i++) {
          getInsertedsTempOrder.push(results.rows.item(i));
        }
        resolve(getInsertedsTempOrder);
      });
    });
  });
}

export async function updateTABLE_DISCOUNT(
  DiscountType: string,
  DiscountAmount: string | number,
  RNP: string,
  OnAmount: string | number,
  Rate: string | number,
  BrandCode: string,
  discountOnType: string | number,
  OrderID: string | number,
  id: string | number,
  cases: string | number,
  btl: string | number,
  amount: string | number,
  bpc: string | number,
  btlConv: string | number,
) {
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        `UPDATE TABLE_DISCOUNT SET DiscountType = ?,DiscountAmount = ?,RNP = ?,OnAmount = ?,Rate =?,BrandCode=? ,discountOnType= ?, Cases=?,Bottle=?, Amount=?, BPC=?, BtlConversion=? where OrderID = ? and id = ?`,
        [
          String(DiscountType),
          String(DiscountAmount),
          String(RNP),
          String(OnAmount),
          String(Rate),
          String(BrandCode),
          String(discountOnType),
          String(OrderID),
          String(id),
          String(cases),
          String(btl),
          String(amount),
          String(bpc),
          String(btlConv),
        ],
        (tx, results) => {
          resolve(results);
        },
        err => {
          console.error('error=', err);
        },
      );
    });
  });
}

export async function insertintoTABLE_TEMP_CategoryDiscountItem(
  Discountid: string | number,
  OrderId: string,
  ItemID: string,
  Onqtycs: string | number,
  OnqtyBtl: string | number,
  OnAmount: string | number,
  flag: string,
) {
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        `insert into TABLE_TEMP_CategoryDiscountItem(DiscountId, OrderId, ItemId , OnQtyCS , 
            OnQtyBTL ,OnAmount,SyncFlag)
            VALUES (?,?,?,?,?,?,?)`,
        [
          String(Discountid),
          String(OrderId),
          String(ItemID),
          String(Onqtycs),
          String(OnqtyBtl),
          String(OnAmount),
          String(flag),
        ],
        (tx, results) => {
          resolve(results);
        },
        err => {
          console.error('error=', err);
        },
      );
    });
  });
}

export async function getOutletParty() {
  let query = 'SELECT DISTINCT Party, CustomerId FROM Pcustomer';
  return new Promise<getOutletParty_OP_Report[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempSearchProdect = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempSearchProdect.push(results.rows.item(i));
        }
        resolve(tempSearchProdect);
      });
    });
  });
}

export async function getBrands(uid: string) {
  let query =
    'SELECT DISTINCT BRAND, BRANDID FROM PItem WHERE userid ="' +
    uid +
    '" order by 1';
  return new Promise<getBrands_OP_Report[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempSearchProdect = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempSearchProdect.push(results.rows.item(i));
        }
        resolve(tempSearchProdect);
      });
    });
  });
}

export async function getSKU(uid: string) {
  let query =
    'SELECT DISTINCT Item, ItemId FROM PItem WHERE userid ="' +
    uid +
    '" order by 1';
  return new Promise<getSKU_OP_Report[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempSearchProdect = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempSearchProdect.push(results.rows.item(i));
        }
        resolve(tempSearchProdect);
      });
    });
  });
}

export async function getSize(uid: string) {
  let query =
    'SELECT DISTINCT ITEMSIZE, ITEMSIZEID, Item FROM PItem WHERE userid ="' +
    uid +
    '" order by 3';
  return new Promise<getSize_OP_Report[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempSearchProdect = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempSearchProdect.push(results.rows.item(i));
        }
        resolve(tempSearchProdect);
      });
    });
  });
}

export async function getItemIDFromBrandId(brandIDs: string[]) {
  let query = `select distinct PItem.ItemId FROM PItem where BRANDID in(${brandIDs})`;
  // console.log('query -->', query);

  return new Promise<any[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempSearchProdect = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempSearchProdect.push(results.rows.item(i));
        }
        resolve(tempSearchProdect);
      });
    });
  });
}

export async function getOrderIdFromItemId(itemIDs: string[]) {
  let query = `select DISTINCT OrderMaster.id as orderId from OrderMaster, PItem, OrderDetails where OrderDetails.item_id=PItem.ItemId and OrderMaster.id=OrderDetails.order_id and OrderDetails.item_id in(${itemIDs})`;
  // console.log('query -->', query);

  return new Promise<any[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempSearchProdect = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempSearchProdect.push(results.rows.item(i));
        }
        resolve(tempSearchProdect);
      });
    });
  });
}

export async function updateMasterMain(
  Current_date_time: string,
  entity_type: string | number,
  entity_id: string,
  latitude: string | number,
  longitude: string | number,
  total_amount: string | number,
  from_date: string,
  to_date: string,
  order_id: string,
  collection_type: string,
  ExpectedDeliveryDate: string,
  check_date: string,
  ActivityEnd: string,
) {
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        'UPDATE OrderMaster SET  Current_date_time = ?,entity_type = ? ,entity_id = ?,latitude = ?,longitude = ?,total_amount = ?, from_date=?,to_date = ?,ExpectedDeliveryDate=?,check_date=?,ActivityEnd=? where id = ? and collection_type = ? ',
        [
          String(Current_date_time),
          String(entity_type),
          String(entity_id),
          String(latitude),
          String(longitude),
          String(total_amount),
          String(from_date),
          String(to_date),
          String(ExpectedDeliveryDate),
          String(check_date),
          String(ActivityEnd),
          String(order_id),
          String(collection_type),
        ],
        (tx, results) => {},
        err => {
          console.error('error=', err);
        },
      );
    });
  });
}

export async function insertOrderDetails(
  order_id: string,
  item_id: string,
  item_Name: string,
  quantity_one: string,
  quantity_two: string,
  small_Unit: string,
  large_Unit: string,
  rate: string,
  Amount: string,
  selected_flag: string,
  sync_flag: string,
  bottleQty: string,
  BrandId: string,
  entityId: string,
  CollectionType: string,
  uid: string,
  GSTRate: string,
  GSTTotal: string,
  GrossAmount: String,
) {
  // alert("detail inserted to main")
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        `insert into  OrderDetails(order_id,item_id,item_Name,quantity_one,quantity_two,small_Unit
           ,large_Unit,rate ,Amount,selected_flag,sync_flag,bottleQty,BrandId,entityId,CollectionType,userid,GSTRate,GSTTotal,GrossAmount )
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          String(order_id),
          String(item_id),
          String(item_Name),
          String(quantity_one),
          String(quantity_two),
          String(small_Unit),
          String(large_Unit),
          String(rate),
          String(Amount),
          String(selected_flag),
          String(sync_flag),
          String(bottleQty),
          String(BrandId),
          String(entityId),
          String(CollectionType),
          String(uid),
          String(GSTRate),
          String(GSTTotal),
          String(GrossAmount),
        ],
        (tx, results) => {
          resolve(results);
        },
        err => {
          console.error('error=', err);
        },
      );
    });
  });
}

export async function updateDetailMain(
  quantity_one: string,
  quantity_two: string,
  small_Unit: string,
  large_Unit: string,
  rate: string,
  Amount: string,
  order_id: string,
  item_id: string,
) {
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        'UPDATE OrderDetails SET quantity_one = ?, quantity_two = ?, small_Unit = ?, large_Unit = ?,rate = ?, Amount = ? WHERE order_id = ? and item_id = ? ',
        [
          String(quantity_one),
          String(quantity_two),
          String(small_Unit),
          String(large_Unit),
          String(rate),
          String(Amount),
          String(order_id),
          String(item_id),
        ],
        (tx, results) => {
          resolve(results);
        },
        err => {
          console.error('error=', err);
        },
      );
    });
  });
}

export async function insertuses_log(
  menu_keys: string,
  uses_datetime: string,
  is_sync: string,
) {
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        `insert into uses_log(menu_keys,uses_datetime ,is_sync) VALUES (?,?,?)`,
        [String(menu_keys), String(uses_datetime), String(is_sync)],
        (tx, results) => {
          // console.log('SUCCESSSTORY', results);
        },
        err => {
          console.log('ERRORO INSERTIME::', err);
        },
      );
    });
  });
}

export async function insertImagesDetails(
  order_id: any,
  image_date_time: any,
  image_name: any,
  Path: any,
  is_sync: any,
) {
  //initDB().then((db) => {
  db1.transaction(tx => {
    //  for (let item of ImagesDetailsData) {
    tx.executeSql(
      `insert into  ImagesDetails(order_id ,image_date_time ,image_name,Path,is_sync )
                                                                  VALUES (?,?,?,?,?)`,
      [
        String(order_id),
        String(image_date_time),
        String(image_name),
        String(Path),
        String(is_sync),
      ],
      (tx, results) => {},
      err => {
        console.error('error=', err);
      },
    );
  });
}

//change by vibha
export async function insertTABLE_TEMP_ORDER_DETAILS(
  order_id: string,
  item_id: string,
  item_Name: string,
  quantity_one: string | number,
  quantity_two: string | number,
  large_Unit: string | number,
  small_Unit: string | number,
  from_date: string,
  to_date: string,
  rate: string | number,
  bpc: string | number,
  Amount: string | number,
  selected_flag: string,
  bottleQty: string,
  BrandId: string,
  entityId: string,
  CollectionType: string,
  brand: string,
  Division: string,
  Flavour: string,
  GSTRate: string | number,
  GSTTotal: string | number,
  TotalCalculatedAmt: string | number,
) {
  console.log('Data check Point', GSTRate, GSTTotal, TotalCalculatedAmt);

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        `insert into  TABLE_TEMP_ORDER_DETAILS(order_id,item_id,item_Name,quantity_one ,quantity_two ,
              small_Unit ,large_Unit,from_date,
              to_date ,rate  ,bpc  ,Amount ,selected_flag,bottleQty,BrandId,entityId,CollectionType,TEMP_BRAND,TEMP_DIVISION,TEMP_FLAVOUR, GSTRate, GSTTotal,GrossAmount)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          String(order_id),
          String(item_id),
          String(item_Name),
          String(quantity_one),
          String(quantity_two),
          String(small_Unit),
          String(large_Unit),
          String(from_date),
          String(to_date),
          String(rate),
          String(bpc),
          String(Amount),
          String(selected_flag),
          String(bottleQty),
          String(BrandId),
          String(entityId),
          String(CollectionType),
          String(brand),
          String(Division),
          String(Flavour),
          String(GSTRate),
          String(GSTTotal),
          String(TotalCalculatedAmt),
        ],
        (tx, results) => {
          resolve(results);
        },
        err => {
          console.error('error=', err);
        },
      );
    });
  });
}

export async function insertnewpartyoutlet(newpartyoutlet: any) {
  // console.log('newpartyoutlet insert --->', newpartyoutlet);
  if (newpartyoutlet.length) {
    db1.transaction(tx => {
      tx.executeSql('DELETE from newpartyoutlet', [], (tx, results) => {
        for (let i = 0; i < newpartyoutlet.length; i++) {
          tx.executeSql(
            `insert into  newpartyoutlet(OrderID,BitID,OutletName,ContactNo,OwnersName,OutletAddress,Remark,Latitude,Longitude,AddedDate,UserId)
                                                                  VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
            [
              String(newpartyoutlet[i].MobileGenPrimaryKey),
              String(newpartyoutlet[i].BeatID),
              String(newpartyoutlet[i].OutletName),
              String(newpartyoutlet[i].ContactNumber),
              String(newpartyoutlet[i].OwnersName),
              String(newpartyoutlet[i].OutletAddress),
              String(newpartyoutlet[i].Remark),
              String(newpartyoutlet[i].Latitude),
              String(newpartyoutlet[i].Longitude),
              String(newpartyoutlet[i].AddedOnDate),
              String(newpartyoutlet[i].UserId),
            ],
            (tx, results) => {},
            err => {},
          );
        }
      });
    });
  }
}
export async function insertnewpartyImageoutlet(newpartyImageoutletData: any) {
  db1.transaction(tx => {
    let len = newpartyImageoutletData?.length;
    let count = 0;

    for (let item of newpartyImageoutletData) {
      tx.executeSql(
        `insert into  newpartyImageoutlet(OrderID,Is_Sync,ImageName,ShopId)
                                                                  VALUES (?,?,?,?)`,
        [
          String(item.OrderID),
          String(item.Is_Sync),
          String(item.ImageName),
          String(item.ShopId),
        ],
        (tx, results) => {},
        err => {
          console.error('error=', err);
        },
      );
    }
  });
}
export async function insertuommaster(uommasterData: any) {
  db1.transaction(tx => {
    tx.executeSql(
      "UPDATE SQLITE_SEQUENCE SET seq = 0 WHERE name = 'uommaster'",
      [],
      (tx, results) => {
        tx.executeSql('DELETE from uommaster  ', [], (tx, results) => {
          let len = uommasterData?.length;
          let count = 0;

          for (let item of uommasterData) {
            tx.executeSql(
              `insert into  uommaster(UOMDescription, ConvToBase , Formula , UOMKey , IsQuantity,
                ConversionFormula ,ConversionUomFormula  )
                VALUES (?,?,?,?,?,?,?)`,
              [
                String(item.UOMDescription),
                String(item.ConvToBase),
                String(item.Formula),
                String(item.UOMKey),
                String(item.IsQuantity),
                String(item.ConversionFormula),
                String(item.ConversionUomFormula),
              ],
              (tx, results) => {},
              err => {
                console.error('error=', err);
              },
            );
          }
        });
      },
    );
  });
}

export async function insertOrderMaster(OrderMaster: any) {
  // Validate input data first
  if (!OrderMaster || OrderMaster.length === 0) {
    console.warn('insertOrderMaster: No data provided, skipping operation');
    return;
  }

  return new Promise<void>((resolve, reject) => {
    db1.transaction(
      tx => {
        try {
          // Step 1: Create backup of existing synced data
          tx.executeSql(
            'CREATE TEMPORARY TABLE OrderMaster_Backup AS SELECT * FROM OrderMaster WHERE sync_flag="Y"',
            [],
            (tx, results) => {
              console.log('Backup created for OrderMaster');

              // Step 2: Delete old synced data
              tx.executeSql(
                'DELETE FROM OrderMaster WHERE sync_flag="Y"',
                [],
                (tx, results) => {
                  console.log(
                    `Deleted ${results.rowsAffected} old OrderMaster records`,
                  );

                  // Step 3: Insert new data with error tracking
                  let successCount = 0;
                  let errorCount = 0;

                  const insertNextItem = (index: number) => {
                    if (index >= OrderMaster.length) {
                      // All items processed
                      if (successCount === OrderMaster.length) {
                        // All successful - drop backup and resolve
                        tx.executeSql(
                          'DROP TABLE OrderMaster_Backup',
                          [],
                          (tx, results) => {
                            console.log(
                              `âœ… Successfully inserted ${successCount} OrderMaster records`,
                            );
                            resolve();
                          },
                          (tx, error) => {
                            console.warn(
                              'Warning: Could not drop backup table:',
                              error,
                            );
                            resolve(); // Still resolve since main operation succeeded
                          },
                        );
                      } else {
                        // Some failed - restore from backup
                        console.error(
                          `âŒ Only ${successCount}/${OrderMaster.length} inserts succeeded. Restoring backup...`,
                        );
                        tx.executeSql(
                          'DELETE FROM OrderMaster WHERE sync_flag="Y"',
                          [],
                          (tx, results) => {
                            tx.executeSql(
                              'INSERT INTO OrderMaster SELECT * FROM OrderMaster_Backup',
                              [],
                              (tx, results) => {
                                tx.executeSql(
                                  'DROP TABLE OrderMaster_Backup',
                                  [],
                                  (tx, results) => {
                                    reject(
                                      new Error(
                                        `Failed to insert OrderMaster: Only ${successCount}/${OrderMaster.length} succeeded`,
                                      ),
                                    );
                                  },
                                  (tx, error) => {
                                    reject(
                                      new Error(
                                        `Failed to insert OrderMaster: Only ${successCount}/${OrderMaster.length} succeeded`,
                                      ),
                                    );
                                  },
                                );
                              },
                              (tx, error) => {
                                reject(
                                  new Error(
                                    `Failed to restore OrderMaster from backup: ${error.message}`,
                                  ),
                                );
                              },
                            );
                          },
                          (tx, error) => {
                            reject(
                              new Error(
                                `Failed to clear OrderMaster before restore: ${error.message}`,
                              ),
                            );
                          },
                        );
                      }
                      return;
                    }

                    const item = OrderMaster[index];

                    // Validate item data
                    if (!item.MobileGenPrimaryKey) {
                      console.error('Invalid OrderMaster item:', item);
                      errorCount++;
                      insertNextItem(index + 1);
                      return;
                    }
                    console.log(
                      'Invalid OrderMaster item:',
                      item.MobileGenPrimaryKey,
                      item.CollectionType,
                    );

                    tx.executeSql(
                      `INSERT INTO OrderMaster(id,Current_date_time ,entity_type,entity_id ,latitude ,longitude ,total_amount ,from_date ,to_date ,collection_type ,user_id ,remark,selected_flag ,sync_flag ,check_date,DefaultDistributorId,ExpectedDeliveryDate,ActivityStatus,ActivityStart,ActivityEnd,OrderPriority,userid)
                          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                      [
                        String(item.MobileGenPrimaryKey),
                        String(item.OrderTakenDatetime || ''),
                        String(item.EntityType || ''),
                        String(item.EntityID || ''),
                        String(item.Latitude || '0'),
                        String(item.Longitude || '0'),
                        String(item.TotalAmount || '0'),
                        String(item.FromDate || ''),
                        String(item.ToDate || ''),
                        String(item.CollectionType ?? ''), // âœ… preserves 0
                        String(item.ExecutiveID || ''),
                        String(item.Remarks || ''),
                        '',
                        'Y',
                        '',
                        String(item.DefaultDistributorID || ''),
                        String(item.ExpectedDeliveryDate || ''),
                        String(item.ActivityStatus || ''),
                        String(item.ActivityStartTime || ''),
                        String(item.ActivityEndTime || ''),
                        String(item.OrderPriority || ''),
                        String(item.userid || ''),
                      ],
                      (tx, results) => {
                        successCount++;
                        console.log(
                          `Inserted OrderMaster item ${index + 1}/${
                            OrderMaster.length
                          }`,
                        );
                        insertNextItem(index + 1);
                      },
                      (tx, error) => {
                        errorCount++;
                        console.error(
                          `Error inserting OrderMaster item ${index + 1}:`,
                          error,
                        );
                        insertNextItem(index + 1);
                      },
                    );
                  };

                  // Start inserting items
                  insertNextItem(0);
                },
                (tx, error) => {
                  console.error('Error deleting old OrderMaster:', error);
                  reject(
                    new Error(
                      `Failed to delete old OrderMaster: ${error.message}`,
                    ),
                  );
                },
              );
            },
            (tx, error) => {
              console.error('Error creating backup:', error);
              reject(new Error(`Failed to create backup: ${error.message}`));
            },
          );
        } catch (error: any) {
          console.error('Transaction error in insertOrderMaster:', error);
          reject(error);
        }
      })
      .catch((error: any) => {
        console.error('Transaction failed in insertOrderMaster:', error);
        reject(error);
      })
      .then(() => {
        console.log('Transaction completed in insertOrderMaster');
      });
  });
}

export async function insertOrderDetailsGetData(OrderDetails: any) {
  // Validate input data first
  if (!OrderDetails || OrderDetails.length === 0) {
    console.warn(
      'insertOrderDetailsGetData: No data provided, skipping operation',
    );
    return;
  }

  return new Promise<void>((resolve, reject) => {
    db1.transaction(
      tx => {
        try {
          // Step 1: Create backup of existing synced data
          tx.executeSql(
            'CREATE TEMPORARY TABLE OrderDetails_Backup AS SELECT * FROM OrderDetails WHERE sync_flag="Y"',
            [],
            (tx, results) => {
              console.log('Backup created for OrderDetails');

              // Step 2: Delete old synced data
              tx.executeSql(
                'DELETE FROM OrderDetails WHERE sync_flag="Y"',
                [],
                (tx, results) => {
                  console.log(
                    `Deleted ${results.rowsAffected} old OrderDetails records`,
                  );

                  // Step 3: Insert new data with error tracking
                  let successCount = 0;
                  let errorCount = 0;

                  const insertNextItem = (index: number) => {
                    if (index >= OrderDetails.length) {
                      // All items processed
                      if (successCount === OrderDetails.length) {
                        // All successful - drop backup and resolve
                        tx.executeSql(
                          'DROP TABLE OrderDetails_Backup',
                          [],
                          (tx, results) => {
                            console.log(
                              `âœ… Successfully inserted ${successCount} OrderDetails records`,
                            );
                            resolve();
                          },
                          (tx, error) => {
                            console.warn(
                              'Warning: Could not drop backup table:',
                              error,
                            );
                            resolve(); // Still resolve since main operation succeeded
                          },
                        );
                      } else {
                        // Some failed - restore from backup
                        console.error(
                          `âŒ Only ${successCount}/${OrderDetails.length} inserts succeeded. Restoring backup...`,
                        );
                        tx.executeSql(
                          'DELETE FROM OrderDetails WHERE sync_flag="Y"',
                          [],
                          (tx, results) => {
                            tx.executeSql(
                              'INSERT INTO OrderDetails SELECT * FROM OrderDetails_Backup',
                              [],
                              (tx, results) => {
                                tx.executeSql(
                                  'DROP TABLE OrderDetails_Backup',
                                  [],
                                  (tx, results) => {
                                    reject(
                                      new Error(
                                        `Failed to insert OrderDetails: Only ${successCount}/${OrderDetails.length} succeeded`,
                                      ),
                                    );
                                  },
                                  (tx, error) => {
                                    reject(
                                      new Error(
                                        `Failed to insert OrderDetails: Only ${successCount}/${OrderDetails.length} succeeded`,
                                      ),
                                    );
                                  },
                                );
                              },
                              (tx, error) => {
                                reject(
                                  new Error(
                                    `Failed to restore OrderDetails from backup: ${error.message}`,
                                  ),
                                );
                              },
                            );
                          },
                          (tx, error) => {
                            reject(
                              new Error(
                                `Failed to clear OrderDetails before restore: ${error.message}`,
                              ),
                            );
                          },
                        );
                      }
                      return;
                    }

                    const item = OrderDetails[index];

                    // Validate item data
                    if (!item.OrderID || !item.ItemID) {
                      console.error('Invalid OrderDetails item:', item);
                      errorCount++;
                      insertNextItem(index + 1);
                      return;
                    }

                    tx.executeSql(
                      `INSERT INTO OrderDetails(order_id, item_id, item_Name, quantity_one, quantity_two, small_Unit
                            , large_Unit, rate, Amount, selected_flag, sync_flag, userid,GSTRate,GSTTotal,GrossAmount) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                      [
                        String(item.OrderID),
                        String(item.ItemID),
                        '',
                        String(item.LargeUnit || '0'),
                        String(item.SmallUnit || '0'),
                        String(item.FreeSmallUnit || '0'),
                        String(item.FreeLargeUnit || '0'),
                        String(item.Rate || '0'),
                        String(item.Amount || '0'),
                        '1',
                        'Y',
                        String(item.userid || ''),
                        String(item.GSTRate || '0'),
                        String(item.GSTTotal || '0'),
                        String(item.GrossAmount || '0'),
                      ],
                      (tx, results) => {
                        successCount++;
                        console.log(
                          `Inserted OrderDetails item ${index + 1}/${
                            OrderDetails.length
                          }`,
                        );
                        insertNextItem(index + 1);
                      },
                      (tx, error) => {
                        errorCount++;
                        console.error(
                          `Error inserting OrderDetails item ${index + 1}:`,
                          error,
                        );
                        insertNextItem(index + 1);
                      },
                    );
                  };

                  // Start inserting items
                  insertNextItem(0);
                },
                (tx, error) => {
                  console.error('Error deleting old OrderDetails:', error);
                  reject(
                    new Error(
                      `Failed to delete old OrderDetails: ${error.message}`,
                    ),
                  );
                },
              );
            },
            (tx, error) => {
              console.error('Error creating backup:', error);
              reject(new Error(`Failed to create backup: ${error.message}`));
            },
          );
        } catch (error: any) {
          console.error(
            'Transaction error in insertOrderDetailsGetData:',
            error,
          );
          reject(error);
        }
      })
      .catch((error: any) => {
        console.error(
          'Transaction failed in insertOrderDetailsGetData:',
          error,
        );
        reject(error);
      })
      .then(() => {
        console.log('Transaction completed in insertOrderDetailsGetData');
      });
  });
}

export async function insertResources(Resources: any) {
  // Validate input data first
  if (!Resources || Resources.length === 0) {
    console.warn('insertResources: No data provided, skipping operation');
    return;
  }

  return new Promise<void>((resolve, reject) => {
    db1.transaction(
      tx => {
        try {
          // Step 1: Create backup of existing Resources data
          tx.executeSql(
            'CREATE TEMPORARY TABLE Resources_Backup AS SELECT * FROM Resources',
            [],
            (tx, results) => {
              console.log('Backup created for Resources');

              // Step 2: Delete old data
              tx.executeSql('DELETE from Resources', [], (tx, results) => {
                console.log(
                  `Deleted ${results.rowsAffected} old Resources records`,
                );

                // Step 3: Insert new data with error tracking
                let successCount = 0;
                let errorCount = 0;

                const insertNextItem = (index: number) => {
                  if (index >= Resources.length) {
                    // All items processed
                    if (successCount === Resources.length) {
                      // All successful - drop backup and resolve
                      tx.executeSql(
                        'DROP TABLE Resources_Backup',
                        [],
                        (tx, results) => {
                          console.log(
                            `âœ… Successfully inserted ${successCount} Resources records`,
                          );
                          resolve();
                        },
                        (tx, error) => {
                          console.warn(
                            'Warning: Could not drop backup table:',
                            error,
                          );
                          resolve(); // Still resolve since main operation succeeded
                        },
                      );
                    } else {
                      // Some failed - restore from backup
                      console.error(
                        `âŒ Only ${successCount}/${Resources.length} inserts succeeded. Restoring backup...`,
                      );
                      tx.executeSql(
                        'DELETE from Resources',
                        [],
                        (tx, results) => {
                          tx.executeSql(
                            'INSERT INTO Resources SELECT * FROM Resources_Backup',
                            [],
                            (tx, results) => {
                              tx.executeSql(
                                'DROP TABLE Resources_Backup',
                                [],
                                (tx, results) => {
                                  reject(
                                    new Error(
                                      `Failed to insert Resources: Only ${successCount}/${Resources.length} succeeded`,
                                    ),
                                  );
                                },
                                (tx, error) => {
                                  reject(
                                    new Error(
                                      `Failed to insert Resources: Only ${successCount}/${Resources.length} succeeded`,
                                    ),
                                  );
                                },
                              );
                            },
                            (tx, error) => {
                              reject(
                                new Error(
                                  `Failed to restore Resources from backup: ${error.message}`,
                                ),
                              );
                            },
                          );
                        },
                        (tx, error) => {
                          reject(
                            new Error(
                              `Failed to clear Resources before restore: ${error.message}`,
                            ),
                          );
                        },
                      );
                    }
                    return;
                  }

                  const item = Resources[index];

                  // Validate item data
                  if (!item.ID || !item.ResourceName) {
                    console.error('Invalid Resources item:', item);
                    errorCount++;
                    insertNextItem(index + 1);
                    return;
                  }

                  tx.executeSql(
                    `INSERT INTO Resources(ID ,ResourceName , ParentResourceID ,URL , Descreption ,FileName , SequenceNo ,IsDownloadable , ResourceType ,CreatedDate ,LastUpdatedDate) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
                    [
                      String(item.ID),
                      String(item.ResourceName),
                      String(item.ParentResourceID || ''),
                      String(item.URL || ''),
                      String(item.Descreption || ''),
                      String(item.FileName || ''),
                      String(item.SequenceNo || ''),
                      String(item.IsDownloadable || ''),
                      String(item.ResourceType || ''),
                      String(item.CreatedDate || ''),
                      String(item.LastUpdatedDate || ''),
                    ],
                    (tx, results) => {
                      successCount++;
                      console.log(
                        `Inserted Resources item ${index + 1}/${
                          Resources.length
                        }`,
                      );
                      insertNextItem(index + 1);
                    },
                    (tx, error) => {
                      errorCount++;
                      console.error(
                        `Error inserting Resources item ${index + 1}:`,
                        error,
                      );
                      insertNextItem(index + 1);
                    },
                  );
                };

                // Start inserting items
                insertNextItem(0);
              });
            },
            (tx, error) => {
              console.error('Error creating backup:', error);
              reject(new Error(`Failed to create backup: ${error.message}`));
            },
          );
        } catch (error: any) {
          console.error('Transaction error in insertResources:', error);
          reject(error);
        }
      })
      .catch((error: any) => {
        console.error('Transaction failed in insertResources:', error);
        reject(error);
      })
      .then(() => {
        console.log('Transaction completed in insertResources');
      });
  });
}

export async function insertOnlineParentArea(OnlineParentArea: any) {
  db1.transaction(tx => {
    tx.executeSql('DELETE from OnlineParentArea ', [], (tx, results) => {
      let len = OnlineParentArea?.length;
      let count = 0;

      for (let item of OnlineParentArea) {
        tx.executeSql(
          `insert into OnlineParentArea(AreaId , Area ) VALUES (?,?)`,
          [String(item.AreaId), String(item.Area)],
          (tx, results) => {},
          err => {
            console.error('error=', err);
          },
        );
      }
    });
  });
}

export async function insertoutletAssetInformation(
  outletAssetInformationData: any,
) {
  db1.transaction(tx => {
    tx.executeSql('DELETE from OutletAssetInformation  ', [], (tx, results) => {
      let len = outletAssetInformationData?.length;
      let count = 0;

      for (let item of outletAssetInformationData) {
        tx.executeSql(
          `insert into OutletAssetInformation( CustomerID , AssetID , AssetQRcode ,AssetInformation,ScanFlag, userid)
                                                                      VALUES (?,?,?,?,?,?)`,
          [
            String(item.CustomerID),
            String(item.AssetID),
            String(item.AssetQRcode),
            String(item.AssetInformation),
            '',
            String(item.userid),
          ],
          (tx, results) => {},
          err => {
            console.error('error=', err);
          },
        );
      }
    });
  });
}

export async function insertSurveyMaster(SurveyMaster: any) {
  db1.transaction(tx => {
    tx.executeSql('DELETE from SurveyMaster ', [], (tx, results) => {
      let len = SurveyMaster?.length;
      let count = 0;

      for (let item of SurveyMaster) {
        // "ID": 2,
        // "SurveyName": "Outlet Survey - IMFL",
        // "CompanyName": "SAPL",
        // "CustomerID": null,
        // "PublishedDate": "2020-05-01T00:00:00",
        // "TimeRequired": 10,
        // "SurveyURL": "https://zylem.in/cpa/OutletSurveyDetails.aspx/EvaluationMasterID=1?userid=&password=&lat=&lon=",
        // "SurveyDoneDate": null
        tx.executeSql(
          `insert into SurveyMaster( ID,SurveyName,CompanyName,CustomerID,PublishedDate,TimeRequired,SurveyURL,SurveyDoneDate)
                                                                       VALUES (?,?,?,?,?,?,?,?)`,
          [
            String(item.ID),
            String(item.SurveyName),
            String(item.CompanyName),
            String(item.CustomerID),
            String(item.PublishedDate),
            String(item.TimeRequired),
            String(item.SurveyURL),
            String(item.SurveyDoneDate),
          ],
          (tx, results) => {},
          err => {
            console.error('error=', err);
          },
        );
      }
    });
  });
}

export async function insertoutletAssetTypeClassificationList(
  outletAssetTypeClassificationList: any,
) {
  db1.transaction(tx => {
    tx.executeSql(
      'DELETE from AssetTypeClassificationList  ',
      [],
      (tx, results) => {
        let len = outletAssetTypeClassificationList?.length;
        let count = 0;

        for (let item of outletAssetTypeClassificationList) {
          tx.executeSql(
            `insert into  AssetTypeClassificationList( AssetTypeID , AssetName , ClassificationList)
                                                                    VALUES (?,?,?)`,
            [
              String(item.AssetTypeID),
              String(item.AssetName),
              String(item.ClassificationList),
            ],
            (tx, results) => {
              // console.log(
              //     'ASSET TYPE CLASSIFICATION LIST:::::::',
              //     results.rows.length,
              // );
            },
            err => {
              console.error('error=', err);
            },
          );
        }
      },
    );
  });
}

export async function insertCollectionType(CollectionType: any) {
  db1.transaction(tx => {
    let len = CollectionType?.length;
    let count = 0;

    for (let item of CollectionType) {
      tx.executeSql(
        `insert into CollectionTypes(Id,Type )
                                                                VALUES (?,?)`,
        [String(item.Id), String(item.Type)],
        (tx, results) => {
          // //console.log("rjlen",results.length)
        },
        err => {
          console.error('error=', err);
        },
      );
    }
  });
}

export async function insertDiscount(CollectionType: any) {
  db1.transaction(tx => {
    let len = CollectionType?.length;
    let count = 0;
    for (let item of CollectionType) {
      tx.executeSql(
        `insert into Discounts(ID,OrderID, DiscountType, DiscountAmount, discountadd ,discountless,RNP ,OnAmount ,OnAmountSmallUnit ,Rate ,BookCode ,OrderedItemID,BrandCode,ItemCode )
                                                                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          // "ID": 1,
          // "OrderID": 1,
          // "DiscountType": "p",
          // "DiscountAmount": 10.00,
          // "DiscountAdd": 0.5,
          // "DiscountLess": 0.0,
          // "RNP": "",
          // "OnAmount": 100.00,
          // "OnAmountSmallUnit": 15.00,
          // "Rate": 15.00,
          // "BookCode": "bookcode",
          // "OrderedItemID": 8,
          // "BrandCode": "Brand1",
          // "ItemCode": "Item1"

          String(item.ID),
          String(item.OrderID),
          String(item.DiscountType),
          String(item.DiscountAmount),
          String(item.DiscountAdd),
          String(item.DiscountLess),
          String(item.RNP),
          String(item.OnAmount),
          String(item.OnAmountSmallUnit),
          String(item.Rate),
          String(item.BookCode),
          String(item.OrderedItemID),
          String(item.BrandCode),
          String(item.ItemCode),
        ],
        (tx, results) => {
          ////console.log("rjlen",results.length)
        },
        err => {
          console.error('error=', err);
        },
      );
    }
  });
}

//mjp insert data
export async function insertMJPMaster(MJPMaster_data: any) {
  db1.transaction(tx => {
    tx.executeSql('DELETE from MJPMaster', [], (tx, results) => {
      let len = MJPMaster_data?.length;
      let count = 0;

      for (let item of MJPMaster_data) {
        tx.executeSql(
          `insert into  MJPMaster( ID, ExecutiveId, MonthYear,userid)
                                                                  VALUES (?,?,?,?)`,
          [
            // "UserID": 52362,
            // "ItemID": 464
            String(item.ID),
            String(item.ExecutiveId),
            String(item.MonthYear),
            String(item.userid),
          ],
          (tx, results) => {
            // //console.log("rjlen",results.length)
          },
          err => {
            console.error('error=', err);
          },
        );
      }
    });
  });
}

export async function getMJPMasterData() {
  const products = [];
  let query = 'SELECT * FROM MJPMaster';
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempSearchProdect = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempSearchProdect.push(results.rows.item(i));
        }
        resolve(tempSearchProdect);
      });
    });
  });
}

export async function deleteMJPMasterData() {
  return new Promise(resolve => {
    let query = 'DELETE from MJPMaster';
    //   initDB().then((db) => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getInsertedsTempOrder = [];
        for (let i = 0; i < results.rows.length; i++) {
          getInsertedsTempOrder.push(results.rows.item(i));
        }
        resolve(getInsertedsTempOrder);
      });
    });
  });
}

export async function DeleteCancelMeetingEntry(Meeting_Id: any) {
  console.log('Data', Meeting_Id);

  return new Promise(resolve => {
    let query = 'DELETE FROM MJPMasterDetails WHERE ID= "' + Meeting_Id + '"';
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        resolve(results);
      });
    });
  });
}

export async function insertMJPMasterDetails(MJPMasterDetails_data: any) {
  db1.transaction(tx => {
    tx.executeSql('DELETE FROM MJPMasterDetails', [], (tx, results) => {
      let len = MJPMasterDetails_data?.length;
      let count = 0;

      for (let item of MJPMasterDetails_data) {
        tx.executeSql(
          `insert into  MJPMasterDetails(  MJPMasterID, PlannedDate,EntityType,EntityTypeID,ActivityTitle,IsActivityDone,userid)
                                                                  VALUES (?,?,?,?,?,?,?)`,
          [
            String(item.MJPMasterID),
            String(item.PlannedDate),
            String(item.EntityType),
            String(item.EntityTypeID),
            String(item.ActivityTitle),
            String(item.IsActivityDone),
            String(item.userid),
          ],
          (tx, results) => {
            // //console.log("rjlen",results.length)
          },
          err => {
            console.error('error=', err);
          },
        );
      }
    });
  });
}

export async function insertSubGroupMaster(SubGroupMaster_data: any) {
  db1.transaction(tx => {
    tx.executeSql('DELETE FROM SubGroupMaster', [], (tx, results) => {
      let len = SubGroupMaster_data?.length;
      let count = 0;

      for (let item of SubGroupMaster_data) {
        tx.executeSql(
          `insert into  SubGroupMaster( Id, GroupId, Name)
                                                                  VALUES (?,?,?)`,
          [
            // "UserID": 52362,
            // "ItemID": 464
            String(item.Id),
            String(item.GroupId),
            String(item.Name),
          ],
          (tx, results) => {
            // //console.log("rjlen",results.length)
          },
          err => {
            console.error('error=', err);
          },
        );
      }
    });
  });
}

export async function insertSchemeDetails_data(SubSchemeDetails_data: any) {
  db1.transaction(tx => {
    tx.executeSql('DELETE FROM SchemeDetails  ', [], (tx, results) => {
      let len = SubSchemeDetails_data?.length;
      let count = 0;

      for (let item of SubSchemeDetails_data) {
        tx.executeSql(
          `insert into  SchemeDetails( ID, SchemeID, SchemeName,FromDate,ToDate,SlabNo,SchemeBenefits,Remarks)
                                                                  VALUES (?,?,?,?,?,?,?,?)`,
          [
            // "UserID": 52362,
            // "ItemID": 464
            String(item.ID),
            String(item.SchemeID),
            String(item.SchemeName),
            String(item.FromDate),
            String(item.ToDate),
            String(item.SlabNo),
            String(item.SchemeBenefits),
            String(item.Remarks),
          ],
          (tx, results) => {
            // //console.log("rjlen",results.length)
          },
          err => {
            console.error('error=', err);
          },
        );
      }
    });
  });
}

export async function getAllData() {
  const products = [];
  return new Promise(resolve => {
    db1
      .transaction(tx => {
        tx.executeSql('SELECT * FROM Sales', [], (tx, results) => {
          //  let temp;
          //  temp=results.rows
          let temp = [];
          for (let i = 0; i < results.rows.length; i++) {
            temp.push(results.rows.item(i));
          }
          // //console.log("getAllDatalen==", temp.length);
          // //console.log("getAllDatatemp==", JSON.stringify(temp));
          resolve(temp);
        });
      })
      .then(result => {
        //
      })
      .catch(err => {
        //console.log(err);
      });
  }).catch(err => {
    //console.log(err);
  });
}

export async function getUserData() {
  let query = 'SELECT * FROM user';
  return new Promise(resolve => {
    db1
      .transaction(tx => {
        tx.executeSql(query, [], (tx, results) => {
          let tempuser = [];
          for (let i = 0; i < results.rows.length; i++) {
            tempuser.push(results.rows.item(i));
          }

          resolve(tempuser);
        });
      })
      .then(result => {
        //
      })
      .catch(err => {
        //console.log(err);
      });
  }).catch(err => {
    //console.log(err);
  });
}

export async function getBeatData(id: string) {
  return new Promise(resolve => {
    let query =
      // 'Select distinct RouteID,RouteName from Pcustomer order by RouteName asc';
      'Select distinct RouteID,RouteName from Pcustomer where userid = "' +
      id +
      '" order by RouteName asc';
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempBeat = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempBeat.push(results.rows.item(i));
        }

        resolve(tempBeat);
      });
    });
  });
}

export async function getDistributorData(id: string) {
  return new Promise<DistributorData[]>(resolve => {
    let query =
      'Select distinct DistributorID,Distributor from PDistributor where userid = "' +
      id +
      '" Order by Distributor asc';

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempDistributor = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempDistributor.push(results.rows.item(i));
        }

        resolve(tempDistributor);
      });
    });
  });
}

export async function getOnlineParentAreaData() {
  return new Promise(resolve => {
    let query = 'Select AreaId, Area from OnlineParentArea Order by Area asc';

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempDistributor = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempDistributor.push(results.rows.item(i));
        }
        resolve(tempDistributor);
      });
    });
  });
}

export async function getDatabaseSize() {
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        'select page_size * (SELECT max(page_count) FROM pragma_page_count) as Size  FROM pragma_page_size',
        [],
        (tx, results) => {
          let tempDistributor = [];
          for (let i = 0; i < results.rows.length; i++) {
            tempDistributor.push(results.rows.item(i));
          }
          console.log('THIS IS SIZE IN BYTES', tempDistributor[0].Size);
          resolve(tempDistributor);
        },
      );
    });
  });
}
export async function getupdatedsyncdata() {
  return new Promise(resolve => {
    const products = [];
    let query = 'select Value from Settings where key = "SYNCDATETIME"';

    // initDB().then((db) => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempDistributor = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempDistributor.push(results.rows.item(i));
        }

        resolve(tempDistributor);
      });
    });
  });
}

export async function getAttendanceSettings() {
  return new Promise(resolve => {
    const products = [];
    let query = 'select Value from Settings where key = "AttendanceOptions"';

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempDistributor = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempDistributor.push(results.rows.item(i));
        }

        resolve(tempDistributor);
      });
    });
  });
}

export async function getRouteId(name: any) {
  return new Promise(resolve => {
    const products = [];
    let query =
      "Select distinct RouteID from Pcustomer where RouteName='" + name + "'";
    db1
      .transaction(tx => {
        tx.executeSql(query, [], (tx, results) => {
          let tempRouteId = [];
          for (let i = 0; i < results.rows.length; i++) {
            tempRouteId.push(results.rows.item(i));
          }
          // let tempRoute = [];
          // tempRoute = JSON.stringify(tempRouteId);
          resolve(tempRouteId);
        });
      })
      .then(result => {
        //
      })
      .catch(err => {
        //console.log(err);
      });
  });
}

export async function getOutletArray(id: any) {
  // console.log('getOutletArray db --->', id?.toString());
  let id1 = id?.toString();
  const products = [];
  //  'select * from TABLE_SUBCATEGORY where id = (select id from TABLE_SUBCATEGORY where subname=?)', [title], (tx, results) => {
  let query =
    "select distinct CustomerId as id ,Party as party from Pcustomer where RouteID='" +
    id1 +
    "' union select  distinct OrderID as id ,OutletName as party from newpartyoutlet where BitID ='" +
    id1 +
    "' order by Party asc";

  return new Promise(resolve => {
    //   initDB().then((db) => {
    db1
      .transaction(tx => {
        tx.executeSql(query, [], (tx, results) => {
          let tempOutletArray = [];
          for (let i = 0; i < results.rows.length; i++) {
            tempOutletArray.push(results.rows.item(i));
          }
          resolve(tempOutletArray);
        });
      })
      .then(result => {
        //
      })
      .catch(err => {
        //console.log(err);
      });
  });
}

export async function getOutletArrayRoute(id: string) {
  // let id1 = id.toString();
  //  'select * from TABLE_SUBCATEGORY where id = (select id from TABLE_SUBCATEGORY where subname=?)', [title], (tx, results) => {
  let query =
    "select distinct CustomerId as id ,Party as party,Outlet_Info as Outlet_Info,WeeklyOff as weeklyoff  from Pcustomer where RouteID='" +
    id +
    "' union select  distinct OrderID as id ,OutletName as party ,OutletAddress as Outlet_Info, WeeklyOff as weeklyoff from newpartyoutlet where BitID ='" +
    id +
    "' order by Party asc";

  return new Promise<OutletArrayData[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempOutletArray = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempOutletArray.push(results.rows.item(i));
        }

        resolve(tempOutletArray);
      });
    });
  });
}

export async function getOutletArrayRouteWithGeofence(id: string) {
  let query =
    "select distinct CustomerId as id ,Party as party,Outlet_Info as Outlet_Info, Latitude, Longitude,WeeklyOff as weeklyoff, 0 as isNewParty from Pcustomer where RouteID='" +
    id +
    "' union select  distinct OrderID as id ,OutletName as party ,OutletAddress as Outlet_Info, Latitude, Longitude, WeeklyOff as weeklyoff, 1 as isNewParty  from newpartyoutlet where BitID ='" +
    id +
    "' order by Party asc";

  return new Promise<OutletArrayWithGeofenceData[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempOutletArray: OutletArrayWithGeofenceData[] = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempOutletArray.push({
            id: results.rows.item(i).id,
            party: results.rows.item(i).party,
            Outlet_Info: results.rows.item(i).Outlet_Info,
            isEntered: false,
            latitude: results.rows.item(i)?.Latitude,
            longitude: results.rows.item(i)?.Longitude,
            weeklyoff: results.rows.item(i)?.weeklyoff,
            isNewParty: results.rows.item(i)?.isNewParty
              ? results.rows.item(i)?.isNewParty
              : null,
          });
        }
        resolve(tempOutletArray);
      });
    });
  });
}

export async function getOutletArrayFromShop(id: string, uid: string) {
  let query =
    "select distinct CustomerId as id ,Party as party,Outlet_Info as Outlet_Info, RouteID, RouteName, PDistributor.Distributor, PDistributor.DistributorID, WeeklyOff as weeklyoff from Pcustomer left join PDistributor on Pcustomer.DefaultDistributorId = PDistributor.DistributorID where CustomerId='" +
    id +
    "' and Pcustomer.userid='" +
    uid +
    "' order by Party asc";

  return new Promise<OutletArrayFromShop[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempOutletArray = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempOutletArray.push(results.rows.item(i));
        }
        resolve(tempOutletArray);
      });
    });
  });
}

export async function getNewArray(name: string) {
  return new Promise(resolve => {
    //   let query="Select distinct RouteID from Pcustomer where RouteName='"+name+"'"
    //      let query="select distinct CustomerId as id ,Party as party from Pcustomer where RouteID='"+id+"' union select  distinct OrderID as id ,OutletName as party from newpartyoutlet where BitID ='"+id+"' order by Party asc"

    let query =
      "select distinct CustomerId as id ,Party as party from Pcustomer where RouteID IN(Select distinct RouteID from Pcustomer where RouteName='" +
      name +
      "') union select distinct OrderID as id ,OutletName as party from newpartyoutlet where BitID IN(Select distinct RouteID from Pcustomer where RouteName='" +
      name +
      "') order by Party asc";
    // let query="select distinct CustomerId as id ,Party as party from Pcustomer where RouteID=('Select distinct RouteID from Pcustomer where RouteName='"+name+"'')union select  distinct OrderID as id ,OutletName as party from newpartyoutlet where BitID =('Select distinct RouteID from Pcustomer where RouteName='"+name+"'') order by Party asc"

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempOutletArray = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempOutletArray.push(results.rows.item(i));
        }
        resolve(tempOutletArray);
      });
    });
  });
}

export async function getOutletInfo(id: string | number) {
  return new Promise<InfoOutletData[]>(resolve => {
    //   let query = "select distinct CustomerId as id ,Party as Party,Outlet_Info as Outlet_Info from Pcustomer where CustomerId='" + id + "' union select  distinct OrderID as id ,OutletName as Party ,OutletAddress as Outlet_Info from newpartyoutlet where OrderID ='" + id + "' order by Party asc"
    let query =
      "select distinct CustomerId as id ,Party as Party,Outlet_Info as Outlet_Info , Null as Latitude,Null as Longitude,Null as RegisteredOn,Null as MobileNo,Null as Owner,Null as ShopType,Null as RegistrationNo,Null as ShopId,Null as ContactPerson,Null as ShopArea from Pcustomer where CustomerId='" +
      id +
      "' union select  distinct   OrderID as id ,OutletName as Party ,OutletAddress as Outlet_Info,Latitude as Latitude,Longitude as Longitude,AddedDate as RegisteredOn,ContactNo as MobileNo,OwnersName as Owner,ShopType as ShopType,RegistrationNo as RegistrationNo,ShopId as ShopId,ContactPerson as ContactPerson,ShopArea as ShopArea from newpartyoutlet where OrderID ='" +
      id +
      "' order by Party asc";

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getOutletInfo = [];
        for (let i = 0; i < results.rows.length; i++) {
          getOutletInfo.push(results.rows.item(i));
        }
        resolve(getOutletInfo);
      });
    });
  });
}

///ShopMeetInfo
export async function getShopMeetInfo(
  id: string | number,
  uid: string | number,
) {
  return new Promise(resolve => {
    //   let query = "select distinct CustomerId as id ,Party as Party,Outlet_Info as Outlet_Info from Pcustomer where CustomerId='" + id + "' union select  distinct OrderID as id ,OutletName as Party ,OutletAddress as Outlet_Info from newpartyoutlet where OrderID ='" + id + "' order by Party asc"
    let query = "select * from Pcustomer where CustomerId='" + id;
    '" and userid = "' + uid + '"';

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getOutletInfo = [];
        for (let i = 0; i < results.rows.length; i++) {
          getOutletInfo.push(results.rows.item(i));
        }
        resolve(getOutletInfo);
      });
    });
  });
}

///getscheme///
export async function getSchemeData(id: string | number) {
  return new Promise(resolve => {
    const products = [];
    //   let query = "select distinct CustomerId as id ,Party as Party,Outlet_Info as Outlet_Info from Pcustomer where CustomerId='" + id + "' union select  distinct OrderID as id ,OutletName as Party ,OutletAddress as Outlet_Info from newpartyoutlet where OrderID ='" + id + "' order by Party asc"
    let query =
      "select distinct SchemeDetails.SchemeID,SchemeDetails.SchemeName,PItem.BRAND,PItem.Item,SchemeDetails.Remarks,SchemeDetails.FromDate,SchemeDetails.ToDate from SchemeDetails,PItem where  like('%'||SchemeDetails.SchemeID||'%',PItem.SchemeID) and PItem.ItemId='" +
      id +
      "'";

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getOutletInfo = [];
        for (let i = 0; i < results.rows.length; i++) {
          getOutletInfo.push(results.rows.item(i));
        }
        resolve(getOutletInfo);
      });
    });
  });
}
/////slab no///
export async function getSlabData(id: string | number) {
  return new Promise(resolve => {
    //   let query = "select distinct CustomerId as id ,Party as Party,Outlet_Info as Outlet_Info from Pcustomer where CustomerId='" + id + "' union select  distinct OrderID as id ,OutletName as Party ,OutletAddress as Outlet_Info from newpartyoutlet where OrderID ='" + id + "' order by Party asc"
    let query =
      "select distinct SchemeDetails.SchemeID,SchemeDetails.SchemeName,SchemeDetails.SchemeBenefits,SchemeDetails.SlabNo,PItem.BRAND,PItem.Item from SchemeDetails,PItem where  like('%'||SchemeDetails.SchemeID||'%',PItem.SchemeID) and PItem.ItemId='" +
      id +
      "'";

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getOutletInfo = [];
        for (let i = 0; i < results.rows.length; i++) {
          getOutletInfo.push(results.rows.item(i));
        }
        resolve(getOutletInfo);
      });
    });
  });
}

export async function getCollectionsDetails1(key: string) {
  return new Promise(resolve => {
    let query =
      'select * from (select VhrNo, InvoiceDate, Amount, TX_Collections.AllocatedAmount, " " as LedgerName, MobileGenPrimaryKey from OutstandingDetails, TX_Collections where OutstandingDetails.VhrNo=TX_Collections.InvoiceCode and OutstandingDetails.PartyCode=TX_Collections.PartyCode UNION select VhrNo, InvoiceDate, OutstandingDetails.Amount, TX_CollectionsDetails.Amount, DiscountType as LedgerName, TX_CollectionsDetails.CollectionID as MobileGenPrimaryKey from OutstandingDetails, TX_CollectionsDetails where OutstandingDetails.VhrNo=TX_CollectionsDetails.InvoiceCode ) as A where  MobileGenPrimaryKey="' +
      key +
      '"  order by Vhrno,LedgerName';
    // console.log('getShopCardInfo', query);
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getOutletInfo = [];
        for (let i = 0; i < results.rows.length; i++) {
          getOutletInfo.push(results.rows.item(i));
        }
        resolve(getOutletInfo);
      });
    });
  });
}
export async function getCollectionsDetails10(key: string) {
  return new Promise(resolve => {
    let query =
      ' select * from (select VhrNo, InvoiceDate, Amount, TX_Collections_log.AllocatedAmount, " " as LedgerName, MobileGenPrimaryKey from OutstandingDetails, TX_Collections_log  where OutstandingDetails.VhrNo=TX_Collections_log.InvoiceCode and OutstandingDetails.PartyCode=TX_Collections_log.PartyCode  UNION select VhrNo, InvoiceDate, OutstandingDetails.Amount, TX_CollectionsDetails_log.Amount, DiscountType as LedgerName, TX_CollectionsDetails_log.CollectionID as MobileGenPrimaryKey from OutstandingDetails, TX_CollectionsDetails_log where OutstandingDetails.VhrNo=TX_CollectionsDetails_log.InvoiceCode ) as A where  MobileGenPrimaryKey= "' +
      key +
      '" order by Vhrno,LedgerName';
    // console.log('getShopCardInfo', query);
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getOutletInfo = [];
        for (let i = 0; i < results.rows.length; i++) {
          getOutletInfo.push(results.rows.item(i));
        }
        resolve(getOutletInfo);
      });
    });
  });
}

export async function getDistributorname(shopId: any) {
  return new Promise<Distributor[]>(resolve => {
    let query =
      'select Distributor from PDistributor where Distributorid in (select DefaultDistributorId from Pcustomer where CustomerId="' +
      shopId +
      '")';
    // console.log('getShopCardInfo', query);
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getOutletInfo = [];
        for (let i = 0; i < results.rows.length; i++) {
          getOutletInfo.push(results.rows.item(i));
        }
        resolve(getOutletInfo);
      });
    });
  });
}
///////////////
//change by vibha
export async function GetMJPMasterDetails(id: any, currentDate: any) {
  return new Promise(resolve => {
    console.log('Data', currentDate);

    const products = [];
    // let query =
    //   " select distinct MJPMasterDetails.*,'Y' as sync_flag,OrderMaster.ActivityStart,Ordermaster.ActivityEnd,'Y' as Type_sync  from MJPMasterDetails left JOIN OrderMaster on MJPMasterDetails.EntityTypeID = OrderMaster.entity_id INNER JOIN MeetReport on MeetReport.Shop_Id=MJPMasterDetails.EntityTypeID AND MeetReport.ExpectedDeliveryDate=OrderMaster.ActivityStart AND OrderMaster.entity_id =MeetReport.Shop_Id where MJPMasterDetails.PlannedDate = OrderMaster.from_date and ordermaster.collection_type=6 and MJPMasterDetails.PlannedDate='" +
    //   currentDate + "'GROUP by ActivityStart'" +
    //   "' UNION ALL select distinct MJPMasterDetails.*,'' as sync_flag,'' as ActivityStart,'' as ActivityEnd, 'N' as Type_sync from MJPMasterDetails where id not in (select Meeting_Id from MeetReport) and PlannedDate='" +
    //   currentDate +
    //   "' and MJPMasterDetails.userid='" +
    //   id + "'GROUP by ActivityStart'" +
    //   "'";

    let query2 =
      " select distinct MJPMasterDetails.*,'Y' as sync_flag,OrderMaster.ActivityStart,Ordermaster.ActivityEnd,'Y' as Type_sync  from MJPMasterDetails left JOIN OrderMaster on MJPMasterDetails.EntityTypeID = OrderMaster.entity_id INNER JOIN MeetReport on MeetReport.Shop_Id=MJPMasterDetails.EntityTypeID AND MeetReport.ExpectedDeliveryDate=OrderMaster.ActivityStart AND OrderMaster.entity_id =MeetReport.Shop_Id where MJPMasterDetails.PlannedDate = OrderMaster.from_date and ordermaster.collection_type=6 and MJPMasterDetails.PlannedDate='" +
      currentDate +
      "'GROUP by ActivityStart UNION ALL select distinct  MJPMasterDetails.*,'' as sync_flag,'' as ActivityStart,'' as ActivityEnd, 'N' as Type_sync from MJPMasterDetails where id not in (select Meeting_Id from MeetReport) and PlannedDate='" +
      currentDate +
      "'and MJPMasterDetails.userid='" +
      id +
      "'";
    // console.log("Quesry By Shankar Gade",query2);

    db1.transaction(tx => {
      tx.executeSql(query2, [], (tx, results) => {
        let getOutletInfo = [];

        for (let i = 0; i < results.rows.length; i++) {
          getOutletInfo.push(results.rows.item(i));
        }

        resolve(getOutletInfo);
      });
    });
  });
}

export async function GetMJPMasterDetailsShops(
  userId: any,
  currentDate: any,
  selectedShopId: any,
) {
  return new Promise(resolve => {
    //  console.log('Data', currentDate);
    let query2 =
      "select distinct MJPMasterDetails.*,'Y' as sync_flag,OrderMaster.ActivityStart,Ordermaster.ActivityEnd,'Y' as Type_sync  from MJPMasterDetails left JOIN OrderMaster on MJPMasterDetails.EntityTypeID = OrderMaster.entity_id INNER JOIN MeetReport on MJPMasterDetails.EntityTypeID='" +
      selectedShopId +
      "'AND MeetReport.ExpectedDeliveryDate=OrderMaster.ActivityStart AND OrderMaster.entity_id =MeetReport.Shop_Id where MJPMasterDetails.PlannedDate = OrderMaster.from_date and ordermaster.collection_type=6 and MJPMasterDetails.PlannedDate='" +
      currentDate +
      "'GROUP by ActivityStart UNION ALL select distinct MJPMasterDetails.*,'' as sync_flag,'' as ActivityStart,'' as ActivityEnd, 'N' as Type_sync from MJPMasterDetails where id not in (select Meeting_Id from MeetReport) and PlannedDate='" +
      currentDate +
      "'and MJPMasterDetails.userid='" +
      userId +
      "'AND EntityTypeID ='" +
      selectedShopId +
      "'";

    //  console.log('Quesry By Shankar', query2);

    db1.transaction(tx => {
      tx.executeSql(query2, [], (tx, results) => {
        let getOutletInfo = [];

        for (let i = 0; i < results.rows.length; i++) {
          getOutletInfo.push(results.rows.item(i));
        }

        resolve(getOutletInfo);
      });
    });
  });
}

export async function getMeetForSyncByVibha(Meeting_Id: any, plannedDate: any) {
  //id,Current_date_time ,entity_type,entity_id ,latitude ,longitude ,total_amount ,from_date ,to_date ,collection_type ,user_id ,remark,selected_flag ,sync_flag ,check_date,DefaultDistributorId,ExpectedDeliveryDate
  // let query = "select ID as ID,Type_sync as EntityType,Shop_Id as EntityID,PlannedDate as FromDate,PlannedDate as ToDate,Remarks || ' ' || location as Remark,collection_type as CollectionType,latitude as Latitude,longitude as Longitude,TotalAmount as TotalAmount,UserID as UserID,CurrentDatetime as CurrentDatetime,DefaultDistributorId as DefaultDistributorId,ExpectedDeliveryDate as ExpectedDeliveryDate from MeetReport where IsActivityDone ='0' and Meeting_Id='" + Meeting_Id + "'"
  let query =
    "select * from MeetReport where PlannedDate ='" +
    plannedDate +
    "' and Meeting_Id='" +
    Meeting_Id +
    "'";
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let MeetReport = [];
        for (let i = 0; i < results.rows.length; i++) {
          MeetReport.push(results.rows.item(i));
          MeetReport[i].ActivityStatus = '';
        }
        //return OrderMaster
        resolve(MeetReport);
      });
    });
  });
}

//change by ShankarGade
export async function getorderidfromdiscount(apporderid: string) {
  //id,Current_date_time ,entity_type,entity_id ,latitude ,longitude ,total_amount ,from_date ,to_date ,collection_type ,user_id ,remark,selected_flag ,sync_flag ,check_date,DefaultDistributorId,ExpectedDeliveryDate
  // let query = "select ID as ID,Type_sync as EntityType,Shop_Id as EntityID,PlannedDate as FromDate,PlannedDate as ToDate,Remarks || ' ' || location as Remark,collection_type as CollectionType,latitude as Latitude,longitude as Longitude,TotalAmount as TotalAmount,UserID as UserID,CurrentDatetime as CurrentDatetime,DefaultDistributorId as DefaultDistributorId,ExpectedDeliveryDate as ExpectedDeliveryDate from MeetReport where IsActivityDone ='0' and Meeting_Id='" + Meeting_Id + "'"
  let query =
    "select id from TABLE_DISCOUNT where OrderId ='" + apporderid + "'";
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let MeetReport = [];
        for (let i = 0; i < results.rows.length; i++) {
          MeetReport.push(results.rows.item(i));
        }
        resolve(MeetReport);
      });
    });
  });
}

//change by vibha
export async function getRemarksForCancelMeeting(id: any) {
  return new Promise(resolve => {
    const products = [];
    //   let query = "select distinct CustomerId as id ,Party as Party,Outlet_Info as Outlet_Info from Pcustomer where CustomerId='" + id + "' union select  distinct OrderID as id ,OutletName as Party ,OutletAddress as Outlet_Info from newpartyoutlet where OrderID ='" + id + "' order by Party asc"
    let query =
      "select remark as Remarks,ActivityStatus from OrderMaster where ActivityStatus != '' and id ='" +
      id +
      "'";
    // console.log('getShopCardInfo', query);
    //  initDB().then((db) => {
    db1
      .transaction(tx => {
        tx.executeSql(query, [], (tx, results) => {
          let getOutletInfo = [];

          for (let i = 0; i < results.rows.length; i++) {
            getOutletInfo.push(results.rows.item(i));
          }

          resolve(getOutletInfo);
        });
      })
      .then(result => {
        //
      })
      .catch(err => {
        //console.log(err);
      });
  });
}

//change by vibha
export async function checkMeetingInOrderMaster(MeetingId: any) {
  return new Promise(resolve => {
    const products = [];
    let query =
      'SELECT * FROM OrderMaster  where DefaultDistributorId="' +
      MeetingId +
      '"';

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        // console.log('len :' + results.rows.length);
        resolve(results.rows.length);
      });
    });
  });
}

//change by vibha
export async function UpdateOrderMastersssForMeetingCancel(
  id: any,
  Current_date_time: any,
  entity_type: any,
  entity_id: any,
  latitude: any,
  longitude: any,
  total_amount: any,
  from_date: any,
  to_date: any,
  collection_type: any,
  user_id: any,
  remark: any,
  selected_flag: any,
  sync_flag: any,
  check_date: any,
  DefaultDistributorId: any,
  ExpectedDeliveryDate: any,
  ActivityStatus: any,
  ActivityStart: any,
  ActivityEnd: any,
) {
  //  'UPDATE TABLE_TEMP_ORDER_DETAILS SET quantity_one = ?, quantity_two = ?, small_Unit = ?, large_Unit = ?, from_date = ?, to_date = ?, Amount = ?, rate = ? ,bottleQty = ? WHERE order_id = ? and item_id = ? ', [qty_1, qty_2, small_Unit, large_Unit, from_date, to_date, amt, rate, bottleQty, order_id, item_id]).then(([tx, results]) => {
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        'UPDATE OrderMaster SET Current_date_time =?, latitude = ?, longitude = ?, remark = ?, sync_flag = ?, ActivityStatus = ?,collection_type = ?,ActivityStart=?,ActivityEnd=? WHERE collection_type = ?',
        [
          String(Current_date_time),
          String(latitude),
          String(longitude),
          String(remark),
          String(sync_flag),
          String(ActivityStatus),
          String(collection_type),
          String(ActivityStart),
          String(ActivityEnd),
          '6',
        ],
        (tx, results) => {
          resolve(results);
        },
        err => {
          console.error('error=', err);
        },
      );
    });
  });
}

export async function getmyactivitydataget(
  currentdate: any,
  yesterdaysdate: any,
  dayafteryesterdays: any,
) {
  //    console.log("this is my current date",currentdate);
  //  console.log("this is my yesterday date",yesterdaysdate);
  //  console.log("this is my day after yesterday date",dayafteryesterdays);

  //let query = 'select distinct entity_id from OrderMaster where from_date = "'+ currentdate +'" or from_date = "'+ yesterdaysdate +'" or from_date = "'+ dayafteryesterdays +'" ';
  let query =
    'SELECT distinct OrderMaster.entity_id,OrderMaster.from_date, Pcustomer.Party,Pcustomer.CustomerId from OrderMaster LEFT JOIN Pcustomer ON OrderMaster.entity_id = Pcustomer.CustomerId WHERE OrderMaster.from_date ="' +
    currentdate +
    '" ';
  let query1 =
    'SELECT distinct OrderMaster.entity_id,OrderMaster.from_date, Pcustomer.Party,Pcustomer.CustomerId from OrderMaster LEFT JOIN Pcustomer ON OrderMaster.entity_id = Pcustomer.CustomerId WHERE OrderMaster.from_date ="' +
    yesterdaysdate +
    '" ';
  let query2 =
    'SELECT distinct OrderMaster.entity_id,OrderMaster.from_date, Pcustomer.Party,Pcustomer.CustomerId from OrderMaster LEFT JOIN Pcustomer ON OrderMaster.entity_id = Pcustomer.CustomerId WHERE OrderMaster.from_date ="' +
    dayafteryesterdays +
    '" ';

  //  console.log("q---", query)
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let date1data: any = [];
        for (let i = 0; i < results.rows.length; i++) {
          date1data.push(results.rows.item(i));

          //  console.log("date1data",date1data);
        }
        db1.transaction(tx => {
          //  console.log("q---", query1)

          tx.executeSql(query1, [], (tx, results) => {
            let date2data: any = [];
            for (let i = 0; i < results.rows.length; i++) {
              date2data.push(results.rows.item(i));
              //    console.log("date2data",date2data);
            }
            db1.transaction(tx => {
              //  console.log("q---", query2)

              tx.executeSql(query2, [], (tx, results) => {
                let ImageDetails = [];
                let finaldata = [];
                for (let i = 0; i < results.rows.length; i++) {
                  ImageDetails.push(results.rows.item(i));
                }

                finaldata = date1data.concat(date2data, ImageDetails);
                resolve(finaldata);
              });
            });
          });
        });
      });
    });
  });
}

export async function insertOrderMastersssForMeetingCancel(
  id: any,
  Current_date_time: any,
  entity_type: any,
  entity_id: any,
  latitude: any,
  longitude: any,
  total_amount: any,
  from_date: any,
  to_date: any,
  collection_type: any,
  user_id: any,
  remark: any,
  selected_flag: any,
  sync_flag: any,
  check_date: any,
  DefaultDistributorId: any,
  ExpectedDeliveryDate: any,
  ActivityStatus: any,
  ActivityStart: any,
  ActivityEnd: any,
  uid: any,
) {
  console.log('ActivityStart and ActivityEnd--->', ActivityStart, ActivityEnd);
  //   initDB().then((db) => {
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        `insert into OrderMaster(id,Current_date_time ,entity_type,entity_id ,latitude ,longitude ,total_amount ,from_date ,to_date ,collection_type ,user_id ,remark,selected_flag ,sync_flag ,check_date,DefaultDistributorId,ExpectedDeliveryDate,ActivityStatus,ActivityStart,ActivityEnd, userid)
                                                                  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
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
          String(remark),
          String(selected_flag),
          String(sync_flag),
          String(check_date),
          String(DefaultDistributorId),
          String(ExpectedDeliveryDate),
          String(ActivityStatus),
          String(ActivityStart),
          String(ActivityEnd),
          String(uid),
        ],
        (tx, results) => {
          resolve(results);
        },
        err => {
          console.error('error=', err);
        },
      );
    });
  });
}

//change by vibha
export async function getOrderMasterSyncDataFor_Meeting(
  meetingid: any,
  sync_flag: any,
) {
  //id,Current_date_time ,entity_type,entity_id ,latitude ,longitude ,total_amount ,from_date ,to_date ,collection_type ,user_id ,remark,selected_flag ,sync_flag ,check_date,DefaultDistributorId,ExpectedDeliveryDate
  let query =
    "select id as ID,entity_type as EntityType,entity_id as EntityID ,latitude as Latitude ,longitude as Longitude ,total_amount as TotalAmount ,from_date as FromDate ,to_date as ToDate ,collection_type as CollectionType ,user_id as UserID ,remark as Remarks,Current_date_time as CurrentDatetime,DefaultDistributorId as DefaultDistributorId,ExpectedDeliveryDate as ExpectedDeliveryDate from OrderMaster where sync_flag ='N' && collection_type= '6'";
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        'select id as ID,entity_type as EntityType,entity_id as EntityID ,latitude as Latitude ,longitude as Longitude ,total_amount as TotalAmount ,from_date as FromDate ,to_date as ToDate ,collection_type as CollectionType ,user_id as UserID ,remark as Remarks,Current_date_time as CurrentDatetime,DefaultDistributorId as DefaultDistributorId,ExpectedDeliveryDate as ExpectedDeliveryDate,ActivityStatus as ActivityStatus,ActivityStart as ActivityStartTime,ActivityEnd as ActivityEndTime from OrderMaster where sync_flag = ? && collection_type= ?',
        [sync_flag, '6'],
        (tx, results) => {
          let OrderMaster = [];
          for (let i = 0; i < results.rows.length; i++) {
            OrderMaster.push(results.rows.item(i));
          }
          //return OrderMaster
          resolve(OrderMaster);
        },
      );
    });
  });
}

export async function getPlannedDates() {
  return new Promise(resolve => {
    const products = [];
    let query =
      'select distinct PlannedDate as PlannedDate from MJPMasterDetails';
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getOutletInfo = [];

        for (let i = 0; i < results.rows.length; i++) {
          getOutletInfo.push(results.rows.item(i));
        }

        resolve(getOutletInfo);
      });
    });
  });
}

export async function getPlannedDatesShops(selectedShopId: any) {
  return new Promise(resolve => {
    const products = [];
    let query =
      'select distinct PlannedDate as PlannedDate from MJPMasterDetails where EntityTypeID =' +
      selectedShopId +
      '';
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getOutletInfo = [];

        for (let i = 0; i < results.rows.length; i++) {
          getOutletInfo.push(results.rows.item(i));
        }

        resolve(getOutletInfo);
      });
    });
  });
}
///////////////////sync list///////
export async function getSyncDataList() {
  let query =
    "select OrderMaster.id,OrderMaster.DefaultDistributorId ,PDistributor.Distributor, Pcustomer.Party || case when OrderMaster.total_amount =0 then '' else  ' |TotalAmount:' || OrderMaster.total_amount end  as Party , collection_type from OrderMaster, Pcustomer, PDistributor where ordermaster.entity_id=Pcustomer.CustomerId and collection_type not in (4,8,9,3) and sync_flag='N' and OrderMaster.DefaultDistributorId=PDistributor.DistributorId union select OrderMaster.id,OrderMaster.DefaultDistributorId ,PDistributor.Distributor, PDistributor.Distributor || case when OrderMaster.total_amount =0 then '' else  ' |TotalAmount:' || OrderMaster.total_amount end  as Party , collection_type from OrderMaster, PDistributor where ordermaster.entity_id=PDistributor.DistributorId and collection_type not in (4,8,9,3) and sync_flag='N' and OrderMaster.DefaultDistributorId=PDistributor.DistributorId union select OrderMaster.id,OrderMaster.DefaultDistributorId ,PDistributor.Distributor, SubGroupMaster.Name || case when OrderMaster.total_amount =0 then '' else  ' |TotalAmount:' || OrderMaster.total_amount end  as Party , collection_type from OrderMaster, SubGroupMaster,PDistributor where ordermaster.entity_id=SubGroupMaster.Id and collection_type not in (4,8,9,3) and sync_flag='N' and OrderMaster.DefaultDistributorId=PDistributor.DistributorId order by collection_type";
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let len = results.rows.length;
        let checkorder = [];
        for (let i = 0; i < results.rows.length; i++) {
          checkorder.push(results.rows.item(i));
        }
        resolve(checkorder);
      });
    });
  });
}

export async function getSyncDataListforNewParty() {
  let query =
    "select OrderMaster.id,OrderMaster.DefaultDistributorId ,PDistributor.Distributor, newpartyoutlet.OutletName || case when OrderMaster.total_amount =0 then '' else  ' |TotalAmount:' || OrderMaster.total_amount end  as Party , collection_type from OrderMaster, newpartyoutlet, PDistributor where ordermaster.entity_id=newpartyoutlet.OrderId and collection_type not in (4,8,9,3) and sync_flag='N' and OrderMaster.DefaultDistributorId=PDistributor.DistributorId union select OrderMaster.id,OrderMaster.DefaultDistributorId ,PDistributor.Distributor, PDistributor.Distributor || case when OrderMaster.total_amount =0 then '' else  ' |TotalAmount:' || OrderMaster.total_amount end  as Party , collection_type from OrderMaster, PDistributor where ordermaster.entity_id=PDistributor.DistributorId and collection_type not in (4,8,9,3) and sync_flag='N' and OrderMaster.DefaultDistributorId=PDistributor.DistributorId and entity_type !=2 union select OrderMaster.id,OrderMaster.DefaultDistributorId ,PDistributor.Distributor, SubGroupMaster.Name || case when OrderMaster.total_amount =0 then '' else  ' |TotalAmount:' || OrderMaster.total_amount end  as Party , collection_type from OrderMaster, SubGroupMaster,PDistributor where ordermaster.entity_id=SubGroupMaster.Id and collection_type not in (4,8,9,3) and sync_flag='N' and OrderMaster.DefaultDistributorId=PDistributor.DistributorId order by collection_type";
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let len = results.rows.length;
        let checkorder = [];
        for (let i = 0; i < results.rows.length; i++) {
          checkorder.push(results.rows.item(i));
        }
        resolve(checkorder);
      });
    });
  });
}

export async function ActivitySavedForShop(CustomerID: string, uid: string) {
  let query =
    'SELECT DefaultDistributorId FROM PCustomer where CustomerId="' +
    CustomerID +
    '" and userid = "' +
    uid +
    '"';
  return new Promise<DefaultDistributorId[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempSearchProdect = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempSearchProdect.push(results.rows.item(i));
        }
        resolve(tempSearchProdect);
      });
    });
  });
}

export async function ActivitySavedForDist(ID: any, uid: any) {
  // console.log('CustomerID for Dist --->', ID);
  const products = [];
  let query =
    'SELECT DistributorID FROM PDistributor where DistributorID="' +
    ID +
    '" and userid = "' +
    uid +
    '"';
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempSearchProdect = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempSearchProdect.push(results.rows.item(i));
        }
        resolve(tempSearchProdect);
      });
    });
  });
}

export async function ActivitySavedForOther(ID: any, uid: any) {
  const products = [];
  let query =
    'SELECT DistributorID FROM PDistributor where DistributorID="' +
    ID +
    '" and userid = "' +
    uid +
    '"';
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempSearchProdect = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempSearchProdect.push(results.rows.item(i));
        }
        resolve(tempSearchProdect);
      });
    });
  });
}

export async function SelectCustForDist(id: string, uid: string | number) {
  // console.log('cust dist --->', id, uid);
  return new Promise<DefaultDistributorId[]>(resolve => {
    let query =
      'select distinct DefaultDistributorId from Pcustomer where CustomerId="' +
      id +
      '" and userid = "' +
      uid +
      '"';

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getOutletInfoDist = [];
        for (let i = 0; i < results.rows.length; i++) {
          getOutletInfoDist.push(results.rows.item(i));
        }
        resolve(getOutletInfoDist);
      });
    });
  });
}

export async function SelectDistName(id: string) {
  console.log('cust dist --->', id);
  return new Promise<DefaultDistributorId[]>(resolve => {
    let query =
      'select Distributor from PDistributor where DistributorId="' + id + '"';
    console.log(query);
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getOutletInfoDist = [];
        for (let i = 0; i < results.rows.length; i++) {
          getOutletInfoDist.push(results.rows.item(i));
        }
        resolve(getOutletInfoDist);
      });
    });
  });
}
export async function getPartyWeeklyOff(id: string, uid: string | number) {
  // console.log('cust dist --->', id, uid);
  return new Promise<any>(resolve => {
    let query =
      'select distinct WeeklyOff from Pcustomer where CustomerId="' +
      id +
      '" and userid = "' +
      uid +
      '"';

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getOutletInfoDist = [];
        for (let i = 0; i < results.rows.length; i++) {
          getOutletInfoDist.push(results.rows.item(i));
        }
        resolve(getOutletInfoDist);
      });
    });
  });
}

export async function SelectSubForMeet(id: string, uid: string) {
  return new Promise(resolve => {
    //   let query = "select distinct CustomerId as id ,Party as Party,Outlet_Info as Outlet_Info from Pcustomer where CustomerId='" + id + "' union select  distinct OrderID as id ,OutletName as Party ,OutletAddress as Outlet_Info from newpartyoutlet where OrderID ='" + id + "' order by Party asc"
    let query =
      "select Party as Shop_name,RouteName as location from Pcustomer where CustomerId='" +
      id +
      '" and userid = "' +
      uid +
      '"';
    // console.log('getShopCardInfo', query);
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getOutletInfo = [];
        for (let i = 0; i < results.rows.length; i++) {
          getOutletInfo.push(results.rows.item(i));
        }
        resolve(getOutletInfo);
      });
    });
  });
}

export async function pickerSetting(key: any) {
  // console.log('picker set log db');
  let query = "SELECT * FROM Settings where Key ='" + key + "'";
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempSearchProdect = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempSearchProdect.push(results.rows.item(i));
        }
        resolve(tempSearchProdect);
      });
    });
  });
}

export async function InsertMeet(
  ID: any,
  Meeting_Id: any,
  Shop_Id: any,
  Shop_name: any,
  PlannedDate: any,
  Time: any,
  location: any,
  Remarks: any,
  IsActivityDone: any,
  Type_sync: any,
  collection_type: any,
  latitude: any,
  longitude: any,
  TotalAmount: any,
  UserID: any,
  CurrentDatetime: any,
  DefaultDistributorId: any,
  ExpectedDeliveryDate: any,
  fromdate: any,
  todate: any,
) {
  // console.log('insert meet db inserted');
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        `insert into  MeetReport(ID,Meeting_Id,Shop_Id,Shop_name,PlannedDate,Time,location,Remarks,IsActivityDone,Type_sync,collection_type,latitude,longitude,TotalAmount,UserID,CurrentDatetime,DefaultDistributorId,ExpectedDeliveryDate,FromDate,ToDate)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          String(ID),
          String(Meeting_Id),
          String(Shop_Id),
          String(Shop_name),
          String(PlannedDate),
          String(Time),
          String(location),
          String(Remarks),
          String(IsActivityDone),
          String(Type_sync),
          String(collection_type),
          String(latitude),
          String(longitude),
          String(TotalAmount),
          String(UserID),
          String(CurrentDatetime),
          String(DefaultDistributorId),
          String(ExpectedDeliveryDate),
          String(fromdate),
          String(todate),
        ],
        (tx, results) => {
          resolve(results);
          console.log('insertedd meetreeeport --->', results);
        },
        err => {
          console.error('error=', err);
        },
      );
    });
  });
}

export async function MeetDraftDetails(meetingId: any) {
  let query = "select * from MeetReport where Meeting_Id ='" + meetingId + "'";
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let MeetReport = [];
        for (let i = 0; i < results.rows.length; i++) {
          MeetReport.push(results.rows.item(i));
        }
        //return OrderMaster
        resolve(MeetReport);
      });
    });
  });
}

export async function UpdateDraft(
  Remarks: string,
  Meeting_Id: number | string,
) {
  return new Promise(resolve => {
    // initDB().then((db) => {
    db1.transaction(tx => {
      tx.executeSql(
        'UPDATE MeetReport SET  Remarks = ? where Meeting_Id = ? ',
        [String(Remarks), String(Meeting_Id)],
        (tx: any, results: any) => {
          resolve(results);
        },
        (tx: any, error: any) => {
          console.error('Error updating MeetReport:', error);
          resolve(null);
        },
      );
    });
  });
}

export async function getMeetForSync(Meeting_Id: any) {
  //id,Current_date_time ,entity_type,entity_id ,latitude ,longitude ,total_amount ,from_date ,to_date ,collection_type ,user_id ,remark,selected_flag ,sync_flag ,check_date,DefaultDistributorId,ExpectedDeliveryDate
  let query =
    "select ID as ID,Type_sync as EntityType,Shop_Id as EntityID,PlannedDate as FromDate,PlannedDate as ToDate,Remarks || ' ' || location as Remark,collection_type as CollectionType,latitude as Latitude,longitude as Longitude,TotalAmount as TotalAmount,UserID as UserID,CurrentDatetime as CurrentDatetime,DefaultDistributorId as DefaultDistributorId,ExpectedDeliveryDate as ExpectedDeliveryDate from MeetReport where IsActivityDone ='false' and Meeting_Id='" +
    Meeting_Id +
    "'";
  return new Promise(resolve => {
    db1
      .transaction(tx => {
        tx.executeSql(query, [], (tx, results) => {
          let MeetReport = [];
          for (let i = 0; i < results.rows.length; i++) {
            MeetReport.push(results.rows.item(i));
          }
          //return OrderMaster
          resolve(MeetReport);
        });
      })
      .then(result => {})
      .catch(err => {
        //console.log(err);
      });
  });
}
export async function getSearchProdect() {
  let query = "select Value from Settings where Key='PRODUCTSKUSEARCHFILTER'";
  return new Promise<SettingTable[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempSearchProdect = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempSearchProdect.push(results.rows.item(i));
        }
        resolve(tempSearchProdect);
      });
    });
  });
}

export async function getAppsideLogWriting() {
  let query = "select Value from Settings where Key='AppsideLogWriting'";
  return new Promise<SettingTable[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempSearchProdect = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempSearchProdect.push(results.rows.item(i));
        }
        resolve(tempSearchProdect);
      });
    });
  });
}

export async function getAppsExtShare() {
  let query = "select Value from Settings where Key='ExtShare'";
  return new Promise<SettingTable[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempSearchProdect = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempSearchProdect.push(results.rows.item(i));
        }
        resolve(tempSearchProdect);
      });
    });
  });
}

export async function getSearchREMARK() {
  let query = "select Value from Settings where Key='MandatoryRemark'";
  return new Promise<SettingTable[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempSearchProdect = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempSearchProdect.push(results.rows.item(i));
        }
        resolve(tempSearchProdect);
      });
    });
  });
}

export async function getPrevOrdersDayNo() {
  let query = "select Value from Settings where Key='PREVIOUSDAYORDERDAYS'";
  return new Promise<SettingTable[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempSearchProdect = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempSearchProdect.push(results.rows.item(i));
        }
        resolve(tempSearchProdect);
      });
    });
  });
}

export async function getBrandSearchDataForChangeBrandColor(
  searchkey: string,
  list1: string,
  joinString: string,
  entityId: string,
  collectionType: string,
  id: string,
) {
  // console.log(searchkey, list1, joinString, entityId, collectionType, id);

  //// SELECT distinct BRAND , BRANDID FROM PItem where (%@ LIKE '%%%@%%') order by %@,BRAND",joinedString,search_text,search_product
  let query =
    'SELECT DISTINCT PItem.BRANDID, BRAND, TABLE_TEMP_ORDER_DETAILS.bottleQty, PItem.userid ' +
    'FROM PItem ' +
    'INNER JOIN TABLE_TEMP_ORDER_DETAILS ON TABLE_TEMP_ORDER_DETAILS.BrandId = PItem.BRANDID ' +
    'WHERE BRAND LIKE "%' +
    searchkey +
    '%" ' +
    'AND TABLE_TEMP_ORDER_DETAILS.entityId = "' +
    entityId +
    '" ' +
    'AND TABLE_TEMP_ORDER_DETAILS.CollectionType = "' +
    collectionType +
    '" ' +
    'AND PItem.userid = "' +
    id +
    '" ' +
    'ORDER BY PItem.ITEMSEQUENCE, "' +
    list1 +
    '", ' +
    joinString;

  // console.log('Query', query);

  // let query = 'select distinct BRANDID,BRAND from PItem where BRAND  like %?% order by ?,?,?';
  console.log('brand query : ' + query);
  return new Promise<BrandSearch[]>(resolve => {
    //console.log("in getFilterData 3");
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempfilter: any = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempfilter.push(results.rows.item(i));
        }
        let query1 =
          ' select distinct PItem.BRANDID,BRAND,CASE WHEN PItem.bottleQut IS NOT NULL THEN "false" ELSE "false" END bottleQty from PItem left join TABLE_TEMP_ORDER_DETAILS on TABLE_TEMP_ORDER_DETAILS.BrandId = PItem.BRANDID  where BRAND  like "%' +
          searchkey +
          '%" and PItem.userid="' +
          id +
          '" and PItem.BRANDID not in (select distinct PItem.BRANDID from PItem INNER join TABLE_TEMP_ORDER_DETAILS on TABLE_TEMP_ORDER_DETAILS.BrandId = PItem.BRANDID where BRAND  like "%' +
          searchkey +
          '%" and TABLE_TEMP_ORDER_DETAILS.entityId="' +
          entityId +
          '" and TABLE_TEMP_ORDER_DETAILS.CollectionType="' +
          collectionType +
          '"  order by "' +
          searchkey +
          '","' +
          list1 +
          '",' +
          joinString +
          ' ) order by PItem.ITEMSEQUENCE' +
          ',"' +
          list1 +
          '",' +
          joinString;

        //  console.log('ItemSequence::::::>', query1);

        db1.transaction(tx => {
          tx.executeSql(query1, [], (tx, results1) => {
            for (let i = 0; i < results1.rows.length; i++) {
              tempfilter.push(results1.rows.item(i));
            }
            // console.log('te=', tempfilter);
            resolve(tempfilter);
          });
        });
      });
    });
  });
}

//  SELECT distinct ITEMSEQUENCE , ItemId ,PTR , BPC  FROM PItem where BRAND LIKE '%TE%' and BRANDID = '2996' order by "T","DIVISION",DIVISION

export async function getSubBrandSearchData(
  BrandId: string,
  searchkey: string,
  list1: string,
  joinString: string,
  id: string,
) {
  let query =
    'select distinct ITEMSEQUENCE, BRAND, FLAVOUR, DIVISION, Item, bottleQut,ItemId ,PTR ,BPC, IsSelectedBrand, IsSelectedBrandProduct from PItem where BRAND like "%' +
    searchkey +
    '%" and BRANDID = "' +
    BrandId +
    '" and userid = "' +
    id +
    '" order by PItem.ITEMSEQUENCE ' +
    ',"' +
    list1 +
    '",' +
    joinString;

  // console.log('I am executing getSubBrandSearchData--->', query);
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempfilter = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempfilter.push(results.rows.item(i));
        }
        resolve(tempfilter);
      });
    });
  });
}

export async function getOrderDataForAddEdit1(
  outlet_id: string,
  collection_type: string,
) {
  return new Promise(resolve => {
    let query =
      ' SELECT TABLE_TEMP_ORDER_DETAILS.id,TABLE_TEMP_ORDER_DETAILS.item_id, TABLE_TEMP_ORDER_DETAILS.rate,TABLE_TEMP_ORDER_DETAILS.Amount, TABLE_TEMP_ORDER_DETAILS.quantity_one,TABLE_TEMP_ORDER_DETAILS.large_Unit,TABLE_TEMP_ORDER_DETAILS.small_Unit,TABLE_TEMP_ORDER_DETAILS.quantity_two,TABLE_TEMP_ORDER_DETAILS.bottleQty FROM TABLE_TEMP_ORDER_DETAILS ,TABLE_TEMP_OrderMaster where TABLE_TEMP_ORDER_DETAILS.order_id = TABLE_TEMP_OrderMaster.id and TABLE_TEMP_OrderMaster.entity_id="' +
      outlet_id +
      '" and TABLE_TEMP_OrderMaster.collection_type="' +
      collection_type +
      '"';
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempfilter = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempfilter.push(results.rows.item(i));
        }
        resolve(tempfilter);
      });
    });
  });
}

export async function getUOMLable() {
  return new Promise<SettingTable[]>(resolve => {
    let query = "select Value from Settings where Key='ORDBOOKUOMLABEL'";

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let geteditRateFlag = [];
        for (let i = 0; i < results.rows.length; i++) {
          geteditRateFlag.push(results.rows.item(i));
        }
        resolve(geteditRateFlag);
      });
    });
  });
}

//change by vibha
export async function getTotalamountOfOrder(orderid: string) {
  return new Promise(resolve => {
    let query =
      'select sum(Amount) as TotalAmount from OrderDetails where OrderDetails.order_id = "' +
      orderid +
      '"';

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let geteditRateFlag = [];
        for (let i = 0; i < results.rows.length; i++) {
          geteditRateFlag.push(results.rows.item(i));
        }
        resolve(geteditRateFlag);
      });
    });
  });
}

////////////////////
export async function getTotalOrdersOfOrderMAsternotsync() {
  return new Promise<NotSyncedDataCount[]>(resolve => {
    let query =
      'select count(*) as TotalCount from OrderMaster where sync_flag = "N"';

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let geteditRateFlag = [];
        for (let i = 0; i < results.rows.length; i++) {
          geteditRateFlag.push(results.rows.item(i));
        }
        resolve(geteditRateFlag);
      });
    });
  });
}

/////////////////////////
export async function geteditRateFlag() {
  return new Promise<SettingTable[]>(resolve => {
    let query = "select Value from Settings where Key='EDITRATEBLANK'";

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let geteditRateFlag = [];
        for (let i = 0; i < results.rows.length; i++) {
          geteditRateFlag.push(results.rows.item(i));
        }
        resolve(geteditRateFlag);
      });
    });
  });
}

/////////////////////////
export async function getOrderConfirmFlag() {
  return new Promise<SettingTable[]>(resolve => {
    let query =
      "select Value from Settings where Key='OrderConfirmationSignature'";

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getOrderConfirm = [];
        for (let i = 0; i < results.rows.length; i++) {
          getOrderConfirm.push(results.rows.item(i));
        }
        resolve(getOrderConfirm);
      });
    });
  });
}

//init db changed/////////
export async function checkIsOrderIdInDb(
  entity_id: string,
  collection_type: string,
  user_id: string,
) {
  let query =
    'SELECT id,Current_date_time,entity_type,entity_id,latitude,longitude,total_amount,collection_type,user_id FROM TABLE_TEMP_OrderMaster where entity_id = "' +
    entity_id +
    '" and collection_type  = "' +
    collection_type +
    '" and user_id = "' +
    user_id +
    '"';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let len = results.rows.length;
        let checkorder = [];
        for (let i = 0; i < results.rows.length; i++) {
          checkorder.push(results.rows.item(i));
        }
        resolve(checkorder);
      });
    });
  });
}

// Manish
export async function checkIsItemIdInDbForSideOrder(
  entity_id: string,
  collection_type: string,
  oid: string,
  user_id: string,
) {
  let query =
    'SELECT item_id FROM OrderDetails where entityId = "' +
    entity_id +
    '" and CollectionType = "' +
    collection_type +
    '" and order_id = "' +
    oid +
    '" and userid = "' +
    user_id +
    '"';

  // console.log('queery -->', query);
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let len = results.rows.length;
        let checkorder = [];
        for (let i = 0; i < results.rows.length; i++) {
          checkorder.push(results.rows.item(i));
        }
        resolve(checkorder);
      });
    });
  });
}

export async function deleteOrderDetails(orderid: string) {
  // console.log('order detail id--->', orderid);
  return new Promise(resolve => {
    let query = 'DELETE from OrderDetails WHERE OrderID ="' + orderid + '" ';
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        resolve(results);
      });
    });
  });
}

export async function deleteEditedorderMaster(orderid: string) {
  return new Promise(resolve => {
    let query = 'DELETE from OrderMaster WHERE id ="' + orderid + '" ';
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        resolve(results);
      });
    });
  });
}

export async function deleteEditedorderDiscount(orderid: string) {
  return new Promise(resolve => {
    let query = 'DELETE from TABLE_DISCOUNT WHERE OrderID ="' + orderid + '" ';
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        resolve(results);
      });
    });
  });
}

export async function getInsertedTableTempOrderMasterId(
  entity_id: string,
  collection_type: string,
  user_id: string,
) {
  let query =
    'SELECT id  FROM TABLE_TEMP_OrderMaster where entity_id = "' +
    entity_id +
    '" and collection_type =  "' +
    collection_type +
    '"  and user_id = "' +
    user_id +
    '" ';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getorderId = [];
        for (let i = 0; i < results.rows.length; i++) {
          getorderId.push(results.rows.item(i));
        }
        resolve(getorderId);
      });
    });
  });
}

export async function checkIsRowExistInTempMasterTable(
  order_id: string,
  collection_type: string,
) {
  //console.log("saar", order_id)
  return new Promise(resolve => {
    let query =
      'SELECT id FROM TABLE_TEMP_OrderMaster where id="' +
      order_id +
      '" and collection_type="' +
      collection_type +
      '"';
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let checkorder = [];
        for (let i = 0; i < results.rows.length; i++) {
          checkorder.push(results.rows.item(i));
        }
        resolve(checkorder);
      });
    });
  });
}
export async function selectTempMasterDetailId(
  itemId: string,
  appOrderId: string | number,
) {
  const products = [];
  let query =
    'SELECT * FROM TABLE_TEMP_ORDER_DETAILS where item_id="' +
    itemId +
    '" and order_id="' +
    appOrderId +
    '"';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getData = [];
        for (let i = 0; i < results.rows.length; i++) {
          getData.push(results.rows.item(i));
        }
        resolve(getData);
      });
    });
  });
}

//change by Manish
export async function updateTABLE_TEMP_ORDER_DETAILS(
  qty_1: string | number,
  qty_2: string | number,
  large_Unit: string | number,
  small_Unit: string | number,
  from_date: string,
  to_date: string,
  amt: string | number,
  rate: string | number,
  bottleQty: string | number,
  order_id: string | number,
  item_id: string,
  GSTRate: string | number,
  GSTTotal: string | number,
  calculatedResult: string | number,
) {
  console.log('amt temp o detail -->', GSTRate, GSTTotal, calculatedResult);

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        'UPDATE TABLE_TEMP_ORDER_DETAILS SET quantity_one = ?, quantity_two = ?, small_Unit = ?, large_Unit = ?, from_date = ?, to_date = ?, Amount = ?, rate = ? ,bottleQty = ? , GSTRate = ?, GSTTotal = ?, GrossAmount=? WHERE order_id = "' +
          String(order_id) +
          '" and item_id = "' +
          String(item_id) +
          '"',
        [
          String(qty_1),
          String(qty_2),
          String(small_Unit),
          String(large_Unit),
          String(from_date),
          String(to_date),
          String(amt),
          String(rate),
          String(bottleQty),
          String(GSTRate),
          String(GSTTotal),
          String(calculatedResult),
        ],
        (tx, results) => {
          resolve(results);
        },
      );
    });
  });
}

export async function updateORDERDETAILSforSideOrder(
  qty_1: string | number,
  qty_2: string | number,
  large_Unit: string | number,
  small_Unit: string | number,
  amt: string | number,
  rate: string | number,
  bottleQty: string | number,
  order_id: string | number,
  item_id: string,
) {
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        'UPDATE OrderDetails SET quantity_one = ?, quantity_two = ?, small_Unit = ?, large_Unit = ?, Amount = ?, rate = ?, bottleQty = ? WHERE order_id = "' +
          String(order_id) +
          '" and item_id = "' +
          String(item_id) +
          '"',
        [
          String(qty_1),
          String(qty_2),
          String(small_Unit),
          String(large_Unit),
          String(amt),
          String(rate),
          String(bottleQty),
        ],
        (tx, results) => {
          resolve(results);
        },
        err => {
          console.error('error=', err);
        },
      );
    });
  });
}

export async function updateOMasterTotalAmountforSideOrder(
  amt: string | number,
  order_id: string | number,
) {
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        'UPDATE OrderMaster SET total_amount = ? WHERE id = "' +
          String(order_id) +
          '"',
        [String(amt)],
        (tx, results) => {
          resolve(results);
        },
        err => {
          console.error('error=', err);
        },
      );
    });
  });
}

export async function getOrdersFromDbIfPresent(
  entity_id: string,
  collection_type: string,
  item_id: string,
) {
  // let query='SELECT distinct ,TABLE_TEMP_ORDER_DETAILS.order_id,  TABLE_TEMP_ORDER_DETAILS.item_Name,  TABLE_TEMP_ORDER_DETAILS.quantity_one, TABLE_TEMP_ORDER_DETAILS.rate,  TABLE_TEMP_ORDER_DETAILS.Amount,TABLE_TEMP_ORDER_DETAILS.quantity_two,TABLE_TEMP_ORDER_DETAILS.small_Unit,TABLE_TEMP_ORDER_DETAILS.large_Unit,TABLE_TEMP_ORDER_DETAILS.from_date, TABLE_TEMP_ORDER_DETAILS.to_date, TABLE_TEMP_ORDER_DETAILS.bpc FROM TABLE_TEMP_ORDER_DETAILS INNER JOIN PItem ON TABLE_TEMP_ORDER_DETAILS.item_id = ItemId WHERE TABLE_TEMP_ORDER_DETAILS.order_id  = "'+app_order_id+'"'

  let query =
    'SELECT TABLE_TEMP_ORDER_DETAILS.id,TABLE_TEMP_ORDER_DETAILS.item_id,TABLE_TEMP_ORDER_DETAILS.rate,TABLE_TEMP_ORDER_DETAILS.bpc,TABLE_TEMP_ORDER_DETAILS.Amount,TABLE_TEMP_ORDER_DETAILS.quantity_one,TABLE_TEMP_ORDER_DETAILS.quantity_two,TABLE_TEMP_ORDER_DETAILS.small_Unit,TABLE_TEMP_ORDER_DETAILS.large_Unit,TABLE_TEMP_ORDER_DETAILS.from_date, TABLE_TEMP_ORDER_DETAILS.to_date,TABLE_TEMP_ORDER_DETAILS.selected_flag,TABLE_TEMP_ORDER_DETAILS.order_id FROM TABLE_TEMP_ORDER_DETAILS , TABLE_TEMP_OrderMaster where TABLE_TEMP_ORDER_DETAILS.order_id = TABLE_TEMP_OrderMaster.id and TABLE_TEMP_OrderMaster.entity_id="' +
    entity_id +
    '" and TABLE_TEMP_OrderMaster.collection_type="' +
    collection_type +
    '" and TABLE_TEMP_ORDER_DETAILS.item_id = "' +
    item_id +
    '"';

  // console.log('query getOrdersFromDbIfPresent -->', query);
  return new Promise<presentTempOrder[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getOrdersFromDb = [];
        for (let i = 0; i < results.rows.length; i++) {
          getOrdersFromDb.push(results.rows.item(i));
        }
        resolve(getOrdersFromDb);
      });
    });
  });
}

export async function getOrdersFromODetailsIfPresent(
  OID: string,
  collection_type: string,
  item_id: string,
) {
  // let query='SELECT distinct ,TABLE_TEMP_ORDER_DETAILS.order_id,  TABLE_TEMP_ORDER_DETAILS.item_Name,  TABLE_TEMP_ORDER_DETAILS.quantity_one, TABLE_TEMP_ORDER_DETAILS.rate,  TABLE_TEMP_ORDER_DETAILS.Amount,TABLE_TEMP_ORDER_DETAILS.quantity_two,TABLE_TEMP_ORDER_DETAILS.small_Unit,TABLE_TEMP_ORDER_DETAILS.large_Unit,TABLE_TEMP_ORDER_DETAILS.from_date, TABLE_TEMP_ORDER_DETAILS.to_date, TABLE_TEMP_ORDER_DETAILS.bpc FROM TABLE_TEMP_ORDER_DETAILS INNER JOIN PItem ON TABLE_TEMP_ORDER_DETAILS.item_id = ItemId WHERE TABLE_TEMP_ORDER_DETAILS.order_id  = "'+app_order_id+'"'

  let query =
    'SELECT quantity_one, quantity_two, large_Unit, small_Unit, rate, Amount FROM OrderDetails WHERE order_id ="' +
    OID +
    '" and CollectionType ="' +
    collection_type +
    '" and item_id = "' +
    item_id +
    '"';

  // console.log('query getOrdersFromDbIfPresent -->', query);
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getOrdersFromDb = [];
        for (let i = 0; i < results.rows.length; i++) {
          getOrdersFromDb.push(results.rows.item(i));
        }
        resolve(getOrdersFromDb);
      });
    });
  });
}

export async function getInsertedsTempOrder(app_order_id: string) {
  return new Promise<OrderPreviewBrandList[]>(resolve => {
    //SELECT distinct TABLE_TEMP_ORDER_DETAILS.id, TABLE_TEMP_ORDER_DETAILS.item_id, TABLE_TEMP_ORDER_DETAILS.item_Name,  TABLE_TEMP_ORDER_DETAILS.quantity_one, TABLE_TEMP_ORDER_DETAILS.rate,  TABLE_TEMP_ORDER_DETAILS.Amount,TABLE_TEMP_ORDER_DETAILS.quantity_two,TABLE_TEMP_ORDER_DETAILS.small_Unit,TABLE_TEMP_ORDER_DETAILS.large_Unit,TABLE_TEMP_ORDER_DETAILS.from_date, TABLE_TEMP_ORDER_DETAILS.to_date, TABLE_TEMP_ORDER_DETAILS.bpc FROM TABLE_TEMP_ORDER_DETAILS INNER JOIN PItem ON TABLE_TEMP_ORDER_DETAILS.item_id = ItemId WHERE TABLE_TEMP_ORDER_DETAILS.order_id  = '%@'",order_id

    let query =
      'SELECT distinct TABLE_TEMP_ORDER_DETAILS.id,TABLE_TEMP_ORDER_DETAILS.order_id, TABLE_TEMP_ORDER_DETAILS.item_id, TABLE_TEMP_ORDER_DETAILS.item_Name, TABLE_TEMP_ORDER_DETAILS.quantity_one, TABLE_TEMP_ORDER_DETAILS.rate, TABLE_TEMP_ORDER_DETAILS.Amount,TABLE_TEMP_ORDER_DETAILS.quantity_two,TABLE_TEMP_ORDER_DETAILS.small_Unit,TABLE_TEMP_ORDER_DETAILS.large_Unit,TABLE_TEMP_ORDER_DETAILS.from_date, TABLE_TEMP_ORDER_DETAILS.to_date, TABLE_TEMP_ORDER_DETAILS.bpc FROM TABLE_TEMP_ORDER_DETAILS INNER JOIN PItem ON TABLE_TEMP_ORDER_DETAILS.item_id = ItemId WHERE TABLE_TEMP_ORDER_DETAILS.order_id  = "' +
      app_order_id +
      '"';
    // console.log('edit preview query -->', query);
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getInsertedsTempOrder = [];
        for (let i = 0; i < results.rows.length; i++) {
          getInsertedsTempOrder.push(results.rows.item(i));
        }
        resolve(getInsertedsTempOrder);
      });
    });
  });
}

export async function getTempOrderPreviewDeleteCheck(app_order_id: string) {
  return new Promise<IdFromOMaster[]>(resolve => {
    //SELECT distinct TABLE_TEMP_ORDER_DETAILS.id, TABLE_TEMP_ORDER_DETAILS.item_id, TABLE_TEMP_ORDER_DETAILS.item_Name,  TABLE_TEMP_ORDER_DETAILS.quantity_one, TABLE_TEMP_ORDER_DETAILS.rate,  TABLE_TEMP_ORDER_DETAILS.Amount,TABLE_TEMP_ORDER_DETAILS.quantity_two,TABLE_TEMP_ORDER_DETAILS.small_Unit,TABLE_TEMP_ORDER_DETAILS.large_Unit,TABLE_TEMP_ORDER_DETAILS.from_date, TABLE_TEMP_ORDER_DETAILS.to_date, TABLE_TEMP_ORDER_DETAILS.bpc FROM TABLE_TEMP_ORDER_DETAILS INNER JOIN PItem ON TABLE_TEMP_ORDER_DETAILS.item_id = ItemId WHERE TABLE_TEMP_ORDER_DETAILS.order_id  = '%@'",order_id

    let query =
      'SELECT distinct TABLE_TEMP_ORDER_DETAILS.id FROM TABLE_TEMP_ORDER_DETAILS INNER JOIN PItem ON TABLE_TEMP_ORDER_DETAILS.item_id = ItemId WHERE TABLE_TEMP_ORDER_DETAILS.order_id  = "' +
      app_order_id +
      '"';
    // console.log('edit preview query -->', query);
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getInsertedsTempOrder = [];
        for (let i = 0; i < results.rows.length; i++) {
          getInsertedsTempOrder.push(results.rows.item(i));
        }
        resolve(getInsertedsTempOrder);
      });
    });
  });
}

export async function getInsertedTempOrder(app_order_id: string) {
  return new Promise(resolve => {
    let query =
      'SELECT distinct TABLE_TEMP_ORDER_DETAILS.id,TABLE_TEMP_ORDER_DETAILS.order_id, TABLE_TEMP_ORDER_DETAILS.item_id as ItemId, TABLE_TEMP_ORDER_DETAILS.item_Name as ITEMSEQUENCE, TABLE_TEMP_ORDER_DETAILS.quantity_one, TABLE_TEMP_ORDER_DETAILS.rate, TABLE_TEMP_ORDER_DETAILS.Amount,TABLE_TEMP_ORDER_DETAILS.quantity_two, TABLE_TEMP_ORDER_DETAILS.small_Unit,TABLE_TEMP_ORDER_DETAILS.large_Unit,TABLE_TEMP_ORDER_DETAILS.from_date, TABLE_TEMP_ORDER_DETAILS.to_date, TABLE_TEMP_ORDER_DETAILS.BrandId,TABLE_TEMP_ORDER_DETAILS.bpc as BPC, TABLE_TEMP_ORDER_DETAILS.bottleQty, TABLE_TEMP_ORDER_DETAILS.TEMP_BRAND as BRAND, TABLE_TEMP_ORDER_DETAILS.TEMP_DIVISION as DIVISION, TABLE_TEMP_ORDER_DETAILS.TEMP_FLAVOUR as FLAVOUR,TABLE_TEMP_ORDER_DETAILS.GSTRate as GSTRate, TABLE_TEMP_ORDER_DETAILS.GSTTotal as GSTTotal,TABLE_TEMP_ORDER_DETAILS.GrossAmount as GrossAmount  FROM TABLE_TEMP_ORDER_DETAILS INNER JOIN PItem ON TABLE_TEMP_ORDER_DETAILS.item_id = ItemId WHERE TABLE_TEMP_ORDER_DETAILS.order_id = "' +
      app_order_id +
      '"';
    // console.log('edit preview query -->', query);
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getInsertedsTempOrder = [];
        for (let i = 0; i < results.rows.length; i++) {
          getInsertedsTempOrder.push(results.rows.item(i));
        }
        resolve(getInsertedsTempOrder);
      });
    });
  });
}

export async function getInsertedTempOrderforGST(app_order_id: string) {
  console.log('App orderid', app_order_id);

  return new Promise(resolve => {
    let query =
      'SELECT distinct TABLE_TEMP_ORDER_DETAILS.id,TABLE_TEMP_ORDER_DETAILS.order_id,TABLE_TEMP_ORDER_DETAILS.item_id as ItemId, TABLE_TEMP_ORDER_DETAILS.item_Name as ITEMSEQUENCE, TABLE_TEMP_ORDER_DETAILS.quantity_one, TABLE_TEMP_ORDER_DETAILS.rate,TABLE_TEMP_ORDER_DETAILS.Amount,TABLE_TEMP_ORDER_DETAILS.GSTRate, TABLE_TEMP_ORDER_DETAILS.GSTTotal,TABLE_TEMP_ORDER_DETAILS.GrossAmount FROM TABLE_TEMP_ORDER_DETAILS INNER JOIN PItem ON TABLE_TEMP_ORDER_DETAILS.item_id = ItemId WHERE TABLE_TEMP_ORDER_DETAILS.order_id = "' +
      app_order_id +
      '"';
    console.log('edit preview query -->', query);
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getInsertedsTempOrder = [];
        for (let i = 0; i < results.rows.length; i++) {
          getInsertedsTempOrder.push(results.rows.item(i));
        }
        resolve(getInsertedsTempOrder);
      });
    });
  });
}

export async function getInsertedsTempFreeOrder(
  app_order_id: string,
  flag: string,
) {
  return new Promise(resolve => {
    let query =
      'SELECT DISTINCT DiscountType, DiscountAmount, BrandCode, flag, TABLE_TEMP_ORDER_DETAILS.item_Name, TABLE_TEMP_ORDER_DETAILS.large_Unit, TABLE_TEMP_ORDER_DETAILS.small_Unit , TABLE_TEMP_ORDER_DETAILS.quantity_one, TABLE_TEMP_ORDER_DETAILS.quantity_two FROM TABLE_TEMP_ORDER_DETAILS INNER JOIN TABLE_DISCOUNT ON TABLE_TEMP_ORDER_DETAILS.order_id = TABLE_DISCOUNT.OrderID WHERE TABLE_TEMP_ORDER_DETAILS.order_id = "' +
      app_order_id +
      '" AND flag= "' +
      flag +
      '" AND TABLE_TEMP_ORDER_DETAILS.item_id = TABLE_DISCOUNT.OrderedItemID';
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getInsertedsTempOrder = [];
        for (let i = 0; i < results.rows.length; i++) {
          getInsertedsTempOrder.push(results.rows.item(i));
        }
        resolve(getInsertedsTempOrder);
      });
    });
  });
}

export async function getInsertedsSideOrderFreeOrder(
  app_order_id: string,
  flag: string,
) {
  return new Promise(resolve => {
    let query =
      'SELECT DISTINCT DiscountType, DiscountAmount, BrandCode, flag, OrderDetails.item_Name, OrderDetails.large_Unit, OrderDetails.small_Unit , OrderDetails.quantity_one, OrderDetails.quantity_two FROM OrderDetails INNER JOIN TABLE_DISCOUNT ON OrderDetails.order_id = TABLE_DISCOUNT.OrderID WHERE OrderDetails.order_id = "' +
      app_order_id +
      '" AND flag= "' +
      flag +
      '" AND OrderDetails.item_id = TABLE_DISCOUNT.OrderedItemID';
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getInsertedsTempOrder = [];
        for (let i = 0; i < results.rows.length; i++) {
          getInsertedsTempOrder.push(results.rows.item(i));
        }
        resolve(getInsertedsTempOrder);
      });
    });
  });
}

export async function getInsertedsTempdiscount(app_order_id: string) {
  return new Promise(resolve => {
    //SELECT distinct TABLE_TEMP_ORDER_DETAILS.id, TABLE_TEMP_ORDER_DETAILS.item_id, TABLE_TEMP_ORDER_DETAILS.item_Name,  TABLE_TEMP_ORDER_DETAILS.quantity_one, TABLE_TEMP_ORDER_DETAILS.rate,  TABLE_TEMP_ORDER_DETAILS.Amount,TABLE_TEMP_ORDER_DETAILS.quantity_two,TABLE_TEMP_ORDER_DETAILS.small_Unit,TABLE_TEMP_ORDER_DETAILS.large_Unit,TABLE_TEMP_ORDER_DETAILS.from_date, TABLE_TEMP_ORDER_DETAILS.to_date, TABLE_TEMP_ORDER_DETAILS.bpc FROM TABLE_TEMP_ORDER_DETAILS INNER JOIN PItem ON TABLE_TEMP_ORDER_DETAILS.item_id = ItemId WHERE TABLE_TEMP_ORDER_DETAILS.order_id  = '%@'",order_id

    let query =
      'select DiscountAmount from TABLE_DISCOUNT WHERE OrderID  = "' +
      app_order_id +
      '"';
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getInsertedsTempOrder = [];
        for (let i = 0; i < results.rows.length; i++) {
          getInsertedsTempOrder.push(results.rows.item(i));
        }
        resolve(getInsertedsTempOrder);
      });
    });
  });
}

export async function getLICnoofCust(selectedOutletId: string) {
  return new Promise(resolve => {
    //SELECT distinct TABLE_TEMP_ORDER_DETAILS.id, TABLE_TEMP_ORDER_DETAILS.item_id, TABLE_TEMP_ORDER_DETAILS.item_Name,  TABLE_TEMP_ORDER_DETAILS.quantity_one, TABLE_TEMP_ORDER_DETAILS.rate,  TABLE_TEMP_ORDER_DETAILS.Amount,TABLE_TEMP_ORDER_DETAILS.quantity_two,TABLE_TEMP_ORDER_DETAILS.small_Unit,TABLE_TEMP_ORDER_DETAILS.large_Unit,TABLE_TEMP_ORDER_DETAILS.from_date, TABLE_TEMP_ORDER_DETAILS.to_date, TABLE_TEMP_ORDER_DETAILS.bpc FROM TABLE_TEMP_ORDER_DETAILS INNER JOIN PItem ON TABLE_TEMP_ORDER_DETAILS.item_id = ItemId WHERE TABLE_TEMP_ORDER_DETAILS.order_id  = '%@'",order_id

    let query =
      'select LicenceNo, Area from Pcustomer WHERE CustomerId  = "' +
      selectedOutletId +
      '"';
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getInsertedsTempOrder = [];
        for (let i = 0; i < results.rows.length; i++) {
          getInsertedsTempOrder.push(results.rows.item(i));
        }
        resolve(getInsertedsTempOrder);
      });
    });
  });
}

export async function getItemDiscountFromDbMainMaster(
  entity_id: string,
  order_id: string,
  item_id: string,
) {
  return new Promise(resolve => {
    ///SELECT TABLE_TEMP_ORDER_DETAILS.item_id,TABLE_TEMP_ORDER_DETAILS.order_id FROM TABLE_TEMP_ORDER_DETAILS , TABLE_TEMP_OrderMaster where TABLE_TEMP_ORDER_DETAILS.order_id = TABLE_TEMP_OrderMaster.id and TABLE_TEMP_OrderMaster.entity_id="'+entity_id+'" and TABLE_TEMP_ORDER_DETAILS.item_id = "'+item_id+'"'
    //SELECT * FROM TABLE_DISCOUNT ,TABLE_TEMP_OrderMaster where TABLE_DISCOUNT.OrderID = TABLE_TEMP_OrderMaster.id and TABLE_TEMP_OrderMaster.entity_id="'+entity_id+'" and TABLE_DISCOUNT.OrderedItemID = "'+item_id+'"'
    // let query='SELECT * from TABLE_DISCOUNT where  OrderID = "'+order_id+'" and OrderedItemID = "'+item_id+'"'
    let query =
      'SELECT * FROM TABLE_DISCOUNT ,OrderMaster where TABLE_DISCOUNT.flag="D" and  TABLE_DISCOUNT.OrderID = OrderMaster.id and OrderMaster.entity_id="' +
      entity_id +
      '" and TABLE_DISCOUNT.OrderedItemID = "' +
      item_id +
      '"';

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getItemDiscountFromDb = [];
        for (let i = 0; i < results.rows.length; i++) {
          getItemDiscountFromDb.push(results.rows.item(i));
        }
        //console.log("getItemDiscountFromDb=", getItemDiscountFromDb)
        resolve(getItemDiscountFromDb);
      });
    });
  });
}

export async function getItemSchemeFromDb2(
  entity_id: string,
  order_id: string,
  item_id: string,
) {
  // console.log(
  //     '\n\n\n\nfrom db scheme--->',
  //     'ent id-->',
  //     entity_id,
  //     'orderid --->',
  //     order_id,
  //     'itemid',
  //     item_id,
  // );

  return new Promise(resolve => {
    ///SELECT TABLE_TEMP_ORDER_DETAILS.item_id,TABLE_TEMP_ORDER_DETAILS.order_id FROM TABLE_TEMP_ORDER_DETAILS , TABLE_TEMP_OrderMaster where TABLE_TEMP_ORDER_DETAILS.order_id = TABLE_TEMP_OrderMaster.id and TABLE_TEMP_OrderMaster.entity_id="'+entity_id+'" and TABLE_TEMP_ORDER_DETAILS.item_id = "'+item_id+'"'
    //SELECT * FROM TABLE_DISCOUNT ,TABLE_TEMP_OrderMaster where TABLE_DISCOUNT.OrderID = TABLE_TEMP_OrderMaster.id and TABLE_TEMP_OrderMaster.entity_id="'+entity_id+'" and TABLE_DISCOUNT.OrderedItemID = "'+item_id+'"'
    // let query='SELECT * from TABLE_DISCOUNT where  OrderID = "'+order_id+'" and OrderedItemID = "'+item_id+'"'
    let query =
      'SELECT DISTINCT DiscountType FROM TABLE_DISCOUNT ,TABLE_TEMP_OrderMaster where TABLE_DISCOUNT.flag="S" and  TABLE_DISCOUNT.OrderID = TABLE_TEMP_OrderMaster.id and TABLE_TEMP_OrderMaster.entity_id="' +
      entity_id +
      '" and TABLE_DISCOUNT.OrderedItemID = "' +
      item_id +
      '"';

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getItemDiscountFromDb = [];
        for (let i = 0; i < results.rows.length; i++) {
          getItemDiscountFromDb.push(results.rows.item(i));
        }
        resolve(getItemDiscountFromDb);
      });
    });
  });
}

export async function getItemDiscountsFromDb(
  flag: string,
  order_id: string,
  item_id: string,
) {
  return new Promise<AddDiscountIfPresent[]>(resolve => {
    let query =
      'SELECT DiscountType, RNP, Rate, DiscountAmount FROM TABLE_DISCOUNT WHERE flag ="' +
      flag +
      '" and OrderID = "' +
      order_id +
      '" and OrderedItemID = "' +
      item_id +
      '"';
    console.log('quuuuuery -->', query);

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getItemDiscountFromDb = [];
        for (let i = 0; i < results.rows.length; i++) {
          getItemDiscountFromDb.push(results.rows.item(i));
        }
        resolve(getItemDiscountFromDb);
      });
    });
  });
}

export async function getItemDiscountFromDb(
  entity_id: string,
  order_id: string,
  item_id: string,
) {
  return new Promise(resolve => {
    ///SELECT TABLE_TEMP_ORDER_DETAILS.item_id,TABLE_TEMP_ORDER_DETAILS.order_id FROM TABLE_TEMP_ORDER_DETAILS , TABLE_TEMP_OrderMaster where TABLE_TEMP_ORDER_DETAILS.order_id = TABLE_TEMP_OrderMaster.id and TABLE_TEMP_OrderMaster.entity_id="'+entity_id+'" and TABLE_TEMP_ORDER_DETAILS.item_id = "'+item_id+'"'
    //SELECT * FROM TABLE_DISCOUNT ,TABLE_TEMP_OrderMaster where TABLE_DISCOUNT.OrderID = TABLE_TEMP_OrderMaster.id and TABLE_TEMP_OrderMaster.entity_id="'+entity_id+'" and TABLE_DISCOUNT.OrderedItemID = "'+item_id+'"'
    // let query='SELECT * from TABLE_DISCOUNT where  OrderID = "'+order_id+'" and OrderedItemID = "'+item_id+'"'
    let query =
      'SELECT * FROM TABLE_DISCOUNT ,TABLE_TEMP_OrderMaster where TABLE_DISCOUNT.flag="D" and TABLE_DISCOUNT.OrderID = TABLE_TEMP_OrderMaster.id and TABLE_TEMP_OrderMaster.entity_id="' +
      entity_id +
      '" and TABLE_DISCOUNT.OrderedItemID = "' +
      item_id +
      '"';

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getItemDiscountFromDb = [];
        for (let i = 0; i < results.rows.length; i++) {
          getItemDiscountFromDb.push(results.rows.item(i));
        }
        resolve(getItemDiscountFromDb);
      });
    });
  });
}

export async function getItemDiscountFromDbifPresent(
  entity_id: string,
  order_id: string,
  item_id: string,
) {
  return new Promise<AddDiscountIfPresent[]>(resolve => {
    ///SELECT TABLE_TEMP_ORDER_DETAILS.item_id,TABLE_TEMP_ORDER_DETAILS.order_id FROM TABLE_TEMP_ORDER_DETAILS , TABLE_TEMP_OrderMaster where TABLE_TEMP_ORDER_DETAILS.order_id = TABLE_TEMP_OrderMaster.id and TABLE_TEMP_OrderMaster.entity_id="'+entity_id+'" and TABLE_TEMP_ORDER_DETAILS.item_id = "'+item_id+'"'
    //SELECT * FROM TABLE_DISCOUNT ,TABLE_TEMP_OrderMaster where TABLE_DISCOUNT.OrderID = TABLE_TEMP_OrderMaster.id and TABLE_TEMP_OrderMaster.entity_id="'+entity_id+'" and TABLE_DISCOUNT.OrderedItemID = "'+item_id+'"'
    // let query='SELECT * from TABLE_DISCOUNT where  OrderID = "'+order_id+'" and OrderedItemID = "'+item_id+'"'
    let query =
      'SELECT TABLE_DISCOUNT.DiscountType, TABLE_DISCOUNT.RNP, TABLE_DISCOUNT.Rate, TABLE_DISCOUNT.DiscountAmount FROM TABLE_DISCOUNT ,TABLE_TEMP_OrderMaster where TABLE_DISCOUNT.flag="D" and TABLE_DISCOUNT.OrderID = TABLE_TEMP_OrderMaster.id and TABLE_TEMP_OrderMaster.entity_id="' +
      entity_id +
      '" and TABLE_DISCOUNT.OrderedItemID = "' +
      item_id +
      '"';

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getItemDiscountFromDb = [];
        for (let i = 0; i < results.rows.length; i++) {
          getItemDiscountFromDb.push(results.rows.item(i));
        }
        resolve(getItemDiscountFromDb);
      });
    });
  });
}

export async function updateTABLE_PITEM_ADDEDITBRAND(
  item_id: string,
  Brand: boolean,
  Subbrand: boolean,
) {
  return new Promise(resolve => {
    let query =
      'UPDATE PItem SET IsSelectedBrand ="' +
      String(Brand) +
      '" , IsSelectedBrandProduct = "' +
      String(Subbrand) +
      '" WHERE ItemId="' +
      String(item_id) +
      '"';

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        resolve(results);
      });
    });
  });
}

export async function updateTABLE_PITEM_btleQty(
  item_id: string,
  bottleQty: string,
) {
  return new Promise(resolve => {
    let query =
      'UPDATE PItem SET bottleQut ="' +
      String(bottleQty) +
      '"  WHERE ItemId="' +
      String(item_id) +
      '"';
    console.log('updateTABLE_PITEM_btleQty q-->', query);

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        resolve(results);
      });
    });
  });
}

export async function deleteRowItem(order_id: string, item_id: string) {
  db1.transaction(tx => {
    tx.executeSql(
      'DELETE FROM TABLE_TEMP_ORDER_DETAILS where TABLE_TEMP_ORDER_DETAILS.item_id = "' +
        item_id +
        '" and order_id="' +
        order_id +
        '" ',
      [],
      (tx, results) => {
        console.log('delete row item', results.rowsAffected);
      },
    );
  });
}

//change by Manish
export async function deleteRowItemFromOrdrDetail(
  order_id: string,
  item_id: string,
) {
  db1.transaction(tx => {
    tx.executeSql(
      'DELETE FROM OrderDetails where item_id = "' +
        item_id +
        '" and order_id="' +
        order_id +
        '" ',
      [],
      (tx, results) => {
        console.log('delete row item', results.rowsAffected);
      },
    );
  });
}

export async function deleteDiscount(order_id: string, item_id: string) {
  db1.transaction(tx => {
    tx.executeSql(
      'DELETE FROM TABLE_DISCOUNT where OrderedItemID = "' +
        item_id +
        '" and OrderID="' +
        order_id +
        '" ',
      [],
      (tx, results) => {
        console.log('delete discount -->', results.rowsAffected);
      },
    );
  });
}

export async function getPendingOrders(uid: string) {
  let query =
    'select distinct Party,id,POM_DOC_NO,POM_DOC_AMOUNT,POM_DOC_DATE from VW_PendingOrders where userid= "' +
    uid +
    '" ';
  // console.log('pend q--->', query);
  return new Promise<pendingOrders[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let checkorder = [];
        for (let i = 0; i < results.rows.length; i++) {
          checkorder.push(results.rows.item(i));
        }
        resolve(checkorder);
      });
    });
  });
}
export async function getPendingOrdersdetails(uid: string) {
  let query =
    'select distinct id,POD_ITEM_NAME,POD_SQTY,POD_FQTY from VW_PendingOrders where userid="' +
    uid +
    '"';

  return new Promise<pendingOrderDetail[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let checkorder = [];
        for (let i = 0; i < results.rows.length; i++) {
          checkorder.push(results.rows.item(i));
        }
        resolve(checkorder);
      });
    });
  });
}
export async function getPendingDiscount(uid: string) {
  let query =
    'select distinct id,POD_LEDGER_NAME,POD_RNP,POD_RATE,POD_QUANTITY,POD_TOTALDISCOUNT from VW_PendingOrders where userid="' +
    uid +
    '"';

  return new Promise<pendingDiscount[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let checkorder = [];
        for (let i = 0; i < results.rows.length; i++) {
          checkorder.push(results.rows.item(i));
        }
        resolve(checkorder);
      });
    });
  });
}

export async function checkorderbookeddetails(entity_id: any, uid: any) {
  const products = [];

  let query =
    `SELECT distinct Current_date_time,OrderMaster.from_date, ActivityStart, ActivityEnd , collection_type, OrderMaster.id, OrderDetails.item_id, OrderDetails.quantity_one, OrderDetails.quantity_two,OrderDetails.small_Unit,OrderDetails.large_Unit, OrderDetails.Amount, PItem.Item FROM OrderMaster
            LEFT JOIN OrderDetails
            ON  OrderMaster.id = OrderDetails.order_id
            LEFT JOIN PItem
            ON OrderDetails.item_id = PItem.ItemId
            WHERE OrderMaster.entity_id = "` +
    entity_id +
    '" and OrderMaster.userid = "' +
    uid +
    '"';

  // "`GROUP BY OrderMaster.from_date";
  // console.log('activity quuu--->', query);

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let len = results.rows.length;

        let checkorder = [];

        for (let i = 0; i < results.rows.length; i++) {
          checkorder.push(results.rows.item(i));
        }

        // checkorder=results.rows.length

        //console.log("qcheckorder=", checkorder)

        resolve(checkorder);

        // console.log('checkorder detail in db-->', checkorder);
      });
    });
  });
}

export async function checkallordersinordermaster(
  entity_id: any,
  currentDate: any,
  yesterdaydate: any,
  dayafteryesterdays: any,
  date: any,
  uid: any,
) {
  // console.log("I am your entity", entity_id);
  //console.log("i am you props.......................", date);

  const products = [];

  let query =
    `SELECT Current_date_time,OrderMaster.from_date, ActivityStart, ActivityEnd , collection_type, OrderMaster.id, OrderDetails.item_id, OrderDetails.quantity_one, OrderDetails.quantity_two, OrderDetails.Amount, PItem.Item FROM OrderMaster

            LEFT JOIN OrderDetails

            ON  OrderMaster.id = OrderDetails.order_id

            LEFT JOIN PItem

            ON OrderDetails.item_id = PItem.ItemId

            WHERE OrderMaster.entity_id = "` +
    entity_id +
    '" and OrderMaster.from_date = "' +
    date +
    '" and OrderMaster.userid = "' +
    uid +
    '" ';

  // "`GROUP BY OrderMaster.from_date";

  //  console.log("i am executing ", query);

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let len = results.rows.length;

        let checkorder = [];

        for (let i = 0; i < results.rows.length; i++) {
          checkorder.push(results.rows.item(i));
        }

        // checkorder=results.rows.length

        //console.log("qcheckorder=", checkorder)

        resolve(checkorder);

        // console.log('checkorder detail in db-->', checkorder);
      });
    });
  });
}

export async function getitemfilterList() {
  let query = "select Value from Settings where Key='ITEMFILTER'";
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempSearchProdect = '';
        for (let i = 0; i < results.rows.length; i++) {
          tempSearchProdect = results.rows.item(i);
        }

        resolve(tempSearchProdect);
      });
    });
  });
}

export async function GetfirstClassification(ITEMFILTerdata1: string) {
  console.log('Shankar Gade', ITEMFILTerdata1);

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        'select distinct ' + ITEMFILTerdata1 + ' from PItem order by Item ASC',
        [],
        (tx, results) => {
          let temp = [];
          for (let i = 0; i < results.rows.length; i++) {
            temp.push(results.rows.item(i));
          }
          resolve(temp);
        },
      );
    });
  });
}

export async function updatesecondfilterwhileselectionone(
  skulabel1: string,
  selectedvalue: string,
  skulabel2: string,
) {
  // console.log("I am you selectedvalue ", selectedvalue);
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        'SELECT DISTINCT ' +
          skulabel2 +
          ' from PItem where ' +
          skulabel1 +
          ' = "' +
          selectedvalue +
          '"',
        [],
        (tx, results) => {
          let temp = [];
          for (let i = 0; i < results.rows.length; i++) {
            temp.push(results.rows.item(i));
          }
          resolve(temp);
        },
      );
    });
  });
}

export async function updatefirstfilterwhileselectionsecond(
  skulabel1: string,
  selectedvalue: string,
  skulabel2: string,
) {
  console.log(
    'I am you selectedvalue -->',
    'SELECT DISTINCT ' +
      skulabel1 +
      ' from PItem where ' +
      skulabel2 +
      ' = "' +
      selectedvalue +
      '"',
  );
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        'SELECT DISTINCT ' +
          skulabel1 +
          ' from PItem where ' +
          skulabel2 +
          ' = "' +
          selectedvalue +
          '"',
        [],
        (tx, results) => {
          let temp = [];
          for (let i = 0; i < results.rows.length; i++) {
            temp.push(results.rows.item(i));
          }
          resolve(temp);
        },
      );
    });
  });
}

export async function GetSecondClassification(
  skudata1: string,
  skudata2: string,
  selectedvalue: string,
) {
  console.log(
    'sec class query -->',
    'select DISTINCT ' + skudata2 + ' from PItem',
  );

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        'select DISTINCT ' + skudata2 + ' from PItem',
        [],
        (tx, results) => {
          let temp = [];
          for (let i = 0; i < results.rows.length; i++) {
            temp.push(results.rows.item(i));
          }
          resolve(temp);
        },
      );
    });
  });
}

export async function getBrandSearchDataforskuforboth(
  skulabel1: string,
  skulabel2: string,
  skusearch1: string,
  skusearch2: string,
  searchkey: string,
  list1: string,
  joinString: string,
  entityId: string,
  collectionType: string,
) {
  //// SELECT distinct BRAND , BRANDID FROM PItem where (%@ LIKE '%%%@%%') order by %@,BRAND",joinedString,search_text,search_product
  let query =
    ' select distinct PItem.BRANDID,BRAND,CASE WHEN PItem.bottleQut IS NOT NULL THEN "false" ELSE "false" END bottleQty from PItem left join TABLE_TEMP_ORDER_DETAILS on TABLE_TEMP_ORDER_DETAILS.BrandId = PItem.BRANDID  where ' +
    skulabel1 +
    ' = "' +
    skusearch1 +
    '"  and ' +
    skulabel2 +
    ' = "' +
    skusearch2 +
    '" and BRAND  like "%' +
    searchkey +
    '%" and PItem.BRANDID not in (select distinct PItem.BRANDID from PItem INNER join TABLE_TEMP_ORDER_DETAILS on TABLE_TEMP_ORDER_DETAILS.BrandId = PItem.BRANDID where BRAND  like "%' +
    searchkey +
    '%" and TABLE_TEMP_ORDER_DETAILS.entityId="' +
    entityId +
    '" and TABLE_TEMP_ORDER_DETAILS.CollectionType="' +
    collectionType +
    '"  order by "' +
    searchkey +
    '","' +
    list1 +
    '",' +
    joinString +
    ' ) order by "' +
    searchkey +
    '","' +
    list1 +
    '",' +
    joinString;

  // console.log('brand query for both : ' + query);
  return new Promise<BrandSearch[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempfilter = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempfilter.push(results.rows.item(i));
        }
        resolve(tempfilter);
      });
    });
  });
}

export async function getBrandSearchDataforskuforfirst(
  skulabel1: string,
  skusearch1: string,
  skusearch2: string,
  searchkey: string,
  list1: string,
  joinString: string,
  entityId: string,
  collectionType: string,
) {
  //// SELECT distinct BRAND , BRANDID FROM PItem where (%@ LIKE '%%%@%%') order by %@,BRAND",joinedString,search_text,search_product
  let query =
    ' select distinct PItem.BRANDID,BRAND,CASE WHEN PItem.bottleQut IS NOT NULL THEN "false" ELSE "false" END bottleQty from PItem left join TABLE_TEMP_ORDER_DETAILS on TABLE_TEMP_ORDER_DETAILS.BrandId = PItem.BRANDID  where ' +
    skulabel1 +
    ' = "' +
    skusearch1 +
    '"  and  BRAND  like "%' +
    searchkey +
    '%" and PItem.BRANDID not in (select distinct PItem.BRANDID from PItem INNER join TABLE_TEMP_ORDER_DETAILS on TABLE_TEMP_ORDER_DETAILS.BrandId = PItem.BRANDID where BRAND  like "%' +
    searchkey +
    '%" and TABLE_TEMP_ORDER_DETAILS.entityId="' +
    entityId +
    '" and TABLE_TEMP_ORDER_DETAILS.CollectionType="' +
    collectionType +
    '"  order by "' +
    searchkey +
    '","' +
    list1 +
    '",' +
    joinString +
    ' ) order by "' +
    searchkey +
    '","' +
    list1 +
    '",' +
    joinString;

  // console.log('brand query for single: ' + query);
  return new Promise<BrandSearch[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempfilter = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempfilter.push(results.rows.item(i));
        }
        resolve(tempfilter);
      });
    });
  });
}

export async function discardOrders(order_id: string) {
  return new Promise(resolve => {
    let query =
      'DELETE FROM TABLE_TEMP_ORDER_DETAILS WHERE TABLE_TEMP_ORDER_DETAILS.order_id ="' +
      order_id +
      '" ';
    //console.log("query==",query)
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        resolve(results);
      });
    });
  });
}

export async function discardOrdersMaster(order_id: string) {
  return new Promise(resolve => {
    let query =
      'DELETE FROM TABLE_TEMP_OrderMaster WHERE TABLE_TEMP_OrderMaster.id ="' +
      order_id +
      '" ';
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        resolve(results);
      });
    });
  });
}

//change by vibha
export async function discardDiscount(order_id: string) {
  return new Promise(resolve => {
    let query = 'DELETE FROM TABLE_DISCOUNT WHERE OrderID ="' + order_id + '" ';
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        resolve(results);
      });
    });
  });
}

export async function getOrderDataFromTempOrderDetailsByvibha(
  order_id: string,
) {
  return new Promise(resolve => {
    const products = [];
    let query =
      'SELECT id,order_id,item_id,item_Name,quantity_one,quantity_two,small_Unit,large_Unit,from_date,to_date,rate,Amount FROM TABLE_TEMP_ORDER_DETAILS WHERE order_id ="' +
      order_id +
      '" ';

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let orderDatatemp = [];
        for (let i = 0; i < results.rows.length; i++) {
          orderDatatemp.push(results.rows.item(i));
        }

        let query1 =
          'SELECT id,order_id,item_id,item_Name,quantity_one,quantity_two,small_Unit,large_Unit,rate,Amount FROM OrderDetails WHERE  order_id ="' +
          order_id +
          '" ';

        db1.transaction(tx => {
          tx.executeSql(query1, [], (tx, results1) => {
            let orderDataDetail = [];
            for (let k = 0; k < results1.rows.length; k++) {
              orderDataDetail.push(results1.rows.item(k));
            }

            for (let i = 0; i < orderDatatemp.length; i++) {
              for (let j = 0; j < orderDataDetail.length; j++) {
                // console.log('in for ');
                if (
                  orderDatatemp[i].item_id == orderDataDetail[j].item_id &&
                  orderDatatemp[i].order_id == orderDataDetail[j].order_id
                ) {
                } else {
                  // console.log('in for loop else');
                  orderDatatemp.push(orderDataDetail[j]);
                }
              }
            }
            resolve(orderDatatemp);
          });
        });
      });
    });
  });
}

export async function getOrderDataFromTempOrderDetails(order_id: string) {
  return new Promise<getOrderDataFromTempOrderDetailsType[]>(resolve => {
    let query =
      'SELECT id,order_id,item_id,item_Name,quantity_one,quantity_two,small_Unit,large_Unit,from_date,to_date,rate,Amount,bottleQty,BrandId,entityId,CollectionType,TEMP_BRAND,TEMP_DIVISION,TEMP_FLAVOUR ,TABLE_TEMP_ORDER_DETAILS.GSTRate , TABLE_TEMP_ORDER_DETAILS.GSTTotal,TABLE_TEMP_ORDER_DETAILS.GrossAmount FROM TABLE_TEMP_ORDER_DETAILS WHERE order_id ="' +
      order_id +
      '" ';

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let orderData = [];
        for (let i = 0; i < results.rows.length; i++) {
          orderData.push(results.rows.item(i));
        }
        resolve(orderData);
      });
    });
  });
}

export async function checkOrderInOrderDetailsMain1(
  item_id: string,
  order_id: string,
) {
  return new Promise(resolve => {
    const products = [];
    let query =
      'SELECT * FROM OrderDetails WHERE item_id = "' +
      item_id +
      '" and order_id ="' +
      order_id +
      '" ';
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let orderData = [];
        for (let i = 0; i < results.rows.length; i++) {
          orderData.push(results.rows.item(i));
        }
        resolve(orderData);
      });
    });
  });
}

// SELECT id,Current_date_time,entity_type,entity_id,latitude,longitude,total_amount,from_date,to_date,collection_type,user_id FROM OrderMaster WHERE id = '%@' and collection_type ='%@'",item_id,collection_type

export async function getOrderDataFromTempOrderMaster(
  order_id: string,
  CollectionType: string,
) {
  return new Promise(resolve => {
    // SELECT id,Current_date_time,entity_type,entity_id,latitude,longitude,total_amount,from_date,to_date,collection_type,user_id FROM OrderMaster WHERE id = '%@' and collection_type ='%@'",item_id,collection_type
    //alert("temp master")
    let query =
      'SELECT id,Current_date_time,entity_type,entity_id,latitude,longitude,total_amount,collection_type,user_id FROM TABLE_TEMP_OrderMaster where id="' +
      order_id +
      '" and collection_type="' +
      CollectionType +
      '" ';

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let orderData = [];
        for (let i = 0; i < results.rows.length; i++) {
          orderData.push(results.rows.item(i));
        }
        resolve(orderData);
      });
    });
  });
}

export async function checkOrderInTempOrderMasterMain(
  id: string,
  CollectionType: string,
) {
  return new Promise(resolve => {
    //SELECT id,Current_date_time,entity_type,entity_id,latitude,longitude,total_amount,from_date,to_date,collection_type,user_id FROM OrderMaster WHERE id = '%@' and collection_type ='%@'",item_id,collection_type

    let query =
      'SELECT id,Current_date_time,entity_type,entity_id,latitude,longitude,total_amount,from_date,to_date,collection_type,user_id FROM OrderMaster WHERE id = "' +
      id +
      '" and collection_type ="' +
      CollectionType +
      '" ';

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let orderData = [];
        for (let i = 0; i < results.rows.length; i++) {
          orderData.push(results.rows.item(i));
        }
        resolve(orderData);
      });
    });
  });
}

export async function selectOrdersDetail(order_id: string) {
  return new Promise(resolve => {
    let query =
      'SELECT id,order_id,item_id,item_Name,quantity_one,quantity_two,small_Unit,large_Unit,from_date,to_date,rate,Amount FROM TABLE_TEMP_ORDER_DETAILS WHERE order_id ="' +
      order_id +
      '" ';

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let orderData = [];
        for (let i = 0; i < results.rows.length; i++) {
          orderData.push(results.rows.item(i));
        }
        resolve(orderData);
      });
    });
  });
}
export async function checkOrderIdInDb(
  outlet_id: string,
  collection_type: string,
) {
  return new Promise(resolve => {
    //SELECT * FROM TABLE_TEMP_ORDER_DETAILS ,TABLE_TEMP_OrderMaster where TABLE_TEMP_ORDER_DETAILS.order_id = TABLE_TEMP_OrderMaster.id and TABLE_TEMP_OrderMaster.entity_id="'+outlet_id+'" and TABLE_TEMP_OrderMaster.collection_type="'+collection_type+'"'
    let query =
      'SELECT * FROM TABLE_TEMP_ORDER_DETAILS ,TABLE_TEMP_OrderMaster where TABLE_TEMP_ORDER_DETAILS.order_id = TABLE_TEMP_OrderMaster.id and TABLE_TEMP_OrderMaster.entity_id="' +
      outlet_id +
      '" and TABLE_TEMP_OrderMaster.collection_type="' +
      collection_type +
      '"';

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        resolve(results.rows.length);
      });
    });
  });
}

export async function checkedOrderIdInDb(
  outlet_id: string,
  collection_type: string,
) {
  return new Promise(resolve => {
    let query =
      'SELECT TABLE_TEMP_OrderMaster.id FROM TABLE_TEMP_ORDER_DETAILS ,TABLE_TEMP_OrderMaster where TABLE_TEMP_ORDER_DETAILS.order_id = TABLE_TEMP_OrderMaster.id and TABLE_TEMP_OrderMaster.entity_id="' +
      outlet_id +
      '" and TABLE_TEMP_OrderMaster.collection_type="' +
      collection_type +
      '"';

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        resolve(results.rows.length);
      });
    });
  });
}

//change by vibha
export async function checkOrderIdInDbeditNext(
  collection_type: string,
  order_Id: string,
) {
  return new Promise(resolve => {
    //SELECT * FROM TABLE_TEMP_ORDER_DETAILS ,TABLE_TEMP_OrderMaster where TABLE_TEMP_ORDER_DETAILS.order_id = TABLE_TEMP_OrderMaster.id and TABLE_TEMP_OrderMaster.entity_id="'+outlet_id+'" and TABLE_TEMP_OrderMaster.collection_type="'+collection_type+'"'

    let query =
      'SELECT * FROM TABLE_TEMP_ORDER_DETAILS  where TABLE_TEMP_ORDER_DETAILS.order_id="' +
      order_Id +
      '"';

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        resolve(results.rows.length);
      });
    });
  });
}

export async function insertOrderMastersss(
  id: string,
  Current_date_time: string,
  entity_type: string,
  entity_id: string,
  latitude: string | number,
  longitude: string | number,
  total_amount: string,
  from_date: string,
  to_date: string,
  collection_type: string,
  user_id: string | number,
  remark: string,
  selected_flag: string,
  sync_flag: string,
  check_date: string,
  DefaultDistributorId: string | number,
  ExpectedDeliveryDate: string,
  ActivityStatus: string,
  ActivityStart: string,
  ActivityEnd: string,
  uid: string | number,
  OrderPriority: string,
) {
  // console.log('ord_Mast app_o_id --->', id, 'uuuidd--->', uid);
  db1.transaction(tx => {
    tx.executeSql(
      `insert into OrderMaster(id,Current_date_time ,entity_type,entity_id ,latitude ,longitude ,total_amount ,from_date ,to_date ,collection_type ,user_id ,remark,selected_flag ,sync_flag ,check_date,DefaultDistributorId,ExpectedDeliveryDate,ActivityStatus,ActivityStart,ActivityEnd,userid,OrderPriority )
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
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
        String(remark),
        String(selected_flag),
        String(sync_flag),
        String(check_date),
        String(DefaultDistributorId),
        String(ExpectedDeliveryDate),
        String(ActivityStatus),
        String(ActivityStart),
        String(ActivityEnd),
        String(uid),
        String(OrderPriority),
      ],
      (tx, results) => {},
      err => {
        console.error('error=', err);
      },
    );
  });
}
//change by vibha
export async function deleteTempOrderDetailsvibha(
  itemid: string | number,
  collection_type: string,
  orderid: string | number,
) {
  return new Promise(resolve => {
    let query =
      'delete from TABLE_TEMP_ORDER_DETAILS WHERE item_id = "' +
      itemid +
      '" and order_id ="' +
      orderid +
      '" ';

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        resolve(results);
      });
    });
  });
}

export async function deleteTempOrderDetails(
  entity_id: string,
  collection_type: string,
) {
  return new Promise(resolve => {
    let query =
      'delete from TABLE_TEMP_ORDER_DETAILS where order_id IN (select id from TABLE_TEMP_OrderMaster where entity_id = "' +
      entity_id +
      '" and collection_type ="' +
      collection_type +
      '")';

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        resolve(results);
      });
    });
  });
}
export async function deleteTempOrderMater(
  entity_id: string,
  collection_type: string,
) {
  return new Promise(resolve => {
    let query =
      'DELETE FROM TABLE_TEMP_OrderMaster where entity_id="' +
      entity_id +
      '" and collection_type="' +
      collection_type +
      '" ';
    db1.transaction(tx => {
      //'UPDATE TABLE_TEMP_OrderMaster  SET total_amount = ? WHERE id = ? ', [Total_amount,order_id]).then(([tx, results]) => {
      tx.executeSql(query, [], (tx, results) => {
        resolve(results);
      });
    });
  });
}

export async function insertAssetData1(uommasterData: any) {
  if (uommasterData.length) {
    db1.transaction(tx => {
      tx.executeSql(
        'DELETE FROM AssetPlacementVerification',
        [],
        (tx, results) => {
          let len = uommasterData.length;
          let count = 0;

          for (let item of uommasterData) {
            tx.executeSql(
              `insert into AssetPlacementVerification(OrderID,AssetID,QRCode,ScanStatus,AssetInformation,Remark,Condition,AuditDate) VALUES (?,?,?,?,?,?,?,?)`,
              [
                String(item.OrderID),
                String(item.AssetID),
                String(item.QRCode),
                String(item.ScanStatus),
                String(item.AssetInformation),
                String(item.Remark),
                String(item.Condition),
                String(item.AuditDate),
              ],
              (tx, results) => {},
              err => {
                console.error('error=', err);
              },
            );
          }
        },
      );
    });
  }
}

///////////////////////////////////////////////////////shop Module  starts from  heree/////////////////////
export async function getRouteData(id: string | number) {
  return new Promise<RouteData[]>(resolve => {
    let query =
      // 'Select distinct RouteID,RouteName from Pcustomer order by RouteName asc';
      'SELECT RouteID ,RouteName FROM PJPMaster where userid = "' + id + '"';

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempBeat = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempBeat.push(results.rows.item(i));
        }
        resolve(tempBeat);
      });
    });
  });
}

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
) {
  console.log(
    'check in OMast colll type --->',
    collection_type,
    'app_o_id--->',
    id,
    uid,
    user_id,
    entity_id,
  );
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        `insert into OrderMaster(id,Current_date_time,entity_type,entity_id,latitude,
          longitude ,total_amount ,from_date,to_date,collection_type ,user_id,selected_flag,sync_flag,remark,check_date,DefaultDistributorId,ExpectedDeliveryDate,ActivityStatus,ActivityStart,ActivityEnd,userid )
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
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
        ],
        (tx, results) => {
          resolve(results);
        },
        err => {
          console.error('error=', err);
        },
      );
    });
  });
}

////Attendanceincheck
export async function getAttendance(date: string) {
  let query =
    'select id from OrderMaster where collection_type = 8 and from_date = "' +
    date +
    '" ';

  return new Promise<IdFromOMaster[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let len = results.rows.length;
        let checkorder = [];
        for (let i = 0; i < results.rows.length; i++) {
          checkorder.push(results.rows.item(i));
        }
        resolve(checkorder);
      });
    });
  });
}

//Attendace End Day

export async function getAttendanceEndDay(date: string) {
  let query =
    'select id from OrderMaster where collection_type = 9 and from_date = "' +
    date +
    '" ';

  return new Promise<IdFromOMaster[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let len = results.rows.length;
        let checkorder = [];
        for (let i = 0; i < results.rows.length; i++) {
          checkorder.push(results.rows.item(i));
        }
        resolve(checkorder);
      });
    });
  });
}
//////////
export async function getAttendance2(date: string) {
  let query =
    'select id from OrderMaster where collection_type = 9 and from_date = "' +
    date +
    '" ';
  return new Promise<IdFromOMaster[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let len = results.rows.length;
        let checkorder = [];
        for (let i = 0; i < results.rows.length; i++) {
          checkorder.push(results.rows.item(i));
        }
        resolve(checkorder);
      });
    });
  });
}
///////////////////////////
export async function getAutologout(date: string) {
  let query =
    'select  count(*) from OrderMaster where from_date = "' + date + '" ';
  return new Promise(resolve => {
    db1
      .transaction(tx => {
        tx.executeSql(query, [], (tx, results) => {
          let len = results.rows.length;
          let checkorder = [];
          for (let i = 0; i < results.rows.length; i++) {
            checkorder.push(results.rows.item(i));
          }
          resolve(checkorder);
        });
      })
      .then(result => {
        null;
      })
      .catch(err => {
        null;
      });
  });
}
////////////////////
export async function getLastSync() {
  let query = "select Value from Settings where Key='SYNCDATETIME'";
  return new Promise<SettingTable>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempSearchProdect = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempSearchProdect = results.rows.item(i);
        }
        resolve(tempSearchProdect);
      });
    });
  });
}
/////////////////////////

export async function getOrderIdForShop(entity_id: string, check_date: string) {
  let query =
    'SELECT id FROM OrderMaster WHERE entity_id = "' +
    entity_id +
    '" and check_date = "' +
    check_date +
    '" ' +
    'ORDER BY id DESC LIMIT 1';
  return new Promise<IdFromOMaster[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempSearchProdect = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempSearchProdect.push(results.rows.item(i));
        }
        resolve(tempSearchProdect);
      });
    });
  });
}

export async function updateCheckoutOrderMasterWOStart(
  orderId: string | number,
  collectiontype: string | number,
  shopId: string,
  checkDate: string,
  checkoutDatetime: string,
  latitude: string | number,
  longitude: string | number,
  remark: string,
) {
  console.log('checkoutDatetime-->', checkoutDatetime, orderId, remark);
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        'UPDATE OrderMaster SET ActivityEnd=?,latitude=?,longitude=?,remark=? where entity_id = "' +
          String(shopId) +
          '" and collection_type  = "' +
          String(collectiontype) +
          '" and check_date = "' +
          String(checkDate) +
          '" and id = "' +
          String(orderId) +
          '"',
        [
          String(checkoutDatetime),
          String(latitude),
          String(longitude),
          String(remark),
        ],
        (tx, results) => {
          resolve(results);
        },
      );
    });
  });
}

export async function getTotalOrderFromDB(
  collection_type: string,
  entity_id: string,
  uid: string,
) {
  let query =
    'SELECT * FROM OrderMaster where collection_type  = "' +
    collection_type +
    '" and entity_id = "' +
    entity_id +
    '" and userid = "' +
    uid +
    '" order by check_date asc';
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getTotalOrderFromDB = [];
        for (let i = 0; i < results.rows.length; i++) {
          getTotalOrderFromDB.push(results.rows.item(i));
        }
        resolve(getTotalOrderFromDB);
      });
    });
  });
}

export async function getInProcessOrderFromDB(
  collection_type: string,
  sync_flag: string,
  entity_id: string,
  uid: string,
) {
  // Changed SELECT * TO SELECT entity_id
  let query =
    'SELECT entity_id FROM OrderMaster where collection_type  = "' +
    collection_type +
    '" and sync_flag = "' +
    sync_flag +
    '" and entity_id = "' +
    entity_id +
    '" and userid = "' +
    uid +
    '" order by check_date asc';
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let len = results.rows.length;
        let checkorder = [];
        for (let i = 0; i < results.rows.length; i++) {
          checkorder.push(results.rows.item(i));
        }

        resolve(checkorder);
      });
    });
  });
}
export async function getDeleveredOrderFromDB(
  collection_type: string,
  sync_flag: string,
  entity_id: string,
  uid: string,
) {
  // Changed SELECT * TO SELECT entity_id
  let query =
    'SELECT entity_id FROM OrderMaster where collection_type  = "' +
    collection_type +
    '" and sync_flag = "' +
    sync_flag +
    '" and entity_id = "' +
    entity_id +
    '" and userid = "' +
    uid +
    '" order by check_date asc';
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let len = results.rows.length;
        let checkorder = [];
        for (let i = 0; i < results.rows.length; i++) {
          checkorder.push(results.rows.item(i));
        }

        resolve(checkorder);
      });
    });
  });
}

//change by vibha
//sideorderfunction
export async function getAllOrders1(uid: string) {
  //  let query = 'SELECT * FROM OrderMaster where collection_type =0';
  // let query =
  //   'select OrderMaster.*,Pcustomer.AREA,Pcustomer.Party from OrderMaster INNER JOIN Pcustomer on OrderMaster.entity_id = Pcustomer.CustomerId where OrderMaster.entity_type =1';
  // //console.log("checkIsOrderIdInDb=", query)
  // let query =
  //     'select OrderMaster.*,Pcustomer.AREA,Pcustomer.Party from OrderMaster INNER JOIN Pcustomer on OrderMaster.entity_id = Pcustomer.CustomerId where collection_type = 0 and sync_flag="' +
  //     SyncFlag +
  //     '" order by 2 DESC';
  let query =
    'select distinct OrderMaster.Current_date_time,OrderMaster.id,OrderMaster.total_amount,OrderMaster.from_date, OrderMaster.ExpectedDeliveryDate,OrderMaster.OrderPriority,OrderMaster.entity_id,Pcustomer.AREA,Pcustomer.Party,PDistributor.Distributor from OrderMaster,PDistributor INNER JOIN Pcustomer on OrderMaster.entity_id = Pcustomer.CustomerId where OrderMaster.DefaultDistributorId=PDistributor.DistributorID and collection_type = 0 and sync_flag="Y" and from_date in(  select  from_date  from OrderMaster where collection_type = 0 and sync_flag="Y" ' +
    ' and OrderMaster.userid= "' +
    uid +
    '" group by from_date order by Current_date_time desc limit 2) order by 2 desc';
  console.log('pre order q--->', query);
  return new Promise<getAllOrdersType[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let len = results.rows.length;
        let checkorder = [];
        for (let i = 0; i < results.rows.length; i++) {
          checkorder.push(results.rows.item(i));
        }
        resolve(checkorder);
      });
    });
  });
}

export async function getAllOrders(SyncFlag: string, uid: string) {
  //  let query = 'SELECT * FROM OrderMaster where collection_type =0';
  // let query =
  //   'select OrderMaster.*,Pcustomer.AREA,Pcustomer.Party from OrderMaster INNER JOIN Pcustomer on OrderMaster.entity_id = Pcustomer.CustomerId where OrderMaster.entity_type =1';
  // //console.log("checkIsOrderIdInDb=", query)
  let query =
    'select distinct OrderMaster.Current_date_time,PDistributor.Distributor,OrderMaster.id,OrderMaster.total_amount,OrderMaster.from_date, OrderMaster.ExpectedDeliveryDate,OrderMaster.entity_id,OrderMaster.OrderPriority, Pcustomer.AREA,Pcustomer.Party, 0 as isNewParty from OrderMaster,PDistributor INNER JOIN Pcustomer on OrderMaster.entity_id = Pcustomer.CustomerId where collection_type = 0 and sync_flag="' +
    SyncFlag +
    '" and OrderMaster.userid= "' +
    uid +
    '"and OrderMaster.DefaultDistributorId=PDistributor.DistributorID order by 2 DESC';
  console.log('sideeee q--->', query);
  return new Promise<getAllOrdersType[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let len = results.rows.length;
        let checkorder = [];
        for (let i = 0; i < results.rows.length; i++) {
          checkorder.push(results.rows.item(i));
        }
        resolve(checkorder);
      });
    });
  });
}

export async function getAllOrdersforNewParty(SyncFlag: string, uid: string) {
  let query =
    'select OrderMaster.Current_date_time,OrderMaster.DefaultDistributorId as Distributor, OrderMaster.id,OrderMaster.total_amount,OrderMaster.from_date, OrderMaster.ExpectedDeliveryDate,OrderMaster.OrderPriority, OrderMaster.entity_id, newpartyoutlet.ShopArea as AREA, newpartyoutlet.OutletName as Party, 1 as isNewParty from OrderMaster INNER JOIN newpartyoutlet on OrderMaster.entity_id = newpartyoutlet.OrderId where collection_type = 0 and sync_flag="' +
    SyncFlag +
    '" and OrderMaster.userid= "' +
    uid +
    '" order by 1 DESC';
  console.log('sideeee getAllOrdersforNewParty q--->', query);
  return new Promise<getAllOrdersType[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let len = results.rows.length;
        let checkorder = [];
        for (let i = 0; i < results.rows.length; i++) {
          checkorder.push(results.rows.item(i));
        }
        resolve(checkorder);
      });
    });
  });
}

//change by vibha
export async function getCustomerShopName(entity_id: string, orderid: string) {
  let query: string;
  if (orderid) {
    query =
      'select * from Pcustomer,OrderMaster where CustomerId = "' +
      entity_id +
      '" and entity_id = "' +
      entity_id +
      '" and collection_type = 0 and OrderMaster.id = "' +
      orderid +
      '"';
  } else {
    query =
      'select * from Pcustomer,OrderMaster where CustomerId = "' +
      entity_id +
      '" and entity_id = "' +
      entity_id +
      '" and collection_type = 0 ';
  }
  // console.log('checkIsOrderIdInDb=', query);
  return new Promise<JoinPcustOMaster[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let len = results.rows.length;
        let checkorder = [];
        for (let i = 0; i < results.rows.length; i++) {
          checkorder.push(results.rows.item(i));
        }
        resolve(checkorder);
      });
    });
  });
}

export async function getCustomerShopNameforNewParty(
  entity_id: string,
  orderid: string,
) {
  let query =
    'select BitID as RouteID, OutletName as Party, ShopArea as AREA, RegistrationNo as LicenceNo, OrderMaster.id, OrderMaster.entity_type, OrderMaster.Current_date_time, OrderMaster.ExpectedDeliveryDate, OrderMaster.remark, OrderMaster.entity_id, PJPMaster.RouteName from newpartyoutlet, OrderMaster, PJPMaster where OrderId = "' +
    entity_id +
    '" and entity_id = "' +
    entity_id +
    '" and collection_type = 0 and OrderMaster.id = "' +
    orderid +
    '" and BitID = PJPMaster.RouteID';

  // console.log('getCustomerShopNameforNewParty q=', query);
  return new Promise<JoinPcustOMaster[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let len = results.rows.length;
        let checkorder = [];
        for (let i = 0; i < results.rows.length; i++) {
          checkorder.push(results.rows.item(i));
        }
        resolve(checkorder);
      });
    });
  });
}

export async function getDistributorNameSideOrder(id: string) {
  let query =
    'SELECT Distributor, DistributorID FROM PDistributor INNER JOIN OrderMaster ON OrderMaster.userid = PDistributor.UserId WHERE OrderMaster.id="' +
    id +
    '" ';
  // console.log("checkIsOrderIdInDb=", query)
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let len = results.rows.length;
        let checkorder = [];
        for (let i = 0; i < results.rows.length; i++) {
          checkorder.push(results.rows.item(i));
        }
        resolve(checkorder);
      });
    });
  });
}

export async function getSelectedDistributorNameSideOrder(id: string) {
  let query =
    'SELECT DISTINCT Distributor, DistributorID FROM PDistributor INNER JOIN OrderMaster on OrderMaster.DefaultDistributorId = PDistributor.DistributorId WHERE OrderMaster.id="' +
    id +
    '" ';
  // console.log('getSelectedDistributorNameSideOrder=', query);
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let len = results.rows.length;
        let checkorder = [];
        for (let i = 0; i < results.rows.length; i++) {
          checkorder.push(results.rows.item(i));
        }
        resolve(checkorder);
      });
    });
  });
}

export async function getDetailsItem(id: string) {
  // console.log('id in details ' + id);
  //  let query = 'select * from OrderDetails where order_id="' + id + '" ';
  let query =
    'select OrderDetails.order_id,OrderDetails.item_id,OrderDetails.quantity_one,OrderDetails.quantity_two,OrderDetails.small_Unit,OrderDetails.large_Unit,OrderDetails.rate,OrderDetails.Amount,OrderDetails.selected_flag,OrderDetails.sync_flag,OrderDetails.bottleQty,OrderDetails.GSTRate,OrderDetails.GSTTotal, PItem.ITEMSEQUENCE as item_Name, PItem.BPC, PItem.PTR from OrderDetails INNER JOIN PItem on OrderDetails.item_id = PItem.ItemId  where order_id="' +
    id +
    '" ';
  // console.log("checkIsOrderIdInDb=", query)
  return new Promise<getDetailsItemOMaster[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let len = results.rows.length;
        let checkorder = [];
        for (let i = 0; i < results.rows.length; i++) {
          checkorder.push(results.rows.item(i));
        }
        resolve(checkorder);
      });
    });
  });
}

export async function SyncOrderDetails() {
  let query =
    'select id as ID, order_id as OrderID,is_sync as sync_data  from ImagesDetails where is_sync= "N"';
  //console.log("q---", query)
  return new Promise(resolve => {
    db1
      .transaction(tx => {
        tx.executeSql(query, [], (tx, results) => {
          let SyncOrderDetails = [];
          for (let i = 0; i < results.rows.length; i++) {
            SyncOrderDetails.push(results.rows.item(i));
          }

          resolve(SyncOrderDetails);
        });
      })
      .then(result => {})
      .catch(err => {
        //console.log(err);
      });
  });
}

export async function AllOrderDetails() {
  let query = 'select item_id from OrderDetails';

  //console.log("q---", query)
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let SyncOrderDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          SyncOrderDetails.push(results.rows.item(i));
        }

        resolve(SyncOrderDetails);
      });
    });
  });
}

export async function InsertMeetShop(
  // ID,
  MJPMasterID: any,
  PlannedDate: any,
  EntityType: any,
  EntityTypeID: any,
  ActivityTitle: any,
  IsActivityDone: any,
  uid: any,
) {
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        `insert into  MJPMasterDetails( MJPMasterID, PlannedDate,EntityType,EntityTypeID,ActivityTitle,IsActivityDone,userid)
                                                                  VALUES (?,?,?,?,?,?,?)`,
        [
          String(MJPMasterID),
          String(PlannedDate),
          String(EntityType),
          String(EntityTypeID),
          String(ActivityTitle),
          String(IsActivityDone),
          String(uid),
        ],
        (tx, results) => {
          resolve(results);
        },
        err => {
          console.error('error=', err);
        },
      );
    });
  });
}

export async function InsertMeetothers(
  // ID,
  MJPMasterID: any,
  PlannedDate: any,
  EntityType: any,
  EntityTypeID: any,
  ActivityTitle: any,
  IsActivityDone: any,
  uid: any,
) {
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        `insert into  MJPMasterDetails( MJPMasterID, PlannedDate,EntityType,EntityTypeID,ActivityTitle,IsActivityDone,userid)
                                                                  VALUES (?,?,?,?,?,?,?)`,
        [
          String(MJPMasterID),
          String(PlannedDate),
          String(EntityType),
          String(EntityTypeID),
          String(ActivityTitle),
          String(IsActivityDone),
          String(uid),
        ],
        (tx, results) => {
          resolve(results);
        },
        err => {
          console.error('error=', err);
        },
      );
    });
  });
}
//change by Shankar
export async function insertNewShopnewpartyoutlet(
  app_order_id: string,
  BeatID: string,
  outletNAme: string,
  contact: string,
  OwnerName: string,
  address: string,
  remark: string,
  userLatitude: string,
  userLongitude: string,
  Is_Sync: string,
  curentDatetime: string,
  ShopType: string,
  RegistrationNo: string,
  ShopId: string,
  ContactPerson: string,
  ShopArea: string,
  UserId: string,
) {
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        // OrderID TEXT,BitID TEXT,OutletName TEXT,ContactNo TEXT,OwnersName TEXT,OutletAddress TEXT,Remark TEXT,Latitude TEXT ,
        // Longitude TEXT ,Is_Sync TEXT,AddedDate TEXT);');

        `insert into newpartyoutlet(OrderID,BitID,OutletName,ContactNo,OwnersName,OutletAddress,Remark,Latitude,
               Longitude,Is_Sync,AddedDate,ShopType,RegistrationNo,ShopId ,ContactPerson ,ShopArea, UserId) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          // app_order_id, BeatID, outletNAme, contact, OwnerName, address, remark, userLatitude, userLongitude, Is_Sync, curentDatetime, ShopType, RegistrationNo, ShopId, ContactPerson, ShopArea
          String(app_order_id),
          String(BeatID),
          String(outletNAme),
          String(contact),
          String(OwnerName),
          String(address),
          String(remark),
          String(userLatitude),
          String(userLongitude),
          String(Is_Sync),
          String(curentDatetime),
          String(ShopType),
          String(RegistrationNo),
          String(ShopId),
          String(ContactPerson),
          String(ShopArea),
          String(UserId),
        ],
        (tx, results) => {
          //  alert('shop added successfully!');
          resolve(results);
        },
        err => {
          console.error('error=', err);
        },
      );
    });
  });
}

export async function insertNewPartyImages(
  app_order_id: any,
  Is_Sync: any,
  imageName: any,
  ImagePath: any,
  shopId: string,
) {
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        `insert into newpartyImageoutlet(OrderID,Is_Sync,ImageName,ImagePath,ShopId) VALUES (?,?,?,?,?)`,
        [
          String(app_order_id),
          String(Is_Sync),
          String(imageName),
          String(ImagePath),
          String(shopId),
        ],
        (tx, results) => {
          resolve(results);
          //console.log("images inserted Successfully!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        },
        err => {
          console.error('error=', err);
        },
      );
    });
  });
}

export async function getTotalOrderDetails(id: string, uid: string) {
  let query =
    'select OrderDetails.order_id,OrderDetails.item_id,OrderDetails.quantity_one,OrderDetails.quantity_two,OrderDetails.small_Unit,OrderDetails.large_Unit,OrderDetails.rate,OrderDetails.Amount,OrderDetails.selected_flag,OrderDetails.sync_flag,OrderDetails.bottleQty, PItem.ITEMSEQUENCE as item_Name from OrderDetails INNER JOIN PItem on OrderDetails.item_id = PItem.ItemId where OrderDetails.order_id  = "' +
    id +
    '" and OrderDetails.userid = "' +
    uid +
    '"';
  // console.log('getTotalOrderFromDB=', query);
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getTotalOrderFromDB = [];
        for (let i = 0; i < results.rows.length; i++) {
          getTotalOrderFromDB.push(results.rows.item(i));
        }
        resolve(getTotalOrderFromDB);
      });
    });
  });
}

export async function getTotalOrderDetailsInfo(
  id: string,
  item_id: string,
  uid: string,
) {
  let query =
    'SELECT * FROM OrderDetails where order_id  = "' +
    id +
    '" and item_id = "' +
    item_id +
    '" and userid = "' +
    uid +
    '"';
  //console.log("getTotalOrderFromDB=", query)
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getTotalOrderFromDB = [];
        for (let i = 0; i < results.rows.length; i++) {
          getTotalOrderFromDB.push(results.rows.item(i));
        }
        resolve(getTotalOrderFromDB);
      });
    });
  });
}
//distinct need here
export async function getOrderIdForAssetList(
  collection_type: any,
  entityid: any,
) {
  //let query = 'select Pcustomer.customerid as id,Pcustomer.Party as party,OrderMaster.sync_flag,OrderMaster.id from Pcustomer,OrderMaster where  Pcustomer.customerid = OrderMaster.entity_id AND OrderMaster.collection_type = "' + collection_type + '" '

  let query =
    'select Pcustomer.customerid as id,Pcustomer.Party as party,OrderMaster.sync_flag,OrderMaster.id from Pcustomer,OrderMaster where  Pcustomer.customerid = OrderMaster.entity_id AND OrderMaster.collection_type = "' +
    collection_type +
    '" ';
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getOrderIdForAssetList = [];
        for (let i = 0; i < results.rows.length; i++) {
          getOrderIdForAssetList.push(results.rows.item(i));
        }
        resolve(getOrderIdForAssetList);
      });
    });
  });
}

export async function getAseetListInfo(order_id: any) {
  let query =
    'Select distinct tab1.AssetID, tab1.AssetQRcode, tab1.id, tab1.CustomerID, tab1.AssetInformation, tab1.ScanFlag, tab2.Remark ,tab2.Condition,tab2.AuditDate from OutletAssetInformation as tab1' +
    ' LEFT JOIN AssetPlacementVerification as tab2 ON tab1.AssetQRcode =tab2.QRCode ' +
    ' where tab2.OrderID="' +
    order_id +
    '"';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getOrderIdForAssetList = [];
        for (let i = 0; i < results.rows.length; i++) {
          getOrderIdForAssetList.push(results.rows.item(i));
        }
        resolve(getOrderIdForAssetList);
      });
    });
  });
}

/////////////////////////servey module/////////////////
export async function getAvailableServey() {
  let query = 'SELECT * FROM SurveyMaster WHERE SurveyDoneDate IS NULL ';
  return new Promise<SurveyMasterTable[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getAvailableServey = [];
        for (let i = 0; i < results.rows.length; i++) {
          getAvailableServey.push(results.rows.item(i));
        }
        resolve(getAvailableServey);
      });
    });
  });
}

export async function getDbURLSurvey() {
  var query = "select Value from Settings where Key='QDVP3URL'";
  return new Promise<SettingTable[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getAvailableServey = [];
        for (let i = 0; i < results.rows.length; i++) {
          getAvailableServey.push(results.rows.item(i));
        }
        resolve(getAvailableServey);
      });
    });
  });
}
export async function getAvailableServey1() {
  let query = 'SELECT * FROM SurveyMaster WHERE SurveyDoneDate NOT NULL ';
  return new Promise<SurveyMasterTable[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getAvailableServey = [];
        for (let i = 0; i < results.rows.length; i++) {
          getAvailableServey.push(results.rows.item(i));
        }
        resolve(getAvailableServey);
      });
    });
  });
}

export async function getAvailableResources() {
  let query = 'SELECT * FROM Resources';
  return new Promise<SurveyMasterTable[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getAvailableServey = [];
        for (let i = 0; i < results.rows.length; i++) {
          getAvailableServey.push(results.rows.item(i));
        }
        resolve(getAvailableServey);
      });
    });
  });
}

//////////////////////////////////////////////////////////AssetModule///////////////////////////////////////
//
export async function checkQrCodeDataInDb(qrcodeString: string) {
  let query =
    'Select * from OutletAssetInformation where AssetQRcode = "' +
    qrcodeString +
    '" ';
  // console.log(
  //     'checkQrCodeDataInDb=:::::::::::::::::::::::::',
  //     qrcodeString,
  // );
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let checkQrCodeDataInDb = [];
        for (let i = 0; i < results.rows.length; i++) {
          checkQrCodeDataInDb.push(results.rows.item(i));
        }
        //console.log("checkQrCodeDataInDb=", checkQrCodeDataInDb)
        resolve(checkQrCodeDataInDb);
      });
    });
  });
}

export async function getCustomerName(CustomerID: any) {
  // console.log("CustomerId",CustomerID);

  let query =
    'select Party from Pcustomer where CustomerID = "' + CustomerID + '" ';
  //console.log("getCustomerName=", query)
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getCustomerName = [];
        for (let i = 0; i < results.rows.length; i++) {
          getCustomerName.push(results.rows.item(i));
        }
        //console.log("getCustomerName=", getCustomerName)
        resolve(getCustomerName);
      });
    });
  });
}

export async function insertAssetData(
  OrderID: any,
  AssetID: any,
  QRCode: any,
  ScanStatus: any,
  AssetInformation: any,
  Remark: any,
  Condition: any,
  AuditDate: any,
) {
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        `insert into AssetPlacementVerification(OrderID,AssetID,QRCode,ScanStatus,AssetInformation,Remark,Condition,AuditDate) VALUES (?,?,?,?,?,?,?,?)`,
        [
          String(OrderID),
          String(AssetID),
          String(QRCode),
          String(ScanStatus),
          String(AssetInformation),
          String(Remark),
          String(Condition),
          String(AuditDate),
        ],
        (tx, results) => {
          resolve(results);
        },
        err => {
          console.error('error=', err);
        },
      );
    });
  });
}

export async function inserOrderMasterEntryForAsset(
  id: any,
  Current_date_time: any,
  entity_type: any,
  entity_id: any,
  latitude: any,
  longitude: any,
  total_amount: any,
  from_date: any,
  to_date: any,
  collection_type: any,
  user_id: any,
  remark: any,
  selected_flag: any,
  sync_flag: any,
  check_date: any,
  DefaultDistributorId: any,
  ExpectedDeliveryDate: any,
  Activitystatus: any,
  ActivityStart: any,
  ActivityEnd: any,
  uid: any,
) {
  //   initDB().then((db) => {
  db1.transaction(tx => {
    tx.executeSql(
      `insert into OrderMaster(id,Current_date_time ,entity_type,entity_id ,latitude ,longitude ,total_amount ,from_date ,to_date ,collection_type ,user_id ,remark,selected_flag ,sync_flag ,check_date,DefaultDistributorId,ExpectedDeliveryDate,Activitystatus,ActivityStart,ActivityEnd, userid)
                                                                  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
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
        String(remark),
        String(selected_flag),
        String(sync_flag),
        String(check_date),
        String(DefaultDistributorId),
        String(ExpectedDeliveryDate),
        String(Activitystatus),
        String(ActivityStart),
        String(ActivityEnd),
        String(uid),
      ],
      (tx, results) => {},
      err => {
        console.error('error=', err);
      },
    );
  });
}

export async function getOrderMasterSyncDataAttendanceInOut(sync_flag: string) {
  //id,Current_date_time ,entity_type,entity_id ,latitude ,longitude ,total_amount ,from_date ,to_date ,collection_type ,user_id ,remark,selected_flag ,sync_flag ,check_date,DefaultDistributorId,ExpectedDeliveryDate
  let query =
    "select id as ID,entity_type as EntityType,entity_id as EntityID ,latitude as Latitude ,longitude as Longitude ,total_amount as TotalAmount ,from_date as FromDate ,to_date as ToDate ,collection_type as CollectionType ,user_id as UserID ,remark as Remarks,Current_date_time as CurrentDatetime,DefaultDistributorId as DefaultDistributorId,ExpectedDeliveryDate as ExpectedDeliveryDate,ActivityStatus as ActivityStatus,ActivityStart as ActivityStartTime,ActivityEnd as ActivityEndTime from OrderMaster where entityId !='' AND sync_flag ='N' AND collection_type IN (8, 9)";
  //   "SELECT id AS ID,entity_type AS EntityType,entity_id AS EntityID,latitude AS Latitude,longitude AS Longitude,total_amount AS TotalAmount,from_date AS FromDate,to_date AS ToDate,collection_type AS CollectionType,user_id AS UserID,remark AS Remarks,Current_date_time AS CurrentDatetime,DefaultDistributorId AS DefaultDistributorId,ExpectedDeliveryDate AS ExpectedDeliveryDate FROM OrderMaster WHERE entityId != '' AND sync_flag = 'N' AND collection_type IN (8, 9)";
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let OrderMaster = [];
        for (let i = 0; i < results.rows.length; i++) {
          OrderMaster.push(results.rows.item(i));
        }
        //return OrderMaster
        resolve(OrderMaster);
      });
    });
  });
}

export async function getOrderMasterSyncData(sync_flag: string = 'N') {
  //id,Current_date_time ,entity_type,entity_id ,latitude ,longitude ,total_amount ,from_date ,to_date ,collection_type ,user_id ,remark,selected_flag ,sync_flag ,check_date,DefaultDistributorId,ExpectedDeliveryDate
  let query =
    "select id as ID,entity_type as EntityType,entity_id as EntityID ,latitude as Latitude ,longitude as Longitude ,total_amount as TotalAmount ,from_date as FromDate ,to_date as ToDate ,collection_type as CollectionType ,user_id as UserID ,remark as Remarks,Current_date_time as CurrentDatetime,DefaultDistributorId as DefaultDistributorId,ExpectedDeliveryDate as ExpectedDeliveryDate,OrderPriority from OrderMaster where entityId !='' AND sync_flag ='N'";
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        "select id as ID,entity_type as EntityType,entity_id as EntityID ,latitude as Latitude ,longitude as Longitude ,total_amount as TotalAmount ,from_date as FromDate ,to_date as ToDate ,collection_type as CollectionType ,user_id as UserID ,remark as Remarks,Current_date_time as CurrentDatetime,DefaultDistributorId as DefaultDistributorId,ExpectedDeliveryDate as ExpectedDeliveryDate,ActivityStatus as ActivityStatus,ActivityStart as ActivityStartTime,ActivityEnd as ActivityEndTime from OrderMaster where entityId !='' AND sync_flag = ?",
        [sync_flag],
        (tx, results) => {
          let OrderMaster = [];
          for (let i = 0; i < results.rows.length; i++) {
            OrderMaster.push(results.rows.item(i));
          }
          //return OrderMaster
          resolve(OrderMaster);
        },
      );
    });
  });
}
/////////////////////////////////////

export async function getOrderMasterSyncData5(sync_flag: any) {
  //id,Current_date_time ,entity_type,entity_id ,latitude ,longitude ,total_amount ,from_date ,to_date ,collection_type ,user_id ,remark,selected_flag ,sync_flag ,check_date,DefaultDistributorId,ExpectedDeliveryDate
  let query =
    "select id as ID,entity_type as EntityType,entity_id as EntityID ,latitude as Latitude ,longitude as Longitude ,total_amount as TotalAmount ,from_date as FromDate ,to_date as ToDate ,collection_type as CollectionType ,user_id as UserID ,remark as Remarks,Current_date_time as CurrentDatetime,DefaultDistributorId as DefaultDistributorId,ExpectedDeliveryDate as ExpectedDeliveryDate from OrderMaster where entityId !='' and collection_type in (4,8,9,3) AND sync_flag ='N'";
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        "select id as ID,entity_type as EntityType,entity_id as EntityID ,latitude as Latitude ,longitude as Longitude ,total_amount as TotalAmount ,from_date as FromDate ,to_date as ToDate ,collection_type as CollectionType ,user_id as UserID ,remark as Remarks,Current_date_time as CurrentDatetime,DefaultDistributorId as DefaultDistributorId,ExpectedDeliveryDate as ExpectedDeliveryDate,ActivityStatus as ActivityStatus,ActivityStart as ActivityStartTime,ActivityEnd as ActivityEndTime from OrderMaster where entityId !='' and collection_type in (4,8,9,3)  and  sync_flag = ?",
        [sync_flag],
        (tx, results) => {
          let OrderMaster = [];
          for (let i = 0; i < results.rows.length; i++) {
            OrderMaster.push(results.rows.item(i));
          }
          //return OrderMaster
          resolve(OrderMaster);
        },
      );
    });
  });
}
////////////////////////
export async function getOrderMasterSyncData6(sync_flag: any) {
  //id,Current_date_time ,entity_type,entity_id ,latitude ,longitude ,total_amount ,from_date ,to_date ,collection_type ,user_id ,remark,selected_flag ,sync_flag ,check_date,DefaultDistributorId,ExpectedDeliveryDate
  let query =
    "select id as ID,entity_type as EntityType,entity_id as EntityID ,latitude as Latitude ,longitude as Longitude ,total_amount as TotalAmount ,from_date as FromDate ,to_date as ToDate ,collection_type as CollectionType ,user_id as UserID ,remark as Remarks,Current_date_time as CurrentDatetime,DefaultDistributorId as DefaultDistributorId,ExpectedDeliveryDate as ExpectedDeliveryDate,OrderPriority from OrderMaster where entityId !='' and collection_type in (4,8,9) AND sync_flag ='N'";
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        "select id as ID,entity_type as EntityType,entity_id as EntityID ,latitude as Latitude ,longitude as Longitude ,total_amount as TotalAmount ,from_date as FromDate ,to_date as ToDate ,collection_type as CollectionType ,user_id as UserID ,remark as Remarks,Current_date_time as CurrentDatetime,DefaultDistributorId as DefaultDistributorId,ExpectedDeliveryDate as ExpectedDeliveryDate,ActivityStatus as ActivityStatus,ActivityStart as ActivityStartTime,ActivityEnd as ActivityEndTime from OrderMaster where entityId !='' and collection_type in (4,8,9)  and  sync_flag = ?",
        [sync_flag],
        (tx, results) => {
          let OrderMaster = [];
          for (let i = 0; i < results.rows.length; i++) {
            OrderMaster.push(results.rows.item(i));
          }
          //return OrderMaster
          resolve(OrderMaster);
        },
      );
    });
  });
}
/////////////////////////////////////
export async function getOrderMasterSyncData2(data: any) {
  // console.log('indide db with data ', data);
  //    let query =
  // "select id as ID,entity_type as EntityType,entity_id as EntityID ,latitude as Latitude ,longitude as Longitude ,total_amount as TotalAmount ,from_date as FromDate ,to_date as ToDate ,collection_type as CollectionType ,user_id as UserID ,remark as Remarks,Current_date_time as CurrentDatetime,DefaultDistributorId as DefaultDistributorId,ExpectedDeliveryDate as ExpectedDeliveryDate from OrderMaster where entityId !='' AND id ='"+item +"'";
  let OrderMaster: any = [];

  return new Promise(resolve => {
    db1.transaction(tx => {
      for (let item1 of data) {
        tx.executeSql(
          "select id as ID,entity_type as EntityType,entity_id as EntityID ,latitude as Latitude ,longitude as Longitude ,total_amount as TotalAmount ,from_date as FromDate ,to_date as ToDate ,collection_type as CollectionType ,user_id as UserID ,remark as Remarks,Current_date_time as CurrentDatetime,DefaultDistributorId as DefaultDistributorId,ExpectedDeliveryDate as ExpectedDeliveryDate,ActivityStatus as ActivityStatus,ActivityStart as ActivityStartTime,ActivityEnd as ActivityEndTime,OrderPriority from OrderMaster where entityId !=''  and id ='" +
            item1 +
            "' ",
          [],
          (tx, results) => {
            for (let i = 0; i < results.rows.length; i++) {
              if (results.rows.item(i) != undefined) {
                OrderMaster.push(results.rows.item(i));
              }
            }
            resolve(OrderMaster);
          },
        );
      }
    });
  });
}
///////////////////////////////

export async function getOrderDetailsSyncData() {
  //order_id,item_id,item_Name,quantity_one,quantity_two,small_Unit,large_Unit,rate ,Amount,selected_flag,sync_flag
  let query =
    "select id as ID,order_id as OrderID,item_id as ItemID,quantity_one as LargeUnit,quantity_two as SmallUnit,large_Unit as FreeLargeUnit,small_Unit as FreeSmallUnit,rate as Rate ,Amount as Amount,GSTRate as GSTRate,GSTTotal as GSTTotal,GrossAmount as GrossAmount  from OrderDetails where sync_flag= 'N'";
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let OrderDetails: any = [];
        for (let i = 0; i < results.rows.length; i++) {
          OrderDetails.push(results.rows.item(i));
        }

        resolve(OrderDetails);
      });
    });
  });
}
/////////////////////
export async function getOrderDetailsSyncData2(data: any) {
  //order_id,item_id,item_Name,quantity_one,quantity_two,small_Unit,large_Unit,rate ,Amount,selected_flag,sync_flag
  // let query =
  let OrderDetails: any = [];
  return new Promise(resolve => {
    db1.transaction(tx => {
      for (let item1 of data) {
        tx.executeSql(
          "select id as ID,order_id as OrderID,item_id as ItemID,quantity_one as LargeUnit,quantity_two as SmallUnit,large_Unit as FreeLargeUnit, small_Unit as FreeSmallUnit,rate as Rate ,Amount as Amount,GSTRate as GSTRate,GSTTotal as GSTTotal,GrossAmount as GrossAmount from OrderDetails where order_id='" +
            item1 +
            "'",
          [],
          (tx, results) => {
            for (let i = 0; i < results.rows.length; i++) {
              if (results.rows.item(i) != undefined) {
                OrderDetails.push(results.rows.item(i));
              }
            }
            resolve(OrderDetails);
          },
        );
      }
    });
  });
}
/////////////////

export async function getNewPartyOutletSyncData() {
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        "SELECT OrderID as MobileGenPrimaryKey,BitID as BeatId,OutletName as OutletName,ContactNo as ContactNumber,OwnersName as OwnersName,OutletAddress as OutletAddress,latitude as Latitude,longitude as Longitude,AddedDate as AddedOnDate,UserId as UserId, ('ShopType:' || ShopType || '||' || 'RegistrationNo:'|| RegistrationNo || '||' || 'ContactPerson:' || ContactPerson || '||' || 'ShopArea:' || ShopArea) AS Remark from newpartyoutlet where Is_Sync='N'",
        [],
        (tx, results) => {
          let NewParty: any = [];
          for (let i = 0; i < results.rows.length; i++) {
            NewParty.push(results.rows.item(i));
          }

          resolve(NewParty);
        },
      );
    });
  });
}

export async function getUsesLogSyncData() {
  let query =
    'SELECT id as Id,menu_keys as MenuKeys,uses_datetime as UsageDateTime from uses_log where is_sync="False"';
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let LogUsages: any = [];
        for (let i = 0; i < results.rows.length; i++) {
          LogUsages.push(results.rows.item(i));
        }

        resolve(LogUsages);
      });
    });
  });
}
///////////////////
export async function getVisitcount(DATE: string) {
  let query =
    'select count(DISTINCT entity_id)as count from ordermaster where collection_type="4" and to_date="' +
    DATE +
    '" or sync_flag="N"';
  return new Promise<VisitCount[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let LogUsages1 = [];
        for (let i = 0; i < results.rows.length; i++) {
          LogUsages1.push(results.rows.item(i));
        }
        resolve(LogUsages1);
      });
    });
  });
}
//////////////////

export async function getCollectionsSyncData2(data: any) {
  let Collections: any = [];
  return new Promise(resolve => {
    db1.transaction(tx => {
      for (let item1 of data) {
        tx.executeSql(
          "SELECT MobileGenPrimaryKey,InvoiceCode,AllocatedAmount,CollectionDatetime,PartyCode from TX_Collections where MobileGenPrimaryKey='" +
            item1 +
            "' ",
          [],
          (tx, results) => {
            for (let i = 0; i < results.rows.length; i++) {
              if (results.rows.item(i) != undefined) {
                Collections.push(results.rows.item(i));
              }
            }

            resolve(Collections);
          },
        );
      }
    });
  });
}
///////////////
export async function getCollectionsSyncData() {
  let query =
    'SELECT MobileGenPrimaryKey,InvoiceCode,AllocatedAmount,CollectionDatetime,PartyCode from TX_Collections';
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let CollectionsDetails: any = [];
        for (let i = 0; i < results.rows.length; i++) {
          CollectionsDetails.push(results.rows.item(i));
        }

        resolve(CollectionsDetails);
      });
    });
  });
}

/////////////

export async function getCollectionsDetailSyncData() {
  let query =
    'SELECT CollectionID,Amount,DiscountType,InvoiceCode from TX_CollectionsDetails';
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let CollectionsDetails: any = [];
        for (let i = 0; i < results.rows.length; i++) {
          CollectionsDetails.push(results.rows.item(i));
        }

        resolve(CollectionsDetails);
      });
    });
  });
}
export async function getCategoryDiscountItemSyncData() {
  let query =
    'select DiscountId as DiscountID,OrderId as OrderID,ItemId as ItemID ,OnQtyCS,OnQtyBTL,OnAmount from TABLE_TEMP_CategoryDiscountItem where SyncFlag ="N" ';
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let TABLE_TEMP_CategoryDiscountItem = [];
        for (let i = 0; i < results.rows.length; i++) {
          TABLE_TEMP_CategoryDiscountItem.push(results.rows.item(i));
        }

        resolve(TABLE_TEMP_CategoryDiscountItem);
      });
    });
  });
}
//////////////
export async function getCollectionsDetailSyncData2(data: any) {
  let CollectionsDetails: any = [];
  return new Promise(resolve => {
    db1.transaction(tx => {
      for (let item1 of data) {
        tx.executeSql(
          "SELECT CollectionID,Amount,DiscountType,InvoiceCode from TX_CollectionsDetails where CollectionID= '" +
            item1 +
            "'",
          [],
          (tx, results) => {
            for (let i = 0; i < results.rows.length; i++) {
              if (results.rows.item(i) != undefined) {
                CollectionsDetails.push(results.rows.item(i));
              }
            }
            resolve(CollectionsDetails);
          },
        );
      }
    });
  });
}
////////////

export async function getPaymentReceiptSyncData() {
  let query =
    'SELECT ReceivedDateTime , PaymentMode , ChequeNo ,ChequeDated ,BankDetails,Amount,OutletID,Narration,ID,ExecutiveID from TX_PaymentReceipt ';
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let PaymentReceipt = [];
        for (let i = 0; i < results.rows.length; i++) {
          PaymentReceipt.push(results.rows.item(i));
        }

        resolve(PaymentReceipt);
      });
    });
  });
}
/////////////////
export async function getPaymentReceiptSyncData2(data: any) {
  let PaymentReceipt: any = [];
  return new Promise(resolve => {
    db1.transaction(tx => {
      for (let item1 of data) {
        tx.executeSql(
          "SELECT ReceivedDateTime , PaymentMode , ChequeNo ,ChequeDated ,BankDetails,Amount,OutletID,Narration,ID,ExecutiveID from TX_PaymentReceipt where ID ='" +
            item1 +
            "'",
          [],
          (tx, results) => {
            for (let i = 0; i < results.rows.length; i++) {
              if (results.rows.item(i) != undefined) {
                PaymentReceipt.push(results.rows.item(i));
              }
            }
            resolve(PaymentReceipt);
          },
        );
      }
    });
  });
}
///////////////////

export async function getnewPartyTargetId() {
  let query = "SELECT OrderID as id from newpartyoutlet where Is_Sync='N';";
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let NewParty: any = [];
        for (let i = 0; i < results.rows.length; i++) {
          NewParty.push(results.rows.item(i));
        }

        resolve(NewParty);
      });
    });
  });
}
////////////////////////
export async function getnewPartyTargetId2(data: any) {
  let NewParty: any = [];
  return new Promise(resolve => {
    db1.transaction(tx => {
      for (let item1 of data) {
        tx.executeSql(
          "SELECT OrderID as id from newpartyoutlet where OrderID='" +
            item1 +
            "'",
          [],
          (tx, results) => {
            for (let i = 0; i < results.rows.length; i++) {
              if (results.rows.item(i) != undefined) {
                NewParty.push(results.rows.item(i));
              }
            }
            resolve(NewParty);
          },
        );
      }
    });
  });
}
//////////////////////////

export async function getDiscountSyncData() {
  let query =
    "select id as ID, OrderID as OrderID, DiscountType as DiscountType, DiscountAmount as DiscountAmount, discountadd as DiscountAdd, discountless as DiscountLess ,RNP as RNP ,OnAmount as OnAmount ,OnAmountSmallUnit as OnAmountSmallUnit ,Rate as Rate ,BookCode as BookCode ,OrderedItemID as OrderedItemID ,BrandCode as BrandCode,flag as Flag ,ItemCode as ItemCode from TABLE_DISCOUNT where syncFlag= 'N'";
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let DISCOUNT = [];
        for (let i = 0; i < results.rows.length; i++) {
          DISCOUNT.push(results.rows.item(i));
        }

        resolve(DISCOUNT);
      });
    });
  });
}
////////////////////
export async function getDiscountSyncData2(data: any) {
  let DISCOUNT: any = [];
  return new Promise(resolve => {
    db1.transaction(tx => {
      for (let item1 of data) {
        tx.executeSql(
          "select id as ID, OrderID as OrderID, DiscountType as DiscountType, DiscountAmount as DiscountAmount, discountadd as DiscountAdd, discountless as DiscountLess ,RNP as RNP ,OnAmount as OnAmount ,OnAmountSmallUnit as OnAmountSmallUnit ,Rate as Rate ,BookCode as BookCode ,OrderedItemID as OrderedItemID ,BrandCode as BrandCode,flag as Flag ,ItemCode as ItemCode from TABLE_DISCOUNT where OrderID='" +
            item1 +
            "'",
          [],
          (tx, results) => {
            for (let i = 0; i < results.rows.length; i++) {
              if (results.rows.item(i) != undefined) {
                DISCOUNT.push(results.rows.item(i));
              }
            }
            resolve(DISCOUNT);
          },
        );
      }
    });
  });
}
//////////////////

export async function getTABLE_TEMP_CategoryDiscountItem(data: any) {
  let CategoryDiscountItem: any = [];
  return new Promise(resolve => {
    db1.transaction(tx => {
      for (let item1 of data) {
        tx.executeSql(
          "select DiscountId as DiscountID,OrderId as OrderID,ItemId as ItemID ,OnQtyCS,OnQtyBTL,OnAmount from TABLE_TEMP_CategoryDiscountItem where OrderID='" +
            item1 +
            "'",
          [],
          (tx, results) => {
            for (let i = 0; i < results.rows.length; i++) {
              if (results.rows.item(i) != undefined) {
                CategoryDiscountItem.push(results.rows.item(i));
              }
            }
            resolve(CategoryDiscountItem);
          },
        );
      }
    });
  });
}

export async function getImageDetailsyncData() {
  let query =
    'select id as ID, order_id as OrderID,image_date_time as ImageDateTime ,image_name as ImageName,Path as ImageBytes,is_sync as sync_data  from ImagesDetails where is_sync= "N"';

  // console.log('queryforimagedetails', query);

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }

        resolve(ImageDetails);
      });
    });
  });
}
/////////////////////
export async function getImageDetailsyncData2(data: any) {
  let ImageDetails: any = [];
  //console.log("q---", query)
  return new Promise(resolve => {
    db1.transaction(tx => {
      for (let item1 of data) {
        tx.executeSql(
          "select id as ID, order_id as OrderID,image_date_time as ImageDateTime ,image_name as ImageName,Path as ImageBytes,is_sync as sync_data  from ImagesDetails where order_id='" +
            item1 +
            "'",
          [],
          (tx, results) => {
            for (let i = 0; i < results.rows.length; i++) {
              if (results.rows.item(i) != undefined) {
                ImageDetails.push(results.rows.item(i));
                console.log(
                  'THIS IS INSIDE QUERY >>>>>>>>>>>>>>>>>>>',
                  results.rows.item(i),
                );
              }
            }

            resolve(ImageDetails);
          },
        );
      }
    });
  });
}
////////////////////
export async function getNewPartyImageDetailsyncData() {
  let query =
    'select id as ID, OrderID as id,ImageName as ImageName,ImagePath as ImagePath,Is_Sync as sync_data,ShopId  from newpartyImageoutlet where Is_Sync= "N"';
  //console.log('q---', query);
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails: any = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }

        resolve(ImageDetails);
      });
    });
  });
}

export async function getAssetDetailData() {
  let query =
    'select id as ID, OrderID as OrderID,AssetID as AssetID,QRCode as QRCode,ScanStatus as ScanStatus,AssetInformation as AssetInformation,Remark as Remark from AssetPlacementVerification';
  //console.log("q---", query)
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }

        resolve(ImageDetails);
      });
    });
  });
}
/////////////////

export async function getAssetDetailData2(data: any) {
  let ImageDetails: any = [];
  // console.log('q---');
  return new Promise(resolve => {
    db1.transaction(tx => {
      for (let item1 of data) {
        tx.executeSql(
          "select id as ID, OrderID as OrderID,AssetID as AssetID,QRCode as QRCode,ScanStatus as ScanStatus,AssetInformation as AssetInformation,Remark as Remark from AssetPlacementVerification where OrderID= '" +
            item1 +
            "'",
          [],
          (tx, results) => {
            for (let i = 0; i < results.rows.length; i++) {
              if (results.rows.item(i) != undefined) {
                ImageDetails.push(results.rows.item(i));
              }
            }
            resolve(ImageDetails);
          },
        );
      }
    });
  });
}

export async function updateOrderMasterSyncFlag(order_id: string) {
  db1.transaction(tx => {
    tx.executeSql(
      'UPDATE OrderMaster  SET sync_flag = "Y" WHERE id = "' + order_id + '"',
      [],
      (tx, results) => {
        // console.log('Results OM sf', results.rowsAffected);
      },
    );
  });
}

export async function deleteOrderMasterByKey(order_id: string) {
  db1.transaction(tx => {
    tx.executeSql(
      'DELETE FROM OrderMaster WHERE id = ?',
      [order_id],
      (tx, results) => {
        // console.log('Deleted from OrderMaster', results.rowsAffected);
      },
      (tx, error) => {
        console.error('Error deleting from OrderMaster:', error);
      },
    );
  });
}
export async function updateOrderMasterPaymentSyncFlag(order_id: any) {
  db1.transaction(tx => {
    tx.executeSql(
      'UPDATE OrderMaster  SET sync_flag ="Y" WHERE id = "' + order_id + '"',
      [],
      (tx, results) => {
        // console.log('Results', results.rowsAffected);
      },
    );
  });
}

export async function updateCollectionSyncFlag(order_id: any) {
  db1.transaction(tx => {
    tx.executeSql(
      'UPDATE TX_Collections SET Syncflag = ? WHERE MobileGenPrimaryKey = ?',
      ['Y', String(order_id)],
      (tx, results) => {
        console.log('Results', results.rowsAffected);
      },
    );
  });
}

export async function updateCollectionDetailsSyncFlag(order_id: any) {
  db1.transaction(tx => {
    tx.executeSql(
      'UPDATE TX_CollectionsDetails  SET Syncflag = ? WHERE CollectionID = ?',
      ['Y', String(order_id)],
      (tx, results) => {
        console.log('Results', results.rowsAffected);
      },
    );
  });
}

export async function updatePaymentReceiptSyncFlag(order_id: any) {
  db1.transaction(tx => {
    tx.executeSql(
      'UPDATE TX_PaymentReceipt  SET Syncflag = ? WHERE ID = ?',
      ['Y', String(order_id)],
      (tx, results) => {
        console.log('Results', results.rowsAffected);
      },
    );
  });
}

/////////////////////////
export async function updateOrderMasterPaymentSyncFlag2(data: any) {
  db1.transaction(tx => {
    // for (let item1 of data) {
    tx.executeSql(
      'UPDATE OrderMaster  SET sync_flag = "Y" WHERE id = "' + data + '"',
      [],
      (tx, results) => {
        // console.log('Results', results.rowsAffected);
      },
    );
    // }
  });
}

export async function deleteOrderMaster() {
  db1.transaction(tx => {
    tx.executeSql('DELETE FROM OrderMaster ', [], (tx, results) => {
      //console.log('Results', results.rowsAffected);
    });
  });
}
///////////////////
export async function updateCollectionDetails(no: any, id: any) {
  db1.transaction(tx => {
    tx.executeSql(
      'update TX_PaymentReceipt set ChequeNo=? WHERE ID=?',
      [no, String(id)],
      (tx, results) => {
        console.log('Results', results.rowsAffected);
      },
    );
  });
}
/////////////////
export async function updateCollectionDetails2(date: any, id: any) {
  db1.transaction(tx => {
    tx.executeSql(
      'update TX_PaymentReceipt set ChequeDated=? WHERE ID=?',
      [date, String(id)],
      (tx, results) => {
        console.log('Results', results.rowsAffected);
      },
    );
  });
}

export async function updateNewPartyOutletSyncFlag(order_id: any) {
  db1.transaction(tx => {
    tx.executeSql(
      'UPDATE newpartyoutlet  SET Is_Sync = "Y" ',
      [],
      (tx, results) => {
        //console.log('Results', results.rowsAffected);
      },
    );
  });
  // return new Promise((resolve) => {
  //   db1.transaction((tx) => {
  //     tx.executeSql('UPDATE OrderMaster  SET sync_flag = ? WHERE id = ? ', ['Y', order_id]).then(([tx, results]) => {
  //       resolve(results);
  //     });
  //   }).then((result) => {
  //     //console.log("updateOrderMasterSyncFlagresulr////////",result)
  //   }).catch((err) => {
  //     //console.log(err);
  //   });
  // });
}

export async function deleteNewPartyOutletByKey(order_id: any) {
  db1.transaction(tx => {
    tx.executeSql(
      'DELETE FROM newpartyoutlet WHERE OrderID = ?',
      [order_id],
      (tx, results) => {
        // console.log('Deleted from newpartyoutlet', results.rowsAffected);
      },
      (tx, error) => {
        console.error('Error deleting from newpartyoutlet:', error);
      },
    );
  });
}

export async function deletenewpartyoutlet() {
  db1.transaction(tx => {
    tx.executeSql('DELETE FROM newpartyoutlet ', [], (tx, results) => {
      //console.log('Results', results.rowsAffected);
    });
  });
}

export async function updateOrderDetailSyncFlag(order_id: any) {
  // return new Promise((resolve) => {
  db1.transaction(tx => {
    tx.executeSql(
      'UPDATE OrderDetails  SET sync_flag = "Y" WHERE order_id = "' +
        order_id +
        '"',
      [],
      (tx, results) => {
        //console.log('Results', results.rowsAffected);
      },
    );
  });
}

export async function deleteOrderDetailByKey(order_id: any) {
  db1.transaction(tx => {
    tx.executeSql(
      'DELETE FROM OrderDetails WHERE order_id = ?',
      [order_id],
      (tx, results) => {
        // console.log('Deleted from OrderDetails', results.rowsAffected);
      },
      (tx, error) => {
        console.error('Error deleting from OrderDetails:', error);
      },
    );
  });
}
export async function deleteMeetReportMeeting(id: any) {
  return new Promise(resolve => {
    //   alert('order Deleted');
    //  initDB().then((db) => {
    db1
      .transaction(tx => {
        tx.executeSql('DELETE FROM MeetReport WHERE ID = ?', [id], (tx, results) => {
          //console.log(results);
          resolve(results);
        }, (tx, error) => {
          console.error('Error deleting MeetReport:', error);
          resolve(null);
        });
      })
      .then(result => {
        //
      })
      .catch(err => {
        //console.log(err);
      });
  });
}

export async function updateNewPartyImageDetailSyncFlag(order_id: any) {
  db1.transaction(tx => {
    tx.executeSql(
      'UPDATE newpartyImageoutlet  SET Is_Sync = "Y"',
      [],
      (tx, results) => {
        //console.log('Results', results.rowsAffected);
      },
    );
  });
}

export async function deleteNewPartyImageDetailByKey(order_id: any) {
  db1.transaction(tx => {
    tx.executeSql(
      'DELETE FROM newpartyImageoutlet WHERE OrderID = ?',
      [order_id],
      (tx, results) => {
        // console.log('Deleted from newpartyImageoutlet', results.rowsAffected);
      },
      (tx, error) => {
        console.error('Error deleting from newpartyImageoutlet:', error);
      },
    );
  });
}

export async function deleteNewPartyImageDetailByShopId(shopId: string) {
  db1.transaction(tx => {
    tx.executeSql(
      'DELETE FROM newpartyImageoutlet WHERE ShopId = ?',
      [shopId],
      (tx, results) => {
        // console.log('Deleted from newpartyImageoutlet', results.rowsAffected);
      },
      (tx, error) => {
        console.error(
          'Error deleting from deleteNewPartyImageDetailByShopId:',
          error,
        );
      },
    );
  });
}

export async function getImageDetailsById(id: string) {
  let query = "select * from ImagesDetails where order_id ='" + id + "'";
  return new Promise<any>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempOutletArray = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempOutletArray.push(results.rows.item(i));
        }
        resolve(tempOutletArray);
      });
    });
  });
}

export async function getImageDetails() {
  let ImageDetails: any = [];
  //console.log("q---", query)
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        'select * from ImagesDetails where is_sync = "Y"',
        [],
        (tx, results) => {
          for (let i = 0; i < results.rows.length; i++) {
            if (results.rows.item(i) != undefined) {
              ImageDetails.push(results.rows.item(i));
            }
          }
          resolve(ImageDetails);
        },
      );
    });
  });
}

export async function getNewPartyImages() {
  let ImageDetails: any = [];
  //console.log("q---", query)
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        'select * from newpartyImageoutlet where Is_Sync = "Y"',
        [],
        (tx, results) => {
          for (let i = 0; i < results.rows.length; i++) {
            if (results.rows.item(i) != undefined) {
              ImageDetails.push(results.rows.item(i));
            }
          }
          resolve(ImageDetails);
        },
      );
    });
  });
}
export async function deletenewpartyImageoutlet() {
  db1.transaction(tx => {
    tx.executeSql(
      'DELETE from newpartyImageoutlet where Is_Sync = "Y" ',
      [],
      (tx, results) => {
        //console.log('Results', results.rowsAffected);
      },
    );
  });
}

export async function updateDiscountSyncFlag(order_id: any) {
  db1.transaction(tx => {
    tx.executeSql(
      'UPDATE TABLE_DISCOUNT SET syncFlag = "Y" WHERE OrderID = "' +
        order_id +
        '"',
      [],
      (tx, results) => {
        //console.log('Results', results.rowsAffected);
      },
    );
  });
}

export async function deleteDiscountByKey(order_id: any) {
  db1.transaction(tx => {
    tx.executeSql(
      'DELETE FROM TABLE_DISCOUNT WHERE OrderID = ?',
      [order_id],
      (tx, results) => {
        // console.log('Deleted from TABLE_DISCOUNT', results.rowsAffected);
      },
      (tx, error) => {
        console.error('Error deleting from TABLE_DISCOUNT:', error);
      },
    );
  });
}
export async function updateCategoryDiscountItemSyncFlag(order_id: any) {
  db1.transaction(tx => {
    tx.executeSql(
      'UPDATE TABLE_TEMP_CategoryDiscountItem SET syncFlag = "Y" WHERE OrderID = "' +
        order_id +
        '"',
      [],
      (tx, results) => {
        //console.log('Results', results.rowsAffected);
      },
    );
  });
}

export async function deleteCategoryDiscountItemByKey(order_id: any) {
  db1.transaction(tx => {
    tx.executeSql(
      'DELETE FROM TABLE_TEMP_CategoryDiscountItem WHERE OrderID = ?',
      [order_id],
      (tx, results) => {
        // console.log('Deleted from TABLE_TEMP_CategoryDiscountItem', results.rowsAffected);
      },
      (tx, error) => {
        console.error(
          'Error deleting from TABLE_TEMP_CategoryDiscountItem:',
          error,
        );
      },
    );
  });
}

export async function deleteTABLE_DISCOUNT() {
  db1.transaction(tx => {
    tx.executeSql('DELETE from TABLE_DISCOUNT ', [], (tx, results) => {
      //console.log('Results', results.rowsAffected);
    });
  });
}
/////////////////
export async function deleteTABLE_CollectionDetail1(id: string) {
  db1.transaction(tx => {
    tx.executeSql(
      "delete  from TX_CollectionsDetails where TX_CollectionsDetails.CollectionID='" +
        id +
        "' ",
      [],
      (tx, results) => {
        //console.log('Results', results.rowsAffected);
      },
    );
  });
}
export async function deleteTABLE_CollectionDetail2(id: string) {
  db1.transaction(tx => {
    tx.executeSql(
      "delete  from TX_Collections where TX_Collections.MobileGenPrimaryKey='" +
        id +
        "' ",
      [],
      (tx, results) => {
        //console.log('Results', results.rowsAffected);
      },
    );
  });
}
export async function deleteTABLE_Paymentreceipt3(id: string) {
  db1.transaction(tx => {
    tx.executeSql(
      "delete  from TX_PaymentReceipt where TX_PaymentReceipt.ID='" + id + "' ",
      [],
      (tx, results) => {
        //console.log('Results', results.rowsAffected);
      },
    );
  });
}

export async function getOrderMasterRemarks(id: string) {
  let query = "select remark from OrderMaster where id ='" + id + "'";

  return new Promise<any>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempOutletArray = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempOutletArray.push(results.rows.item(i));
        }
        resolve(tempOutletArray);
      });
    });
  });
}

// âœ… REMOVED: getOrderMasterByID function - not needed with proper batching strategy

// âœ… NEW FUNCTIONS: Reset sync flags back to "N" for failed syncs
export async function resetOrderMasterSyncFlag(order_id: any) {
  db1.transaction(tx => {
    tx.executeSql(
      'UPDATE OrderMaster SET sync_flag = "N" WHERE id = ?',
      [order_id],
      (tx, results) => {
        console.log(
          'Reset OrderMaster sync flag for:',
          order_id,
          results.rowsAffected,
        );
      },
      (tx, error) => {
        console.error('Error resetting OrderMaster sync flag:', error);
      },
    );
  });
}

export async function resetOrderDetailSyncFlag(order_id: any) {
  db1.transaction(tx => {
    tx.executeSql(
      'UPDATE OrderDetails SET sync_flag = "N" WHERE order_id = ?',
      [order_id],
      (tx, results) => {
        console.log(
          'Reset OrderDetails sync flag for:',
          order_id,
          results.rowsAffected,
        );
      },
      (tx, error) => {
        console.error('Error resetting OrderDetails sync flag:', error);
      },
    );
  });
}

export async function resetImageDetailSyncFlag(order_id: any) {
  db1.transaction(tx => {
    tx.executeSql(
      'UPDATE ImagesDetails SET is_sync = "N" WHERE order_id = ?',
      [order_id],
      (tx, results) => {
        console.log(
          'Reset ImagesDetails sync flag for:',
          order_id,
          results.rowsAffected,
        );
      },
      (tx, error) => {
        console.error('Error resetting ImagesDetails sync flag:', error);
      },
    );
  });
}

export async function resetDiscountSyncFlag(order_id: any) {
  db1.transaction(tx => {
    tx.executeSql(
      'UPDATE Discount SET sync_flag = "N" WHERE order_id = ?',
      [order_id],
      (tx, results) => {
        console.log(
          'Reset Discount sync flag for:',
          order_id,
          results.rowsAffected,
        );
      },
      (tx, error) => {
        console.error('Error resetting Discount sync flag:', error);
      },
    );
  });
}

export async function resetCategoryDiscountItemSyncFlag(order_id: any) {
  db1.transaction(tx => {
    tx.executeSql(
      'UPDATE CategoryDiscountItem SET sync_flag = "N" WHERE order_id = ?',
      [order_id],
      (tx, results) => {
        console.log(
          'Reset CategoryDiscountItem sync flag for:',
          order_id,
          results.rowsAffected,
        );
      },
      (tx, error) => {
        console.error('Error resetting CategoryDiscountItem sync flag:', error);
      },
    );
  });
}

export async function resetNewPartyOutletSyncFlag(order_id: any) {
  db1.transaction(tx => {
    tx.executeSql(
      'UPDATE newpartyoutlet SET Is_Sync = "N" WHERE OrderID = ?',
      [order_id],
      (tx, results) => {
        console.log(
          'Reset newpartyoutlet sync flag for:',
          order_id,
          results.rowsAffected,
        );
      },
      (tx, error) => {
        console.error('Error resetting newpartyoutlet sync flag:', error);
      },
    );
  });
}

export async function resetNewPartyImageDetailSyncFlag(order_id: any) {
  db1.transaction(tx => {
    tx.executeSql(
      'UPDATE newpartyImageoutlet SET Is_Sync = "N" WHERE OrderID = ?',
      [order_id],
      (tx, results) => {
        console.log(
          'Reset newpartyImageoutlet sync flag for:',
          order_id,
          results.rowsAffected,
        );
      },
      (tx, error) => {
        console.error('Error resetting newpartyImageoutlet sync flag:', error);
      },
    );
  });
}

export async function deleteCollectionOrderMaster(id: string) {
  db1.transaction(tx => {
    tx.executeSql(
      "delete  from OrderMaster where OrderMaster.id='" + id + "' ",
      [],
      (tx, results) => {
        console.log('ORDERMASTERSSResults', results.rowsAffected);
      },
    );
  });
}

////////////////////
export async function deleteTABLE_Collection() {
  db1.transaction(tx => {
    tx.executeSql('DELETE from TX_Collections ', [], (tx, results) => {
      //console.log('Results', results.rowsAffected);
    });
  });
}
export async function deleteTABLE_CollectionDetails() {
  db1.transaction(tx => {
    tx.executeSql('DELETE from TX_CollectionsDetails ', [], (tx, results) => {
      //console.log('Results', results.rowsAffected);
    });
  });
}
export async function deleteTABLE_Paymentreceipt() {
  db1.transaction(tx => {
    tx.executeSql('DELETE from TX_PaymentReceipt ', [], (tx, results) => {
      //console.log('Results', results.rowsAffected);
    });
  });
}
///////////////////
export async function deleteTABLE_Collection2(data: any) {
  db1.transaction(tx => {
    tx.executeSql(
      'DELETE FROM TX_Collections where MobileGenPrimaryKey="' + data + '" ',
      [],
      (tx, results) => {
        console.log('Results coll', results.rowsAffected);
      },
    );
  });
}
export async function deleteTABLE_CollectionDetails2(data: any) {
  db1.transaction(tx => {
    tx.executeSql(
      'DELETE FROM TX_CollectionsDetails where CollectionID ="' + data + '" ',
      [],
      (tx, results) => {
        console.log('Results cooldet', results.rowsAffected);
      },
    );
  });
}
export async function deleteTABLE_Paymentreceipt2(data: any) {
  db1.transaction(tx => {
    tx.executeSql(
      'DELETE FROM TX_PaymentReceipt where ID ="' + data + '"',
      [],
      (tx, results) => {
        console.log('Results pay rece', results.rowsAffected);
      },
    );
  });
}
///////////////////////

export async function updateimageDetailSyncFlag(order_id: any) {
  // âŒ WRONG: Updates ALL images with same order_id
  // This causes unsynced images to be marked as synced incorrectly

  console.log(
    'UPDATE ImagesDetails  SET is_sync = "Y" WHERE order_id = "' +
      order_id +
      '"',
  );

  db1.transaction(tx => {
    tx.executeSql(
      'UPDATE ImagesDetails  SET is_sync = "Y" WHERE order_id = "' +
        order_id +
        '"',
      [],
      (tx, results) => {
        console.log('Results updateimageDetailSyncFlag', results.rowsAffected);
      },
    );
  });
}

// âœ… CORRECT: Update individual image by its unique ID
export async function updateImageDetailSyncFlagById(imageId: any) {
  console.log(
    'UPDATE ImagesDetails SET is_sync = "Y" WHERE id = "' + imageId + '"',
  );

  db1.transaction(tx => {
    tx.executeSql(
      'UPDATE ImagesDetails SET is_sync = "Y" WHERE id = ?',
      [imageId],
      (tx, results) => {
        console.log(
          'Results updateImageDetailSyncFlagById',
          results.rowsAffected,
        );
      },
    );
  });
}

export async function deleteImageDetailByKey(order_id: any) {
  db1.transaction(tx => {
    tx.executeSql(
      'DELETE FROM ImagesDetails WHERE order_id = ?',
      [order_id],
      (tx, results) => {
        console.log('Deleted from ImagesDetails', results.rowsAffected);
      },
      (tx, error) => {
        console.error('Error deleting from ImagesDetails:', error);
      },
    );
  });
}

export async function deleteImagesDetails() {
  db1.transaction(tx => {
    tx.executeSql(
      'DELETE FROM ImagesDetails where is_sync = "Y"  ',
      [],
      (tx, results) => {
        console.log('Results', results.rowsAffected);
      },
    );
  });
}

export async function deleteNewPartyImage() {
  db1.transaction(tx => {
    tx.executeSql(
      'DELETE FROM newpartyImageoutlet where Is_Sync = "Y" ',
      [],
      (tx, results) => {
        //console.log('Results', results.rowsAffected);
      },
    );
  });
}

export async function deleteUsageLog() {
  db1.transaction(tx => {
    tx.executeSql(
      'DELETE from uses_log where is_sync = "True"',
      [],
      (tx, results) => {
        //console.log('Results', results.rowsAffected);
      },
    );
  });
}

export async function deleteUsageLogTimeStamp(timestamp: string) {
  // console.log('TImestampsdsfddjsd', timestamp);

  const query = `
  DELETE FROM uses_log 
    WHERE uses_datetime < ?
  `;

  console.log('Executing SQL:', query);

  db1.transaction(tx => {
    tx.executeSql(
      query,
      [timestamp],
      (tx, results) => {
        console.log('Query executed. Rows fetched:', results.rows.length);
        for (let i = 0; i < results.rows.length; i++) {
          console.log(results.rows.item(i));
        }
      },
      (tx, error) => {
        console.error('SQL error:', error);
        return true;
      },
    );
  }).catch((error: any) => {
    console.error('Transaction error:', error);
  });
}

export async function deleteImagesDetailsWithPath(path: string) {
  db1.transaction(tx => {
    tx.executeSql(
      'DELETE FROM ImagesDetails where Path ="' + path + '" ',
      [],
      (tx, results) => {
        //console.log('Results', results.rowsAffected);
      },
    );
  });
}

export async function deleteImagesDetailsFromOrdermaster(id: string) {
  db1.transaction(tx => {
    tx.executeSql(
      'DELETE FROM OrderMaster where id="' + id + '" ',
      [],
      (tx, results) => {
        //console.log('Results', results.rowsAffected);
      },
    );
  });
}

export async function deleteImagesDetailsWithPathForAsset(path: string) {
  db1.transaction(tx => {
    tx.executeSql(
      'DELETE FROM newpartyImageoutlet where Path ="' + path + '" ',
      [],
      (tx, results) => {
        //console.log('Results', results.rowsAffected);
      },
    );
  });
}

export async function getAppOrderIdFromImageDetails(path: string) {
  let query = 'select order_id from ImagesDetails where Path ="' + path + '" ';
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function getDatacardsforNewParty() {
  let query =
    'select newpartyoutlet.OutletName as Party, OrderMaster.ActivityStart, OrderMaster.id,OrderMaster.from_date,OrderMaster.to_date, OrderDetails.item_Name, OrderDetails.quantity_one, OrderDetails.quantity_two, OrderDetails.small_Unit, OrderDetails.large_Unit from OrderDetails,OrderMaster,newpartyoutlet where OrderDetails.order_id == OrderMaster.id and newpartyoutlet.OrderId == OrderMaster.entity_id and OrderMaster.collection_type=1 and OrderMaster.entity_type=1';
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function getDatacards2forNewParty() {
  let query =
    'select newpartyoutlet.OutletName as Party, OrderMaster.ActivityStart, OrderMaster.id,OrderMaster.from_date,OrderMaster.to_date, OrderDetails.item_Name, OrderDetails.quantity_one, OrderDetails.quantity_two, OrderDetails.small_Unit, OrderDetails.large_Unit from OrderDetails,OrderMaster,newpartyoutlet where OrderDetails.order_id == OrderMaster.id and newpartyoutlet.OrderId == OrderMaster.entity_id and OrderMaster.collection_type=2 and OrderMaster.entity_type=1';
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function getDatacards() {
  // let query = 'select  Pcustomer.Party, OrderMaster.check_date, OrderMaster.id,OrderMaster.from_date,OrderMaster.to_date, OrderDetails.item_Name, OrderDetails.quantity_one, OrderDetails.quantity_two, OrderDetails.small_Unit, OrderDetails.large_Unit from OrderDetails,OrderMaster,Pcustomer where OrderDetails.order_id == OrderMaster.id and Pcustomer.CustomerId == OrderMaster.entity_id and OrderMaster.collection_type=1 and OrderMaster.entity_type=1';

  //let query ='SELECT Pcustomer.Party, OrderMaster.check_date, OrderMaster.id, OrderMaster.from_date, OrderMaster.to_date,OrderDetails.item_Name, OrderDetails.quantity_one,  OrderDetails.quantity_two, OrderDetails.small_Unit,OrderDetails.large_Unit FROM  OrderDetails JOIN  OrderMaster ON OrderDetails.order_id = OrderMaster.id JOIN Pcustomer ON Pcustomer.CustomerId = OrderMaster.entity_id WHERE OrderMaster.collection_type = 1 AND (OrderMaster.entity_type = 1 OR OrderMaster.entity_type = 'true')';

  let query = `
SELECT 
    Pcustomer.Party, 
    OrderMaster.ActivityStart,
    OrderMaster.id, 
    OrderMaster.from_date, 
    OrderMaster.to_date, 
    Pitem.Item AS item_Name,
    OrderDetails.quantity_one,  
    OrderDetails.quantity_two, 
    OrderDetails.small_Unit, 
    OrderDetails.large_Unit 
FROM  
    OrderDetails 
JOIN  
    OrderMaster ON OrderDetails.order_id = OrderMaster.id 
JOIN  
    Pcustomer ON Pcustomer.CustomerId = OrderMaster.entity_id 
JOIN
    Pitem ON Pitem.itemid = OrderDetails.item_id 
WHERE  
    OrderMaster.collection_type = 1 
    AND (CAST(OrderMaster.entity_type AS TEXT) = '1' OR CAST(OrderMaster.entity_type AS TEXT) = 'true')
ORDER BY 
    OrderMaster.check_date DESC
`;

  //console.log(query);

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function getDatacardsshops(shopId: any) {
  // let query =
  //   'select  Pcustomer.Party, OrderMaster.check_date, OrderMaster.id,OrderMaster.from_date,OrderMaster.to_date, OrderDetails.item_Name, OrderDetails.quantity_one, OrderDetails.quantity_two, OrderDetails.small_Unit, OrderDetails.large_Unit from OrderDetails,OrderMaster,Pcustomer where OrderDetails.order_id == OrderMaster.id and Pcustomer.CustomerId == OrderMaster.entity_id and OrderMaster.collection_type=1 and OrderMaster.entity_type=1 and Pcustomer.CustomerId =' +
  //   shopId +
  //   '';

  let query = `
SELECT  
    Pcustomer.Party, 
    OrderMaster.ActivityStart as check_date,
    OrderMaster.id,
    OrderMaster.from_date,
    OrderMaster.to_date, 
    PItem.Item as item_Name,
    OrderDetails.quantity_one, 
    OrderDetails.quantity_two, 
    OrderDetails.small_Unit, 
    OrderDetails.large_Unit 
FROM 
    OrderDetails, OrderMaster, Pcustomer,Pitem
WHERE 
    OrderDetails.order_id = OrderMaster.id 
    AND Pcustomer.CustomerId = OrderMaster.entity_id 
    AND OrderMaster.collection_type = 2 
    AND OrderDetails.item_id = PItem.ItemId
    AND (CAST(OrderMaster.entity_type AS TEXT) = '1' OR OrderMaster.entity_type = 'true') and Pcustomer.CustomerId ='${shopId}'`;

  console.log('Shankar', query);

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function getDatacards1shops1(shopId: any) {
  // let query ='select  Pcustomer.Party, OrderMaster.check_date, OrderMaster.id, OrderDetails.item_Name, OrderDetails.quantity_one, OrderDetails.quantity_two, OrderDetails.small_Unit, OrderDetails.large_Unit from OrderDetails,OrderMaster,Pcustomer where OrderDetails.order_id == OrderMaster.id and Pcustomer.CustomerId == OrderMaster.entity_id and OrderMaster.collection_type=2 and OrderMaster.entity_type=1';
  let query = `
SELECT  
    Pcustomer.Party, 
    OrderMaster.ActivityStart as check_date,
    OrderMaster.id, 
    PItem.Item as item_Name,
    OrderDetails.quantity_one, 
    OrderDetails.quantity_two, 
    OrderDetails.small_Unit, 
    OrderDetails.large_Unit 
FROM 
    OrderDetails, OrderMaster, Pcustomer,Pitem
WHERE 
    OrderDetails.order_id = OrderMaster.id 
    AND Pcustomer.CustomerId = OrderMaster.entity_id 
    AND OrderMaster.collection_type = 2 
    AND OrderDetails.item_id = PItem.ItemId
    AND (CAST(OrderMaster.entity_type AS TEXT) = '1' OR OrderMaster.entity_type = 'true') and Pcustomer.CustomerId ='${shopId}'`;

  console.log(query);

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}
export async function getDatacards1() {
  // let query ='select  Pcustomer.Party, OrderMaster.check_date, OrderMaster.id, OrderDetails.item_Name, OrderDetails.quantity_one, OrderDetails.quantity_two, OrderDetails.small_Unit, OrderDetails.large_Unit from OrderDetails,OrderMaster,Pcustomer where OrderDetails.order_id == OrderMaster.id and Pcustomer.CustomerId == OrderMaster.entity_id and OrderMaster.collection_type=2 and OrderMaster.entity_type=1';
  let query = `
SELECT  
    Pcustomer.Party, 
    OrderMaster.ActivityStart,
    OrderMaster.id, 
    PItem.Item,
    OrderDetails.quantity_one, 
    OrderDetails.quantity_two, 
    OrderDetails.small_Unit, 
    OrderDetails.large_Unit 
FROM 
    OrderDetails, OrderMaster, Pcustomer,Pitem
WHERE 
    OrderDetails.order_id = OrderMaster.id 
    AND Pcustomer.CustomerId = OrderMaster.entity_id 
    AND OrderMaster.collection_type = 2 
    AND OrderDetails.item_id = PItem.ItemId
    AND (CAST(OrderMaster.entity_type AS TEXT) = '1' OR OrderMaster.entity_type = 'true')
`;

  console.log('sales', query);

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}
export async function getDatacards2() {
  let query =
    'select  PDistributor.Distributor, OrderMaster.ActivityStart, OrderMaster.id, OrderDetails.item_Name, OrderDetails.quantity_one, OrderDetails.quantity_two, OrderDetails.small_Unit, OrderDetails.large_Unit from OrderDetails,OrderMaster,PDistributor where OrderDetails.order_id == OrderMaster.id and PDistributor.DistributorID == OrderMaster.entity_id and OrderMaster.collection_type=2 and OrderMaster.entity_type=0';
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}
export async function getDatacards3() {
  let query =
    'select PDistributor.Distributor, OrderMaster.ActivityStart, OrderMaster.id,OrderMaster.from_date,OrderMaster.to_date, PItem.Item, OrderDetails.quantity_one, OrderDetails.quantity_two, OrderDetails.small_Unit, OrderDetails.large_Unit from OrderDetails,OrderMaster,PDistributor,PItem where OrderDetails.order_id == OrderMaster.id and PDistributor.DistributorID == OrderMaster.entity_id and OrderMaster.collection_type=1 and OrderMaster.entity_type=0 AND OrderDetails.item_id=PItem.ItemId';

  // console.log('getDatacards3444444444444444444444', query);

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function getInsertedsTempOrderDC(app_order_id: any) {
  return new Promise(resolve => {
    //SELECT distinct TABLE_TEMP_ORDER_DETAILS.id, TABLE_TEMP_ORDER_DETAILS.item_id, TABLE_TEMP_ORDER_DETAILS.item_Name,  TABLE_TEMP_ORDER_DETAILS.quantity_one, TABLE_TEMP_ORDER_DETAILS.rate,  TABLE_TEMP_ORDER_DETAILS.Amount,TABLE_TEMP_ORDER_DETAILS.quantity_two,TABLE_TEMP_ORDER_DETAILS.small_Unit,TABLE_TEMP_ORDER_DETAILS.large_Unit,TABLE_TEMP_ORDER_DETAILS.from_date, TABLE_TEMP_ORDER_DETAILS.to_date, TABLE_TEMP_ORDER_DETAILS.bpc FROM TABLE_TEMP_ORDER_DETAILS INNER JOIN PItem ON TABLE_TEMP_ORDER_DETAILS.item_id = ItemId WHERE TABLE_TEMP_ORDER_DETAILS.order_id  = '%@'",order_id

    let query =
      'SELECT distinct TABLE_TEMP_ORDER_DETAILS.id,TABLE_TEMP_ORDER_DETAILS.order_id, TABLE_TEMP_ORDER_DETAILS.item_id, TABLE_TEMP_ORDER_DETAILS.item_Name,  TABLE_TEMP_ORDER_DETAILS.quantity_one, TABLE_TEMP_ORDER_DETAILS.rate,  TABLE_TEMP_ORDER_DETAILS.Amount,TABLE_TEMP_ORDER_DETAILS.quantity_two,TABLE_TEMP_ORDER_DETAILS.small_Unit,TABLE_TEMP_ORDER_DETAILS.large_Unit,TABLE_TEMP_ORDER_DETAILS.from_date, TABLE_TEMP_ORDER_DETAILS.to_date, TABLE_TEMP_ORDER_DETAILS.bpc FROM TABLE_TEMP_ORDER_DETAILS INNER JOIN PItem ON TABLE_TEMP_ORDER_DETAILS.item_id = ItemId WHERE TABLE_TEMP_ORDER_DETAILS.order_id  = "' +
      app_order_id +
      '"';

    //   initDB().then((db) => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getInsertedsTempOrder = [];
        for (let i = 0; i < results.rows.length; i++) {
          getInsertedsTempOrder.push(results.rows.item(i));
        }
        resolve(getInsertedsTempOrder);
      });
    });
  });
}

export async function insertTABLE_TEMP_ORDER_DETAILSDC(
  order_id: string,
  item_id: string,
  item_Name: string,
  quantity_one: string,
  quantity_two: string,
  small_Unit: string,
  large_Unit: string,
  from_date: string,
  to_date: string,
  rate: string,
  bpc: string,
  Amount: string | number,
  selected_flag: string,
  bottleQty: string,
  BrandId: string,
  entityId: string,
  CollectionType: string,
) {
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        `insert into  TABLE_TEMP_ORDER_DETAILS(order_id,item_id,item_Name,quantity_one ,quantity_two ,
              small_Unit ,large_Unit,from_date,
              to_date ,rate  ,bpc  ,Amount ,selected_flag,bottleQty,BrandId,entityId,CollectionType )
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          String(order_id),
          String(item_id),
          String(item_Name),
          String(quantity_one),
          String(quantity_two),
          String(small_Unit),
          String(large_Unit),
          String(from_date),
          String(to_date),
          String(rate),
          String(bpc),
          String(Amount),
          String(selected_flag),
          String(bottleQty),
          String(BrandId),
          String(entityId),
          String(CollectionType),
        ],
        (tx, results) => {
          resolve(results);
        },
        err => {
          console.error('error=', err);
        },
      );
    });
  });
}
export async function updateTABLE_TEMP_ORDER_DETAILSDC(
  qty_1: string,
  qty_2: string,
  small_Unit: string,
  large_Unit: string,
  from_date: string,
  to_date: string,
  amt: string | number,
  rate: string,
  bottleQty: string,
  order_id: string,
  item_id: string,
) {
  return new Promise(resolve => {
    db1.transaction(tx => {
      //              update TABLE_TEMP_ORDER_DETAILS set quantity_one = '%@',quantity_two = '%@',,from_date = '%@',to_date = '%@', Amount = '%@',rate = '%@' where order_id = '%@' and item_id = '%@'"
      tx.executeSql(
        'UPDATE TABLE_TEMP_ORDER_DETAILS SET quantity_one = ?, quantity_two = ?, small_Unit = ?, large_Unit = ?, from_date = ?, to_date = ?, Amount = ?, rate = ? ,bottleQty = ? WHERE order_id = ? and item_id = ? ',
        [
          String(qty_1),
          String(qty_2),
          String(small_Unit),
          String(large_Unit),
          String(from_date),
          String(to_date),
          String(amt),
          String(rate),
          String(bottleQty),
          String(order_id),
          String(item_id),
        ],
        (tx, results) => {
          resolve(results);
        },
      );
    });
  });
}

export async function deleteRowItemDC(
  order_id: string,
  item_id: string,
  CollectionType: string,
) {
  return new Promise(resolve => {
    let query =
      'DELETE FROM TABLE_TEMP_ORDER_DETAILS where TABLE_TEMP_ORDER_DETAILS.item_id = "' +
      item_id +
      '" and order_id="' +
      order_id +
      '" ';
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        resolve(results);
        // db1.transaction((tx) => {
        //   tx.executeSql('DELETE FROM TABLE_TEMP_ORDER_DETAILS WHERE TABLE_TEMP_ORDER_DETAILS.item_id = ? ', [item_id]).then(([tx, results]) => {

        //     resolve(results);
      });
    });
  });
}
/////////////////////////////////////////////////Reports/////////////////////////////
export async function getClassificationfromDBReport1() {
  return new Promise(resolve => {
    let query = 'Select * from Report where MenuKey ="Report1" ';
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getOrdersFromDb = [];
        for (let i = 0; i < results.rows.length; i++) {
          getOrdersFromDb.push(results.rows.item(0));
        }
        resolve(getOrdersFromDb);
      });
    });
  });
}
export async function getClassificationfromDBReport2() {
  return new Promise(resolve => {
    let query = 'Select * from Report where MenuKey ="Report2" ';
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getOrdersFromDb = [];
        for (let i = 0; i < results.rows.length; i++) {
          getOrdersFromDb.push(results.rows.item(0));
        }
        resolve(getOrdersFromDb);
      });
    });
  });
}

export async function getClassificationfromDBReport3() {
  return new Promise(resolve => {
    let query = 'Select * from Report where MenuKey ="Report3" ';
    db1
      .transaction(tx => {
        tx.executeSql(query, [], (tx, results) => {
          let getOrdersFromDb = [];
          for (let i = 0; i < results.rows.length; i++) {
            getOrdersFromDb.push(results.rows.item(0));
          }
          //console.log("data3"+JSON.stringify(getOrdersFromDb))
          resolve(getOrdersFromDb);
        });
      })
      .then(result => {})
      .catch(err => {});
  });
}

export async function GetAllDistributors() {
  return new Promise(resolve => {
    let query =
      'Select distinct DistributorID,Distributor from PDistributor Order by Distributor asc';
    db1
      .transaction(tx => {
        tx.executeSql(query, [], (tx, results) => {
          let getOrdersFromDb = [];
          for (let i = 0; i < results.rows.length; i++) {
            getOrdersFromDb.push(results.rows.item(0));
          }
          //console.log("data3"+JSON.stringify(getOrdersFromDb))
          resolve(getOrdersFromDb);
        });
      })
      .then(result => {})
      .catch(err => {});
  });
}

export async function getControlId(key: string) {
  return new Promise(resolve => {
    let query =
      'Select ControlId from ReportControlMaster where ReferenceColumn = "' +
      key +
      '" ';
    // console.log('control id query -->', query);
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempDistributor = '';
        for (let i = 0; i < results.rows.length; i++) {
          tempDistributor = results.rows.item(i);
        }
        resolve(tempDistributor);
      });
    });
  });
}
export async function getAllBrandList(ControlId: string, uid: string) {
  return new Promise(resolve => {
    //   let query = 'Select "'+ControlId+'" FROM PItem order by "'+ControlId+'" '
    // let query =
    //   'Select distinct "' +
    //   ControlId +
    //   '","' +
    //   ControlId +
    //   'ID", IsSelectedBrand , IsSelectedBrandProduct FROM PItem order by "' +
    //   ControlId +
    //   '" ';
    let query =
      'Select distinct ' +
      ControlId +
      ' as BRAND,' +
      ControlId +
      'ID as BRANDID, IsSelectedBrand , IsSelectedBrandProduct FROM PItem where userid="' +
      uid +
      '" order by "' +
      ControlId +
      '" ';

    // console.log('q for brands -->', query);
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getOrdersFromDb = [];
        for (let i = 0; i < results.rows.length; i++) {
          getOrdersFromDb.push(results.rows.item(i));
        }

        resolve(getOrdersFromDb);
      });
    });
  });
}

export async function getDefaultUOM() {
  const products = [];
  let query = "select Value from Settings where Key='DefaultUOM'";
  return new Promise(resolve => {
    // initDB().then((db) => {
    db1
      .transaction(tx => {
        tx.executeSql(query, [], (tx, results) => {
          let tempSearchProdect = '';
          for (let i = 0; i < results.rows.length; i++) {
            tempSearchProdect = results.rows.item(i);
          }

          //console.log("tempSearchProdect=", tempSearchProdect)
          resolve(tempSearchProdect);
        });
      })
      .then(result => {
        //
      })
      .catch(err => {
        //console.log(err);
      });
  });
}

export async function getNOOFDECIMAL() {
  const products = [];
  let query = "select Value from Settings where Key='NOOFDECIMAL'";
  return new Promise(resolve => {
    // initDB().then((db) => {
    db1
      .transaction(tx => {
        tx.executeSql(query, [], (tx, results) => {
          let tempSearchProdect = '';
          for (let i = 0; i < results.rows.length; i++) {
            tempSearchProdect = results.rows.item(i);
          }

          //console.log("tempSearchProdect=", tempSearchProdect)
          resolve(tempSearchProdect);
        });
      })
      .then(result => {
        //
      })
      .catch(err => {
        //console.log(err);
      });
  });
}

export async function getUOMList() {
  let query = 'select id, UOMDescription from uommaster';
  // console.log('uom query -->', query);

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempDistributor = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempDistributor.push(results.rows.item(i));
        }
        resolve(tempDistributor);
      });
    });
  });
}

export async function ConversionUOMFormula(default_uom: any) {
  // alert(default_uom)
  // UOMDescription TEXT, ConvToBase TEXT, Formula TEXT, UOMKey TEXT, IsQuantity TEXT, ConversionFormula TEXT,ConversionUomFormula TEXT);');

  let query =
    'Select ConversionUomFormula FROM uommaster where UOMDescription="' +
    default_uom +
    '" ';
  // console.log('3333333333 ---- ' + query);
  return new Promise(resolve => {
    db1
      .transaction(tx => {
        tx.executeSql(query, [], (tx, results) => {
          let tempSearchProdect = '';
          for (let i = 0; i < results.rows.length; i++) {
            tempSearchProdect = results.rows.item(i);
          }

          resolve(tempSearchProdect);
          // console.log('222222222222222 ----- ' + tempSearchProdect);
        });
      })
      .then(result => {})
      .catch(err => {});
  });
}

export async function getsidytd() {
  let query =
    '  select  sum(Quantity/1) as Qty, brand from SalesYTD, pitem ,PDistributor  where  pitem.itemid=SalesYTD.itemid and SalesYTD.distributorid = PDistributor.DistributorID group by  brand order by  BRAND';
  return new Promise(resolve => {
    db1
      .transaction(tx => {
        tx.executeSql(query, [], (tx, results) => {
          let tempSearchProdect = [];
          for (let i = 0; i < results.rows.length; i++) {
            tempSearchProdect[i] = results.rows.item(i);
          }

          resolve(tempSearchProdect);
        });
      })
      .then(result => {})
      .catch(err => {});
  });
}

export async function getDataForQR(scanCode: string) {
  return new Promise<QRPItem[]>((resolve, reject) => {
    let query =
      'SELECT Item, ItemId, BRAND, BRANDID, ITEMSEQUENCE, PTR, BPC, FLAVOUR, DIVISION from PItem where ScanCode ="' +
      scanCode +
      '"';
    // console.log('reewsre--->', scanCode);

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let a = [];
        for (let i = 0; i < results.rows.length; i++) {
          a.push(results.rows.item(i));
        }
        resolve(a);
      });
    });
  });
}

export async function getForAutosync() {
  let query = "select Value from Settings where Key='AUTOSYNC'";
  return new Promise(resolve => {
    // initDB().then((db) => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempSearchProdect = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempSearchProdect.push(results.rows.item(i));
        }
        //  alert(tempSearchProdect)
        //console.log("tempSearchProdect=", tempSearchProdect)
        resolve(tempSearchProdect);
      });
    });
  });
}

export async function getForSyncOnActivity() {
  let query = "select Value from Settings where Key='SyncOnActivity'";
  return new Promise(resolve => {
    // initDB().then((db) => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempSearchProdect = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempSearchProdect.push(results.rows.item(i));
        }
        //  alert(tempSearchProdect)
        //console.log("tempSearchProdect=", tempSearchProdect)
        resolve(tempSearchProdect);
      });
    });
  });
}
export async function getDataForActivity() {
  let query = 'select distinct entity_id from OrderMaster';
  //console.log("q---", query)
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }

        resolve(ImageDetails);
      });
    });
  });
}

//////////////
export async function getDataDiscountMaster(uid: string) {
  let query = 'select DT_DESC from DiscountMaster where userid ="' + uid + '"';
  // console.log('q---', query);
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let DiscountMaster = [];
        for (let i = 0; i < results.rows.length; i++) {
          DiscountMaster.push(results.rows.item(i));
        }
        resolve(DiscountMaster);
      });
    });
  });
}
export async function getDataDistributorMaster() {
  let query = 'select * from MultiEntityUser';
  //console.log("q---", query)
  return new Promise<MultiEntityUserTable[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let MultiEntityUser = [];
        for (let i = 0; i < results.rows.length; i++) {
          MultiEntityUser.push(results.rows.item(i));
        }
        resolve(MultiEntityUser);
      });
    });
  });
}

export async function getDataDistributorMasterFirst(id: number | string) {
  let query = 'select * from MultiEntityUser where UserId ="' + id + '"';
  //console.log("q---", query)
  return new Promise<MultiEntityUserTable[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let MultiEntityUser = [];
        for (let i = 0; i < results.rows.length; i++) {
          MultiEntityUser.push(results.rows.item(i));
        }
        resolve(MultiEntityUser);
      });
    });
  });
}

export async function getMultiDistributorUserId() {
  let query = 'select Userid from MultiEntityUser';
  //console.log("q---", query)
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let MultiEntityUser = [];
        for (let i = 0; i < results.rows.length; i++) {
          MultiEntityUser.push(results.rows.item(i));
        }
        resolve(MultiEntityUser);
      });
    });
  });
}

export async function selectDistForDataCollection(uid: string) {
  return new Promise(resolve => {
    let query =
      'select distinct DistributorID from PDistributor where userid = "' +
      uid +
      '"';

    console.log('selectDistForDataCollection --->', query);
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getOutletInfoDist = [];
        for (let i = 0; i < results.rows.length; i++) {
          getOutletInfoDist.push(results.rows.item(i));
        }
        resolve(getOutletInfoDist);
      });
    });
  });
}
export async function getDataSchemeMaster(id: any) {
  let query = 'select DT_DESC from SchemeMaster where userid = "' + id + '"';
  //console.log("q---", query)
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let SchemeMaster = [];
        for (let i = 0; i < results.rows.length; i++) {
          SchemeMaster.push(results.rows.item(i));
        }
        resolve(SchemeMaster);
      });
    });
  });
}
export async function getClassificationCode(Cid: any, uid: any) {
  let query =
    'select PriceListId from Pcustomer where CustomerId = "' +
    Cid +
    '" and userid = "' +
    uid +
    '" ';
  //console.log("q---", query)
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let getClassificationCode = [];
        for (let i = 0; i < results.rows.length; i++) {
          getClassificationCode.push(results.rows.item(i));
        }
        resolve(getClassificationCode);
      });
    });
  });
}
export async function getPriceForCustomer(Cid: any, Iid: any, uid: any) {
  let query =
    'select price from PriceListClassification where ClassificationId = "' +
    Cid +
    '" and ItemId = "' +
    Iid +
    '" and userid = "' +
    uid +
    '" ';
  // console.log('q--------------------------', query);
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let PriceListClassification = [];
        for (let i = 0; i < results.rows.length; i++) {
          PriceListClassification.push(results.rows.item(i));
        }
        resolve(PriceListClassification);
      });
    });
  });
}

export async function getPriceForPitem(Iid: any, uid: any) {
  let query =
    'select PTR from PItem where ItemId = "' +
    Iid +
    '" and userid = "' +
    uid +
    '" ';
  //console.log("q---", query)
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let DistributorPriceList = [];
        for (let i = 0; i < results.rows.length; i++) {
          DistributorPriceList.push(results.rows.item(i));
        }
        resolve(DistributorPriceList);
      });
    });
  });
}

export async function getGSTFromPitem(Iid: any, uid: any) {
  let query =
    'select GSTRate from PItem where ItemId = "' +
    Iid +
    '" and userid = "' +
    uid +
    '" ';
  console.log('getCGSTAndSGSTFromPitem---', query);
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let DistributorPriceList = [];
        for (let i = 0; i < results.rows.length; i++) {
          DistributorPriceList.push(results.rows.item(i));
        }
        resolve(DistributorPriceList);
      });
    });
  });
}

export async function getitemdataall(app_order_id: string) {
  let query =
    'select * from TABLE_TEMP_ORDER_DETAILS where order_id = ' +
    app_order_id +
    '';
  // console.log('q---', query);
  return new Promise<TABLE_TEMP_ORDER_DETAILS[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let DiscountMaster = [];
        for (let i = 0; i < results.rows.length; i++) {
          DiscountMaster.push(results.rows.item(i));
        }
        resolve(DiscountMaster);
      });
    });
  });
}

export async function getDataSubgroupmasterMaster() {
  let query = 'SELECT * from SubGroupMaster';
  //console.log("q---", query)
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let SubgroupMaster = [];
        for (let i = 0; i < results.rows.length; i++) {
          SubgroupMaster.push(results.rows.item(i));
        }
        resolve(SubgroupMaster);
      });
    });
  });
}

export async function getdatafromcust(entity_id: any, uid: any) {
  let query =
    'select * from Pcustomer where CustomerId= "' +
    entity_id +
    '" and userid = "' +
    uid +
    '"';
  //console.log("q---", query)
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function getdatafromdist(entity_id: any, uid: any) {
  let query =
    'select Distributor as Party,AREA as AREA from PDistributor where DistributorID= "' +
    entity_id +
    '" and userid = "' +
    uid +
    '"';
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function getParentLoginData(userId: any) {
  let query =
    "select Value from Settings where Key='zyleminiparentID' and Value like '%" +
    userId +
    "%'";
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempSearchProdect = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempSearchProdect.push(results.rows.item(i));
        }
        resolve(tempSearchProdect);
      });
    });
  });
}

export async function getPItemForParentLogin() {
  let query = 'select ItemId from PItem ';
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let tempSearchProdect = [];
        for (let i = 0; i < results.rows.length; i++) {
          tempSearchProdect.push(results.rows.item(i));
        }
        resolve(tempSearchProdect);
      });
    });
  });
}

// by Manish
export async function getLatLongInPCustomer(custId: string) {
  let query =
    'SELECT Latitude, Longitude FROM Pcustomer WHERE CustomerId = ' +
    custId +
    '';
  // console.log('q---', query);
  return new Promise<PcustLatLong[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let resultGeo = [];
        for (let i = 0; i < results.rows.length; i++) {
          resultGeo.push(results.rows.item(i));
        }
        resolve(resultGeo);
      });
    });
  });
}

// by Manish
export async function getShopLocationForSync() {
  let query =
    "SELECT CustomerId as ShopId, Latitude, Longitude FROM Pcustomer WHERE Latitude != '' and Latitude != 'null' and Latitude != 'NULL'  and isLatLongSynced ='N'";
  // console.log('q---', query);
  return new Promise<ShopsGelocationBody[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let resultGeo = [];
        for (let i = 0; i < results.rows.length; i++) {
          resultGeo.push(results.rows.item(i));
        }
        resolve(resultGeo);
      });
    });
  });
}

// by Manish
export async function updateLatLongInPCustomer(
  lat: string | number,
  long: string | number,
  isSynced: string,
  custId: string,
) {
  return new Promise(resolve => {
    let query =
      'UPDATE Pcustomer SET Latitude ="' +
      String(lat) +
      '", Longitude = "' +
      String(long) +
      '", isLatLongSynced = "' +
      String(isSynced) +
      '" WHERE CustomerId ="' +
      String(custId) +
      '"';

    // console.log('query -->', query);
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        resolve(results);
      });
    });
  });
}

/* This method will retun the customers with lat long
 */
export async function getLocationOfOutlets(route_id: string) {
  let query =
    "SELECT CustomerId as ShopId, Latitude, Longitude, Party as ShopName FROM Pcustomer WHERE (Latitude!='null' and Latitude != '' and Latitude !='0')  and  RouteID = " +
    route_id +
    '';
  return new Promise<ShopsGelocationBody[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let resultGeo = [];
        for (let i = 0; i < results.rows.length; i++) {
          resultGeo.push(results.rows.item(i));
        }
        resolve(resultGeo);
      });
    });
  });
}

export async function getNewSingleOutletToGeofence(customerId: string) {
  let query =
    "SELECT CustomerId as ShopId, Latitude, Longitude, Party as ShopName, RouteID FROM Pcustomer WHERE (Latitude!='null' and Latitude != '' and Latitude !='0') and  CustomerId = " +
    customerId +
    '';
  return new Promise<ShopsGelocationBody[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let resultGeo = [];
        for (let i = 0; i < results.rows.length; i++) {
          resultGeo.push(results.rows.item(i));
        }
        resolve(resultGeo);
      });
    });
  });
}

export async function deleteImagesOrderMaster() {
  return new Promise(resolve => {
    let query =
      'delete from OrderMaster where sync_flag="N" and collection_type="3"';

    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        resolve(results);
      });
    });
  });
}

export async function sendOrderMaster() {
  let query = 'SELECT * FROM OrderMaster';
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function sendOrderDetails() {
  let query = 'SELECT * from OrderDetails';
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function sendChequeReturnDetails() {
  let query = 'SELECT * from ChequeReturnDetails';
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function sendMJPMaster() {
  let query = 'SELECT * from MJPMaster';
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function sendMeetReport() {
  let query = 'SELECT * from MeetReport';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}
export async function sendOutstandingDetails() {
  let query = 'SELECT * from OutstandingDetails';
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function sendPItem() {
  let query = 'SELECT * from PItem';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function sendPDistributor() {
  let query = 'SELECT * from PDistributor';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}
export async function sendPCustomer() {
  let query = 'SELECT * from Pcustomer';
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function sendReport() {
  let query = 'SELECT * from Report';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function sendReportControlMaster() {
  let query = 'SELECT * from ReportControlMaster';
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function sendSettings() {
  let query = 'SELECT * from Settings';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function sendTABLE_DISCOUNT() {
  let query = 'SELECT * from TABLE_DISCOUNT';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function sendTABLE_TEMP_CategoryDiscountItem() {
  let query = 'SELECT * from TABLE_TEMP_CategoryDiscountItem';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function sendTABLE_TEMP_ImagesDetails() {
  let query = 'SELECT * from TABLE_TEMP_ImagesDetails';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function sendTABLE_TEMP_ORDER_DETAILS() {
  let query = 'SELECT * from TABLE_TEMP_ORDER_DETAILS';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function sendTABLE_TEMP_OrderMaster() {
  let query = 'SELECT * from TABLE_TEMP_OrderMaster';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function sendTEMP_TABLE_DISCOUNT() {
  let query = 'SELECT * from TEMP_TABLE_DISCOUNT';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function sendTX_Collections() {
  let query = 'SELECT * from TX_Collections';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function sendTX_CollectionsDetails() {
  let query = 'SELECT * from TX_CollectionsDetails';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function sendTX_CollectionsDetails_log() {
  let query = 'SELECT * from TX_CollectionsDetails_log';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_TX_Collections_log() {
  let query = 'SELECT * from TX_Collections_log';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_TX_PaymentReceipt() {
  let query = 'SELECT * from TX_PaymentReceipt';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_TX_PaymentReceipt_log() {
  let query = 'SELECT * from TX_PaymentReceipt_log';
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_NewPartyOutlet() {
  let query = 'SELECT * from newpartyoutlet';
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_newpartyImageoutlet() {
  let query = 'SELECT * from newpartyImageoutlet';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_AreaParentList() {
  let query = 'SELECT * from AreaParentList';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_AssetPlacementVerification() {
  let query = 'SELECT * from AssetPlacementVerification';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_AssetTypeClassificationList() {
  let query = 'SELECT * from AssetPlacementVerification';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_CollectionTypes() {
  let query = 'SELECT * from CollectionTypes';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_DiscountMaster() {
  let query = 'SELECT * from DiscountMaster';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_Discounts() {
  let query = 'SELECT * from Discounts';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_DistributorContacts() {
  let query = 'SELECT * from DistributorContacts';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_DistributorDataStatus() {
  let query = 'SELECT * from DistributorDataStatus';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_ImagesDetails() {
  let query = 'SELECT * from ImagesDetails';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_LiveLocationLogs() {
  let query = 'SELECT * from LiveLocationLogs';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_MJPMasterDetails() {
  let query = 'SELECT * from MJPMasterDetails';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_MultiEntityUser() {
  let query = 'SELECT * from MultiEntityUser';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_OnlineParentArea() {
  let query = 'SELECT * from OnlineParentArea';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_OutletAssetInformation() {
  let query = 'SELECT * from OutletAssetInformation';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_PJPMaster() {
  let query = 'SELECT * from PJPMaster';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_PendingOrdersDetails() {
  let query = 'SELECT * from PendingOrdersDetails';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_PendingOrdersDiscount() {
  let query = 'SELECT * from PendingOrdersDiscount';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_PendingOrdersMaster() {
  let query = 'SELECT * from PendingOrdersMaster';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_PriceListClassification() {
  let query = 'SELECT * from PriceListClassification';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_Receipt() {
  let query = 'SELECT * from Receipt';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_Resources() {
  let query = 'SELECT * from Resources';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_SIPREPORT() {
  let query = 'SELECT * from SIPREPORT';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_Sales() {
  let query = 'SELECT * from Sales';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_SalesYTD() {
  let query = 'SELECT * from SalesYTD';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_SchemeDetails() {
  let query = 'SELECT * from SchemeDetails';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_SchemeMaster() {
  let query = 'SELECT * from SchemeMaster';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_SubGroupMaster() {
  let query = 'SELECT * from SubGroupMaster';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_SurveyMaster() {
  let query = 'SELECT * from SurveyMaster';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_Target() {
  let query = 'SELECT * from Target';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_TempOutstandingDetails() {
  let query = 'SELECT * from TempOutstandingDetails';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_VW_PendingOrders() {
  let query = 'SELECT * from VW_PendingOrders';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_table_user() {
  let query = 'SELECT * from table_user';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_uommaster() {
  let query = 'SELECT * from uommaster';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_user() {
  let query = 'SELECT * from user';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

export async function send_uses_log() {
  let query = 'SELECT * from uses_log';

  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let ImageDetails = [];
        for (let i = 0; i < results.rows.length; i++) {
          ImageDetails.push(results.rows.item(i));
        }
        resolve(ImageDetails);
      });
    });
  });
}

//Shankar changes 29/08/2024
export async function GetCreditdaysCreditLimit(PartyCode: string) {
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        // "SELECT * FROM OutstandingDetails where PartyCode='" +
        //     PartyCode +
        //     "' and OSAmount > 0",
        "SELECT CreditLimit,CreditDays from Pcustomer WHERE CustomerId = '" +
          PartyCode +
          "' ",
        [],
        (tx, results) => {
          // tx.executeSql("SELECT * FROM OutstandingDetails where VhrNo='" + VhrNo +"'", [], (tx, results) => {
          let temp = [];
          for (let i = 0; i < results.rows.length; i++) {
            temp.push(results.rows.item(i));
          }
          resolve(temp);
        },
      );
    });
  });
}
export async function insertLiveLocation(liveLocation: LocationMaster) {
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        `insert into LiveLocationLogs(UserID ,LocationTakenDateTime ,Latitude ,Longitude ,SyncFlag) VALUES (?,?,?,?,?)`,
        [
          String(liveLocation.UserId),
          String(liveLocation.LocationTakenDateTime),
          String(liveLocation.latitude),
          String(liveLocation.longitude),
          String('N'),
        ],
        (tx, results) => {
          console.error('in catch -results', results);
          resolve(results);
        },
        err => {
          console.error('error LiveLocation=', err);
        },
      );
    });
  });
}
export async function delete_ZyleminiNewParty(Data2: any) {
  return new Promise((resolve, reject) => {
    db1.transaction(
      tx => {
        const filteredValues = Data2.filter(
          (item: {TargetId: null}) => item.TargetId !== null,
        ).map((item: {MobileGenPrimaryKey: any}) => item.MobileGenPrimaryKey);

        // console.log('filteredValues:', filteredValues);

        const deletePromises = filteredValues.map((item1: any) => {
          return new Promise((resolveDelete, rejectDelete) => {
            console.log('filtered Values inside loop  ', item1);
            tx.executeSql(
              'DELETE FROM newpartyoutlet WHERE OrderID = ?',
              [item1], // Remove String() conversion if OrderID is numeric
              (tx, results) => {
                if (results.rowsAffected > 0) {
                  console.log(
                    `Deleted ${results.rowsAffected} row(s) for OrderId:`,
                    item1,
                  );
                  resolveDelete(results);
                } else {
                  console.warn(`No rows deleted for OrderId: ${item1}`);
                  resolveDelete(null); // Don't reject, just resolve with null
                }
              },
              (tx, error) => {
                console.error('Error during deletion:', error);
                rejectDelete(error);
              },
            );
          });
        });

        Promise.all(deletePromises)
          .then(results => {
            const successfulDeletes = results.filter(result => result !== null);
            console.log(
              `Successfully deleted ${successfulDeletes.length} out of ${filteredValues.length} entries`,
            );
            resolve(successfulDeletes);
          })
          .catch(error => {
            console.error('Error in delete operation:', error);
            reject(error);
          });
      })
      .catch((transactionError: any) => {
        console.error('Transaction error:', transactionError);
        reject(transactionError);
      });
  });
}

export async function getLiveLocationToSync() {
  let query =
    "SELECT UserID as UserId, LocationTakenDateTime as LocationTakenDateTime, Latitude as latitude, Longitude as longitude FROM LiveLocationLogs WHERE SyncFlag ='N'";
  return new Promise<LocationMaster[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let locationMasterList = [];
        for (let i = 0; i < results.rows.length; i++) {
          locationMasterList.push(results.rows.item(i));
        }
        resolve(locationMasterList);
      });
    });
  });
}

export async function deleteLiveLocationPostSyncRecords() {
  return new Promise(resolve => {
    let query = 'DELETE FROM LiveLocationLogs';
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        resolve(results);
      });
    });
  });
}

export async function getCountOfActivityAddedForTheDay(date: string) {
  let query =
    'select count(*) as count from OrderMaster where from_date = "' +
    date +
    '" ';
  return new Promise<number>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let currentCount = '0';
        currentCount = results.rows?.item(0)?.count;
        resolve(Number(currentCount));
      });
    });
  });
}

export async function getOrderidforImageSync() {
  let query =
    "select id from OrderMaster where collection_type='3' and sync_flag='N'";
  return new Promise<IdFromOMaster[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let syncArray = [];
        for (let i = 0; i < results.rows.length; i++) {
          syncArray.push(results.rows.item(i));
        }
        resolve(syncArray);
      });
    });
  });
}
export async function getOrderidforNewPartyImageSync() {
  let query =
    "select newpartyImageoutlet.OrderID from newpartyImageoutlet,newpartyoutlet where newpartyoutlet.Is_Sync='N'";
  return new Promise<IdFromOMaster[]>(resolve => {
    db1.transaction(tx => {
      tx.executeSql(query, [], (tx, results) => {
        let syncArray = [];
        for (let i = 0; i < results.rows.length; i++) {
          syncArray.push(results.rows.item(i));
        }
        resolve(syncArray);
      });
    });
  });
}

export async function getNewPartyImageDetailsyncData2(data: any) {
  let ImageDetails: any = [];
  //console.log("q---", query)
  return new Promise(resolve => {
    db1.transaction(tx => {
      for (let item1 of data) {
        tx.executeSql(
          "select id as ID, OrderID as id,ImageName as ImageName,ImagePath as ImagePath,Is_Sync as sync_data,ShopId  from newpartyImageoutlet where Is_Sync= 'N' and OrderID='" +
            item1 +
            "'",
          [],
          (tx, results) => {
            for (let i = 0; i < results.rows.length; i++) {
              if (results.rows.item(i) != undefined) {
                ImageDetails.push(results.rows.item(i));
                console.log(
                  'THIS IS INSIDE QUERY >>>>>>>>>>>>>>>>>>>',
                  results.rows.item(i),
                );
              }
            }

            resolve(ImageDetails);
          },
        );
      }
    });
  });
}

export async function getOrderMasterSyncDataForImage() {
  //id,Current_date_time ,entity_type,entity_id ,latitude ,longitude ,total_amount ,from_date ,to_date ,collection_type ,user_id ,remark,selected_flag ,sync_flag ,check_date,DefaultDistributorId,ExpectedDeliveryDate
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        "select id as ID,entity_type as EntityType,entity_id as EntityID ,latitude as Latitude ,longitude as Longitude ,total_amount as TotalAmount ,from_date as FromDate ,to_date as ToDate ,collection_type as CollectionType ,user_id as UserID ,remark as Remarks,Current_date_time as CurrentDatetime,DefaultDistributorId as DefaultDistributorId,ExpectedDeliveryDate as ExpectedDeliveryDate,ActivityStatus as ActivityStatus,ActivityStart as ActivityStartTime,ActivityEnd as ActivityEndTime from OrderMaster where collection_type='3' and sync_flag='N'",
        [],
        (tx, results) => {
          let OrderMaster = [];
          for (let i = 0; i < results.rows.length; i++) {
            OrderMaster.push(results.rows.item(i));
          }
          //return OrderMaster
          resolve(OrderMaster);
        },
      );
    });
  });
}

export async function getBankNames(partyCode: string): Promise<Bank[]> {
  return new Promise(resolve => {
    db1.transaction(tx => {
      tx.executeSql(
        "select BankName as BANKNAME,BankPriority as PRIORITY from RO_BankCustomer where CustomerId='" +
          partyCode +
          "'",
        [],
        (tx, results) => {
          var bank_list: Bank[] = [];
          for (let i = 0; i < results.rows.length; i++) {
            bank_list.push(results.rows.item(i));
          }
          resolve(bank_list);
        },
      );
    });
  });
}

export async function deleteAllTables(): Promise<Boolean> {
  return new Promise((resolve, reject) => {
    db1.transaction(tx => {
      // 1. Get list of tables
      tx.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'android_metadata';",
        [],
        (tx, results) => {
          const tables = [];
          for (let i = 0; i < results.rows.length; i++) {
            tables.push(results.rows.item(i).name);
          }

          // 2. Iterate and delete
          tables.forEach(tbl => {
            console.log(
              'ðŸ”¥performDeleteDbData DELETE: start',
              `DELETE FROM ${tbl};`,
            );

            tx.executeSql(`DELETE FROM ${tbl};`);
          });

          resolve(true);
        },
        error => reject(error),
      );
    });
  });
}

// ==========================================
// MISSING SYNC FUNCTIONS FOR useSyncNow
// ==========================================

/**
 * Check if new party exists in database
 */
export async function checkNewPartyExists(): Promise<boolean> {
  return new Promise((resolve) => {
    db1.transaction(tx => {
      tx.executeSql(
        "SELECT COUNT(*) as count FROM newpartyoutlet WHERE Is_Sync='N'",
        [],
        (tx, results) => {
          const count = results.rows.item(0)?.count || 0;
          resolve(count > 0);
        },
        (tx, error) => {
          console.error('Error checking new party:', error);
          resolve(false);
        },
      );
    });
  });
}

/**
 * Get new party sync data (alias for getNewPartyOutletSyncData)
 */
export async function getNewPartySyncData() {
  return getNewPartyOutletSyncData();
}

/**
 * Get collection sync data (alias for getCollectionsSyncData)
 */
export async function getCollectionSyncData() {
  return getCollectionsSyncData();
}

/**
 * Get payment sync data (alias for getPaymentReceiptSyncData)
 */
export async function getPaymentSyncData() {
  return getPaymentReceiptSyncData();
}

/**
 * Get meeting sync data
 */
export async function getMeetingSyncData() {
  return new Promise((resolve) => {
    db1.transaction(tx => {
      tx.executeSql(
        "SELECT ID, Type_sync as EntityType, Shop_Id as EntityID, PlannedDate as FromDate, PlannedDate as ToDate, Remarks || ' ' || location as Remark, collection_type as CollectionType, latitude as Latitude, longitude as Longitude, TotalAmount as TotalAmount, UserID as UserID, CurrentDatetime as CurrentDatetime, DefaultDistributorId as DefaultDistributorId, ExpectedDeliveryDate as ExpectedDeliveryDate FROM MeetReport WHERE IsActivityDone='false' AND Is_Sync='N'",
        [],
        (tx, results) => {
          let meetings: any = [];
          for (let i = 0; i < results.rows.length; i++) {
            meetings.push(results.rows.item(i));
          }
          resolve(meetings);
        },
        (tx, error) => {
          console.error('Error getting meeting sync data:', error);
          resolve([]);
        },
      );
    });
  });
}

/**
 * Mark order data as synced
 */
export async function markDataAsSynced(orderIds: any[]): Promise<void> {
  if (!orderIds || orderIds.length === 0) return;
  
  return new Promise((resolve, reject) => {
    db1.transaction(tx => {
      const placeholders = orderIds.map(() => '?').join(',');
      tx.executeSql(
        `UPDATE OrderMaster SET sync_flag='Y' WHERE id IN (${placeholders})`,
        orderIds,
        (tx, results) => {
          console.log(`Marked ${results.rowsAffected} orders as synced`);
          resolve();
        },
        (tx, error) => {
          console.error('Error marking orders as synced:', error);
          reject(error);
        },
      );
    });
  });
}

/**
 * Mark collections as synced
 */
export async function markCollectionsAsSynced(collectionIds: any[]): Promise<void> {
  if (!collectionIds || collectionIds.length === 0) return;
  
  return new Promise((resolve, reject) => {
    db1.transaction(tx => {
      const placeholders = collectionIds.map(() => '?').join(',');
      tx.executeSql(
        `UPDATE TX_Collections SET Is_Sync='Y' WHERE MobileGenPrimaryKey IN (${placeholders})`,
        collectionIds,
        (tx, results) => {
          console.log(`Marked ${results.rowsAffected} collections as synced`);
          resolve();
        },
        (tx, error) => {
          console.error('Error marking collections as synced:', error);
          reject(error);
        },
      );
    });
  });
}

/**
 * Mark payments as synced
 */
export async function markPaymentsAsSynced(paymentIds: any[]): Promise<void> {
  if (!paymentIds || paymentIds.length === 0) return;
  
  return new Promise((resolve, reject) => {
    db1.transaction(tx => {
      const placeholders = paymentIds.map(() => '?').join(',');
      tx.executeSql(
        `UPDATE TX_PaymentReceipt SET Is_Sync='Y' WHERE ID IN (${placeholders})`,
        paymentIds,
        (tx, results) => {
          console.log(`Marked ${results.rowsAffected} payments as synced`);
          resolve();
        },
        (tx, error) => {
          console.error('Error marking payments as synced:', error);
          reject(error);
        },
      );
    });
  });
}

/**
 * Mark meetings as synced
 */
export async function markMeetingsAsSynced(meetingIds: any[]): Promise<void> {
  if (!meetingIds || meetingIds.length === 0) return;
  
  return new Promise((resolve, reject) => {
    db1.transaction(tx => {
      const placeholders = meetingIds.map(() => '?').join(',');
      tx.executeSql(
        `UPDATE MeetReport SET Is_Sync='Y' WHERE ID IN (${placeholders})`,
        meetingIds,
        (tx, results) => {
          console.log(`Marked ${results.rowsAffected} meetings as synced`);
          resolve();
        },
        (tx, error) => {
          console.error('Error marking meetings as synced:', error);
          reject(error);
        },
      );
    });
  });
}

/**
 * Get sync counts for all data types
 */
export async function getSyncCounts(): Promise<{
  orders: number;
  newParties: number;
  collections: number;
  payments: number;
  meetings: number;
  total: number;
}> {
  return new Promise((resolve) => {
    db1.transaction(tx => {
      let orders = 0;
      let newParties = 0;
      let collections = 0;
      let payments = 0;
      let meetings = 0;
      let completed = 0;
      const totalQueries = 5;

      const checkComplete = () => {
        completed++;
        if (completed === totalQueries) {
          resolve({
            orders,
            newParties,
            collections,
            payments,
            meetings,
            total: orders + newParties + collections + payments + meetings,
          });
        }
      };

      // Count orders
      tx.executeSql(
        "SELECT COUNT(*) as count FROM OrderMaster WHERE sync_flag='N'",
        [],
        (tx, results) => {
          orders = results.rows.item(0)?.count || 0;
          checkComplete();
        },
        () => checkComplete(),
      );

      // Count new parties
      tx.executeSql(
        "SELECT COUNT(*) as count FROM newpartyoutlet WHERE Is_Sync='N'",
        [],
        (tx, results) => {
          newParties = results.rows.item(0)?.count || 0;
          checkComplete();
        },
        () => checkComplete(),
      );

      // Count collections
      tx.executeSql(
        "SELECT COUNT(*) as count FROM TX_Collections WHERE Is_Sync='N'",
        [],
        (tx, results) => {
          collections = results.rows.item(0)?.count || 0;
          checkComplete();
        },
        () => checkComplete(),
      );

      // Count payments
      tx.executeSql(
        "SELECT COUNT(*) as count FROM TX_PaymentReceipt WHERE Is_Sync='N'",
        [],
        (tx, results) => {
          payments = results.rows.item(0)?.count || 0;
          checkComplete();
        },
        () => checkComplete(),
      );

      // Count meetings
      tx.executeSql(
        "SELECT COUNT(*) as count FROM MeetReport WHERE Is_Sync='N'",
        [],
        (tx, results) => {
          meetings = results.rows.item(0)?.count || 0;
          checkComplete();
        },
        () => checkComplete(),
      );
    });
  });
}
