import {SideMenuIcon} from '../../../constants/AllImages';
import {
  AccessControlKeyConstants,
  AccessControlKeys,
  ScreenName,
} from '../../../constants/screenConstants';
import {writeActivityLog} from '../../../utility/utils';

export const drawerList = (t: any, navigation: any, isNavPressed?: any) => {
  return [
    {
      name: t('SideMenu.SyncNow'),
      icon: SideMenuIcon.sync,
      nav: () => {
        isNavPressed(t('SideMenu.SyncNow'));
        writeActivityLog('SideMenu SyncNow');
      },
      accessKey: 0,
      accessKeyValue: AccessControlKeyConstants.SIDE_MENU_SYNCNOW,
    },
    {
      name: t('SideMenu.RefreshData'),
      icon: SideMenuIcon.refresh,
      nav: () => {
        isNavPressed(t('SideMenu.RefreshData'));
        writeActivityLog('SideMenu RefreshData');
      },
      accessKey: 0,
      accessKeyValue: AccessControlKeyConstants.SIDE_MENU_REFRESHDATA,
    },
    {
      name: t('SideMenu.Shops'),
      icon: SideMenuIcon.shopIcon,
      nav: () => {
        navigation.navigate(ScreenName.SHOPS);
        writeActivityLog('SideMenu SHOPS');
      },
      accessKey: AccessControlKeys.SHOPS,
      accessKeyValue: AccessControlKeyConstants.SIDE_MENU_SHOPS,
    },
    {
      name: t('SideMenu.POD'),
      icon: SideMenuIcon.shopIconFade,
      nav: () => {
        navigation.navigate(ScreenName.POD);
        writeActivityLog('SideMenu POD');
      },
      accessKey: AccessControlKeys.SHOPS,
      accessKeyValue: AccessControlKeyConstants.SIDE_MENU_POD,
    },
    {
      name: t('SideMenu.DataCollection'),
      icon: SideMenuIcon.shopIconDC,
      nav: () => {
        navigation.navigate(ScreenName.DATACOLLECTION);
        writeActivityLog('SideMenu DATACOLLECTION');
      },
      accessKey: AccessControlKeys.DATACOLLECTION,
      accessKeyValue: AccessControlKeyConstants.SIDE_MENU_DATACOLLECTION,
    },
    {
      name: t('SideMenu.DataCards'),
      icon: SideMenuIcon.dataCard,
      nav: () => {
        navigation.navigate(ScreenName.DATACARDS);
        writeActivityLog('SideMenu DATACARDS');
      },
      accessKey: AccessControlKeys.DATACARDS,
      accessKeyValue: AccessControlKeyConstants.SIDE_MENU_DATACARDS,
    },
    {
      name: t('SideMenu.Orders'),
      icon: SideMenuIcon.order,
      nav: () => {
        navigation.navigate(ScreenName.ORDERS);
        writeActivityLog('SideMenu Orders');
      },
      accessKey: AccessControlKeys.ORDERS,
      accessKeyValue: AccessControlKeyConstants.SIDE_MENU_ORDERS,
    },
    {
      name: t('SideMenu.Activity'),
      icon: SideMenuIcon.meeting,
      nav: () => {
        navigation.navigate(ScreenName.CREATEMEETONE);
        writeActivityLog('SideMenu Activity');
      },
      accessKey: AccessControlKeys.ACTIVITY,
      accessKeyValue: AccessControlKeyConstants.SIDE_MENU_ACTIVITY,
    },
    {
      name: t('SideMenu.Collections'),
      icon: SideMenuIcon.paymentCard,
      nav: () => {
        navigation.navigate(ScreenName.COLLECTIONS);
        writeActivityLog('SideMenu COLLECTIONS');
      },
      accessKey: AccessControlKeys.COLLECTIONS,
      accessKeyValue: AccessControlKeyConstants.SIDE_MENU_COLLECTIONS,
    },
    {
      name: t('SideMenu.Surveys'),
      icon: SideMenuIcon.survey,
      nav: () => {
        navigation.navigate(ScreenName.SURVEYTABNAV);
        writeActivityLog('SideMenu SURVEYTABNAV');
      },
      accessKey: AccessControlKeys.SURVEYS,
      accessKeyValue: AccessControlKeyConstants.SIDE_MENU_SURVEYS,
    },
    {
      name: t('SideMenu.Resources'),
      icon: SideMenuIcon.resource,
      nav: () => {
        navigation.navigate(ScreenName.RESOURCES);
        writeActivityLog('SideMenu Resources');
      },
      accessKey: AccessControlKeys.RESOURCES,
      accessKeyValue: AccessControlKeyConstants.SIDE_MENU_RESOURCES,
    },
    {
      name: t('SideMenu.Reports'),
      icon: SideMenuIcon.report,
      nav: () => {
        navigation.navigate(ScreenName.REPORTS);
        writeActivityLog('SideMenu Reports');
      },
      accessKey: AccessControlKeys.REPORTS,
      accessKeyValue: AccessControlKeyConstants.SIDE_MENU_REPORTS,
    },
    {
      name: t('SideMenu.AdvanceReports'),
      icon: SideMenuIcon.advReport,
      nav: () => {
        navigation.navigate(ScreenName.ADVACEREPORTMAIN);
        writeActivityLog('SideMenu AdvanceReports');
      },
      accessKey: AccessControlKeys.ADVANCEREPORTS,
      accessKeyValue: AccessControlKeyConstants.SIDE_MENU_ADVANCEREPORTS,
    },
    {
      name: t('SideMenu.LogOut'),
      icon: SideMenuIcon.logout,
      nav: () => {
        writeActivityLog('SideMenu LogOut');
      },
      accessKey: 0,
      accessKeyValue: AccessControlKeyConstants.SIDE_MENU_LOGOUT,
    },

    {
      name: t('SideMenu.ReportError'),
      icon: SideMenuIcon.sos,
      nav: () => {
        navigation.navigate(ScreenName.SOS);
        writeActivityLog('SideMenu ReportError');
      },
      accessKey: 0,
      accessKeyValue: AccessControlKeyConstants.SIDE_MENU_REPORTERROR,
    },
  ];
};

//
export const drawerListParent = (
  t: any,
  navigation: any,
  isNavPressed?: any,
) => {
  return [
    {
      name: t('SideMenu.SyncNow'),
      icon: SideMenuIcon.sync,
      nav: () => {
        isNavPressed(t('SideMenu.SyncNow'));
      },
      accessKey: 0,
      accessKeyValue: AccessControlKeyConstants.SIDE_MENU_SYNCNOW,
    },
    {
      name: t('SideMenu.RefreshData'),
      icon: SideMenuIcon.sync,
      nav: () => {
        isNavPressed(t('SideMenu.RefreshData'));
      },
      accessKey: 0,
      accessKeyValue: AccessControlKeyConstants.SIDE_MENU_REFRESHDATA,
    },
    {
      name: t('SideMenu.Shops'),
      icon: SideMenuIcon.shopIconFade,
      nav: () => {},
      accessKey: AccessControlKeys.SHOPS,
      accessKeyValue: AccessControlKeyConstants.SIDE_MENU_SHOPS,
    },
    {
      name: t('SideMenu.POD'),
      icon: SideMenuIcon.shopIconFade,
      nav: () => {},
      accessKey: AccessControlKeys.SHOPS,
      accessKeyValue: AccessControlKeyConstants.SIDE_MENU_POD,
    },
    {
      name: t('SideMenu.DataCollection'),
      icon: SideMenuIcon.shopIconFade,
      nav: () => {},
      accessKey: AccessControlKeys.DATACOLLECTION,
      accessKeyValue: AccessControlKeyConstants.SIDE_MENU_DATACOLLECTION,
    },
    {
      name: t('SideMenu.DataCards'),
      icon: SideMenuIcon.paymentCard,
      nav: () => {},
      accessKey: AccessControlKeys.DATACARDS,
      accessKeyValue: AccessControlKeyConstants.SIDE_MENU_DATACARDS,
    },
    {
      name: t('SideMenu.Orders'),
      icon: SideMenuIcon.order,
      nav: () => {},
      accessKey: AccessControlKeys.ORDERS,
      accessKeyValue: AccessControlKeyConstants.SIDE_MENU_ORDERS,
    },
    {
      name: t('SideMenu.Activity'),
      icon: SideMenuIcon.meeting,
      nav: () => {},
      accessKey: AccessControlKeys.ACTIVITY,
      accessKeyValue: AccessControlKeyConstants.SIDE_MENU_ACTIVITY,
    },
    {
      name: t('SideMenu.Collections'),
      icon: SideMenuIcon.paymentCard,
      nav: () => {},
      accessKey: AccessControlKeys.COLLECTIONS,
      accessKeyValue: AccessControlKeyConstants.SIDE_MENU_COLLECTIONS,
    },
    {
      name: t('SideMenu.Surveys'),
      icon: SideMenuIcon.survey,
      nav: () => {},
      accessKey: AccessControlKeys.SURVEYS,
      accessKeyValue: AccessControlKeyConstants.SIDE_MENU_SURVEYS,
    },
    {
      name: t('SideMenu.Resources'),
      icon: SideMenuIcon.resource,
      nav: () => {},
      accessKey: AccessControlKeys.RESOURCES,
      accessKeyValue: AccessControlKeyConstants.SIDE_MENU_RESOURCES,
    },
    {
      name: t('SideMenu.Reports'),
      icon: SideMenuIcon.report,
      nav: () => {
        navigation.navigate(ScreenName.REPORTS);
        writeActivityLog('SideMenu Reports');
      },
      accessKey: AccessControlKeys.REPORTS,
      accessKeyValue: AccessControlKeyConstants.SIDE_MENU_REPORTS,
    },
    {
      name: t('SideMenu.AdvanceReports'),
      icon: SideMenuIcon.report,
      nav: () => {},
      accessKey: AccessControlKeys.ADVANCEREPORTS,
      accessKeyValue: AccessControlKeyConstants.SIDE_MENU_ADVANCEREPORTS,
    },
    {
      name: t('SideMenu.LogOut'),
      icon: SideMenuIcon.logout,
      nav: () => {},
      accessKey: 0,
      accessKeyValue: AccessControlKeyConstants.SIDE_MENU_LOGOUT,
    },
    {
      name: t('SideMenu.ReportError'),
      icon: SideMenuIcon.sos,
      nav: () => {
        navigation.navigate(ScreenName.SOS);
        writeActivityLog('SideMenu ReportError');
      },
      accessKey: 0,
      accessKeyValue: AccessControlKeyConstants.SIDE_MENU_REPORTERROR,
    },
  ];
};
