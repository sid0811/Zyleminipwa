import {writeErrorLog} from '../../utility/utils';
import {processImageDataWithBatching, cleanupImagesAfterSync} from '../../utility/imageProcessingUtils';
import {
  send_newpartyImageoutlet,
  send_NewPartyOutlet,
  send_TX_PaymentReceipt_log,
  send_TX_PaymentReceipt,
  send_TX_Collections_log,
  sendTX_CollectionsDetails_log,
  sendTX_CollectionsDetails,
  sendTX_Collections,
  sendTEMP_TABLE_DISCOUNT,
  sendTABLE_TEMP_OrderMaster,
  sendTABLE_TEMP_ORDER_DETAILS,
  sendTABLE_TEMP_ImagesDetails,
  sendTABLE_TEMP_CategoryDiscountItem,
  sendTABLE_DISCOUNT,
  sendSettings,
  sendReportControlMaster,
  sendReport,
  sendPCustomer,
  sendPDistributor,
  sendPItem,
  sendOutstandingDetails,
  sendMeetReport,
  sendMJPMaster,
  sendChequeReturnDetails,
  sendOrderDetails,
  sendOrderMaster,
  send_AreaParentList,
  send_AssetPlacementVerification,
  send_AssetTypeClassificationList,
  send_CollectionTypes,
  send_DiscountMaster,
  send_Discounts,
  send_DistributorContacts,
  send_DistributorDataStatus,
  send_ImagesDetails,
  send_LiveLocationLogs,
  send_MJPMasterDetails,
  send_MultiEntityUser,
  send_OnlineParentArea,
  send_OutletAssetInformation,
  send_PJPMaster,
  send_PendingOrdersDetails,
  send_PendingOrdersDiscount,
  send_PendingOrdersMaster,
  send_PriceListClassification,
  send_Receipt,
  send_Resources,
  send_SIPREPORT,
  send_Sales,
  send_SalesYTD,
  send_SchemeDetails,
  send_SchemeMaster,
  send_SubGroupMaster,
  send_SurveyMaster,
  send_Target,
  send_TempOutstandingDetails,
  send_VW_PendingOrders,
  send_table_user,
  send_uommaster,
  send_user,
  send_uses_log,
  getImageDetailsyncData,
  getNewPartyImageDetailsyncData,
  updateOrderMasterSyncFlag,
  updateOrderDetailSyncFlag,
  updateimageDetailSyncFlag,
  updateNewPartyOutletSyncFlag,
  updateNewPartyImageDetailSyncFlag,
} from '../../database/SqlDatabase';

import {dataReportObjectKeys} from '../../utility/utils';
import {API_ENDPOINTS} from '../../constants/APIEndPoints';
import createApiClient from '../../api/Client';

const keyMap = [
  'NewPartyImageOutlet',
  'NewParty',
  'PaymentReceiptLog',
  'PaymentReceipt',
  'CollectionsLog',
  'CollectionsDetailsLog',
  'CollectionsDetails',
  'Collections',
  'DiscountTemp',
  'OrderMasterTemp',
  'OrderDetailsTemp',
  'ImageDetails',
  'CategoryDiscountItem',
  'Discount',
  'Settings',
  'ReportControlMaster',
  'Report',
  'Customer',
  'Distributor',
  'PItem',
  'OutstandingDetails',
  'MeetReport',
  'MJPMaster',
  'ChequeReturnDetails',
  'OrderDetails',
  'OrderMaster',
  'AreaParentList',
  'AssetPlacementVerification',
  'AssetTypeClassificationList',
  'CollectionTypes',
  'DiscountMaster',
  'Discounts',
  'DistributorContacts',
  'DistributorDataStatus',
  'ImagesDetails',
  'LiveLocationLogs',
  'MJPMasterDetails',
  'MultiEntityUser',
  'OnlineParentArea',
  'OutletAssetInformation',
  'PJPMaster',
  'PendingOrdersDetails',
  'PendingOrdersDiscount',
  'PendingOrdersMaster',
  'PriceListClassification',
  'Receipt',
  'Resources',
  'SIPREPORT',
  'Sales',
  'SalesYTD',
  'SchemeDetails',
  'SchemeMaster',
  'SubGroupMaster',
  'SurveyMaster',
  'Target',
  'TempOutstandingDetails',
  'VW_PendingOrders',
  'table_user',
  'uommaster',
  'user',
  'uses_log',
];

// Enhanced configuration constants for full database sync
const FULL_DB_BATCH_SIZE = 10; // Process 10 data types per batch
const MAX_RETRY_ATTEMPTS = 3;
const BATCH_DELAY = 2000; // 2 seconds between batches
const SYNC_TIMEOUT = 60000; // 60 seconds per batch
const JSON_SIZE_THRESHOLD_MB = 20; // Size threshold for batch strategy

// Utility function to calculate JSON size
const calculateJsonSizeInMB = (jsonObject: any): number => {
  try {
    const jsonString = JSON.stringify(jsonObject);
    const sizeInBytes = new Blob([jsonString]).size;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    return parseFloat(sizeInMB.toFixed(2));
  } catch (error) {
    console.error('Error calculating JSON size:', error);
    return 0;
  }
};

// Split data collection functions into batches
const splitDataCollectionIntoBatches = (dataFunctions: Function[], batchSize: number) => {
  const batches: Function[][] = [];
  for (let i = 0; i < dataFunctions.length; i += batchSize) {
    batches.push(dataFunctions.slice(i, i + batchSize));
  }
  return batches;
};

export const syncAndUploadFullDatabase = async (
  userId: string,
  userCredentials?: {
    enteredUserName: string;
    userPassword: string; 
    savedClientCode: string;
    deviceId: string;
  }
) => {
  console.log('🚀 Starting Enhanced Full Database Sync with Batching');
  console.log(`📊 Configuration: Batch size: ${FULL_DB_BATCH_SIZE}, Timeout: ${SYNC_TIMEOUT}ms, Threshold: ${JSON_SIZE_THRESHOLD_MB}MB`);

  // Define all data collection functions
  const allDataFunctions = [
    send_newpartyImageoutlet,
    send_NewPartyOutlet,
    send_TX_PaymentReceipt_log,
    send_TX_PaymentReceipt,
    send_TX_Collections_log,
    sendTX_CollectionsDetails_log,
    sendTX_CollectionsDetails,
    sendTX_Collections,
    sendTEMP_TABLE_DISCOUNT,
    sendTABLE_TEMP_OrderMaster,
    sendTABLE_TEMP_ORDER_DETAILS,
    sendTABLE_TEMP_ImagesDetails,
    sendTABLE_TEMP_CategoryDiscountItem,
    sendTABLE_DISCOUNT,
    sendSettings,
    sendReportControlMaster,
    sendReport,
    sendPCustomer,
    sendPDistributor,
    sendPItem,
    sendOutstandingDetails,
    sendMeetReport,
    sendMJPMaster,
    sendChequeReturnDetails,
    sendOrderDetails,
    sendOrderMaster,
    send_AreaParentList,
    send_AssetPlacementVerification,
    send_AssetTypeClassificationList,
    send_CollectionTypes,
    send_DiscountMaster,
    send_Discounts,
    send_DistributorContacts,
    send_DistributorDataStatus,
    send_ImagesDetails,
    send_LiveLocationLogs,
    send_MJPMasterDetails,
    send_MultiEntityUser,
    send_OnlineParentArea,
    send_OutletAssetInformation,
    send_PJPMaster,
    send_PendingOrdersDetails,
    send_PendingOrdersDiscount,
    send_PendingOrdersMaster,
    send_PriceListClassification,
    send_Receipt,
    send_Resources,
    send_SIPREPORT,
    send_Sales,
    send_SalesYTD,
    send_SchemeDetails,
    send_SchemeMaster,
    send_SubGroupMaster,
    send_SurveyMaster,
    send_Target,
    send_TempOutstandingDetails,
    send_VW_PendingOrders,
    send_table_user,
    send_uommaster,
    send_user,
    send_uses_log,
  ];

  console.log(`📊 Total data functions to process: ${allDataFunctions.length}`);

  let allCollectedData: Record<string, any> = {};
  let totalProcessedCount = 0;

  try {
    // First, collect all data with batching for performance
    console.log('🔄 Phase 1: Collecting data from database with batching...');
    const dataFunctionBatches = splitDataCollectionIntoBatches(allDataFunctions, FULL_DB_BATCH_SIZE);
    
    for (let batchIndex = 0; batchIndex < dataFunctionBatches.length; batchIndex++) {
      const batch = dataFunctionBatches[batchIndex];
      console.log(`📦 Processing data collection batch ${batchIndex + 1}/${dataFunctionBatches.length} (${batch.length} functions)`);
      
      try {
        // Execute batch with timeout protection
        const batchPromises = batch.map(func => Promise.race([
          func(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Data collection timeout for function`)), SYNC_TIMEOUT)
          )
        ]));
        
        const results = await Promise.allSettled(batchPromises);
        
        // Process batch results
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          const functionIndex = batchIndex * FULL_DB_BATCH_SIZE + i;
          const key = keyMap[functionIndex];
          
          if (result.status === 'fulfilled') {
            try {
              if (key === 'ImageDetails' && Array.isArray(result.value) && result.value.length > 0) {
                console.log(`📸 Found ${result.value.length} image details - processing with intelligent batching...`);
                // Store raw image data for later processing - will be processed separately with our utility
                allCollectedData[dataReportObjectKeys.ImageDetails] = result.value;
              } else if (Array.isArray(result.value) && result.value.length > 0) {
                allCollectedData[dataReportObjectKeys[key as keyof typeof dataReportObjectKeys]] = result.value;
                console.log(`✅ ${key}: ${result.value.length} records collected`);
              } else {
                console.log(`ℹ️ ${key}: No data to collect`);
              }
              totalProcessedCount++;
            } catch (processingError) {
              console.error(`❌ Error processing ${key}:`, processingError);
              writeErrorLog(`Processing error for ${key}`, processingError);
            }
          } else {
            console.error(`❌ ${key} failed:`, result.reason);
            writeErrorLog(`Data collection failed for ${key}`, result.reason);
          }
        }
        
        // Add delay between batches
        if (batchIndex < dataFunctionBatches.length - 1) {
          console.log(`⏳ Waiting ${BATCH_DELAY}ms before next batch...`);
          await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
        }
        
      } catch (batchError) {
        console.error(`❌ Batch ${batchIndex + 1} failed:`, batchError);
        writeErrorLog(`Data collection batch ${batchIndex + 1} failed`, batchError);
        // Continue with next batch
      }
    }

    console.log(`✅ Data collection completed: ${totalProcessedCount} data types processed`);
    console.log(`📊 Collected data keys: ${Object.keys(allCollectedData)}`);

    // Check if we have any data to sync
    if (Object.keys(allCollectedData).length === 0) {
      console.log('ℹ️ No data found to sync');
      return;
    }

    // Process images using our intelligent batching utility (full database sync = no MGK filtering)
    console.log('🖼️ Processing images for full database sync with intelligent batching...');
    try {
      const imageProcessingResult = await processImageDataWithBatching(); // No MGK keys = get all images
      
      // Replace raw image data with processed base64 images
      if (imageProcessingResult.data.ImageDetails) {
        allCollectedData[dataReportObjectKeys.ImageDetails] = imageProcessingResult.data.ImageDetails;
        console.log(`✅ Processed ${imageProcessingResult.data.ImageDetails.length} ImageDetails`);
      }
      if (imageProcessingResult.data.NewPartyImage) {
        allCollectedData[dataReportObjectKeys.NewPartyImage] = imageProcessingResult.data.NewPartyImage;
        console.log(`✅ Processed ${imageProcessingResult.data.NewPartyImage.length} NewPartyImages`);
      }
      
      console.log(`📊 Image processing completed. Should batch: ${imageProcessingResult.shouldBatch}, Estimated size: ${imageProcessingResult.estimatedSizeMB}MB`);
    } catch (error) {
      console.error('❌ Error processing images in full database sync:', error);
      writeErrorLog('Image processing error in syncAndUploadFullDatabase', error);
    }

    // Calculate total data size AFTER image processing (with base64 data)
    const totalDataSizeMB = calculateJsonSizeInMB(allCollectedData);
    console.log(`📊 Total data size after image processing: ${totalDataSizeMB} MB`);

    // Phase 2: Intelligent sync strategy based on data size
    console.log('🔄 Phase 2: Determining sync strategy...');
    
    if (totalDataSizeMB > JSON_SIZE_THRESHOLD_MB) {
      console.log(`🚀 Large dataset detected (${totalDataSizeMB} MB > ${JSON_SIZE_THRESHOLD_MB} MB). Using batch sync strategy.`);
      await processFullDatabaseInBatches(allCollectedData, userId, userCredentials);
    } else {
      console.log(`🚀 Normal dataset size (${totalDataSizeMB} MB). Using single sync strategy.`);
      await processSingleFullDatabaseSync(allCollectedData, userId, userCredentials);
    }

    } catch (error) {
    console.error('❌ Critical error in full database sync:', error);
    writeErrorLog('syncAndUploadFullDatabase critical error', error);
  }
};

// Helper function for processing single full database sync
const processSingleFullDatabaseSync = async (
  collectedData: Record<string, any>,
  userId: string,
  userCredentials?: {
    enteredUserName: string;
    userPassword: string; 
    savedClientCode: string;
    deviceId: string;
  }
) => {
  console.log('🔄 Processing single full database sync...');
  
  try {
    const apiClient = await createApiClient();
    const authPayload = {
      LoginId: userCredentials?.enteredUserName || 'system',
      Password: userCredentials?.userPassword || '',
      ClientCode: userCredentials?.savedClientCode || '',
      DeviceId: userCredentials?.deviceId || userId,
    };
    
    // Get auth token
    console.log('🔐 Getting auth token for full database sync...');
    const tokenResponse = await apiClient.post('/api/postAuthToken', authPayload);
    const token = tokenResponse.data?.Token;
    
    if (!token) {
      throw new Error('Failed to obtain authentication token');
    }
    
    console.log('✅ Auth token received for full database sync');
    console.log('🚀 POST REQUEST: Starting single full database sync...');
    console.log('📊 Data keys being synced:', Object.keys(collectedData));
    
    const response = await apiClient.post('/api/postData', collectedData, {
      headers: {
        'Content-Type': 'application/json',
        'authheader': token,
      },
    });
    
    console.log('✅ POST RESPONSE: Single full database sync completed');
    console.log('📈 Response status:', response.status);
    
    // Process response and update sync flags
    await processFullDatabaseSyncResponse(response.data, userId);
    
  } catch (error) {
    console.error('❌ Single full database sync failed:', error);
    await handleFullDatabaseSyncError(error, collectedData, userId, 'SingleFullDatabase');
  }
};

// Helper function for processing full database in batches
const processFullDatabaseInBatches = async (
  collectedData: Record<string, any>,
  userId: string,
  userCredentials?: {
    enteredUserName: string;
    userPassword: string; 
    savedClientCode: string;
    deviceId: string;
  }
) => {
  console.log('🔄 Processing full database in batches...');
  
  const dataKeys = Object.keys(collectedData);
  const SYNC_BATCH_SIZE = 5; // Sync 5 data types per batch
  const syncBatches = [];
  
  // Split collected data into sync batches
  for (let i = 0; i < dataKeys.length; i += SYNC_BATCH_SIZE) {
    const batchKeys = dataKeys.slice(i, i + SYNC_BATCH_SIZE);
    const batchData: Record<string, any> = {};
    
    batchKeys.forEach(key => {
      batchData[key] = collectedData[key];
    });
    
    syncBatches.push(batchData);
  }
  
  console.log(`📦 Split data into ${syncBatches.length} sync batches`);
  
  let allSavedData: any[] = [];
  let allNotSavedData: any[] = [];
  let successfulBatches = 0;
  
  try {
    const apiClient = await createApiClient();
    const authPayload = {
      LoginId: userCredentials?.enteredUserName || 'system',
      Password: userCredentials?.userPassword || '',
      ClientCode: userCredentials?.savedClientCode || '',
      DeviceId: userCredentials?.deviceId || userId,
    };
    
    for (let batchIndex = 0; batchIndex < syncBatches.length; batchIndex++) {
      const batchData = syncBatches[batchIndex];
      let batchSuccess = false;
      
      console.log(`📦 Processing sync batch ${batchIndex + 1}/${syncBatches.length}`);
      console.log(`📊 Batch data keys: ${Object.keys(batchData)}`);
      
      // Retry logic for each batch
      for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
        try {
          console.log(`🔐 Getting fresh auth token for batch ${batchIndex + 1}, attempt ${attempt}...`);
          
          // Add delay before auth request to prevent server overload
          if (attempt > 1 || batchIndex > 0) {
            console.log('⏳ Brief delay before auth request for connection stability...');
            await new Promise(resolve => setTimeout(resolve, 800));
          }
          
          const tokenResponse = await apiClient.post('/api/postAuthToken', authPayload);
          const token = tokenResponse.data?.Token;
          
          if (!token) {
            throw new Error('Failed to obtain authentication token');
          }
          
          console.log(`✅ Auth token received for batch ${batchIndex + 1}`);
          
          const batchSizeMB = calculateJsonSizeInMB(batchData);
          console.log(`📊 Batch ${batchIndex + 1} size: ${batchSizeMB} MB`);
          
          const response = await apiClient.post('/api/postData', batchData, {
            headers: {
              'Content-Type': 'application/json',
              'authheader': token,
            },
          });
          
          console.log(`✅ Batch ${batchIndex + 1} sync completed`);
          
          // Process response with alternative format handling
          let responseData = response.data?.Data || response.data?.data || response.data;
          
          // Check for alternative response format
          if (responseData?.code !== undefined && responseData?.message !== undefined) {
            console.log(`📋 [Batch ${batchIndex + 1}] Alternative response format detected`);
            console.log('📊 Response code:', responseData.code, 'Message:', responseData.message);
            
            // For alternative format, consider successful if code is 200
            if (responseData.code === 200 || responseData.code === '200') {
              console.log(`✅ [Batch ${batchIndex + 1}] Alternative format - sync successful`);
              // No SavedData to accumulate, but batch is successful
            } else {
              console.log(`❌ [Batch ${batchIndex + 1}] Alternative format - sync failed`);
              throw new Error(`Batch sync failed: ${responseData.message}`);
            }
          } else {
            // Standard format handling
            if (responseData.SavedData && Array.isArray(responseData.SavedData)) {
              allSavedData = [...allSavedData, ...responseData.SavedData];
            }
            if (responseData.NotSavedData && Array.isArray(responseData.NotSavedData)) {
              allNotSavedData = [...allNotSavedData, ...responseData.NotSavedData];
            }
          }
          
          batchSuccess = true;
          successfulBatches++;
          console.log(`✅ Batch ${batchIndex + 1} processed successfully`);
          
          // Add delay after successful batch for server breathing room
          if (batchIndex < syncBatches.length - 1) {
            console.log('⏳ Brief pause for server processing...');
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
          break; // Exit retry loop
          
        } catch (batchError) {
          console.error(`❌ Batch ${batchIndex + 1} attempt ${attempt} failed:`, batchError);
          
          if (attempt === MAX_RETRY_ATTEMPTS) {
            console.error(`❌ Batch ${batchIndex + 1} failed after ${MAX_RETRY_ATTEMPTS} attempts`);
            // Create error log for this batch
            await handleFullDatabaseSyncError(batchError, batchData, userId, `BatchFullDatabase_${batchIndex + 1}`);
            break;
          } else {
            console.log(`⏳ Retrying batch ${batchIndex + 1} in ${BATCH_DELAY}ms...`);
            await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
          }
        }
      }
      
      // Add delay between successful batches
      if (batchSuccess && batchIndex < syncBatches.length - 1) {
        console.log(`⏳ Waiting ${BATCH_DELAY}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }
    }
    
    console.log(`🎯 Batch sync summary:`);
    console.log(`   - Successful batches: ${successfulBatches}/${syncBatches.length}`);
    console.log(`   - Total saved items: ${allSavedData.length}`);
    console.log(`   - Total failed items: ${allNotSavedData.length}`);
    
    // Process combined response
    const combinedResponse = {
      SavedData: allSavedData,
      NotSavedData: allNotSavedData,
      Status: allSavedData.length > 0 ? 'Batch sync completed successfully' : 'Batch sync completed',
    };
    
    await processFullDatabaseSyncResponse(combinedResponse, userId);
    
  } catch (error) {
    console.error('❌ Critical error in batch full database sync:', error);
    await handleFullDatabaseSyncError(error, collectedData, userId, 'BatchFullDatabaseCritical');
  }
};

// Helper function to process sync response and update flags
const processFullDatabaseSyncResponse = async (responseData: any, userId: string) => {
  try {
    console.log('🔍 [Full DB Sync] Processing response:', responseData);
    
    // Handle different response structures
    let actualData = responseData?.Data || responseData?.data || responseData;
    
    // Check if response has code/message structure (alternative API response format)
    if (actualData?.code !== undefined && actualData?.message !== undefined) {
      console.log('📋 [Full DB Sync] Alternative response format detected');
      console.log('📊 Response code:', actualData.code, 'Message:', actualData.message);
      
      // For alternative format, we don't have SavedData, so no cleanup needed
      // The sync is considered successful if code is 200
      if (actualData.code === 200 || actualData.code === '200') {
        console.log('✅ [Full DB Sync] Alternative format - sync successful');
        return;
      } else {
        console.log('❌ [Full DB Sync] Alternative format - sync failed');
        return;
      }
    }

    // Original response format handling
    const { SavedData, Status, NotSavedData } = actualData;
    
    console.log('📊 Full DB sync response (standard format):');
    console.log(`   - SavedData count: ${SavedData?.length || 0}`);
    console.log(`   - NotSavedData count: ${NotSavedData?.length || 0}`);
    console.log(`   - Status: ${Status}`);
    
    // Update sync flags for SavedData entries
    if (SavedData && Array.isArray(SavedData) && SavedData.length > 0) {
      console.log('🔄 Updating sync flags for successfully synced data...');
      const updatePromises: Promise<void>[] = [];
      
      SavedData.forEach((item: any) => {
        if (item.MobileGenPrimaryKey) {
          updatePromises.push(updateOrderMasterSyncFlag(item.MobileGenPrimaryKey));
          updatePromises.push(updateOrderDetailSyncFlag(item.MobileGenPrimaryKey));
          updatePromises.push(updateimageDetailSyncFlag(item.MobileGenPrimaryKey));
          updatePromises.push(updateNewPartyOutletSyncFlag(item.MobileGenPrimaryKey));
          updatePromises.push(updateNewPartyImageDetailSyncFlag(item.MobileGenPrimaryKey));
          console.log('📝 Marking sync flags Y for MobileGenPrimaryKey:', item.MobileGenPrimaryKey);
        }
      });
      
      await Promise.all(updatePromises);
      console.log('✅ Successfully updated sync flags for', SavedData.length, 'entries');
      
      // Cleanup images after successful sync - only for saved MGK keys
      const savedMGKs = SavedData.map((item: any) => item.MobileGenPrimaryKey).filter(Boolean);
      if (savedMGKs.length > 0) {
        await cleanupImagesAfterSync(savedMGKs);
      }
    }
    
    // Handle NotSavedData entries
    if (NotSavedData && Array.isArray(NotSavedData) && NotSavedData.length > 0) {
      await handleNotSavedData(NotSavedData, userId, 'FullDatabase');
    }
    
    console.log('✅ Full database sync response processing completed');
    
  } catch (error) {
    console.error('❌ Error processing full database sync response:', error);
    writeErrorLog('processFullDatabaseSyncResponse', error);
  }
};

// Helper function to handle sync errors
const handleFullDatabaseSyncError = async (
  error: any, 
  data: Record<string, any>, 
  userId: string, 
  syncType: string
) => {
  try {
    console.log(`⚠️ Handling sync error for ${syncType}...`);
    
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '');
    const fileName = `${syncType}_Error_${userId}_${timestamp}.json`;

    const errorData = {
      timestamp: new Date().toISOString(),
      userId: userId,
      syncType: syncType,
      error: error?.message || 'Unknown sync error',
      data: data
    };

    // Convert to base64 for web
    const jsonString = JSON.stringify(errorData, null, 2);
    const fileBase64 = btoa(unescape(encodeURIComponent(jsonString)));

    const payload = {
      Flag: '0', // Full database error flag
      FileName: fileName,
      FileByte: fileBase64,
    };

    const apiClient = await createApiClient();
    const response = await apiClient.post(API_ENDPOINTS.ERRORLOG, payload);

    console.log('✅ Error log created successfully:', response.data?.Message);
    console.log(`📁 Error backup file sent: ${fileName}`);
    
  } catch (logError) {
    console.error('❌ Failed to create error log:', logError);
    writeErrorLog('handleFullDatabaseSyncError', logError);
  }
};

// Helper function to handle NotSavedData entries
const handleNotSavedData = async (notSavedData: any[], userId: string, syncType: string) => {
  try {
    console.log(`⚠️ Creating error log for ${notSavedData.length} NotSavedData entries...`);
    
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '');
    const fileName = `NotSavedData_${syncType}_${userId}_${timestamp}.json`;

    const errorData = {
      timestamp: new Date().toISOString(),
      userId: userId,
      syncType: syncType,
      notSavedEntries: notSavedData,
    };

    // Convert to base64 for web
    const jsonString = JSON.stringify(errorData, null, 2);
    const fileBase64 = btoa(unescape(encodeURIComponent(jsonString)));

    const payload = {
      Flag: '0',
      FileName: fileName,
      FileByte: fileBase64,
    };

    const apiClient = await createApiClient();
    const errorResponse = await apiClient.post(API_ENDPOINTS.ERRORLOG, payload);
    
    console.log('✅ NotSavedData error log created:', errorResponse.data?.Message);
    
    // TODO: Add user alert and delete option for NotSavedData entries
    // User will implement:
    // - Show alert with NotSavedData details
    // - Provide option to delete unsynced entries to prevent repeated errors
    
  } catch (error) {
    console.error('❌ Failed to create NotSavedData error log:', error);
    writeErrorLog('handleNotSavedData', error);
  }
};

export const syncAndUploadImageDataOnly = async (
  userId: string,
  userCredentials?: {
    enteredUserName: string;
    userPassword: string; 
    savedClientCode: string;
    deviceId: string;
  }
) => {
  console.log('🚀 Starting Enhanced Image-Only Sync');

  try {
    // Process images using our intelligent batching utility
    console.log('🖼️ Processing images for image-only sync with intelligent batching...');
    const imageProcessingResult = await processImageDataWithBatching(); // No MGK keys = get all images
    
    if (!imageProcessingResult.data.ImageDetails && !imageProcessingResult.data.NewPartyImage) {
      console.log('ℹ️ No image data found to sync');
      return;
    }

    // Prepare JSONObj with processed images
    let JSONObj: Record<string, any> = {};
    
    if (imageProcessingResult.data.ImageDetails) {
      JSONObj['OrderImages'] = imageProcessingResult.data.ImageDetails;
      console.log(`✅ Processed ${imageProcessingResult.data.ImageDetails.length} ImageDetails`);
    }
    
    if (imageProcessingResult.data.NewPartyImage) {
      JSONObj['NewPartyImages'] = imageProcessingResult.data.NewPartyImage;
      console.log(`✅ Processed ${imageProcessingResult.data.NewPartyImage.length} NewPartyImages`);
    }

    // Phase 2: Intelligent sync strategy based on data size
    const totalImageSizeMB = calculateJsonSizeInMB(JSONObj);
    console.log(`📊 Total image data size: ${totalImageSizeMB} MB (estimated: ${imageProcessingResult.estimatedSizeMB} MB)`);

    console.log('🔄 Phase 2: Processing image sync...');
    
    try {
      const apiClient = await createApiClient();
      const authPayload = {
        LoginId: userCredentials?.enteredUserName || 'system',
        Password: userCredentials?.userPassword || '',
        ClientCode: userCredentials?.savedClientCode || '',
        DeviceId: userCredentials?.deviceId || userId,
      };
      
      // Get auth token with retry
      console.log('🔐 Getting auth token for image sync...');
      const tokenResponse = await apiClient.post('/api/postAuthToken', authPayload);
      const token = tokenResponse.data?.Token;
      
      if (!token) {
        throw new Error('Failed to obtain authentication token for image sync');
      }
      
      console.log('✅ Image sync auth token received');
      console.log('🚀 POST REQUEST: Starting image data sync...');
      console.log('📊 Image data keys:', Object.keys(JSONObj));
      
      const response = await apiClient.post('/api/postData', JSONObj, {
        headers: {
          'Content-Type': 'application/json',
          'authheader': token,
        },
      });
      
      console.log('✅ POST RESPONSE: Image data sync completed');
      console.log('📈 Image response status:', response.status);
      
      // Process response with alternative format handling
      console.log('🔍 [Image Sync] Processing response:', response.data);
      
      let responseData = response.data?.Data || response.data?.data || response.data;
      
      // Check if response has code/message structure (alternative API response format)
      if (responseData?.code !== undefined && responseData?.message !== undefined) {
        console.log('📋 [Image Sync] Alternative response format detected');
        console.log('📊 Response code:', responseData.code, 'Message:', responseData.message);
        
        // For alternative format, we don't have SavedData, so no cleanup needed
        // The sync is considered successful if code is 200
        if (responseData.code === 200 || responseData.code === '200') {
          console.log('✅ [Image Sync] Alternative format - sync successful');
          return;
        } else {
          console.log('❌ [Image Sync] Alternative format - sync failed');
          throw new Error(`Image sync failed: ${responseData.message}`);
        }
      }

      // Original response format handling
      const { SavedData, Status, NotSavedData } = responseData;
      
      console.log('📊 Image sync response (standard format):');
      console.log(`   - SavedData count: ${SavedData?.length || 0}`);
      console.log(`   - NotSavedData count: ${NotSavedData?.length || 0}`);
      console.log(`   - Status: ${Status}`);
      
      // Update sync flags for SavedData entries
      if (SavedData && Array.isArray(SavedData) && SavedData.length > 0) {
        console.log('🔄 Updating sync flags for successfully synced images...');
        const updatePromises: Promise<void>[] = [];
        
        SavedData.forEach((item: any) => {
          if (item.MobileGenPrimaryKey) {
            updatePromises.push(updateimageDetailSyncFlag(item.MobileGenPrimaryKey));
            updatePromises.push(updateNewPartyImageDetailSyncFlag(item.MobileGenPrimaryKey));
            console.log('📝 Marking image sync flags Y for MobileGenPrimaryKey:', item.MobileGenPrimaryKey);
          }
        });
        
        await Promise.all(updatePromises);
        console.log('✅ Successfully updated image sync flags for', SavedData.length, 'entries');
        
        // Cleanup images after successful sync - only for saved MGK keys
        const savedMGKs = SavedData.map((item: any) => item.MobileGenPrimaryKey).filter(Boolean);
        if (savedMGKs.length > 0) {
          await cleanupImagesAfterSync(savedMGKs);
        }
      }
      
      // Handle NotSavedData entries
      if (NotSavedData && Array.isArray(NotSavedData) && NotSavedData.length > 0) {
        await handleNotSavedData(NotSavedData, userId, 'ImageDataOnly');
      }
      
      console.log('✅ Image data sync processing completed');
      
    } catch (syncError) {
      console.error('❌ Image sync failed:', syncError);
      await handleFullDatabaseSyncError(syncError, JSONObj, userId, 'ImageSyncError');
    }
    
  } catch (error) {
    console.error('❌ Critical error in image-only sync:', error);
    writeErrorLog('syncAndUploadImageDataOnly critical error', error);
    window.alert('Failed to sync image data');
  }
};

