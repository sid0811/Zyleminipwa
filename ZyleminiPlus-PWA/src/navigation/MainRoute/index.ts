import MainRoute from './MainRoute';
import { Screens } from '../../types/ScreenNavTypes';
import { ScreenName } from '../../constants/screenConstants';

// Nested Navigators
import ShopsStackNav from '../ShopsNav/ShopsStackNav';
import CollectionTabNav from '../CollectionNav/CollectionTabNav';
import SideOrderTabNav from '../SideOrderNav/SideOrderTabNav';
import ReportTabNav from '../ReportNav/ReportTabNav';

// Import screens that are available in PWA
import SplashScreen from '../../screens/Splash/SplashScreen';
import Dashboard from '../../screens/Dashboard/Dashboard';

// Orders Module (Available in PWA)
import CreateNewOrderStep1 from '../../screens/Order/CreateNewOrder/CreateNewOrderStep1';
import CreateNewOrderStep2 from '../../screens/Order/CreateNewOrder/CreateNewOrderStep2';
import CreateNewOrderStep3 from '../../screens/Order/CreateNewOrder/CreateNewOrderStep3';
import SideOrderDetail from '../../screens/Order/SideOrder/SideOrderDetail';
import EditPartialDiscount1 from '../../screens/Order/SideOrder/FullPartialSideDiscount/EditPartialDiscount1';
import EditFullOrderDiscount1 from '../../screens/Order/SideOrder/FullPartialSideDiscount/EditFullOrderDiscount1';

// Reports Module (Available in PWA)
import OutletVisitReports from '../../screens/Reports/OutletVisitReports';
import OutletVisitActivity from '../../screens/Reports/OutletVisitActivity';
import TargetVsAchievementReport from '../../screens/Reports/TargetVsAchievementReport';
import OutletPerformanceReport1 from '../../screens/Reports/OutletPerformanceReport1';
import OutletPerformanceReport2 from '../../screens/Reports/OutletPerformanceReport2';
import MyReportList from '../../screens/Reports/MyReportList';
import MyActivityReport from '../../screens/Reports/MyActivityReport';
import OutletMyActivityPatyList from '../../screens/Reports/OutletMyActivityPatyList';
import DistributorDataStatus from '../../screens/Reports/DistributorDataStatus';
import BrandWiseSaleReport from '../../screens/Reports/BrandWiseSaleReport';
import VisitBasedMapView from '../../screens/Reports/VisitBasedMapView';
import LiveLocationMapView from '../../screens/Reports/LiveLocationMapView';

// Shops Module (Available in PWA)
import AddNewShop1 from '../../screens/Shops/AddNewShop/AddNewShop1';
import AddNewShop2 from '../../screens/Shops/AddNewShop/AddNewShop2';
import ShopsList from '../../screens/Shops/ShopsFront/ShopsList';

// Data Collection (Available in PWA)
import DataCollectionStep2 from '../../screens/DataCollection/DataCollectionStep2';

// Sync Module (Available in PWA)
import ExpandList from '../../screens/Sync/ExpandList';
import Sos from '../../screens/Sync/Sos';

// Side Menu Info (Available in PWA)
import AboutUs from '../../screens/SideMenu/DrawerInfo/AboutUs';
import PrivacyPolicy from '../../screens/SideMenu/DrawerInfo/PrivacyPolicy';
import Security from '../../screens/SideMenu/DrawerInfo/Security';

// Dashboard Reports (Available in PWA)
import DashboardBWSReport from '../../screens/Dashboard/UserPerformance/DashboardBWSReport';
import WODandTargetReport from '../../screens/Dashboard/UserPerformance/WODandTargetReport';
import UserNegativePerfReport from '../../screens/Dashboard/UserPerformance/UserNegativePerfReport';
import OutstandingAgeingReport from '../../screens/Dashboard/UserPerformance/OutstandingAgeingReport';
import SalesTrendReport from '../../screens/Dashboard/UserPerformance/SalesTrendReport';

// ============================================
// MISSING SCREENS - TO BE MIGRATED
// ============================================
// Collection Module
// import AcceptPayment from '../../screens/CollectionModule/AcceptPayment';
// import AcceptPayment2 from '../../screens/CollectionModule/AcceptPayment2';
// import AllPandingInvoice from '../../screens/CollectionModule/MainScreen/AllPandingInvoice';
// import CollectionDetails from '../../screens/CollectionModule/MainScreen/CollectionDetails';
// import CollectionHistoryDetails from '../../screens/CollectionModule/MainScreen/CollectionHistoryDetails';
// import PreviewAcceptPaymentScreen from '../../screens/CollectionModule/MainScreen/PreviewAcceptPaymentScreen';

// Order Discount Screens (Create New Order)
// import MainPartialDiscount from '../../screens/Order/Components/FullPartialDiscount/MainPartialDiscount';
// import EditPartialDiscount from '../../screens/Order/Components/FullPartialDiscount/EditPartialDiscount';
// import FullOrderDiscount from '../../screens/Order/Components/FullPartialDiscount/FullOrderDiscount';
// import EditFullOrderDiscount from '../../screens/Order/Components/FullPartialDiscount/EditFullOrderDiscount';

// Activity Module
// import CreateMeet from '../../screens/ActivityModule/CreateMeet';
// import CreateMeetOne from '../../screens/ActivityModule/CreateMeetOne';
// import MJP_Cancel from '../../screens/ActivityModule/MJP_Cancel';
// import MJP_two from '../../screens/ActivityModule/MJP_two';

// Asset Management
// import AssestUpdate from '../../screens/AssetManagement/AssestUpdate';
// import AuditAssetSteps2 from '../../screens/AssetManagement/AuditAssetSteps2';
// import AuditAssetStep3 from '../../screens/AssetManagement/AuditAssetStep3';
// import AssetDetails from '../../screens/AssetManagement/AssetDetails';

// Advance Reports
// import AdvanceReportsMain from '../../screens/AdvanceReports/AdvanceReportsMain';
// import Proclaims from '../../screens/AdvanceReports/Proclaims';
// import ProclaimzSchemeApp from '../../screens/AdvanceReports/ProclaimzSchemeApp';
// import ProclaimzSchemeDef from '../../screens/AdvanceReports/ProclaimzSchemeDef';

// Survey Module
// import SurveyTabNav from '../SurveyTabNav/SurveyTabNav';
// import AvailableSurveys from '../../screens/Survey/AvailableSurveys';
// import DetailViewSurveyBrowser from '../../screens/Survey/DetailViewSurveyBrowserProps';
// import History from '../../screens/Survey/History';

// POD Module
// import PODStep1 from '../../screens/POD/PODMainScreens/PODStep1';
// import PODStep2 from '../../screens/POD/PODMainScreens/PODStep2';
// import PODStep3 from '../../screens/POD/PODMainScreens/PODStep3';

// Resources
// import ResourceLanding from '../../screens/Resources/ResourceLanding';
// import DetailScreen from '../../screens/Resources/DetailScreen';

// Components
// import QRScanner from '../../components/Camera/QRScanner';
// import CommonWebView from '../../components/Webview/CommonWebView';
// import MapViewModal from '../../screens/Reports/components/MapViewModal';

// Data Collection
// import DataCollectionStep1 from '../../screens/DataCollection/DataCollectionStep1';
// import DataCollectionCards from '../../screens/DataCollection/SideMenuDataCard/DataCollectionCards';

export const screens: Screens[] = [
  {
    name: ScreenName.SPLASH,
    component: SplashScreen,
    options: { headerShown: false },
  },
  {
    name: ScreenName.MAINSCREEN,
    component: MainRoute,
    options: { headerShown: false },
  },
  {
    name: ScreenName.DASHBOARD,
    component: Dashboard,
    options: { headerShown: false },
  },
  {
    name: ScreenName.SHOPS,
    component: ShopsStackNav,
    options: { headerShown: false },
  },
  {
    name: ScreenName.ORDERS,
    component: SideOrderTabNav,
    options: { headerShown: false },
  },
  {
    name: ScreenName.COLLECTIONS,
    component: CollectionTabNav,
    options: { headerShown: false },
  },
  {
    name: ScreenName.REPORTS,
    component: ReportTabNav,
    options: { headerShown: false },
  },
  {
    name: ScreenName.DATACOLLECTION,
    component: DataCollectionStep2,
    options: { headerShown: false },
    params: { propsData: { isFromSideMenu: true } },
  },

  // Orders Module
  {
    name: ScreenName.CREATENEWORDER1,
    component: CreateNewOrderStep1,
    options: { headerShown: false },
    getId: ({ params }) => {
      // Unique instance based on shopId
      return params?.propsData?.shopId != null
        ? String(params.propsData.shopId)
        : undefined;
    },
  },
  {
    name: ScreenName.CREATENEWORDER2,
    component: CreateNewOrderStep2,
    options: { headerShown: false },
  },
  {
    name: ScreenName.CREATENEWORDER3,
    component: CreateNewOrderStep3,
    options: { headerShown: false },
  },
  {
    name: ScreenName.SIDEORDERDETAIL,
    component: SideOrderDetail,
    options: { headerShown: false },
    getId: ({ params }) => {
      return params?.propsData?.shopId != null
        ? String(params.propsData.shopId)
        : undefined;
    },
  },
  {
    name: ScreenName.EDIT_PARTIAL_SIDE_DISCOUNT,
    component: EditPartialDiscount1,
    options: { headerShown: false },
  },
  {
    name: ScreenName.EDIT_FULL_SIDE_DISCOUNT,
    component: EditFullOrderDiscount1,
    options: { headerShown: false },
  },

  // Reports Module
  {
    name: ScreenName.OUTLETVISITREPORTS,
    component: OutletVisitReports,
    options: { headerShown: false },
  },
  {
    name: ScreenName.OUTLETVISITACTIVITY,
    component: OutletVisitActivity,
    options: { headerShown: false },
  },
  {
    name: ScreenName.TARGET_VS_ACHI_REP,
    component: TargetVsAchievementReport,
    options: { headerShown: false },
  },
  {
    name: ScreenName.OUTLET_PERFORMANCE1,
    component: OutletPerformanceReport1,
    options: { headerShown: false },
  },
  {
    name: ScreenName.OUTLET_PERFORMANCE2,
    component: OutletPerformanceReport2,
    options: { headerShown: false },
  },
  {
    name: ScreenName.OUTLETMYACTIVITYPARTYLIST,
    component: OutletMyActivityPatyList,
    options: { headerShown: false },
  },
  {
    name: ScreenName.MYACTIVTIYREPORT,
    component: MyActivityReport,
    options: { headerShown: false },
  },
  {
    name: ScreenName.DISTRIBUTOR_DATA_STATUS,
    component: DistributorDataStatus,
    options: { headerShown: false },
  },
  {
    name: ScreenName.BRAND_SALE_REPORT,
    component: BrandWiseSaleReport,
    options: { headerShown: false },
  },
  {
    name: ScreenName.VISIT_BASED,
    component: VisitBasedMapView,
    options: { headerShown: false },
  },
  {
    name: ScreenName.LIVELOCATIONMAPVIEW,
    component: LiveLocationMapView,
    options: { headerShown: false },
  },

  // Shops Module
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

  // Data Collection
  {
    name: ScreenName.DATACOLLECTIOSTEP1,
    component: DataCollectionStep2, // Using Step2 as Step1 may not exist
    options: { headerShown: false },
  },

  // Sync Module
  {
    name: ScreenName.EXPANDLIST,
    component: ExpandList,
    options: { headerShown: false },
  },
  {
    name: ScreenName.SOS,
    component: Sos,
    options: { headerShown: false },
  },

  // Dashboard Reports
  {
    name: ScreenName.DASHBOARD_BWS_REP,
    component: DashboardBWSReport,
    options: { headerShown: false },
  },
  {
    name: ScreenName.DASHBOARD_T_VS_ACHI_WOD_REP,
    component: WODandTargetReport,
    options: { headerShown: false },
  },
  {
    name: ScreenName.DASHBOARD_NEGATIVE_SHOP,
    component: UserNegativePerfReport,
    options: { headerShown: false },
  },
  {
    name: ScreenName.USER_OUTSTANDING_AGE_REP,
    component: OutstandingAgeingReport,
    options: { headerShown: false },
  },
  {
    name: ScreenName.DASHBOARD_SALES_TREND_REP,
    component: SalesTrendReport,
    options: { headerShown: false },
  },

  // Drawer Info
  {
    name: ScreenName.ABOUT_US,
    component: AboutUs,
    options: { headerShown: false },
  },
  {
    name: ScreenName.PRIVACYPOLICY,
    component: PrivacyPolicy,
    options: { headerShown: false },
  },
  {
    name: ScreenName.SECURITY,
    component: Security,
    options: { headerShown: false },
  },

  // ============================================
  // MISSING SCREENS - COMMENTED OUT UNTIL MIGRATED
  // ============================================

  // Collection Module Screens
  // {
  //   name: ScreenName.ALLPANDINGINVOICE,
  //   component: AllPandingInvoice,
  //   options: { headerShown: false },
  // },
  // {
  //   name: ScreenName.ACCEPTPAYMENT2,
  //   component: AcceptPayment2,
  //   options: { headerShown: false },
  // },
  // {
  //   name: ScreenName.ACCEPTPAYMENT,
  //   component: AcceptPayment,
  //   options: { headerShown: false },
  // },
  // {
  //   name: ScreenName.PREVIEWACCEPTPAYMENTSCREEN,
  //   component: PreviewAcceptPaymentScreen,
  //   options: { headerShown: false },
  // },
  // {
  //   name: ScreenName.COLLECTIONDETAILS,
  //   component: CollectionDetails,
  //   options: { headerShown: false },
  // },
  // {
  //   name: ScreenName.COLLECTIONHISTORYDETAILS,
  //   component: CollectionHistoryDetails,
  //   options: { headerShown: false },
  // },

  // Order Discount Screens (Create New Order)
  // {
  //   name: ScreenName.PARTIAL_DISCOUNT,
  //   component: MainPartialDiscount,
  //   options: { headerShown: false },
  // },
  // {
  //   name: ScreenName.EDIT_PARTIAL_DISCOUNT,
  //   component: EditPartialDiscount,
  //   options: { headerShown: false },
  // },
  // {
  //   name: ScreenName.FULL_DISCOUNT,
  //   component: FullOrderDiscount,
  //   options: { headerShown: false },
  // },
  // {
  //   name: ScreenName.EDIT_FULL_DISCOUNT,
  //   component: EditFullOrderDiscount,
  //   options: { headerShown: false },
  // },

  // Activity Module
  // {
  //   name: ScreenName.CREATE_MEET,
  //   component: CreateMeet,
  //   options: { headerShown: false },
  // },
  // {
  //   name: ScreenName.CREATEMEETONE,
  //   component: CreateMeetOne,
  //   options: { headerShown: false },
  // },
  // {
  //   name: ScreenName.CANCELMEET,
  //   component: MJP_Cancel,
  //   options: { headerShown: false },
  // },
  // {
  //   name: ScreenName.ENDMEET,
  //   component: MJP_two,
  //   options: { headerShown: false },
  // },

  // Asset Management
  // {
  //   name: ScreenName.ASSETUPDATE,
  //   component: AssestUpdate,
  //   options: { headerShown: false },
  // },
  // {
  //   name: ScreenName.AUDITAASETSTEP2,
  //   component: AuditAssetSteps2,
  //   options: { headerShown: false },
  // },
  // {
  //   name: ScreenName.AUDITAASETSTEP3,
  //   component: AuditAssetStep3,
  //   options: { headerShown: false },
  // },
  // {
  //   name: ScreenName.ASSETDETAILS,
  //   component: AssetDetails,
  //   options: { headerShown: false },
  // },

  // Advance Reports
  // {
  //   name: ScreenName.ADVACEREPORTMAIN,
  //   component: AdvanceReportsMain,
  //   options: { headerShown: false },
  // },
  // {
  //   name: ScreenName.PROCLAIMS,
  //   component: Proclaims,
  //   options: { headerShown: false },
  // },
  // {
  //   name: ScreenName.PROCLAIMZSCHEMEAPP,
  //   component: ProclaimzSchemeApp,
  //   options: { headerShown: false },
  // },
  // {
  //   name: ScreenName.PROCLAIMZSCHEMEDEF,
  //   component: ProclaimzSchemeDef,
  //   options: { headerShown: false },
  // },

  // Survey Module
  // {
  //   name: ScreenName.AVAILABLESURVEYS,
  //   component: AvailableSurveys,
  //   options: { headerShown: false },
  // },
  // {
  //   name: ScreenName.DETAILVIEWSURVEYBROWSER,
  //   component: DetailViewSurveyBrowser,
  //   options: { headerShown: false },
  // },
  // {
  //   name: ScreenName.SURVEYTABNAV,
  //   component: SurveyTabNav,
  //   options: { headerShown: false },
  // },
  // {
  //   name: ScreenName.HISTORY,
  //   component: History,
  //   options: { headerShown: false },
  // },
  // {
  //   name: ScreenName.SURVEYWEBVIEW,
  //   component: CommonWebView,
  //   options: { headerShown: false },
  // },

  // POD Module
  // {
  //   name: ScreenName.POD,
  //   component: PODStep1,
  //   options: { headerShown: false },
  // },
  // {
  //   name: ScreenName.POD_STEP2,
  //   component: PODStep2,
  //   options: { headerShown: false },
  // },
  // {
  //   name: ScreenName.POD_STEP3,
  //   component: PODStep3,
  //   options: { headerShown: false },
  // },

  // Resources
  // {
  //   name: ScreenName.RESOURCES,
  //   component: ResourceLanding,
  //   options: { headerShown: false },
  // },
  // {
  //   name: ScreenName.DETAIL,
  //   component: DetailScreen,
  //   options: { headerShown: false },
  // },

  // Other Components
  // {
  //   name: ScreenName.QR_BAR_SCANNER,
  //   component: QRScanner,
  //   options: { headerShown: false },
  // },
  // {
  //   name: ScreenName.DATACARDS,
  //   component: DataCollectionCards,
  //   options: { headerShown: false },
  // },
  // {
  //   name: ScreenName.MAPVIEW_OUTLETS,
  //   component: MapViewModal,
  //   options: { headerShown: false },
  // },
];

