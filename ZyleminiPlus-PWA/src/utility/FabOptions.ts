// Web-adapted FabOptions - Using React Router navigation
import { FABIcon } from '../constants/AllImages';
import {
  AccessControlKeyConstants,
  ScreenName,
} from '../constants/screenConstants';

// FAB DASH
export const FABOptions = (t: any, navigate: any, propsData?: any) => [
  {
    label: t('Fab.FabCreateNewActivity') || 'Create New Activity',
    onPress: () => {
      navigate(`/${ScreenName.CREATE_MEET}`, { state: { propsData } });
    },
    fabIcon: FABIcon.Folder,
    accessKeyValue: AccessControlKeyConstants.FAB_CREATE_ACTIVITY,
  },
  {
    label: t('Fab.FabDataCollection') || 'Data Collection',
    onPress: () => {
      navigate(`/${ScreenName.DATACOLLECTIOSTEP1}`, { state: { propsData } });
    },
    fabIcon: FABIcon.file,
    accessKeyValue: AccessControlKeyConstants.FAB_DATA_COLLECTION,
  },
  {
    label: t('Fab.FabAddNewShop') || 'Add New Shop',
    onPress: () => {
      navigate(`/${ScreenName.ADDNEWSHOPS1}`);
    },
    fabIcon: FABIcon.editFile,
    accessKeyValue: AccessControlKeyConstants.FAB_ADD_NEW_SHOP,
  },
  {
    label: t('Fab.FabCreateNewOrder') || 'Create New Order',
    onPress: () => {
      navigate(`/${ScreenName.CREATENEWORDER1}`, { state: { propsData } });
    },
    fabIcon: FABIcon.Folder,
    accessKeyValue: AccessControlKeyConstants.FAB_CREATE_NEW_ORDER,
  },
  {
    label: t('Fab.FabAcceptCollection') || 'Accept Collection',
    onPress: () => {
      navigate(`/${ScreenName.COLLECTIONS}`);
    },
    fabIcon: FABIcon.Folder,
    accessKeyValue: AccessControlKeyConstants.FAB_ACCEPT_COLLECTION,
  },
];

export const FABOptionShops = (t: any, navigate: any, propsData?: any) => [
  {
    label: t('Fab.FabAddNewShop') || 'Add New Shop',
    onPress: () => {
      navigate(`/${ScreenName.ADDNEWSHOPS1}`);
    },
    fabIcon: FABIcon.editFile,
    accessKeyValue: AccessControlKeyConstants.FAB_ADD_NEW_SHOP,
  },
];

