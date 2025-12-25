export interface DashGraph {
  CollectionStatus: DashGraphData[];
  CollectionVisible: CollectionVisible[];
  MarketCalls: DashGraphData[];
  SalesTrend: SalesTrend[];
  Target: DashGraphData[];
  UserDetails: UserDetails[];
  ApiVersion: string;
  AppendVersion: string;
  ConsentAPIVersion: string;
  ConsentAppVersion: string;
}

export interface DashGraphData {
  color: string;
  label: string;
  value: number;
}
export interface CollectionVisible {
  IsVisible: number;
}
export interface SalesTrend {
  month: string;
  value: number;
}
export interface UserDetails {
  Attendance_at: string;
  Last_shop_Visit: string;
  Shops_Covered: string;
}

export interface UserChildren {
  UserChildren: ExecutiveList[];
}

export interface ExecutiveList {
  Id: string;
  Name: string;
}

export interface RouteData {
  RouteID: string;
  RouteName: string;
}

export interface DistributorData {
  DistributorID: string;
  Distributor: string;
}

export interface VisitCount {
  count: number;
}

export interface OutletArrayData {
  id: string;
  party: string;
  Outlet_Info: string;
  weeklyoff?: string;
}

export interface OutletArrayWithGeofenceData {
  id: string;
  party: string;
  Outlet_Info: string;
  isEntered: boolean;
  latitude: string | null;
  longitude: string | null;
  weeklyoff: string | null;
  isNewParty: boolean | null;
}

export interface OutletIdName {
  id: string;
  party: string;
}

export interface OutletArrayFromShop {
  Distributor: string;
  DistributorID: string;
  Outlet_Info: string;
  RouteID: string;
  RouteName: string;
  id: string;
  party: string;
  weeklyoff?: string;
}

export interface Distributor {
  Distributor: string;
  DistributorID: string;
}

export interface InfoOutletData {
  id: string;
  Party: string;
  Outlet_Info: string;
  ContactPerson: string | null;
  Latitude: string | null;
  Longitude: string | null;
  MobileNo: string | null;
  Owner: string | null;
  RegisteredOn: string | null;
  RegistrationNo: string | null;
  ShopArea: string | null;
  ShopId: string | null;
  ShopType: string | null;
}

export interface BrandSearch {
  BRAND: string;
  BRANDID: string;
  bottleQty: string;
}

export interface EntityType {
  id: number;
  value: string;
}

export interface SettingTable {
  Value: string;
}

export interface NotSyncedDataCount {
  TotalCount: number;
}

export interface IdFromOMaster {
  id: string;
}

export interface DefaultDistributorId {
  Distributor(Distributor: any): unknown;
  DefaultDistributorId: string;
}

export interface getRemarkDetails {
  ExpectedDeliveryDate: string;
  ActivityStart: string;
  ActivityEnd: string;
  remark: string;
}

export interface QRPItem {
  ItemId: string;
  Item: string;
  BRAND: string;
  BRANDID: string;
  ITEMSEQUENCE: string;
  PTR: string;
  BPC: string;
  FLAVOUR: string;
  DIVISION: string;
}

export interface MultiEntityUserTable {
  UserId: string;
  DistributorId: string;
  Distributor: string;
  DivisionId: string;
}

export interface SurveyMasterTable {
  ID: string;
  SurveyName: string;
  CompanyName: string;
  CustomerID: string;
  PublishedDate: string;
  TimeRequired: string;
  SurveyURL: string;
  SurveyDoneDate: string;
}

export interface OutStandingDetailsCollections {
  Amount: number;
  CDPercentage: string;
  CDStatus: string;
  ChqNo: string;
  Date: string;
  DisPactchDate: string;
  DiscountAc: string;
  Document: string;
  ID: string;
  InvoiceDate: string;
  Lag: string;
  LedgerCode: string;
  Location: string;
  Narration: string;
  NetOsAmt: string;
  OSAmount: number;
  OSDocument: string;
  PartyCode: string;
  PartyName: string;
  PayslipNo: string;
  PdcAmt: string;
  PdcDate: string;
  ReceivedAmt: string;
  TpNo: string;
  UnAllocated: string;
  VhrNo: string;
}

export interface OrderPreviewBrandList {
  Amount: string;
  bpc: string;
  from_date: string;
  id: number;
  item_Name: string;
  item_id: string;
  large_Unit: string;
  order_id: string;
  quantity_one: string;
  quantity_two: string;
  rate: string;
  small_Unit: string;
  to_date: string;
}

export interface TABLE_TEMP_ORDER_DETAILS {
  id: string;
  order_id: string;
  item_id: string;
  item_Name: string;
  quantity_one: string;
  quantity_two: string;
  small_Unit: string;
  large_Unit: string;
  from_date: string;
  to_date: string;
  rate: string;
  bpc: string;
  Amount: string;
  selected_flag: string;
  bottleQty: string;
  BrandId: string;
  entityId: string;
  CollectionType: string;
  TEMP_BRAND: string;
  TEMP_DIVISION: string;
  TEMP_FLAVOUR: string;
  SyncFlag: string;
}

export interface presentTempOrder {
  Amount: string;
  bpc: string;
  from_date: string;
  id: number;
  item_id: string;
  large_Unit: string;
  order_id: string;
  quantity_one: string;
  quantity_two: string;
  rate: string;
  selected_flag: string;
  small_Unit: string;
  to_date: string;
}

export interface AddDiscountIfPresent {
  DiscountAmount: string;
  DiscountType: string;
  RNP: string;
  Rate: string;
}

export interface OrderAddDiscount_Customfield {
  meta_name: string;
  meta_val: string;
  meta_dis: string;
  meta_discAmt: number;
}

export interface OrderSubListData {
  BPC: string;
  BRAND: string;
  DIVISION: string;
  FLAVOUR: string;
  ITEMSEQUENCE: string;
  IsSelectedBrand: string;
  IsSelectedBrandProduct: string;
  Item: string;
  ItemId: string;
  PTR: string;
  bottleQty: string;
  bottleQut: string;
  large_Unit: string;
  quantity_one: string;
  quantity_two: string;
  small_Unit: string;
  Amount: string;
}

export interface getOrderDataFromTempOrderDetailsType {
  Amount: string;
  BrandId: string;
  CollectionType: string;
  TEMP_BRAND: string | null;
  TEMP_DIVISION: string | null;
  TEMP_FLAVOUR: string | null;
  bottleQty: string;
  entityId: string;
  from_date: string;
  id: number;
  item_Name: string;
  item_id: string;
  large_Unit: string;
  order_id: string;
  quantity_one: string;
  quantity_two: string;
  rate: string;
  small_Unit: string;
  to_date: string;
}

export interface getAllOrdersType {
  AREA: string;
  Current_date_time: string;
  ExpectedDeliveryDate: string;
  Party: string;
  entity_id: string;
  id: string;
  total_amount: string;
  Distributor: string;
  from_date: string;
  isNewParty?: string;
  OrderPriority?:string;
}

export interface pendingOrders {
  Party: string;
  id: string;
  POM_DOC_NO: string;
  POM_DOC_AMOUNT: string;
  POM_DOC_DATE: string;
}

export interface pendingDiscount {
  id: string;
  POD_LEDGER_NAME: string;
  POD_RNP: string;
  POD_RATE: string;
  POD_QUANTITY: string;
  POD_TOTALDISCOUNT: string;
}

export interface pendingOrderDetail {
  Id: string;
  POD_ITEM_NAME: string;
  POD_SQTY: string;
  POD_FQTY: string;
}

export interface JoinPcustOMaster {
  AREA: string;
  AREAID: string;
  ActivityEnd: string;
  ActivityStart: string;
  ActivityStatus: string;
  BRANCH: string;
  BRANCHID: string;
  CUSTOMERCLASS: string;
  CUSTOMERCLASS2: string;
  CUSTOMERCLASS2ID: string;
  CUSTOMERCLASSID: string;
  CUSTOMERGROUP: string;
  CUSTOMERGROUPID: string;
  CUSTOMERSEGMENT: string;
  CUSTOMERSEGMENTID: string;
  CUSTOMERSUBSEGMENT: string;
  CUSTOMERSUBSEGMENTID: string;
  Current_date_time: string;
  CustomerId: string;
  DefaultDistributorId: string;
  ERPCode: string;
  ExpectedDeliveryDate: string;
  IsActive: string;
  LICENCETYPE: string;
  LICENCETYPEID: string;
  LicenceNo: string;
  OCTROIZONE: string;
  OCTROIZONEID: string;
  Outlet_Info: string;
  Party: string;
  PriceListId: string;
  RouteID: string;
  RouteName: string;
  SchemeID: string;
  check_date: string;
  collection_type: string;
  entity_id: string;
  entity_type: string;
  from_date: string;
  id: string;
  latitude: string;
  longitude: string;
  remark: string;
  selected_flag: string;
  sync_flag: string;
  to_date: string;
  total_amount: string;
  user_id: string;
  userid: string;
}

export interface getDetailsItemOMaster {
  Amount: string;
  bottleQty: string;
  item_Name: string;
  item_id: string;
  large_Unit: string;
  order_id: string;
  quantity_one: string;
  quantity_two: string;
  BPC: string;
  PTR: string;
  rate: string;
  selected_flag: string;
  small_Unit: string;
  sync_flag: string;
  GSTRate:string;
  GSTTotal:string;
  GrossAmount:string;
}

export interface getOutletParty_OP_Report {
  Party: string;
  CustomerId: string;
}
export interface getBrands_OP_Report {
  BRAND: string;
  BRANDID: string;
}
export interface getSKU_OP_Report {
  Item: string;
  ItemId: string;
}
export interface getSize_OP_Report {
  ITEMSIZE: string;
  ITEMSIZEID: string;
  Item: string;
}
export interface getBrandForBrandWise_Report {
  BRAND: string;
  BRANDID: string;
  IsSelectedBrand: string;
  IsSelectedBrandProduct: string;
}

export interface PcustLatLong {
  Latitude: string;
  Longitude: string;
  isLatLongSynced?: string;
}

export interface ShopsGelocationBody {
  ShopId: string;
  Latitude: number;
  Longitude: number;
  ShopName?: string;
  Action?: string;
  RouteID?: string;
}

export interface OutletGeofence {
  id: string;
  action?: string;
}

export interface GeofenceSettings {
  IsGeoFencingEnabled: boolean;
  IsFetchOneTimeLatLogEnabled: boolean;
  IsLocationRestriction: boolean;
  GeofenceRadius_Shop?: string;
  GeofenceRadiusLatDelat?: string;
  GeofenceRadiusLongDelat?: string;
  GeoFenceDistanceFilterMtr?: string;
  IsLiveLocationTracking: boolean;
  LiveLocationStartTime: string;
  LiveLocationEndTime: string;
  LoggedInUserId: string;
  IsShopEnteredNotificationEnabled: boolean;
  LastSyncLiveLocationApiTimeStamp: number;
  LastSyncThresholdTimeApiCall: number;
  TypeOfLiveLocationTracking: TypeOfLiveLocationTracking;
  ActivityTriggered: ActivityTirggeredTracking;
}

export interface TypeOfLiveLocationTracking {
  IsAttandanceBasedTracking: boolean;
  IsAppOpenedActivityBasedTracking: boolean;
}

export interface ActivityTirggeredTracking {
  IsAttandanceTriggeredForTheDay: boolean;
  AppOpenedActivityTriggeredForTheDay: string | undefined;
}

export interface LedgerVoucherDetail {
  'Inv.No.': string;
  'Inv.Date': string;
  'T.P.No.': string;
  'T.P.Date': string;
  'Inv.Amt.': string;
}
export interface LedgerReceiptDetail {
  Receipt_No: string;
  Date: string;
  ChequeNo: string;
  Adj_Amt: string;
  LedgerName: string;
}

export interface LedgerTotal {
  Total: string;
  Outstanding: string;
}

export interface claimPODListData {
  ClaimFromDate: null | string;
  ClaimId: number;
  CustomerId: string;
  CustomerName: string;
  Distributor: string;
  DistributorId: string;
  Entity: string;
  Id: number;
  InsertedById: number;
  PODType: string;
  UniqueKey: string;
  VoucherDate: null | string;
  VoucherNumber: string;
  IsApproved: string | number;
}
export interface MeetingEndBlockValidation {
  Meeting_Id: string;
  EntityTypeID: string;
  ActivityTitle: string;
  PlannedDate: string;
  IsActivityDone: string;
  EntityType: string;
}
export interface LocationMaster {
  UserId: number;
  LocationTakenDateTime?: string;
  latitude: number;
  longitude: number;
}
export interface ExecutiveListWithDistance {
  Id: string;
  Name: string;
  color: string;
  distanceTravelled: number;
  visitDate?: string;
}

// UOM setting table
export interface UOMMaster {
  UOMDescription: string;
  id: number | null;
}

export interface PODType {
  tabName: string;
  id: number;
}

export interface PODResponse {
  POD: {
    POD_Data: PODData[];
    POD_Image: PODImage[];
    POD_PO: PODPO[];
  };
}

interface PODData {
  ClaimId: number;
  DistributorId: string;
  Distributor: string;
  CustomerId: string;
  CustomerName: string;
  Entity: string;
  ClaimFromDate: string | null;
  VoucherDate: string | null;
  VoucherNumber: string;
  PODType: string;
  UniqueKey: string;
  Id: number;
  InsertedById: number;
  IsApproved: number;
}

export interface PODImage {
  Id: number;
  DocumentNumber: string;
  DocumentName: string;
  DocumentURL: string;
  DocumentType: string;
  Remarks: string;
  IsInvoice: number;
  IsPOD: number;
  IsOther: number;
}

export interface PODPO {
  Id: number;
  PODPONumberId: number;
  PONumber: string;
  DocumentName: string;
  InsertedDate: string;
  InsertedById: number;
  DocumentURL: string;
}

export type Bank = {BANKNAME: string; PRIORITY: number};

