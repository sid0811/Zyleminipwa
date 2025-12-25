import {
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
  send_newpartyImageoutlet,
  send_NewPartyOutlet,
  send_OnlineParentArea,
  send_OutletAssetInformation,
  send_PendingOrdersDetails,
  send_PendingOrdersDiscount,
  send_PendingOrdersMaster,
  send_PJPMaster,
  send_PriceListClassification,
  send_Receipt,
  send_Resources,
  send_Sales,
  send_SalesYTD,
  send_SchemeDetails,
  send_SchemeMaster,
  send_SIPREPORT,
  send_SubGroupMaster,
  send_SurveyMaster,
  send_table_user,
  send_Target,
  send_TempOutstandingDetails,
  send_TX_Collections_log,
  send_TX_PaymentReceipt,
  send_TX_PaymentReceipt_log,
  send_uommaster,
  send_user,
  send_uses_log,
  send_VW_PendingOrders,
  sendChequeReturnDetails,
  sendMeetReport,
  sendMJPMaster,
  sendOrderDetails,
  sendOrderMaster,
  sendOutstandingDetails,
  sendPCustomer,
  sendPDistributor,
  sendPItem,
  sendReport,
  sendReportControlMaster,
  sendSettings,
  sendTABLE_DISCOUNT,
  sendTABLE_TEMP_CategoryDiscountItem,
  sendTABLE_TEMP_ImagesDetails,
  sendTABLE_TEMP_ORDER_DETAILS,
  sendTABLE_TEMP_OrderMaster,
  sendTEMP_TABLE_DISCOUNT,
  sendTX_Collections,
  sendTX_CollectionsDetails,
  sendTX_CollectionsDetails_log,
} from '../database/WebDatabaseHelpers';
import {dataReportObjectKeys, writeErrorLog} from '../utility/utils';
import {postFullErrorReport} from '../api/LoginAPICalls';

// Web replacement for RNFS.readFile
const readFileAsBase64 = async (filePath: string): Promise<string> => {
  // For web, images are stored as base64 in localStorage or IndexedDB
  const stored = localStorage.getItem(filePath);
  if (stored) {
    // If already base64, return it
    if (stored.startsWith('data:')) {
      return stored.split(',')[1];
    }
    return stored;
  }
  return '';
};

export const doSosSyncBackGroundForeGroundFullDatabase = async (
  isFromScreen: boolean,
  userId: string,
  savedClientCode: string,
  callLoaderCallBack: (isTrue: boolean) => void,
  redirectionCallBack: (alertMsg: string, isRedirect: boolean) => void,
  updateNotificationCallBack?: (percentage: number) => void,
) => {
  isFromScreen && callLoaderCallBack(true);
  console.log('\nStarting sendFullDatabase function');

  let JSONObj: Record<string, any> = {};

  try {
    const results = await Promise.allSettled([
      send_newpartyImageoutlet(),
      send_NewPartyOutlet(),
      send_TX_PaymentReceipt_log(),
      send_TX_PaymentReceipt(),
      send_TX_Collections_log(),
      sendTX_CollectionsDetails_log(),
      sendTX_CollectionsDetails(),
      sendTX_Collections(),
      sendTEMP_TABLE_DISCOUNT(),
      sendTABLE_TEMP_OrderMaster(),
      sendTABLE_TEMP_ORDER_DETAILS(),
      sendTABLE_TEMP_ImagesDetails(),
      sendTABLE_TEMP_CategoryDiscountItem(),
      sendTABLE_DISCOUNT(),
      sendSettings(),
      sendReportControlMaster(),
      sendReport(),
      sendPCustomer(),
      sendPDistributor(),
      sendPItem(),
      sendOutstandingDetails(),
      sendMeetReport(),
      sendMJPMaster(),
      sendChequeReturnDetails(),
      sendOrderDetails(),
      sendOrderMaster(),
      send_AreaParentList(),
      send_AssetPlacementVerification(),
      send_AssetTypeClassificationList(),
      send_CollectionTypes(),
      send_DiscountMaster(),
      send_Discounts(),
      send_DistributorContacts(),
      send_DistributorDataStatus(),
      send_ImagesDetails(),
      send_LiveLocationLogs(),
      send_MJPMasterDetails(),
      send_MultiEntityUser(),
      send_OnlineParentArea(),
      send_OutletAssetInformation(),
      send_PJPMaster(),
      send_PendingOrdersDetails(),
      send_PendingOrdersDiscount(),
      send_PendingOrdersMaster(),
      send_PriceListClassification(),
      send_Receipt(),
      send_Resources(),
      send_SIPREPORT(),
      send_Sales(),
      send_SalesYTD(),
      send_SchemeDetails(),
      send_SchemeMaster(),
      send_SubGroupMaster(),
      send_SurveyMaster(),
      send_Target(),
      send_TempOutstandingDetails(),
      send_VW_PendingOrders(),
      send_table_user(),
      send_uommaster(),
      send_user(),
      send_uses_log(),
    ]);
    !isFromScreen && updateNotificationCallBack?.(20); //notification status flow percentage update

    // Log any rejected promises
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(
          `❌ Error fetching data at index ${index}:`,
          result.reason,
        );
        writeErrorLog('sendFullDatabase', result.reason);
      }
    });

    const processResult = (result: PromiseSettledResult<any>, key: string) => {
      if (result.status === 'fulfilled' && result.value?.length > 0) {
        const reportKey = (dataReportObjectKeys as any)[key];
        if (reportKey) {
          JSONObj[reportKey] = result.value;
          console.log(`✅ ${key} added to JSONObj`);
        }
      }
    };

    // Manual mapping for better clarity
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
    !isFromScreen && updateNotificationCallBack?.(30); //notification status flow percentage update

    for (let i = 0; i < keyMap.length; i++) {
      if (keyMap[i] === 'ImageDetails' && results[i].status === 'fulfilled') {
        const imageResults = await Promise.all(
          (results[i] as PromiseFulfilledResult<any>).value.map(async (item: any) => ({
            ID: item.ID,
            OrderID: item.OrderID,
            ImageDatetime: item.ImageDateTime,
            ImageName: item.ImageName,
            ImageBytes: await readFileAsBase64(item.ImageBytes),
          })),
        );
        JSONObj[dataReportObjectKeys.ImageDetails] = imageResults;
        console.log('✅ ImageDetails processed and added');
      } else {
        processResult(results[i], keyMap[i]);
      }
    }
    !isFromScreen && updateNotificationCallBack?.(40); //notification status flow percentage update

    // console.log(JSONObj);
    // return JSONObj;
    // const dataCollected2 = await sendFullDatabase();
    console.log('dataCollected2', Object.keys(JSONObj).length);
    if (Object.keys(JSONObj).length > 0) {
      const headers12: any = {
        UserId: userId,
        ClientCode: savedClientCode,
      };
      try {
        !isFromScreen && updateNotificationCallBack?.(60); //notification status flow percentage update

        await postFullErrorReport(headers12, JSONObj);
        !isFromScreen && updateNotificationCallBack?.(80); //notification status flow percentage update
        callLoaderCallBack(false); //setisLoading(false);
        redirectionCallBack('Alerts.LogdataPost', true);
        console.log('datatosss');
      } catch (error) {
        if (isFromScreen) {
          callLoaderCallBack(false); //setisLoading(false);
          redirectionCallBack(JSON.stringify(error), true); //navigation.navigate(ScreenName.DASHBOARD);
          //console.log('Report Error API Error', error);
          //Alert.alert('', '' + error);
        }
      }
    } else {
      !isFromScreen && updateNotificationCallBack?.(80); //notification status flow percentage update
      callLoaderCallBack(false); //setisLoading(false);
      redirectionCallBack('No Activity is found to send data !', true); //navigation.navigate(ScreenName.DASHBOARD);
    }
    //redirectionCallBack('Alerts.LogdataPost', true);
  } catch (error) {
    console.error('❌ Error in sendFullDatabase:', error);
    writeErrorLog('sendFullDatabase', error);
    throw error;
  } finally {
    isFromScreen && callLoaderCallBack(true);
    !isFromScreen && updateNotificationCallBack?.(100); //notification status flow percentage update
    //  setisLoading(false);
  }
};
