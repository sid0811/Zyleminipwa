interface TableQueries {
  [tableName: string]: string;
}

export const CreateTable: TableQueries = {
  TableUser:
    'CREATE TABLE IF NOT EXISTS table_user(user_id INTEGER PRIMARY KEY AUTOINCREMENT, user_type VARCHAR(20), targeted_shop INT(10))',
  // Sequence: 'CREATE TABLE IF NOT EXISTS sqlite_sequence(name,seq)',
  user: 'CREATE TABLE IF NOT EXISTS user (id INTEGER PRIMARY KEY AUTOINCREMENT, UserID TEXT, UserName TEXT, Password TEXT, IMEINO TEXT,AreaID TEXT,LoginID TEXT)',
  PDistributor:
    'CREATE TABLE IF NOT EXISTS PDistributor(id INTEGER PRIMARY KEY AUTOINCREMENT,DistributorID TEXT,Distributor TEXT,DistributorAlias TEXT,ERPCode TEXT,AREAID TEXT,AREA TEXT,BRANCHID TEXT,BRANCH TEXT,DISTRIBUTORGROUPID TEXT,DISTRIBUTORGROUP TEXT ,IsSelectedDistributor TEXT,DISTRIBUTORINFO TEXT,userid TEXT)',
  MJPMaster:
    'CREATE TABLE IF NOT EXISTS MJPMaster(ID TEXT, ExecutiveId TEXT, MonthYear TEXT, userid TEXT)',
  MJPMasterDetails:
    'CREATE TABLE IF NOT EXISTS MJPMasterDetails(ID INTEGER PRIMARY KEY AUTOINCREMENT, MJPMasterID TEXT, PlannedDate TEXT,EntityType TEXT,EntityTypeID TEXT,ActivityTitle TEXT,IsActivityDone TEXT, userid TEXT)',
  SubGroupMaster:
    'CREATE TABLE IF NOT EXISTS SubGroupMaster(Id TEXT, GroupId TEXT, Name TEXT)',
  MeetReport:
    'CREATE TABLE IF NOT EXISTS MeetReport(ID,Meeting_Id TEXT,Shop_Id TEXT,Shop_name TEXT,PlannedDate TEXT, Time TEXT,location TEXT,Remarks TEXT,IsActivityDone TEXT,Type_sync TEXT,collection_type TEXT,latitude TEXT,longitude TEXT,TotalAmount TEXT,UserID TEXT,CurrentDatetime TEXT,DefaultDistributorId TEXT,ExpectedDeliveryDate TEXT,FromDate TEXT, ToDate Text)',
  Sales:
    'CREATE TABLE IF NOT EXISTS Sales(id INTEGER PRIMARY KEY AUTOINCREMENT,UserID TEXT,DistributorID TEXT,CustomerID TEXT,Month INT,ItemID TEXT,Quantity TEXT,Value TEXT,user_id TEXT)',
  Target:
    'CREATE TABLE IF NOT EXISTS Target(id INTEGER PRIMARY KEY AUTOINCREMENT,UserID TEXT,TDate TEXT,ClassificationID TEXT,ClassificationName TEXT,Target REAL)',
  Pcustomer:
    'CREATE TABLE IF NOT EXISTS Pcustomer(id INTEGER PRIMARY KEY AUTOINCREMENT,CustomerId Text,Party TEXT,LicenceNo TEXT,IsActive TEXT,ERPCode TEXT,RouteID TEXT,RouteName TEXT,AREAID TEXT,AREA TEXT,BRANCHID TEXT,BRANCH TEXT,CUSTOMERCLASSID TEXT,CUSTOMERCLASS TEXT,CUSTOMERCLASS2ID TEXT,CUSTOMERCLASS2 TEXT,CUSTOMERGROUPID TEXT,CUSTOMERGROUP TEXT,CUSTOMERSEGMENTID TEXT,CUSTOMERSEGMENT TEXT,CUSTOMERSUBSEGMENTID TEXT, CUSTOMERSUBSEGMENT TEXT,LICENCETYPEID TEXT,LICENCETYPE TEXT,OCTROIZONEID TEXT,OCTROIZONE TEXT,Outlet_Info TEXT,DefaultDistributorId TEXt,SchemeID TEXT,PriceListId TEXT,userid TEXT,Latitude TEXT,Longitude TEXT,isLatLongSynced TEXT,WeeklyOff TEXT,CreditLimit TEXT,CreditDays TEXT)',
  DistributorContacts:
    'CREATE TABLE IF NOT EXISTS DistributorContacts(id INTEGER PRIMARY KEY AUTOINCREMENT,DistributorID TEXT,SequenceNo TEXT,ContactPerson TEXT,ContactNumber TEXT, userid TEXT)',
  DistributorDataStatus:
    'CREATE TABLE IF NOT EXISTS DistributorDataStatus(id INTEGER PRIMARY KEY AUTOINCREMENT,Branch TEXT, DistributorID TEXT, Area TEXT, Day7 TEXT, Day6 TEXT,Day5 TEXT, Day4 TEXT, Day3 TEXT, Day2 TEXT, Day1 TEXT, LastUploadDate TEXT, LastInvoiceDate TEXT,userid TEXT)',
  SalesYTD:
    'CREATE TABLE IF NOT EXISTS SalesYTD(id INTEGER PRIMARY KEY AUTOINCREMENT,UserID TEXT, DistributorID TEXT, CustomerID TEXT, ItemID TEXT, Quantity TEXT, Value TEXT, user_id TEXT)',
  ReportControlMaster:
    'CREATE TABLE IF NOT EXISTS ReportControlMaster(id INTEGER PRIMARY KEY AUTOINCREMENT,ControlName TEXT, ControlId TEXT, ReferenceColumn TEXT)',
  Report:
    'CREATE TABLE IF NOT EXISTS Report(id INTEGER PRIMARY KEY AUTOINCREMENT,MenuKey TEXT, Classification TEXT, ComboClassification TEXT,LabelName TEXT,IsActive TEXT)',
  Settings:
    'CREATE TABLE IF NOT EXISTS Settings(id INTEGER PRIMARY KEY AUTOINCREMENT,Key TEXT, Value TEXT)',
  AreaParentList:
    'CREATE TABLE IF NOT EXISTS AreaParentList(id INTEGER PRIMARY KEY AUTOINCREMENT,Areaid TEXT, Area TEXT,AreaParentId TEXT)',
  CollectionTypes:
    'CREATE TABLE IF NOT EXISTS CollectionTypes(Id TEXT,Type TEXT)',
  PItem:
    'CREATE TABLE IF NOT EXISTS PItem(id INTEGER PRIMARY KEY AUTOINCREMENT,ItemId TEXT, Item TEXT, ItemAlias TEXT, BPC TEXT, BPC1 TEXT, BPC2 TEXT,ErpCode TEXT, Volume TEXT, ReportingQuantity TEXT, MRP TEXT, PTR TEXT, BRANDID TEXT, BRAND TEXT, DIVISIONID TEXT, DIVISION TEXT, FLAVOURID TEXT, FLAVOUR TEXT, ITEMCLASSID TEXT, ITEMCLASS TEXT, ITEMGROUPID TEXT, ITEMGROUP TEXT, ITEMSIZEID  TEXT, ITEMSIZE TEXT, ITEMSUBGROUPID TEXT, ITEMSUBGROUP TEXT, ITEMTYPEID TEXT, ITEMTYPE TEXT, ITEMSEQUENCE TEXT, Focus TEXT,IsSelectedBrand TEXT,IsSelectedBrandProduct TEXT,bottleQut TEXT,SchemeID TEXT,ScanCode TEXT,userid TEXT,GSTRate TEXT)',
  SIPREPORT:
    'CREATE TABLE IF NOT EXISTS SIPREPORT(id INTEGER PRIMARY KEY AUTOINCREMENT,UserId TEXT,ReportMonth TEXT,SrNo TEXT,AEID TEXT,AMID TEXT,AM TEXT,Executive TEXT,FromDate TEXT,ToDate TEXT,TargetPoints TEXT,TotalPoints TEXT,TargetAcheived TEXT,TeamAcheived TEXT,TeamAcheivementQuantity TEXT,TeamTargetQuantity TEXT,IsManager TEXT,Percentage TEXT,Bucket TEXT)',
  TABLE_TEMP_OrderMaster:
    'CREATE TABLE IF NOT EXISTS TABLE_TEMP_OrderMaster(id TEXT,Current_date_time TEXT,entity_type TEXT,entity_id TEXT,latitude TEXT,longitude TEXT,total_amount TEXT,collection_type TEXT,user_id TEXT,selected_flag TEXT)',
  TABLE_TEMP_ImagesDetails:
    'CREATE TABLE IF NOT EXISTS TABLE_TEMP_ImagesDetails(id INTEGER PRIMARY KEY AUTOINCREMENT,outlet_id TEXT,latitude TEXT,longitude TEXT,image_date_time TEXT,image_name TEXT,user_id TEXT)',
  TABLE_TEMP_ORDER_DETAILS:
    'CREATE TABLE IF NOT EXISTS TABLE_TEMP_ORDER_DETAILS(id INTEGER PRIMARY KEY AUTOINCREMENT,order_id TEXT,item_id TEXT,item_Name TEXT,quantity_one TEXT,quantity_two TEXT,small_Unit  TEXT,large_Unit  TEXT,from_date TEXT,to_date TEXT,rate TEXT ,bpc TEXT ,Amount TEXT,selected_flag TEXT,bottleQty TEXT,BrandId TEXT,entityId TEXT,CollectionType TEXT,TEMP_BRAND TEXT,TEMP_DIVISION TEXT,TEMP_FLAVOUR TEXT,SyncFlag TEXT)',
  OrderMaster:
    'CREATE TABLE IF NOT EXISTS OrderMaster(id TEXT ,Current_date_time TEXT,entity_type TEXT,entity_id TEXT,latitude TEXT,longitude TEXT,total_amount TEXT,from_date TEXT,to_date TEXT,collection_type TEXT,user_id TEXT,remark TEXT,selected_flag TEXT,sync_flag TEXT,check_date TEXT,DefaultDistributorId TEXT,ExpectedDeliveryDate TEXT,ActivityStatus TEXT,ActivityStart TEXT,ActivityEnd TEXT,userid TEXT)',
  OrderDetails:
    'CREATE TABLE IF NOT EXISTS OrderDetails(id INTEGER PRIMARY KEY AUTOINCREMENT,order_id TEXT,item_id TEXT,item_Name TEXT,quantity_one TEXT,quantity_two TEXT,small_Unit   TEXT,large_Unit  TEXT,rate TEXT ,Amount TEXT,selected_flag TEXT,sync_flag TEXT,bottleQty TEXT,BrandId TEXT,entityId TEXT,CollectionType TEXT,userid TEXT)',
  uses_log:
    'CREATE TABLE IF NOT EXISTS uses_log(id INTEGER PRIMARY KEY AUTOINCREMENT,menu_keys TEXT,uses_datetime TEXT,is_sync TEXT)',
  DiscountMaster:
    'CREATE TABLE IF NOT EXISTS DiscountMaster(ID Text,Code TEXT,DT_DESC TEXT,userid TEXT)',
  SchemeMaster:
    'CREATE TABLE IF NOT EXISTS SchemeMaster(ID Text,Code TEXT,DT_DESC TEXT,userid TEXT)',
  PriceListClassification:
    'CREATE TABLE IF NOT EXISTS PriceListClassification(ClassificationId TEXT,ItemId TEXT,Price TEXT,DistributorId TEXT,userid TEXT)',
  PJPMaster:
    'CREATE TABLE IF NOT EXISTS PJPMaster(RouteID Text,RouteName TEXT,userid TEXT)',
  ImagesDetails:
    'CREATE TABLE IF NOT EXISTS ImagesDetails(id INTEGER PRIMARY KEY AUTOINCREMENT,order_id TEXT,image_date_time TEXT,image_name TEXT,Path TEXT,is_sync TEXT)',
  TABLE_TEMP_CategoryDiscountItem:
    'CREATE TABLE IF NOT EXISTS TABLE_TEMP_CategoryDiscountItem(id INTEGER PRIMARY KEY AUTOINCREMENT,DiscountId TEXT,OrderId TEXT,ItemId TEXT,OnQtyCS TEXT,OnQtyBTL TEXT,OnAmount TEXT,SyncFlag TEXT)',
  UniqueOrder:
    'CREATE UNIQUE INDEX IF NOT EXISTS UniqueOrder ON TABLE_TEMP_ORDER_DETAILS(order_id, item_id)',
  newpartyoutlet:
    'CREATE TABLE IF NOT EXISTS newpartyoutlet(id INTEGER PRIMARY KEY AUTOINCREMENT,OrderID TEXT,BitID TEXT,OutletName TEXT,ContactNo TEXT,OwnersName TEXT,OutletAddress TEXT,Remark TEXT,Latitude TEXT ,Longitude TEXT ,Is_Sync TEXT,AddedDate TEXT,ShopType TEXT,RegistrationNo TEXT,ShopId TEXT ,ContactPerson TEXT ,ShopArea TEXT, UserId TEXT)',
  newpartyImageoutlet:
    'CREATE TABLE IF NOT EXISTS newpartyImageoutlet(id INTEGER PRIMARY KEY AUTOINCREMENT,OrderID TEXT,Is_Sync TEXT,ImageName TEXT,ImagePath TEXT)',
  uommaster:
    'CREATE TABLE IF NOT EXISTS uommaster(id INTEGER PRIMARY KEY AUTOINCREMENT, UOMDescription TEXT, ConvToBase TEXT, Formula TEXT, UOMKey TEXT, IsQuantity TEXT, ConversionFormula TEXT,ConversionUomFormula TEXT)',
  TABLE_DISCOUNT:
    'CREATE TABLE IF NOT EXISTS TABLE_DISCOUNT(id INTEGER PRIMARY KEY AUTOINCREMENT, OrderID TEXT, DiscountType TEXT, DiscountAmount TEXT,discountadd TEXT, discountless TEXT,RNP TEXT,OnAmount TEXT,OnAmountSmallUnit TEXT,Rate TEXT,BookCode TEXT,OrderedItemID TEXT,BrandCode TEXT,ItemCode TEXT,syncFlag TEXT, DiscountOnType TEXT, Cases TEXT, Bottle TEXT, Amount TEXT, BPC TEXT, BtlConversion TEXT, flag TEXT )',
  TEMP_TABLE_DISCOUNT:
    'CREATE TABLE IF NOT EXISTS TEMP_TABLE_DISCOUNT(id INTEGER PRIMARY KEY AUTOINCREMENT, OrderID TEXT, SelectedDiscType TEXT, SelectedDiscINType TEXT, discountON TEXT, PercentCalNum TEXT, CalcNum TEXT,totalAmt TEXT)',
  OutletAssetInformation:
    'CREATE TABLE IF NOT EXISTS OutletAssetInformation(id INTEGER PRIMARY KEY AUTOINCREMENT,CustomerID TEXT, AssetID TEXT, AssetQRcode TEXT,AssetInformation TEXT,ScanFlag TEXT, userid TEXT)',
  AssetTypeClassificationList:
    'CREATE TABLE IF NOT EXISTS AssetTypeClassificationList(id INTEGER PRIMARY KEY AUTOINCREMENT, AssetTypeID TEXT, AssetName TEXT, ClassificationList TEXT)',
  AssetPlacementVerification:
    'CREATE TABLE IF NOT EXISTS AssetPlacementVerification(id INTEGER PRIMARY KEY AUTOINCREMENT, OrderID TEXT, AssetID TEXT, QRCode TEXT, ScanStatus TEXT, AssetInformation TEXT,Remark TEXT,Condition TEXT,AuditDate TEXT,userid TEXT)',
  Discounts:
    'CREATE TABLE IF NOT EXISTS Discounts(ID TEXT,OrderID TEXT,DiscountType TEXT, DiscountAmount TEXT,discountadd TEXT, discountless TEXT,RNP TEXT,OnAmount TEXT,OnAmountSmallUnit TEXT,Rate TEXT,BookCode TEXT,OrderedItemID TEXT,BrandCode TEXT,ItemCode TEXT)',
  SurveyMaster:
    'CREATE TABLE IF NOT EXISTS SurveyMaster(ID TEXT PRIMARY KEY, SurveyName TEXT,CompanyName TEXT,CustomerID TEXT, PublishedDate TEXT,TimeRequired TEXT,SurveyURL TEXT,SurveyDoneDate TEXT)',
  Resources:
    'CREATE TABLE IF NOT EXISTS Resources(ID TEXT,ResourceName TEXT, ParentResourceID TEXT,URL TEXT, Descreption TEXT,FileName TEXT, SequenceNo TEXT,IsDownloadable TEXT, ResourceType TEXT,CreatedDate TEXT,LastUpdatedDate TEXT)',
  SchemeDetails:
    'CREATE TABLE IF NOT EXISTS SchemeDetails(ID TEXT,SchemeID TEXT, SchemeName TEXT,FromDate TEXT, ToDate TEXT,SlabNo TEXT, SchemeBenefits TEXT,Remarks TEXT)',
  Receipt:
    'CREATE TABLE IF NOT EXISTS Receipt(id INTEGER PRIMARY KEY AUTOINCREMENT, Date TEXT,PaymentMode TEXT,ChqueNo TEXT,ChqueDate TEXT,BankName TEXT,Amount TEXT,PartyCode TEXT,Narration TEXT,SalemanCode TEXT,SyncFlag TEXT,dateupload TEXT,datetime TEXT)',
  OutstandingDetails:
    'CREATE TABLE IF NOT EXISTS OutstandingDetails(ID TEXT , PartyCode TEXT,Document TEXT,Date TEXT,DisPactchDate TEXT,Amount TEXT, OSAmount TEXT , OSDocument TEXT,InvoiceDate TEXT,DiscountAc TEXT,PdcAmt TEXT,PdcDate TEXT,CDStatus TEXT,Narration TEXT,TpNo TEXT,LedgerCode TEXT,CDPercentage TEXT,ChqNo TEXT,PayslipNo TEXT,ReceivedAmt TEXT,Lag TEXT,UnAllocated TEXT,NetOsAmt TEXT,VhrNo TEXT,PartyName TEXT,Location TEXT,userid TEXT)',
  TempOutstandingDetails:
    'CREATE TABLE IF NOT EXISTS TempOutstandingDetails(ID INTEGER PRIMARY KEY AUTOINCREMENT , PartyCode TEXT,Document TEXT,Date TEXT,DisPactchDate TEXT,Amount TEXT, OSAmount TEXT , OSDocument TEXT,InvoiceDate TEXT,DiscountAc TEXT,PdcAmt TEXT,PdcDate TEXT,CDStatus TEXT,Narration TEXT,TpNo TEXT,LedgerCode TEXT,CDPercentage TEXT,ChqNo TEXT,PayslipNo TEXT,ReceivedAmt TEXT,Lag TEXT,UnAllocated TEXT,NetOsAmt TEXT,VhrNo TEXT,PartyName TEXT,Location TEXT, OrderID TEXT , Sync_flag TEXT , CollectionDate TEXT)',
  ChequeReturnDetails:
    'CREATE TABLE IF NOT EXISTS ChequeReturnDetails(ID TEXT, PartyCode TEXT,ReceiptNo TEXT,ReceiptDate TEXT,ChqNo TEXT,ChqDate TEXT,ChqAmt TEXT,BankName TEXT,Branch TEXT,BounceDate TEXT,userid TEXT)',
  TX_PaymentReceipt:
    'CREATE TABLE IF NOT EXISTS TX_PaymentReceipt(ID TEXT, ReceivedDateTime TEXT,PaymentMode TEXT,ChequeNo TEXT,ChequeDated TEXT,BankDetails TEXT,Amount TEXT,OutletID TEXT,Narration TEXT,ExecutiveID TEXT,userid TEXT)',
  TX_PaymentReceipt_log:
    'CREATE TABLE IF NOT EXISTS TX_PaymentReceipt_log(ID TEXT, ReceivedDateTime TEXT,PaymentMode TEXT,ChequeNo TEXT,ChequeDated TEXT,BankDetails TEXT,Amount TEXT,OutletID TEXT,Narration TEXT,ExecutiveID TEXT)',
  TX_Collections:
    'CREATE TABLE IF NOT EXISTS TX_Collections(MobileGenPrimaryKey TEXT,InvoiceCode TEXT,AllocatedAmount TEXT,CollectionDatetime TEXT,PartyCode TEXT,userid TEXT)',
  TX_Collections_log:
    'CREATE TABLE IF NOT EXISTS TX_Collections_log(MobileGenPrimaryKey TEXT,InvoiceCode TEXT,AllocatedAmount TEXT,CollectionDatetime TEXT,PartyCode TEXT)',
  TX_CollectionsDetails:
    'CREATE TABLE IF NOT EXISTS TX_CollectionsDetails( CollectionID TEXT,Amount TEXT,DiscountType TEXT,InvoiceCode TEXT)',
  TX_CollectionsDetails_log:
    'CREATE TABLE IF NOT EXISTS TX_CollectionsDetails_log( CollectionID TEXT,Amount TEXT,DiscountType TEXT,InvoiceCode TEXT)',
  PendingOrdersDiscount:
    'CREATE TABLE IF NOT EXISTS PendingOrdersDiscount(Id TEXT,POD_POM_ID TEXT ,POD_PARTY_CODE TEXT,POM_DOC_NO,POD_LEDGER_CODE TEXT,POD_LEDGER_NAME TEXT,POD_RNP TEXT,POD_RATE TEXT,POD_QUANTITY TEXT,POD_TOTALDISCOUNT TEXT,POD_SALESMAN_CODE TEXT,DistributorID TEXT,POM_INSERTEDDATE TEXT)',
  PendingOrdersDetails:
    'CREATE TABLE IF NOT EXISTS PendingOrdersDetails(Id TEXT,DistributorID TEXT,POD_POM_ID TEXT,POD_PAM_PARTY_CODE TEXT,POD_DOC_NO TEXT,POD_ITEM_CODE TEXT,POD_ITEM_NAME TEXT,POD_SQTY TEXT,POD_FQTY TEXT,POD_RATE TEXT,POD_AMOUNT TEXT,POD_SALESMAN_CODE TEXT,POD_DIST_NAME TEXT,POD_LASTEDITDATE TEXT,POD_INSERTEDDATE TEXT)',
  PendingOrdersMaster:
    'CREATE TABLE IF NOT EXISTS PendingOrdersMaster(Id TEXT,DistributorID TEXT,POM_PAM_PARTY_CODE TEXT,POM_DOC_NO TEXT,POM_DOC_DATE TEXT,POM_DOC_TYPE TEXT,POM_DOC_AMOUNT TEXT,POM_SALESMAN_CODE TEXT,POM_DIST_NAME TEXT,POM_LASTEDITDATE TEXT,POM_INSERTEDDATE TEXT)',
  VW_PendingOrders:
    'CREATE TABLE IF NOT EXISTS VW_PendingOrders(Party TEXT,Id TEXT,POM_DOC_NO TEXT,POM_DOC_DATE TEXT,POM_DOC_AMOUNT TEXT,POD_ITEM_NAME TEXT,POD_SQTY TEXT,POD_FQTY TEXT,POD_LEDGER_NAME TEXT,POD_RNP TEXT,POD_RATE TEXT,POD_QUANTITY TEXT,POD_TOTALDISCOUNT TEXT,userid TEXT)',
  MultiEntityUser:
    'CREATE TABLE IF NOT EXISTS MultiEntityUser(UserId TEXT,DistributorId TEXT,DivisionId TEXT,Distributor TEXT)',
  OnlineParentArea:
    'CREATE TABLE IF NOT EXISTS OnlineParentArea(AreaId INTEGER, Area TEXT)',
};

