import { useEffect, useState, useCallback } from 'react';
import { Box, Typography, TextField, Button, CircularProgress } from '@mui/material';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';

import {
  GetSecondClassification,
  GetfirstClassification,
  checkedOrderIdInDb,
  discardDiscount,
  discardOrders,
  discardOrdersMaster,
  getBrandSearchDataForChangeBrandColor,
  getBrandSearchDataforskuforboth,
  getBrandSearchDataforskuforfirst,
  getDataForQR,
  getInsertedsTempOrder,
  getPrevOrdersDayNo,
  getSearchProdect,
  getitemfilterList,
  selectOrdersDetail,
  updateTABLE_PITEM_ADDEDITBRAND,
  updateTABLE_PITEM_btleQty,
  updatefirstfilterwhileselectionsecond,
  updatesecondfilterwhileselectionone,
} from '../../../database/WebDatabaseHelpers';
import CustomSafeView from '../../../components/GlobalComponent/CustomSafeView';

import { useLoginAction } from '../../../redux/actionHooks/useLoginAction';
import { useOrderAction } from '../../../redux/actionHooks/useOrderAction';
import { useDataCollectionAction } from '../../../redux/actionHooks/useDataCollectionAction';

import CustomCalender from '../../../components/Calender/CustomCalender';
import AppTextInput from '../../../components/TextInput/TextInput';
import { Colors } from '../../../theme/colors';

import Header from '../../../components/Header/Header';
import SearchListCNO2 from '../Components/SearchListCNO2';
import TopCardCNO2 from '../Components/TopCardCNO2';

import {
  AccessControlKeyConstants,
  ScreenName,
} from '../../../constants/screenConstants';
import { globalImg } from '../../../constants/AllImages';
import { handleBackBtn } from '../Functions/Validations';
import { BrandSearch, QRPItem, SettingTable } from '../../../types/types';
import {
  COLLECTION_TYPE,
  FilterNameValidation,
  getMinDateFromPrevODate,
  isAccessControlProvided,
  writeErrorLog,
} from '../../../utility/utils';
import Dropdown from '../../../components/Dropdown/Dropdown';
import { useGlobleAction } from '../../../redux/actionHooks/useGlobalAction';

interface CNO2props {
  navigation?: any;
  route?: {
    params?: any;
  };
}

function CreateNewOrderStep2(props: CNO2props) {
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const routeParams = routerLocation.state || props.route?.params || {};

  const { userId } = useLoginAction();
  const { dataCollectionType, resetAllDataCollection } =
    useDataCollectionAction();
  const {
    entityType,
    selectedBeat,
    selectedDist,
    selectedOutlet,
    totalOrderValue,
    isDataCollection,
    resetAllOrder,
    orderDate,
    savedOrderID,
    setOrderDate,
  } = useOrderAction();
  const { t } = useTranslation();
  const { getAccessControlSettings } = useGlobleAction();

  const [minDate, setMinDate] = useState(new Date());
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState<BrandSearch[]>([]);
  const [QRdata, setQRData] = useState({} as QRPItem);
  const [productSKUFilter, setProductSKUFilter] = useState('');

  const [ITEMFILTERListArray, setITEMFILTERListArray] = useState<any>([]);
  const [skuLabel1, setSKULabel1] = useState('');
  const [skuLabel2, setSKULabel2] = useState('');

  const [firstClassification, setFirstClassification] = useState<any[]>([]);
  const [firstClassName, setFirstClassName] = useState('');
  const [selectedFirstClass, setSelectedFirstClass] = useState('');

  const [secondClassification, setSecondClassification] = useState<any[]>([]);
  const [secondClassName, setSecondClassName] = useState('');
  const [selectedSecondClass, setSelectedSecondClass] = useState('');

  const [orderDateModal, setOrderDateModal] = useState(false);
  const [onChangeInCollapse, setOnChangeCollapse] = useState<any>([]);
  const [counterBrand, setCounterBrand] = useState(0);

  const onSearchChange = async (
    text: string,
    fromSpeech: boolean = false,
    SpeechSKU: string = '',
  ) => {
    setSearchText(text);
    setQRData({} as QRPItem);
    if (text.length > 2) {
      if (selectedFirstClass != '' && selectedSecondClass != '') {
        const doubleFilter = await getBrandSearchDataforskuforboth(
          firstClassName,
          secondClassName,
          selectedFirstClass,
          selectedSecondClass,
          text,
          fromSpeech ? SpeechSKU : productSKUFilter,
          fromSpeech ? SpeechSKU : productSKUFilter,
          selectedOutlet.OId,
          isDataCollection ? dataCollectionType : COLLECTION_TYPE.ORDER,
        );
        setData(doubleFilter);
      } else if (selectedFirstClass != '' || selectedSecondClass != '') {
        const singleFilter = await getBrandSearchDataforskuforfirst(
          selectedFirstClass != '' ? firstClassName : secondClassName,
          selectedFirstClass != '' ? selectedFirstClass : selectedSecondClass,
          text,
          text,
          fromSpeech ? SpeechSKU : productSKUFilter,
          fromSpeech ? SpeechSKU : productSKUFilter,
          selectedOutlet.OId,
          isDataCollection ? dataCollectionType : COLLECTION_TYPE.ORDER,
        );
        setData(singleFilter);
      } else {
        const takeData = await getBrandSearchDataForChangeBrandColor(
          text,
          fromSpeech ? SpeechSKU : productSKUFilter,
          fromSpeech ? SpeechSKU : productSKUFilter,
          selectedOutlet.OId,
          isDataCollection ? dataCollectionType : COLLECTION_TYPE.ORDER,
          userId,
        );

        setData(takeData);
      }
    } else {
      setData([]);
    }
  };

  const onSearchChange1 = async () => {
    const takeData = await getBrandSearchDataForChangeBrandColor(
      searchText,
      productSKUFilter,
      productSKUFilter,
      selectedOutlet.OId,
      isDataCollection ? dataCollectionType : COLLECTION_TYPE.ORDER,
      userId,
    );
    setData(takeData);
    if (JSON.stringify(data) !== JSON.stringify(takeData)) {
      setCounterBrand(counterBrand + 1);
    }
  };

  useEffect(() => {
    takeDataFromDB();
  }, []);

  useEffect(() => {
    console.log('route params -->', routeParams);
    onQRScan();
  }, [routeParams]);

  const takeDataFromDB = async () => {
    try {
      const serachedProduct = await getSearchProdect();
      setProductSKUFilter(serachedProduct[0]?.Value);

      if (!isDataCollection) {
        await getitemfilterList().then((data: any) => {
          try {
            let str = data.Value;
            let res = str.split(',');
            setSKULabel1(res[0]);
            if (res[1]) {
              setSKULabel2(res[1]);
            }

            GetfirstClassification(res[0]).then((data: any) => {
              setFirstClassification(data);
              setFirstClassName(Object.keys(data[0]).toString());
              if (
                res[0] != undefined &&
                res[1] != undefined &&
                res[1] != 'PRODUCT'
              ) {
                GetSecondClassification(res[0], res[1], '').then(
                  (data: any) => {
                    setSecondClassification(data);
                    setSecondClassName(Object.keys(data[0]).toString());
                  },
                );
              } else {
                return null;
              }
            });
          } catch (error) {
            writeErrorLog('getitemfilterList', error);
            console.log('error while checking for filter opentions -->', error);
          }
        });
      }
    } catch (error) {
      writeErrorLog('getitemfilterList', error);
      console.log('error while loading data on mounting -->', error);
    }
  };

  // Handle back button - web equivalent
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleBackPress = () => {
    handleBackBtn(t, (val: boolean) => {
      val && discardClickHandler();
    });
  };

  const discardClickHandler = async () => {
    try {
      selectOrdersDetail(savedOrderID).then(async (data: any) => {
        for (let i = 0; i < data.length; i++) {
          updateTABLE_PITEM_ADDEDITBRAND(data[i].item_id, false, false);
          updateTABLE_PITEM_btleQty(data[i].item_id, '');
          discardOrders(savedOrderID);
          discardOrdersMaster(savedOrderID);
          discardDiscount(savedOrderID);
        }
      });

      console.log('deleted all table data');

      resetAllOrder();
      resetAllDataCollection();
      navigate(-1);
    } catch (error) {
      writeErrorLog('discardClickHandler', error);
      console.log('error while discarding ordder -->', error);
    }
  };

  async function onQRScan() {
    if (routeParams?.ScanValue) {
      try {
        setSearchText('');
        getDataForQR(routeParams.ScanValue).then(QRdata => {
          setQRData(QRdata[0]);
        });
      } catch (error) {
        writeErrorLog('onQRScan', error);
        console.log('error while getting qr data', error);
      }
    }
  }

  const nextButton = async () => {
    await checkedOrderIdInDb(
      selectedOutlet?.OId,
      isDataCollection ? dataCollectionType : COLLECTION_TYPE.ORDER,
    ).then(len => {
      if (len == 0) {
        alert(t('Alerts.AlertPleaseAddTheOrder'));
      } else {
        navigate(`/${ScreenName.CREATENEWORDER3}`);
      }
    });
  };

  const filterOneDependingOnOtherFilter = async (
    selectedValue: any,
    selectedDD: any,
  ) => {
    if (selectedDD === FilterNameValidation[0].name) {
      // First Dropdown selected
      setSelectedFirstClass(selectedValue[firstClassName]);
      const updateFirstFilter = await updatesecondfilterwhileselectionone(
        firstClassName,
        selectedValue[firstClassName],
        secondClassName,
      );
      setSecondClassification(updateFirstFilter as any[]);
    } else if (selectedDD === FilterNameValidation[1].name) {
      // Second Dropdown selected
      setSelectedSecondClass(selectedValue[secondClassName]);
      const updateSecondFilter = await updatefirstfilterwhileselectionsecond(
        firstClassName,
        selectedValue[secondClassName],
        secondClassName,
      );
      setFirstClassification(updateSecondFilter as any[]);
    }
  };

  const onClearFilterPress = () => {
    setSelectedFirstClass('');
    setSelectedSecondClass('');
  };

  const handleSpeechResult = async (text: string) => {
    const serachedProduct = await getSearchProdect();
    onSearchChange(text, true, serachedProduct[0]?.Value);
  };

  const isFilterOneAccessGranted = isAccessControlProvided(
    getAccessControlSettings,
    AccessControlKeyConstants.ORDER_FILTER_ONE,
  );

  const isFilterTwoAccessGranted = isAccessControlProvided(
    getAccessControlSettings,
    AccessControlKeyConstants.ORDER_FILTER_TWO,
  );

  return (
    <>
      <Header
        title={
          isDataCollection
            ? t('DataCollection.DataCollectionStep2ActionBarText')
            : t('Orders.Step2ActionBarText')
        }
        navigation={{ goBack: () => navigate(-1)  }}
        isBackValidation={true}
        backBtnValidFunc={() => {
          handleBackPress();
        }}
      />
      <CustomSafeView>
        <TopCardCNO2
          clearPress={() => onClearFilterPress()}
          onCalendarPress={() => setOrderDateModal(true)}
          outletName={selectedOutlet?.OName}
          storeId={selectedOutlet?.OId}
          distributorName={selectedDist?.Distributor}
          distID={selectedDist?.DistributorID}
          startdate={orderDate}
          totalOrders={totalOrderValue}
          totalDiscount={1000}
          entityType={entityType?.value}
          isPreview={false}
          isDataCollection={isDataCollection}
          isAnyFilterAccessGranted={
            isFilterOneAccessGranted || isFilterTwoAccessGranted
          }
        />
        {isFilterOneAccessGranted && !isDataCollection && skuLabel1 && (
          <Box sx={{ zIndex: 1100 }}>
            <Box sx={{ px: 2.5 }}>
              <Typography sx={{ color: '#796A6A', fontWeight: 'bold', fontSize: 10, mx: 0.125, mt: 0.5 }}>
                {t('Common.Choose')} {skuLabel1}
              </Typography>
              <Dropdown
                data={firstClassification}
                label={firstClassName}
                selectedListIsScrollView={true}
                placeHolder={'Select 1'}
                selectedValue={selectedFirstClass}
                onPressItem={(val: any) => {
                  filterOneDependingOnOtherFilter(
                    val,
                    FilterNameValidation[0].name,
                  );
                }}
              />
            </Box>
          </Box>
        )}
        {isFilterTwoAccessGranted && !isDataCollection && skuLabel2 && (
          <Box sx={{ zIndex: 999 }}>
            <Box sx={{ px: 2.5 }}>
              <Typography sx={{ color: '#796A6A', fontWeight: 'bold', fontSize: 10, mx: 0.125, mt: 0.5 }}>
                {t('Common.Choose')} {skuLabel2}
              </Typography>
              <Dropdown
                data={secondClassification}
                label={secondClassName}
                selectedListIsScrollView={true}
                placeHolder={'Select 2'}
                selectedValue={selectedSecondClass}
                onPressItem={(val: any) => {
                  filterOneDependingOnOtherFilter(
                    val,
                    FilterNameValidation[1].name,
                  );
                }}
              />
            </Box>
          </Box>
        )}
        <Typography sx={{ fontSize: 10, color: Colors.DarkBrown, fontWeight: 'bold', ml: 0.125, my: 0.125, px: 2.5 }}>
          {t('Orders.ChooseProduct')}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            px: 2.5,
          }}
        >
          <AppTextInput
            placeholder={t('Orders.SearchBrand')}
            containerStyle={{ flex: 1 }}
            iconFamily={'Ionicons'}
            iconName={'search-outline'}
            iconSize={22}
            onChangeText={(txt: string) => onSearchChange(txt)}
            value={searchText}
          />
          {isAccessControlProvided(
            getAccessControlSettings,
            AccessControlKeyConstants.ORDER_SEARCH_BRAND_MIC,
          ) && (
            <Box sx={{ ml: 1 }}>
              {/* Speech Recognition - Web alternative needed */}
            </Box>
          )}
          {isDataCollection && (
            <Button
              sx={{ mx: 1.25 }}
              onClick={() => {
                navigate(`/${ScreenName.QR_BAR_SCANNER}`, {
                  state: { navigationFrom: 'DataCollection' },
                });
              }}
            >
              {globalImg.QrIcon}
            </Button>
          )}
        </Box>

        <SearchListCNO2
          data={data}
          totalOrders={totalOrderValue}
          productFilter={productSKUFilter}
          searchText={searchText}
          OID={selectedOutlet?.OId}
          uid={userId}
          dId={selectedDist?.DistributorID}
          QRdata={QRdata}
          onChangeInOrder={() => onSearchChange(searchText)}
          onChangeListCollpase={(val: any) => setOnChangeCollapse(val)}
          counterBrand={counterBrand}
        />
      </CustomSafeView>
      <Box sx={{ pb: 11.25 }} />

      <Button
        onClick={() => {
          nextButton();
        }}
        sx={{
          position: 'fixed',
          bottom: 0,
          width: '100%',
          height: 64,
          backgroundColor: Colors.lightGreenNext,
          my: 0.125,
          py: 1.875,
          justifyContent: 'center',
          '&:hover': {
            backgroundColor: Colors.lightGreenNext,
            opacity: 0.9,
          },
        }}
      >
        <Typography sx={{ fontSize: 16, color: Colors.white, textAlign: 'center', fontWeight: 'bold' }}>
          {t('DataCollection.nextbtn')}
        </Typography>
      </Button>

      <CustomCalender
        isModalOpen={orderDateModal}
        minDate={minDate}
        maxDate={new Date()}
        onDateChange={date => {
          setOrderDate(date);
        }}
        onPress={() => {
          setOrderDateModal(!orderDateModal);
        }}
      />
    </>
  );
}

export default CreateNewOrderStep2;
