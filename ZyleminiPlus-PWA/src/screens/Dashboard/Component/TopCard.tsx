// Web-adapted TopCard component - Simplified version
import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../../theme/colors';
import { DashboardImg } from '../../../constants/AllImages';
import { CustomFontStyle } from '../../../theme/typography';
import { useLoginAction } from '../../../redux/actionHooks/useLoginAction';
import { useGlobleAction } from '../../../redux/actionHooks/useGlobalAction';
import { useDashAction } from '../../../redux/actionHooks/useDashAction';
import CommonModal from './CommonModal';
import {
  attendanceList,
  getCurrentDateTimeT,
  writeActivityLog,
  writeErrorLog,
  isAccessControlProvided,
  updateAttandanceActivityInCacheAndReduxGeofencing,
} from '../../../utility/utils';
import { getOnlineParentAreaData } from '../../../database/WebDatabaseHelpers';
import { insertAttendance, onEndDAY } from '../Functions/AttendanceFunc';
import useLocation from '../../../hooks/useLocation';
import { useSyncNow } from '../../../hooks/useSyncNow';
import { useGetData } from '../../../hooks/useGetData';
import Loader from '../../../components/Loader/Loader';
import {
  AccessControlKeyConstants,
  ScreenName,
} from '../../../constants/screenConstants';
import geofenceCache from '../../../localstorage/geofenceCache';
import { useNetInfo } from '../../../hooks/useNetInfo';
import { useSyncNowAttendance } from '../../../hooks/useSyncNowAttendance';
import SyncProgressOverlay from '../../../components/Progress/SyncProgressOverlay';

interface props {
  navigation?: any;
  multiDivData?: any;
  isDataSynced?: boolean;
  lastSync?: string;
  SelectedDivison?: any;
  AttendanceMarked?: boolean;
  AttendanceEnd?: boolean;
  AttendanceDayEnd?: any;
  defaultDistributorId?: string | number;
}

function TopCard(props: props) {
  const {
    navigation,
    multiDivData,
    SelectedDivison,
    isDataSynced,
    lastSync,
    AttendanceMarked,
    AttendanceEnd,
    AttendanceDayEnd,
  } = props;
  
  const { t } = useTranslation();
  const { latitude, longitude } = useLocation();
  const { userName, userId } = useLoginAction();
  const {
    isMultiDivision,
    setParentEnabled,
    setSyncFlag,
    syncFlag,
    isParentUser,
    setSelectedAreaID,
    isShopCheckedIn,
    blockedShopName,
    isLogWritingEnabled,
    setIsShopCheckIn,
    persistedStartTime,
    setPersistStartTime,
    setBlockedShopDetail,
    meetingEndBlocker,
    getAccessControlSettings,
    geofenceGlobalSettingsAction,
    AttendanceOptions,
    setGeofenceGlobalSettingsAction,
  } = useGlobleAction();
  
  const { UserDetails } = useDashAction();
  const { doSync, syncProgress, isLoading: isSyncLoading } = useSyncNow();
  const [updateAttendanceUi, setUpdateAttendanceUi] = useState(0);
  const { doSyncAttendance } = useSyncNowAttendance();
  const { doGetData } = useGetData();
  const [locationArea, setLocationArea] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isloading, setIsloading] = useState(false);
  const [isLocationModal, setIsLocationModal] = useState(false);

  const onLocationIconPress = async () => {
    setIsLocationModal(true);
    if (isParentUser) {
      setModalVisible(true);
    }

    try {
      const { getOnlineParentAreaData } = await import('../../../database/WebDatabaseHelpers');
      const data: any = await getOnlineParentAreaData();
      setLocationArea(data);
    } catch (err) {
      writeErrorLog('getOnlineParentAreaData', err);
    }
  };

  const onAttendanceIconPress = async () => {
    isLogWritingEnabled && writeActivityLog(`Attendance Marked`);
    if (!AttendanceMarked) {
      setIsLocationModal(false);
      setModalVisible(true);
    } else if (AttendanceEnd && AttendanceMarked) {
      const confirmed = window.confirm(
        `${t('Alerts.AlertEndYourDayTitle')}\n${t('Alerts.AlertEndYourDayMsg')}`
      );
      
      if (confirmed) {
        await onEndDAY(userId, latitude, longitude);
        isLogWritingEnabled && writeActivityLog(`Attendance Out`);
        await doSyncAttendance({
          loaderState: (val: boolean) => {
            setIsloading?.(val);
          },
          callBack: () => {
            setUpdateAttendanceUi(updateAttendanceUi + 1);
          },
        });
      }
    }
  };

  async function doInsertAttendance(selectedItem: string) {
    await insertAttendance(selectedItem, userId, latitude, longitude, t);
    if (geofenceGlobalSettingsAction) {
      await updateAttandanceActivityInCacheAndReduxGeofencing(
        geofenceGlobalSettingsAction,
        geofenceCache.storeGeofenceSettingsCache,
        setGeofenceGlobalSettingsAction!,
        true,
      );
    }
    setModalVisible(false);
    await doSyncAttendance({
      loaderState: (val: boolean) => {
        setIsloading(val);
      },
      callBack: () => {
        setUpdateAttendanceUi(updateAttendanceUi + 1);
      },
    });
  }

  const insertArea = async (selectedItem: any) => {
    setParentEnabled(false);
    setModalVisible(false);
    await setSelectedAreaID(selectedItem?.AreaId);

    await doSync({
      loaderState: (val: boolean) => {
        setIsloading(val);
      },
    });
    
    await doGetData({
      isFromScreen: true,
      loaderState: (val: boolean) => {
        setIsloading(val);
      },
      isAreaIdChanged: true,
      changedAreaId: selectedItem?.AreaId,
    });

    setModalVisible(false);
    setSyncFlag(!syncFlag);
  };

  return (
    <>
      <Loader visible={isloading} />
      <SyncProgressOverlay
        visible={!!syncProgress}
        progress={syncProgress || { current: 0, total: 100, message: '' }}
        isSideMenu={false}
      />
      
      <Box
        sx={{
          backgroundColor: Colors.mainBackground,
          padding: '10px',
          paddingBottom: '25px',
          borderBottomLeftRadius: isMultiDivision ? 0 : '35px',
          borderBottomRightRadius: isMultiDivision ? 0 : '35px',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1vh',
            marginBottom: '0.8vh',
          }}
        >
          <IconButton
            onClick={() => {
              navigation?.toggleDrawer();
            }}
            sx={{ color: Colors.white }}
          >
            <img
              src={DashboardImg.sideMenu}
              alt="Menu"
              style={{ height: '3vh', width: '6vw' }}
            />
          </IconButton>

          <Box sx={{ display: 'flex', flexDirection: 'row', gap: '1vw' }}>
            {isAccessControlProvided(
              getAccessControlSettings,
              AccessControlKeyConstants.DASHBOARD_MARK_ATTENDANCE,
            ) && (
              <Tooltip title={t('Dashboard.MarkAttendance') || 'Mark Attendance'}>
                <IconButton onClick={onAttendanceIconPress} sx={{ color: Colors.white }}>
                  {AttendanceDayEnd?.length > 0 ? (
                    DashboardImg.fingerEndDay
                  ) : AttendanceMarked ? (
                    DashboardImg.fingerOut1
                  ) : (
                    <img
                      src={DashboardImg.fingerOuts}
                      alt="Attendance"
                      style={{ height: '4.2vh', width: '7.5vw' }}
                    />
                  )}
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title={isDataSynced ? 'Synced' : 'Not Synced'}>
              <IconButton
                onClick={() => {
                  // Refresh data
                  console.log('Refresh data');
                }}
                sx={{ color: Colors.white }}
              >
                <img
                  src={isDataSynced ? DashboardImg.greenSync : DashboardImg.redSync}
                  alt="Sync"
                  style={{ height: '4vh', width: '7vw', margin: '0 3.5vw' }}
                />
              </IconButton>
            </Tooltip>

            <Tooltip title={t('Dashboard.Location') || 'Location'}>
              <IconButton
                onClick={onLocationIconPress}
                sx={{ color: Colors.white }}
              >
                <img
                  src={DashboardImg.location}
                  alt="Location"
                  style={{ height: '4.2vh', width: '7.5vw' }}
                />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ marginLeft: '1.6vw', marginTop: '1vh' }}>
          <Typography sx={CustomFontStyle().greatingDash}>
            {t('Common.Hello')}, {userName}
          </Typography>

          {!isAccessControlProvided(
            getAccessControlSettings,
            AccessControlKeyConstants.SIDE_MENU_POD,
          ) && (
            <Box sx={{ display: 'flex', flexDirection: 'row', marginTop: '0.8vh' }}>
              <Typography sx={[CustomFontStyle().topDashCard, { marginTop: '0.8vh' }]}>
                {t('Dashboard.LastSync')},{' '}
              </Typography>
              <Typography
                sx={[
                  CustomFontStyle().topDashCard,
                  { color: Colors.white, marginTop: '0.8vh' },
                ]}
              >
                {lastSync}
              </Typography>
            </Box>
          )}

          {isAccessControlProvided(
            getAccessControlSettings,
            AccessControlKeyConstants.DASHBOARD_MARK_ATTENDANCE,
          ) &&
            updateAttendanceUi !== undefined && (
              <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                <Typography sx={CustomFontStyle().topDashCard}>
                  {t('Dashboard.Attendance')},{' '}
                </Typography>
                <Typography
                  sx={[CustomFontStyle().topDashCard, { color: Colors.white }]}
                >
                  {UserDetails?.Attendance_at || 'Not marked'}
                </Typography>
              </Box>
            )}
        </Box>

        <CommonModal
          isModalOpen={modalVisible}
          isLocationOpen={isLocationModal}
          modalData={
            isLocationModal
              ? locationArea
              : AttendanceOptions?.length > 0
              ? AttendanceOptions
              : attendanceList
          }
          ddlabel={isLocationModal ? 'Area' : 'name'}
          onPress={(val: boolean) => {
            setModalVisible(val);
          }}
          onConfirm={(selectedItem: any) => {
            isLocationModal
              ? insertArea(selectedItem)
              : doInsertAttendance(selectedItem);
          }}
          modalTitle={
            isLocationModal
              ? t('Dashboard.ConfirmLoc')
              : t('Dashboard.MarkAttendance')
          }
          icon={
            isLocationModal ? DashboardImg.locationIn : DashboardImg.fingerIn
          }
          dropdownTitle={
            isLocationModal
              ? t('Dashboard.ChooseArea')
              : t('Dashboard.StartDay')
          }
        />
      </Box>
    </>
  );
}

export default TopCard;

