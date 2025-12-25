import React, {useEffect, useState} from 'react';
import {
  Box,
  Typography,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import moment from 'moment';

// Web Alert replacement
const Alert = {
  alert: (title: string, message?: string, buttons?: any[]) => {
    if (buttons && buttons.length > 0) {
      const result = window.confirm(message || title);
      if (result && buttons[0]?.onPress) {
        buttons[0].onPress();
      }
    } else {
      window.alert(message || title);
    }
  }
};

// Web RNFS replacement
const RNFS = {
  DocumentDirectoryPath: '/documents',
  exists: async (path: string) => {
    return localStorage.getItem(path) !== null;
  },
  readFile: async (path: string, encoding: string) => {
    return localStorage.getItem(path) || '';
  },
  writeFile: async (path: string, content: string, encoding: string) => {
    localStorage.setItem(path, content);
  },
  unlink: async (path: string) => {
    localStorage.removeItem(path);
  },
  mkdir: async (path: string) => {
    // No-op for web
  },
  stat: async (path: string) => {
    const data = localStorage.getItem(path);
    const size = data ? new Blob([data]).size : 0;
    return {
      size,
      isFile: () => true,
      isDirectory: () => false,
      mtime: new Date(),
      ctime: new Date(),
    };
  }
};

// Responsive sizing helpers (web replacement for react-native-responsive-screen)
const hp = (percentage: number | string) => {
  const numPercent = typeof percentage === 'string' ? parseFloat(percentage) : percentage;
  return `${numPercent}vh`;
};

const wp = (percentage: number | string) => {
  const numPercent = typeof percentage === 'string' ? parseFloat(percentage) : percentage;
  return `${numPercent}vw`;
};
import {
  deleteCategoryDiscountItemByKey,
  deleteDiscountByKey,
  deleteImageDetailByKey,
  deleteImagesDetails,
  deleteNewPartyImage,
  deleteNewPartyImageDetailByKey,
  deleteNewPartyOutletByKey,
  deleteOrderDetailByKey,
  deleteOrderMasterByKey,
  deleteTABLE_Collection2,
  deleteTABLE_CollectionDetails2,
  deleteTABLE_Paymentreceipt2,
  deleteUsageLog,
  deleteUsageLogTimeStamp,
  getAssetDetailData,
  getAssetDetailData2,
  getCategoryDiscountItemSyncData,
  getCollectionsDetailSyncData,
  getCollectionsDetailSyncData2,
  getCollectionsSyncData,
  getCollectionsSyncData2,
  getDiscountSyncData,
  getDiscountSyncData2,
  getImageDetails,
  getImageDetailsyncData,
  getNewPartyImageDetailsyncData,
  getNewPartyImages,
  getNewPartyOutletSyncData,
  getOrderDetailsSyncData,
  getOrderDetailsSyncData2,
  getOrderMasterSyncData2,
  getOrderMasterSyncData6,
  getOrderMasterSyncDataForImage,
  getPaymentReceiptSyncData,
  getPaymentReceiptSyncData2,
  getSyncDataList,
  getSyncDataListforNewParty,
  getTABLE_TEMP_CategoryDiscountItem,
  getUsesLogSyncData,
  getnewPartyTargetId,
  updateCategoryDiscountItemSyncFlag,
  updateDiscountSyncFlag,
  updateNewPartyImageDetailSyncFlag,
  updateNewPartyOutletSyncFlag,
  updateOrderDetailSyncFlag,
  updateOrderMasterSyncFlag,
  updateimageDetailSyncFlag,
} from '../../database/SqlDatabase';
import {useLoginAction} from '../../redux/actionHooks/useLoginAction';
import Loader from '../../components/Loader/Loader';
import SyncProgressOverlay from '../../components/Progress/SyncProgressOverlay';
import {useGetData} from '../../hooks/useGetData';
import Apis, {postErrorReport} from '../../api/LoginAPICalls';
import {ScreenName} from '../../constants/screenConstants';
import {useGlobleAction} from '../../redux/actionHooks/useGlobalAction';
import {useCheckVersion} from '../../hooks/useCheckVersion';
import {useTranslation} from 'react-i18next';
import {
  dataSyncObjectKeys,
  writeActivityLog,
  writeErrorLog,
} from '../../utility/utils';
import CustomSafeView from '../../components/GlobalComponent/CustomSafeView';
import {clearUnwantedImageNewParty} from '../Shops/shopsUtils';
import {callPostDocumentApi} from '../../usecase/postDocumentUsecase';
import {
  processImageDataWithBatching,
  cleanupImagesAfterSync,
} from '../../utility/imageProcessingUtils';

interface ExpandListProps {
  navigation?: any;
  route: {
    params?: any;
  };
  loaderState?: any;
}

export function ExpandList(props: ExpandListProps) {
  const {navigation} = props;
  const {loaderState} = props;
  const navigate = useNavigate();
  const {t} = useTranslation();
  const [myArray, setMyArray] = useState<any>([]);
  const [selecteData, setSelectedData] = useState<any>({});
  const [openIndex, setOpenIndex] = useState<any>([]);
  const [applyArr, setApplyArr] = useState<any>([]);
  const [data, Setdata] = useState<any>([]);
  const [data55, Setdata55] = useState(false);
  const [isLoading, setisLoading] = useState(false);
  const [newPartyImagedetails, setnewPartyImagedetails] = useState<any>([]);
  const [issync, setsync] = useState(false);
  const [syncStartTimestamp, setSyncStartTimestamp] = useState<string | null>(
    null,
  );
  const [syncProgress, setSyncProgress] = useState<{
    current: number;
    total: number;
    message: string;
  } | null>(null);
  const [isSyncInProgress, setIsSyncInProgress] = useState(false);

  const {setSyncFlag, syncFlag, isWhatsAppOrderPostDocument} =
    useGlobleAction();
  const {checkVersionForUpdateAlert} = useCheckVersion();

  const {doGetData} = useGetData();
  const {enteredUserName, userPassword, savedClientCode, deviceId, userId} =
    useLoginAction();

  useEffect(() => {
    takeDataFromDB();
  }, []);

  const takeDataFromDB = async () => {
    checkVersionForUpdateAlert(() => {});
    // getSyncDataList().then((data1: any) => {
    //   Setdata(data1);
    // });
    // const newPartyData = await getSyncDataListforNewParty();
    // console.log('\n newPartyData -->', newPartyData);

    const orders: any = await getSyncDataList();

    const newPartyOrders: any = await getSyncDataListforNewParty();
    const mergedData = [...orders, ...newPartyOrders];
    Setdata(mergedData);
  };

  useEffect(() => {
    // console.log('inside Extended list');
    objfunc();
  }, [data]);

  async function getAllOrderMasterData(collectedMGK: string[]) {
    const results = await Promise.allSettled<any>([
      getOrderMasterSyncData2(collectedMGK),
      getOrderMasterSyncData6('N'),
    ]);

    const [orderMasterResult, orderMasterUnselectedDataResult] = results;

    // Merge the results into a single array
    const mergedData = [
      ...(orderMasterResult.status === 'fulfilled' &&
      orderMasterResult.value.length > 0
        ? orderMasterResult.value
        : []),
      ...(orderMasterUnselectedDataResult.status === 'fulfilled' &&
      orderMasterUnselectedDataResult.value.length > 0
        ? orderMasterUnselectedDataResult.value
        : []),
    ];

    return mergedData;
  }

  const collectSyncData = async (collectedMGK: string[]) => {
    console.log('🔄 collectSyncData called with MGK keys:', collectedMGK);

    if (collectedMGK.length == 0) {
      // No selection - collect always-sync data and return for size calculation
      return await collectSyncData2();
    } else {
      // console.log('inside coll sync data');

      const JSONObj: any = {};
      console.log(' Valid before:1');
      await clearUnwantedImageNewParty();
      console.log(' Valid after:1');
      const results = await Promise.allSettled<any>([
        getOrderDetailsSyncData2(collectedMGK),
        getNewPartyOutletSyncData(),
        getnewPartyTargetId(),
        getUsesLogSyncData(),
        getCollectionsSyncData2(collectedMGK),
        getCollectionsDetailSyncData2(collectedMGK),
        getTABLE_TEMP_CategoryDiscountItem(collectedMGK),
        getPaymentReceiptSyncData2(collectedMGK),
        getDiscountSyncData2(collectedMGK),
        getAssetDetailData2(collectedMGK),
      ]);

       console.log('\n results -->', results, JSONObj);

      const [
        orderDetailsResult,
        newPartyOutletResult,
        newPartyTargetIdResult,
        usesLogDataResult,
        collectionsDataResult,
        collectionsDetailDataResult,
        categoryDiscountItemDataResult,
        paymentReceiptDataResult,
        discountDataResult,
        assetDetailDataResult,
      ] = results;

      const OrdeMasterData = await getAllOrderMasterData(collectedMGK);
      // console.log('\n OrdeMasterData -->', OrdeMasterData);

      if (OrdeMasterData.length > 0) {
        // ✅ CRITICAL FIX: Filter out collection_type='3' (image-related OrderMaster) from pre-batch
        // Pre-batch should only contain activities (collection types 0,1,2,4,5,6,7,8,9)
        const filteredOrderMaster = OrdeMasterData.filter(
          (order: any) =>
            order.CollectionType !== '3' && order.collection_type !== '3',
        );

        if (filteredOrderMaster.length > 0) {
          JSONObj[dataSyncObjectKeys.OrderMaster] = filteredOrderMaster;
          console.log(
            `✅ Added ${
              filteredOrderMaster.length
            } OrderMaster records to ExpandList JSONObj (excluded ${
              OrdeMasterData.length - filteredOrderMaster.length
            } image-related records)`,
          );
        } else {
          console.log(
            `📋 No non-image OrderMaster records found for selected MGK keys`,
          );
        }
      }

      // ✅ CORRECTED LOGIC: Image-related OrderMaster (collection_type='3') should NOT be in pre-batch
      // They will be added separately in image phases with their corresponding ImageDetails
      console.log(
        '📋 ExpandList: Pre-batch contains only non-image activities (collection types 0,1,2,4,5,6,7,8,9)',
      );

      if (
        orderDetailsResult.status === 'fulfilled' &&
        orderDetailsResult.value.length > 0
      )
        JSONObj[dataSyncObjectKeys.OrderDetails] = orderDetailsResult.value;

      if (
        newPartyOutletResult.status === 'fulfilled' &&
        newPartyOutletResult.value.length > 0
      )
        JSONObj[dataSyncObjectKeys.NewParty] = newPartyOutletResult.value;

      if (
        newPartyTargetIdResult.status === 'fulfilled' &&
        newPartyTargetIdResult.value.length > 0
      )
        JSONObj[dataSyncObjectKeys.newPartyTargetId] =
          newPartyTargetIdResult.value;

      if (
        usesLogDataResult.status === 'fulfilled' &&
        usesLogDataResult.value.length > 0
      )
        JSONObj[dataSyncObjectKeys.LogUsages] = usesLogDataResult.value;

      if (
        collectionsDataResult.status === 'fulfilled' &&
        collectionsDataResult.value.length > 0
      )
        JSONObj[dataSyncObjectKeys.Collections] = collectionsDataResult.value;

      if (
        collectionsDetailDataResult.status === 'fulfilled' &&
        collectionsDetailDataResult.value.length > 0
      )
        JSONObj[dataSyncObjectKeys.CollectionsDetails] =
          collectionsDetailDataResult.value;

      if (
        categoryDiscountItemDataResult.status === 'fulfilled' &&
        categoryDiscountItemDataResult.value.length > 0
      )
        JSONObj[dataSyncObjectKeys.CategoryDiscountItem] =
          categoryDiscountItemDataResult.value;

      if (
        paymentReceiptDataResult.status === 'fulfilled' &&
        paymentReceiptDataResult.value.length > 0
      )
        JSONObj[dataSyncObjectKeys.PaymentReceipt] =
          paymentReceiptDataResult.value;

      if (
        discountDataResult.status === 'fulfilled' &&
        discountDataResult.value.length > 0
      )
        JSONObj[dataSyncObjectKeys.Discount] = discountDataResult.value;

      if (
        assetDetailDataResult.status === 'fulfilled' &&
        assetDetailDataResult.value.length > 0
      )
        JSONObj[dataSyncObjectKeys.AssetDetails] = assetDetailDataResult.value;

      // ✅ ACTIVITIES-FIRST FIX: Don't process images during data collection
      // Images will be processed later in the activities-first pre-batch logic
      console.log(
        '🖼️ ACTIVITIES-FIRST: Skipping image processing during data collection...',
      );
      console.log(
        '📋 Images will be processed after activities in the multi-phase sync logic',
      );

      // ✅ Store image metadata for later processing (don't read the actual images yet)
      try {
        console.log(
          '🔍 Getting image metadata for planning (not processing images yet)...',
        );
        const imageDetails = (await getImageDetailsyncData()) as any[];
        const newPartyImages =
          (await getNewPartyImageDetailsyncData()) as any[];

        if (imageDetails && imageDetails.length > 0) {
          console.log(
            `📊 Found ${imageDetails.length} ImageDetails for later processing`,
          );
          // Store metadata only - don't process images yet
          JSONObj._imageDetailsMetadata = imageDetails;
        }

        if (newPartyImages && newPartyImages.length > 0) {
          console.log(
            `📊 Found ${newPartyImages.length} NewPartyImages for later processing`,
          );
          // Store metadata only - don't process images yet
          JSONObj._newPartyImagesMetadata = newPartyImages;
        }

        console.log('✅ Image metadata stored for activities-first processing');
      } catch (error) {
        console.error('❌ Error getting image metadata:', error);
        writeErrorLog(
          'Image metadata collection error in collectSyncData',
          error,
        );
      }

      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(
            `Error fetching data for index ${index}:`,
            result.reason,
          );
          writeErrorLog('collectSyncData', result.reason);
        }
      });

      console.log(
        '📦 collectSyncData completed, data keys:',
        Object.keys(JSONObj),
      );


      console.log("Shankar Gade json checking",JSONObj);
      

      return JSONObj;
    }

    async function collectSyncData2() {
      //  console.log('\n inside collectSyncData2 func');

      const JSONObj: any = {};
      console.log(' Valid before:2');
      await clearUnwantedImageNewParty();
      console.log(' Valid after:2');
      const results = await Promise.allSettled<any>([
        getOrderMasterSyncData6('N'),
        getOrderDetailsSyncData(),
        getNewPartyOutletSyncData(),
        getnewPartyTargetId(),
        getUsesLogSyncData(),
        getCollectionsSyncData(),
        getCollectionsDetailSyncData(),
        getCategoryDiscountItemSyncData(),
        getPaymentReceiptSyncData(),
        getDiscountSyncData(),
        getAssetDetailData(),
      ]);

      const [
        orderMasterResult,
        orderDetailsResult,
        newPartyOutletResult,
        newPartyTargetIdResult,
        usesLogDataResult,
        collectionsDataResult,
        collectionsDetailDataResult,
        categoryDiscountItemDataResult,
        paymentReceiptDataResult,
        discountDataResult,
        assetDetailDataResult,
      ] = results;

      // ✅ NO SELECTION = NewParty, NewPartyTargetId, UsageLogs + OrderMaster(collection_type=4,8,9) for attendance
      // OrderMaster(collection_type=3) will be handled with images in image batches
      console.log(
        '📋 No selection - processing always-sync data: OrderMaster(attendance 4,8,9), NewParty, UsageLogs',
      );

      // ✅ OrderMaster with collection_type=4,8,9 (attendance and check-in activities)
      if (
        orderMasterResult.status === 'fulfilled' &&
        orderMasterResult.value.length > 0
      ) {
        JSONObj[dataSyncObjectKeys.OrderMaster] = orderMasterResult.value;
        console.log(
          `✅ collectSyncData2: Added ${orderMasterResult.value.length} attendance OrderMaster records (collection_type=4,8,9)`,
        );
      }

      if (
        newPartyOutletResult.status === 'fulfilled' &&
        newPartyOutletResult.value.length > 0
      ) {
        JSONObj[dataSyncObjectKeys.NewParty] = newPartyOutletResult.value;
        console.log(
          `✅ collectSyncData2: Added ${newPartyOutletResult.value.length} NewParty records`,
        );
      } else {
        console.log(
          `📋 collectSyncData2: NewParty result - Status: ${
            newPartyOutletResult.status
          }, Count: ${
            newPartyOutletResult.status === 'fulfilled'
              ? newPartyOutletResult.value.length
              : 'N/A'
          }`,
        );
      }

      if (
        newPartyTargetIdResult.status === 'fulfilled' &&
        newPartyTargetIdResult.value.length > 0
      ) {
        JSONObj[dataSyncObjectKeys.newPartyTargetId] =
          newPartyTargetIdResult.value;
        console.log(
          `✅ collectSyncData2: Added ${newPartyTargetIdResult.value.length} NewPartyTarget records`,
        );
      } else {
        console.log(
          `📋 collectSyncData2: NewPartyTarget result - Status: ${
            newPartyTargetIdResult.status
          }, Count: ${
            newPartyTargetIdResult.status === 'fulfilled'
              ? newPartyTargetIdResult.value.length
              : 'N/A'
          }`,
        );
      }

      if (
        usesLogDataResult.status === 'fulfilled' &&
        usesLogDataResult.value.length > 0
      ) {
        JSONObj[dataSyncObjectKeys.LogUsages] = usesLogDataResult.value;
        console.log(
          `✅ collectSyncData2: Added ${usesLogDataResult.value.length} Usage logs`,
        );
      }

      // ✅ NO-SELECTION FIX: Don't process images during data collection
      // For no-selection, images will be processed FIRST (since no activities selected)
      console.log(
        '🖼️ NO-SELECTION: Storing image metadata for processing (images will sync first)...',
      );

      try {
        // EARLY DETECTION: Check image count before processing
        const [imageDetailsCount, newPartyImagesCount] = await Promise.all([
          getImageDetailsyncData().then(data =>
            Array.isArray(data) ? data.length : 0,
          ),
          getNewPartyImageDetailsyncData().then(data =>
            Array.isArray(data) ? data.length : 0,
          ),
        ]);

        const totalImageCount = imageDetailsCount + newPartyImagesCount;
        console.log(
          `📊 Found ${totalImageCount} total images (${imageDetailsCount} ImageDetails + ${newPartyImagesCount} NewPartyImages)`,
        );

        const EARLY_PHASE_THRESHOLD = 40; // If >40 images, skip full processing and use phasing

        if (totalImageCount > EARLY_PHASE_THRESHOLD) {
          console.log(
            `🔄 Large image dataset detected (${totalImageCount} > ${EARLY_PHASE_THRESHOLD}). Will use multi-phase sync.`,
          );
          console.log(
            '⚠️ Skipping full image processing in collectSyncData2 to prevent memory crashes',
          );

          // Add minimal placeholder to trigger phasing logic later
          JSONObj._needsPhasing = true;
          JSONObj._totalImageCount = totalImageCount;
        } else {
          console.log(
            `📦 Normal image count (${totalImageCount} ≤ ${EARLY_PHASE_THRESHOLD}). Will store metadata for processing.`,
          );

          // ✅ Store image metadata for later processing (don't read the actual images yet)
          console.log(
            '🔍 Getting image metadata for planning (not processing images yet)...',
          );
          const imageDetails = (await getImageDetailsyncData()) as any[];
          const newPartyImages =
            (await getNewPartyImageDetailsyncData()) as any[];

          if (imageDetails && imageDetails.length > 0) {
            console.log(
              `📊 Found ${imageDetails.length} ImageDetails for later processing`,
            );
            // Store metadata only - don't process images yet
            JSONObj._imageDetailsMetadata = imageDetails;
          }

          if (newPartyImages && newPartyImages.length > 0) {
            console.log(
              `📊 Found ${newPartyImages.length} NewPartyImages for later processing`,
            );
            // Store metadata only - don't process images yet
            JSONObj._newPartyImagesMetadata = newPartyImages;
          }

          console.log(
            '✅ Image metadata stored for no-selection processing (images will sync first)',
          );
        }
      } catch (error) {
        console.error(
          '❌ Error getting image metadata in collectSyncData2:',
          error,
        );
        writeErrorLog(
          'Image metadata collection error in collectSyncData2',
          error,
        );
      }

      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(
            `Error fetching data for index ${index}:`,
            result.reason,
          );
          writeErrorLog('collectSyncData', result.reason);
        }
      });

      console.log(
        '📦 collectSyncData2 completed, data keys:',
        Object.keys(JSONObj),
      );

      // ✅ DETAILED LOGGING: Show what data was actually collected
      Object.keys(JSONObj).forEach(key => {
        if (key.startsWith('_')) {
          console.log(
            `📋 Metadata: ${key} = ${
              Array.isArray(JSONObj[key]) ? JSONObj[key].length : 'N/A'
            } items`,
          );
        } else {
          console.log(
            `📋 Data: ${key} = ${
              Array.isArray(JSONObj[key]) ? JSONObj[key].length : 'N/A'
            } items`,
          );
        }
      });

      return JSONObj;
    }
  };

  async function GetNewData() {
    doGetData({
      isFromScreen: true,
      loaderState: (val: boolean) => {
        setisLoading?.(val);
      },
    });
    navigate('/dashboard');
  }
  const handleResponseData = async (
    responseData: any,
    syncStartTime: any,
    selectedMGKKeys?: string[],
    isPartOfMultiPhase = false,
  ) => {
    console.log('🔍 Raw response received:', responseData);
    console.log(
      `🔍 handleResponseData called with isPartOfMultiPhase=${isPartOfMultiPhase}`,
    );

    // Handle different response structures
    let actualData = responseData?.Data || responseData?.data || responseData;

    // Check if response has code/message structure (alternative API response format)
    if (actualData?.code !== undefined && actualData?.message !== undefined) {
      console.log('📋 Alternative response format detected');
      console.log('📊 Response code:', actualData.code);
      console.log('📊 Response message:', actualData.message);

      // Handle success case for alternative format
      if (actualData.code === 200 || actualData.code === '200') {
        if (!isPartOfMultiPhase) {
          // Only show final UI updates if NOT part of multi-phase sync
          setisLoading(false);
          setIsSyncInProgress(false);
          setSyncProgress(null);
          window.alert(actualData.message || 'Data saved successfully');
          navigate('/dashboard');
        }
        return;
      } else if (actualData.code === 10 || actualData.code === '10') {
        // Handle image data validation error - cleanup corrupted entries
        console.log(
          '⚠️ Image data validation error detected - triggering cleanup',
        );
        if (!isPartOfMultiPhase) {
          setisLoading(false);
          setIsSyncInProgress(false);
          setSyncProgress(null);
        }

        if (window.confirm(
          'Data Sync Issue\n\nSome order entries are missing required image data. These entries will be cleaned up to prevent future sync issues.\n\nMessage: ' +
            actualData.message + '\n\nClick OK to clean up and continue.'
        )) {
          (async () => {
                try {
                  console.log(
                    '🧹 Starting cleanup for corrupted image data entries...',
                  );

                  // For selected sync, clean up the specific MGK keys that caused issues
                  if (selectedMGKKeys && selectedMGKKeys.length > 0) {
                    console.log(
                      '🗑️ Cleaning up selected MGK entries:',
                      selectedMGKKeys,
                    );

                    // Delete OrderMaster entries that don't have proper image data
                    for (const mgk of selectedMGKKeys) {
                      try {
                        await deleteOrderMasterByKey(mgk);
                        await deleteOrderDetailByKey(mgk);
                        await deleteImageDetailByKey(mgk);
                        console.log(`✅ Cleaned up corrupted entry: ${mgk}`);
                      } catch (cleanupError) {
                        console.error(
                          `❌ Failed to cleanup entry ${mgk}:`,
                          cleanupError,
                        );
                        writeErrorLog(
                          `Cleanup failed for MGK: ${mgk}`,
                          cleanupError,
                        );
                      }
                    }

                    // Also clean up any orphaned images that don't belong to any OrderMaster
                    try {
                      console.log(
                        '🧹 Checking for orphaned images to cleanup...',
                      );

                      // Get all unsynced images
                      const allUnsyncedImages =
                        (await getImageDetails()) as any[];
                      let cleanedOrphanedImages = 0;

                      for (const image of allUnsyncedImages) {
                        try {
                          // Check if this image's OrderID exists in OrderMaster
                          const orderExists = (await getOrderMasterSyncData2([
                            image.order_id,
                          ])) as any[];

                          if (!orderExists || orderExists.length === 0) {
                            // This is an orphaned image - delete it
                            await deleteImageDetailByKey(image.order_id);

                            // Also delete the physical file if it exists
                            if (image.Path) {
                              const imageData = localStorage.getItem(image.Path);
                              if (imageData !== null) {
                                localStorage.removeItem(image.Path);
                                console.log(
                                  `🗑️ Deleted orphaned image file: ${image.ImageName}`,
                                );
                              }
                            }

                            cleanedOrphanedImages++;
                            console.log(
                              `🗑️ Cleaned up orphaned image: ${image.ImageName} (OrderID: ${image.order_id})`,
                            );
                          }
                        } catch (orphanError) {
                          console.error(
                            `❌ Error checking orphaned image ${image.ImageName}:`,
                            orphanError,
                          );
                        }
                      }

                      if (cleanedOrphanedImages > 0) {
                        console.log(
                          `✅ Cleaned up ${cleanedOrphanedImages} orphaned images`,
                        );
                      } else {
                        console.log('ℹ️ No orphaned images found');
                      }
                    } catch (orphanCleanupError) {
                      console.error(
                        '❌ Error during orphaned image cleanup:',
                        orphanCleanupError,
                      );
                      writeErrorLog(
                        'Orphaned image cleanup error',
                        orphanCleanupError,
                      );
                    }

                    window.alert('Cleanup Complete\n\nCorrupted entries have been removed. You can try syncing again.');
                    navigate('/dashboard');
                  } else {
                    navigate('/dashboard');
                  }
                } catch (error) {
                  console.error('❌ Error during cleanup process:', error);
                  writeErrorLog('Image data cleanup error', error);
                  window.alert('Cleanup Error\n\nFailed to clean up corrupted entries. Please try again later.');
                  navigate('/dashboard');
                }
              })();
            }
        return;
      } else {
        // Handle other error cases for alternative format
        if (!isPartOfMultiPhase) {
          setisLoading(false);
          setIsSyncInProgress(false);
          setSyncProgress(null);
          window.alert('Sync Error\n\n' + (actualData.message || 'An error occurred during sync'));
        }
        return;
      }
    }

    // Original response format handling
    const {SavedData, Status, NotSavedData} = actualData;
    console.log(
      '📊 Standard response format - SavedData:',
      SavedData?.length,
      'NotSavedData:',
      NotSavedData?.length,
    );

    if (
      (!SavedData || SavedData.length === 0) &&
      (!NotSavedData || NotSavedData.length === 0) &&
      Status == null
    ) {
      console.error(`🚨 CRITICAL: Empty SavedData response detected!`);
      console.error(
        `🚨 This indicates a server-side issue or missing OrderMaster records`,
      );
      console.error(`🚨 Response structure:`, {
        SavedData: SavedData?.length,
        NotSavedData: NotSavedData?.length,
        Status,
      });

      if (!isPartOfMultiPhase) {
        // ✅ ENHANCED ERROR HANDLING: Provide detailed error information
        if (window.confirm(`Sync Warning\n\nServer returned empty response. This may indicate:\n\n• Missing OrderMaster records for images\n• Server-side processing error\n• Data format issues\n\nPlease check logs and retry sync.\n\nClick OK to retry, Cancel to continue.`)) {
          // Allow user to retry sync
          setisLoading(false);
          setIsSyncInProgress(false);
          setSyncProgress(null);
        }

        // Only reset UI states if NOT part of multi-phase sync
        setisLoading(false);
        setIsSyncInProgress(false);
        setSyncProgress(null);
        navigate('/dashboard');
      }
      return;
    }

    if (NotSavedData && NotSavedData.length > 0) {
      const notSavedKeys = NotSavedData.map(
        (item: any) => item.MobileGenPrimaryKey,
      ).join('\n');

      handleDeleteUnsyncedKeys(NotSavedData, notSavedKeys);
    }

    if (SavedData?.length > 0) {
      // Update sync flags for all saved data
      await Promise.all(
        SavedData.map(async (data: any) => {
          const key = data.MobileGenPrimaryKey;
          console.log('🏷️ Updating sync flags for MGK:', key);

          try {
            await updateOrderMasterSyncFlag(key);
            await updateOrderDetailSyncFlag(key);
            await updateimageDetailSyncFlag(key); // ✅ This is actually correct for the current sync logic
            await updateDiscountSyncFlag(key);
            await updateCategoryDiscountItemSyncFlag(key);
            await updateNewPartyOutletSyncFlag(key);
            await updateNewPartyImageDetailSyncFlag(key);
            await deleteTABLE_Collection2(key);
            await deleteTABLE_CollectionDetails2(key);
            await deleteTABLE_Paymentreceipt2(key);
          } catch (error) {
            writeErrorLog('Error with MobileGenPrimaryKey: ' + key, error);
            console.error('Error processing MobileGenPrimaryKey:', key, error);
          }
        }),
      );

      // Use the new unified cleanup function for images
      const savedMGKs = SavedData.map(
        (item: any) => item.MobileGenPrimaryKey,
      ).filter(Boolean);
      if (savedMGKs.length > 0) {
        console.log('🧹 Cleaning up images for saved MGK keys:', savedMGKs);
        await cleanupImagesAfterSync(savedMGKs);
      }

      // Clean up usage logs
      if (syncStartTime) {
        console.log('🗑️ Cleaning up usage logs from:', syncStartTime);
        await deleteUsageLogTimeStamp(syncStartTime);
      }
      setSyncFlag(!syncFlag);
      isWhatsAppOrderPostDocument &&
        callPostDocumentApi(SavedData, enteredUserName);
      if (Status && Status !== 'Data saved successfully.') {
        //  console.log('i am into notsaved');

        const notSavedKeys = NotSavedData.map(
          (item: any) => item.MobileGenPrimaryKey,
        ).join('\n');

        handleDeleteUnsyncedKeys(NotSavedData, notSavedKeys);
      } else {
        if (!isPartOfMultiPhase) {
          // Only show final success alert and navigation if NOT part of multi-phase sync
          console.log(
            '🎯 Showing success alert because isPartOfMultiPhase=false',
          );
          if (!Status) {
            GetNewData();
          } else {
            if (window.confirm(t('Alerts.AlertZyleminiPlusTitle') + '\n\n' + Status)) {
              GetNewData();
            }
          }
        } else {
          console.log(
            '🔄 Skipping success alert because isPartOfMultiPhase=true - continuing to next phase',
          );
        }
        // If part of multi-phase sync, skip UI updates and continue to next phase
      }
    }
    // syncUnSelectedData();
  };

  const deleteUnsyncedKeys = async (notSavedData: any[]) => {
    const dataCollected2 = await collectSyncData(
      notSavedData.map(item => item.MobileGenPrimaryKey),
    );
    // console.log('Unsynceddata', dataCollected2);

    if (Object.keys(dataCollected2).length > 0) {
      const headers12: any = {
        UserId: userId,
        ClientCode: savedClientCode,
      };
      // console.log(headers12);

      try {
        await postErrorReport(headers12, dataCollected2);
        console.log('Data Posted to server');
      } catch (error) {
        console.log('Report Error API Error', error);
      }
    }

    try {
      for (const item of notSavedData) {
        const key = item.MobileGenPrimaryKey;
        await deleteOrderMasterByKey(key);
        await deleteOrderDetailByKey(key);
        await deleteImageDetailByKey(key);
        await deleteDiscountByKey(key);
        await deleteCategoryDiscountItemByKey(key);
        await deleteNewPartyOutletByKey(key);
        await deleteNewPartyImageDetailByKey(key);
        deleteTABLE_Collection2(key);
        deleteTABLE_CollectionDetails2(key);
        deleteTABLE_Paymentreceipt2(key);
      }
      //  console.log('Unsynced keys deleted successfully');
    } catch (error) {
      console.error('Error deleting unsynced keys:', error);
    }
  };

  const handleDeleteUnsyncedKeys = async (
    notSavedData: any[],
    notSavedKeys: string,
  ) => {
    await deleteUnsyncedKeys(notSavedData);
    window.alert(t('Alerts.AlertZyleminiPlusTitle') + '\n\nThe following keys were not saved and deleted:\n' + notSavedKeys);
    setisLoading(false);
    navigate('/dashboard');
  };

  const refreshAuthToken = async () => {
    try {
      const payload = {
        LoginId: enteredUserName,
        Password: userPassword,
        ClientCode: savedClientCode,
        DeviceId: deviceId,
      };

      const response = await Apis.postAuthToken(payload);
      writeActivityLog(`Generated Token is  ${response?.data?.Token} `);
      if (response?.data?.Token) {
        return response.data.Token;
      } else {
        throw new Error('Token not found in response');
      }
    } catch (error) {
      writeErrorLog('refreshAuthToken error', error);
      Alert.alert('Token Error', 'Please Try Again Later');
      setisLoading(false);
      console.error('Failed to refresh auth token:', error);
      return null;
    }
  };

  const refreshAuthTokenWithRetry = async (
    maxRetries = 3,
  ): Promise<string | null> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const payload = {
          LoginId: enteredUserName,
          Password: userPassword,
          ClientCode: savedClientCode,
          DeviceId: deviceId,
        };

        console.log(`🔐 Auth attempt ${attempt}/${maxRetries}`);
        const response = await Apis.postAuthToken(payload);
        writeActivityLog(`Generated Token is ${response?.data?.Token}`);

        if (response?.data?.Token) {
          console.log(`✅ Auth successful on attempt ${attempt}`);
          return response.data.Token;
        } else {
          throw new Error('Token not found in response');
        }
      } catch (error) {
        writeErrorLog(`Token refresh attempt ${attempt} failed`, error);
        console.error(`❌ Auth attempt ${attempt} failed:`, error);

        if (attempt === maxRetries) {
          console.error(
            `🚨 CRITICAL: Authentication failed after ${maxRetries} attempts`,
          );
          console.error(`🚨 This will cause sync to fail completely`);
          Alert.alert(
            'Authentication Error',
            `Failed to authenticate after ${maxRetries} attempts. This may indicate:\n\n• Network connectivity issues\n• Server authentication problems\n• Invalid credentials\n\nPlease check your connection and try again.`,
          );
          return null;
        }

        // ✅ ENHANCED TOKEN RETRY: Exponential backoff with detailed logging
        const retryDelay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(
          `⏳ Waiting ${retryDelay / 1000}s before retry attempt ${
            attempt + 1
          }...`,
        );

        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
    return null;
  };

  const postSyncDataWithTimeout = async (
    token: string,
    data: any,
  ): Promise<any> => {
    // ✅ OPTIMIZED TIMEOUT STRATEGY: Fast for small batches, adaptive for large batches
    const dataSizeKB = JSON.stringify(data).length / 1024;
    const baseSizeMB = dataSizeKB / 1024;

    // ✅ PERFORMANCE OPTIMIZED: Timeouts account for image processing + network time
    let adaptiveTimeout;
    if (baseSizeMB <= 0.5) {
      // Small batches (≤0.5MB): 45 seconds - activities + small images
      // Breakdown: 15s processing + 30s network buffer
      adaptiveTimeout = 45000;
    } else if (baseSizeMB <= 2) {
      // Medium batches (0.5-2MB): 90 seconds - mixed data with images
      // Breakdown: 30s processing + 60s network buffer
      adaptiveTimeout = 90000;
    } else if (baseSizeMB <= 5) {
      // Large batches (2-5MB): 3 minutes - accommodate heavy image processing
      // Breakdown: 60s processing + 120s network buffer
      adaptiveTimeout = 180000;
    } else if (baseSizeMB <= 10) {
      // Very large batches (5-10MB): 4 minutes - multiple large images
      // Breakdown: 90s processing + 150s network buffer
      adaptiveTimeout = 240000;
    } else {
      // Massive batches (>10MB): 6 minutes - handle extreme image datasets
      // Breakdown: 120s processing + 240s network buffer
      adaptiveTimeout = 360000;
    }

    // ✅ ENHANCED TIMEOUT MONITORING: Add timeout warnings and diagnostics
    if (adaptiveTimeout > 300000) {
      // > 5 minutes
      console.warn(
        `⚠️ WARNING: Using extended timeout (${
          adaptiveTimeout / 1000
        }s) for large dataset (${baseSizeMB.toFixed(2)}MB)`,
      );
      console.warn(`⚠️ Consider using multi-phase sync for better performance`);
    }

    console.log(
      `🕐 OPTIMIZED TIMEOUT: ${baseSizeMB.toFixed(2)}MB data → ${
        adaptiveTimeout / 1000
      }s timeout (${
        baseSizeMB <= 0.5
          ? 'FAST'
          : baseSizeMB <= 2
          ? 'NORMAL'
          : baseSizeMB <= 5
          ? 'LARGE'
          : baseSizeMB <= 10
          ? 'VERY_LARGE'
          : 'MASSIVE'
      } batch)`,
    );

    return new Promise(async (resolve, reject) => {
      const startTime = Date.now();
      const timeoutId = setTimeout(() => {
        const elapsedSeconds = (Date.now() - startTime) / 1000;
        console.error(
          `🚨 CRITICAL: NETWORK TIMEOUT after ${elapsedSeconds.toFixed(
            1,
          )}s: Server did not respond within ${adaptiveTimeout / 1000}s`,
        );
        console.error(
          `📊 Failed request details: ${baseSizeMB.toFixed(2)}MB, ${
            Object.keys(data).length
          } data types`,
        );
        console.error(`🔍 Data keys: ${Object.keys(data).join(', ')}`);
        console.error(
          `🌐 Network diagnostics: Request started at ${new Date(
            startTime,
          ).toISOString()}`,
        );

        // ✅ ENHANCED TIMEOUT ERROR: Provide actionable error message
        reject(
          new Error(
            `Network timeout after ${elapsedSeconds.toFixed(
              1,
            )}s - server did not respond in time (${
              adaptiveTimeout / 1000
            }s limit). This may indicate server overload or network issues. Consider retrying with smaller batches.`,
          ),
        );
      }, adaptiveTimeout);

      try {
        writeActivityLog(`Posting Data with Token ${token}`);
        console.log(
          `📊 Posting data: ${baseSizeMB.toFixed(2)}MB, ${
            Object.keys(data).length
          } data types`,
        );
        console.log(`⏱️ Network timeout set to: ${adaptiveTimeout / 1000}s`);
        console.log(`🕐 Request start time: ${new Date().toISOString()}`);

        // ✅ ENHANCED LOGGING: Track request timing
        const networkStartTime = Date.now();
        const response = await Apis.postData(data, token);
        const networkDuration = Date.now() - networkStartTime;

        writeActivityLog(`Post Api Hit Successfully in ${networkDuration}ms`);
        console.log(`✅ Post Data response received in ${networkDuration}ms`);
        console.log(`🕐 Response received time: ${new Date().toISOString()}`);
        console.log('📋 Response structure preview:', {
          hasData: !!response?.Data,
          hasdata: !!response?.data,
          topLevelKeys: Object.keys(response || {}),
          responseType: typeof response,
        });

        clearTimeout(timeoutId);
        resolve(response);
      } catch (error: any) {
        clearTimeout(timeoutId);
        const elapsedSeconds = (Date.now() - startTime) / 1000;

        // ✅ ENHANCED ERROR LOGGING: Distinguish between network and server errors
        console.error(`❌ Request failed after ${elapsedSeconds.toFixed(1)}s`);
        console.error(
          `🔍 Error type: ${error.code || error.name || 'Unknown'}`,
        );
        console.error(
          `📊 Failed request: ${baseSizeMB.toFixed(2)}MB, ${
            Object.keys(data).length
          } data types`,
        );

        if (
          error.code === 'ECONNABORTED' ||
          error.message.includes('timeout')
        ) {
          console.error(
            `🌐 NETWORK TIMEOUT: Request took too long (>${
              adaptiveTimeout / 1000
            }s)`,
          );
          writeErrorLog(
            `Network timeout after ${elapsedSeconds.toFixed(1)}s`,
            error,
          );
        } else if (error.response?.status) {
          console.error(`🔴 SERVER ERROR: HTTP ${error.response.status}`);
          writeErrorLog(`Server error HTTP ${error.response.status}`, error);
        } else {
          console.error(`❓ CONNECTION ERROR: ${error.message}`);
          writeErrorLog(
            'Connection error during postSyncDataWithTimeout',
            error,
          );
        }

        reject(error);
      }
    });
  };

  // DEPRECATED: Use postSyncDataWithTimeout instead for better timeout handling
  const postSyncData = async (token: string, data: any): Promise<any> => {
    console.log(
      '⚠️ DEPRECATED: postSyncData called - using postSyncDataWithTimeout instead',
    );
    return postSyncDataWithTimeout(token, data);
  };

  // Enhanced utility functions
  const calculateJsonSizeInMB = (jsonObject: any): number => {
    try {
      const jsonString = JSON.stringify(jsonObject);
      const sizeInBytes = new Blob([jsonString]).size;
      const sizeInMB = sizeInBytes / (1024 * 1024);
      const roundedSize = parseFloat(sizeInMB.toFixed(2));
      console.log('Data Size in MB', roundedSize);
      return roundedSize;
    } catch (error) {
      console.error('Error calculating JSON size:', error);
      writeErrorLog('calculateJsonSizeInMB error', error);
      return 0;
    }
  };

  // ✅ PROGRESSIVE BATCH CREATION: Estimate image size before Base64 conversion
  const estimateImageSizeInMB = async (imagePath: string): Promise<number> => {
    try {
      const stats = await RNFS.stat(imagePath);
      // Base64 encoding increases size by ~33% (4/3 ratio)
      const base64Size = (stats.size * 4) / 3;
      const sizeInMB = base64Size / (1024 * 1024);
      return parseFloat(sizeInMB.toFixed(2));
    } catch (error) {
      console.warn(`⚠️ Could not estimate size for ${imagePath}:`, error);
      return 0;
    }
  };

  // ✅ DYNAMIC IMAGE FILTERING: Remove images that would exceed size threshold
  const filterImagesBySize = async (
    imageDetails: any[],
    newPartyImages: any[],
    maxSizeMB: number,
  ): Promise<{
    filteredImageDetails: any[];
    filteredNewPartyImages: any[];
    omittedImageDetails: any[];
    omittedNewPartyImages: any[];
    totalEstimatedSize: number;
  }> => {
    console.log(
      `🔍 Filtering images to stay within ${maxSizeMB}MB threshold...`,
    );

    const filteredImageDetails: any[] = [];
    const filteredNewPartyImages: any[] = [];
    const omittedImageDetails: any[] = [];
    const omittedNewPartyImages: any[] = [];
    let currentSize = 0;

    // Process ImageDetails
    for (const image of imageDetails) {
      const estimatedSize = await estimateImageSizeInMB(image.ImageBytes);
      if (currentSize + estimatedSize <= maxSizeMB) {
        filteredImageDetails.push(image);
        currentSize += estimatedSize;
        console.log(
          `✅ Added ImageDetails: ${
            image.ImageName
          } (~${estimatedSize}MB, total: ${currentSize.toFixed(2)}MB)`,
        );
      } else {
        omittedImageDetails.push(image);
        console.log(
          `⏭️ Omitted ImageDetails: ${image.ImageName} (~${estimatedSize}MB, would exceed limit)`,
        );
      }
    }

    // Process NewPartyImages
    for (const image of newPartyImages) {
      const estimatedSize = await estimateImageSizeInMB(image.ImagePath);
      if (currentSize + estimatedSize <= maxSizeMB) {
        filteredNewPartyImages.push(image);
        currentSize += estimatedSize;
        console.log(
          `✅ Added NewPartyImage: ${
            image.ImageName
          } (~${estimatedSize}MB, total: ${currentSize.toFixed(2)}MB)`,
        );
      } else {
        omittedNewPartyImages.push(image);
        console.log(
          `⏭️ Omitted NewPartyImage: ${image.ImageName} (~${estimatedSize}MB, would exceed limit)`,
        );
      }
    }

    console.log(
      `📊 Image filtering complete: ${
        filteredImageDetails.length + filteredNewPartyImages.length
      } kept, ${
        omittedImageDetails.length + omittedNewPartyImages.length
      } omitted`,
    );
    console.log(`📊 Estimated total size: ${currentSize.toFixed(2)}MB`);

    return {
      filteredImageDetails,
      filteredNewPartyImages,
      omittedImageDetails,
      omittedNewPartyImages,
      totalEstimatedSize: currentSize,
    };
  };

  // ✅ OMITTED IMAGE TRACKING: Store omitted images for next batch
  const trackOmittedImages = (
    omittedImages: any[],
    omittedNewPartyImages: any[],
  ) => {
    // Store omitted images in a global or state variable for next batch processing
    // This will be used when creating subsequent batches
    console.log(
      `📝 Tracking ${omittedImages.length} omitted ImageDetails and ${omittedNewPartyImages.length} omitted NewPartyImages for next batch`,
    );
    return {
      omittedImageDetails: omittedImages,
      omittedNewPartyImages: omittedNewPartyImages,
    };
  };

  const splitIntoBatches = (array: string[], batchSize: number): string[][] => {
    const batches: string[][] = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  };

  // MULTI-PHASE SYNC: Split large image datasets into memory-safe phases
  const processMultiPhaseSync = async (
    dataCollected: any,
    collectedMGK: string[],
    syncStartTime: string,
  ) => {
    // ✅ ACTIVITIES-FIRST FIX: Calculate total images from metadata
    const totalImages = dataCollected._needsPhasing
      ? dataCollected._totalImageCount
      : (dataCollected._imageDetailsMetadata?.length || 0) +
        (dataCollected._newPartyImagesMetadata?.length || 0);

    const MEMORY_SAFE_PHASE_SIZE = 15; // CRITICAL: Much smaller phases to prevent memory crashes

    // ✅ IMAGE COUNT TRACKING: Track total images and current progress
    let totalImagesProcessed = 0;
    console.log(`📊 TOTAL IMAGES TO SYNC: ${totalImages}`);

    // ✅ ACTIVITIES-FIRST PRE-BATCH: Check if activities are selected for ExpandList
    const hasSelectedActivities = collectedMGK.length > 0;
    console.log(
      `🎯 ExpandList ACTIVITIES-FIRST CHECK: ${
        hasSelectedActivities ? 'Activities selected' : 'No activities selected'
      }`,
    );

    if (hasSelectedActivities) {
      // ✅ STEP 1: Activities-only pre-batch for selected data
      console.log(
        `📋 STEP 1: Processing activities-only pre-batch for ${collectedMGK.length} selected MGKs...`,
      );

      setSyncProgress({
        current: 15,
        total: 100,
        message: `Pre-batch: Syncing selected activities (${collectedMGK.length} items)...`,
      });

      // Create activities-only data (no images)
      const activitiesOnlyData: any = {};
      Object.keys(dataCollected).forEach(key => {
        // Include all non-image data for activities pre-batch
        if (
          key !== dataSyncObjectKeys.ImageDetails &&
          key !== dataSyncObjectKeys.NewPartyImage &&
          !key.startsWith('_')
        ) {
          // Skip internal metadata

          if (
            dataCollected[key] &&
            Array.isArray(dataCollected[key]) &&
            dataCollected[key].length > 0
          ) {
            activitiesOnlyData[key] = dataCollected[key];
            console.log(
              `   ✅ Added ${key}: ${dataCollected[key].length} records to activities pre-batch`,
            );
          }
        }
      });

      if (Object.keys(activitiesOnlyData).length > 0) {
        console.log(
          `🔄 Syncing activities pre-batch with ${
            Object.keys(activitiesOnlyData).length
          } data types`,
        );

        const activitiesResult = await processBatchSyncWithPreprocessedData(
          activitiesOnlyData,
          collectedMGK,
          syncStartTime,
          true, // isPartOfMultiPhase = true
          {currentPhase: 0, totalPhases: 1}, // Special phase 0 for activities
        );

        if (!activitiesResult?.success) {
          console.error(
            `❌ Activities pre-batch failed:`,
            activitiesResult?.message,
          );

          // Reset states and show error
          setisLoading(false);
          setIsSyncInProgress(false);
          setSyncProgress(null);

          window.alert(`Activities Sync Failed\n\nActivities pre-batch failed: ${
              activitiesResult?.message || 'Unknown error'
            }\n\nPlease try syncing again.`);
          navigate('/dashboard');

          return (
            activitiesResult || {
              success: false,
              message: 'Activities pre-batch failed',
            }
          );
        }

        console.log(`✅ Activities pre-batch completed successfully`);

        // Brief delay before starting image phases
        setSyncProgress({
          current: 25,
          total: 100,
          message: `Activities synced! Preparing image phases (${totalImages} images)...`,
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        console.log(
          `ℹ️ No activities data found for pre-batch, proceeding to images`,
        );
      }
    } else {
      console.log(`📸 No activities selected - starting directly with images`);
    }

    if (totalImages <= MEMORY_SAFE_PHASE_SIZE) {
      // Single image phase - NOW ACTUALLY PROCESS THE IMAGES WITH PROGRESSIVE BATCHING
      console.log(
        `📦 Single image phase: ${totalImages} images - PROCESSING IMAGES WITH PROGRESSIVE BATCHING`,
      );

      // ✅ PROGRESSIVE BATCH CREATION: Process images with dynamic size filtering
      console.log(
        `🔄 Processing images with progressive batch creation in single phase...`,
      );

      // Initialize omitted images tracking
      let omittedImageDetails: any[] = [];
      let omittedNewPartyImages: any[] = [];
      let allImagesProcessed = false;
      let batchNumber = 1;
      const MAX_IMAGE_BATCH_SIZE_MB = 15; // 10MB limit for image batches

      while (!allImagesProcessed) {
        console.log(
          `🔄 Creating image batch ${batchNumber} for single phase...`,
        );

        // Get current images to process (remaining images from metadata)
        const currentImageDetails = dataCollected._imageDetailsMetadata || [];
        const currentNewPartyImages =
          dataCollected._newPartyImagesMetadata || [];

        // Filter images by size to stay within threshold
        const filteredImages = await filterImagesBySize(
          currentImageDetails,
          currentNewPartyImages,
          MAX_IMAGE_BATCH_SIZE_MB,
        );

        // Track omitted images for next batch
        omittedImageDetails = [
          ...omittedImageDetails,
          ...filteredImages.omittedImageDetails,
        ];
        omittedNewPartyImages = [
          ...omittedNewPartyImages,
          ...filteredImages.omittedNewPartyImages,
        ];

        // Check if we have any images to process in this batch
        if (
          filteredImages.filteredImageDetails.length === 0 &&
          filteredImages.filteredNewPartyImages.length === 0
        ) {
          console.log(`ℹ️ No images to process in batch ${batchNumber}`);
          allImagesProcessed = true;
          break;
        }

        // Process the filtered images
        const imageOnlyData: any = {};

        try {
          console.log(
            `🖼️ Processing ${filteredImages.filteredImageDetails.length} ImageDetails and ${filteredImages.filteredNewPartyImages.length} NewPartyImages for batch ${batchNumber}...`,
          );

          // Process ImageDetails
          if (filteredImages.filteredImageDetails.length > 0) {
            const processedImageDetails = await Promise.all(
              filteredImages.filteredImageDetails.map(async (item: any) => {
                try {
                  const imageBytes = localStorage.getItem(item.ImageBytes);
                  if (!imageBytes) {
                    console.warn(
                      `⚠️ Image file does not exist: ${item.ImageName} at ${item.ImageBytes}`,
                    );
                    return {
                      ID: item.ID,
                      OrderID: item.OrderID,
                      ImageDatetime: item.ImageDateTime,
                      ImageName: item.ImageName,
                      ImageBytes: '',
                    };
                  }
                  return {
                    ID: item.ID,
                    OrderID: item.OrderID,
                    ImageDatetime: item.ImageDateTime,
                    ImageName: item.ImageName,
                    ImageBytes: imageBytes,
                  };
                } catch (error) {
                  console.error(
                    `❌ Error processing image: ${item.ImageName}`,
                    error,
                  );
                  return {
                    ID: item.ID,
                    OrderID: item.OrderID,
                    ImageDatetime: item.ImageDateTime,
                    ImageName: item.ImageName,
                    ImageBytes: '',
                  };
                }
              }),
            );
            imageOnlyData[dataSyncObjectKeys.ImageDetails] =
              processedImageDetails;
            console.log(
              `✅ Processed ${processedImageDetails.length} ImageDetails for batch ${batchNumber}`,
            );
          }

          // Process NewPartyImages
          if (filteredImages.filteredNewPartyImages.length > 0) {
            const processedNewPartyImages = await Promise.all(
              filteredImages.filteredNewPartyImages.map(async (item: any) => {
                try {
                  const imageData = localStorage.getItem(item.ImagePath);
                  if (!imageData) {
                    console.warn(
                      `⚠️ NewParty image file does not exist: ${item.ImageName} at ${item.ImagePath}`,
                    );
                    return {
                      Id: item.id,
                      ImageName: item.ImageName,
                      ShopId: item.ShopId,
                      Data: '',
                    };
                  }
                  return {
                    Id: item.id,
                    ImageName: item.ImageName,
                    ShopId: item.ShopId,
                    Data: imageData,
                  };
                } catch (error) {
                  console.error(
                    `❌ Error processing NewParty image: ${item.ImageName}`,
                    error,
                  );
                  return {
                    Id: item.id,
                    ImageName: item.ImageName,
                    ShopId: item.ShopId,
                    Data: '',
                  };
                }
              }),
            );
            imageOnlyData[dataSyncObjectKeys.NewPartyImage] =
              processedNewPartyImages;
            console.log(
              `✅ Processed ${processedNewPartyImages.length} NewPartyImages for batch ${batchNumber}`,
            );
          }
        } catch (error) {
          console.error(
            `❌ Error processing images in batch ${batchNumber}:`,
            error,
          );
          writeErrorLog(
            `Single phase image processing error batch ${batchNumber}`,
            error,
          );
        }

        // Add related OrderMaster for images in this batch
        try {
          const imageOrderMaster =
            (await getOrderMasterSyncDataForImage()) as any[];
          if (imageOrderMaster && imageOrderMaster.length > 0) {
            // Filter OrderMaster to only include those related to current batch images
            const currentBatchImageIds = [
              ...(imageOnlyData[dataSyncObjectKeys.ImageDetails] || []).map(
                (img: any) => img.OrderID,
              ),
              ...(imageOnlyData[dataSyncObjectKeys.NewPartyImage] || []).map(
                (img: any) => img.id,
              ),
            ].filter(Boolean);

            const relatedOrderMaster = imageOrderMaster.filter((order: any) =>
              currentBatchImageIds.includes(order.ID),
            );

            if (relatedOrderMaster.length > 0) {
              imageOnlyData[dataSyncObjectKeys.OrderMaster] =
                relatedOrderMaster;
              console.log(
                `📋 Added ${relatedOrderMaster.length} image-related OrderMaster to batch ${batchNumber}`,
              );
            }
          }
        } catch (error) {
          console.error(
            `❌ Error getting OrderMaster for batch ${batchNumber}:`,
            error,
          );
        }

        // Final size check before posting
        const finalSize = calculateJsonSizeInMB(imageOnlyData);
        console.log(`📊 Batch ${batchNumber} final size: ${finalSize}MB`);

        if (finalSize > MAX_IMAGE_BATCH_SIZE_MB) {
          console.warn(
            `⚠️ Batch ${batchNumber} size ${finalSize}MB exceeds limit ${MAX_IMAGE_BATCH_SIZE_MB}MB`,
          );
          // This shouldn't happen with our filtering, but handle it gracefully
          console.log(
            `🔄 Switching to multi-phase sync due to size limit exceeded`,
          );
          allImagesProcessed = true;
          break;
        }

        // Process this batch
        console.log(
          `🎯 ACTIVITIES-FIRST COMPLETE: Activities synced first, now syncing image batch ${batchNumber}`,
        );
        const batchResult = await processBatchSyncWithPreprocessedData(
          imageOnlyData,
          collectedMGK,
          syncStartTime,
          true,
          {currentPhase: 1, totalPhases: 1},
        );

        if (!batchResult?.success) {
          console.error(
            `❌ Image batch ${batchNumber} failed:`,
            batchResult?.message,
          );
          return (
            batchResult || {
              success: false,
              message: `Image batch ${batchNumber} failed`,
            }
          );
        }

        console.log(`✅ Image batch ${batchNumber} completed successfully`);

        // Update metadata for next batch (remove processed images)
        dataCollected._imageDetailsMetadata = omittedImageDetails;
        dataCollected._newPartyImagesMetadata = omittedNewPartyImages;

        // Check if we have more images to process
        if (
          omittedImageDetails.length === 0 &&
          omittedNewPartyImages.length === 0
        ) {
          allImagesProcessed = true;
          console.log(
            `🎉 All image batches completed successfully in single phase`,
          );
        } else {
          batchNumber++;
          console.log(
            `🔄 ${
              omittedImageDetails.length + omittedNewPartyImages.length
            } images remaining for next batch`,
          );
        }
      }

      return {
        success: true,
        message: `Single phase image processing completed successfully!`,
      };
    }

    // Multi-phase sync with memory-safe chunks (IMAGES ONLY)
    const totalPhases = Math.ceil(totalImages / MEMORY_SAFE_PHASE_SIZE);
    const imagesPerPhase = MEMORY_SAFE_PHASE_SIZE;
    console.log(
      `📦 Multi-phase IMAGE sync: ${totalImages} images → ${totalPhases} phases of ${imagesPerPhase} images each`,
    );
    console.log(
      `🎯 IMAGE-ONLY PHASES: Each phase will sync images only (activities already synced in pre-batch)`,
    );

    // ✅ PHASE TRACKING: Track successful phases to detect missed ones
    const completedPhases: number[] = [];
    const failedPhases: number[] = [];

    // Process each IMAGE phase sequentially (activities already synced)
    for (let phaseNum = 1; phaseNum <= totalPhases; phaseNum++) {
      const startIndex = (phaseNum - 1) * imagesPerPhase;
      const isLastPhase = phaseNum === totalPhases;
      const currentPhaseSize = isLastPhase
        ? totalImages - startIndex // Remaining images in last phase
        : imagesPerPhase;

      console.log(`🚀 Starting IMAGE PHASE ${phaseNum}/${totalPhases}...`);
      console.log(
        `📊 Image Phase ${phaseNum}: Processing ${currentPhaseSize} images (${
          startIndex + 1
        }-${startIndex + currentPhaseSize})`,
      );

      // ✅ ENHANCED PROGRESS: Show image count progress (e.g., "15/80 images")
      const baseProgress = hasSelectedActivities ? 30 : 15; // Higher base if activities already synced
      const overallProgress =
        Math.round(((phaseNum - 1) / totalPhases) * 60) + baseProgress;
      setSyncProgress({
        current: overallProgress,
        total: 100,
        message: `Image Phase ${phaseNum}/${totalPhases} - Processing ${currentPhaseSize} images (${
          totalImagesProcessed + 1
        }-${totalImagesProcessed + currentPhaseSize}/${totalImages})`,
      });

      const phaseData = await processImageDataWithBatching(
        collectedMGK,
        {},
        {
          currentPhase: phaseNum,
          totalPhases: totalPhases,
          startIndex: startIndex,
          maxImages: currentPhaseSize,
        },
      );

      if (phaseData.data && Object.keys(phaseData.data).length > 0) {
        console.log(
          `🔄 Image Phase ${phaseNum}: Starting batch processing with isPartOfMultiPhase=true`,
        );

        // ✅ IMAGE-ONLY PHASES: Only process images and related OrderMaster (no activities)
        const phaseDataForProcessing: any = {};

        // Add current phase image data
        Object.keys(phaseData.data).forEach(key => {
          if (
            phaseData.data[key] &&
            Array.isArray(phaseData.data[key]) &&
            phaseData.data[key].length > 0
          ) {
            phaseDataForProcessing[key] = phaseData.data[key];
            console.log(
              `   ✅ Added phase ${key}: ${phaseData.data[key].length} records`,
            );
          }
        });

        console.log(`🔍 IMAGE PHASE ${phaseNum} DATA TRACE:`);
        console.log(
          `   📋 OrderMaster: ${
            phaseDataForProcessing[dataSyncObjectKeys.OrderMaster]?.length || 0
          } records`,
        );
        console.log(
          `   🖼️ ImageDetails: ${
            phaseDataForProcessing[dataSyncObjectKeys.ImageDetails]?.length || 0
          } records`,
        );
        console.log(
          `   🖼️ NewPartyImage: ${
            phaseDataForProcessing[dataSyncObjectKeys.NewPartyImage]?.length ||
            0
          } records`,
        );

        try {
          const phaseResult = await processBatchSyncWithPreprocessedData(
            phaseDataForProcessing,
            collectedMGK,
            syncStartTime,
            true,
            {currentPhase: phaseNum, totalPhases: totalPhases},
          );

          if (!phaseResult?.success) {
            console.error(
              `❌ Phase ${phaseNum}/${totalPhases} failed:`,
              phaseResult?.message,
            );
            failedPhases.push(phaseNum);

            // FIXED: Reset loader states on phase failure
            setisLoading(false);
            setIsSyncInProgress(false);
            setSyncProgress(null);

            // ✅ PHASE FAILURE ALERT: Show retry option for missed phases
            Alert.alert(
              'Phase Sync Failed',
              `Phase ${phaseNum} of ${totalPhases} failed: ${
                phaseResult?.message || 'Unknown error'
              }\n\nSome data may not have been synced properly.`,
              [
                {
                  text: 'Retry Full Sync',
                  onPress: () => {
                    console.log(
                      '🔄 User requested full sync retry after phase failure',
                    );
                    // navigation.navigate(ScreenName.DASHBOARD);
                    navigation.dispatch(
                      navigation.popTo(ScreenName.MAINSCREEN, {
                        screen: ScreenName.DASHBOARD,
                      }),
                    );
                    setTimeout(() => {
                      Alert.alert(
                        'Sync Retry',
                        'Please try syncing again to ensure all data is properly uploaded.',
                      );
                    }, 1000);
                  },
                },
                {
                  text: 'Continue Anyway',
                  style: 'destructive',
                  onPress: () =>
                    // navigation.navigate(ScreenName.DASHBOARD);
                    navigation.dispatch(
                      navigation.popTo(ScreenName.MAINSCREEN, {
                        screen: ScreenName.DASHBOARD,
                      }),
                    ),
                },
              ],
            );

            return (
              phaseResult || {
                success: false,
                message: `Phase ${phaseNum} failed`,
              }
            );
          }

          // ✅ UPDATE IMAGE COUNT: Track processed images for progress display
          totalImagesProcessed += currentPhaseSize;
          console.log(
            `📊 IMAGE PROGRESS: ${totalImagesProcessed}/${totalImages} images processed so far`,
          );

          // Track successful phase
          completedPhases.push(phaseNum);
          console.log(
            `✅ Phase ${phaseNum}/${totalPhases} completed successfully`,
          );
          console.log(
            `🔄 Phase ${phaseNum} complete - UI states maintained for next phase: isLoading=${isLoading}, isSyncInProgress=${isSyncInProgress}`,
          );
        } catch (phaseError) {
          console.error(`❌ Exception in Phase ${phaseNum}:`, phaseError);
          failedPhases.push(phaseNum);
          writeErrorLog(`Phase ${phaseNum} exception`, phaseError);

          // Continue to next phase but track the failure
          console.log(
            `⚠️ Phase ${phaseNum} failed with exception, continuing to next phase...`,
          );
        }
      } else {
        console.log(
          `ℹ️ Phase ${phaseNum}/${totalPhases} had no data to process`,
        );
        // Still count as completed since there was no data to process
        completedPhases.push(phaseNum);
      }

      // Extended delay between phases for memory cleanup AND connection stability
      if (phaseNum < totalPhases) {
        console.log(
          '⏳ Extended cleanup delay between phases for connection stability...',
        );
        await new Promise(resolve => setTimeout(resolve, 6000)); // INCREASED: 6 seconds for enhanced server/connection stability
        if (global.gc) {
          global.gc();
          console.log('🧹 Inter-phase garbage collection completed');
        }
      }
    }

    // ✅ PHASE COMPLETION ANALYSIS: Check if all phases completed successfully
    const totalExpectedPhases = totalPhases;
    const totalCompletedPhases = completedPhases.length;
    const totalFailedPhases = failedPhases.length;
    const missedPhases: number[] = [];

    // ✅ FINAL IMAGE COUNT VERIFICATION
    console.log(`📊 FINAL IMAGE COUNT SUMMARY:`);
    console.log(`   Total images to sync: ${totalImages}`);
    console.log(`   Total images processed: ${totalImagesProcessed}`);
    console.log(`   Images remaining: ${totalImages - totalImagesProcessed}`);

    // Identify missed phases
    for (let i = 1; i <= totalExpectedPhases; i++) {
      if (!completedPhases.includes(i) && !failedPhases.includes(i)) {
        missedPhases.push(i);
      }
    }

    console.log(`📊 PHASE COMPLETION SUMMARY:`);
    console.log(`   Expected: ${totalExpectedPhases} phases`);
    console.log(
      `   Completed: ${totalCompletedPhases} phases [${completedPhases.join(
        ', ',
      )}]`,
    );
    console.log(
      `   Failed: ${totalFailedPhases} phases [${failedPhases.join(', ')}]`,
    );
    console.log(
      `   Missed: ${missedPhases.length} phases [${missedPhases.join(', ')}]`,
    );

    // Determine final success status
    const hasFailuresOrMissed =
      failedPhases.length > 0 || missedPhases.length > 0;

    if (hasFailuresOrMissed) {
      // Some phases failed or were missed - show warning and retry option
      console.log(
        `⚠️ Multi-phase sync completed with issues: ${failedPhases.length} failed, ${missedPhases.length} missed`,
      );

      setSyncProgress({
        current: 95,
        total: 100,
        message: `⚠️ Multi-phase sync completed with issues... (${totalImagesProcessed}/${totalImages} images processed)`,
      });

      setTimeout(() => {
        setSyncProgress(null);
        setIsSyncInProgress(false);
        setisLoading(false);

        const issueDetails = [];
        if (failedPhases.length > 0) {
          issueDetails.push(
            `${failedPhases.length} phases failed: [${failedPhases.join(
              ', ',
            )}]`,
          );
        }
        if (missedPhases.length > 0) {
          issueDetails.push(
            `${missedPhases.length} phases missed: [${missedPhases.join(
              ', ',
            )}]`,
          );
        }

        Alert.alert(
          'Partial Sync Completed',
          `Multi-phase sync completed but some phases had issues:\n\n${issueDetails.join(
            '\n',
          )}\n\nImages processed: ${totalImagesProcessed}/${totalImages}\n\nSome data may not have been synced properly.`,
          [
            {
              text: 'Retry Full Sync',
              onPress: () => {
                console.log(
                  '🔄 User requested full sync retry after partial completion',
                );
                // navigation.navigate(ScreenName.DASHBOARD);
                navigation.dispatch(
                  navigation.popTo(ScreenName.MAINSCREEN, {
                    screen: ScreenName.DASHBOARD,
                  }),
                );
                setTimeout(() => {
                  Alert.alert(
                    'Sync Retry',
                    'Please try syncing again to ensure all data is properly uploaded.',
                  );
                }, 1000);
              },
            },
            {
              text: 'Continue Anyway',
              style: 'destructive',
              onPress: () => {
                console.log(
                  `🔄 User chose to continue despite ${
                    failedPhases.length + missedPhases.length
                  } phase issues`,
                );
                GetNewData();
              },
            },
          ],
        );
      }, 1000);

      return {
        success: false,
        message: `Partial sync: ${totalCompletedPhases}/${totalExpectedPhases} phases completed. ${failedPhases.length} failed, ${missedPhases.length} missed.`,
      };
    } else {
      // All phases completed successfully
      console.log(`🎉 All ${totalPhases} phases completed successfully!`);
      const totalPhasesWithPreBatch = hasSelectedActivities
        ? totalPhases + 1
        : totalPhases;
      setSyncProgress({
        current: 95,
        total: 100,
        message: `🎉 Multi-phase sync completed! ${
          hasSelectedActivities ? 'Activities + ' : ''
        }${totalPhases} image phases successful. (${totalImagesProcessed}/${totalImages} images processed)`,
      });

      // Smooth final progress to 100%
      setTimeout(() => {
        setSyncProgress({
          current: 100,
          total: 100,
          message: `🏁 Finalizing multi-phase sync...`,
        });
      }, 500);

      setTimeout(() => {
        setSyncProgress(null);
        setIsSyncInProgress(false);
        setisLoading(false); // FIXED: Reset main loader after multi-phase completion
        // Show final success alert and call GetNewData
        console.log(
          `🎯 Showing final multi-phase success alert and preparing GetNewData call`,
        );
        const successMessage = hasSelectedActivities
          ? `Multi-phase sync completed successfully! Activities pre-batch + ${totalPhases} image phases processed.\n\nImages processed: ${totalImagesProcessed}/${totalImages}`
          : `Multi-phase sync completed successfully! All ${totalPhases} image phases processed.\n\nImages processed: ${totalImagesProcessed}/${totalImages}`;

        Alert.alert('Zylemini+', successMessage, [
          {
            text: 'OK',
            onPress: () => {
              console.log(
                `🔄 Final alert OK pressed - calling GetNewData to refresh data`,
              );
              GetNewData(); // Call GetNewData after successful multi-phase sync completion
            },
          },
        ]);
      }, 2000);

      return {
        success: true,
        message: `Multi-phase sync completed successfully! All ${totalPhases} phases processed.`,
      };
    }
  };

  const processBatchSyncWithPreprocessedData = async (
    preprocessedData: any,
    collectedMGK: string[],
    syncStartTime: string,
    isPartOfMultiPhase = false, // NEW: Flag to indicate if this is part of multi-phase sync
    phaseInfo?: {currentPhase: number; totalPhases: number}, // NEW: Phase information for progress display
  ) => {
    const BATCH_SIZE = 3; // SIMPLIFIED: Fixed reasonable batch size
    const MAX_RETRY_ATTEMPTS = 3;

    // ✅ HTTP 413 FIX: Server payload size limits (Updated values)
    const SERVER_SIZE_LIMITS = {
      SAFE_BATCH_SIZE_MB: 15, // 10MB safe limit for server
      MAX_BATCH_SIZE_MB: 18, // 18MB absolute max before 413 error
      IMAGE_ONLY_LIMIT_MB: 15, // 10MB for image-only batches
      ACTIVITY_ONLY_LIMIT_MB: 10, // 10MB for activity-only batches
      MIXED_DATA_LIMIT_MB: 15, // 15MB for mixed activity+image batches
    };

    // ✅ PERFORMANCE OPTIMIZED: Dynamic delays based on batch size and success rate
    const getBatchDelay = (batchSizeMB: number, isSuccessfulBatch: boolean) => {
      if (batchSizeMB <= 0.5) {
        // Small batches: minimal delay for fast sync
        return isSuccessfulBatch ? 500 : 1000; // 0.5s success, 1s failure
      } else if (batchSizeMB <= 2) {
        // Medium batches: moderate delay for server breathing room
        return isSuccessfulBatch ? 1500 : 2500; // 1.5s success, 2.5s failure
      } else {
        // Large batches: longer delay for memory/connection stability
        return isSuccessfulBatch ? 3000 : 5000; // 3s success, 5s failure
      }
    };

    // ✅ PERFORMANCE OPTIMIZED: Faster retry delays for small batches
    const getRetryDelay = (attempt: number, batchSizeMB: number) => {
      const baseDelay =
        batchSizeMB <= 0.5 ? 1000 : batchSizeMB <= 2 ? 2000 : 3000;
      return Math.min(baseDelay * Math.pow(1.5, attempt - 1), 10000); // Gentler exponential backoff, max 10s
    };

    let allSavedData: any[] = [];
    let allNotSavedData: any[] = [];
    let finalStatus = '';
    let successfulBatches = 0;

    try {
      console.log(
        '🔄 Processing preprocessed data in batches to avoid size limits...',
      );

      // ✅ HTTP 413 FIX: Create size-aware batches to prevent server payload errors
      const dataBatches = await createSizeAwareDataBatches(
        preprocessedData,
        BATCH_SIZE,
        SERVER_SIZE_LIMITS,
      );

      console.log(`📦 Split data into ${dataBatches.length} batches`);

      for (let i = 0; i < dataBatches.length; i++) {
        const batchData = dataBatches[i];
        let batchSuccess = false;

        // ✅ BATCH IMAGE COUNT: Calculate images in this batch for progress display
        const batchImages =
          (batchData[dataSyncObjectKeys.ImageDetails] || []).length +
          (batchData[dataSyncObjectKeys.NewPartyImage] || []).length;

        // Retry logic for each batch
        for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
          try {
            const progressMessage = phaseInfo
              ? `Phase ${phaseInfo.currentPhase}/${
                  phaseInfo.totalPhases
                } - Batch ${i + 1}/${
                  dataBatches.length
                } (${batchImages} images) - Attempt ${attempt}/${MAX_RETRY_ATTEMPTS}`
              : `Batch ${i + 1}/${
                  dataBatches.length
                } (${batchImages} images) - Attempt ${attempt}/${MAX_RETRY_ATTEMPTS}`;

            setSyncProgress({
              current: 30 + (i / dataBatches.length) * 60,
              total: 100,
              message: progressMessage,
            });

            console.log(
              `Processing batch ${i + 1}/${
                dataBatches.length
              }, attempt ${attempt}`,
            );

            const batchSizeMB = calculateJsonSizeInMB(batchData);
            console.log(`Batch ${i + 1} data size: ${batchSizeMB} MB`);

            // ✅ ENHANCED TOKEN STRATEGY: Get fresh token with network timing awareness
            console.log(
              `🔐 Getting fresh auth token for batch ${
                i + 1
              } (attempt ${attempt})...`,
            );
            const tokenStartTime = Date.now();
            const newToken = await refreshAuthTokenWithRetry();
            const tokenDuration = Date.now() - tokenStartTime;

            if (!newToken) {
              throw new Error('Authentication failed for batch');
            }

            console.log(
              `✅ Auth token obtained in ${tokenDuration}ms for batch ${i + 1}`,
            );
            console.log(`🕐 Token timestamp: ${new Date().toISOString()}`);

            // ✅ NETWORK TIMING: Log the complete request cycle
            console.log(
              `🌐 Starting network request for batch ${
                i + 1
              } at ${new Date().toISOString()}`,
            );
            const batchResponse = await postSyncDataWithTimeout(
              newToken,
              batchData,
            );

            if (batchResponse) {
              // Handle nested response structure
              const actualResponse = batchResponse?.Data || batchResponse;

              // Accumulate responses
              if (
                actualResponse.SavedData &&
                Array.isArray(actualResponse.SavedData)
              ) {
                allSavedData = [...allSavedData, ...actualResponse.SavedData];
                console.log(
                  `Batch ${i + 1}: ${
                    actualResponse.SavedData.length
                  } items saved`,
                );
              }
              if (
                actualResponse.NotSavedData &&
                Array.isArray(actualResponse.NotSavedData)
              ) {
                allNotSavedData = [
                  ...allNotSavedData,
                  ...actualResponse.NotSavedData,
                ];
                console.log(
                  `Batch ${i + 1}: ${
                    actualResponse.NotSavedData.length
                  } items failed`,
                );
              }
              if (actualResponse.Status) {
                finalStatus = actualResponse.Status;
              }

              batchSuccess = true;
              successfulBatches++;
              console.log(`✅ Batch ${i + 1} completed successfully`);

              // Add small delay after successful batch for server breathing room
              if (i < dataBatches.length - 1) {
                console.log('⏳ Brief pause for server processing...');
                await new Promise(resolve => setTimeout(resolve, 800));
              }

              break; // Exit retry loop for this batch
            }
          } catch (batchError) {
            console.error(
              `❌ Batch ${i + 1} attempt ${attempt} failed:`,
              batchError,
            );
            writeErrorLog(`Batch ${i + 1} attempt ${attempt}`, batchError);

            if (attempt === MAX_RETRY_ATTEMPTS) {
              console.error(
                `❌ Batch ${i + 1} failed after ${MAX_RETRY_ATTEMPTS} attempts`,
              );

              const failMessage = phaseInfo
                ? `Phase ${phaseInfo.currentPhase}/${
                    phaseInfo.totalPhases
                  } - Batch ${i + 1} failed, continuing with next batch...`
                : `Batch ${i + 1} failed, continuing with next batch...`;

              setSyncProgress({
                current: 30 + (i / dataBatches.length) * 60,
                total: 100,
                message: failMessage,
              });

              // Continue with next batch instead of failing completely
              break;
            } else {
              // ✅ PERFORMANCE OPTIMIZED: Faster retry delays for small batches
              const batchSizeMB = calculateJsonSizeInMB(batchData);
              const retryDelay = getRetryDelay(attempt, batchSizeMB);

              const retryMessage = phaseInfo
                ? `Phase ${phaseInfo.currentPhase}/${
                    phaseInfo.totalPhases
                  } - Batch ${i + 1} retry ${attempt + 1} in ${
                    retryDelay / 1000
                  }s... (${batchSizeMB.toFixed(2)}MB)`
                : `Batch ${i + 1} retry ${attempt + 1} in ${
                    retryDelay / 1000
                  }s... (${batchSizeMB.toFixed(2)}MB)`;

              setSyncProgress({
                current: 30 + (i / dataBatches.length) * 60,
                total: 100,
                message: retryMessage,
              });
              await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
          }
        }

        // ✅ PERFORMANCE OPTIMIZED: Dynamic delay between successful batches
        if (batchSuccess && i < dataBatches.length - 1) {
          const batchSizeMB = calculateJsonSizeInMB(batchData);
          const dynamicDelay = getBatchDelay(batchSizeMB, true);

          const prepareMessage = phaseInfo
            ? `Phase ${phaseInfo.currentPhase}/${
                phaseInfo.totalPhases
              } - Batch ${
                i + 1
              } completed (${batchImages} images). Preparing batch ${
                i + 2
              }... (${dynamicDelay}ms delay)`
            : `Batch ${
                i + 1
              } completed (${batchImages} images). Preparing batch ${
                i + 2
              }... (${dynamicDelay}ms delay)`;

          setSyncProgress({
            current: 30 + ((i + 1) / dataBatches.length) * 60,
            total: 100,
            message: prepareMessage,
          });
          console.log(
            `⏳ Adding ${dynamicDelay}ms delay between batches (${batchSizeMB.toFixed(
              2,
            )}MB batch) for connection stability...`,
          );
          await new Promise(resolve => setTimeout(resolve, dynamicDelay));
        }
      }

      // Process combined results
      const combinedResponse = {
        SavedData: allSavedData,
        NotSavedData: allNotSavedData,
        Status:
          finalStatus ||
          (allSavedData.length > 0
            ? 'Data saved successfully.'
            : 'Batch sync completed'),
      };

      // ✅ CALCULATE TOTAL IMAGES PROCESSED IN THIS PHASE
      let totalImagesInPhase = 0;
      dataBatches.forEach(batch => {
        totalImagesInPhase +=
          (batch[dataSyncObjectKeys.ImageDetails] || []).length +
          (batch[dataSyncObjectKeys.NewPartyImage] || []).length;
      });

      console.log(`🎯 Batch sync summary:`);
      console.log(
        `   - Successful batches: ${successfulBatches}/${dataBatches.length}`,
      );
      console.log(`   - Total saved items: ${allSavedData.length}`);
      console.log(`   - Total failed items: ${allNotSavedData.length}`);
      console.log(`   - Total images in this phase: ${totalImagesInPhase}`);

      const processingMessage = phaseInfo
        ? `Phase ${phaseInfo.currentPhase}/${phaseInfo.totalPhases} - Processing batch results...`
        : 'Processing batch results...';

      setSyncProgress({
        current: 90,
        total: 100,
        message: processingMessage,
      });

      await handleResponseData(
        combinedResponse,
        syncStartTime,
        undefined,
        isPartOfMultiPhase,
      );

      if (!isPartOfMultiPhase) {
        // Only show final UI updates if NOT part of multi-phase sync
        const completionMessage = phaseInfo
          ? `Phase ${phaseInfo.currentPhase}/${phaseInfo.totalPhases} - Batch sync completed! ${successfulBatches}/${dataBatches.length} batches successful.`
          : `Batch sync completed! ${successfulBatches}/${dataBatches.length} batches successful.`;

        setSyncProgress({
          current: 100,
          total: 100,
          message: completionMessage,
        });

        setTimeout(() => {
          setSyncProgress(null);
          setIsSyncInProgress(false);
        }, 2000);
      }

      return {
        success: true,
        message: `Batch sync completed! ${successfulBatches}/${dataBatches.length} batches successful.`,
      };
    } catch (error: any) {
      console.error('❌ Critical error during batch sync:', error);
      writeErrorLog('processBatchSyncWithPreprocessedData error', error);
      setisLoading(false);
      setIsSyncInProgress(false);
      setSyncProgress(null);
      window.alert(`Batch Sync Error\n\nCritical error during batch processing: ${
          error?.message || 'Unknown error'
        }. Please try again.`);
      return {success: false, message: error?.message || 'Batch sync failed'};
    }
  };

  // ✅ HTTP 413 FIX: Size-aware batch creation to prevent server payload errors
  const createSizeAwareDataBatches = async (
    data: any,
    batchSize: number,
    sizeLimits: any,
  ) => {
    console.log(
      '🔄 Creating size-aware data batches to prevent HTTP 413 errors...',
    );
    const batches: any[] = [];

    // Determine batch type and size limit
    const hasImages =
      (data[dataSyncObjectKeys.ImageDetails]?.length || 0) > 0 ||
      (data[dataSyncObjectKeys.NewPartyImage]?.length || 0) > 0;
    const hasActivities = Object.keys(data).some(
      key =>
        !key.startsWith('_') &&
        key !== dataSyncObjectKeys.ImageDetails &&
        key !== dataSyncObjectKeys.NewPartyImage &&
        data[key] &&
        Array.isArray(data[key]) &&
        data[key].length > 0,
    );

    let maxSizeMB;
    let batchType;
    if (hasImages && hasActivities) {
      maxSizeMB = sizeLimits.MIXED_DATA_LIMIT_MB;
      batchType = 'MIXED';
    } else if (hasImages) {
      maxSizeMB = sizeLimits.IMAGE_ONLY_LIMIT_MB;
      batchType = 'IMAGE_ONLY';
    } else {
      maxSizeMB = sizeLimits.ACTIVITY_ONLY_LIMIT_MB;
      batchType = 'ACTIVITY_ONLY';
    }

    console.log(`📊 Batch type: ${batchType}, Size limit: ${maxSizeMB}MB`);

    // Use the original createDataBatches logic but with size validation
    const originalBatches = await createDataBatches(data, batchSize);

    // Validate and split batches that exceed size limits
    for (const originalBatch of originalBatches) {
      const batchSizeMB = calculateJsonSizeInMB(originalBatch);

      if (batchSizeMB <= maxSizeMB) {
        // Batch is within size limits
        batches.push(originalBatch);
        console.log(
          `✅ Batch approved: ${batchSizeMB.toFixed(2)}MB ≤ ${maxSizeMB}MB`,
        );
      } else {
        // Batch exceeds size limits - need to split further
        console.log(
          `⚠️ Batch too large: ${batchSizeMB.toFixed(
            2,
          )}MB > ${maxSizeMB}MB - splitting...`,
        );

        // Split large batch into smaller chunks
        const splitBatches = await splitOversizedBatch(
          originalBatch,
          maxSizeMB,
          batchType,
        );
        batches.push(...splitBatches);
        console.log(`📦 Split into ${splitBatches.length} smaller batches`);
      }
    }

    console.log(`📦 Final result: ${batches.length} size-compliant batches`);
    return batches;
  };

  // ✅ HTTP 413 FIX: Split oversized batches to prevent server payload errors
  const splitOversizedBatch = async (
    oversizedBatch: any,
    maxSizeMB: number,
    batchType: string,
  ) => {
    console.log(
      `🔧 Splitting oversized ${batchType} batch (target: ${maxSizeMB}MB)`,
    );
    const splitBatches: any[] = [];

    if (batchType === 'IMAGE_ONLY') {
      // For image-only batches, reduce the number of images per batch
      const imageDetails =
        oversizedBatch[dataSyncObjectKeys.ImageDetails] || [];
      const newPartyImages =
        oversizedBatch[dataSyncObjectKeys.NewPartyImage] || [];
      const orderMaster = oversizedBatch[dataSyncObjectKeys.OrderMaster] || [];

      // Start with 1 image per batch
      let imagesPerBatch = 1;
      let currentBatch: any = {};

      // Process ImageDetails
      for (let i = 0; i < imageDetails.length; i += imagesPerBatch) {
        currentBatch = {};
        const imageBatch = imageDetails.slice(i, i + imagesPerBatch);

        // Add related OrderMaster for these images
        const imageOrderIds = imageBatch
          .map((img: any) => img.OrderID || img.order_id)
          .filter(Boolean);
        const relatedOrderMaster = orderMaster.filter((order: any) =>
          imageOrderIds.includes(order.ID),
        );

        if (imageBatch.length > 0)
          currentBatch[dataSyncObjectKeys.ImageDetails] = imageBatch;
        if (relatedOrderMaster.length > 0)
          currentBatch[dataSyncObjectKeys.OrderMaster] = relatedOrderMaster;

        const batchSize = calculateJsonSizeInMB(currentBatch);
        if (batchSize <= maxSizeMB) {
          splitBatches.push(currentBatch);
          console.log(
            `📦 Image batch ${splitBatches.length}: ${
              imageBatch.length
            } images, ${batchSize.toFixed(2)}MB ≤ ${maxSizeMB}MB`,
          );
        } else {
          console.error(
            `❌ Even single image batch too large: ${batchSize.toFixed(
              2,
            )}MB > ${maxSizeMB}MB (limit: ${maxSizeMB}MB)`,
          );
          // Still add it but log the issue - server will need to handle oversized individual images
          splitBatches.push(currentBatch);
        }
      }

      // Process NewPartyImages similarly
      for (let i = 0; i < newPartyImages.length; i += imagesPerBatch) {
        currentBatch = {};
        const imageBatch = newPartyImages.slice(i, i + imagesPerBatch);

        if (imageBatch.length > 0)
          currentBatch[dataSyncObjectKeys.NewPartyImage] = imageBatch;

        const batchSize = calculateJsonSizeInMB(currentBatch);
        if (batchSize <= maxSizeMB) {
          splitBatches.push(currentBatch);
          console.log(
            `📦 NewParty batch ${splitBatches.length}: ${
              imageBatch.length
            } images, ${batchSize.toFixed(2)}MB ≤ ${maxSizeMB}MB`,
          );
        } else {
          console.error(
            `❌ Even single NewParty image batch too large: ${batchSize.toFixed(
              2,
            )}MB > ${maxSizeMB}MB (limit: ${maxSizeMB}MB)`,
          );
          splitBatches.push(currentBatch);
        }
      }
    } else if (batchType === 'ACTIVITY_ONLY') {
      // For activity-only batches, split data types
      const dataTypes = Object.keys(oversizedBatch).filter(
        key => !key.startsWith('_'),
      );
      let currentBatch: any = {};
      let currentBatchSize = 0;

      for (const dataType of dataTypes) {
        const dataArray = oversizedBatch[dataType];
        if (!Array.isArray(dataArray) || dataArray.length === 0) continue;

        const dataTypeSize = calculateJsonSizeInMB({[dataType]: dataArray});

        if (currentBatchSize + dataTypeSize <= maxSizeMB) {
          currentBatch[dataType] = dataArray;
          currentBatchSize += dataTypeSize;
        } else {
          if (Object.keys(currentBatch).length > 0) {
            splitBatches.push(currentBatch);
            console.log(
              `📦 Activity batch ${splitBatches.length}: ${
                Object.keys(currentBatch).length
              } data types, ${currentBatchSize.toFixed(2)}MB ≤ ${maxSizeMB}MB`,
            );
          }

          currentBatch = {[dataType]: dataArray};
          currentBatchSize = dataTypeSize;
        }
      }

      if (Object.keys(currentBatch).length > 0) {
        splitBatches.push(currentBatch);
        console.log(
          `📦 Final activity batch: ${
            Object.keys(currentBatch).length
          } data types, ${currentBatchSize.toFixed(2)}MB ≤ ${maxSizeMB}MB`,
        );
      }
    } else {
      // MIXED batches - separate images from activities
      console.log(
        '🔄 Mixed batch splitting: separating images from activities',
      );

      const imageData: any = {};
      const activityData: any = {};

      Object.keys(oversizedBatch).forEach(key => {
        if (
          key === dataSyncObjectKeys.ImageDetails ||
          key === dataSyncObjectKeys.NewPartyImage
        ) {
          imageData[key] = oversizedBatch[key];
        } else if (!key.startsWith('_')) {
          activityData[key] = oversizedBatch[key];
        }
      });

      // Process activities first
      if (Object.keys(activityData).length > 0) {
        const activityBatches = await splitOversizedBatch(
          activityData,
          maxSizeMB,
          'ACTIVITY_ONLY',
        );
        splitBatches.push(...activityBatches);
      }

      // Process images
      if (Object.keys(imageData).length > 0) {
        const imageBatches = await splitOversizedBatch(
          imageData,
          maxSizeMB,
          'IMAGE_ONLY',
        );
        splitBatches.push(...imageBatches);
      }
    }

    console.log(
      `✅ Split oversized batch into ${splitBatches.length} compliant batches`,
    );
    return splitBatches;
  };

  // ✅ FALLBACK: Find OrderMaster with retry and delays for images
  const findOrderMasterWithRetry = async (
    batchData: any,
    batchNumber: number,
    batches: any[],
  ) => {
    console.log(
      `🔄 Attempting to find OrderMaster for batch ${batchNumber} with retry mechanism...`,
    );

    const maxRetries = 3;
    const baseDelay = 1000; // 1 second base delay

    for (let retry = 1; retry <= maxRetries; retry++) {
      try {
        console.log(
          `🔄 Retry ${retry}/${maxRetries} for batch ${batchNumber}...`,
        );

        // Add delay between retries
        if (retry > 1) {
          const delay = baseDelay * retry; // 2s, 3s delays
          console.log(`⏳ Waiting ${delay}ms before retry ${retry}...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        // Get fresh OrderMaster data
        const imageOrderMaster =
          (await getOrderMasterSyncDataForImage()) as any[];
        console.log(
          `🔍 Fresh OrderMaster data: ${imageOrderMaster.length} records`,
        );

        if (imageOrderMaster && imageOrderMaster.length > 0) {
          // Get OrderIDs from images in this batch
          const imageOrderIds = new Set();
          const currentImageBatch =
            batchData[dataSyncObjectKeys.ImageDetails] || [];
          const currentNewPartyImageBatch =
            batchData[dataSyncObjectKeys.NewPartyImage] || [];

          currentImageBatch.forEach((img: any) => {
            if (img.OrderID || img.order_id) {
              imageOrderIds.add(img.OrderID || img.order_id);
            }
          });
          currentNewPartyImageBatch.forEach((img: any) => {
            if (img.id || img.OrderID) {
              imageOrderIds.add(img.id || img.OrderID);
            }
          });

          console.log(
            `🔍 Looking for OrderMaster with IDs:`,
            Array.from(imageOrderIds),
          );

          const relatedOrderMaster = imageOrderMaster.filter((order: any) =>
            imageOrderIds.has(order.ID),
          );

          console.log(
            `📋 Found ${relatedOrderMaster.length} related OrderMaster records on retry ${retry}`,
          );

          if (relatedOrderMaster.length > 0) {
            // Success! Add OrderMaster to batch
            batchData[dataSyncObjectKeys.OrderMaster] = relatedOrderMaster;
            batches.push(batchData);

            const imageBatchSizeMB = calculateJsonSizeInMB(batchData);
            console.log(
              `✅ SUCCESS: Image batch ${batchNumber} now has OrderMaster: ${
                currentImageBatch.length
              } images, ${currentNewPartyImageBatch.length} new party images, ${
                relatedOrderMaster.length
              } orders, ${imageBatchSizeMB.toFixed(2)}MB`,
            );
            return; // Success - exit retry loop
          }
        }

        console.log(
          `⚠️ Retry ${retry}/${maxRetries} failed - no OrderMaster found`,
        );
      } catch (error) {
        console.error(
          `❌ Error in retry ${retry} for batch ${batchNumber}:`,
          error,
        );
        writeErrorLog(
          `OrderMaster retry ${retry} error for batch ${batchNumber}`,
          error,
        );
      }
    }

    // All retries failed - this is a critical error
    console.error(
      `🚨 CRITICAL: All ${maxRetries} retries failed for batch ${batchNumber}`,
    );
    console.error(
      `🚨 Images in this batch will be skipped - this indicates a serious data integrity issue`,
    );
    writeErrorLog(
      `CRITICAL: Images skipped due to missing OrderMaster after ${maxRetries} retries`,
      {
        batchNumber,
        imageCount:
          (batchData[dataSyncObjectKeys.ImageDetails] || []).length +
          (batchData[dataSyncObjectKeys.NewPartyImage] || []).length,
      },
    );
  };

  const createDataBatches = async (data: any, batchSize: number) => {
    console.log('🔄 Creating intelligent data batches...');
    const batches: any[] = [];

    // Identify large arrays that need splitting (especially ImageDetails)
    const imageDetails = data[dataSyncObjectKeys.ImageDetails] || [];
    const newPartyImages = data[dataSyncObjectKeys.NewPartyImage] || [];

    // Get specific OrderMaster entries for images (collection_type='3')
    const imageOrderMaster =
      ((await getOrderMasterSyncDataForImage()) as any[]) || [];

    console.log(
      `📊 Data to batch: ${imageDetails.length} images, ${newPartyImages.length} new party images, ${imageOrderMaster.length} image-related orders`,
    );

    // Check if we have any images to batch
    const totalImages = imageDetails.length + newPartyImages.length;

    if (totalImages > batchSize) {
      console.log(
        '📦 Large image data detected - using activity-first separate batches',
      );

      // ✅ FIRST BATCH: All non-image data (only if there's actual data)
      const firstBatch: any = {};
      let hasNonImageData = false;

      // Add all non-image data to first batch (activities, orders, collections, etc.)
      Object.keys(data).forEach(key => {
        if (
          key !== dataSyncObjectKeys.ImageDetails &&
          key !== dataSyncObjectKeys.NewPartyImage &&
          !key.startsWith('_')
        ) {
          // Skip internal metadata

          // ✅ Only add if there's actual data
          if (data[key] && Array.isArray(data[key]) && data[key].length > 0) {
            firstBatch[key] = data[key];
            hasNonImageData = true;

            // Log important data types
            if (key === dataSyncObjectKeys.OrderMaster) {
              console.log(
                `📋 Added ${data[key].length} non-image OrderMaster to first batch`,
              );
            }
            if (key === dataSyncObjectKeys.LogUsages) {
              console.log(
                `📊 Added ${data[key].length} usage logs to first batch`,
              );
            }
            if (key === dataSyncObjectKeys.Collections) {
              console.log(
                `💰 Added ${data[key].length} collections to first batch`,
              );
            }
            if (key === dataSyncObjectKeys.PaymentReceipt) {
              console.log(
                `💳 Added ${data[key].length} payments to first batch`,
              );
            }
          } else {
            console.log(`⏭️ Skipped empty ${key} data`);
          }
        }
      });

      // ✅ Only add first batch if it has actual data
      if (hasNonImageData) {
        batches.push(firstBatch);
        const firstBatchSizeMB = calculateJsonSizeInMB(firstBatch);
        console.log(
          `📦 First batch (non-image data): ${
            Object.keys(firstBatch).length
          } data types, ${firstBatchSizeMB.toFixed(2)}MB`,
        );
      } else {
        console.log(`⏭️ Skipped empty first batch - only images to sync`);
      }

      // ✅ SUBSEQUENT BATCHES: Image data + related OrderMaster
      console.log('📦 Creating image-based batches with related OrderMaster');

      // Split images into smaller chunks
      const imageBatches = [];
      for (let i = 0; i < imageDetails.length; i += batchSize) {
        imageBatches.push(imageDetails.slice(i, i + batchSize));
      }

      const newPartyImageBatches = [];
      for (let i = 0; i < newPartyImages.length; i += batchSize) {
        newPartyImageBatches.push(newPartyImages.slice(i, i + batchSize));
      }

      // Create batches with images + associated order data
      const maxBatches = Math.max(
        imageBatches.length,
        newPartyImageBatches.length,
        1,
      );

      for (let i = 0; i < maxBatches; i++) {
        const batchData: any = {};

        // ✅ Find and include OrderMaster entries that match the images in this batch
        const currentImageBatch =
          i < imageBatches.length ? imageBatches[i] : [];
        const currentNewPartyImageBatch =
          i < newPartyImageBatches.length ? newPartyImageBatches[i] : [];

        // Get unique OrderIDs from images in this batch
        const imageOrderIds = new Set();
        currentImageBatch.forEach((img: any) => {
          if (img.OrderID || img.order_id) {
            imageOrderIds.add(img.OrderID || img.order_id);
          }
        });
        currentNewPartyImageBatch.forEach((img: any) => {
          if (img.id || img.OrderID) {
            imageOrderIds.add(img.id || img.OrderID);
          }
        });

        console.log(
          `🔍 Image OrderIDs in batch ${i + 1}:`,
          Array.from(imageOrderIds),
        );

        // Find matching OrderMaster entries for these images from image-specific OrderMaster
        const relatedOrderMaster = imageOrderMaster.filter((order: any) =>
          imageOrderIds.has(order.ID),
        );

        console.log(
          `📋 Image batch ${i + 1}: ${currentImageBatch.length} images → ${
            relatedOrderMaster.length
          } related OrderMaster`,
        );
        console.log(
          `🔍 OrderMaster IDs in image batch ${i + 1}:`,
          relatedOrderMaster.map((o: any) => o.ID),
        );

        // Add related OrderMaster to this batch
        if (relatedOrderMaster.length > 0) {
          batchData[dataSyncObjectKeys.OrderMaster] = relatedOrderMaster;
        }

        // Add image data for this batch
        if (currentImageBatch.length > 0) {
          batchData[dataSyncObjectKeys.ImageDetails] = currentImageBatch;
        }
        if (currentNewPartyImageBatch.length > 0) {
          batchData[dataSyncObjectKeys.NewPartyImage] =
            currentNewPartyImageBatch;
        }

        // ✅ CRITICAL: Images MUST have OrderMaster - never send images without OrderMaster
        const hasImageData =
          currentImageBatch.length > 0 || currentNewPartyImageBatch.length > 0;
        const hasOrderMasterData = relatedOrderMaster.length > 0;

        if (hasImageData) {
          if (hasOrderMasterData) {
            // ✅ Images with OrderMaster - safe to send
            batches.push(batchData);
            const imageBatchSizeMB = calculateJsonSizeInMB(batchData);
            console.log(
              `📦 Image batch ${i + 1}: ${currentImageBatch.length} images, ${
                currentNewPartyImageBatch.length
              } new party images, ${
                relatedOrderMaster.length
              } orders, ${imageBatchSizeMB.toFixed(2)}MB`,
            );
          } else {
            // ❌ Images without OrderMaster - this should never happen, but handle gracefully
            console.error(
              `🚨 CRITICAL: Images found without OrderMaster in batch ${i + 1}`,
            );
            console.error(
              `🚨 ImageDetails: ${currentImageBatch.length}, NewPartyImages: ${currentNewPartyImageBatch.length}`,
            );
            console.error(
              `🚨 This indicates a data integrity issue - images cannot sync without OrderMaster`,
            );

            // Try to find OrderMaster with additional delay and retry
            await findOrderMasterWithRetry(batchData, i + 1, batches);
          }
        } else if (hasOrderMasterData) {
          // OrderMaster without images - this is valid (activities only)
          batches.push(batchData);
          const batchSizeMB = calculateJsonSizeInMB(batchData);
          console.log(
            `📦 Activity batch ${i + 1}: ${
              relatedOrderMaster.length
            } orders, ${batchSizeMB.toFixed(2)}MB`,
          );
        } else {
          console.log(`⏭️ Skipped empty batch ${i + 1}`);
        }
      }
    } else {
      console.log('📦 Small dataset - creating single batch');
      // Small dataset, use as single batch
      batches.push(data);
    }

    console.log(`📦 Created ${batches.length} batches`);
    batches.forEach((batch, index) => {
      const batchImages = (batch[dataSyncObjectKeys.ImageDetails] || []).length;
      const batchNewPartyImages = (
        batch[dataSyncObjectKeys.NewPartyImage] || []
      ).length;
      const batchOrderMaster = (batch[dataSyncObjectKeys.OrderMaster] || [])
        .length;
      const batchSize = calculateJsonSizeInMB(batch);
      console.log(
        `   Batch ${
          index + 1
        }: ${batchImages} images, ${batchNewPartyImages} new party images, ${batchOrderMaster} orders, ${batchSize.toFixed(
          2,
        )}MB`,
      );
    });

    return batches;
  };

  const processBatchSyncWithAuth = async (
    collectedMGK: string[],
    syncStartTime: string,
    excludeUsageLogs: boolean = true,
  ) => {
    const BATCH_SIZE = 5;
    const MAX_RETRY_ATTEMPTS = 3;
    const BATCH_DELAY = 1500;
    const RETRY_DELAY = 2000;

    let allSavedData: any[] = [];
    let allNotSavedData: any[] = [];
    let finalStatus = '';
    let successfulBatches = 0;

    try {
      if (collectedMGK.length === 0) {
        // Handle no selection case
        console.log('No selection - processing always-sync data');

        setSyncProgress({
          current: 50,
          total: 100,
          message:
            'Processing always-sync data (images, new party, attendance)...',
        });

        const dataCollected2 = await collectSyncData([]);
        if (dataCollected2 && Object.keys(dataCollected2).length > 0) {
          const newToken = await refreshAuthTokenWithRetry();
          if (!newToken) throw new Error('Authentication failed');

          const syncResponse = await postSyncDataWithTimeout(
            newToken,
            dataCollected2,
          );
          await handleResponseData(syncResponse, syncStartTime, collectedMGK);
        } else {
          setisLoading(false);
          setIsSyncInProgress(false);
          setSyncProgress(null);
          Alert.alert('Zylemini+', 'No data found to Sync');
          // navigation.navigate(ScreenName.DASHBOARD);
          navigation.dispatch(
            navigation.popTo(ScreenName.MAINSCREEN, {
              screen: ScreenName.DASHBOARD,
            }),
          );
        }
        return;
      }

      const batches = splitIntoBatches(collectedMGK, BATCH_SIZE);
      console.log(
        `Processing ${batches.length} batches with ${BATCH_SIZE} items each`,
      );

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        let batchSuccess = false;

        // Retry logic for each batch
        for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
          try {
            setSyncProgress({
              current: 30 + (i / batches.length) * 60,
              total: 100,
              message: `Batch ${i + 1}/${
                batches.length
              } (Attempt ${attempt}/${MAX_RETRY_ATTEMPTS})`,
            });

            console.log(
              `Processing batch ${i + 1}/${batches.length}, attempt ${attempt}`,
            );

            // Collect data for this batch
            const batchData = await collectSyncDataForBatch(
              batch,
              excludeUsageLogs,
            );

            if (batchData && Object.keys(batchData).length > 0) {
              const batchSizeMB = calculateJsonSizeInMB(batchData);
              console.log(`Batch ${i + 1} data size: ${batchSizeMB} MB`);

              // Get fresh auth token for each batch
              const newToken = await refreshAuthTokenWithRetry();
              if (!newToken) {
                throw new Error('Authentication failed for batch');
              }

              console.log(`🔐 Using fresh auth token for batch ${i + 1}`);

              const batchResponse = await postSyncDataWithTimeout(
                newToken,
                batchData,
              );

              if (batchResponse) {
                // Handle nested response structure
                const actualResponse = batchResponse?.Data || batchResponse;

                // Accumulate responses
                if (
                  actualResponse.SavedData &&
                  Array.isArray(actualResponse.SavedData)
                ) {
                  allSavedData = [...allSavedData, ...actualResponse.SavedData];
                  console.log(
                    `Batch ${i + 1}: ${
                      actualResponse.SavedData.length
                    } items saved`,
                  );
                }
                if (
                  actualResponse.NotSavedData &&
                  Array.isArray(actualResponse.NotSavedData)
                ) {
                  allNotSavedData = [
                    ...allNotSavedData,
                    ...actualResponse.NotSavedData,
                  ];
                  console.log(
                    `Batch ${i + 1}: ${
                      actualResponse.NotSavedData.length
                    } items failed`,
                  );
                }
                if (actualResponse.Status) {
                  finalStatus = actualResponse.Status;
                }

                batchSuccess = true;
                successfulBatches++;
                console.log(`✅ Batch ${i + 1} completed successfully`);
                break; // Exit retry loop for this batch
              }
            } else {
              console.log(`Batch ${i + 1} has no data to sync`);
              batchSuccess = true; // Empty batch, consider successful
              break;
            }
          } catch (batchError) {
            console.error(
              `❌ Batch ${i + 1} attempt ${attempt} failed:`,
              batchError,
            );
            writeErrorLog(`Batch ${i + 1} attempt ${attempt}`, batchError);

            if (attempt === MAX_RETRY_ATTEMPTS) {
              console.error(
                `❌ Batch ${i + 1} failed after ${MAX_RETRY_ATTEMPTS} attempts`,
              );

              setSyncProgress({
                current: 30 + (i / batches.length) * 60,
                total: 100,
                message: `Batch ${i + 1} failed, continuing with next batch...`,
              });

              // Continue with next batch instead of failing completely
              break;
            } else {
              // Wait before retrying this batch
              setSyncProgress({
                current: 30 + (i / batches.length) * 60,
                total: 100,
                message: `Batch ${i + 1} retry ${attempt + 1} in ${
                  RETRY_DELAY / 1000
                }s...`,
              });
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            }
          }
        }

        // Add delay between successful batches
        if (batchSuccess && i < batches.length - 1) {
          setSyncProgress({
            current: 30 + ((i + 1) / batches.length) * 60,
            total: 100,
            message: `Batch ${i + 1} completed. Preparing batch ${i + 2}...`,
          });
          await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
        }
      }

      // Process combined results
      const combinedResponse = {
        SavedData: allSavedData,
        NotSavedData: allNotSavedData,
        Status:
          finalStatus ||
          (allSavedData.length > 0
            ? 'Data saved successfully.'
            : 'Batch sync completed'),
      };

      console.log(`🎯 Batch sync summary:`);
      console.log(
        `   - Successful batches: ${successfulBatches}/${batches.length}`,
      );
      console.log(`   - Total saved items: ${allSavedData.length}`);
      console.log(`   - Total failed items: ${allNotSavedData.length}`);

      setSyncProgress({
        current: 90,
        total: 100,
        message: 'Processing batch results...',
      });

      await handleResponseData(combinedResponse, syncStartTime);

      setSyncProgress({
        current: 100,
        total: 100,
        message: `Batch sync completed! ${successfulBatches}/${batches.length} batches successful.`,
      });

      setTimeout(() => {
        setSyncProgress(null);
        setIsSyncInProgress(false);
      }, 2000);
    } catch (error: any) {
      console.error('❌ Critical error during batch sync:', error);
      writeErrorLog('processBatchSyncWithAuth error', error);
      setisLoading(false);
      setIsSyncInProgress(false);
      setSyncProgress(null);
      Alert.alert(
        'Batch Sync Error',
        `Critical error during batch processing: ${
          error?.message || 'Unknown error'
        }. Please try again.`,
      );
    }
  };

  const collectSyncDataForBatch = async (
    batchMGK: string[],
    excludeUsageLogs: boolean = true,
  ) => {
    try {
      const JSONObj: any = {};

      console.log(
        `Collecting batch data for ${batchMGK.length} items, excludeUsageLogs: ${excludeUsageLogs}`,
      );

      await clearUnwantedImageNewParty();

      // Prepare database queries
      const promises = [
        getOrderDetailsSyncData2(batchMGK),
        getNewPartyOutletSyncData(),
        getNewPartyImageDetailsyncData(),
        getnewPartyTargetId(),
        getCollectionsSyncData2(batchMGK),
        getCollectionsDetailSyncData2(batchMGK),
        getTABLE_TEMP_CategoryDiscountItem(batchMGK),
        getPaymentReceiptSyncData2(batchMGK),
        getDiscountSyncData2(batchMGK),
        getImageDetailsyncData(),
        getAssetDetailData2(batchMGK),
      ];

      // Add usage logs only if not excluded (for normal sync)
      if (!excludeUsageLogs) {
        promises.splice(4, 0, getUsesLogSyncData()); // Insert at index 4
      }

      const results = await Promise.allSettled<any>(promises);

      let orderDetailsResult,
        newPartyOutletResult,
        newPartyImageDetailsResult,
        newPartyTargetIdResult,
        usesLogDataResult = null,
        collectionsDataResult,
        collectionsDetailDataResult,
        categoryDiscountItemDataResult,
        paymentReceiptDataResult,
        discountDataResult,
        imageDetailsDataResult,
        assetDetailDataResult;

      if (excludeUsageLogs) {
        [
          orderDetailsResult,
          newPartyOutletResult,
          newPartyImageDetailsResult,
          newPartyTargetIdResult,
          collectionsDataResult,
          collectionsDetailDataResult,
          categoryDiscountItemDataResult,
          paymentReceiptDataResult,
          discountDataResult,
          imageDetailsDataResult,
          assetDetailDataResult,
        ] = results;
      } else {
        [
          orderDetailsResult,
          newPartyOutletResult,
          newPartyImageDetailsResult,
          newPartyTargetIdResult,
          usesLogDataResult,
          collectionsDataResult,
          collectionsDetailDataResult,
          categoryDiscountItemDataResult,
          paymentReceiptDataResult,
          discountDataResult,
          imageDetailsDataResult,
          assetDetailDataResult,
        ] = results;
      }

      // Get order master data
      const orderMasterData = await getAllOrderMasterData(batchMGK);
      if (orderMasterData.length > 0) {
        JSONObj[dataSyncObjectKeys.OrderMaster] = orderMasterData;
      }

      // Process order details
      if (
        orderDetailsResult.status === 'fulfilled' &&
        orderDetailsResult.value.length > 0
      ) {
        JSONObj[dataSyncObjectKeys.OrderDetails] = orderDetailsResult.value;
      }

      // Process new party
      if (
        newPartyOutletResult.status === 'fulfilled' &&
        newPartyOutletResult.value.length > 0
      ) {
        JSONObj[dataSyncObjectKeys.NewParty] = newPartyOutletResult.value;
      }

      // Process new party images with timeout protection
      if (
        newPartyImageDetailsResult.status === 'fulfilled' &&
        newPartyImageDetailsResult.value.length > 0
      ) {
        JSONObj[dataSyncObjectKeys.NewPartyImage] = await Promise.all(
          newPartyImageDetailsResult.value.map(async (item: any) => {
            try {
              // ✅ DEFENSIVE GUARD: Check if file exists before reading
              const fileExists = await RNFS.exists(item.ImagePath);
              if (!fileExists) {
                console.warn(
                  `⚠️ NewParty image file does not exist: ${item.ImageName} at ${item.ImagePath}`,
                );
                writeErrorLog(
                  `NewParty image file not found: ${item.ImagePath}`,
                  new Error('File does not exist'),
                );
                return {
                  Id: item.id,
                  ImageName: item.ImageName,
                  ShopId: item.ShopId,
                  Data: '', // Return empty data instead of crashing
                };
              }

              const imageReadPromise = RNFS.readFile(item.ImagePath, 'base64');
              const timeoutPromise = new Promise<string>((_, reject) =>
                setTimeout(
                  () =>
                    reject(
                      new Error(
                        `New party image read timeout: ${item.ImageName}`,
                      ),
                    ),
                  15000,
                ),
              );
              const imageData = await Promise.race([
                imageReadPromise,
                timeoutPromise,
              ]);
              return {
                Id: item.id,
                ImageName: item.ImageName,
                ShopId: item.ShopId,
                Data: imageData,
              };
            } catch (error: any) {
              console.error(
                `Failed to read new party image: ${item.ImageName}`,
                error,
              );
              writeErrorLog(
                `Error reading new party image: ${item.ImagePath}`,
                error,
              );
              return {
                Id: item.id,
                ImageName: item.ImageName,
                ShopId: item.ShopId,
                Data: '',
              };
            }
          }),
        );
      }

      // Process new party target ID
      if (
        newPartyTargetIdResult.status === 'fulfilled' &&
        newPartyTargetIdResult.value.length > 0
      ) {
        JSONObj[dataSyncObjectKeys.newPartyTargetId] =
          newPartyTargetIdResult.value;
      }

      // Process usage logs (only if not excluded)
      if (
        !excludeUsageLogs &&
        usesLogDataResult?.status === 'fulfilled' &&
        usesLogDataResult.value.length > 0
      ) {
        JSONObj[dataSyncObjectKeys.LogUsages] = usesLogDataResult.value;
      }

      // Process collections
      if (
        collectionsDataResult.status === 'fulfilled' &&
        collectionsDataResult.value.length > 0
      ) {
        JSONObj[dataSyncObjectKeys.Collections] = collectionsDataResult.value;
      }

      // Process collection details
      if (
        collectionsDetailDataResult.status === 'fulfilled' &&
        collectionsDetailDataResult.value.length > 0
      ) {
        JSONObj[dataSyncObjectKeys.CollectionsDetails] =
          collectionsDetailDataResult.value;
      }

      // Process category discount items
      if (
        categoryDiscountItemDataResult.status === 'fulfilled' &&
        categoryDiscountItemDataResult.value.length > 0
      ) {
        JSONObj[dataSyncObjectKeys.CategoryDiscountItem] =
          categoryDiscountItemDataResult.value;
      }

      // Process payment receipts
      if (
        paymentReceiptDataResult.status === 'fulfilled' &&
        paymentReceiptDataResult.value.length > 0
      ) {
        JSONObj[dataSyncObjectKeys.PaymentReceipt] =
          paymentReceiptDataResult.value;
      }

      // Process discounts
      if (
        discountDataResult.status === 'fulfilled' &&
        discountDataResult.value.length > 0
      ) {
        JSONObj[dataSyncObjectKeys.Discount] = discountDataResult.value;
      }

      // Process image details with timeout protection
      if (
        imageDetailsDataResult.status === 'fulfilled' &&
        imageDetailsDataResult.value.length > 0
      ) {
        JSONObj[dataSyncObjectKeys.ImageDetails] = await Promise.all(
          imageDetailsDataResult.value.map(async (item: any) => {
            try {
              // ✅ DEFENSIVE GUARD: Check if file exists before reading
              const fileExists = await RNFS.exists(item.ImageBytes);
              if (!fileExists) {
                console.warn(
                  `⚠️ Image detail file does not exist: ${item.ImageName} at ${item.ImageBytes}`,
                );
                writeErrorLog(
                  `Image detail file not found: ${item.ImageBytes}`,
                  new Error('File does not exist'),
                );
                return {
                  ID: item.ID,
                  OrderID: item.OrderID,
                  ImageDatetime: item.ImageDateTime,
                  ImageName: item.ImageName,
                  ImageBytes: '', // Return empty data instead of crashing
                };
              }

              const imageReadPromise = RNFS.readFile(item.ImageBytes, 'base64');
              const timeoutPromise = new Promise<string>((_, reject) =>
                setTimeout(
                  () =>
                    reject(
                      new Error(`Image detail read timeout: ${item.ImageName}`),
                    ),
                  15000,
                ),
              );
              const imageBytes = await Promise.race([
                imageReadPromise,
                timeoutPromise,
              ]);
              return {
                ID: item.ID,
                OrderID: item.OrderID,
                ImageDatetime: item.ImageDateTime,
                ImageName: item.ImageName,
                ImageBytes: imageBytes,
              };
            } catch (error) {
              console.error(
                `Failed to read image detail: ${item.ImageName}`,
                error,
              );
              writeErrorLog(
                `Error reading image detail: ${item.ImageBytes}`,
                error,
              );
              return {
                ID: item.ID,
                OrderID: item.OrderID,
                ImageDatetime: item.ImageDateTime,
                ImageName: item.ImageName,
                ImageBytes: '',
              };
            }
          }),
        );
      }

      // Process asset details
      if (
        assetDetailDataResult.status === 'fulfilled' &&
        assetDetailDataResult.value.length > 0
      ) {
        JSONObj[dataSyncObjectKeys.AssetDetails] = assetDetailDataResult.value;
      }

      // Log any errors
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(
            `Error fetching batch data for index ${index}:`,
            result.reason,
          );
          writeErrorLog('collectSyncDataForBatch', result.reason);
        }
      });

      console.log(
        `Batch data collected: ${Object.keys(JSONObj).length} data types`,
      );

      return JSONObj;
    } catch (error) {
      writeErrorLog('collectSyncDataForBatch error', error);
      throw error;
    }
  };

  const objfunc = () => {
    const array = [
      {
        key: 'ACTIVITY',
        data: data.filter((item: any) => item.collection_type == '6'),
      },
      {
        key: 'ASSETS',
        data: data.filter((item: any) => item.collection_type == '5'),
      },
      {
        key: 'COLLECTION',
        data: data.filter((item: any) => item.collection_type == '7'),
      },
      {
        key: 'DATACOLLECTION',
        data: data.filter(
          (item: any) =>
            item.collection_type == '1' || item.collection_type == '2',
        ),
      },

      {
        key: 'ORDERS',
        data: data.filter((item: any) => item.collection_type == '0'),
      },
      // {
      //     key: '6th item',
      //     data: data.filter(item => item.collection_type == '6'),
      // },
      // {
      //     key: '7th item',
      //     data: data.filter(item => item.collection_type == '7'),
      // },
      // {
      //     key: '8th item',
      //     data: data.filter(item => item.collection_type == '8'),
      // },
    ];
    setMyArray(array);
  };

  const orderDATA = data.filter((item: any) => item.collection_type == '0');
  const datacollDATA = data.filter(
    (item: any) => item.collection_type == '1' || item.collection_type == '2',
  );

  const dataCollection = data.filter(
    (item: any) => item.collection_type == '7',
  );
  const dataActivity = data.filter((item: any) => item.collection_type == '6');
  const dataAssets = data.filter((item: any) => item.collection_type == '5');

  const onApplyBtn = async () => {
    if (isSyncInProgress) {
      Alert.alert(
        'Sync in Progress',
        'A sync operation is already in progress. Please wait.',
      );
      return;
    }

    try {
      setIsSyncInProgress(true);
      setsync(true);
      const syncStartTime = moment().format('YYYY-MM-DD HH:mm:ss');
      setSyncStartTimestamp(syncStartTime);

      let collectedMGK = [];
      for (let key in selecteData) {
        for (let key1 in selecteData[key]) {
          collectedMGK.push(selecteData[key][key1].id);
        }
      }
      setApplyArr([...collectedMGK]);
      setisLoading(true);

      // Set initial progress
      setSyncProgress({
        current: 10,
        total: 100,
        message: 'Analyzing data size to determine sync strategy...',
      });

      console.log('Analyzing data size to determine sync strategy...');

      // Check data size for both selected and non-selected data
      let dataCollected;
      let dataSizeMB = 0;
      const JSON_SIZE_THRESHOLD_MB = 20;

      if (collectedMGK.length === 0) {
        // No selection - collect always-sync data (images, new party, attendance)
        console.log('No selection detected - collecting always-sync data');
        dataCollected = await collectSyncData([]);
        dataSizeMB = calculateJsonSizeInMB(dataCollected);
      } else {
        // Has selection - collect all selected data
        console.log('Selection detected - collecting all selected data');
        dataCollected = await collectSyncData(collectedMGK);
        dataSizeMB = calculateJsonSizeInMB(dataCollected);
      }

      if (!dataCollected || Object.keys(dataCollected).length === 0) {
        setisLoading(false);
        setIsSyncInProgress(false);
        setSyncProgress(null);
        Alert.alert('Zylemini+', 'No data found to Sync');
        //navigation.navigate(ScreenName.DASHBOARD);
        navigation.dispatch(
          navigation.popTo(ScreenName.MAINSCREEN, {
            screen: ScreenName.DASHBOARD,
          }),
        );
        return;
      }

      console.log(
        `Data size: ${dataSizeMB} MB, Threshold: ${JSON_SIZE_THRESHOLD_MB} MB`,
      );

      // Check for early phasing flag (large image datasets detected before processing)
      if (dataCollected._needsPhasing) {
        console.log(
          `🔄 Early phasing detected: ${dataCollected._totalImageCount} images require multi-phase sync`,
        );
        setSyncProgress({
          current: 30,
          total: 100,
          message: `Large image dataset detected (${dataCollected._totalImageCount} images). Using multi-phase sync...`,
        });
        await processMultiPhaseSync(dataCollected, collectedMGK, syncStartTime);
      } else if (dataSizeMB > JSON_SIZE_THRESHOLD_MB) {
        console.log('Using multi-phase sync strategy due to large data size');
        setSyncProgress({
          current: 30,
          total: 100,
          message: `Large dataset detected (${dataSizeMB} MB). Using multi-phase sync...`,
        });
        await processMultiPhaseSync(dataCollected, collectedMGK, syncStartTime);
      } else {
        console.log('Using normal sync strategy');
        setSyncProgress({
          current: 50,
          total: 100,
          message: 'Processing activities for normal sync...',
        });

        // ✅ NORMAL SYNC FIX: Exclude ImageDetails from small data to prevent OrderMaster mismatch
        const processedData = {...dataCollected};

        // Clean up metadata keys before sending (don't process images in normal sync)
        delete processedData._imageDetailsMetadata;
        delete processedData._newPartyImagesMetadata;
        delete processedData._needsPhasing;
        delete processedData._totalImageCount;

        // ✅ CRITICAL FIX: Check if we have images that need separate processing
        const hasImages =
          (dataCollected._imageDetailsMetadata &&
            dataCollected._imageDetailsMetadata.length > 0) ||
          (dataCollected._newPartyImagesMetadata &&
            dataCollected._newPartyImagesMetadata.length > 0);

        if (hasImages) {
          console.log(
            `🔄 Small data with images detected. Using separate image processing...`,
          );
          setSyncProgress({
            current: 30,
            total: 100,
            message: `Small data with images detected. Using separate image processing...`,
          });

          // First sync activities only
          setSyncProgress({
            current: 40,
            total: 100,
            message: 'Syncing activities first...',
          });

          const newToken = await refreshAuthTokenWithRetry();
          if (!newToken) {
            throw new Error('Failed to obtain authentication token');
          }

          const activitiesResponse = await postSyncDataWithTimeout(
            newToken,
            processedData,
          );

          setSyncProgress({
            current: 60,
            total: 100,
            message: 'Activities synced. Processing images...',
          });

          // ✅ ATOMIC OPERATION: Process activities response without showing success alert
          await handleResponseData(
            activitiesResponse,
            syncStartTime,
            collectedMGK,
            true,
          ); // isPartOfMultiPhase = true

          // ✅ DYNAMIC BATCH CREATION: Process images with size-based batching
          console.log(
            `🔄 Processing images with dynamic size-based batching...`,
          );

          // Get images from metadata
          const currentImageDetails = dataCollected._imageDetailsMetadata || [];
          const currentNewPartyImages =
            dataCollected._newPartyImagesMetadata || [];

          // Create dynamic batches based on actual JSON size
          const {
            createDynamicImageBatches,
          } = require('../../utility/imageProcessingUtils');
          const dynamicBatches = await createDynamicImageBatches(
            currentImageDetails,
            currentNewPartyImages,
          );

          console.log(
            `📊 Dynamic batching: Created ${dynamicBatches.length} batches based on actual JSON size`,
          );

          // Process each batch with proper progress tracking
          for (
            let batchNumber = 1;
            batchNumber <= dynamicBatches.length;
            batchNumber++
          ) {
            const batch = dynamicBatches[batchNumber - 1];
            console.log(
              `🔄 Processing batch ${batchNumber}/${dynamicBatches.length} (${batch.batchType})`,
            );

            // ✅ ENHANCED PROGRESS: Calculate progress based on actual batch count
            const batchProgress =
              Math.round(((batchNumber - 1) / dynamicBatches.length) * 25) + 70; // 70-95%
            setSyncProgress({
              current: batchProgress,
              total: 100,
              message: `Processing image batch ${batchNumber}/${
                dynamicBatches.length
              } (${batch.batchType}, ${
                batch.imageDetails.length + batch.newPartyImages.length
              } images)...`,
            });

            // Process the batch images
            const imageOnlyData: any = {};

            try {
              console.log(
                `🖼️ Processing ${batch.imageDetails.length} ImageDetails and ${batch.newPartyImages.length} NewPartyImages for batch ${batchNumber}...`,
              );

              // Process ImageDetails
              if (batch.imageDetails.length > 0) {
                const processedImageDetails = await Promise.all(
                  batch.imageDetails.map(async (item: any) => {
                    try {
                      const fileExists = await RNFS.exists(item.ImageBytes);
                      if (!fileExists) {
                        console.warn(
                          `⚠️ Image file does not exist: ${item.ImageName} at ${item.ImageBytes}`,
                        );
                        return {
                          ID: item.ID,
                          OrderID: item.OrderID,
                          ImageDatetime: item.ImageDateTime,
                          ImageName: item.ImageName,
                          ImageBytes: '',
                        };
                      }

                      const imageBytes = await RNFS.readFile(
                        item.ImageBytes,
                        'base64',
                      );
                      return {
                        ID: item.ID,
                        OrderID: item.OrderID,
                        ImageDatetime: item.ImageDateTime,
                        ImageName: item.ImageName,
                        ImageBytes: imageBytes,
                      };
                    } catch (error) {
                      console.error(
                        `❌ Error processing image: ${item.ImageName}`,
                        error,
                      );
                      return {
                        ID: item.ID,
                        OrderID: item.OrderID,
                        ImageDatetime: item.ImageDateTime,
                        ImageName: item.ImageName,
                        ImageBytes: '',
                      };
                    }
                  }),
                );
                imageOnlyData[dataSyncObjectKeys.ImageDetails] =
                  processedImageDetails;
                console.log(
                  `✅ Processed ${processedImageDetails.length} ImageDetails for batch ${batchNumber}`,
                );
              }

              // Process NewPartyImages
              if (batch.newPartyImages.length > 0) {
                const processedNewPartyImages = await Promise.all(
                  batch.newPartyImages.map(async (item: any) => {
                    try {
                      const fileExists = await RNFS.exists(item.ImagePath);
                      if (!fileExists) {
                        console.warn(
                          `⚠️ NewParty image file does not exist: ${item.ImageName} at ${item.ImagePath}`,
                        );
                        return {
                          Id: item.id,
                          ImageName: item.ImageName,
                          ShopId: item.ShopId,
                          Data: '',
                        };
                      }

                      const imageData = await RNFS.readFile(
                        item.ImagePath,
                        'base64',
                      );
                      return {
                        Id: item.id,
                        ImageName: item.ImageName,
                        ShopId: item.ShopId,
                        Data: imageData,
                      };
                    } catch (error) {
                      console.error(
                        `❌ Error processing NewParty image: ${item.ImageName}`,
                        error,
                      );
                      return {
                        Id: item.id,
                        ImageName: item.ImageName,
                        ShopId: item.ShopId,
                        Data: '',
                      };
                    }
                  }),
                );
                imageOnlyData[dataSyncObjectKeys.NewPartyImage] =
                  processedNewPartyImages;
                console.log(
                  `✅ Processed ${processedNewPartyImages.length} NewPartyImages for batch ${batchNumber}`,
                );
              }
            } catch (error) {
              console.error(
                `❌ Error processing images in batch ${batchNumber}:`,
                error,
              );
              writeErrorLog(
                `Small data image processing error batch ${batchNumber}`,
                error,
              );
            }

            // Add related OrderMaster for images in this batch
            try {
              const imageOrderMaster =
                (await getOrderMasterSyncDataForImage()) as any[];
              if (imageOrderMaster && imageOrderMaster.length > 0) {
                // Filter OrderMaster to only include those related to current batch images
                const currentBatchImageIds = [
                  ...(imageOnlyData[dataSyncObjectKeys.ImageDetails] || []).map(
                    (img: any) => img.OrderID,
                  ),
                  ...(
                    imageOnlyData[dataSyncObjectKeys.NewPartyImage] || []
                  ).map((img: any) => img.id),
                ].filter(Boolean);

                const relatedOrderMaster = imageOrderMaster.filter(
                  (order: any) => currentBatchImageIds.includes(order.ID),
                );

                if (relatedOrderMaster.length > 0) {
                  imageOnlyData[dataSyncObjectKeys.OrderMaster] =
                    relatedOrderMaster;
                  console.log(
                    `📋 Added ${relatedOrderMaster.length} image-related OrderMaster to batch ${batchNumber}`,
                  );
                }
              }
            } catch (error) {
              console.error(
                `❌ Error getting OrderMaster for batch ${batchNumber}:`,
                error,
              );
            }

            // Final size check before posting
            const finalSize = calculateJsonSizeInMB(imageOnlyData);
            console.log(`📊 Batch ${batchNumber} final size: ${finalSize}MB`);

            // ✅ ENHANCED PROGRESS: Update progress for sync operation
            setSyncProgress({
              current: batchProgress + 2,
              total: 100,
              message: `Syncing image batch ${batchNumber}/${dynamicBatches.length}...`,
            });

            // Sync this batch
            const imageToken = await refreshAuthTokenWithRetry();
            if (!imageToken) {
              throw new Error(
                `Failed to obtain authentication token for image batch ${batchNumber}`,
              );
            }

            const imageResponse = await postSyncDataWithTimeout(
              imageToken,
              imageOnlyData,
            );

            // ✅ ENHANCED PROGRESS: Update progress for response processing
            setSyncProgress({
              current: batchProgress + 4,
              total: 100,
              message: `Processing image batch ${batchNumber}/${dynamicBatches.length} response...`,
            });

            // Process response without showing success alert
            await handleResponseData(
              imageResponse,
              syncStartTime,
              collectedMGK,
              true,
            );

            console.log(`✅ Image batch ${batchNumber} completed successfully`);

            // Memory cleanup between batches
            if (global.gc) {
              global.gc();
              console.log('🧹 Memory cleanup after batch processing');
            }
          }

          console.log(
            `🎉 All ${dynamicBatches.length} image batches completed successfully`,
          );

          // ✅ FINAL SUCCESS: Show single success alert and call GetData only once
          setSyncProgress({
            current: 100,
            total: 100,
            message: 'Sync completed successfully!',
          });

          setTimeout(() => {
            setSyncProgress(null);
            setIsSyncInProgress(false);
            setisLoading(false);
            Alert.alert('Zylemini+', 'Data sync completed successfully!', [
              {
                text: 'OK',
                onPress: () => {
                  GetNewData();
                },
              },
            ]);
          }, 1000);
        } else {
          // No images - sync activities only
          setSyncProgress({
            current: 70,
            total: 100,
            message: 'Uploading activities to server...',
          });

          // ✅ DETAILED LOGGING: Show what data is being sent
          console.log('📤 Normal sync: Final data being sent:');
          Object.keys(processedData).forEach(key => {
            console.log(
              `📋 Sending: ${key} = ${
                Array.isArray(processedData[key])
                  ? processedData[key].length
                  : 'N/A'
              } items`,
            );
          });

          const newToken = await refreshAuthTokenWithRetry();
          if (!newToken) {
            throw new Error('Failed to obtain authentication token');
          }

          const syncResponse = await postSyncDataWithTimeout(
            newToken,
            processedData,
          );

          setSyncProgress({
            current: 90,
            total: 100,
            message: 'Processing server response...',
          });

          await handleResponseData(syncResponse, syncStartTime, collectedMGK);
        }
      }
    } catch (error) {
      console.error('Error in onApplyBtn:', error);
      writeErrorLog('onApplyBtn error', error);
      setisLoading(false);
      setIsSyncInProgress(false);
      setSyncProgress(null);
      window.alert('Sync Error\n\nAn error occurred during sync. Please try again.');
    }
  };

  //('\n applyarr -->', applyArr);

  const RenderAitem = ({item, index}: any) => {
    let isSelected =
      selecteData[item.key] &&
      item.data?.length == selecteData[item.key]?.length
        ? true
        : false;

    const countSelectedNum =
      item.key == 'ORDERS'
        ? selecteData?.ORDERS?.length
        : item.key == 'DATACOLLECTION'
        ? selecteData?.DATACOLLECTION?.length
        : item.key == 'COLLECTION'
        ? selecteData?.COLLECTION?.length
        : item.key == 'ASSETS'
        ? selecteData?.ASSETS?.length
        : item.key == 'ACTIVITY'
        ? selecteData?.ACTIVITY?.length
        : null;

    const countNumFromDb =
      item.key == 'ORDERS'
        ? orderDATA.length
        : item.key == 'DATACOLLECTION'
        ? datacollDATA.length
        : item.key == 'COLLECTION'
        ? dataCollection.length
        : item.key == 'ASSETS'
        ? dataAssets.length
        : item.key == 'ACTIVITY'
        ? dataActivity.length
        : null;

    return (
      <Box key={index}>
        <Box sx={{
          width: '100%',
          height: 'auto',
          borderRadius: 1.125,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          mt: 3,
        }}>
          <Box
            onClick={() => {
              let isOpend = openIndex.includes(index);
              if (!isOpend) {
                let data = [];
                data.push(index);
                setOpenIndex(data);
              } else {
                setOpenIndex([]);
              }
            }}
            sx={{cursor: 'pointer'}}>
            <Box sx={{
              bgcolor: '#796A6A',
              py: 0.75,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              borderRadius: 1,
            }}>
              <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                ml: '1.5%',
              }}>
                <Checkbox
                  disabled={false}
                  checked={isSelected}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    let data = selecteData;
                    if (checked) {
                      data[item.key] = item.data;
                      setSelectedData({
                        ...selecteData,
                        ...data,
                      });
                    } else {
                      delete data[item.key];
                      setSelectedData({
                        ...selecteData,
                        ...data,
                      });
                    }
                  }}
                  sx={{
                    color: 'black',
                    '&.Mui-checked': {
                      color: '#FFFFFF',
                    },
                  }}
                />

                <Typography sx={{fontSize: 18, color: '#FFFFFF', fontWeight: 'bold', mr: 1.25, textAlign: 'center', ml: '1.5%'}}>
                  {item.key}
                </Typography>
              </Box>
              <Box sx={{
                alignSelf: 'center',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Typography sx={{fontSize: 18, color: '#FFFFFF', fontWeight: 'bold', mr: 1.25, textAlign: 'center'}}>
                  Selected = {countSelectedNum ? countSelectedNum : 0} /{' '}
                  {countNumFromDb ? countNumFromDb : 0}
                </Typography>
                <Box sx={{
                  height: 16,
                  width: 16,
                  mr: 1.25,
                  transition: 'transform 0.3s',
                }}>
                  {openIndex.length > 0 && openIndex.includes(index) ? '▼' : '▲'}
                </Box>
              </Box>
            </Box>
          </Box>

          {openIndex.length > 0 && openIndex.includes(index) ? (
            <Box sx={{
              overflowY: 'auto',
              borderWidth: 0.6,
              borderRadius: 1.125,
              borderColor: '#E0E0E0',
              borderStyle: 'solid',
            }}>
              {myArray[index]?.data?.map((item1: any, index1: any) => {
                return (
                  <ExpandItem
                    key={index1}
                    item1={item1}
                    index1={index1}
                    mainItem={item}
                  />
                );
              })}
            </Box>
          ) : null}
        </Box>
      </Box>
    );
  };

  const ExpandItem = ({item1, index1, mainItem}: any) => {
    let isContain = false;
    if (selecteData[mainItem.key]) {
      isContain = selecteData[mainItem.key]?.includes(item1);
    }

    return (
      <Box key={index1}>
        {index1 !== 0 ? (
          <Box sx={{width: '100%'}}>
            <Typography noWrap>
              -------------------------------------------------------------------------------------------------------------------------------------------
            </Typography>
          </Box>
        ) : null}
        <Box sx={{display: 'flex', flexDirection: 'row', bgcolor: '#FAFAFA', mt: 0.625}}>
          <Box sx={{mr: '1%'}}>
            <Checkbox
              disabled={false}
              checked={isContain}
              onChange={(event1) => {
                const checked = event1.target.checked;
                let obj = selecteData;
                let array = [];
                if (selecteData[mainItem.key]) {
                  array = selecteData[mainItem.key];
                }
                if (checked) {
                  array.push(item1);
                  obj[mainItem.key] = array;
                  setSelectedData({...selecteData, ...obj});
                } else {
                  array = array?.filter((item5: any) => item5 != item1);
                  obj[mainItem.key] = array;
                  if (obj[mainItem.key]?.length == 0) {
                    delete obj[mainItem.key];
                  }
                  setSelectedData({...selecteData, ...obj});
                }
              }}
            />
          </Box>
          <Typography sx={{mt: 0.625, fontSize: 14.5, color: '#796A6A', mr: 1.25, fontWeight: '700'}}>
            {item1.id}
          </Typography>
        </Box>
        <Box sx={{display: 'flex', flexDirection: 'column', bgcolor: '#FAFAFA', p: 0.625, mr: '1%'}}>
          <Typography sx={{mt: 0.625, fontSize: 14.5, color: '#796A6A', mr: 1.25, fontWeight: '500'}}>
            {item1.Party}
          </Typography>
          <Box sx={{display: 'flex', flexDirection: 'row'}}>
            <Typography sx={{mt: 0.625, fontSize: 12, color: '#796A6A', fontWeight: '500', mr: 0}}>
              Distributor :{' '}
            </Typography>
            <Typography sx={{mt: 0.625, fontSize: 12, color: '#796A6A', fontWeight: '400'}}>
              {item1.Distributor}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{width: '100%', height: '100vh', display: 'flex', flexDirection: 'column'}}>
      <Box sx={{height: '100%', px: 2.5, bgcolor: '#FAFAFA'}}>
        <Loader visible={isLoading} />

        {/* Sync Progress Overlay */}
        <SyncProgressOverlay
          visible={!!syncProgress}
          progress={syncProgress || {current: 0, total: 100, message: ''}}
          isSideMenu={false}
        />

        <Box sx={{overflowY: 'auto', height: '100%'}}>
          {/* {console.log('befire setting map', data)} */}
          {myArray.map((item: any, index: any) => {
            // console.log('Item from renderAitem-->', item);

            if (item?.data?.length > 0) {
              return <RenderAitem key={index} item={item} index={index} />;
            } else {
              return null;
            }
          })}

          <Box sx={{mt: '8%'}}></Box>
        </Box>
        <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', py: 0.625}}>
          <Box
            onClick={() => {
              if (!isSyncInProgress) {
                onApplyBtn();
              }
            }}
            sx={{
              cursor: isSyncInProgress ? 'not-allowed' : 'pointer',
              opacity: isSyncInProgress ? 0.6 : 1,
            }}>
            <Box sx={{display: 'flex', justifyContent: 'center', alignSelf: 'center'}}>
              <Box sx={{
                bgcolor: 'green',
                display: 'flex',
                justifyContent: 'center',
                borderColor: '#CC1167',
                height: 50,
                width: 120,
                borderRadius: 1.25,
                alignItems: 'center',
              }}>
                <Typography sx={{color: '#FFFFFF', fontFamily: 'Proxima Nova', fontSize: 14, fontWeight: 'bold', p: 1.25}}>
                  {isSyncInProgress ? 'Syncing...' : t('SideMenu.SyncData')}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box
            onClick={() => {
              if (!isSyncInProgress) {
                Setdata55(!data55);
                navigate('/dashboard');
              }
            }}
            sx={{
              cursor: isSyncInProgress ? 'not-allowed' : 'pointer',
              opacity: isSyncInProgress ? 0.6 : 1,
            }}>
            <Box>
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                height: 50,
                width: 120,
                borderRadius: 1.25,
                border: 1,
                alignItems: 'center',
              }}>
                <Typography sx={{color: 'black', fontFamily: 'Proxima Nova', fontSize: 14, fontWeight: 'bold', p: 1.25}}>
                  {t('Activity.CancelActivityCancel')}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

const styles = {
  mainContainer: {
    height: '100%',
    px: 2.5,
    bgcolor: '#FAFAFA',
  },

  menuContainer: {
    width: '100%',
    height: 'auto',
    // backgroundColor: '#796A6A',
    // borderBottomWidth: 0.8,
    // borderLeftWidth: 0.5,
    // borderRightWidth: 0.5,
    // borderColor: '#796A6A',
    borderRadius: 9,
    shadowColor: 'grey',
    shadowOpacity: 0.8,
    marginTop: hp(3),
  },

  infoContainer: {
    borderWidth: 0.6,
    borderRadius: 9,
  },

  underInfoConatiner: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    marginTop: 5,
  },

  syncTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginRight: 10,
    textAlign: 'center',
    marginLeft: wp('1.5%'),
  },

  selectedCount: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginRight: 10,
    textAlign: 'center',
  },

  partyDistributorBox: {
    flexDirection: 'column',
    backgroundColor: '#FAFAFA',
    padding: 5,
    marginRight: wp('1%'),
  },

  dropDownIcon: {
    height: 16,
    width: 16,
    alignSelf: 'center',
    resizeMode: 'contain',
    marginRight: 10,
  },

  dropDownBox: {
    backgroundColor: '#796A6A',
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 8,
  },

  textUnderDropdown: {
    marginTop: 5,
    fontSize: 14.5,
    color: '#796A6A',
    marginRight: 10,
  },

  applyCancelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 5,
  },

  applyContainer: {
    backgroundColor: 'green',
    justifyContent: 'center',
    borderColor: '#CC1167',
    height: 50,
    width: 120,
    borderRadius: 10,
  },

  applyTextStyle: {
    alignSelf: 'center',
    color: '#FFFFFF',
    fontFamily: 'Proxima Nova',
    fontSize: 14,
    fontWeight: 'bold',
    padding: 10,
  },

  cancelContainer: {
    justifyContent: 'center',
    height: 50,
    width: 120,
    borderRadius: 10,
    borderWidth: 1,
  },

  cancelTextStyle: {
    color: 'black',
    alignSelf: 'center',
    fontFamily: 'Proxima Nova',
    fontSize: 14,
    fontWeight: 'bold',
    padding: 10,
  },

  disabledButton: {
    opacity: 0.6,
  },
};

export default ExpandList;
