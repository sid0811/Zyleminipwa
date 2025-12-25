export const enum AUTH_ENDPOINTS {
  AUTH_URL = 'https://zyleminiplus.com/ZyleminiPlusCoreURLAuth/api/Login/AuthLogin', //live auth url
  // AUTH_URL = 'https://sapluatdev4.zylem.in/ZyleminiPlusAuth/api/Login/AuthLogin', //dev/test server auth url
  LOGIN_EP = '/api/Login/Login',
  TOKEN_EP = '/api/Data/TokenData',
  GETDATA_EP = '/api/Data/GetData',
  POSTDATA_EP = '/api/Data/PostData',
  OTP_EP = '/api/Login/SendOTP',
  UPDATE_DEV_ID_EP = '/api/Login/UpdateDeviceId',
  CHECK_VERSION = '/api/Login/CheckAppVersion',
  UPLOAD_LOG = '/api/Data/UploadLog',
  USERACCESS = '/api/Data/GetUserAccessDetails',
  REPORT_ERROR_EP = '/api/Data/ReportError',
  RPORT_FULLERROR_EP = 'api/Data/CompleteReportError',
  POST_DOCUMENT = '/api/Data/PostDocuments',
  APP_API_VERSION = 'V4',
}

export const enum API_ENDPOINTS {
  DASHGRAPH = '/api/Dashboard/GetDashboardData',
  EXECUTIVE_LIST = '/api/Data/LoginUserChildren',
  VISIT_BASED = '/api/Data/VisitBaseLatLong',
  LOCATION_BASED = '/api/Data/LocationBaseRouteMapView',
  OUTLET_PERFORM = '/api/OutletPerformance/OutletPerformanceReport',
  BRAND_WISE_SALE = '/api/BrandWiseSales/BrandWiseSalesReport',
  TARGET_VS_ACHI_REP_EP = '/api/TargetVsAchievement/TargetVsAchievementReport',
  DIST_DATA_STATUS = '/api/DistDataStatus/DistDataStatusReport',
  CUST_PROFILE_REPORT = '/api/CustomerProfile/CustomerProfileReport',
  SHOP_GEOLOCATION_POST = '/api/Data/PostShopGeoLocation',
  DASHBOARD_USER_PERF = 'api/UserProfile/UserProfileReport',
  LIVE_LOCATION_POST = '/api/Data/LocationBaseLatLong',
  POD_GET_DATA_POD = '/api/Data/GetPODData',
  SAVE_POST_DATA_POD = '/api/Data/SavePODData',
  PROFILE_POST_IMAGE = '/api/Data/SaveProfileImage',
  PROFILE_GET_IMAGE = '/api/Data/GetProfileImage',
  TEAM_SUMMARY_REP = '/api/Data/GetTeamActivitySummary',
  TEAM_ACTIVITY_REP = '/api/Data/GetUsersActivityDetails',
  NDA_CONSENT_POST = 'api/Data/PostNdaConsentsDetails',
  RESOURCES_NEW = '/api/Data/GetResourcesData',
  ERRORLOG = '/api/Data/ErrorLog',
}

