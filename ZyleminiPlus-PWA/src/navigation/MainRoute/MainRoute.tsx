import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { ScreenName } from '../../constants/screenConstants';
import Dashboard from '../../screens/Dashboard/Dashboard';
import SideMenu from './SideMenu';

const Drawer = createDrawerNavigator();

const MainRoute = () => {
  return (
    <>
      <Drawer.Navigator
        drawerContent={props => <SideMenu {...props} />}
        screenOptions={{
          drawerStyle: {
            backgroundColor: 'white',
            width: '100%',
          },
          drawerType: 'back',
          headerShown: false,
          // Web-specific: Use overlay instead of slide
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          drawerPosition: 'left',
        }}>
        <Drawer.Screen name={ScreenName.DASHBOARD} component={Dashboard} />
      </Drawer.Navigator>
    </>
  );
};

export default MainRoute;

