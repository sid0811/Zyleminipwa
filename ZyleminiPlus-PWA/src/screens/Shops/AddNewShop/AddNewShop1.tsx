// Web-adapted AddNewShop1 screen - Structured placeholder
// TODO: Complete implementation with form validation, image capture, and navigation
import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Button, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { Colors } from '../../../theme/colors';
import { useGlobleAction } from '../../../redux/actionHooks/useGlobalAction';
import { useLoginAction } from '../../../redux/actionHooks/useLoginAction';
import { useShopAction } from '../../../redux/actionHooks/useShopAction';
import useLocation from '../../../hooks/useLocation';
import CustomSafeView from '../../../components/GlobalComponent/CustomSafeView';
import Dropdown from '../../../components/Dropdown/Dropdown';
import TextInput from '../../../components/TextInput/TextInput';
import { ShopImgs } from '../../../constants/AllImages';
import { ScreenName } from '../../../constants/screenConstants';
import {
  getAppOrderId,
  writeErrorLog,
  filePaths,
  picCaputredFrom,
} from '../../../utility/utils';
// TODO: Import database functions when available
// import { getBeatData, getDistributorData, getOutletArrayFromShop, getOutletArrayRoute, getRouteData } from '../../../database/WebDatabaseHelpers';
// TODO: Import components when available
// import Header from '../../../components/Header/Header';
// import DeviceCamera from '../../../components/Camera/DeviceCamera';

interface ANS1props {
  navigation?: any;
  route?: {
    params?: any;
  };
}

export const newparty = {
  Height: '8vh',
  Width: '87vw',
};

function AddNewShop1(props: ANS1props) {
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const { selectedShopData } = useShopAction();
  const { isDarkMode } = useGlobleAction();
  const { userId } = useLoginAction();
  const { t } = useTranslation();
  const { latitude, longitude } = useLocation();

  const [outletArray, setOutletArray] = useState<any[]>([]);
  const [searchedOutlet, setSearchedOutlet] = useState<any[]>([]);
  const [routeData, setRouteData] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [distData, setDistData] = useState<any[]>([]);
  const [selectedDist, setSelectedDist] = useState<any>(null);
  const [outletname, Setoutletname] = useState('');
  const [ownername, Setownername] = useState('');
  const [Address, SetAddress] = useState('');
  const [loadedImages, setLoadedImages] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [Beatid, setBeatid] = useState<any>('');
  const [fileList, setfileList] = useState<any[]>([]);
  const [appOrderId, setAppOrderId] = useState('');

  useEffect(() => {
    takeDataFromDB();
    getId();
    // TODO: fetchImagesFromDirectory(appOrderId);
  }, [modalVisible]);

  async function getId() {
    setAppOrderId(await getAppOrderId(userId));
  }

  const takeDataFromDB = async () => {
    try {
      // TODO: Implement database calls
      // const routeData: any = await getRouteData(userId);
      // setRouteData(routeData);
      // const outletArray = await getOutletArrayRoute(routeData[0]?.RouteID);
      // setOutletArray(outletArray);
      // setSelectedRoute(routeData[0]);
      // setBeatid(routeData[0]?.RouteID);
      // const DistData: any = await getDistributorData(userId);
      // setDistData(DistData);
      // setSelectedDist(DistData[0]);
      console.log('AddNewShop1: takeDataFromDB - TODO: Implement database calls');
    } catch (error) {
      writeErrorLog('takeDataFromDB', error);
    }
  };

  const nextPress = () => {
    if (Beatid != '' && outletname != '' && ownername != '' && Address !== '') {
      try {
        navigate(ScreenName.ADDNEWSHOPS2, {
          state: {
            Beatid,
            outletname,
            ownername,
            Address,
            latitude,
            longitude,
            fileList,
            appOrderId,
          },
        });
      } catch (error) {
        writeErrorLog('nextPress', error);
      }
    } else {
      window.alert(t('Alerts.AlertPleaseSelectAllField') || 'Please Select All Field');
    }
  };

  const onBeatChange = async (val: any) => {
    setSelectedRoute(val);
    setBeatid(val.RouteID);
    try {
      // TODO: const outletArray = await getOutletArrayRoute(val?.RouteID);
      // setOutletArray(outletArray);
      console.log('AddNewShop1: onBeatChange - TODO: Implement route change logic');
    } catch (error) {
      writeErrorLog('onBeatChange', error);
    }
  };

  return (
    <CustomSafeView edges={['bottom']}>
      {/* TODO: <Header title={t('AddNewParty.AddNewPartyTitle')} navigation={navigation} /> */}
      <Box sx={{ flex: 1 }}>
        <CustomSafeView isScrollView={true}>
          <Box sx={{ padding: '20px' }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', marginBottom: '1vh' }}>
              <Typography sx={{ color: Colors.DarkBrown, fontWeight: 'bold' }}>
                {t('AddNewParty.selectbeat') || 'Select Beat'}
              </Typography>
              <Typography sx={{ color: 'red' }}>*</Typography>
            </Box>
            <Dropdown
              data={routeData}
              label={'RouteName'}
              selectedListIsScrollView={true}
              placeHolder={'Select Route'}
              selectedValue={selectedRoute?.RouteName}
              onPressItem={(val: any) => onBeatChange(val)}
            />

            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: '2vh', marginBottom: '1vh' }}>
              <Typography sx={{ color: Colors.DarkBrown, fontWeight: 'bold' }}>
                {t('AddNewParty.OutletName') || 'Outlet Name'}
              </Typography>
              <Typography sx={{ color: 'red' }}>*</Typography>
            </Box>
            <TextInput
              value={outletname}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => Setoutletname(e.target.value)}
              sx={{ marginVertical: '1.5vh' }}
            />

            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: '2vh', marginBottom: '1vh' }}>
              <Typography sx={{ color: Colors.DarkBrown, fontWeight: 'bold' }}>
                {t('AddNewParty.ownername') || 'Owner Name'}
              </Typography>
              <Typography sx={{ color: 'red' }}>*</Typography>
            </Box>
            <TextInput
              value={ownername}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (/^[A-Za-z ]*$/.test(e.target.value)) {
                  Setownername(e.target.value);
                }
              }}
              sx={{ marginVertical: '1.5vh' }}
            />

            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: '2vh', marginBottom: '1vh' }}>
              <Typography sx={{ color: Colors.DarkBrown, fontWeight: 'bold' }}>
                {t('AddNewParty.address') || 'Address'}
              </Typography>
              <Typography sx={{ color: 'red' }}>*</Typography>
            </Box>
            <TextInput
              value={Address}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => SetAddress(e.target.value)}
              sx={{ marginVertical: '1.5vh' }}
            />

            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: '2vh', marginBottom: '1vh' }}>
              <Typography sx={{ color: Colors.DarkBrown, fontWeight: 'bold' }}>
                {t('AddNewParty.addlocation') || 'Location'}
              </Typography>
              <Typography sx={{ color: 'red' }}>*</Typography>
            </Box>
            <Box
              sx={{
                border: '1px solid #E6DFDF',
                borderRadius: '8px',
                padding: '10px',
                backgroundColor: Colors.white,
                minHeight: '8vh',
              }}
            >
              <Typography sx={{ fontFamily: 'Proxima Nova, sans-serif', fontSize: '14px' }}>
                {longitude.toString() + ', ' + latitude.toString()}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: '2vh', marginBottom: '1vh' }}>
              <Typography sx={{ color: Colors.DarkBrown, fontWeight: 'bold' }}>
                {t('AddNewParty.addpictures') || 'Add Pictures'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button
                onClick={() => setModalVisible(true)}
                sx={{
                  marginTop: '5vh',
                  marginLeft: '2vw',
                  marginHorizontal: '5vw',
                }}
              >
                <img
                  src={ShopImgs.Camera}
                  alt="Camera"
                  style={{ height: '4vh', width: '4vw' }}
                />
              </Button>
              {loadedImages?.map((item, index) => (
                <img key={index} src={item} alt={`Shop ${index}`} style={{ height: '10vh', width: '10vw', margin: '5px' }} />
              ))}
            </Box>
          </Box>
        </CustomSafeView>

        <Button
          onClick={nextPress}
          sx={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: Colors.mainBackground,
            color: Colors.white,
            padding: '10px 40px',
            borderRadius: '8px',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: Colors.mainBackground,
              opacity: 0.9,
            },
          }}
        >
          <Typography sx={{ fontFamily: 'Proxima Nova, sans-serif', fontSize: '16px' }}>
            {t('AddNewParty.next') || 'Next'}
          </Typography>
        </Button>

        {/* TODO: <DeviceCamera
          isModalOpen={modalVisible}
          onPress={(val: boolean) => setModalVisible(val)}
          routeToStore={selectedShopData?.shopId}
          capturedFrom={picCaputredFrom.ADD_NEW_SHOP}
          appOrderId={appOrderId}
          shopId=""
        /> */}
      </Box>
    </CustomSafeView>
  );
}

export default AddNewShop1;

