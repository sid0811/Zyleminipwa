import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { screens } from './index';
import { ScreenName } from '../../constants/screenConstants';

const MainRouteStack = createStackNavigator();

export default function MainRouteStackNav() {
  return (
    <MainRouteStack.Navigator initialRouteName={ScreenName.SPLASH}>
      {screens?.length > 0 &&
        screens.map((item, index) => {
          console.log(
            `[MainRouteStack Screen #${index}] name=${item.name}, getId=`,
            item.getId,
          );
          return (
            <MainRouteStack.Screen
              key={index.toString()}
              name={item.name}
              component={item.component}
              options={item.options}
              {...(item.getId ? {} : { initialParams: item.params })}
              getId={item.getId}
            />
          );
        })}
    </MainRouteStack.Navigator>
  );
}

