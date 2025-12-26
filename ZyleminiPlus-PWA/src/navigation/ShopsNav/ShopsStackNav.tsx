import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { screens } from './index';
import { ScreenName } from '../../constants/screenConstants';

export default function ShopsStackNav() {
  const ShopStack = createStackNavigator();
  return (
    <ShopStack.Navigator initialRouteName={ScreenName.SHOPSFRONT}>
      {screens.map((item, index) => {
        console.log(
          `[ShopStack Screen #${index}] name=${item.name}, getId=`,
          item.getId,
        );
        return (
          <ShopStack.Screen
            key={index.toString()}
            name={item.name}
            component={item.component}
            options={item.options}
            {...(item.getId ? {} : { initialParams: item.params })}
            getId={item.getId}
          />
        );
      })}
    </ShopStack.Navigator>
  );
}

