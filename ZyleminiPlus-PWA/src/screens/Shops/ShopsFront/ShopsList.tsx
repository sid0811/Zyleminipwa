// Web-adapted ShopsList screen
import React, { useEffect, useState, useCallback, memo } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';

import CustomSafeView from '../../../components/GlobalComponent/CustomSafeView';
import { useGlobleAction } from '../../../redux/actionHooks/useGlobalAction';
import { useLoginAction } from '../../../redux/actionHooks/useLoginAction';
import { Colors } from '../../../theme/colors';
import CustomFAB from '../../../components/FAB/CustomFAB';
import {
  getCurrentDate,
  writeErrorLog,
  isAccessControlProvided,
} from '../../../utility/utils';
import {
  getOutletArrayRouteWithGeofence,
  getRouteData,
  getVisitcount,
} from '../../../database/WebDatabaseHelpers';
import { FABOptionShops } from '../../../utility/FabOptions';
import CardView from './Component/CardView';
import ListCardView from './Component/ListCardView';
import TopCard from './Component/TopCard';
import TextInput from '../../../components/TextInput/TextInput';
import Dropdown from '../../../components/Dropdown/Dropdown';
import ShopHeader from './Component/ShopHeader';
import { ScreenName } from '../../../constants/screenConstants';
import useRegisterGeofenceRouteWise from '../../../hooks/useRegisterGeofenceRouteWise';
import {
  OutletArrayWithGeofenceData,
  OutletGeofence,
  ShopsGelocationBody,
} from '../../../types/types';
import { useGeofenceAction } from '../../../redux/actionHooks/useGeofenceAction';
import useLocation from '../../../hooks/useLocation';
import useHeadlessGeofenceEventRegistration from '../../../hooks/useHeadlessGeofenceEventRegistration';
import useNotificationActivity from '../../../hooks/useNotificationActivity';
import useCheckAppStateCurrent from '../../../hooks/useCheckAppStateCurrent';
import { useGlobalLocationRef } from '../../../redux/actionHooks/useGlobalLocationRef';

function ShopList() {
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const { geofenceGlobalSettingsAction } = useGlobleAction();
  const {
    geofenceEvents,
    getOneTimeGeofenceCaptureCtaClickedEvents,
    setOneTimeGeofenceCaptureCtaClickedEvents,
  } = useGeofenceAction();
  const { userId } = useLoginAction();
  const { t } = useTranslation();
  const { error: locationError } = useLocation();
  const { checkUpdatedInFenceOutlets } = useHeadlessGeofenceEventRegistration();
  const [isListView, setIsListView] = useState(false);
  const [outletArray, setOutletArray] = useState<any>([]);
  const [outletArrayCashed, setOutletArrayCashed] = useState<any>([]);
  const [routeData, setRouteData] = useState<any>([]);
  const [selectedRoute, setSelectedRoute] = useState<any>([]);
  const [visitCount, setVisitCount] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [enteredGeofenceShops, setEnteredGeofenceShops] = useState<
    ShopsGelocationBody[]
  >([]);
  const {
    getAccessControlSettings,
    setIsNavigationSourceShopsAction,
    isNavigationSourceShops,
  } = useGlobleAction();
  const globalLocationRef = useGlobalLocationRef();
  const { getRouteId, shopListRouteWise, getCurrentLocation } =
    useRegisterGeofenceRouteWise();
  const { isNotificationPermissionEnabled } = useNotificationActivity();
  const { appStateVisible } = useCheckAppStateCurrent();

  useEffect(() => {
    if (appStateVisible === 'active') {
      checkOutletInCircleForLatestUserLocation();
    }
  }, [appStateVisible]);

  useEffect(() => {
    takeDataFromDB();
    if (
      geofenceGlobalSettingsAction?.IsGeoFencingEnabled &&
      geofenceGlobalSettingsAction?.IsLocationRestriction
    ) {
      setTimeout(() => checkOutletInCircleForLatestUserLocation(), 4000);
    }
  }, []);

  useEffect(() => {
    setEnteredGeofenceShops(shopListRouteWise);
  }, [shopListRouteWise]);

  useEffect(() => {
    processEntryFlowGeofence();
  }, [geofenceEvents]);

  useEffect(() => {
    if (getOneTimeGeofenceCaptureCtaClickedEvents) {
      getRouteId('NAN');
      if (
        geofenceGlobalSettingsAction?.IsGeoFencingEnabled &&
        geofenceGlobalSettingsAction?.IsLocationRestriction
      ) {
        setTimeout(() => checkOutletInCircleForLatestUserLocation(), 3000);
      }
    }
  }, [getOneTimeGeofenceCaptureCtaClickedEvents]);

  useEffect(() => {
    if (getOneTimeGeofenceCaptureCtaClickedEvents) {
      onDDChange({
        RouteID: selectedRoute.RouteID,
        RouteName: selectedRoute.RouteName,
      });
      setOneTimeGeofenceCaptureCtaClickedEvents(false);
    }
  }, [getOneTimeGeofenceCaptureCtaClickedEvents]);

  useEffect(() => {
    processEntryFlowGeofence();
  }, [outletArrayCashed]);

  useEffect(() => {
    getVisitCount();
  }, [routerLocation.pathname]);

  function checkOutletInCircleForLatestUserLocation() {
    if (geofenceGlobalSettingsAction?.IsGeoFencingEnabled) {
      getCurrentLocation()
        .then((location: GeolocationPosition) => {
          console.log('location fetched' + JSON.stringify(location));
          checkUpdatedInFenceOutlets(location, undefined);
        })
        .catch((reason: any) => {
          console.log('reason location fetched' + reason);
          checkUpdatedInFenceOutlets(globalLocationRef.current, undefined);
        });
    }
  }

  const getVisitCount = async () => {
    try {
      const currentDate = await getCurrentDate();
      const visitCount = await getVisitcount(currentDate);
      setVisitCount(visitCount[0]?.count || 0);
    } catch (error) {
      writeErrorLog('getVisitCount', error);
      console.log('error in getting visit count --->', error);
    }
  };

  const takeDataFromDB = async () => {
    try {
      const routeData = await getRouteData(userId);
      setRouteData(routeData);
      if (routeData.length > 0) {
        const outletArray = await getOutletArrayRouteWithGeofence(
          routeData[0]?.RouteID,
        );
        setOutletArray(outletArray);
        setSelectedRoute(routeData[0]);
        geofenceFlowPassRouteId(
          routeData[0]?.RouteID,
          JSON.parse(JSON.stringify(outletArray)),
        );
        setEnteredGeofenceShops([]);
        setIsNavigationSourceShopsAction(false);
      }
    } catch (error) {
      writeErrorLog('takeDataFromDB', error);
      console.log('error while take data from db -->', error);
    }
  };

  const onDDChange = async (val: any) => {
    setSelectedRoute(val);
    try {
      const outletArray = await getOutletArrayRouteWithGeofence(val?.RouteID);
      setOutletArray(outletArray);
      geofenceFlowPassRouteId(
        val?.RouteID,
        JSON.parse(JSON.stringify(outletArray)),
      );
      setEnteredGeofenceShops([]);
    } catch (error) {
      writeErrorLog('onDDChange', error);
    }
  };

  function geofenceFlowPassRouteId(
    routeId: string,
    ourletArray: OutletArrayWithGeofenceData[],
  ) {
    if (geofenceGlobalSettingsAction?.IsGeoFencingEnabled) {
      getRouteId(routeId);
      setOutletArrayCashed(ourletArray);
    }
  }

  function processEntryFlowGeofence() {
    if (
      geofenceGlobalSettingsAction?.IsGeoFencingEnabled &&
      outletArray.length > 0
    ) {
      let outletArrayLocalCopy = [...outletArray];
      const { enteredOutlets, exitedOutlets } = splitOutletsByGeofence(
        outletArrayLocalCopy,
        geofenceEvents,
      );
      const updatedOutletArray = enteredOutlets?.concat(exitedOutlets);
      setOutletArray(updatedOutletArray);
    }
  }

  function splitOutletsByGeofence(
    outletArrayLocalCopy: OutletArrayWithGeofenceData[],
    geofenceEvents: OutletGeofence[],
  ) {
    const enteredOutlets = outletArrayLocalCopy.filter((outlet) => {
      outlet.isEntered = geofenceEvents.some((shop) => shop.id === outlet.id);
      return outlet.isEntered;
    });

    const exitedOutlets = outletArrayLocalCopy.filter((outlet) => {
      return !enteredOutlets.some((enteredShop) => enteredShop.id === outlet.id);
    });
    return { enteredOutlets, exitedOutlets };
  }

  const RenderItem = (props: { item: any; index: number }) => {
    const { item } = props;
    return (
      <>
        {isListView ? (
          <ListCardView
            shopId={item.id}
            party={item.party}
            outletInfo={item.Outlet_Info}
            weeklyoff={item.weeklyoff}
            isEntered={item.isEntered}
            latitude={item.latitude}
            longitude={item.longitude}
          />
        ) : (
          <CardView
            shopId={item.id}
            party={item.party}
            outletInfo={item.Outlet_Info}
            weeklyoff={item.weeklyoff}
            isEntered={item.isEntered}
            latitude={item.latitude}
            longitude={item.longitude}
            isNewParty={item.isNewParty}
          />
        )}
      </>
    );
  };

  const onLocationIconPress = (called: number) => {
    if (shopListRouteWise != null && shopListRouteWise.length > 0) {
      if (called == 1)
        navigate(`/${ScreenName.MAPVIEW_OUTLETS}`, {
          state: { shopListRouteWise },
        });
      else
        navigate(`/${ScreenName.MAPVIEW_OUTLETS_GEOFENCEVIEW}`, {
          state: { shopListRouteWise },
        });
    } else
      window.alert(
        t('Shops.GeofenceAlertTitleNoData') || 'No Data',
        t('Shops.GeofenceAlertSubTitleNoData') || 'No geofence data available',
      );
  };

  const filteredOutlets = outletArray.filter((item: any) =>
    item?.party.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <>
      <ShopHeader
        onPress={(val: boolean) => {
          setIsListView(val);
        }}
      />
      <CustomSafeView edges={['bottom']}>
        <Box
          sx={{
            height: 'auto',
            backgroundColor: Colors.mainBackground,
            paddingBottom: '25px',
            zIndex: 1000,
          }}
        >
          <Typography
            sx={{
              color: '#ADA2A2',
              fontSize: '10px',
              fontFamily: 'Proxima Nova, sans-serif',
              fontWeight: 'bold',
              marginLeft: '24px',
              marginTop: '20px',
            }}
          >
            {t('Shops.TodayRoute')}
          </Typography>
          <Box
            sx={{
              zIndex: 1000,
              marginTop: '8px',
            }}
          >
            <Dropdown
              data={routeData}
              isSearchable={true}
              label={'RouteName'}
              placeHolder={'Select Route'}
              selectedValue={selectedRoute?.RouteName}
              onPressItem={(val: any) => {
                onDDChange(val);
              }}
              ddItemStyle={{
                height: '160px',
                position: 'relative',
                marginTop: '8px',
              }}
            />
          </Box>
          <TextInput
            placeholder={t('Shops.SearchShop') || 'Search Shop'}
            containerStyle={{
              marginTop: '16px',
              borderWidth: '1px',
              borderColor: Colors.border,
              borderRadius: '12px',
              width: '88%',
              height: '56px',
              paddingRight: '12px',
              backgroundColor: Colors.white,
              paddingHorizontal: '16px',
              justifyContent: 'center',
              alignContent: 'center',
              alignSelf: 'center',
              textAlign: 'center',
            }}
            iconFamily={'Ionicons'}
            iconName={'search-outline'}
            iconSize={22}
            onChangeText={(txt: string) => setSearchText(txt)}
            value={searchText}
          />
        </Box>
        <TopCard
          totalShops={outletArray.length}
          visitShops={visitCount}
          routeID={selectedRoute?.RouteID ? selectedRoute?.RouteID : undefined}
          onPressItem={(calledFrom: number, datageofence?: any) => {
            onLocationIconPress(calledFrom);
          }}
        />
        <Box
          sx={{
            paddingBottom: '100px',
            minHeight: '100vh',
          }}
        >
          {filteredOutlets.map((item: any, index: number) => (
            <RenderItem key={index} item={item} index={index} />
          ))}
        </Box>
        <CustomFAB
          options={FABOptionShops(t, navigate).filter((option) =>
            isAccessControlProvided(
              getAccessControlSettings,
              option.accessKeyValue,
            ),
          )}
        />
      </CustomSafeView>
    </>
  );
}

export default memo(ShopList);


