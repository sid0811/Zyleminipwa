/**
 * Route Path Mapping Utility
 * Maps ScreenName constants to React Router URL paths
 * Maintains logical parity with React Native navigation
 */

import { ScreenName } from './screenConstants';

/**
 * Route path configuration interface
 */
interface RoutePathConfig {
  path: string;
  isDynamic?: boolean;
  paramName?: string;
}

/**
 * Map of ScreenName to route path configuration
 */
const routePathMap: Record<string, RoutePathConfig> = {
  // Onboarding Flow
  [ScreenName.SPLASH]: { path: '/' },
  [ScreenName.LOGIN]: { path: '/login' },
  [ScreenName.FORGET_OTP]: { path: '/forget-otp' },
  
  // Main Routes
  [ScreenName.MAINSCREEN]: { path: '/main' },
  [ScreenName.DASHBOARD]: { path: '/dashboard' },
  
  // Module Routes
  [ScreenName.SHOPS]: { path: '/shops' },
  [ScreenName.ORDERS]: { path: '/orders' },
  [ScreenName.COLLECTIONS]: { path: '/collections' },
  [ScreenName.REPORTS]: { path: '/reports' },
  [ScreenName.DATACOLLECTION]: { path: '/data-collection' },
  [ScreenName.DATACARDS]: { path: '/data-cards' },
  [ScreenName.ACTIVITY]: { path: '/activity' },
  [ScreenName.SURVEYS]: { path: '/surveys' },
  [ScreenName.RESOURCES]: { path: '/resources' },
  [ScreenName.ADVANCEREPORTS]: { path: '/advance-reports' },
  [ScreenName.SOS]: { path: '/sos' },
  [ScreenName.SYNCNOW]: { path: '/sync-now' },
  [ScreenName.REFRESHDATA]: { path: '/refresh-data' },
  
  // Shop Module
  [ScreenName.SHOPSFRONT]: { path: '/shops/list' },
  [ScreenName.SHOPSDETAIL]: { path: '/shops/:shopId', isDynamic: true, paramName: 'shopId' },
  [ScreenName.ADDNEWSHOPS1]: { path: '/shops/add/step1' },
  [ScreenName.ADDNEWSHOPS2]: { path: '/shops/add/step2' },
  [ScreenName.ORDER_VIEW_SHOP]: { path: '/shops/:shopId/order-view', isDynamic: true, paramName: 'shopId' },
  [ScreenName.ORDER_VIEW_EXTEND_SHOP]: { path: '/shops/:shopId/order-view-extended', isDynamic: true, paramName: 'shopId' },
  
  // Order Module - Dynamic routes with shopId
  [ScreenName.CREATENEWORDER1]: { path: '/orders/create/:shopId?', isDynamic: true, paramName: 'shopId' },
  [ScreenName.CREATENEWORDER2]: { path: '/orders/create/step2' },
  [ScreenName.CREATENEWORDER3]: { path: '/orders/create/step3' },
  [ScreenName.SIDEORDERDETAIL]: { path: '/orders/side-order/:shopId?', isDynamic: true, paramName: 'shopId' },
  [ScreenName.EDIT_PARTIAL_SIDE_DISCOUNT]: { path: '/orders/edit/partial-discount' },
  [ScreenName.EDIT_FULL_SIDE_DISCOUNT]: { path: '/orders/edit/full-discount' },
  [ScreenName.PARTIAL_DISCOUNT]: { path: '/orders/partial-discount' },
  [ScreenName.EDIT_PARTIAL_DISCOUNT]: { path: '/orders/edit/partial-discount-cno' },
  [ScreenName.FULL_DISCOUNT]: { path: '/orders/full-discount' },
  [ScreenName.EDIT_FULL_DISCOUNT]: { path: '/orders/edit/full-discount-cno' },
  
  // Collection Module
  [ScreenName.OUTSTANDINGMAIN]: { path: '/collections/outstanding' },
  [ScreenName.COLLECTIONMAIN]: { path: '/collections/main' },
  [ScreenName.BOUNCEDCHEQUED]: { path: '/collections/bounced-cheque' },
  [ScreenName.COLLECTIONHISTORY]: { path: '/collections/history' },
  [ScreenName.ACCEPTPAYMENT]: { path: '/collections/accept-payment' },
  [ScreenName.ACCEPTPAYMENT2]: { path: '/collections/accept-payment/step2' },
  [ScreenName.ALLPANDINGINVOICE]: { path: '/collections/pending-invoices' },
  [ScreenName.PREVIEWACCEPTPAYMENTSCREEN]: { path: '/collections/preview-payment' },
  [ScreenName.COLLECTIONDETAILS]: { path: '/collections/details' },
  [ScreenName.COLLECTIONHISTORYDETAILS]: { path: '/collections/history-details' },
  
  // Reports Module
  [ScreenName.OUTLETVISITREPORTS]: { path: '/reports/outlet-visit' },
  [ScreenName.OUTLETVISITACTIVITY]: { path: '/reports/outlet-visit-activity' },
  [ScreenName.TARGET_VS_ACHI_REP]: { path: '/reports/target-vs-achievement' },
  [ScreenName.OUTLET_PERFORMANCE1]: { path: '/reports/outlet-performance-1' },
  [ScreenName.OUTLET_PERFORMANCE2]: { path: '/reports/outlet-performance-2' },
  [ScreenName.MYACTIVTIYREPORT]: { path: '/reports/my-activity' },
  [ScreenName.OUTLETMYACTIVITYPARTYLIST]: { path: '/reports/outlet-activity-party-list' },
  [ScreenName.DISTRIBUTOR_DATA_STATUS]: { path: '/reports/distributor-data-status' },
  [ScreenName.BRAND_SALE_REPORT]: { path: '/reports/brand-wise-sale' },
  [ScreenName.VISIT_BASED]: { path: '/reports/visit-based-map' },
  [ScreenName.LIVELOCATIONMAPVIEW]: { path: '/reports/live-location-map' },
  // Note: LIVELOCATION_MAPVIEW has the same enum value as LIVELOCATIONMAPVIEW, so it uses the same route
  [ScreenName.MAPVIEW_OUTLETS]: { path: '/reports/map-view-outlets' },
  [ScreenName.MAPVIEW_OUTLETS_GEOFENCEVIEW]: { path: '/reports/map-view-geofence' },
  
  // Dashboard Reports
  [ScreenName.DASHBOARD_BWS_REP]: { path: '/dashboard/reports/brand-wise-sales' },
  [ScreenName.DASHBOARD_T_VS_ACHI_WOD_REP]: { path: '/dashboard/reports/target-vs-achievement-wod' },
  [ScreenName.DASHBOARD_NEGATIVE_SHOP]: { path: '/dashboard/reports/negative-shops' },
  [ScreenName.USER_OUTSTANDING_AGE_REP]: { path: '/dashboard/reports/outstanding-ageing' },
  [ScreenName.DASHBOARD_SALES_TREND_REP]: { path: '/dashboard/reports/sales-trend' },
  
  // Data Collection
  [ScreenName.DATACOLLECTIOSTEP1]: { path: '/data-collection/step1' },
  
  // Activity Module
  [ScreenName.CREATE_MEET]: { path: '/activity/create-meet' },
  [ScreenName.CREATEMEETONE]: { path: '/activity/create-meet/step1' },
  [ScreenName.CANCELMEET]: { path: '/activity/cancel-meet' },
  [ScreenName.ENDMEET]: { path: '/activity/end-meet' },
  
  // Asset Management
  [ScreenName.ASSETUPDATE]: { path: '/assets/update' },
  [ScreenName.AUDITAASETSTEP2]: { path: '/assets/audit/step2' },
  [ScreenName.AUDITAASETSTEP3]: { path: '/assets/audit/step3' },
  [ScreenName.ASSETDETAILS]: { path: '/assets/details' },
  
  // Advance Reports
  [ScreenName.ADVACEREPORTMAIN]: { path: '/advance-reports/main' },
  [ScreenName.PROCLAIMS]: { path: '/advance-reports/proclaims' },
  [ScreenName.PROCLAIMZSCHEMEAPP]: { path: '/advance-reports/proclaimz-scheme-app' },
  [ScreenName.PROCLAIMZSCHEMEDEF]: { path: '/advance-reports/proclaimz-scheme-def' },
  
  // Survey Module
  [ScreenName.AVAILABLESURVEYS]: { path: '/surveys/available' },
  [ScreenName.DETAILVIEWSURVEYBROWSER]: { path: '/surveys/detail-view' },
  [ScreenName.SURVEYTABNAV]: { path: '/surveys' },
  [ScreenName.HISTORY]: { path: '/surveys/history' },
  [ScreenName.SURVEYWEBVIEW]: { path: '/surveys/webview' },
  
  // POD Module
  [ScreenName.POD]: { path: '/pod/step1' },
  [ScreenName.POD_STEP2]: { path: '/pod/step2' },
  [ScreenName.POD_STEP3]: { path: '/pod/step3' },
  
  // Resources (already defined above, removing duplicate)
  [ScreenName.DETAIL]: { path: '/resources/detail' },
  [ScreenName.VideoPlayerScreen]: { path: '/resources/video-player' },
  
  // QR Scanner
  [ScreenName.QR_BAR_SCANNER]: { path: '/qr-scanner' },
  
  // Sync
  [ScreenName.EXPANDLIST]: { path: '/sync/expand-list' },
  
  // Drawer Info
  [ScreenName.ABOUT_US]: { path: '/about-us' },
  [ScreenName.PRIVACYPOLICY]: { path: '/privacy-policy' },
  [ScreenName.SECURITY]: { path: '/security' },
};

/**
 * Get route path for a screen name
 * @param screenName - ScreenName constant
 * @param params - Optional parameters for dynamic routes (e.g., { shopId: 123 })
 * @returns URL path string
 * 
 * @example
 * getRoutePath(ScreenName.DASHBOARD) // Returns: '/dashboard'
 * getRoutePath(ScreenName.CREATENEWORDER1, { shopId: 123 }) // Returns: '/orders/create/123'
 */
export const getRoutePath = (screenName: ScreenName | string, params?: Record<string, string | number>): string => {
  const config = routePathMap[screenName];
  
  if (!config) {
    console.warn(`⚠️ No route path configured for screen: ${screenName}`);
    // Fallback: convert ScreenName to kebab-case
    return `/${screenName.toLowerCase().replace(/([A-Z])/g, '-$1').replace(/^-/, '')}`;
  }
  
  let path = config.path;
  
  // Replace dynamic parameters
  if (config.isDynamic && params) {
    const paramName = config.paramName;
    if (paramName && params[paramName] !== undefined) {
      path = path.replace(`:${paramName}?`, String(params[paramName])).replace(`:${paramName}`, String(params[paramName]));
    }
  }
  
  // Remove optional parameter markers if no params provided
  path = path.replace(/\/:\w+\?/g, '');
  
  return path;
};

/**
 * Get all route paths (for route configuration)
 */
export const getAllRoutePaths = (): Record<string, string> => {
  const paths: Record<string, string> = {};
  Object.keys(routePathMap).forEach((screenName) => {
    paths[screenName] = routePathMap[screenName].path;
  });
  return paths;
};

/**
 * Check if a route is dynamic (has parameters)
 */
export const isDynamicRoute = (screenName: ScreenName | string): boolean => {
  return routePathMap[screenName]?.isDynamic || false;
};

/**
 * Get parameter name for a dynamic route
 */
export const getRouteParamName = (screenName: ScreenName | string): string | undefined => {
  return routePathMap[screenName]?.paramName;
};

