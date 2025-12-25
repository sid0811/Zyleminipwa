/**
 * useSyncNow Hook - Complete Implementation
 * Handles data synchronization from server to local database
 */
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoginAction } from '../redux/actionHooks/useLoginAction';
import { useNetInfo } from './useNetInfo';
import { getAuthData, postData } from '../api/LoginAPICalls';
import { 
  insertAllData, 
  createTables,
  getSyncDataList,
  getSyncDataListforNewParty,
  checkNewPartyExists,
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
  getSyncCounts
} from '../database/WebDatabaseHelpers';
import { writeErrorLog, writeLog } from '../utility/utils';
import cacheStorage from '../localstorage/secureStorage';
import { UserPreferenceKeys } from '../constants/asyncStorageKeys';

interface Props {
  loaderState?: (val: boolean) => void;
  onComplete?: () => void;
  onError?: (error: any) => void;
}

interface SyncProgress {
  current: number;
  total: number;
  message: string;
  stage: 'downloading' | 'processing' | 'inserting' | 'uploading' | 'complete' | 'error';
}

export const useSyncNow = () => {
  const { t } = useTranslation();
  const { userId, token } = useLoginAction();
  const { isNetConnected } = useNetInfo();
  
  const [isLoading, setisLoading] = useState(false);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);

  /**
   * Upload local changes to server
   * Uses conditional sync: Regular sync vs New Party sync
   */
  const uploadLocalData = async (authToken: string): Promise<boolean> => {
    try {
      console.log('📤 [Sync] Uploading local changes...');
      setSyncProgress({
        current: 10,
        total: 100,
        message: 'Checking local changes...',
        stage: 'uploading',
      });

      // Check what types of data need to be synced
      const syncCounts = await getSyncCounts();
      console.log('📊 [Sync] Pending items:', syncCounts);

      if (syncCounts.total === 0) {
        console.log('✅ [Sync] No local changes to upload');
        return true;
      }

      // ⚠️ CONDITIONAL SYNC METHOD SELECTION
      const hasNewParties = await checkNewPartyExists();
      console.log(`📌 [Sync] Sync method: ${hasNewParties ? 'NEW PARTY' : 'REGULAR'}`);

      // Get appropriate sync data list (for display/logging)
      const syncDataList: any[] = hasNewParties 
        ? (await getSyncDataListforNewParty() as any[])
        : (await getSyncDataList() as any[]);

      console.log(`📊 [Sync] Found ${syncDataList.length} order groups to sync`);

      setSyncProgress({
        current: 20,
        total: 100,
        message: `Preparing ${syncCounts.total} items...`,
        stage: 'uploading',
      });

      // ==========================================
      // PREPARE COMPLETE UPLOAD PAYLOAD
      // ==========================================
      
      const payload: any = {};

      // 1. Order Data
      if (syncCounts.orders > 0) {
        const orderMasterData: any[] = (await getOrderMasterSyncData('N') as any[]);
        const orderDetailsData: any[] = (await getOrderDetailsSyncData() as any[]);
        
        if (orderMasterData.length > 0) {
          payload.OrderMaster = orderMasterData.map((order: any) => ({
            id: order.id,
            entity_id: order.entity_id,
            entity_type: order.entity_type,
            collection_type: order.collection_type,
            total_amount: order.total_amount || 0,
            discount_amount: order.discount_amount || 0,
            final_amount: order.final_amount || 0,
            order_date: order.order_date,
            start_datetime: order.start_datetime,
            end_datetime: order.end_datetime,
            latitude: order.latitude,
            longitude: order.longitude,
            remarks: order.remarks || '',
            signature_base64: order.signature_base64 || '',
            DefaultDistributorId: order.DefaultDistributorId,
            userid: order.userid,
            sync_flag: 'Y', // Will be updated after successful sync
            ...order // Include any other fields
          }));
          console.log(`  📦 OrderMaster: ${payload.OrderMaster.length} records`);
        }

        if (orderDetailsData && orderDetailsData.length > 0) {
          payload.OrderDetails = orderDetailsData.map((detail: any) => ({
            id: detail.id,
            order_id: detail.order_id,
            item_id: detail.item_id,
            quantity: detail.quantity || 0,
            rate: detail.rate || 0,
            amount: detail.amount || 0,
            free_quantity: detail.free_quantity || 0,
            scheme_id: detail.scheme_id || '',
            discount_amount: detail.discount_amount || 0,
            ...detail // Include any other fields
          }));
          console.log(`  📦 OrderDetails: ${payload.OrderDetails.length} records`);
        }
      }

      // 2. New Party Data (if exists)
      if (syncCounts.newParties > 0) {
        const newPartyData = (await getNewPartySyncData() as any[]);
        if (newPartyData.length > 0) {
          payload.ZyleminiNewParty = newPartyData.map((party: any) => ({
            OrderId: party.OrderId,
            OutletName: party.OutletName || '',
            OwnerName: party.OwnerName || '',
            Address: party.Address || '',
            Latitude: party.Latitude || '',
            Longitude: party.Longitude || '',
            MobileNumber: party.MobileNumber || '',
            ShopType: party.ShopType || '',
            ShopArea: party.ShopArea || '',
            RegistrationNumber: party.RegistrationNumber || '',
            RouteId: party.RouteId || '',
            ContactPerson: party.ContactPerson || '',
            ...party // Include any other fields
          }));
          console.log(`  📦 ZyleminiNewParty: ${payload.ZyleminiNewParty.length} records`);
        }
      }

      // 3. Collection Data
      if (syncCounts.collections > 0) {
        const collectionData = (await getCollectionSyncData() as any[]);
        if (collectionData.length > 0) {
          payload.Collections_Log = collectionData;
          console.log(`  📦 Collections_Log: ${payload.Collections_Log.length} records`);
        }
      }

      // 4. Payment Data
      if (syncCounts.payments > 0) {
        const paymentData = (await getPaymentSyncData() as any[]);
        if (paymentData.length > 0) {
          payload.PaymentReceipt_Log = paymentData;
          console.log(`  📦 PaymentReceipt_Log: ${payload.PaymentReceipt_Log.length} records`);
        }
      }

      // 5. Meeting/Journey Plan Data
      if (syncCounts.meetings > 0) {
        const meetingData = (await getMeetingSyncData() as any[]);
        if (meetingData.length > 0) {
          payload.MJPMaster = meetingData;
          console.log(`  📦 MJPMaster: ${payload.MJPMaster.length} records`);
        }
      }

      // Check if we have anything to upload
      if (Object.keys(payload).length === 0) {
        console.log('✅ [Sync] No data to upload');
        return true;
      }

      setSyncProgress({
        current: 30,
        total: 100,
        message: `Uploading ${syncCounts.total} items...`,
        stage: 'uploading',
      });

      // ==========================================
      // JSON CONVERSION & SIZE LOGGING
      // ==========================================
      
      const jsonString = JSON.stringify(payload);
      const sizeKB = jsonString.length / 1024;
      const sizeMB = sizeKB / 1024;

      console.log('\n📊 [Sync] Upload Payload Summary:');
      console.log(`  📦 Size: ${sizeMB.toFixed(2)}MB (${sizeKB.toFixed(1)}KB, ${jsonString.length} characters)`);
      console.log(`  📋 Data types:`, Object.keys(payload));
      console.log('');

      // ==========================================
      // UPLOAD TO SERVER
      // ==========================================
      
      console.log('🚀 [Sync] Sending data to server...');
      const uploadStartTime = Date.now();

      await postData(payload, authToken);

      const uploadDuration = Date.now() - uploadStartTime;
      console.log(`✅ [Sync] Upload successful in ${(uploadDuration / 1000).toFixed(2)}s`);

      setSyncProgress({
        current: 45,
        total: 100,
        message: 'Marking data as synced...',
        stage: 'uploading',
      });

      // ==========================================
      // MARK DATA AS SYNCED
      // ==========================================
      
      try {
        // Mark orders as synced
        if (payload.OrderMaster && payload.OrderMaster.length > 0) {
          const orderIds = payload.OrderMaster.map((order: any) => order.id);
          await markDataAsSynced(orderIds);
        }

        // Mark collections as synced
        if (payload.Collections_Log && payload.Collections_Log.length > 0) {
          const collectionIds = payload.Collections_Log.map((col: any) => col.id);
          await markCollectionsAsSynced(collectionIds);
        }

        // Mark payments as synced
        if (payload.PaymentReceipt_Log && payload.PaymentReceipt_Log.length > 0) {
          const paymentIds = payload.PaymentReceipt_Log.map((pay: any) => pay.id);
          await markPaymentsAsSynced(paymentIds);
        }

        // Mark meetings as synced
        if (payload.MJPMaster && payload.MJPMaster.length > 0) {
          const meetingIds = payload.MJPMaster.map((meet: any) => meet.id);
          await markMeetingsAsSynced(meetingIds);
        }

        console.log('✅ [Sync] All data marked as synced');
      } catch (markError) {
        console.error('⚠️ [Sync] Failed to mark some data as synced:', markError);
        // Don't fail the whole sync if marking fails
      }

      setSyncProgress({
        current: 50,
        total: 100,
        message: 'Upload complete',
        stage: 'uploading',
      });

      console.log('✅ [Sync] Local changes uploaded successfully\n');
      return true;

    } catch (error: any) {
      console.error('❌ [Sync] Upload failed:', error);
      console.error('  Error message:', error.message);
      console.error('  Error code:', error.code || error.response?.status);
      writeErrorLog('uploadLocalData', error);
      
      // Return false to indicate upload failed, but don't stop the sync
      // (we still want to download fresh data)
      return false;
    }
  };

  /**
   * Download fresh data from server
   */
  const downloadServerData = async (authToken: string): Promise<any> => {
    try {
      console.log('📥 [Sync] Downloading data from server...');
      setSyncProgress({
        current: 55,
        total: 100,
        message: 'Downloading data...',
        stage: 'downloading',
      });

      // Prepare headers for data download
      const headers = {
        authheader: authToken,
        uid: userId,
      };

      console.log('🔐 [Sync] Using auth token:', authToken ? 'Present' : 'Missing');
      console.log('👤 [Sync] User ID:', userId);

      // Download data from server
      const serverData = await getAuthData(headers);

      if (!serverData) {
        throw new Error('No data received from server');
      }

      console.log('✅ [Sync] Data downloaded successfully');
      console.log('📋 [Sync] Data keys:', Object.keys(serverData || {}));

      setSyncProgress({
        current: 70,
        total: 100,
        message: 'Data downloaded',
        stage: 'processing',
      });

      return serverData;
    } catch (error: any) {
      console.error('❌ [Sync] Download failed:', error);
      writeErrorLog('downloadServerData', error);
      throw error;
    }
  };

  /**
   * Insert downloaded data into local database
   */
  const insertDataToDatabase = async (data: any): Promise<void> => {
    try {
      console.log('💾 [Sync] Inserting data into database...');
      setSyncProgress({
        current: 75,
        total: 100,
        message: 'Saving to database...',
        stage: 'inserting',
      });

      // Ensure tables are created
      await createTables();

      // Insert all data
      await insertAllData(data);

      console.log('✅ [Sync] Data inserted successfully');
      setSyncProgress({
        current: 95,
        total: 100,
        message: 'Database updated',
        stage: 'complete',
      });
    } catch (error) {
      console.error('❌ [Sync] Database insertion failed:', error);
      writeErrorLog('insertDataToDatabase', error);
      throw error;
    }
  };

  /**
   * Main sync function
   */
  const doSync = useCallback(async ({ loaderState, onComplete, onError }: Props = {}) => {
    // Check internet connection
    if (!isNetConnected) {
      const msg = t('Alerts.AlertNoInternetMsg') || 'No internet connection. Please check your connection and try again.';
      window.alert(msg);
      onError?.(new Error('No internet connection'));
      return;
    }

    // Check authentication
    if (!userId) {
      window.alert('User not authenticated. Please login again.');
      onError?.(new Error('User not authenticated'));
      return;
    }

    const syncStartTime = Date.now();
    let syncSuccess = false;

    try {
      console.log('\n🔄 ========== SYNC STARTED ==========');
      console.log(`🕐 Start time: ${new Date().toISOString()}`);
      console.log(`👤 User ID: ${userId}`);
      
      setisLoading(true);
      loaderState?.(true);
      
      setSyncProgress({
        current: 5,
        total: 100,
        message: 'Initializing sync...',
        stage: 'downloading',
      });

      // Get auth token
      let authToken = token;
      if (!authToken) {
        console.log('🔐 [Sync] Getting token from storage...');
        authToken = await cacheStorage.getString(UserPreferenceKeys.AUTH_TOKEN) || '';
      }

      if (!authToken) {
        throw new Error('Authentication token not found. Please login again.');
      }

      writeLog('Sync', 'Sync started');

      // Step 1: Upload local changes (if any)
      const uploadSuccess = await uploadLocalData(authToken);
      if (!uploadSuccess) {
        console.warn('⚠️ [Sync] Upload failed, continuing with download...');
      }

      // Step 2: Download server data
      const serverData = await downloadServerData(authToken);

      // Step 3: Insert into database
      await insertDataToDatabase(serverData);

      // Update last sync time
      const syncTime = new Date().toISOString();
      await cacheStorage.setString(UserPreferenceKeys.LAST_SYNC_TIME, syncTime);
      console.log(`✅ [Sync] Last sync time updated: ${syncTime}`);

      // Complete
      setSyncProgress({
        current: 100,
        total: 100,
        message: 'Sync completed successfully!',
        stage: 'complete',
      });

      const syncDuration = Date.now() - syncStartTime;
      console.log(`✅ ========== SYNC COMPLETED ==========`);
      console.log(`⏱️  Duration: ${(syncDuration / 1000).toFixed(2)} seconds`);
      console.log(`🕐 End time: ${new Date().toISOString()}\n`);

      writeLog('Sync', `Sync completed in ${(syncDuration / 1000).toFixed(2)}s`);
      syncSuccess = true;

      // Show success message
      setTimeout(() => {
        window.alert(t('Alerts.AlertSyncSuccessMsg') || 'Data synchronized successfully!');
        onComplete?.();
      }, 500);

    } catch (error: any) {
      console.error('❌ ========== SYNC FAILED ==========');
      console.error(`🕐 Time: ${new Date().toISOString()}`);
      console.error(`❌ Error:`, error);
      
      writeErrorLog('doSync', error);
      
      setSyncProgress({
        current: 0,
        total: 100,
        message: 'Sync failed',
        stage: 'error',
      });

      // Show error message
      const errorMsg = error.message || 'Sync failed. Please try again.';
      window.alert(errorMsg);
      onError?.(error);

    } finally {
      // Cleanup
      setTimeout(() => {
        setSyncProgress(null);
        setisLoading(false);
        loaderState?.(false);
      }, syncSuccess ? 1500 : 500);
    }
  }, [userId, token, isNetConnected, t]);

  /**
   * Refresh data (download only, no upload)
   */
  const refreshData = useCallback(async ({ loaderState, onComplete, onError }: Props = {}) => {
    if (!isNetConnected) {
      const msg = t('Alerts.AlertNoInternetMsg') || 'No internet connection';
      window.alert(msg);
      return;
    }

    try {
      setisLoading(true);
      loaderState?.(true);

      setSyncProgress({
        current: 20,
        total: 100,
        message: 'Refreshing data...',
        stage: 'downloading',
      });

      // Get auth token
      let authToken = token;
      if (!authToken) {
        authToken = await cacheStorage.getString(UserPreferenceKeys.AUTH_TOKEN) || '';
      }

      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      // Download and insert data
      const serverData = await downloadServerData(authToken);
      await insertDataToDatabase(serverData);

      setSyncProgress({
        current: 100,
        total: 100,
        message: 'Data refreshed!',
        stage: 'complete',
      });

      setTimeout(() => {
        window.alert(t('Data refreshed successfully!'));
        onComplete?.();
      }, 500);

    } catch (error: any) {
      writeErrorLog('refreshData', error);
      setSyncProgress({
        current: 0,
        total: 100,
        message: 'Refresh failed',
        stage: 'error',
      });
      window.alert('Failed to refresh data. Please try again.');
      onError?.(error);
    } finally {
      setTimeout(() => {
        setSyncProgress(null);
        setisLoading(false);
        loaderState?.(false);
      }, 1000);
    }
  }, [userId, token, isNetConnected, t]);

  return {
    doSync,
    refreshData,
    syncProgress,
    isLoading,
  };
};

export default useSyncNow;
