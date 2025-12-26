import { ScreenName } from '../../constants/screenConstants';
import Login from '../../screens/Login/Login';
import SplashScreen from '../../screens/Splash/SplashScreen';
import { Screens } from '../../types/ScreenNavTypes';

// Note: ForgetOTP screen not yet migrated, can be added later
// import ForgetOTP from '../../screens/Login/ForgetOTP/ForgetOTP';

export const screens: Screens[] = [
  {
    name: ScreenName.SPLASH,
    component: SplashScreen,
    options: { headerShown: false },
  },
  {
    name: ScreenName.LOGIN,
    component: Login,
    options: { headerShown: false },
  },
  // TODO: Add ForgetOTP when screen is migrated
  // {
  //   name: ScreenName.FORGET_OTP,
  //   component: ForgetOTP,
  //   options: { headerShown: false },
  // },
];

