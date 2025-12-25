import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Box, Typography, Button, TextField, Modal, CircularProgress } from '@mui/material';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';

import FooterCard3 from '../Components/Step3/FooterCard3';
import SubmissionButton3 from '../Components/Step3/SubmissionButton3';
import CustomSafeView from '../../../components/GlobalComponent/CustomSafeView';
import SignatureCapture, { SignatureCaptureRef } from '../../../components/SignatureCapture/SignatureCapture';
import { useLoginAction } from '../../../redux/actionHooks/useLoginAction';
import { useOrderAction } from '../../../redux/actionHooks/useOrderAction';
import { useDataCollectionAction } from '../../../redux/actionHooks/useDataCollectionAction';
import { useGlobleAction } from '../../../redux/actionHooks/useGlobalAction';
import { useNetInfo } from '../../../hooks/useNetInfo';
import { Colors } from '../../../theme/colors';
import {
  COLLECTION_TYPE,
  entityTypes,
  getAppOrderId,
  getCurrentDate,
  getCurrentDateTime,
  getCurrentDateWithTime,
  getMinDateFromPrevODate,
  isAccessControlProvided,
  writeActivityLog,
  writeErrorLog,
} from '../../../utility/utils';
import {
  SelectCustForDist,
  checkOrderInOrderDetailsMain1,
  checkOrderInTempOrderMasterMain,
  deleteTempOrderDetails,
  deleteTempOrderMater,
  discardDiscount,
  discardOrders,
  discardOrdersMaster,
  getInsertedTempOrder,
  getInsertedsTempOrder,
  getInsertedsTempdiscount,
  getLICnoofCust,
  getOrderDataFromTempOrderDetails,
  getOrderDataFromTempOrderMaster,
  getTotalamountOfOrder,
  insertOrderDetails,
  insertOrderMastersss,
  insertuses_log,
  selectOrdersDetail,
  updateDetailMain,
  updateMasterMain,
  updateTABLE_PITEM_ADDEDITBRAND,
  updateTABLE_PITEM_btleQty,
  getPartyWeeklyOff,
  getTableDiscount,
  insertImagesDetails,
  getInsertedTempOrderforGST,
} from '../../../database/WebDatabaseHelpers';
import Loader from '../../../components/Loader/Loader';
import Header from '../../../components/Header/Header';
import TopCardCNO2 from '../Components/TopCardCNO2';
import DashLine from '../../CollectionModule/Components/DashLine';
import { globalImg } from '../../../constants/AllImages';
import {
  discardPopUp,
  orderSavePopUp,
  weeklyOffOrderAlertHandler,
} from '../Functions/Validations';
import CustomCalender from '../../../components/Calender/CustomCalender';
import { OrderPreviewBrandList, OrderSubListData } from '../../../types/types';
import SearchSubListCNO2 from '../Components/SearchSubListCNO2';
import EditFullOrderPreview from '../Components/FullPartialDiscount/EditFullOrderPreview';
import EditPartialPreview from '../Components/FullPartialDiscount/EditPartialPreview';
import {
  AccessControlKeyConstants,
  ScreenName,
} from '../../../constants/screenConstants';
import { DoPDFShare } from '../Components/PDFShareFormat';
import { useSyncNow } from '../../../hooks/useSyncNow';

interface CNO3props {
  navigation?: any;
  route?: {
    params?: any;
  };
  loaderState?: any;
}

function CreateNewOrderStep3(props: CNO3props) {
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  
  const { loaderState } = props;
  const { userId } = useLoginAction();
  const {
    entityType,
    selectedBeat,
    selectedDist,
    selectedOutlet,
    totalOrderValue,
    isDataCollection,
    startTime,
    orderDate,
    setOrderDate,
    expectedOrderDate,
    savedOrderID,
    setExpectedOrderDate,
    resetAllOrder,
    propsData,
  } = useOrderAction();
  const { dataCollectionType, fromDateDC, toDateDC, resetAllDataCollection } =
    useDataCollectionAction();
  const {
    setSyncFlag,
    syncFlag,
    isLogWritingEnabled,
    AllowBackdatedDispatchDays,
    getAccessControlSettings,
    isSyncImmediate,
    isNavigationSourceShops,
    setIsNavigationSourceShopsAction,
    isWhatsAppOrderPostDocument,
    OrderConfirmationSignature,
  } = useGlobleAction();
  const { t } = useTranslation();

  const [signaturePath, setSignaturePath] = useState<string>('');
  const [signatureBase64, setSignatureBase64] = useState<string>('');
  const [isSignatureCaptured, setIsSignatureCaptured] = useState<boolean>(false);
  const [showSignatureView, setShowSignatureView] = useState<boolean>(false);
  const signatureRef = useRef<SignatureCaptureRef>(null);

  const [orderDateModal, setOrderDateModal] = useState<boolean>(false);
  const [ExpecODateModal, setExpecODateModal] = useState<boolean>(false);
  const [minDate, setMinDate] = useState<Date>(new Date());
  const [minExpectedDate, setExpectedMinDate] = useState<Date>(new Date());
  const [brandList, setBrandList] = useState<OrderPreviewBrandList[]>([]);
  const [totalDiscount, setTotalDiscount] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  const [remark, setRemark] = useState<string>('');
  const [submitFromDate, setSubmitFromDate] = useState<string>('');
  const [defaultDistId, setDefaultDistId] = useState<string>('');
  const [OutletDetails, setOutletDetails] = useState<any[]>([]);
  const [subListData, setSublistData] = useState<OrderSubListData[]>([]);

  const [onChangeInCollapse, setOnChangeCollapse] = useState<any[]>([]);

  const [isLoading, setisLoading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [partyWeeklyOff, setPartyWeeklyOff] = useState<string>('');
  const [selectedPartialDis, setSelectedPartialDis] = useState<any[]>([]);
  const [selectedFullDis, setSelectedFullDis] = useState<any[]>([]);
  const [selectedScheme, setselectedScheme] = useState<any[]>([]);
  const [selectedItemDisc2, setselectedItemDisc2] = useState<any[]>([]);
  const { isNetConnected } = useNetInfo();
  const { doSync } = useSyncNow();

  const [gstRate, setgstRate] = useState(0);
  const [gstAmount, setTotalGST] = useState(0);
  const [grossAmount, setgrossAmount] = useState(0);

  const [orderPriority, setOrderPriority] = useState<string>('0');
  const [showPriorityDropdown, setShowPriorityDropdown] = useState<boolean>(false);

  const isFilterOneAccessGranted: boolean = isAccessControlProvided(
    getAccessControlSettings,
    AccessControlKeyConstants.ORDER_FILTER_ONE,
  );

  const isFilterTwoAccessGranted: boolean = isAccessControlProvided(
    getAccessControlSettings,
    AccessControlKeyConstants.ORDER_FILTER_TWO,
  );

  const generateSignatureFileName = async (): Promise<string> => {
    const datetime = await getCurrentDateWithTime();
    return `${userId}-${datetime}.png`;
  };

  const handleSignature = async (signature: string): Promise<void> => {
    try {
      setSignatureBase64(signature);
      setSignaturePath(await generateSignatureFileName());
      setIsSignatureCaptured(true);
      setShowSignatureView(false);
    } catch (error) {
      alert('Failed to save signature. Please try again.');
      console.error('Error in handleSignature:', error);
    }
  };

  const handleClear = async (): Promise<void> => {
    setSignaturePath('');
    setSignatureBase64('');
    setIsSignatureCaptured(false);
  };

  const clearSignature = (): void => {
    handleClear();
    setIsSignatureCaptured(false);
    setSignatureBase64('');
    signatureRef.current?.clear();
  };

  const openSignatureCanvas = (): void => {
    setShowSignatureView(true);
  };

  const handleSignatureSave = (dataURL: string) => {
    setSignatureBase64(dataURL);
    setIsSignatureCaptured(true);
    setShowSignatureView(false);
  };

  useEffect(() => {
    takeDataFromDB();
    getWeeklyOff();
  }, [totalOrderValue]);

  const getWeeklyOff = async (): Promise<void> => {
    try {
      const partyWeeklyOffData = await getPartyWeeklyOff(
        selectedOutlet?.OId,
        userId,
      );
      setPartyWeeklyOff(partyWeeklyOffData[0]?.WeeklyOff);
    } catch (error) {
      console.log('getWeeklyOff error -->', error);
      writeErrorLog('getWeeklyOff', error);
    }
  };

  const getAllTableDiscount = async (): Promise<void> => {
    getTableDiscount(savedOrderID).then((data: any) => {
      let filteredPartial = data.filter((disc: any) => disc.BrandCode != '');
      setSelectedPartialDis(filteredPartial);

      let filteredFull = data.filter(
        (disc: any) =>
          disc.BrandCode == '' && disc.flag == 'D' && disc.OrderedItemID == '',
      );
      setSelectedFullDis(filteredFull);

      let filteredselectedScheme = data.filter((disc: any) => disc.flag == 'S');
      setselectedScheme(filteredselectedScheme);

      let filteredselectedItemDis2 = data.filter(
        (disc: any) => disc.flag == 'D' && disc.OrderedItemID != '',
      );
      setselectedItemDisc2(filteredselectedItemDis2);
    });
  };

  const takeDataFromDB = async (): Promise<void> => {
    setisLoading(true);
    setExpectedMinDate(
      await getMinDateFromPrevODate(AllowBackdatedDispatchDays),
    );

    getInsertedTempOrder(savedOrderID).then((getdata: any) => {
      let amountss = 0;
      for (let i = 0; i < getdata.length; i++) {
        amountss += parseInt(getdata[i].Amount);
        setTotalDiscount(amountss);
      }
    });

    getInsertedTempOrderforGST(savedOrderID).then((getdata: any) => {
      let gstRate = 0;
      let gstTotal = 0;
      let grossAmount = 0;

      for (let i = 0; i < getdata.length; i++) {
        const itemGSTTotal = parseFloat(getdata[i].GSTTotal) || 0;
        gstTotal += itemGSTTotal;

        const itemGrossAmount = parseFloat(getdata[i].GrossAmount) || 0;
        grossAmount += itemGrossAmount;

        if (i === 0) {
          gstRate = parseFloat(getdata[i].GSTRate) || 0;
        }
      }

      setgstRate(gstRate);
      setTotalGST(gstTotal);
      setgrossAmount(grossAmount);
    });

    getInsertedTempOrder(savedOrderID).then((getdata: any) => {
      setSublistData(getdata);
    });

    getInsertedsTempdiscount(savedOrderID).then((getdata: any) => {
      let amountss = 0;
      for (let i = 0; i < getdata.length; i++) {
        amountss += parseInt(getdata[i].DiscountAmount);
        setDiscountAmount(amountss);
      }
    });

    getLICnoofCust(selectedOutlet?.OId).then((getdata: any) => {
      setOutletDetails(getdata);
    });

    if (selectedDist?.DistributorID.length > 0) {
      setDefaultDistId(selectedDist?.DistributorID);
      setisLoading(false);
    } else {
      getOrderDataFromTempOrderMaster(savedOrderID, '0').then((data: any) => {
        SelectCustForDist(data[0]?.entity_id, userId).then(data3 => {
          if (data3.length > 0) {
            setDefaultDistId(data3[0]?.DefaultDistributorId);
            setisLoading(false);
          }
        });
      });
    }
  };

  const AddDiscountAlert = (): void => {
    const result = window.confirm(
      `${t('Alerts.AlertCreatNewOrderApplyDiscountTitle')}\n${t('Alerts.AlertCreatNewOrderApplyDiscountMsg')}`
    );
    if (result) {
      navigate(`/${ScreenName.PARTIAL_DISCOUNT}`);
    }
  };

  const showSignatureRequiredAlert = (): void => {
    const result = window.confirm(
      `${t('Orders.SignatureRequired')}\n${t('Orders.SignatureRequiredMessage')}`
    );
    if (result) {
      openSignatureCanvas();
    }
  };

  async function saveClickHandler(): Promise<void> {
    var Ddate = expectedOrderDate?.toString();
    let EDdate = moment(Ddate, 'DD-MMM-YYYY').format('dddd');
    let Wdate = EDdate?.toUpperCase();
    var weekDayName = partyWeeklyOff || 'NA';
    let WeekDay = weekDayName.toUpperCase();
    if (Wdate == WeekDay) {
      weeklyOffOrderAlertHandler(onPress => {
        onPress && saveOrderDetail();
      });
    } else {
      saveOrderDetail();
    }
  }

  async function saveOrderDetail(): Promise<void> {
    let datetime = await getCurrentDateTime();
    insertuses_log('Order Placed', datetime, 'False');
    let filename = await generateSignatureFileName();
    
    if (isSignatureCaptured && signaturePath) {
      const app_order_id = await getAppOrderId(userId);
      insertImagesDetails(app_order_id, datetime, filename, signaturePath, 'N');
      
      getOrderDataFromTempOrderMaster(savedOrderID, '0').then((data: any) => {
        insertOrderMastersss(
          app_order_id,
          data[0].Current_date_time,
          data[0].entity_type,
          data[0].entity_id,
          data[0].latitude,
          data[0].longitude,
          '0',
          submitFromDate,
          submitFromDate,
          COLLECTION_TYPE.IMAGE,
          data[0].user_id,
          'Signature',
          '',
          'N',
          submitFromDate,
          defaultDistId,
          expectedOrderDate,
          '0',
          startTime,
          datetime,
          userId,
          orderPriority,
        );
      });
    }

    if (isSignatureCaptured && (signaturePath || signatureBase64)) {
      isLogWritingEnabled &&
        writeActivityLog(
          `Order with signature captured and saved to: ${signaturePath}`,
        );
    }

    getOrderDataFromTempOrderDetails(savedOrderID).then(data => {
      if (data.length > 0) {
        data.map((item: any, i: number) => {
          checkOrderInOrderDetailsMain1(item.item_id, savedOrderID).then(
            (item_data: any) => {
              if (item_data.length == 0) {
                isLogWritingEnabled &&
                  writeActivityLog(
                    `Order Taken, Item: BrandId: ${item.BrandId}, Item_id: ${item.item_id}, EntityId: ${item.entityId}, C: ${item.quantity_one}, B: ${item.quantity_two}, FC: ${item.large_Unit}, FB: ${item.small_Unit}, Rate: ${item.rate} `,
                  );
                insertOrderDetails(
                  item.order_id,
                  item.item_id,
                  item.item_Name,
                  item.quantity_one,
                  item.quantity_two,
                  item.small_Unit,
                  item.large_Unit,
                  item.rate,
                  item.Amount,
                  '1',
                  'N',
                  item.bottleQty,
                  item.BrandId,
                  item.entityId,
                  item.CollectionType,
                  userId,
                  item.GSTRate || '0',
                  item.GSTTotal || '0',
                  item.GrossAmount || '0',
                );
              } else {
                updateDetailMain(
                  item.quantity_one,
                  item.quantity_two,
                  item.small_Unit,
                  item.large_Unit,
                  item.rate,
                  item.Amount,
                  item.order_id,
                  item.item_id,
                );
              }
            },
          );
        });

        setTimeout(() => {
          insertIntoOrderMaster();
        }, 300);
      }
    });
  }

  async function insertIntoOrderMaster(): Promise<void> {
    let Asyncdtorageselecteddist = '13';
    let ActivityEnd = await getCurrentDateTime();
    let datess = moment(new Date()).format('YYYY-MM-DD');

    getTotalamountOfOrder(savedOrderID).then((data1: any) => {
      getOrderDataFromTempOrderMaster(savedOrderID, '0').then((data: any) => {
        if (data[0]?.entity_id) {
          SelectCustForDist(data[0]?.entity_id, userId).then(data3 => {});
        }
        
        for (let i = 0; i < data.length; i++) {
          try {
            checkOrderInTempOrderMasterMain(data[i].id, '0').then(
              (item_data: any) => {
                if (item_data.length === 0) {
                  if (entityType?.value == entityTypes[0].value) {
                    insertOrderMastersss(
                      data[0].id,
                      data[0].Current_date_time,
                      data[0].entity_type,
                      data[0].entity_id,
                      data[0].latitude,
                      data[0].longitude,
                      data1[0].TotalAmount.toFixed(3),
                      submitFromDate,
                      submitFromDate,
                      COLLECTION_TYPE.ORDER,
                      data[0].user_id,
                      remark,
                      '1',
                      'N',
                      datess,
                      defaultDistId,
                      expectedOrderDate,
                      '0',
                      startTime,
                      ActivityEnd,
                      userId,
                      orderPriority,
                    );
                  } else {
                    insertOrderMastersss(
                      data[0].id,
                      data[0].Current_date_time,
                      data[0].entity_type,
                      defaultDistId,
                      data[0].latitude,
                      data[0].longitude,
                      data1[0].TotalAmount.toFixed(3),
                      submitFromDate,
                      submitFromDate,
                      COLLECTION_TYPE.ORDER,
                      data[0].user_id,
                      remark,
                      '1',
                      'N',
                      datess,
                      defaultDistId,
                      expectedOrderDate,
                      '0',
                      startTime,
                      ActivityEnd,
                      userId,
                      orderPriority,
                    );
                  }
                } else {
                  updateMasterMain(
                    data[0].Current_date_time,
                    data[0].entity_type,
                    data[0].entity_id,
                    data[0].latitude,
                    data[0].longitude,
                    data1[0].TotalAmount.toFixed(3),
                    submitFromDate,
                    submitFromDate,
                    data[0].id,
                    COLLECTION_TYPE.ORDER,
                    expectedOrderDate,
                    datess,
                    ActivityEnd,
                  );
                }
              },
            );
          } catch (error) {
            writeErrorLog('insertIntoOrderMaster', error);
          }

          try {
            deleteTempOrderDetails(data[0]?.entity_id, '0').then(data => {});
            deleteTempOrderMater(data[0]?.entity_id, '0');
          } catch (error) {
            writeErrorLog('deleteTempOrderDetails', error);
          }
        }
      });
    });
    
    isWhatsAppOrderPostDocument && (await generateAndShare(false));
    setSyncFlag(!syncFlag);
    resetAllOrder();
    resetAllDataCollection();
    
    alert(t('Alerts.AlertCreatNewOrderSavedSuccessfullyTitle'));
    
    if (isLogWritingEnabled) {
      writeActivityLog(`Order Placed`);
      writeActivityLog(`End OF Order`);
    }

    HandleNavigationForOrder();
  }

  async function discardClickHandler(): Promise<void> {
    selectOrdersDetail(savedOrderID).then((data: any) => {
      for (let i = 0; i < data.length; i++) {
        updateTABLE_PITEM_ADDEDITBRAND(data[i].item_id, false, false);
        updateTABLE_PITEM_btleQty(data[i].item_id, '');
        discardOrders(savedOrderID);
        discardOrdersMaster(savedOrderID);
        discardDiscount(savedOrderID);
      }
    });

    handleClear();
    setSyncFlag(!syncFlag);
    resetAllOrder();
    resetAllDataCollection();
    
    navigate(-1);
  }

  async function HandleNavigationForOrder(): Promise<void> {
    if (
      isSyncImmediate === true &&
      (isNetConnected || isNetConnected === null) &&
      propsData == undefined
    ) {
      await doSync({
        loaderState: (val: boolean) => {
          setisLoading?.(val);
        },
      });
    }
    
    navigate(-1);
  }

  const generateAndShare = async (isShareEnabled: boolean): Promise<void> => {
    isLogWritingEnabled && writeActivityLog(`PDF Shared`);

    let quantity_one = 0;
    let quantity_two = 0;
    let large_Unit = 0;
    let small_Unit = 0;
    let Amount = 0;
    
    for (let i = 0; i < subListData.length; i++) {
      quantity_one += parseFloat(subListData[i].quantity_one);
      quantity_two += parseFloat(subListData[i].quantity_two);
      large_Unit += parseFloat(subListData[i].large_Unit);
      small_Unit += parseFloat(subListData[i].small_Unit);
      Amount += parseFloat(subListData[i].Amount);
    }

    isShareEnabled && setIsGenerating(true);
    
    const invoiceRows = subListData.map((invoice: any) => {
      const cleanItemSequence = invoice.ITEMSEQUENCE.replace(/\{.*?\}/g, '').trim();
      const itemGST = parseFloat(invoice.GSTTotal) || 0;
      const itemAmount = parseFloat(invoice.Amount) || 0;
      const itemGrossAmount = itemAmount + itemGST;

      return `
        <tr>
          <td>${cleanItemSequence}</td>
          <td>C:${invoice.quantity_one} B:${invoice.quantity_two}</td>
          <td>${invoice.rate}</td>
          <td>${(parseFloat(invoice.GSTRate) || 0).toFixed(2)}%</td>
          <td>${itemGST.toFixed(2)}</td>
          <td>${itemAmount.toFixed(2)}</td>
        </tr>
      `;
    });
    
    DoPDFShare({
      DistributorName: selectedDist?.Distributor,
      PartyName: selectedOutlet?.OName,
      PartyArea: OutletDetails[0]?.AREA,
      PartyLicenceNo: OutletDetails[0]?.LicenceNo,
      current_date_time: orderDate,
      orderID: savedOrderID,
      invoiceRows: invoiceRows.join(''),
      partialorderdis: [],
      Schemeorderdis: [],
      fullorderdis: [],
      itemDisc2: [],
      quantity_one,
      quantity_two,
      Amount,
      remark,
      discountAmount,
      selectedPartialDis,
      selectedFullDis,
      isShareEnabled: isShareEnabled,
      large_Unit,
      small_Unit,
      gstAmount,
      gstRate,
      grossAmount,
    });
    
    isShareEnabled && setIsGenerating(false);
  };

  const saveClickHandlerDataCollection = async (): Promise<void> => {
    let datetime = await getCurrentDateTime();
    isLogWritingEnabled && writeActivityLog('submit DC');

    let ActivityEnd = await getCurrentDateTime();
    let datess = moment(new Date()).format('YYYY-MM-DD');

    getOrderDataFromTempOrderDetails(savedOrderID).then(data => {
      for (let k = 0; k < data.length; k++) {
        checkOrderInOrderDetailsMain1(data[k].item_id, savedOrderID).then(
          (item_data: any) => {
            if (item_data.length == 0) {
              isLogWritingEnabled &&
                writeActivityLog(
                  `Data Collection, Item: BrandId: ${data[k].BrandId}, Item_id: ${data[k].item_id}`,
                );
              insertOrderDetails(
                data[k].order_id,
                data[k].item_id,
                data[k].item_Name,
                data[k].quantity_one,
                data[k].quantity_two,
                data[k].small_Unit,
                data[k].large_Unit,
                data[k].rate,
                data[k].Amount,
                '1',
                'N',
                data[k].bottleQty,
                data[k].BrandId,
                data[k].entityId,
                data[k].CollectionType,
                userId,
                '0',
                '0',
                '0',
              );
            } else {
              updateDetailMain(
                data[k].quantity_one,
                data[k].quantity_two,
                data[k].small_Unit,
                data[k].large_Unit,
                data[k].rate,
                data[k].Amount,
                data[k].order_id,
                data[k].item_id,
              );
            }
          },
        );
      }
    });

    getOrderDataFromTempOrderMaster(savedOrderID, dataCollectionType).then(
      (data: any) => {
        for (let i = 0; i < data.length; i++) {
          checkOrderInTempOrderMasterMain(data[i].id, dataCollectionType).then(
            async (item_data: any) => {
              if (item_data.length === 0) {
                insertOrderMastersss(
                  data[0].id,
                  data[0].Current_date_time,
                  data[0].entity_type,
                  data[0].entity_id,
                  data[0].latitude,
                  data[0].longitude,
                  COLLECTION_TYPE.ORDER,
                  fromDateDC,
                  toDateDC,
                  dataCollectionType,
                  data[0].user_id,
                  remark,
                  '1',
                  'N',
                  data[0].Current_date_time,
                  defaultDistId,
                  datess,
                  '0',
                  startTime,
                  ActivityEnd,
                  userId,
                  orderPriority,
                );
              } else {
                updateMasterMain(
                  data[0].Current_date_time,
                  data[0].entity_type,
                  data[0].entity_id,
                  data[0].latitude,
                  data[0].longitude,
                  '0',
                  fromDateDC,
                  toDateDC,
                  data[0].id,
                  dataCollectionType,
                  expectedOrderDate,
                  datess,
                  ActivityEnd,
                );
              }
            },
          );

          deleteTempOrderDetails(data[0].entity_id, dataCollectionType);
          deleteTempOrderMater(data[0].entity_id, dataCollectionType);
        }
      },
    );
    
    setSyncFlag(!syncFlag);
    resetAllOrder();
    resetAllDataCollection();

    alert(t('Alerts.AlertDataSavedSuccessfullyTitle'));
    
    if (
      isSyncImmediate === true &&
      (isNetConnected || isNetConnected === null) &&
      propsData == undefined
    ) {
      await doSync({
        loaderState: (val: boolean) => {
          setisLoading?.(val);
        },
      });
      setIsNavigationSourceShopsAction(false);
    }
    
    if (isLogWritingEnabled) {
      await writeActivityLog(`Data Collected`);
      await writeActivityLog(`End Of Data Collection`);
    }
    
    navigate(`/${ScreenName.DATACOLLECTIOSTEP1}`, { state: { propsData } });
  };

  const renderPriorityDropdown = (): React.ReactElement => {
    const priorities = [
      { label: 'High', value: '1' },
      { label: 'Medium', value: '2' },
      { label: 'Low', value: '3' },
    ];

    return (
      <Box sx={{ mx: 7.5, my: 1.875, backgroundColor: '#ffffff', borderRadius: 1, border: '1px solid #E0E0E0', p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mb: 1.875 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 'bold', color: '#333333' }}>
            {t('Orders.OrderPriority') || 'Order Priority'}
          </Typography>
        </Box>

        <Button
          onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            backgroundColor: '#F8F9FA',
            border: '1px solid #D0D0D0',
            borderRadius: 0.75,
            px: 2,
            py: 1.5,
            textTransform: 'none',
          }}
        >
          <Typography sx={{ fontSize: 16, color: '#333333', fontWeight: 600 }}>
            {priorities.find(p => p.value === orderPriority)?.label || 'Select Priority'}
          </Typography>
        </Button>

        {showPriorityDropdown && (
          <Box sx={{ mt: 1, backgroundColor: '#ffffff', borderRadius: 0.75, border: '1px solid #E0E0E0' }}>
            {priorities.map((priority, index) => (
              <Button
                key={priority.value}
                onClick={() => {
                  setOrderPriority(priority.value);
                  setShowPriorityDropdown(false);
                }}
                sx={{
                  width: '100%',
                  px: 2,
                  py: 1.5,
                  borderBottom: index === priorities.length - 1 ? 0 : '1px solid #E0E0E0',
                  backgroundColor: orderPriority === priority.value ? '#E8F4FD' : 'transparent',
                  textTransform: 'none',
                  justifyContent: 'flex-start',
                }}
              >
                <Typography
                  sx={{
                    fontSize: 16,
                    color: orderPriority === priority.value ? '#3955CB' : '#333333',
                    fontWeight: orderPriority === priority.value ? 'bold' : 'normal',
                  }}
                >
                  {priority.label}
          </Typography>
              </Button>
            ))}
          </Box>
        )}
      </Box>
    );
  };

  const renderSignatureSection = (): React.ReactElement | null => {
    if (!OrderConfirmationSignature) return null;

    return (
      <Box sx={{ mx: 7.5, my: 2.5, backgroundColor: '#ffffff', borderRadius: 1, border: '1px solid #E0E0E0', p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mb: 1.25 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 'bold', color: '#333333' }}>
            {t('Orders.CustomerSignature') || 'Order Confirmation'}
          </Typography>
          {isSignatureCaptured && (
            <Button
              onClick={clearSignature}
              sx={{ backgroundColor: '#FF6B6B', color: '#ffffff', px: 1.5, py: 0.625, borderRadius: 0.5 }}
            >
              Clear
            </Button>
          )}
        </Box>

        {!showSignatureView && !isSignatureCaptured && (
          <Button
            onClick={openSignatureCanvas}
            sx={{
              width: '100%',
              border: '2px dashed #2FC36E',
              borderRadius: 1,
              py: 3.75,
              backgroundColor: '#F8F9FA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography sx={{ fontSize: 16, color: '#2FC36E', fontWeight: 'bold' }}>
              {t('Orders.AddSignature') || 'Add Signature'}
            </Typography>
          </Button>
        )}

        {!showSignatureView && isSignatureCaptured && signatureBase64 && (
          <Box sx={{ textAlign: 'center' }}>
            <img
              src={signatureBase64}
              alt="Signature"
              style={{ width: '100%', height: 150, border: '1px solid #E0E0E0', borderRadius: 8, backgroundColor: '#ffffff' }}
            />
            <Button
              onClick={openSignatureCanvas}
              sx={{ mt: 1.25, backgroundColor: '#3955CB', color: '#ffffff', px: 2, py: 1.25, borderRadius: 0.75 }}
            >
              {t('Orders.EditSignature') || 'Edit Signature'}
            </Button>
          </Box>
        )}

        <Modal open={showSignatureView} onClose={() => setShowSignatureView(false)}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              maxWidth: 600,
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography variant="h6" component="h2" sx={{ mb: 3, textAlign: 'center' }}>
              {t('Orders.CustomerSignature') || 'Customer Signature'}
            </Typography>
            <SignatureCapture
              ref={signatureRef}
              onSave={handleSignatureSave}
              onClear={() => {}}
              width={500}
              height={250}
            />
          </Box>
        </Modal>
      </Box>
    );
  };

  return (
    <>
      <Loader visible={isLoading} />
      <Header
        title={
          isDataCollection
            ? t('DataCollection.DataCollectionStep3ActionBarText')
            : t('Orders.Step3ActionBarText')
        }
        navigation={{ goBack: () => navigate(-1) }}
      />
      <Box sx={{ flex: 1 }}>
        <CustomSafeView>
          <TopCardCNO2
            clearPress={() => {}}
            onCalendarPress={() => setOrderDateModal(true)}
            outletName={selectedOutlet?.OName}
            storeId={selectedOutlet?.OId}
            distributorName={selectedDist?.Distributor}
            distID={selectedDist?.DistributorID}
            startdate={orderDate}
            totalOrders={totalDiscount}
            totalDiscount={discountAmount}
            gstAmount={gstAmount}
            GrossAmount={grossAmount}
            gstRate={gstRate}
            entityType={entityType?.value}
            isPreview={true}
            isDataCollection={isDataCollection}
            generateAndShare={() => generateAndShare(true)}
            isAnyFilterAccessGranted={
              isFilterOneAccessGranted || isFilterTwoAccessGranted
            }
          />

          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            <Box sx={{ flex: 0.5 }}>
              <Typography sx={{ color: '#796A6A', fontWeight: 'bold', mt: 1.25, ml: 7.5, fontSize: 10 }}>
                {t('Orders.OrderPreview')}
              </Typography>
            </Box>
            <Box sx={{ flex: 0.5, display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <Typography sx={{ color: '#796A6A', fontSize: 10, fontWeight: 'bold', mt: 1.25, mr: isDataCollection ? 0 : 11.25 }}>
                {isDataCollection ? t('Orders.CollectedProductData') : t('Orders.AmountInINR')}
              </Typography>
              {isDataCollection && (
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 16,
                    backgroundColor: '#3955CB',
                    border: '3px solid #3955CB',
                    ml: 1.25,
                    mb: -0.5,
                  }}
                >
                  <Typography sx={{ color: '#ffffff', fontSize: 13 }}>
                    {totalOrderValue}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          <SearchSubListCNO2
            isPreview={true}
            OID={selectedOutlet?.OId}
            uid={userId}
            dId={selectedDist?.DistributorID}
            onChangeInOrder={() => {}}
            sumbitFromDate={(date: string) => {
              setSubmitFromDate(date);
            }}
            isDataCollection={isDataCollection}
            onChangeCollpase={(val: any) => setOnChangeCollapse(val)}
            isItemOrerTaken={() => {}}
          />

          {!isDataCollection &&
            isAccessControlProvided(
              getAccessControlSettings,
              AccessControlKeyConstants.ORDER_ADD_ORDER_DISC,
            ) && (
              <>
                <Button
                  onClick={() => AddDiscountAlert()}
                  sx={{ mt: 1.25, display: 'flex', justifyContent: 'flex-end', mr: 4.375 }}
                >
                  <Typography sx={{ color: '#2FC36E', fontWeight: 'bold', fontSize: 12 }}>
                    {t('Orders.AddDiscount')}
                  </Typography>
                </Button>

                <Box>
                  <Typography sx={{ color: '#796A6A', fontWeight: 'bold', mt: 1.25, ml: 7.5, fontSize: 10 }}>
                    {t('Orders.FullOrderDiscountPreview')}
                  </Typography>
                  <EditFullOrderPreview
                    orderID1={savedOrderID}
                    fromCreateNOrder={true}
                    navigation={{ goBack: () => navigate(-1) }}
                    SideFlag={onChangeInCollapse}
                    onChangeInItem={totalOrderValue}
                  />
                </Box>

                <Box>
                  <Typography sx={{ color: '#796A6A', fontWeight: 'bold', mt: 1.25, ml: 7.5, fontSize: 10 }}>
                    {t('Orders.PartialOrderDiscountPreview')}
                  </Typography>
                  <EditPartialPreview
                    orderID1={savedOrderID}
                    fromCreateNOrder={true}
                    navigation={{ goBack: () => navigate(-1) }}
                    SideFlag={onChangeInCollapse}
                    onChangeInItem={totalOrderValue}
                  />
                </Box>

                {renderSignatureSection()}

                <Box sx={{ mt: 1.25, mx: 2.5 }}>
                  <DashLine />
                </Box>
              </>
            )}

          {!isDataCollection && renderPriorityDropdown()}

          <FooterCard3
            navigation={{ goBack: () => navigate(-1) }}
            onCalenderPress={() => setExpecODateModal(true)}
            expectedDate={expectedOrderDate}
            remark={remark}
            onChangeRemark={(rmks: string) => {
              setRemark(rmks);
            }}
          />
        </CustomSafeView>

        <SubmissionButton3
          isSavePressed={(val: boolean) => {
            if (val) {
              if (
                OrderConfirmationSignature &&
                !isSignatureCaptured &&
                !isDataCollection
              ) {
                showSignatureRequiredAlert();
                return;
              }
              orderSavePopUp(t, isDataCollection, (action: boolean) => {
                if (action) {
                  isDataCollection
                    ? saveClickHandlerDataCollection()
                    : saveClickHandler();
                }
              });
            } else {
              discardPopUp(t, (action: boolean) => {
                action && discardClickHandler();
              });
            }
          }}
        />
      </Box>

      <CustomCalender
        isModalOpen={orderDateModal}
        minDate={minDate}
        maxDate={new Date()}
        onDateChange={(date: string) => {
          setOrderDate(date);
        }}
        onPress={() => {
          setOrderDateModal(!orderDateModal);
        }}
      />

      <CustomCalender
        isModalOpen={ExpecODateModal}
        minDate={minExpectedDate}
        maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
        onDateChange={(date: string) => {
          setExpectedOrderDate(date);
        }}
        onPress={() => {
          setExpecODateModal(!ExpecODateModal);
        }}
      />
    </>
  );
}

export default CreateNewOrderStep3;
