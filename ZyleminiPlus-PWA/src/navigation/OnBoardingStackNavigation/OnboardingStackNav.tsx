import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { screens } from './index';
import { ScreenName } from '../../constants/screenConstants';
import { useGlobleAction } from '../../redux/actionHooks/useGlobalAction';

export default function OnboardingStackNav() {
  const OnboardingStack = createStackNavigator();
  const { isSplashShown } = useGlobleAction();
  console.log('isSplashShown -->', isSplashShown);

  return (
    <OnboardingStack.Navigator
      initialRouteName={isSplashShown ? ScreenName.SPLASH : ScreenName.LOGIN}>
      {screens.map((item, index) => {
        return (
          <OnboardingStack.Screen
            key={index.toString()}
            name={item.name}
            component={item.component}
            options={item.options}
          />
        );
      })}
    </OnboardingStack.Navigator>
  );
}

