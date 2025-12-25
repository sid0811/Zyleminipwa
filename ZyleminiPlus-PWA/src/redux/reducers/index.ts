import { combineReducers } from 'redux';
import { CLEAR_APP_STATE } from '../actionTypes/actionTypes';

// Import reducers (will be copied from React Native)
// For now, create placeholder reducers
import GlobalReducers from './globalReducers';
import LoginReducers from './loginReducers';
import DashReducers from './dashboardReducers';
import ShopReducers from './shopReducers';
import OrderReducer from './orderReducers';
import dataCollectionReducers from './dataCollectionReducers';
import geofenceReducers from './geofenceReducers';
import locationReducers from './locationReducers';

/**
 * Combine all reducers
 */
const AppReducers = combineReducers({
  globalReducer: GlobalReducers,
  loginReducer: LoginReducers,
  dashReducer: DashReducers,
  shopReducer: ShopReducers,
  orderReducer: OrderReducer,
  dataCollectionReducers: dataCollectionReducers,
  geofenceReducer: geofenceReducers,
  locationReducer: locationReducers,
});

/**
 * Root reducer with state clearing capability
 */
const RootReducer = (state: any, action: any) => {
  if (action.type === CLEAR_APP_STATE) {
    return AppReducers(undefined, action);
  }
  return AppReducers(state, action);
};

export default RootReducer;

