// Web-adapted AddNewShop2 screen - Structured placeholder
// TODO: Complete implementation with form validation, submission, and sync
import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { Colors } from '../../../theme/colors';
import { useGlobleAction } from '../../../redux/actionHooks/useGlobalAction';
import { useLoginAction } from '../../../redux/actionHooks/useLoginAction';
import { useOrderAction } from '../../../redux/actionHooks/useOrderAction';
import CustomSafeView from '../../../components/GlobalComponent/CustomSafeView';
import Dropdown from '../../../components/Dropdown/Dropdown';
import TextInput from '../../../components/TextInput/TextInput';
import { ScreenName } from '../../../constants/screenConstants';
import { useSyncNow } from '../../../hooks/useSyncNow';
import { useNetInfo } from '../../../hooks/useNetInfo';
import Loader from '../../../components/Loader/Loader';
import {
  getAppOrderId,
  getCurrentDateTime,
  getCurrentDate,
  writeErrorLog,
} from '../../../utility/utils';
// TODO: Import database functions when available
// import { insertNewPartyImages, insertNewShopnewpartyoutlet, insertuses_log } from '../../../database/WebDatabaseHelpers';
// TODO: Import components when available
// import Header from '../../../components/Header/Header';

interface ANS2props {
  navigation?: any;
  route?: {
    params?: any;
  };
}

export const newparty = {
  Height: '8vh',
  Width: '87vw',
};

function AddNewShop2(props: ANS2props) {
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const routeParams = routerLocation.state || props.route?.params || {};
  const { isDarkMode, isLogWritingEnabled, isSyncImmediate } = useGlobleAction();
  const { userId } = useLoginAction();
  const { t } = useTranslation();
  const { propsData } = useOrderAction();
  const { isNetConnected } = useNetInfo();
  const { doSync } = useSyncNow();

  const [outletArray, setOutletArray] = useState<any[]>([]);
  const [routeData, setRouteData] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [distData, setDistData] = useState<any[]>([]);
  const [selectedDist, setSelectedDist] = useState<any>(null);
  const [name, Setname] = useState('');
  const [mobilenumber, Setmobilenumber] = useState('');
  const [shoptype, Setshoptype] = useState('');
  const [shoparea, Setshoparea] = useState('');
  const [registrationno, Setregistrationno] = useState('');
  const [selecteShoptype, setselecteShoptype] = useState<any>(null);
  const [selecteShopArea, setselecteShopArea] = useState<any>(null);
  const [isLoading, setisLoading] = useState(false);

  const shoptype123 = [
    { value: 'Shop 1' },
    { value: 'Shop 2' },
  ];

  const register = async () => {
    const curentDatetime = await getCurrentDate();
    const getCurrentdatetimestamp = await getCurrentDateTime();

    if (isLogWritingEnabled) {
      // TODO: insertuses_log(`Shop Registered ${routeParams.outletname} `, getCurrentdatetimestamp, 'False');
      console.log('AddNewShop2: register - TODO: Implement log writing');
    }

    if (
      name != '' &&
      mobilenumber != '' &&
      selecteShoptype?.value &&
      selecteShopArea?.value &&
      registrationno != '' &&
      mobilenumber.length == 10
    ) {
      try {
        // TODO: Implement database insert
        // insertNewShopnewpartyoutlet(
        //   routeParams.appOrderId,
        //   routeParams.Beatid,
        //   routeParams.outletname,
        //   mobilenumber,
        //   routeParams.ownername,
        //   routeParams.Address,
        //   '',
        //   routeParams.latitude,
        //   routeParams.longitude,
        //   'N',
        //   curentDatetime,
        //   selecteShoptype?.value,
        //   registrationno,
        //   routeParams.appOrderId,
        //   name,
        //   selecteShopArea?.value,
        //   userId,
        // );

        const confirmed = window.confirm(t('Alerts.AlertShopAddedSuccessfullyMsg') || 'Shop Added Successfully');
        if (confirmed) {
          try {
            if (isSyncImmediate && (isNetConnected || isNetConnected === null)) {
              await doSync({
                loaderState: (val: boolean) => {
                  setisLoading?.(val);
                },
              });
            }
            // TODO: Navigate based on propsData?.isFromShop
            if (propsData?.isFromShop) {
              navigate(ScreenName.SHOPS);
            } else {
              navigate(ScreenName.DASHBOARD);
            }
          } catch (error) {
            console.error('Sync failed:', error);
            navigate(ScreenName.DASHBOARD);
          }
        }
      } catch (error) {
        writeErrorLog('register', error);
        window.alert(t('Alerts.AlertErrorOccurred') || 'An error occurred');
      }
    } else {
      window.alert(t('Alerts.AlertPleaseFillAllFields') || 'Please fill all fields correctly');
    }
  };

  return (
    <>
      <Loader visible={isLoading} />
      <CustomSafeView edges={['bottom']}>
        {/* TODO: <Header title={t('AddNewParty.AddNewPartyTitle')} navigation={navigation} /> */}
        <Box sx={{ flex: 1 }}>
          <CustomSafeView isScrollView={true}>
            <Box sx={{ padding: '20px' }}>
              <Box sx={{ display: 'flex', flexDirection: 'row', marginBottom: '1vh' }}>
                <Typography sx={{ color: Colors.DarkBrown, fontWeight: 'bold' }}>
                  {t('AddNewParty.ContactPerson') || 'Contact Person'}
                </Typography>
                <Typography sx={{ color: 'red' }}>*</Typography>
              </Box>
              <TextInput
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => Setname(e.target.value)}
                sx={{ marginVertical: '1.5vh' }}
              />

              <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: '2vh', marginBottom: '1vh' }}>
                <Typography sx={{ color: Colors.DarkBrown, fontWeight: 'bold' }}>
                  {t('AddNewParty.MobileNumber') || 'Mobile Number'}
                </Typography>
                <Typography sx={{ color: 'red' }}>*</Typography>
              </Box>
              <TextInput
                value={mobilenumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (/^[0-9]*$/.test(e.target.value) && e.target.value.length <= 10) {
                    Setmobilenumber(e.target.value);
                  }
                }}
                sx={{ marginVertical: '1.5vh' }}
              />

              <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: '2vh', marginBottom: '1vh' }}>
                <Typography sx={{ color: Colors.DarkBrown, fontWeight: 'bold' }}>
                  {t('AddNewParty.ShopType') || 'Shop Type'}
                </Typography>
                <Typography sx={{ color: 'red' }}>*</Typography>
              </Box>
              <Dropdown
                data={shoptype123}
                label={'value'}
                placeHolder={'Select Shop Type'}
                selectedValue={selecteShoptype?.value}
                onPressItem={(val: any) => setselecteShoptype(val)}
              />

              <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: '2vh', marginBottom: '1vh' }}>
                <Typography sx={{ color: Colors.DarkBrown, fontWeight: 'bold' }}>
                  {t('AddNewParty.ShopArea') || 'Shop Area'}
                </Typography>
                <Typography sx={{ color: 'red' }}>*</Typography>
              </Box>
              <Dropdown
                data={[]} // TODO: Get shop area data
                label={'value'}
                placeHolder={'Select Shop Area'}
                selectedValue={selecteShopArea?.value}
                onPressItem={(val: any) => setselecteShopArea(val)}
              />

              <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: '2vh', marginBottom: '1vh' }}>
                <Typography sx={{ color: Colors.DarkBrown, fontWeight: 'bold' }}>
                  {t('AddNewParty.RegistrationNo') || 'Registration No'}
                </Typography>
                <Typography sx={{ color: 'red' }}>*</Typography>
              </Box>
              <TextInput
                value={registrationno}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => Setregistrationno(e.target.value)}
                sx={{ marginVertical: '1.5vh' }}
              />
            </Box>
          </CustomSafeView>

          <Button
            onClick={register}
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
              {t('AddNewParty.Register') || 'Register'}
            </Typography>
          </Button>
        </Box>
      </CustomSafeView>
    </>
  );
}

export default AddNewShop2;


