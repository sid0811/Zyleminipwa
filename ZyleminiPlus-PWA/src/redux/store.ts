import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage for web
import createSagaMiddleware from 'redux-saga';
import RootReducer from './reducers';
import { RootSaga } from './saga/rootSaga';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { PERSIST_CONFIG_KEY, reducerName } from '../constants/reduxConstants';

// Create saga middleware
const sagaMiddleware = createSagaMiddleware();

const middleware = [sagaMiddleware];

// Redux Persist configuration (using localStorage instead of AsyncStorage)
const persistConfig = {
  key: PERSIST_CONFIG_KEY,
  storage, // localStorage for web
  whitelist: [
    reducerName.GLOBLE_REDUCER,
    reducerName.LOGIN_REDUCER,
    reducerName.DASH_REDUCER,
    reducerName.LOCATION_REDUCER,
  ],
  blacklist: [
    reducerName.SHOP_REDUCER,
    reducerName.ORDER_REDUCER,
    reducerName.DATA_COLLECTION_REDUCER,
    'paymentReducer',
    reducerName.GEOFENCE_REDUCER,
  ],
};

const persistedReducer = persistReducer(persistConfig, RootReducer);

// Configure store
const Store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/PAUSE', 'persist/FLUSH', 'persist/PURGE', 'persist/REGISTER'],
      },
    }).concat(middleware),
});

// Run saga middleware
sagaMiddleware.run(RootSaga);

// TypeScript types
export type AppDispatch = typeof Store.dispatch;
export type RootState = ReturnType<typeof Store.getState>;

// Typed hooks
type DispatchFunc = () => AppDispatch;
export const useAppDispatch: DispatchFunc = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Create persistor
export const persistor = persistStore(Store);

export default Store;

