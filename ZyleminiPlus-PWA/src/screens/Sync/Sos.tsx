import React, {useState} from 'react';
import {
  Dialog,
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {Close as CloseIcon, ChevronRight as ChevronRightIcon} from '@mui/icons-material';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import {useLoginAction} from '../../redux/actionHooks/useLoginAction';
import {
  getAssetDetailData,
  getCategoryDiscountItemSyncData,
  getCollectionsDetailSyncData,
  getCollectionsSyncData,
  getDiscountSyncData,
  getNewPartyImageDetailsyncData,
  getNewPartyOutletSyncData,
  getOrderDetailsSyncData,
  getOrderMasterSyncData,
  getPaymentReceiptSyncData,
  getUsesLogSyncData,
  getnewPartyTargetId,
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
} from '../../database/SqlDatabase';
import {ScreenName} from '../../constants/screenConstants';
import {dataReportObjectKeys, writeErrorLog} from '../../utility/utils';
import Loader from '../../components/Loader/Loader';
import {useNetInfo} from '../../hooks/useNetInfo';
import {clearUnwantedImageNewParty} from '../Shops/shopsUtils';
import {doSosSyncBackGroundForeGround} from '../../usecase/reportErrorSyncUsecase';
import {doSosSyncBackGroundForeGroundFullDatabase} from '../../usecase/reportFullDbErrorSyncUsecase';
import {useGlobleAction} from '../../redux/actionHooks/useGlobalAction';

interface SosListProps {
  navigation?: any;
  route: {
    params?: any;
  };
}

export const Sos = (Props: SosListProps) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {navigation} = Props;
  const {userId, savedClientCode} = useLoginAction();
  const [modalVisible, setModalVisible] = useState(true);
  const [isLoading, setisLoading] = useState(false);
  const {isNetConnected} = useNetInfo();
  const {externalShare} = useGlobleAction();

  const shareFile = async (filePath: string, fileName: string) => {
    try {
      console.log('Attempting to share file:', filePath);
      
      // For PWA, we'll download the file instead of using native share
      try {
        // Get the data from localStorage or IndexedDB
        const fileData = localStorage.getItem(filePath);
        if (!fileData) {
          window.alert('File not found');
          return;
        }

        // Create a blob and download
        const blob = new Blob([fileData], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('File downloaded successfully');
        return;
      } catch (downloadError) {
        console.log('Download failed:', downloadError);
      }

      // Fallback: Try Web Share API if available
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Share Database File',
            text: `Database export: ${fileName}`,
          });
          console.log('File shared successfully via Web Share API');
          return;
        } catch (shareError) {
          console.log('Web Share API failed:', shareError);
        }
      }

      // Final fallback: Show file location message
      if (window.confirm(
        `File saved successfully!\n\nLocation: ${filePath}\n\nYou can find this file in your downloads.\n\nClick OK to copy path.`
      )) {
        // Copy to clipboard
        navigator.clipboard.writeText(filePath);
        window.alert('File path copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing file:', error);
      window.alert(
        `Could not share the file, but it has been saved to:\n\n${filePath}`
      );
    }
  };

  async function getPartialSyncData() {
    let JSONObj: any = {};
    let newPartyImagedetails: any = [];

    try {
      console.log('Collecting partial sync data...');

      let OrderMaster: any = await getOrderMasterSyncData('N');
      if (OrderMaster.length > 0) JSONObj['OrderMaster'] = OrderMaster;

      let OrderDetails: any = await getOrderDetailsSyncData();
      if (OrderDetails.length > 0) JSONObj['OrderDetails'] = OrderDetails;

      let NewPartyOutlet: any = await getNewPartyOutletSyncData();
      if (NewPartyOutlet.length > 0) JSONObj['NewParty'] = NewPartyOutlet;

      await clearUnwantedImageNewParty();

      let newPartyImageData: any = await getNewPartyImageDetailsyncData();
      if (newPartyImageData.length > 0) {
        await Promise.all(
          newPartyImageData.map(async (item: any) => {
            // For PWA, read from localStorage or IndexedDB
            let imageBase64 = localStorage.getItem(item.ImagePath) || '';
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

      return JSONObj;
    } catch (error) {
      console.error('Error collecting partial sync data:', error);
      writeErrorLog('getPartialSyncData', error);
      throw error;
    }
  }

  async function sendFullDatabase() {
    setisLoading(true);
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

      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`❌ Error fetching data at index ${index}:`, result.reason);
          writeErrorLog('sendFullDatabase', result.reason);
        }
      });

      const processResult = (result: PromiseSettledResult<any>, key: string) => {
        if (result.status === 'fulfilled' && result.value?.length > 0) {
          JSONObj[(dataReportObjectKeys as any)[key]] = result.value;
          console.log(`✅ ${key} added to JSONObj`);
        }
      };

      const keyMap = [
        'NewPartyImageOutlet', 'NewParty', 'PaymentReceiptLog', 'PaymentReceipt',
        'CollectionsLog', 'CollectionsDetailsLog', 'CollectionsDetails', 'Collections',
        'DiscountTemp', 'OrderMasterTemp', 'OrderDetailsTemp', 'ImageDetails',
        'CategoryDiscountItem', 'Discount', 'Settings', 'ReportControlMaster',
        'Report', 'Customer', 'Distributor', 'PItem', 'OutstandingDetails',
        'MeetReport', 'MJPMaster', 'ChequeReturnDetails', 'OrderDetails',
        'OrderMaster', 'AreaParentList', 'AssetPlacementVerification',
        'AssetTypeClassificationList', 'CollectionTypes', 'DiscountMaster',
        'Discounts', 'DistributorContacts', 'DistributorDataStatus',
        'ImagesDetails', 'LiveLocationLogs', 'MJPMasterDetails',
        'MultiEntityUser', 'OnlineParentArea', 'OutletAssetInformation',
        'PJPMaster', 'PendingOrdersDetails', 'PendingOrdersDiscount',
        'PendingOrdersMaster', 'PriceListClassification', 'Receipt',
        'Resources', 'SIPREPORT', 'Sales', 'SalesYTD', 'SchemeDetails',
        'SchemeMaster', 'SubGroupMaster', 'SurveyMaster', 'Target',
        'TempOutstandingDetails', 'VW_PendingOrders', 'table_user',
        'uommaster', 'user', 'uses_log',
      ];

      for (let i = 0; i < keyMap.length; i++) {
        if (keyMap[i] === 'ImageDetails' && results[i].status === 'fulfilled') {
          const imageResults = await Promise.all(
            (results[i] as PromiseFulfilledResult<any>).value.map(async (item: any) => ({
              ID: item.ID,
              OrderID: item.OrderID,
              ImageDatetime: item.ImageDateTime,
              ImageName: item.ImageName,
              ImageBytes: localStorage.getItem(item.ImageBytes) || '',
            })),
          );
          JSONObj[dataReportObjectKeys.ImageDetails] = imageResults;
          console.log('✅ ImageDetails processed and added');
        } else {
          processResult(results[i], keyMap[i]);
        }
      }

      return JSONObj;
    } catch (error) {
      console.error('❌ Error in sendFullDatabase:', error);
      writeErrorLog('sendFullDatabase', error);
      throw error;
    } finally {
      setisLoading(false);
    }
  }

  async function writePartialDataToFile() {
    try {
      setisLoading(true);
      console.log('Starting writePartialDataToFile...');

      const partialData = await getPartialSyncData();
      console.log('Partial data keys:', Object.keys(partialData).length);

      if (Object.keys(partialData).length === 0) {
        window.alert(t('No Activity is found to send data!'));
        setisLoading(false);
        navigate('/dashboard');
        return;
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `PartialSyncData_${timestamp}.json`;
      const filePath = `downloads/${fileName}`;

      // Save to localStorage for web
      const jsonString = JSON.stringify(partialData, null, 2);
      localStorage.setItem(filePath, jsonString);
      
      console.log('Partial data successfully written to file:', filePath);
      setisLoading(false);

      if (window.confirm(
        `File Created Successfully\n\nPartial sync data file created: ${fileName}\n\nClick OK to download`
      )) {
        shareFile(filePath, fileName);
      }
    } catch (error) {
      setisLoading(false);
      console.error('Error in writePartialDataToFile:', error);
      window.alert('Failed to create partial sync data file: ' + error);
      navigate('/dashboard');
    }
  }

  async function writeFullDataToFile() {
    try {
      setisLoading(true);
      console.log('Starting writeFullDataToFile...');

      const fullData = await sendFullDatabase();
      console.log('Full data keys:', Object.keys(fullData).length);

      if (Object.keys(fullData).length === 0) {
        window.alert(t('No Activity is found to send data!'));
        setisLoading(false);
        navigate('/dashboard');
        return;
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `FullDatabaseData_${timestamp}.json`;
      const filePath = `downloads/${fileName}`;

      // Save to localStorage for web
      const jsonString = JSON.stringify(fullData, null, 2);
      localStorage.setItem(filePath, jsonString);
      
      console.log('Full data successfully written to file:', filePath);
      setisLoading(false);

      if (window.confirm(
        `File Created Successfully\n\nFull database data file created: ${fileName}\n\nClick OK to download`
      )) {
        shareFile(filePath, fileName);
      }
    } catch (error) {
      setisLoading(false);
      console.error('Error in writeFullDataToFile:', error);
      window.alert('Failed to create full database data file: ' + error);
      navigate('/dashboard');
    }
  }

  async function writeDataToFile() {
    await doSosSyncBackGroundForeGroundFullDatabase(
      true,
      userId,
      savedClientCode,
      isTrue => setisLoading(isTrue),
      (alertMsg: string, isRedirect: boolean) => {
        if (alertMsg.trim() != '') {
          window.alert(t(alertMsg));
        }
        isRedirect && navigate('/dashboard');
      },
    );
  }

  const doSosSync = async () => {
    await doSosSyncBackGroundForeGround(
      true,
      userId,
      savedClientCode,
      isTrue => setisLoading(isTrue),
      (alertMsg: string, isRedirect: boolean) => {
        if (alertMsg.trim() != '') {
          window.alert(t(alertMsg));
        }
        isRedirect && navigate('/dashboard');
      },
    );
  };

  const syncOptions = [
    {
      id: 1,
      title: 'Send Report Error',
      description: 'Sync partial error reports',
      icon: '⚠️',
      color: '#3B82F6',
      requiresInternet: true,
      onPress: doSosSync,
    },
    {
      id: 2,
      title: 'Send Full Database',
      description: 'Sync complete database',
      icon: '💾',
      color: '#10B981',
      requiresInternet: true,
      onPress: writeDataToFile,
    },
    ...(externalShare
      ? [
          {
            id: 3,
            title: 'Send Partial File',
            description: 'Export partial sync data',
            icon: '📄',
            color: '#F59E0B',
            requiresInternet: false,
            onPress: writePartialDataToFile,
          },
          {
            id: 4,
            title: 'Full Partial File',
            description: 'Export full database file',
            icon: '📦',
            color: '#06B6D4',
            requiresInternet: false,
            onPress: writeFullDataToFile,
          },
        ]
      : []),
  ];

  const handleOptionPress = (option: any) => {
    if (option.requiresInternet) {
      if (isNetConnected === true || isNetConnected == null) {
        setModalVisible(false);
        option.onPress();
      } else {
        window.alert('Internet is not available');
      }
    } else {
      setModalVisible(false);
      option.onPress();
    }
  };

  const renderModal = () => (
    <Dialog
      open={modalVisible}
      onClose={() => {
        setModalVisible(false);
        navigate('/dashboard');
      }}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: '#FFFFFF',
        },
      }}
    >
      <Box sx={{p: 3, position: 'relative'}}>
        <IconButton
          onClick={() => {
            setModalVisible(false);
            navigate('/dashboard');
          }}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 32,
            height: 32,
            bgcolor: '#F3F4F6',
            '&:hover': {bgcolor: '#E5E7EB'},
          }}
        >
          <CloseIcon sx={{fontSize: 20, color: '#6B7280'}} />
        </IconButton>

        <Box sx={{mb: 3, pr: 5}}>
          <Typography variant="h5" sx={{fontWeight: 700, color: '#1A1A1A', mb: 0.75}}>
            Data Sync Options
          </Typography>
          <Typography variant="body2" sx={{color: '#6B7280', lineHeight: 1.5}}>
            Choose how you want to sync your data
          </Typography>
        </Box>

        <Box
          sx={{
            maxHeight: '60vh',
            overflowY: 'auto',
            pr: 1,
            '&::-webkit-scrollbar': {width: '6px'},
            '&::-webkit-scrollbar-thumb': {
              bgcolor: '#D1D5DB',
              borderRadius: '3px',
            },
          }}
        >
          {syncOptions.map((option, index) => (
            <Box
              key={option.id}
              onClick={() => handleOptionPress(option)}
              sx={{
                bgcolor: '#FFFFFF',
                borderRadius: 2,
                p: 2,
                mb: index === syncOptions.length - 1 ? 0 : 1.5,
                display: 'flex',
                alignItems: 'center',
                border: '1.5px solid #E5E7EB',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: option.color,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                },
              }}
            >
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 1.75,
                  bgcolor: option.color + '15',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1.75,
                  flexShrink: 0,
                }}
              >
                <Typography sx={{fontSize: 26}}>{option.icon}</Typography>
              </Box>

              <Box sx={{flex: 1, minWidth: 0}}>
                <Typography
                  variant="subtitle1"
                  sx={{fontWeight: 600, color: '#1A1A1A', mb: 0.5}}
                >
                  {option.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{color: '#6B7280', lineHeight: 1.4, mb: 0.75}}
                >
                  {option.description}
                </Typography>
                {option.requiresInternet && (
                  <Box
                    sx={{
                      display: 'inline-block',
                      bgcolor: '#DBEAFE',
                      px: 1,
                      py: 0.375,
                      borderRadius: 0.75,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{color: '#1E40AF', fontWeight: 500, fontSize: '0.6875rem'}}
                    >
                      Requires Internet
                    </Typography>
                  </Box>
                )}
              </Box>

              <Box
                sx={{
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ml: 1,
                  flexShrink: 0,
                }}
              >
                <ChevronRightIcon sx={{fontSize: 32, color: '#9CA3AF', fontWeight: 300}} />
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Dialog>
  );

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: '#F5F7FA',
      }}
    >
      <Loader visible={isLoading} />
      {renderModal()}
    </Box>
  );
};

