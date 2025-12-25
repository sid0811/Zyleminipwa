/**
 * syncNowUsecase.ts - Complete Sync Usecase for PWA
 * Handles foreground/background data synchronization with batch processing
 */
import { postShopGeolocation } from '../api/ShopsAPICalls';
import {
  getOrderMasterSyncData,
  getOrderDetailsSyncData,
  getNewPartySyncData,
  getCollectionSyncData,
  getPaymentSyncData,
  getMeetingSyncData,
  markDataAsSynced,
  markCollectionsAsSynced,
  markPaymentsAsSynced,
  markMeetingsAsSynced,
  getSyncCounts,
  checkNewPartyExists,
  getSyncDataList,
  getSyncDataListforNewParty
} from '../database/WebDatabaseHelpers';
import { GlobleAction } from '../redux/actionHooks/useGlobalAction';
import {
  dataSyncObjectKeys,
  fetchUserAccess,
  writeErrorLog,
} from '../utility/utils';
import { getAuthData, postData, postAuthToken } from '../api/LoginAPICalls';
import { ApiConst } from '../constants/screenConstants';
import {
  ApiStatus,
  ApiStatusTypes,
  ErrorMsgApi,
} from '../notifications/notificationsUtils';
import { getDataCore } from '../core/getDataCore';
import moment from 'moment';

// Type definitions
interface SyncDataItem {
  [key: string]: any;
}

interface SyncData {
  [key: string]: SyncDataItem[];
}

interface BatchItem {
  key: string;
  item: SyncDataItem;
  sizeBytes: number;
}

interface SyncResponse {
  SavedData?: SyncDataItem[];
  Status?: string;
  NotSavedData?: SyncDataItem[];
  Data?: any;
  code?: number | string;
  message?: string;
}

interface AuthTokenPayload {
  LoginId: string;
  Password: string;
  ClientCode: string;
  DeviceId: string;
}

interface AuthTokenResponse {
  data?: {
    Token: string;
  };
}

// Helper function to calculate JSON size in bytes
const getJsonSizeInBytes = (obj: any): number => {
  const jsonString = JSON.stringify(obj);
  // Calculate UTF-8 byte size (more accurate than simple string length)
  const utf8Length = new Blob([jsonString]).size;
  return utf8Length;
};

// Helper function to convert bytes to MB
const bytesToMB = (bytes: number): number => {
  return bytes / (1024 * 1024);
};

// Helper function to get individual item size in bytes
const getItemSizeInBytes = (key: string, item: SyncDataItem): number => {
  const itemObj = { [key]: [item] };
  return getJsonSizeInBytes(itemObj);
};

// Helper function to create size-based batches from sync data
const createSizeBatches = (
  syncData: SyncData,
  maxBatchSizeMB: number = 5,
): SyncData[] => {
  const batches: SyncData[] = [];
  const allItems: BatchItem[] = [];
  const maxBatchSizeBytes = maxBatchSizeMB * 1024 * 1024; // Convert MB to bytes

  console.log(
    `\n📦 Creating batches with max size: ${maxBatchSizeMB} MB (${maxBatchSizeBytes} bytes)`,
  );

  // Flatten all items with their keys and calculate individual sizes
  Object.entries(syncData).forEach(([key, items]: [string, SyncDataItem[]]) => {
    if (Array.isArray(items)) {
      items.forEach((item: SyncDataItem) => {
        const itemSize = getItemSizeInBytes(key, item);
        allItems.push({ key, item, sizeBytes: itemSize });
      });
    }
  });

  console.log(`\n📊 Total items to batch: ${allItems.length}`);

  // Sort items by size (largest first) for better packing
  allItems.sort((a, b) => b.sizeBytes - a.sizeBytes);

  let currentBatch: SyncData = {};
  let currentBatchSize = 0;

  allItems.forEach(({ key, item, sizeBytes }: BatchItem, index: number) => {
    // If adding this item would exceed the batch size, start a new batch
    if (
      currentBatchSize + sizeBytes > maxBatchSizeBytes &&
      Object.keys(currentBatch).length > 0
    ) {
      batches.push(currentBatch);
      console.log(
        `\n✅ Batch ${batches.length} created with size: ${bytesToMB(
          currentBatchSize,
        ).toFixed(2)} MB`,
      );
      currentBatch = {};
      currentBatchSize = 0;
    }

    // Add item to current batch
    if (!currentBatch[key]) {
      currentBatch[key] = [];
    }
    currentBatch[key].push(item);
    currentBatchSize += sizeBytes;

    // If this is the last item, add the current batch
    if (index === allItems.length - 1) {
      batches.push(currentBatch);
      console.log(
        `\n✅ Final batch ${batches.length} created with size: ${bytesToMB(
          currentBatchSize,
        ).toFixed(2)} MB`,
      );
    }
  });

  // Handle edge case where we have items that are individually larger than maxBatchSize
  if (batches.length === 0 && allItems.length > 0) {
    console.log(
      '\n⚠️ Warning: Some items are larger than max batch size, creating single-item batches',
    );
    allItems.forEach(({ key, item }) => {
      const singleItemBatch: SyncData = { [key]: [item] };
      batches.push(singleItemBatch);
    });
  }

  return batches;
};

// Enhanced sync function with JSON size-based batch processing
export const doSyncNowForeGroundBackGround = async (
  isFromScreen: boolean,
  userId: string,
  savedClientCode: string,
  loginId: string,
  password: string,
  deviceId: string,
  callLoaderCallBack: (isTrue: boolean) => void,
  redirectionCallBack: (apiStatus: ApiStatus, isRedirect: boolean) => void,
  updateNotificationCallBack?: (percentage: number, message?: string) => void,
  globalActions?: GlobleAction,
): Promise<void> => {
  console.log('\n🚀 Starting doSyncNowForeGroundBackGround function');
  let _SavedData: SyncDataItem[] = [];

  try {
    const syncStartTime: string = moment().format('YYYY-MM-DD HH:mm:ss');

    isFromScreen && callLoaderCallBack(true);
    updateNotificationCallBack?.(5, 'Syncing shop locations...');
    await syncShopLocations();

    console.log('\n🔄 Starting data collection...');
    updateNotificationCallBack?.(15, 'Collecting sync data from database...');
    const syncData: SyncData = await collectSyncData();
    console.log('\n✅ Data collection completed');
    console.log('\n📊 syncData keys -->', Object.keys(syncData));

    if (Object.keys(syncData).length > 0) {
      console.log('\n🔐 Refreshing authentication token...');
      updateNotificationCallBack?.(25, 'Authenticating with server...');
      const newToken: string | null = await refreshAuthToken(
        loginId,
        password,
        savedClientCode,
        deviceId,
      );

      if (!newToken) {
        throw new Error('Failed to refresh authentication token');
      }
      console.log('\n✅ Token refreshed successfully');

      console.log('\n📏 Calculating JSON size...');
      updateNotificationCallBack?.(35, 'Analyzing data size for sync strategy...');
      const jsonSizeBytes: number = getJsonSizeInBytes(syncData);
      const jsonSizeMB: number = bytesToMB(jsonSizeBytes);
      console.log('\n✅ Size calculation completed');
      console.log(
        `\n📊 JSON size: ${jsonSizeMB.toFixed(2)} MB (${jsonSizeBytes} bytes)`,
      );

      let allSavedData: SyncDataItem[] = [];
      let finalStatus: string | null = null;
      let allNotSavedData: SyncDataItem[] = [];

      if (jsonSizeMB > 20) {
        console.log(
          `\n🔀 JSON size (${jsonSizeMB.toFixed(
            2,
          )} MB) exceeds 20 MB threshold. Using batch processing...`,
        );
        updateNotificationCallBack?.(45, `Large dataset detected (${jsonSizeMB.toFixed(1)}MB). Using batch processing...`);
        const batches: SyncData[] = createSizeBatches(syncData, 5); // 5 MB per batch
        console.log(`\n📦 Created ${batches.length} batches`);

        for (let i = 0; i < batches.length; i++) {
          const batch: SyncData = batches[i];
          const batchSizeBytes = getJsonSizeInBytes(batch);
          const batchSizeMB = bytesToMB(batchSizeBytes);
          console.log(
            `\n🔄 Processing batch ${i + 1}/${
              batches.length
            } (Size: ${batchSizeMB.toFixed(2)} MB)`,
          );
          
          // Update progress for batch processing
          const batchProgress = 50 + Math.round((i / batches.length) * 40); // 50-90% for batches
          updateNotificationCallBack?.(batchProgress, `Processing batch ${i + 1}/${batches.length} (${batchSizeMB.toFixed(1)}MB)`);

          try {
            const batchResponse: SyncResponse = await postSyncData(
              newToken,
              batch,
              userId,
            );
            console.log(
              `\n✅ Batch ${i + 1} response status:`,
              batchResponse.Status || batchResponse.code,
            );

            if (batchResponse.SavedData) {
              allSavedData = [...allSavedData, ...batchResponse.SavedData];
            }

            if (batchResponse.NotSavedData) {
              allNotSavedData = [
                ...allNotSavedData,
                ...batchResponse.NotSavedData,
              ];
            }

            if (
              !finalStatus ||
              batchResponse.Status === ApiConst.DATA_SAVED_SUCCESSFULLY
            ) {
              finalStatus = batchResponse.Status || 'Batch sync completed';
            }

            await processSyncResponse(batchResponse);

            if (updateNotificationCallBack) {
              const progress: number = Math.round(
                ((i + 1) / batches.length) * 100,
              );
              updateNotificationCallBack(progress);
            }

            if (i < batches.length - 1) {
              await new Promise<void>(resolve => setTimeout(resolve, 1000));
            }
          } catch (batchError: any) {
            console.error(`❌ Error in batch ${i + 1}:`, batchError);
            writeErrorLog(
              `Batch ${i + 1} sync error (Size: ${batchSizeMB.toFixed(2)} MB)`,
              batchError,
            );
          }
        }

        _SavedData = allSavedData;
        console.log(
          `\n✅ Batch processing completed. Total saved items: ${allSavedData.length}`,
        );
      } else {
        console.log(
          `\n🚀 JSON size (${jsonSizeMB.toFixed(
            2,
          )} MB) is within 20 MB limit. Using normal sync...`,
        );
        updateNotificationCallBack?.(60, `Uploading data to server (${jsonSizeMB.toFixed(1)}MB)...`);
        const syncResponse: SyncResponse = await postSyncData(
          newToken,
          syncData,
          userId,
        );
        console.log('\n📊 syncResponse status -->', syncResponse.Status || syncResponse.code);
        console.log('\n📊 syncResponse SavedData count -->', syncResponse.SavedData?.length || 0);
        console.log('\n📊 syncResponse NotSavedData count -->', syncResponse.NotSavedData?.length || 0);

        updateNotificationCallBack?.(85, 'Processing server response...');
        _SavedData = syncResponse.SavedData || [];
        finalStatus = syncResponse.Status || 'Sync completed';
        allNotSavedData = syncResponse.NotSavedData || [];

        console.log('\n✅ Processing sync response for', _SavedData.length, 'saved items');
        await processSyncResponse(syncResponse);
      }

      updateNotificationCallBack?.(90, 'Cleaning up temporary files...');
      await cleanupAfterSync(
        isFromScreen,
        userId,
        syncStartTime,
        globalActions,
      );

      if (finalStatus && finalStatus !== ApiConst.DATA_SAVED_SUCCESSFULLY && finalStatus !== 'Sync completed') {
        console.log('\n⚠️ Data not saved successfully, status:', finalStatus);

        redirectionCallBack(
          {
            type: ApiStatusTypes.FAILURE,
            message: ErrorMsgApi.DATA_NOT_SAVE,
            notSavedData: allNotSavedData,
            status: finalStatus,
          },
          false,
        );
      } else {
        // Handle both cases: no status OR emergency sync completed
        if (!finalStatus || finalStatus === 'Emergency sync completed') {
          console.log('\n🔄 No status received or emergency sync completed, refreshing data');
          // Turn off loader here since getDataCore will manage it
          isFromScreen && callLoaderCallBack(false);
          
          try {
            await getDataCore({
              isFromScreen,
              loaderState: isFromScreen ? callLoaderCallBack : undefined,
              enteredUserName: loginId,
              userPassword: password,
              savedClientCode: savedClientCode,
              deviceId: deviceId,
              userId: userId,
              globalActions: globalActions,
              showSuccessAlert: (msg: string) => {
                // For emergency syncs, show success message and trigger success flow
                if (finalStatus === 'Emergency sync completed') {
                  redirectionCallBack(
                    { type: ApiStatusTypes.SUCCESS, status: 'Data sync successfully (Emergency)', message: msg },
                    false,
                  );
                } else {
                  redirectionCallBack(
                    { type: ApiStatusTypes.SUCCESS, status: 'Data sync successfully', message: msg },
                    false,
                  );
                }
              },
            });
          } catch (getDataError) {
            console.error('❌ getDataCore failed:', getDataError);
            writeErrorLog('getDataCore failed during sync', getDataError);
          }
        } else {
          console.log('\n✅ Sync completed successfully - finalStatus:', finalStatus);
          console.log('\n✅ Saved data count:', _SavedData.length);
          updateNotificationCallBack?.(95, 'Sync completed successfully!');

          const successMessage: string =
            jsonSizeMB > 20
              ? `Sync completed successfully - ${jsonSizeMB.toFixed(
                  2,
                )} MB processed in ${Math.ceil(jsonSizeMB / 5)} batches`
              : `Sync completed successfully - ${jsonSizeMB.toFixed(
                  2,
                )} MB processed`;

          updateNotificationCallBack?.(100, 'Finalizing sync process...');
          console.log('\n✅ Calling redirectionCallBack with SUCCESS status');
          redirectionCallBack(
            {
              type: ApiStatusTypes.SUCCESS,
              status: finalStatus,
              message: successMessage,
            },
            false,
          );
          console.log('\n✅ redirectionCallBack completed');
        }
      }
    } else {
      redirectionCallBack(
        { type: ApiStatusTypes.SUCCESS, status: 'No Post Data' },
        false,
      );
    }
  } catch (error: any) {
    console.log('\n❌ catch -->', error);

    writeErrorLog('doSyncNowForeGroundBackGround', error);
    if (isFromScreen) {
      callLoaderCallBack(false);
      redirectionCallBack(
        {
          type: ApiStatusTypes.INTERNET_CHECK,
          message: error.message,
        },
        false,
      );
    }
  } finally {
    // Turn off loader when sync operation completes
    callLoaderCallBack(false);
    
    globalActions?.setSyncFlag(!globalActions.syncFlag);
  }
};

const refreshAuthToken = async (
  enteredUserName: string,
  userPassword: string,
  savedClientCode: string,
  deviceId: string,
): Promise<string | null> => {
  try {
    const payload: AuthTokenPayload = {
      LoginId: enteredUserName,
      Password: userPassword,
      ClientCode: savedClientCode,
      DeviceId: deviceId,
    };

    const response: AuthTokenResponse = await postAuthToken(payload);

    if (response?.data?.Token) {
      return response.data.Token;
    } else {
      throw new Error('Token not found in response');
    }
  } catch (error: any) {
    writeErrorLog('refreshAuthToken error', error);
    console.error('❌ Failed to refresh auth token:', error);
    return null;
  }
};

const collectSyncData = async (): Promise<SyncData> => {
  console.log('\n🔄 Starting collectSyncData...');
  const JSONObj: SyncData = {};
  
  // Check for new parties to determine sync method
  const hasNewParties = await checkNewPartyExists();
  console.log(`📌 Has new parties: ${hasNewParties}`);

  // Get sync counts
  const syncCounts = await getSyncCounts();
  console.log('📊 Sync counts:', syncCounts);

  try {
    console.log('\n📊 Fetching data from database...');
    
    // Get data based on sync counts
    if (syncCounts.orders > 0) {
      const orderMasterData = await getOrderMasterSyncData() as SyncDataItem[];
      const orderDetailsData = await getOrderDetailsSyncData() as SyncDataItem[];
      
      if (orderMasterData.length > 0) {
        JSONObj[dataSyncObjectKeys.OrderMaster] = orderMasterData;
        console.log(`  ✅ OrderMaster: ${orderMasterData.length} records`);
      }
      
      if (orderDetailsData.length > 0) {
        JSONObj[dataSyncObjectKeys.OrderDetails] = orderDetailsData;
        console.log(`  ✅ OrderDetails: ${orderDetailsData.length} records`);
      }
    }

    if (syncCounts.newParties > 0) {
      const newPartyData = await getNewPartySyncData() as SyncDataItem[];
      if (newPartyData.length > 0) {
        JSONObj[dataSyncObjectKeys.NewParty] = newPartyData;
        console.log(`  ✅ NewParty: ${newPartyData.length} records`);
      }
    }

    if (syncCounts.collections > 0) {
      const collectionsData = await getCollectionSyncData() as SyncDataItem[];
      if (collectionsData.length > 0) {
        JSONObj[dataSyncObjectKeys.Collections] = collectionsData;
        console.log(`  ✅ Collections: ${collectionsData.length} records`);
      }
    }

    if (syncCounts.payments > 0) {
      const paymentData = await getPaymentSyncData() as SyncDataItem[];
      if (paymentData.length > 0) {
        JSONObj[dataSyncObjectKeys.PaymentReceipt] = paymentData;
        console.log(`  ✅ PaymentReceipt: ${paymentData.length} records`);
      }
    }

    if (syncCounts.meetings > 0) {
      const meetingData = await getMeetingSyncData() as SyncDataItem[];
      if (meetingData.length > 0) {
        // Note: MJPMaster is not in dataSyncObjectKeys, using string literal
        JSONObj['MJPMaster'] = meetingData;
        console.log(`  ✅ MJPMaster: ${meetingData.length} records`);
      }
    }

    // TODO: Add image processing with batching
    // This would be similar to the native implementation
    // For now, images are handled separately

  } catch (error: any) {
    console.error('\n❌ Error in collectSyncData:', error);
    writeErrorLog('collectSyncData', error);
  }

  console.log('\n✅ collectSyncData completed successfully');
  console.log('\n📊 Final data keys:', Object.keys(JSONObj));
  console.log('\n📊 Total sync objects:', Object.keys(JSONObj).length);
  
  return JSONObj;
};

const syncShopLocations = async (): Promise<void> => {
  try {
    // TODO: Implement shop location sync
    // This would fetch shop locations and post to server
    console.log('📍 Shop location sync placeholder');
  } catch (error: any) {
    writeErrorLog('syncShopLocations', error);
    console.log('❌ error while posting shop locations -->', error);
  }
};

const postSyncData = async (
  token: string,
  data: SyncData,
  userId: string,
): Promise<SyncResponse> => {
  try {
    const response: SyncResponse = await postData(data, token);
    return response;
  } catch (error: any) {
    console.error('❌ Primary sync failed:', error);
    writeErrorLog('postSyncData primary sync failed', error);
    
    // TODO: Implement emergency backup sync
    // This would call syncAndUploadFullDatabase and syncAndUploadImageDataOnly
    
    // Re-throw the error to properly handle sync failure
    throw error;
  }
};

const processSyncResponse = async (response: SyncResponse | any): Promise<void> => {
  console.log('🔍 [syncNowUsecase] Processing response:', response);
  
  // Handle different response structures
  let actualData = response?.Data || response?.data || response;
  
  // Check if response has code/message structure (alternative API response format)
  if (actualData?.code !== undefined && actualData?.message !== undefined) {
    console.log('📋 [syncNowUsecase] Alternative response format detected');
    console.log('📊 Response code:', actualData.code, 'Message:', actualData.message);
    
    // For alternative format, we don't have SavedData, so no cleanup needed
    // The sync is considered successful if code is 200
    if (actualData.code === 200 || actualData.code === '200') {
      console.log('✅ [syncNowUsecase] Alternative format - sync successful');
      return;
    } else {
      console.log('❌ [syncNowUsecase] Alternative format - sync failed');
      return;
    }
  }

  // Original response format handling
  const { SavedData } = actualData;
  console.log('📊 [syncNowUsecase] Standard format - SavedData count:', SavedData?.length || 0);
  
  if (SavedData?.length > 0) {
    const orderIds: string[] = [];
    const collectionIds: string[] = [];
    const paymentIds: string[] = [];
    const meetingIds: string[] = [];

    // Collect IDs by type
    SavedData.forEach((apiData: SyncDataItem) => {
      const key = apiData.MobileGenPrimaryKey || apiData.id;
      if (key) {
        // Determine type and add to appropriate array
        if (apiData.collection_type) {
          orderIds.push(key);
        }
        // Add other type checks as needed
      }
    });

    // Mark data as synced
    if (orderIds.length > 0) {
      await markDataAsSynced(orderIds);
    }
    if (collectionIds.length > 0) {
      await markCollectionsAsSynced(collectionIds);
    }
    if (paymentIds.length > 0) {
      await markPaymentsAsSynced(paymentIds);
    }
    if (meetingIds.length > 0) {
      await markMeetingsAsSynced(meetingIds);
    }

    console.log('✅ [syncNowUsecase] Marked data as synced');
  }
};

const cleanupAfterSync = async (
  isFromScreen: boolean,
  userId: string,
  syncStartTime: string,
  globalActions?: GlobleAction,
): Promise<void> => {
  console.log('\n🧹 Inside cleanup func');

  // TODO: Implement image cleanup
  // This would delete image files from local storage after successful sync
  
  console.log('✅ Cleanup completed');
};

export const processDeleteResponse = async (
  isFromScreen: boolean,
  response: any,
  userId: string,
  savedClientCode: string,
  t?: any,
  globalActions?: GlobleAction,
): Promise<void> => {
  const { NotSavedData } = response;

  const syncData: SyncData = await collectSyncData();

  if (Object.keys(syncData).length > 0) {
    // TODO: Post error report if needed
    console.log('📊 Sync data available for error report');
  }

  if (NotSavedData?.length > 0) {
    // NotSavedData means sync failed - we should keep the data for retry
    console.log('⚠️ NotSavedData found - keeping data for retry:', NotSavedData.length);
    // Don't delete anything for NotSavedData
  } else {
    console.log('✅ No data available for deletion');
  }
};

