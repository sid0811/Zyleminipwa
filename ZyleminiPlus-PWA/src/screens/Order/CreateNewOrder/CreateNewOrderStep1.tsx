import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import moment from 'moment';

import CustomSafeView from '../../../components/GlobalComponent/CustomSafeView';
import { useGlobleAction } from '../../../redux/actionHooks/useGlobalAction';
import { useLoginAction } from '../../../redux/actionHooks/useLoginAction';
import { useNextCNO1Button } from '../Functions/useNextCNO1Button';

import { Colors } from '../../../theme/colors';
import {
  COLLECTION_TYPE,
  entityTypes,
  getAppOrderId,
  getCurrentDateTime,
  isAccessControlProvided,
  isValidvalue,
  writeActivityLog,
  writeErrorLog,
} from '../../../utility/utils';
import {
  checkIsOrderIdInDb,
  getBeatData,
  getDistributorData,
  getOutletArrayFromShop,
  getOutletArrayRoute,
  getRouteData,
} from '../../../database/WebDatabaseHelpers';
import Dropdown from '../../../components/Dropdown/Dropdown';
import Header from '../../../components/Header/Header';
import AppTextInput from '../../../components/TextInput/TextInput';
import ShopDetailCard from '../Components/ShopDetailCard';
import { useOrderAction } from '../../../redux/actionHooks/useOrderAction';
import {
  DistributorData,
  EntityType,
  OutletArrayData,
  OutletArrayFromShop,
  RouteData,
} from '../../../types/types';
import { custProfileData } from '../../../api/ShopsAPICalls';
import GetShopProfile from '../../Shops/ShopsDetails/Component/GetShopProfile';
import TotalOutstandingShops from '../../Shops/ShopsDetails/TabScreens/Component/TotalOutstandingShops';
import LastOrderOnList from '../../Shops/ShopsDetails/TabScreens/Component/LastOrderOnList';
import LastSalesOnList from '../../Shops/ShopsDetails/TabScreens/Component/LastSalesOnList';
import TopBrandsListInfo from '../../Shops/ShopsDetails/TabScreens/Component/TopBrandsListInfo';
import Loader from '../../../components/Loader/Loader';
import { weeklyOffShopAlertHandler } from '../Functions/Validations';
import LedgerDetailList from '../../Shops/ShopsDetails/TabScreens/Component/LedgerDetailList';
import useLocation from '../../../hooks/useLocation';
import PDCDetails from '../../Shops/ShopsDetails/TabScreens/Component/PDCDetails';
import UnallocatedAmountDetails from '../../Shops/ShopsDetails/TabScreens/Component/UnallocatedAmountDetails';
import { AccessControlKeyConstants, ScreenName } from '../../../constants/screenConstants';
import { useNetInfo } from '../../../hooks/useNetInfo';

type OutletDataInterface = OutletArrayData[] | OutletArrayFromShop[];

interface CNO1props {
  navigation?: any;
  route?: {
    params?: any;
  };
}

function CreateNewOrderStep1(props: CNO1props) {
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const propsData = routerLocation.state?.propsData || props.route?.params?.propsData || {};

  const { onNextPress } = useNextCNO1Button();
  const { isDarkMode, syncFlag, isLogWritingEnabled, getAccessControlSettings } =
    useGlobleAction();
  const { userId } = useLoginAction();
  const { setSavedOrderId, setPropsData } = useOrderAction();
  const { t } = useTranslation();
  const { error: locationError } = useLocation();
  const { isNetConnected } = useNetInfo();

  const [selectedEntity, setSelectedEntity] = useState({} as EntityType);
  const [outletArray, setOutletArray] = useState<OutletDataInterface>([]);
  const [searchedOutlet, setSearchedOutlet] = useState<OutletDataInterface>([]);
  const [routeData, setRouteData] = useState<RouteData[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<any>([]);
  const [distData, setDistData] = useState<
    DistributorData[] | OutletArrayFromShop[]
  >([]);
  const [selectedDist, setSelectedDist] = useState<any>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedOutlet, setSelectedOutlet] = useState<any>({});

  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>([]);

  const [isGetProfileShown, setIsGetProfileShown] = useState(false);
  const [isTopBrandShown, setIsTopBrandShown] = useState(false);
  const [isOSShown, setIsOSShown] = useState(false);
  const [isLastOrderShown, setIsLastOrderShown] = useState(false);
  const [isLastSalesShown, setIsLastSalesShown] = useState(false);
  const [isLedgerShown, setIsLedgerShown] = useState(false);
  const [isPDCShown, setIsPDCShown] = useState(false);
  const [isUnallocatedShown, setIsUnallocatedShown] = useState(false);

  const outletArrayRef = useRef<OutletDataInterface>([]);

  useEffect(() => {
    console.log('Navigation: step 1');
    setIsGetProfileShown(false);
    if (propsData?.isFromShop) {
      propsData?.isNewParty ? takeDataFromDB() : takeDataFromDBForShop();
    } else {
      takeDataFromDB();
    }
  }, [syncFlag]);

  const takeDataFromDB = async () => {
    console.log(selectedDist);

    let datetime = await getCurrentDateTime();
    isLogWritingEnabled && writeActivityLog('START_CNO');

    setPropsData(propsData);
    try {
      //Entity
      setSelectedEntity(entityTypes[0]);
      //Route
      const routeData = await getRouteData(userId);
      setRouteData(routeData);

      const outletArray: OutletArrayData[] = await getOutletArrayRoute(
        routeData[0]?.RouteID,
      );

      if (propsData?.isNewParty) {
        // for auto-fill new party detail
        const newPartyOutlet = outletArray.filter(item => {
          return item.id === propsData?.shopId;
        });
        setOutletArray(newPartyOutlet);
        outletArrayRef.current = newPartyOutlet;
        setSelectedOutlet(newPartyOutlet[0]);
        setSearchText(newPartyOutlet[0]?.party);
      } else {
        setOutletArray(outletArray);
        outletArrayRef.current = outletArray;
        setSelectedOutlet([]);
        setSearchText('');
      }

      setSelectedRoute(routeData[0]);
      // Dist
      const DistData = await getDistributorData(userId);
      setDistData(DistData);

      setSelectedDist(DistData[0]);
    } catch (error) {
      writeErrorLog('takeDataFromDB', error);
      console.log('error while take data from db -->', error);
    }
  };

  const takeDataFromDBForShop = async () => {
    setPropsData(propsData);
    try {
      //Entity
      setSelectedEntity(entityTypes[0]);
      //Route
      const outletArray: OutletArrayFromShop[] = await getOutletArrayFromShop(
        propsData?.shopId,
        userId,
      );

      setOutletArray(outletArray);
      outletArrayRef.current = outletArray;
      setRouteData(outletArray);

      // for auto fill party name and detail card
      setSearchText(outletArray[0].party);
      setSelectedOutlet(outletArray[0]);
      //
      setSelectedRoute(outletArray[0]);
      //Dist
      const DistData = await getDistributorData(userId);
      setDistData(DistData);

      setSelectedDist(DistData[0]);
    } catch (error) {
      writeErrorLog('takeDataFromDBForShop', error);
      console.log('error while take data from db for shop-->', error);
    }
  };

  const onBeatChange = async (val: any) => {
    setSelectedRoute(val);

    try {
      const outletArray = await getOutletArrayRoute(val?.RouteID);
      setOutletArray(outletArray);
      outletArrayRef.current = outletArray;
    } catch (error) {
      writeErrorLog('onBeatChange', error);
    }
  };

  const handleSearch = (text: string, outletRef: OutletDataInterface = []) => {
    setSearchText(text);
    if (text) {
      if (outletRef?.length > 0) {
        const filteredItems: OutletDataInterface = outletRef.filter(item =>
          item.party.toLowerCase().includes(text.toLowerCase()),
        );
        setSearchedOutlet(filteredItems);
      } else {
        const filteredItems: OutletDataInterface = outletArray.filter(item =>
          item.party.toLowerCase().includes(text.toLowerCase()),
        );
        setSearchedOutlet(filteredItems);
      }
    } else {
      setSearchedOutlet([]);
    }
  };

  const RenderItem = (props: { item: any; index: number }) => {
    const { item } = props;

    return (
      <ListItem
        button
        onClick={() => {
          setSelectedOutlet(item);
          setSearchText(item.party);
          setSearchedOutlet([]);
          setIsGetProfileShown(false);
        }}
        sx={{
          width: '92%',
          mx: 2.5,
          backgroundColor: Colors.white,
          overflow: 'hidden',
          '&:hover': {
            backgroundColor: Colors.lightGray,
          },
        }}
      >
        <ListItemText primary={item.party} sx={{ color: Colors.black, padding: 0.5 }} />
      </ListItem>
    );
  };

  const getProfileData = async () => {
    setIsLoading(true);
    const payload = {
      CustomerProfileReport: [
        {
          UserID: userId,
          CustomerId: selectedOutlet?.id,
        },
      ],
    };

    try {
      const response = await custProfileData(payload);

      // Ensure response is in the expected format
      if (response && typeof response === 'object' && response.Success) {
        setProfileData(response);
        setIsGetProfileShown(true);
      } else {
        throw new Error("We couldn't find any data to display right now");
      }
    } catch (error: any) {
      writeErrorLog('getProfileData', error);
      console.log('Checking of internet', isNetConnected);

      if (isNetConnected === false || isNetConnected == null) {
        alert(
          `${t('Alerts.InternetConnectionUnavailable')}\n${t('Alerts.IntenetConnectionUnavailableMsg')}`
        );
      } else {
        alert(error.message || 'An error occurred');
      }

      console.log('Error while getting shop profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const RenderFooterItem = () => {
    return (
      <Box>
        {selectedOutlet?.party && selectedEntity?.id != 2 && (
          <Box>
            <ShopDetailCard outletDetail={selectedOutlet} />
            {isAccessControlProvided(
              getAccessControlSettings,
              AccessControlKeyConstants.SHOP_DETAILS_PROFILE,
            ) && (
              <Button
                onClick={() => {
                  getProfileData();
                }}
                sx={{ ml: 2, mt: 2 }}
              >
                <Typography sx={{ color: '#3955CB', fontSize: 18, fontWeight: 800 }}>
                  {t('Shops.GetProfile')}
                </Typography>
              </Button>
            )}
            {isGetProfileShown && (
              <Box sx={{ mt: 2 }}>
                <GetShopProfile
                  navigation={{ navigate }}
                  profileData={profileData}
                  shopId={selectedOutlet?.id}
                  isFromCNO={true}
                  setIsLastOrderShown={val => setIsLastOrderShown(val)}
                  setIsLastSalesShown={val => setIsLastSalesShown(val)}
                  setIsOSShown={val => setIsOSShown(val)}
                  setIsTopBrandShown={val => setIsTopBrandShown(val)}
                  setIsLedgerShown={val => setIsLedgerShown(val)}
                  setIsPDCShown={val => setIsPDCShown(val)}
                  setIsUnallocatedShown={val => setIsUnallocatedShown(val)}
                />
              </Box>
            )}
          </Box>
        )}

        <Box sx={{ mt: 2 }}>
          <Typography sx={{ color: Colors.DarkBrown, fontWeight: 'bold', fontSize: 13, mt: 1.5 }}>
            {t('Orders.ChooseDist')}
          </Typography>
          <Dropdown
            data={distData}
            label={'Distributor'}
            placeHolder={'Select Distributor'}
            selectedListIsScrollView={true}
            selectedValue={selectedDist?.Distributor}
            onPressItem={(val: any) => {
              setSelectedDist(val);
            }}
            isSearchable={true}
            isVoiceRecognitionActive={!propsData?.isFromShop ? true : false}
          />
          <Box sx={{ mb: 25 }} />
        </Box>
      </Box>
    );
  };

  const nextPress = async () => {
    let week = moment().format('dddd'); //Saturday current week
    let todayWeekDay = week.toUpperCase(); //SATURDAY
    let weekDayName = selectedOutlet?.weeklyoff;
    let WeekDay = weekDayName?.toUpperCase() || 'NA';

    if (todayWeekDay == WeekDay) {
      weeklyOffShopAlertHandler(onPress => {
        onPress && nextPressSuccess();
      });
    } else {
      nextPressSuccess();
    }
  };

  async function nextPressSuccess() {
    try {
      await checkIsOrderIdInDb(
        selectedOutlet?.id,
        COLLECTION_TYPE.ORDER,
        userId,
      ).then(async (data: any) => {
        if (data.length > 0) {
          setSavedOrderId(data[0].id);
        } else {
          setSavedOrderId(await getAppOrderId(userId));
        }
      });
      isLogWritingEnabled &&
        writeActivityLog(
          `Outlet Id : ${selectedOutlet.id},Entity Id : ${selectedEntity.id},Dis Id :${selectedDist?.DistributorID}`,
        );
      onNextPress(
        selectedEntity,
        selectedRoute,
        selectedEntity.id == 2
          ? selectedDist?.DistributorID
          : selectedOutlet.id,
        selectedEntity.id == 2
          ? selectedDist?.Distributor
          : selectedOutlet.party,
        selectedDist,
        false,
        { navigate },
      );
    } catch (error) {
      writeErrorLog('nextPress', error);
    }
  }

  const handleSpeechResult = (text: string) => {
    handleSearch(text, outletArrayRef.current);
  };

  return (
    <>
      <Loader visible={isLoading} />
      <Header title={t('Orders.Step1ActionBarText')} navigation={{ goBack: () => navigate(-1) }} />
      <CustomSafeView>
        <Box sx={{ px: 2.5, mt: 2 }}>
          <Box sx={{ zIndex: 1000 }}>
            <Typography sx={{ color: Colors.DarkBrown, fontWeight: 'bold', fontSize: 13, mt: 1.5 }}>
              {t('Orders.EntityType')}
            </Typography>
            <Dropdown
              data={entityTypes}
              label={'value'}
              selectedListIsScrollView={true}
              placeHolder={'Select Entity'}
              selectedValue={selectedEntity?.value}
              onPressItem={(val: any) => {
                setSelectedEntity(val);
              }}
            />
          </Box>

          <Typography sx={{ color: Colors.DarkBrown, fontWeight: 'bold', fontSize: 13, mt: 1.5 }}>
            {t('Orders.ChooseBeat')}
          </Typography>
          <Box sx={{ zIndex: 999 }}>
            <Dropdown
              data={routeData}
              label={'RouteName'}
              selectedListIsScrollView={true}
              placeHolder={'Select Route'}
              selectedValue={selectedRoute?.RouteName}
              onPressItem={(val: any) => {
                onBeatChange(val);
              }}
            />
          </Box>
          {selectedEntity?.id != 2 && (
            <>
              <Typography sx={{ color: Colors.DarkBrown, fontWeight: 'bold', fontSize: 13, mt: 1.5 }}>
                {t('Orders.ChooseOutlet')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                <AppTextInput
                  placeholder={t('Orders.SearchOutlet')}
                  containerStyle={{
                    flex: propsData?.isFromShop ? 0 : 1,
                  }}
                  iconFamily={'Ionicons'}
                  iconName={'search-outline'}
                  iconSize={22}
                  onChangeText={(txt: string) => handleSearch(txt)}
                  value={searchText}
                />
                {isAccessControlProvided(
                  getAccessControlSettings,
                  AccessControlKeyConstants.ORDER_SEARCH_SHOP_MIC,
                ) &&
                  !propsData?.isFromShop && (
                    <Box sx={{ ml: 1 }}>
                      {/* Speech Recognition Button - Web alternative needed */}
                    </Box>
                  )}
              </Box>
            </>
          )}
        </Box>

        <List sx={{ px: 2.5 }}>
          {searchedOutlet.map((item, index) => (
            <RenderItem key={index} item={item} index={index} />
          ))}
          <RenderFooterItem />
        </List>

        <TotalOutstandingShops
          isModalOpen={isOSShown}
          distrubutorName={selectedDist?.Distributor}
          listData={profileData?.Outstanding_Details}
          onPress={val => {
            setIsOSShown(val);
          }}
          partyName={
            profileData?.Ledger_Customer?.length > 0
              ? profileData?.Ledger_Customer[0]?.PARTY
              : ''
          }
        />

        <LastOrderOnList
          isModalOpen={isLastOrderShown}
          headerData={profileData?.OrderMaster_Order}
          listData={profileData?.OrderMaster_OrderDetails}
          onPress={val => {
            setIsLastOrderShown(val);
          }}
        />

        <LastSalesOnList
          isModalOpen={isLastSalesShown}
          headerData={profileData?.SalesMaster_Invoice}
          listData={profileData?.SalesMaster_InvoiceDetails}
          onPress={val => {
            setIsLastSalesShown(val);
          }}
        />

        <TopBrandsListInfo
          isModalOpen={isTopBrandShown}
          listData={profileData?.TopBrands}
          onPress={val => {
            setIsTopBrandShown(val);
          }}
        />

        <LedgerDetailList
          isModalOpen={isLedgerShown}
          distrubutorName={selectedDist?.Distributor}
          partyName={
            profileData?.Ledger_Customer?.length > 0
              ? profileData?.Ledger_Customer[0]?.PARTY
              : ''
          }
          Ledger_Details={profileData?.Ledger_Details || []}
          onPress={val => {
            setIsLedgerShown(val);
          }}
        />

        <PDCDetails
          isModalOpen={isPDCShown}
          partyName={
            profileData?.Ledger_Customer?.length > 0
              ? profileData?.Ledger_Customer[0]?.PARTY
              : ''
          }
          PDC_Details={profileData?.PDC_Details}
          onPress={val => {
            setIsPDCShown(val);
          }}
        />

        <UnallocatedAmountDetails
          isModalOpen={isUnallocatedShown}
          partyName={
            profileData?.Ledger_Customer?.length > 0
              ? profileData?.Ledger_Customer[0]?.PARTY
              : ''
          }
          Unallocated_Details={profileData?.Unallocated_Details}
          onPress={val => {
            setIsUnallocatedShown(val);
          }}
        />
        <Button
          onClick={() => {
            nextPress();
          }}
          sx={{
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
          <Typography
            sx={{
              fontSize: 16,
              color: Colors.white,
              textAlign: 'center',
              fontWeight: 'bold',
            }}
          >
            {t('DataCollection.nextbtn')}
          </Typography>
        </Button>
      </CustomSafeView>
    </>
  );
}

export default CreateNewOrderStep1;
