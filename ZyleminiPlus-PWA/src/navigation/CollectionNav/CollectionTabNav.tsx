import * as React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../theme/colors';
import { FABOptionCollection } from '../../utility/FabOptions';
import CustomSafeView from '../../components/GlobalComponent/CustomSafeView';
import Header from '../../components/Header/Header';
import CustomFAB from '../../components/FAB/CustomFAB';
import PaymentsOutStandingLists from '../../screens/CollectionModule/MainScreen/PaymentsOutStandingLists1';
import CollectionMain from '../../screens/CollectionModule/MainScreen/CollectionMain';
import PaymentsHistoryList from '../../screens/CollectionModule/MainScreen/PaymentsHistoryList';
import PaymentsBouncedChekedlist from '../../screens/CollectionModule/MainScreen/PaymentsBouncedChekedlist';
import { isAccessControlProvided } from '../../utility/utils';
import { useGlobleAction } from '../../redux/actionHooks/useGlobalAction';

export default function CollectionTabNav(props: any) {
  const { navigation } = props;
  const Tab = createMaterialTopTabNavigator();
  const { t } = useTranslation();
  const { getAccessControlSettings } = useGlobleAction();
  const { propsData } = props.route.params || {};

  return (
    <>
      <Header
        navigation={navigation}
        title={t('TabScreen.TabScreenCollectionsActionBarText')}
      />
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
        <Tab.Screen
          name={t('TabScreen.TabScreenOutstanding')}
          component={PaymentsOutStandingLists}
          {...(propsData ? { initialParams: propsData } : {})}
        />

        <Tab.Screen
          name={t('TabScreen.TabScreenCollections')}
          component={CollectionMain}
        />
        <Tab.Screen
          name={t('Header4.HeaderBouncedCheque')}
          component={PaymentsBouncedChekedlist}
        />
        <Tab.Screen
          name={t('TabScreen.TabScreenHistory')}
          component={PaymentsHistoryList}
        />
      </Tab.Navigator>
      <CustomFAB
        options={FABOptionCollection(t, navigation).filter(option =>
          isAccessControlProvided(
            getAccessControlSettings,
            option.accessKeyValue,
          ),
        )}
      />
    </>
  );
}

