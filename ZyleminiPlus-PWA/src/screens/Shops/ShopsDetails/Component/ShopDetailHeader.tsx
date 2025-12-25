// Web-adapted ShopDetailHeader component - preserving exact UI and logic
import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Colors } from '../../../../theme/colors';
import { useGlobleAction } from '../../../../redux/actionHooks/useGlobalAction';
import { ShopImgs, globalImg } from '../../../../constants/AllImages';
import { CustomFontStyle } from '../../../../theme/typography';
import {
  getAppOrderId,
  getCurrentDate,
  getCurrentDateTime,
  writeActivityLog,
  writeErrorLog,
  getTodaysEndTime,
  getCurrentDateTimeT,
  isAccessControlProvided,
  COLLECTION_TYPE,
} from '../../../../utility/utils';
import {
  SelectCustForDist,
  getOrderIdForShop,
  getSearchREMARK,
  insertRecordInOrderMasterForShopCheckIn,
  updateCheckoutOrderMasterWOStart,
} from '../../../../database/WebDatabaseHelpers';
import { useLoginAction } from '../../../../redux/actionHooks/useLoginAction';
import useLocation from '../../../../hooks/useLocation';
import moment from 'moment';
import CheckOutModal from './CheckOutModal';
import { AccessControlKeyConstants } from '../../../../constants/screenConstants';
import { useSyncNow } from '../../../../hooks/useSyncNow';
import { useNetInfo } from '../../../../hooks/useNetInfo';
import Loader from '../../../../components/Loader/Loader';

interface HeaderProps {
  onPress?: any;
  navigation?: any;
  selectedShopDetail?: any;
}

const ShopDetailHeader = (props: HeaderProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { onPress, selectedShopDetail } = props;
  const {
    isDarkMode,
    isShopCheckedIn,
    setIsShopCheckIn,
    persistedStartTime,
    setPersistStartTime,
    setBlockedShopDetail,
    isLogWritingEnabled,
    getAccessControlSettings,
    isSyncImmediate,
  } = useGlobleAction();
  const { userId } = useLoginAction();
  const { latitude, longitude } = useLocation();

  const [DistributorId, setDistributorId] = useState('');
  const [isRemarkMandatory, setIsRemarkMandatory] = useState('FALSE');
  const [checkOutRemark, setCheckOutRemark] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const { isNetConnected } = useNetInfo();
  const { doSync } = useSyncNow();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    takeDistId();
  }, []);

  const takeDistId = async () => {
    try {
      const DistributorId = await SelectCustForDist(
        selectedShopDetail?.shopId,
        userId,
      );
      setDistributorId(DistributorId[0]?.DefaultDistributorId);

      const isRemarkMandate = await getSearchREMARK();
      setIsRemarkMandatory(isRemarkMandate[0]?.Value);
    } catch (error) {
      writeErrorLog('takeDistId', error);
      console.log('error while taking data from db shop header-->', error);
    }
  };

  const checkINButtonPress = async (partyName: string, shopId: string) => {
    setIsShopCheckIn(!isShopCheckedIn);
    const curDateTime = await getCurrentDateTimeT();
    const curDate = await getCurrentDate();
    const app_order_id = await getAppOrderId(userId);
    if (isLogWritingEnabled) {
      writeActivityLog(`Checked In: ${shopId}`);
    }

    try {
      await insertRecordInOrderMasterForShopCheckIn(
        app_order_id,
        curDateTime,
        '1',
        shopId,
        latitude,
        longitude,
        '0',
        curDateTime,
        curDateTime,
        COLLECTION_TYPE.VISITED_SHOPS,
        userId,
        '1',
        'N',
        '',
        curDate,
        DistributorId,
        curDate,
        '0',
        curDateTime,
        getTodaysEndTime(),
        userId,
      );
      setPersistStartTime(curDateTime);
      setBlockedShopDetail({
        partyName: `Please Check-Out first from ${partyName}`,
        shopId,
        fromShopCheckout: true,
      });
    } catch (err) {
      writeErrorLog('takeDistId', err);
    }
  };

  const onConfirmCheckOut = (remark: string) => {
    if (remark.length > 0) {
      CheckOutFunc(selectedShopDetail?.shopId, remark);
    } else {
      window.alert(t('Alerts.AlertEnterVisitMarkMsg') || 'Please enter visit remark');
    }
  };

  const checkOutButtonPress = async (shopId: string) => {
    if (isLogWritingEnabled) {
      writeActivityLog(`Checked Out: ${shopId}`);
    }
    if (isRemarkMandatory === 'TRUE') {
      setModalVisible(true);
    } else {
      CheckOutFunc(shopId);
    }
  };

  const CheckOutFunc = async (shopId: string, isRemark?: string) => {
    const curDateTime = await getCurrentDateTime();
    const curDate = await getCurrentDate();

    try {
      const appID = await getOrderIdForShop(
        shopId,
        moment(persistedStartTime).format('DD-MMM-YYYY'),
      );
      await updateCheckoutOrderMasterWOStart(
        appID[0].id,
        '4',
        shopId,
        curDate,
        curDateTime,
        latitude,
        longitude,
        isRemark ? isRemark : checkOutRemark,
      );
      setModalVisible(false);
      setPersistStartTime('');
      setBlockedShopDetail({});
      setIsShopCheckIn(!isShopCheckedIn);
      
      const confirmed = window.confirm(
        t('Alerts.AlertSuccessfullyCheckOutMsg') || 'Successfully Checked Out'
      );
      
      if (confirmed) {
        if (
          isSyncImmediate &&
          (isNetConnected || isNetConnected === null)
        ) {
          try {
            await doSync({
              loaderState: (val: boolean) => {
                setIsLoading?.(val);
              },
            });
            navigate(-1);
          } catch (error) {
            console.error('Sync failed:', error);
            navigate(-1);
          }
        } else {
          navigate(-1);
        }
      }
    } catch (err) {
      writeErrorLog('CheckOutFunc', err);
      console.log('update err', err);
    }
  };

  return (
    <>
      <Loader visible={isLoading} />
      <Box sx={styles().mainContainer}>
        <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: '5px' }}>
          <IconButton
            onClick={() => {
              onPress();
              if (isShopCheckedIn) {
                window.alert(t('Alerts.AlertPleaseCheckOutFirst') || 'Please Check-Out first');
              } else {
                navigate(-1);
              }
            }}
            sx={{ marginLeft: '2vw', color: Colors.white }}
          >
            {globalImg.BackArrow}
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: '5px' }}>
          {isAccessControlProvided(
            getAccessControlSettings,
            AccessControlKeyConstants.SHOP_DETAILS_CHECKIN_CHECKOUT,
          ) ? (
            isShopCheckedIn ? (
              <Button
                onClick={() => {
                  checkOutButtonPress(selectedShopDetail?.shopId);
                }}
                sx={styles().checkInLableBGStyle}
              >
                <Typography sx={styles().checkInLabelTextStyle}>
                  {t('Shops.ChecKOut') || 'Check Out'}
                </Typography>
              </Button>
            ) : (
              <Button
                onClick={() => {
                  checkINButtonPress(
                    selectedShopDetail?.party,
                    selectedShopDetail?.shopId,
                  );
                }}
                sx={styles().checkInLableBGStyle}
              >
                <Typography sx={styles().checkInLabelTextStyle}>
                  {t('Shops.CheckIn') || 'Check In'}
                </Typography>
              </Button>
            )
          ) : null}
          <Box sx={{ marginHorizontal: '3vw' }}>
            {globalImg.editVerticalDot}
          </Box>
        </Box>
      </Box>

      <CheckOutModal
        isModalOpen={modalVisible}
        onPress={(val: boolean) => {
          setModalVisible(val);
        }}
        onConfirm={(remark: string) => {
          onConfirmCheckOut(remark);
        }}
      />
    </>
  );
};

const styles = (isDarkMode?: boolean | undefined) => ({
  mainContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.mainBackground,
    height: 'auto',
    padding: '1vh',
    alignItems: 'center',
  },
  checkInLableBGStyle: {
    backgroundColor: Colors.PinkColor,
    justifyContent: 'center',
    marginRight: '3vh',
    borderColor: Colors.PinkColor,
    height: '4vh',
    width: '23vw',
    borderRadius: '5vw',
    textTransform: 'none',
  },
  checkInLabelTextStyle: {
    alignSelf: 'center',
    color: Colors.white,
    fontFamily: 'Proxima Nova, sans-serif',
    fontSize: '12px',
    fontWeight: 'bold',
  },
});

export default ShopDetailHeader;


