import { ScreenName } from '../../constants/screenConstants';
import AddNewShop1 from '../../screens/Shops/AddNewShop/AddNewShop1';
import AddNewShop2 from '../../screens/Shops/AddNewShop/AddNewShop2';
import ShopsDetails from '../../screens/Shops/ShopsDetails/ShopsDetails';
import ShopsList from '../../screens/Shops/ShopsFront/ShopsList';
import { Screens } from '../../types/ScreenNavTypes';
import ShopsTopNav from './ShopTabNav';

// TODO: Add these screens when they are migrated
// import OrderViewDetailsShop from '../../screens/Shops/ShopsDetails/TabScreens/OrderViewDetailsShop';
// import OrderViewExtended from '../../screens/Shops/ShopsDetails/TabScreens/OrderViewExtended';

export const screens: Screens[] = [
  {
    name: ScreenName.SHOPSFRONT,
    component: ShopsList,
    options: { headerShown: false },
  },
  {
    name: ScreenName.SHOPSDETAIL,
    component: ShopsTopNav,
    options: { headerShown: false },
  },
  {
    name: ScreenName.ADDNEWSHOPS1,
    component: AddNewShop1,
    options: { headerShown: false },
  },
  {
    name: ScreenName.ADDNEWSHOPS2,
    component: AddNewShop2,
    options: { headerShown: false },
  },
  // TODO: Uncomment when screens are migrated
  // {
  //   name: ScreenName.ORDER_VIEW_SHOP,
  //   component: OrderViewDetailsShop,
  //   options: { headerShown: false },
  // },
  // {
  //   name: ScreenName.ORDER_VIEW_EXTEND_SHOP,
  //   component: OrderViewExtended,
  //   options: { headerShown: false },
  // },
];

