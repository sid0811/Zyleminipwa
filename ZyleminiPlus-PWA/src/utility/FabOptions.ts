// React Navigation Web FabOptions - Same API as React Native
import { FABIcon } from '../constants/AllImages';
import {
  AccessControlKeyConstants,
  ScreenName,
} from '../constants/screenConstants';

// FAB DASH
export const FABOptions = (t: any, navigation: any, propsData?: any) => [
  {
    label: t('Fab.FabCreateNewActivity') || 'Create New Activity',
    onPress: () => {
      navigation.navigate(ScreenName.CREATE_MEET, { propsData });
    },
    fabIcon: FABIcon.Folder,
    accessKeyValue: AccessControlKeyConstants.FAB_CREATE_ACTIVITY,
  },
  {
    label: t('Fab.FabDataCollection') || 'Data Collection',
    onPress: () => {
      navigation.navigate(ScreenName.DATACOLLECTIOSTEP1, { propsData });
    },
    fabIcon: FABIcon.file,
    accessKeyValue: AccessControlKeyConstants.FAB_DATA_COLLECTION,
  },
  {
    label: t('Fab.FabAddNewShop') || 'Add New Shop',
    onPress: () => {
      navigation.navigate(ScreenName.ADDNEWSHOPS1);
    },
    fabIcon: FABIcon.editFile,
    accessKeyValue: AccessControlKeyConstants.FAB_ADD_NEW_SHOP,
  },
  {
    label: t('Fab.FabCreateNewOrder') || 'Create New Order',
    onPress: () => {
      navigation.navigate(ScreenName.CREATENEWORDER1, { propsData });
    },
    fabIcon: FABIcon.Folder,
    accessKeyValue: AccessControlKeyConstants.FAB_CREATE_NEW_ORDER,
  },
  {
    label: t('Fab.FabAcceptCollection') || 'Accept Collection',
    onPress: () => {
      navigation.navigate(ScreenName.COLLECTIONS);
    },
    fabIcon: FABIcon.Folder,
    accessKeyValue: AccessControlKeyConstants.FAB_ACCEPT_COLLECTION,
  },
];

export const FABOptionsShops = (t: any, navigation: any, propsData?: any) => [
  {
    label: t('Fab.FabCreateNewActivity'),
    onPress: () => {
      if (propsData?.isSyncImmediate) {
        propsData?.isShopCheckedIn
          ? navigation.navigate(ScreenName.CREATE_MEET, { propsData })
          : window.alert('Please Do Check-In First');
      } else {
        navigation.navigate(ScreenName.CREATE_MEET, { propsData });
      }
    },
    fabIcon: FABIcon.Folder,
    accessKeyValue: AccessControlKeyConstants.FAB_CREATE_ACTIVITY,
  },
  {
    label: t('Fab.FabDataCollection'),
    onPress: () => {
      if (propsData?.isSyncImmediate) {
        propsData?.isShopCheckedIn
          ? navigation.navigate(ScreenName.DATACOLLECTIOSTEP1, { propsData })
          : window.alert('Please Do Check-In First');
      } else {
        navigation.navigate(ScreenName.DATACOLLECTIOSTEP1, { propsData });
      }
    },
    fabIcon: FABIcon.file,
    accessKeyValue: AccessControlKeyConstants.FAB_DATA_COLLECTION,
  },
  {
    label: t('Fab.FabCreateNewOrder'),
    onPress: () => {
      if (propsData?.isSyncImmediate) {
        propsData?.isShopCheckedIn
          ? navigation.navigate(ScreenName.CREATENEWORDER1, { propsData })
          : window.alert('Please Do Check-In First');
      } else {
        navigation.navigate(ScreenName.CREATENEWORDER1, { propsData });
      }
    },
    fabIcon: FABIcon.Folder,
    accessKeyValue: AccessControlKeyConstants.FAB_CREATE_NEW_ORDER,
  },
  {
    label: t('Fab.FabAcceptCollection'),
    onPress: () => {
      if (propsData?.isSyncImmediate) {
        propsData?.isShopCheckedIn
          ? navigation.navigate(ScreenName.COLLECTIONS, { propsData })
          : window.alert('Please Do Check-In First');
      } else {
        navigation.navigate(ScreenName.COLLECTIONS, { propsData });
      }
    },
    fabIcon: FABIcon.Folder,
    accessKeyValue: AccessControlKeyConstants.FAB_ACCEPT_COLLECTION,
  },
  {
    label: t('Fab.FabAuditAsset'),
    onPress: () => {
      if (propsData?.isSyncImmediate) {
        propsData?.isShopCheckedIn
          ? navigation.navigate(ScreenName.ASSETUPDATE, { propsData })
          : window.alert('Please Do Check-In First');
      } else {
        navigation.navigate(ScreenName.ASSETUPDATE, { propsData });
      }
    },
    fabIcon: FABIcon.editFile,
    accessKeyValue: AccessControlKeyConstants.FAB_AUDIT_ASSET,
  },
];

// FAB COLLECTION
export const FABOptionCollection = (t: any, navigation: any) => [
  {
    label: t('Fab.FabAcceptCollection'),
    onPress: () => {
      navigation.navigate(ScreenName.ACCEPTPAYMENT);
    },
    fabIcon: FABIcon.editFile,
    accessKeyValue: AccessControlKeyConstants.FAB_ACCEPT_COLLECTION,
  },
];

