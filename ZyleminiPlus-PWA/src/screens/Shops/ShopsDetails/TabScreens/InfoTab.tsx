// Web-adapted InfoTab TabScreen - Structured placeholder
// TODO: Complete implementation with map, images, profile data, and all sub-components
import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../../../theme/colors';
import { useShopAction } from '../../../../redux/actionHooks/useShopAction';
import useLocation from '../../../../hooks/useLocation';
import CustomSafeView from '../../../../components/GlobalComponent/CustomSafeView';
import Loader from '../../../../components/Loader/Loader';
import { ShopImgs } from '../../../../constants/AllImages';
import { useLoginAction } from '../../../../redux/actionHooks/useLoginAction';
import { useGlobleAction } from '../../../../redux/actionHooks/useGlobalAction';
import { useNetInfo } from '../../../../hooks/useNetInfo';
import {
  isAccessControlProvided,
  writeErrorLog,
  getAppOrderId,
} from '../../../../utility/utils';
import { AccessControlKeyConstants } from '../../../../constants/screenConstants';
// TODO: Import database functions when available
// import { getDistributorname, getOutletInfo } from '../../../../database/WebDatabaseHelpers';
// TODO: Import components when available
// import TopBrandsListInfo from './Component/TopBrandsListInfo';
// import TotalOutstandingShops from './Component/TotalOutstandingShops';
// import LastOrderOnList from './Component/LastOrderOnList';
// import LastSalesOnList from './Component/LastSalesOnList';
// import GetShopProfile from '../Component/GetShopProfile';
// import LedgerDetailList from './Component/LedgerDetailList';
// import PDCDetails from './Component/PDCDetails';
// import UnallocatedAmountDetails from './Component/UnallocatedAmountDetails';
// import { custProfileData } from '../../../../api/ShopsAPICalls';
// TODO: Import web map component when available
// import MapView from 'react-map-gl' or similar web map library

function InfoTab(props: any) {
  const { navigation } = props;
  const { selectedShopData } = useShopAction();
  const { latitude, longitude } = useLocation();
  const { userId } = useLoginAction();
  const { getAccessControlSettings } = useGlobleAction();
  const { t } = useTranslation();
  const { isNetConnected } = useNetInfo();

  const mapRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>([]);
  const [outletInfo, setOutletInfo] = useState<any>({});
  const [loadedImages, setLoadedImages] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [appOrderId, setAppOrderId] = useState('');
  const [isGetProfileShown, setIsGetProfileShown] = useState(false);
  const [isTopBrandShown, setIsTopBrandShown] = useState(false);
  const [isOSShown, setIsOSShown] = useState(false);
  const [isLastOrderShown, setIsLastOrderShown] = useState(false);
  const [isLastSalesShown, setIsLastSalesShown] = useState(false);
  const [isLedgerShown, setIsLedgerShown] = useState(false);
  const [isPDCShown, setIsPDCShown] = useState(false);
  const [isUnallocatedShown, setIsUnallocatedShown] = useState(false);
  const [distributorName, setDistributorName] = useState('');

  useEffect(() => {
    getId();
    takeDataFromDB();
    // TODO: fetchImagesFromDirectory();
  }, []);

  async function getId() {
    setAppOrderId(await getAppOrderId(userId));
  }

  const takeDataFromDB = async () => {
    try {
      // TODO: Implement database calls
      // const outletData = await getOutletInfo(selectedShopData?.shopId);
      // setOutletInfo(outletData[0]);
      // const distributorNames = await getDistributorname(selectedShopData?.shopId);
      // setDistributorName(distributorNames[0]?.Distributor || '');
      console.log('InfoTab: takeDataFromDB - TODO: Implement database calls');
    } catch (error) {
      writeErrorLog('takeDataFromDB', error);
    }
  };

  const getProfileData = async () => {
    setIsLoading(true);
    // TODO: Implement API call
    // const payload = { CustomerProfileReport: [...] };
    // const response = await custProfileData(payload);
    // if (response && typeof response === 'object' && response.Success) {
    //   setProfileData(response);
    //   setIsGetProfileShown(true);
    // }
    console.log('InfoTab: getProfileData - TODO: Implement API call');
    setIsLoading(false);
  };

  return (
    <>
      <Loader visible={isLoading} />
      <CustomSafeView isScrollView={true}>
        {isAccessControlProvided(
          getAccessControlSettings,
          AccessControlKeyConstants.SHOP_DETAILS_IMAGE,
        ) && (
          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            <IconButton
              onClick={() => setModalVisible(true)}
              sx={{
                marginTop: '5vh',
                marginLeft: '2vw',
              }}
            >
              <img
                src={ShopImgs.Camera}
                alt="Camera"
                style={{ height: '4vh', width: '4vw' }}
              />
            </IconButton>
            {/* TODO: Render loaded images */}
            {loadedImages?.map((item, index) => (
              <img key={index} src={item} alt={`Shop ${index}`} style={{ height: '10vh', width: '10vw', margin: '5px' }} />
            ))}
          </Box>
        )}

        <Box sx={{ marginTop: '2vh', marginLeft: '6vw', marginRight: '6vw' }}>
          <Typography
            sx={{
              color: Colors.DarkBrown,
              fontWeight: 'bold',
              fontFamily: 'Proxima Nova, sans-serif',
              fontSize: '14px',
              marginBottom: '1vh',
            }}
          >
            {t('Shops.Address') || 'Address'}
          </Typography>
          <Typography
            sx={{
              color: '#362828',
              fontFamily: 'Proxima Nova, sans-serif',
              fontSize: '12px',
            }}
          >
            {selectedShopData?.outletInfo?.split('||')[1] || 'N/A'}
          </Typography>

          {/* TODO: Implement web map component */}
          <Box
            sx={{
              marginTop: '2vh',
              height: '30vh',
              width: '100%',
              backgroundColor: '#E6DFDF',
              borderRadius: '2vw',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography sx={{ color: '#8C7878' }}>
              {t('Shops.MapView') || 'Map View - TODO: Implement web map'}
            </Typography>
            {/* TODO: Add web map component here */}
          </Box>

          {isAccessControlProvided(
            getAccessControlSettings,
            AccessControlKeyConstants.SHOP_DETAILS_PROFILE,
          ) && (
            <Box sx={{ marginTop: '2vh' }}>
              <Button
                onClick={getProfileData}
                sx={{
                  marginLeft: '6vw',
                  marginTop: '2vh',
                  textTransform: 'none',
                  color: Colors.mainBackground,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: 'Proxima Nova, sans-serif',
                    fontSize: '14px',
                  }}
                >
                  {t('Shops.GetProfile') || 'Get Profile'}
                </Typography>
              </Button>
            </Box>
          )}

          {/* TODO: Render GetShopProfile component when profile data is available */}
          {isGetProfileShown && (
            <Box sx={{ marginTop: '-15vh' }}>
              {/* <GetShopProfile
                navigation={navigation}
                profileData={profileData}
                shopId={selectedShopData?.shopId}
                isFromCNO={false}
                setIsLastOrderShown={setIsLastOrderShown}
                setIsLastSalesShown={setIsLastSalesShown}
                setIsOSShown={setIsOSShown}
                setIsTopBrandShown={setIsTopBrandShown}
                setIsLedgerShown={setIsLedgerShown}
                setIsPDCShown={setIsPDCShown}
                setIsUnallocatedShown={setIsUnallocatedShown}
              /> */}
              <Typography>Profile Data: {JSON.stringify(profileData)}</Typography>
            </Box>
          )}

          {/* TODO: Add Contact Person section */}
          {/* TODO: Add Registration section */}
          {/* TODO: Add Distributor section */}
          {/* TODO: Add all other sections from original */}
        </Box>
      </CustomSafeView>
    </>
  );
}

export default InfoTab;

