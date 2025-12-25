# Phase 6 & 7 Comprehensive Migration Plan

## 📋 Migration Strategy

### Priority Order:
1. **ShopsDetails TabScreens** (Complete the ShopsDetails flow)
2. **AddNewShop Screens** (Core functionality)
3. **Order Screens** (High priority - Core business logic)
4. **Report Screens** (Medium priority - Analytics)

---

## 🎯 ShopsDetails TabScreens

### Simple Screens (Start Here):
- ✅ **Surveys.tsx** - Survey list display
- ✅ **Payment.tsx** - Payment details
- ✅ **Remarks.tsx** - Remarks display
- ✅ **Schemes.tsx** - Schemes display
- ✅ **Assets.tsx** - Assets display

### Complex Screens:
- ⏳ **InfoTab.tsx** - Complex with map, images, profile data
- ⏳ **Orders.tsx** - Order list with filters
- ⏳ **DataCollection.tsx** - Data collection lists
- ⏳ **Meeting.tsx** - Uses DateSelectionActivity component

---

## 🏪 AddNewShop Screens

- ⏳ **AddNewShop1.tsx** - Step 1: Basic info, route, distributor selection
- ⏳ **AddNewShop2.tsx** - Step 2: Additional details, submission

---

## 📦 Order Screens

### Main Order Screens:
- ⏳ **CreateNewOrderStep1.tsx** - Order creation step 1
- ⏳ **CreateNewOrderStep2.tsx** - Order creation step 2
- ⏳ **CreateNewOrderStep3.tsx** - Order creation step 3 (preview/submit)

### Side Order Screens:
- ⏳ **InProcessOrder.tsx** - Pending orders list
- ⏳ **OrderHistory.tsx** - Completed orders list
- ⏳ **PreOrder.tsx** - Pre-orders
- ⏳ **PendingOrder.tsx** - Pending orders
- ⏳ **SideOrderDetail.tsx** - Order detail view

### Order Components:
- ⏳ **OrderMain.tsx** - Main order component
- ⏳ **EditOrderCNO.tsx** - Edit order component
- ⏳ **SearchListCNO2.tsx** - Search list component
- ⏳ **TopCardCNO2.tsx** - Top card component

---

## 📊 Report Screens

### Main Reports:
- ⏳ **MyReportList.tsx** - Report listing
- ⏳ **BrandWiseSaleReport.tsx** - Brand-wise sales
- ⏳ **TargetVsAchievementReport.tsx** - Target vs achievement
- ⏳ **MyActivityReport.tsx** - Activity report
- ⏳ **OutletVisitReports.tsx** - Outlet visit reports
- ⏳ **OutletPerformanceReport1.tsx** - Outlet performance
- ⏳ **OutletPerformanceReport2.tsx** - Outlet performance extended
- ⏳ **OutletVisitActivity.tsx** - Visit activity
- ⏳ **LiveLocationMapView.tsx** - Live location map
- ⏳ **VisitBasedMapView.tsx** - Visit-based map
- ⏳ **DistributorDataStatus.tsx** - Distributor data status

---

## 🗄️ Phase 7: Database Functions

### Remaining Database Functions:
- ⏳ Complete `insertAllData` implementation
- ⏳ All remaining query functions
- ⏳ Migration logic
- ⏳ Data sync functions

---

## 📝 Migration Rules

### UI Preservation:
- ✅ Exact color values from `Colors` theme
- ✅ Same layout and spacing (adapted to web units)
- ✅ Same functionality and logic
- ✅ PWA responsive design

### Component Adaptations:
- `View` → Material-UI `Box`
- `Text` → Material-UI `Typography`
- `TouchableOpacity` → Material-UI `Button` / `IconButton`
- `FlatList` / `FlashList` → Standard `map` or Material-UI `Grid`
- `Modal` → Material-UI `Dialog`
- `Image` → `<img>` tag
- `StyleSheet` → Material-UI `sx` prop

### Navigation:
- `navigation.navigate()` → `navigate()` from `react-router-dom`
- `navigation.goBack()` → `navigate(-1)`
- `useFocusEffect` → `useEffect` with route detection

---

## 🚀 Current Status

**Starting with simple TabScreens to build momentum, then moving to complex screens.**


