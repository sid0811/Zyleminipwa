import {postErrorReport} from '../api/LoginAPICalls';
import {
  getAssetDetailData,
  getCategoryDiscountItemSyncData,
  getCollectionsDetailSyncData,
  getCollectionsSyncData,
  getDiscountSyncData,
  getNewPartyImageDetailsyncData,
  getNewPartyOutletSyncData,
  getnewPartyTargetId,
  getOrderDetailsSyncData,
  getOrderMasterSyncData,
  getPaymentReceiptSyncData,
  getUsesLogSyncData,
} from '../database/WebDatabaseHelpers';
import {clearUnwantedImageNewParty} from '../screens/Shops/shopsUtils';

// Web replacement for RNFS - reads from localStorage/IndexedDB
const readFileAsBase64 = async (filePath: string): Promise<string> => {
  // For web, images are stored as base64 in localStorage or IndexedDB
  // This is a placeholder - actual implementation depends on how images are stored
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

export const doSosSyncBackGroundForeGround = async (
  isFromScreen: boolean,
  userId: string,
  savedClientCode: string,
  callLoaderCallBack: (isTrue: boolean) => void,
  redirectionCallBack: (alertMsg: string, isRedirect: boolean) => void,
  updateNotificationCallBack?: (percentage: number) => void,
) => {
  let JSONObj: any = {};
  let isLoading: boolean = true;
  let newPartyImagedetails: any = [];
  let ImageDetails: any = [];

  try {
    isFromScreen && callLoaderCallBack(true);
    console.log(isLoading);
    let OrderMaster: any = await getOrderMasterSyncData('N');
    if (OrderMaster.length > 0) JSONObj['OrderMaster'] = OrderMaster;

    let OrderDetails: any = await getOrderDetailsSyncData();
    if (OrderDetails.length > 0) JSONObj['OrderDetails'] = OrderDetails;

    let NewPartyOutlet: any = await getNewPartyOutletSyncData();
    if (NewPartyOutlet.length > 0) JSONObj['NewParty'] = NewPartyOutlet;
    console.log(' Valid before:sos');
    await clearUnwantedImageNewParty();
    console.log(' Valid after:sos');
    let newPartyImageData: any = await getNewPartyImageDetailsyncData();
    if (newPartyImageData.length > 0) {
      await Promise.all(
        newPartyImageData.map(async (item: any) => {
          let imageBase64 = await readFileAsBase64(item.ImagePath);
          newPartyImagedetails.push({
            Id: item.id,
            ImageName: item.ImageName,
            ShopId: item.ShopId,
            Data: imageBase64,
          });
        }),
      );
      JSONObj['NewPartyImage'] = newPartyImagedetails;
    }

    let newPartyTargetId: any = await getnewPartyTargetId();
    if (newPartyTargetId.length > 0)
      JSONObj['newPartyTargetId'] = newPartyTargetId;

    let UsesLog: any = await getUsesLogSyncData();
    if (UsesLog.length > 0) JSONObj['LogUsages'] = UsesLog;

    let Collections: any = await getCollectionsSyncData();
    if (Collections.length > 0) JSONObj['Collections'] = Collections;

    let CollectionDetails: any = await getCollectionsDetailSyncData();
    if (CollectionDetails.length > 0)
      JSONObj['CollectionsDetails'] = CollectionDetails;

    let CategoryDiscountItem: any = await getCategoryDiscountItemSyncData();
    if (CategoryDiscountItem.length > 0)
      JSONObj['CategoryDiscountItem'] = CategoryDiscountItem;

    let PaymentReceipt: any = await getPaymentReceiptSyncData();
    if (PaymentReceipt.length > 0) JSONObj['PaymentReceipt'] = PaymentReceipt;

    let Discount: any = await getDiscountSyncData();
    if (Discount.length > 0) JSONObj['Discount'] = Discount;

    let AssetDetails: any = await getAssetDetailData();
    if (AssetDetails.length > 0) JSONObj['AssetDetails'] = AssetDetails;

    let count = Object.keys(JSONObj).length;

    if (count > 0) {
      const headers12 = {
        UserId: userId,
        ClientCode: savedClientCode,
      };

      !isFromScreen && updateNotificationCallBack?.(50); //notification status flow percentage update
      setTimeout(() => {
        console.log('setTimeout');
      }, 5000);
      console.log('before api call ', headers12);
      //console.log('before api call JSONObj ', JSONObj);
      await appendToLog(JSON.stringify(JSONObj));
      let x = await postErrorReport(
        headers12,
        JSONObj,
      );
      console.log('after api call ', x);

      !isFromScreen && updateNotificationCallBack?.(70); //notification status flow percentage update
      isFromScreen && redirectionCallBack('Alerts.LogdataPost', true);
      //Alert.alert('', t('Alerts.LogdataPost'));
      // navigation.navigate(ScreenName.DASHBOARD);
    } else {
      isFromScreen &&
        redirectionCallBack('No Activity is found to send data!', false);
      //Alert.alert('', t('No Activity is found to send data!'));
    }
  } catch (error) {
    console.log('Error during sync process:', error);
    //Alert.alert('', t('Error occurred during sync!'));
    isFromScreen && redirectionCallBack('Error occurred during sync!', false);
  } finally {
    isFromScreen && callLoaderCallBack(false);
    isFromScreen && redirectionCallBack('', true);
    //navigation.navigate(ScreenName.DASHBOARD);
  }
};

const appendToLog = async (logData: string) => {
  // Web replacement for RNFS.appendFile - using localStorage
  const logKey = 'debug_log';
  try {
    const existingLog = localStorage.getItem(logKey) || '';
    const newLogEntry = `${new Date().toISOString()} - ${logData}\n`;
    localStorage.setItem(logKey, existingLog + newLogEntry);
    console.log('Log written to localStorage');
  } catch (error) {
    console.error('Failed to write log:', error);
  }
};

