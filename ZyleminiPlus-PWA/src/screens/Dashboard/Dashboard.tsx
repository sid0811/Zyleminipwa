// Web-adapted Dashboard screen - Simplified version
import React, { useEffect, useState } from 'react';
import { Box, Drawer } from '@mui/material';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

import {
  getAppsideLogWriting,
  getAttendance,
  getAttendance2,
  getDataDistributorMaster,
  getDataDistributorMasterFirst,
  getForAutosync,
  getLastSync,
  getTotalOrdersOfOrderMAsternotsync,
  getForSyncOnActivity,
  getAttendanceEndDay,
  getAttendanceSettings,
  getOrderConfirmFlag,
  getAppsExtShare,
} from '../../database/WebDatabaseHelpers';
import {
  getCurrentDate,
  getCurrentDateTime,
  isValidvalue,
  writeErrorLog,
  isAccessControlProvided,
  getTimeWithFormat,
  formatToIST,
} from '../../utility/utils';
import { Colors } from '../../theme/colors';

import { useGlobleAction } from '../../redux/actionHooks/useGlobalAction';
import { useLoginAction } from '../../redux/actionHooks/useLoginAction';
import { useDashAction } from '../../redux/actionHooks/useDashAction';
import { useNetInfo } from '../../hooks/useNetInfo';
import { useAuthentication } from '../../hooks/useAuthentication';
import { useSyncNow } from '../../hooks/useSyncNow';

import CustomSafeView from '../../components/GlobalComponent/CustomSafeView';
import TopCard from './Component/TopCard';
import { dashGraph } from '../../api/DashboardAPICalls';

import Dropdown from '../../components/Dropdown/Dropdown';
import Loader from '../../components/Loader/Loader';
import useLocation from '../../hooks/useLocation';
import {
  ScreenName,
  VERSION_DETAIL,
  AccessControlKeyConstants,
  DEFAULT_TAB_NAMES,
} from '../../constants/screenConstants';
import {
  appVersionInformation,
  operatingSystemsVersion,
  systemIsTablet,
  systemsName,
} from '../../utility/deviceManager';
import LocationPermissionAlert from '../../components/Alert/LocationPermissionAlert';
import { useGeofenceAction } from '../../redux/actionHooks/useGeofenceAction';
import BackgroundPermissionAlert from '../../components/Alert/BackgroundPermissionAlert';
import ToggleNavBar from '../../components/Buttons/ToggleNavBar';
import { ReportName } from '../../utility/utils';
import ReportCard from './UserPerformance/ReportCard';
import { useLocationAction } from '../../redux/actionHooks/useLocationAction';
import { useAuthenticationVersionCheck } from '../../hooks/useAuthenticationVersoinCheck';
import { AUTH_ENDPOINTS } from '../../constants/APIEndPoints';
import { postNDAConsentData } from '../../api/NDAConsentAPICalls';
import cacheStorage from '../../localstorage/secureStorage';
import { NotificationKeys } from '../../constants/asyncStorageKeys';
import useCheckAppStateCurrent from '../../hooks/useCheckAppStateCurrent';
import { requestUserPermission } from '../../notifications/notificationsUtils';
import TeamPerformanceReport from './ManagerDashboard/TeamPerformanceReport';
import SideMenuList from '../SideMenu/SideMenuList';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const { isNetConnected } = useNetInfo();
  const { appStateVisible } = useCheckAppStateCurrent();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const toggleDrawer = (open: boolean) => {
    setDrawerOpen(open);
  };

  // Create navigation adapter for SideMenuList (converts React Router to React Navigation-like API)
  const navigationAdapter = {
    navigate: (screenName: string, params?: any) => {
      // Close drawer when navigating
      toggleDrawer(false);
      
      // Convert ScreenName enum values to routes
      const routeMap: Record<string, string> = {
        [ScreenName.SHOPS]: '/shops',
        [ScreenName.POD]: '/pod',
        [ScreenName.DATACOLLECTION]: '/datacollection',
        [ScreenName.DATACARDS]: '/datacards',
        [ScreenName.ORDERS]: '/orders',
        [ScreenName.CREATEMEETONE]: '/activity',
        [ScreenName.COLLECTIONS]: '/collections',
        [ScreenName.SURVEYTABNAV]: '/surveys',
        [ScreenName.RESOURCES]: '/resources',
        [ScreenName.REPORTS]: '/reports',
        [ScreenName.ADVACEREPORTMAIN]: '/advance-reports',
        [ScreenName.SOS]: '/sos',
      };
      
      const route = routeMap[screenName] || `/${screenName.toLowerCase()}`;
      navigate(route, { state: params });
    },
  };
  const {
    syncFlag,
    isParentUser,
    isMultiDivision,
    lastExecutionTime,
    setLastExecTime,
    isDarkMode,
    geofenceGlobalSettingsAction,
    setGeofenceGlobalSettingsAction,
    isLogWritingEnabled,
    setLogWritingEnabled,
    setIsShopCheckIn,
    getAccessControlSettings,
    setIsSyncImmediateAction,
    isSyncImmediate,
    setIsNavigationSourceShopsAction,
    AttendanceOptions,
    setAttendanceOptionsAction,
    externalShare,
    setExternalShare,
    setOrderConfirmationSignatureAction,
    OrderConfirmationSignature,
  } = useGlobleAction();
  
  const {
    isLocationGranted,
    setIsLocationGranted,
    setGlobalLocation,
    isBGLocationGranted,
  } = useLocationAction();
  
  const globalActions = useGlobleAction();
  const { doSync, syncProgress, isLoading: isSyncLoading } = useSyncNow();
  const [enabled, setEnabled] = useState(
    geofenceGlobalSettingsAction?.IsGeoFencingEnabled,
  );

  const [location, setLocation] = useState('');
  const [selectedTab, setSelectedTab] = useState(ReportName.dashboard);
  const [dayUserEnd, setdayUserEnd] = useState([]);

  const {
    setGeofenceEvents,
    geofenceEvents,
    setRemoveExitedGeofenceEvents,
    setGeofenceEventsReducerToEmptyEvent,
  } = useGeofenceAction();

  let isDASHBOARD_PERFORMANCE_REPORT = isAccessControlProvided(
    getAccessControlSettings,
    AccessControlKeyConstants.DASHBOARD_PERFORMANCE_REPORT,
  );

  let isDASHBOARD = isAccessControlProvided(
    getAccessControlSettings,
    AccessControlKeyConstants.DASHBOARD,
  );

  useEffect(() => {
    setAccessControlData();
  }, [syncFlag]);

  const {
    setUserDetails,
    setSalesTrend,
    SelectedDivison,
    setSelectedDivision,
    AttendanceIn,
    setIsAttDone,
    AttendanceOut,
    setIsAttendOut,
    setBase64Strings,
    base64,
    setConsentApiVersion,
    setConsentAppVersion,
    ConsentApiVersion,
    ConsentAppVersion,
  } = useDashAction();

  // Web: Use useEffect instead of useFocusEffect
  useEffect(() => {
    lastSyncCheck();
    checkIsSync();
    checkIsAttendanceDone();
    getUserDayEndData();
  }, [syncFlag, setLastExecTime]);

  const setAccessControlData = () => {
    SyncOnActivity();
    getExtShareFlag();
    getSingatureFlag();
    getAttendanceOptions();
    getApiCallForImage();
    setSelectedTab(
      isAccessControlProvided(
        getAccessControlSettings,
        AccessControlKeyConstants.DASHBOARD,
      )
        ? ReportName.dashboard
        : ReportName.perfReport,
    );
  };

  const checkIsSync = async () => {
    try {
      setTimeout(async () => {
        const isSynced = await getTotalOrdersOfOrderMAsternotsync();
        setIsDataSynced(isSynced[0]?.TotalCount === 0);
      }, 300);
    } catch (error) {
      writeErrorLog('checkIsSync', error);
    }
  };

  const getUserDayEndData = async (): Promise<void> => {
    try {
      const date: string = await getCurrentDate();
      const newData: any = await getAttendanceEndDay(date);
      setdayUserEnd((prevData: any) => {
        if (JSON.stringify(prevData) !== JSON.stringify(newData)) {
          return newData;
        }
        return prevData;
      });
    } catch (err) {
      writeErrorLog('getAttendanceEndDay', err);
    }
  };

  const checkIsAttendanceDone = async () => {
    try {
      const datee1 = await getCurrentDate();
      setTimeout(async () => {
        await getAttendance(datee1).then((data) => {
          if (data.length <= 0) {
            setIsAttDone(false);
          } else {
            setIsAttDone(true);
            getAttendance2(datee1).then((data1) => {
              if (data1.length <= 0) {
                setIsAttendOut(true);
              } else {
                setIsAttendOut(false);
              }
            });
          }
        });
      }, 300);
    } catch (error) {
      writeErrorLog('checkIsAttendanceDone', error);
    }
  };

  const onDDItemChange = (selectedValue: any) => {
    setSelectedDivision(selectedValue);
    // setUserId(selectedValue?.UserId); // TODO: Add setUserId if needed
  };

  useEffect(() => {
    getGraphData();
  }, [syncFlag]);

  const syncDataforNormalSyncSetting = async () => {
    await getForAutosync().then((data1: any) => {
      if (data1[0]?.Value !== '0') {
        doSync({
          loaderState: (val: boolean) => {
            setIsloading?.(val);
          },
        });
      }
    });
  };

  const getApiCallForImage = async () => {
    try {
      if (!base64 || base64.trim() === '') {
        const { getImageData } = await import('../../api/ImagesAPIcalls');
        const getImageProfile = await getImageData(userId, enteredUserName);
        if (getImageProfile?.ImageBytes) {
          setBase64Strings(getImageProfile.ImageBytes);
        } else {
          console.log('No Image');
        }
      } else {
        console.log('Base64 string already exists, skipping API call.');
      }
    } catch (error) {
      console.error('Error fetching image data:', error);
    }
  };

  const SyncOnActivity = async () => {
    setIsNavigationSourceShopsAction(false);
    await getForSyncOnActivity()
      .then((data: any) => {
        if (data && data.length > 0) {
          if (data[0].Value == '1') {
            setIsSyncImmediateAction(true);
          } else {
            setIsSyncImmediateAction(false);
          }
        }
      })
      .catch((error: any) => {
        console.error('Error fetching sync data:', error);
      });
  };

  const getSingatureFlag = async (retryCount = 0, maxRetries = 3) => {
    try {
      const data = await getOrderConfirmFlag();
      if (data && data.length > 0 && data[0]?.Value !== undefined) {
        setOrderConfirmationSignatureAction(
          data[0]?.Value.toLowerCase() === 'true',
        );
      } else if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 500;
        setTimeout(() => getSingatureFlag(retryCount + 1, maxRetries), delay);
      }
    } catch (error) {
      console.error('Error fetching signature flag:', error);
      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => getSingatureFlag(retryCount + 1, maxRetries), delay);
      }
    }
  };

  const getAttendanceOptions = async () => {
    await getAttendanceSettings()
      .then((data: any) => {
        if (data && data.length > 0) {
          const rawString = data[0].Value;
          let fixedString = rawString
            .replace(/(\w+):/g, '"$1":')
            .replace(/'/g, '"')
            .replace(/,\s*]/g, ']');
          try {
            const stringArray = JSON.parse(fixedString);
            setAttendanceOptionsAction(stringArray);
          } catch (parseError) {
            console.error('JSON parse error after fixing:', parseError);
          }
        }
      })
      .catch((error: any) => {
        console.error('Error fetching sync data:', error);
      });
  };

  const doAuthentication = async () => {
    const FcmToken = await requestUserPermission();
    doAuth({
      user: enteredUserName,
      password: userPassword,
      SCode: savedClientCode,
      deviceID: deviceId,
      FcmToken: FcmToken,
      t,
    });
  };

  const lastSyncCheck = async () => {
    setTimeout(async () => {
      const dataa = (await getLastSync() as unknown as any[]);
      setLastSync((dataa?.[0] as any)?.Value || 'Never');
    }, 2000);
  };

  const getExtShareFlag = async (retryCount = 0, maxRetries = 3): Promise<void> => {
    try {
      const data = await getAppsExtShare();
      if (data && data.length > 0 && data[0]?.Value !== undefined) {
        setExternalShare(!!data[0].Value);
      } else if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 500;
        setTimeout(() => getExtShareFlag(retryCount + 1, maxRetries), delay);
      }
    } catch (error) {
      console.error('Error fetching external share flag:', error);
      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => getExtShareFlag(retryCount + 1, maxRetries), delay);
      }
    }
  };

  const NDAConsentDataPost = async () => {
    try {
      const datetime = await getCurrentDateTime();
      const responseData = await postNDAConsentData(
        userId,
        latitude,
        longitude,
        datetime,
        VERSION_DETAIL,
        AUTH_ENDPOINTS.APP_API_VERSION,
      );
      if (responseData?.Message) {
        console.log('NDA Consent:', responseData?.Message);
      }
    } catch (error) {
      writeErrorLog('NDAConsentDataPost', error);
    }
  };

  const getGraphData = async () => {
    let apiversion: string | undefined = '';
    let appendedApiVersion: string | undefined = '';
    let token = await requestUserPermission();
    let getconsentApiversions: string | undefined = '';
    let getconsentAppversions: string | undefined = '';

    setFcmToken(token);
    try {
      const data = await getAppsideLogWriting();
      setLogWritingEnabled?.(data[0]?.Value === '1' ? true : false);
    } catch (error) {
      writeErrorLog('getAppsideLogWriting', error);
    }

    try {
      const graphData = await dashGraph({
        UserId: userId,
        UOM: '',
      });
      apiversion = graphData?.ApiVersion !== undefined ? graphData.ApiVersion : undefined;
      appendedApiVersion =
        graphData?.AppendVersion !== undefined ? graphData.AppendVersion : undefined;
      getconsentApiversions =
        graphData?.ConsentAPIVersion !== undefined ? graphData.ConsentAPIVersion : '';
      getconsentAppversions =
        graphData?.ConsentAppVersion !== undefined ? graphData.ConsentAppVersion : '';

      setUserDetails(graphData.UserDetails[0]);
      setConsentApiVersion(apiversion);
      setConsentAppVersion(getconsentAppversions);
      setSalesTrend(graphData.SalesTrend);
      
      if (getconsentAppversions === '' || VERSION_DETAIL !== getconsentAppversions) {
        NDAConsentDataPost();
      }
    } catch (error) {
      writeErrorLog('graphData', error);
    }

    setTimeout(() => {
      getLastSync().then((dataa: any) => {
        setLastSync(((dataa as unknown as any[])?.[0] as any)?.Value || 'Never');
      });
    }, 300);

    if (isMultiDivision) {
      getDataDistributorMaster().then((multi) => {
        setMultiData(multi);
      });

      if (isValidvalue(SelectedDivison)) {
        getDataDistributorMasterFirst(userId).then((multiFirst) => {
          setSelectedDivision(multiFirst[0]);
        });
      }
    }

    if (lastExecutionTime !== moment().format('DD-MMM-YYYY')) {
      if (isNetConnected === true || isNetConnected == null) {
        setIsShopCheckIn(false);
        syncDataforNormalSyncSetting();
        doAuthentication();
        setLastExecTime(moment().format('DD-MMM-YYYY'));
      }
    } else {
      if (
        savedApiVersion !== apiversion ||
        savedAppendApiVersion !== appendedApiVersion ||
        savedApiVersion === undefined
      ) {
        doAuthVersionCheck({
          user: enteredUserName,
          password: userPassword,
          SCode: savedClientCode,
          deviceID: deviceId,
          t,
        });
      }
    }
  };

  // Move all hooks to the top of the component
  const {
    userId,
    enteredUserName,
    userPassword,
    deviceId,
    savedClientCode,
    savedAppendApiVersion,
    savedApiVersion,
  } = useLoginAction();
  
  const { doAuth } = useAuthentication();
  const { doAuthVersionCheck } = useAuthenticationVersionCheck();
  const { t } = useTranslation();
  const { latitude, longitude } = useLocation();
  const [lastSync, setLastSync] = useState('');
  const [isDataSynced, setIsDataSynced] = useState(true);
  const [multiData, setMultiData] = useState<any[]>([]);
  const [isloading, setIsloading] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  const navigationItems = [
    {
      id: 'home',
      icon: 'layout',
      label: 'Home',
      component: <TeamPerformanceReport />,
    },
    {
      id: 'my_perf_rep',
      icon: 'bar-chart-2',
      label: 'Performance Report',
      component: <ReportCard />,
    },
  ];

  return (
    <>
      <Loader visible={isloading} />
      {geofenceGlobalSettingsAction?.IsGeoFencingEnabled && (
        <BackgroundPermissionAlert
          isModalOpen={!isBGLocationGranted}
          onPress={() => {}}
        />
      )}
      {!isLocationGranted && (
        <LocationPermissionAlert
          isModalOpen={!isLocationGranted}
          onPress={() => {}}
        />
      )}
      <TopCard
        lastSync={lastSync}
        multiDivData={multiData}
        isDataSynced={isDataSynced}
        SelectedDivison={SelectedDivison}
        AttendanceMarked={AttendanceIn}
        AttendanceEnd={AttendanceOut}
        AttendanceDayEnd={dayUserEnd}
        onMenuPress={() => toggleDrawer(true)}
      />
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => toggleDrawer(false)}
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: '400px',
          },
        }}
      >
        <SideMenuList navigation={navigationAdapter} />
      </Drawer>
      <CustomSafeView>
        {isMultiDivision && (
          <Box
            sx={{
              backgroundColor: Colors.mainBackground,
              height: 'auto',
              zIndex: 990,
              padding: '10px',
              paddingBottom: '25px',
              borderBottomLeftRadius: '35px',
              borderBottomRightRadius: '35px',
            }}
          >
            <Dropdown
              data={multiData}
              label={'Distributor'}
              placeHolder={'Select Distributor'}
              onPressItem={(val: any) => onDDItemChange(val)}
              selectedValue={SelectedDivison?.Distributor}
            />
          </Box>
        )}
        <ToggleNavBar
          navItems={navigationItems}
          defaultTab={DEFAULT_TAB_NAMES[0]}
        />
      </CustomSafeView>
    </>
  );
}

export default Dashboard;
