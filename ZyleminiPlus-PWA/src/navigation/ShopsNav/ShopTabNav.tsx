import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../theme/colors';
import { FABOptionsShops } from '../../utility/FabOptions';
import CustomSafeView from '../../components/GlobalComponent/CustomSafeView';
import CustomFAB from '../../components/FAB/CustomFAB';
import ShopsDetails from '../../screens/Shops/ShopsDetails/ShopsDetails';
import InfoTab from '../../screens/Shops/ShopsDetails/TabScreens/InfoTab';
import Orders from '../../screens/Shops/ShopsDetails/TabScreens/Orders';
import Payment from '../../screens/Shops/ShopsDetails/TabScreens/Payment';
import Assets from '../../screens/Shops/ShopsDetails/TabScreens/Assets';
import Remarks from '../../screens/Shops/ShopsDetails/TabScreens/Remarks';
import Surveys from '../../screens/Shops/ShopsDetails/TabScreens/Surveys';
import Schemes from '../../screens/Shops/ShopsDetails/TabScreens/Schemes';
import DataCollectionShop from '../../screens/Shops/ShopsDetails/TabScreens/DataCollection';
import MeetingShop from '../../screens/Shops/ShopsDetails/TabScreens/Meeting';
import { isAccessControlProvided } from '../../utility/utils';
import { useGlobleAction } from '../../redux/actionHooks/useGlobalAction';
import { AccessControlKeyConstants } from '../../constants/screenConstants';
import React from 'react';

export default function ShopsTopNav(props: any) {
  const { navigation } = props;
  const { shopId, party, outletInfo, isNewParty } = props.route.params;
  const { getAccessControlSettings, isShopCheckedIn, isSyncImmediate } =
    useGlobleAction();
  const Tab = createMaterialTopTabNavigator();
  const { t } = useTranslation();

  const propsData = {
    shopId,
    isFromShop: true,
    party,
    outletInfo,
    isNewParty,
    isShopCheckedIn,
    isSyncImmediate,
  };

  return (
    <>
      <ShopsDetails navigation={navigation} />
      <CustomSafeView>
        <Tab.Navigator
          screenOptions={{
            tabBarShowLabel: true,
            tabBarLabelStyle: { fontSize: 13 },
            tabBarStyle: { backgroundColor: Colors.mainBackground },
            tabBarInactiveTintColor: '#C9B1B4',
            tabBarScrollEnabled: true,
            tabBarActiveTintColor: Colors.white,
            tabBarIndicatorStyle: {
              backgroundColor: Colors.PinkColor,
              height: 5,
            },
          }}>
          <Tab.Screen name={t('TabScreen.TabScreenInfo')} component={InfoTab} />
          {isAccessControlProvided(
            getAccessControlSettings,
            AccessControlKeyConstants.SIDE_MENU_ORDERS,
          ) && (
            <Tab.Screen
              name={t('TabScreen.TabScreenOrders')}
              component={Orders}
            />
          )}
          {isAccessControlProvided(
            getAccessControlSettings,
            AccessControlKeyConstants.SIDE_MENU_COLLECTIONS,
          ) && (
            <Tab.Screen
              name={t('TabScreen.TabScreenPayments')}
              component={Payment}
            />
          )}
          <Tab.Screen
            name={t('TabScreen.TabScreenAssets')}
            component={Assets}
          />
          <Tab.Screen
            name={t('TabScreen.TabScreenRemarks')}
            component={Remarks}
          />
          {isAccessControlProvided(
            getAccessControlSettings,
            AccessControlKeyConstants.SIDE_MENU_SURVEYS,
          ) && (
            <Tab.Screen
              name={t('TabScreen.TabScreenSurveys')}
              component={Surveys}
            />
          )}
          {false && ( // no implementation so setting to false
            <Tab.Screen
              name={t('TabScreen.TabScreenSchemes')}
              component={Schemes}
            />
          )}
          {isAccessControlProvided(
            getAccessControlSettings,
            AccessControlKeyConstants.SIDE_MENU_ACTIVITY,
          ) && (
            <Tab.Screen
              name={t('TabScreen.TabScreenMeetings')}
              component={MeetingShop}
            />
          )}
          {isAccessControlProvided(
            getAccessControlSettings,
            AccessControlKeyConstants.SIDE_MENU_DATACOLLECTION,
          ) && (
            <Tab.Screen
              name={t('TabScreen.TabScreenDataCollection')}
              component={DataCollectionShop}
            />
          )}
        </Tab.Navigator>
        {isAccessControlProvided(
          getAccessControlSettings,
          AccessControlKeyConstants.FAB_SHOP_DETAILS,
        ) && (
          <CustomFAB
            options={FABOptionsShops(t, navigation, propsData).filter(option =>
              isAccessControlProvided(
                getAccessControlSettings,
                option.accessKeyValue,
              ),
            )}
            isNotFromShop={false}
          />
        )}
      </CustomSafeView>
    </>
  );
}

