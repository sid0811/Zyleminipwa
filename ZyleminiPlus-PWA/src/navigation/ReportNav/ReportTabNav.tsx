import * as React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../theme/colors';
import Header from '../../components/Header/Header';
import MyReportList from '../../screens/Reports/MyReportList';

export default function ReportTabNav(props: any) {
  const { navigation } = props;
  const Tab = createMaterialTopTabNavigator();
  const { t } = useTranslation();

  return (
    <>
      <Header navigation={navigation} title={t('TabScreen.TabScreenReportsActionBarText')} />
      <Tab.Navigator
        screenOptions={{
          tabBarShowLabel: true,
          tabBarLabelStyle: { fontSize: 14 },
          tabBarStyle: {
            backgroundColor: Colors.DarkBrown,
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
        <Tab.Screen name={t('TabScreen.TabScreenDataMyReport')} component={MyReportList} />
      </Tab.Navigator>
    </>
  );
}

