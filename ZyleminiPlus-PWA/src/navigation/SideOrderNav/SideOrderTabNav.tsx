import * as React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../theme/colors';
import Header from '../../components/Header/Header';
import InProcessOrder from '../../screens/Order/SideOrder/InProcessOrder';
import PreOrders from '../../screens/Order/SideOrder/PreOrder';
import OrderHistory from '../../screens/Order/SideOrder/OrderHistory';
import PendingOrders from '../../screens/Order/SideOrder/PendingOrder';

export default function SideOrderTabNav(props: any) {
  const { navigation } = props;
  const Tab = createMaterialTopTabNavigator();
  const { t } = useTranslation();

  return (
    <>
      <Header navigation={navigation} title={t('TabScreen.TabScreenOrdersActionBarText')} />
      <Tab.Navigator
        screenOptions={{
          tabBarShowLabel: true,
          tabBarLabelStyle: { fontSize: 14 },
          tabBarStyle: {
            backgroundColor: Colors.mainBackground,
            height: 60,
            justifyContent: 'center',
          },
          tabBarInactiveTintColor: '#C9B1B4',
          tabBarScrollEnabled: true,
          tabBarActiveTintColor: Colors.white,
          tabBarIndicatorStyle: {
            backgroundColor: Colors.PinkColor,
            height: 5,
          },
        }}>
        <Tab.Screen name={t('TabScreen.TabScreenINPROCESS')} component={InProcessOrder} />
        <Tab.Screen name={t('TabScreen.TabScreenPREORDERS')} component={PreOrders} />
        <Tab.Screen name={t('TabScreen.TabScreenORDERHISTORY')} component={OrderHistory} />
        <Tab.Screen name={t('TabScreen.TabScreenPENDING')} component={PendingOrders} />
      </Tab.Navigator>
    </>
  );
}

