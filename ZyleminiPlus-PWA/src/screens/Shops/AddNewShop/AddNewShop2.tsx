import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
} from '@mui/material';
import { Check } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import moment from 'moment';

import {
  insertNewPartyImages,
  insertNewShopnewpartyoutlet,
  insertuses_log,
} from '../../../database/WebDatabaseHelpers';
import CustomSafeView from '../../../components/GlobalComponent/CustomSafeView';
import { useGlobleAction } from '../../../redux/actionHooks/useGlobalAction';
import { useLoginAction } from '../../../redux/actionHooks/useLoginAction';
import { Colors } from '../../../theme/colors';
import Header from '../../../components/Header/Header';
import Dropdown from '../../../components/Dropdown/Dropdown';
import { getAppOrderId, getCurrentDateTime, getCurrentDate } from '../../../utility/utils';
import { ScreenName } from '../../../constants/screenConstants';
import { useSyncNow } from '../../../hooks/useSyncNow';
import { useNetInfo } from '../../../hooks/useNetInfo';
import Loader from '../../../components/Loader/Loader';
import { useOrderAction } from '../../../redux/actionHooks/useOrderAction';
import useDialog from '../../../hooks/useDialog';
import ConfirmDialog from '../../../components/Dialog/ConfirmDialog';

function AddNewShop2() {
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const params = routerLocation.state || {};

  const { isDarkMode, isLogWritingEnabled, isSyncImmediate } = useGlobleAction();
  const { userId } = useLoginAction();
  const { t } = useTranslation();
  const { propsData } = useOrderAction();
  const { isNetConnected } = useNetInfo();
  const { doSync } = useSyncNow();
  const { dialogState, showDialog, hideDialog, handleConfirm } = useDialog();

  const [name, Setname] = useState('');
  const [mobilenumber, Setmobilenumber] = useState('');
  const [selecteShoptype, setselecteShoptype] = useState<any>(null);
  const [selecteShopArea, setselecteShopArea] = useState<any>(null);
  const [registrationno, Setregistrationno] = useState('');
  const [isLoading, setisLoading] = useState(false);

  const shoptype123 = [
    { value: 'Shop 1' },
    { value: 'Shop 2' },
  ];

  const register = async () => {
    const curentDatetime = await getCurrentDate();
    const getCurrentdatetimestamp = await getCurrentDateTime();
    
    isLogWritingEnabled &&
      insertuses_log(
        `Shop Registered ${params.outletname}`,
        getCurrentdatetimestamp,
        'False',
      );

    const currentDateTimeFilename = getCurrentdatetimestamp + '.jpg';

    console.log(
      name,
      mobilenumber,
      selecteShoptype?.value,
      selecteShopArea?.value,
      registrationno,
    );

    if (
      name &&
      mobilenumber &&
      selecteShoptype?.value &&
      selecteShopArea?.value &&
      registrationno &&
      mobilenumber.length === 10
    ) {
      try {
        await insertNewShopnewpartyoutlet(
          params.appOrderId,
          params.Beatid,
          params.outletname,
          mobilenumber,
          params.ownername,
          params.Address,
          '',
          params.latitude,
          params.longitude,
          'N',
          curentDatetime,
          selecteShoptype?.value,
          registrationno,
          params.appOrderId,
          name,
          selecteShopArea?.value,
          userId,
        );

        showDialog(
          t('Success'),
          t('Alerts.AlertShopAddedSuccessfullyMsg'),
          async () => {
            try {
              setisLoading(true);
              if (isSyncImmediate && (isNetConnected || isNetConnected === null)) {
                await doSync({
                  loaderState: (val: boolean) => {
                    setisLoading(val);
                  },
                });
              }
              
              // Navigate back to shops list or dashboard
              if (propsData?.isFromShop) {
                navigate(`/${ScreenName.SHOPS}/${ScreenName.SHOPSFRONT}`);
              } else {
                navigate(`/${ScreenName.MAINSCREEN}/${ScreenName.DASHBOARD}`);
              }
            } catch (error) {
              console.error('Error during sync or navigation:', error);
            } finally {
              setisLoading(false);
            }
          },
          'success'
        );
      } catch (error) {
        console.error('Error registering shop:', error);
        showDialog(
          t('Error'),
          t('Failed to register shop'),
          () => {},
          'error'
        );
      }
    } else {
      showDialog(
        t('Validation Error'),
        t('Alerts.AlertShopSelectAllFeildsMsg'),
        () => {},
        'warning'
      );
    }
  };

  const onShoptypeChange = async (val: any) => {
    setselecteShoptype(val);
  };

  const onShopareaChange = async (val: any) => {
    setselecteShopArea(val);
  };

  return (
    <CustomSafeView edges={['bottom']}>
      <Loader visible={isLoading} />
      <Header
        title={t('AddNewParty.AddNewPartyTitle')}
        navigation={{ goBack: () => navigate(-1) }}
      />

      <Box sx={{ flex: 1, p: 3, pb: 10 }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          {/* Contact Person Name */}
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ mb: 1, fontWeight: 600, color: Colors.textPrimary }}>
              {t('AddNewParty.name')}
              <Typography component="span" sx={{ color: 'red', ml: 0.5 }}>
                *
              </Typography>
            </Typography>
            <TextField
              fullWidth
              value={name}
              onChange={(e) => Setname(e.target.value)}
              placeholder={t('Enter contact person name')}
              variant="outlined"
            />
          </Box>

          {/* Mobile Number */}
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ mb: 1, fontWeight: 600, color: Colors.textPrimary }}>
              {t('AddNewParty.mobilenumber')}
              <Typography component="span" sx={{ color: 'red', ml: 0.5 }}>
                *
              </Typography>
            </Typography>
            <TextField
              fullWidth
              value={mobilenumber}
              onChange={(e) => {
                const txt = e.target.value;
                if (/^\d{0,10}$/.test(txt)) {
                  Setmobilenumber(txt);
                }
              }}
              placeholder={t('Enter 10 digit mobile number')}
              variant="outlined"
              type="tel"
              inputProps={{ maxLength: 10 }}
              helperText={mobilenumber.length > 0 && mobilenumber.length < 10 ? t('Mobile number must be 10 digits') : ''}
              error={mobilenumber.length > 0 && mobilenumber.length < 10}
            />
          </Box>

          {/* Shop Type */}
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ mb: 1, fontWeight: 600, color: Colors.textPrimary }}>
              {t('AddNewParty.shoptype')}
              <Typography component="span" sx={{ color: 'red', ml: 0.5 }}>
                *
              </Typography>
            </Typography>
            <Dropdown
              data={shoptype123}
              label={'value'}
              selectedListIsScrollView={true}
              placeHolder={'Select Shop Type'}
              selectedValue={selecteShoptype?.value}
              onPressItem={(val: any) => {
                onShoptypeChange(val);
              }}
            />
          </Box>

          {/* Shop Area */}
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ mb: 1, fontWeight: 600, color: Colors.textPrimary }}>
              {t('AddNewParty.shoparea')}
              <Typography component="span" sx={{ color: 'red', ml: 0.5 }}>
                *
              </Typography>
            </Typography>
            <Dropdown
              data={shoptype123}
              label={'value'}
              selectedListIsScrollView={true}
              placeHolder={'Select Shop Area'}
              selectedValue={selecteShopArea?.value}
              onPressItem={(val: any) => {
                onShopareaChange(val);
              }}
            />
          </Box>

          {/* Registration Number */}
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ mb: 1, fontWeight: 600, color: Colors.textPrimary }}>
              {t('AddNewParty.registrationno')}
              <Typography component="span" sx={{ color: 'red', ml: 0.5 }}>
                *
              </Typography>
            </Typography>
            <TextField
              fullWidth
              value={registrationno}
              onChange={(e) => {
                const txt = e.target.value;
                if (/^[A-Za-z0-9]*$/.test(txt)) {
                  Setregistrationno(txt);
                }
              }}
              placeholder={t('Enter registration number')}
              variant="outlined"
            />
          </Box>

          {/* Register Button */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<Check />}
            onClick={register}
            sx={{
              mt: 2,
              py: 1.5,
              backgroundColor: Colors.primary,
              '&:hover': {
                backgroundColor: Colors.primaryDark,
              },
            }}
          >
            {t('Register Shop')}
          </Button>
        </Paper>
      </Box>

      <ConfirmDialog
        open={dialogState.open}
        onClose={hideDialog}
        onConfirm={handleConfirm}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        variant={dialogState.variant}
      />
    </CustomSafeView>
  );
}

export default AddNewShop2;
