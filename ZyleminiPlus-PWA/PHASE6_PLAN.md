# Phase 6: Additional Screens Migration Plan

## 📋 **Migration Strategy**

### **Priority Order:**
1. **Shops Screens** (High Priority - Core functionality)
   - ShopsList (main listing)
   - ShopsDetails (detail view with tabs)
   - AddNewShop (create new shop)

2. **Order Screens** (High Priority - Core functionality)
   - CreateNewOrder (order creation flow)
   - InProcessOrder (pending orders)
   - OrderHistory (completed orders)
   - OrderMain (order editing component)

3. **Reports Screens** (Medium Priority)
   - MyReportList
   - BrandWiseSaleReport
   - TargetVsAchievementReport
   - Other report screens

4. **Other Feature Screens** (Lower Priority)
   - Collections
   - POD
   - Surveys
   - Resources
   - Data Collection

---

## 🎨 **UI Preservation Guidelines**

### **Key Requirements:**
- ✅ **Same Colors**: Use exact same color values from `Colors` theme
- ✅ **Same Layout**: Maintain same component structure and positioning
- ✅ **Same Functionality**: All features work the same way
- ✅ **PWA Responsive**: Adapt to different screen sizes (mobile, tablet, desktop)
- ✅ **Material-UI Components**: Use Material-UI but style to match original design

### **Adaptation Rules:**
- `View` → Material-UI `Box` (with same styling)
- `Text` → Material-UI `Typography` (with same font sizes/weights)
- `TouchableOpacity` → Material-UI `Button` / `IconButton` (with same colors)
- `FlatList` / `FlashList` → Material-UI `Grid` or custom list (maintain same layout)
- `StyleSheet` → Material-UI `sx` prop (convert wp/hp to responsive units)
- `Image` → `<img>` or Material-UI `Avatar` (same dimensions)
- `Modal` → Material-UI `Dialog` (same behavior)

---

## 📊 **Screen Breakdown**

### **Shops Module:**
- `ShopsList.tsx` - Main shop listing with search, filters, route selection
- `ShopsDetails.tsx` - Shop detail view with tabs (Info, Orders, Data Collection, Surveys, Meeting)
- `AddNewShop1.tsx` / `AddNewShop2.tsx` - Add new shop flow
- Components: `CardView`, `ListCardView`, `TopCard`, `ShopHeader`

### **Order Module:**
- `CreateNewOrderStep1.tsx` / `Step2.tsx` / `Step3.tsx` - Order creation flow
- `InProcessOrder.tsx` - Pending orders list
- `OrderHistory.tsx` - Completed orders list
- `PreOrder.tsx` - Pre-orders
- Components: `OrderMain`, `SearchListCNO2`, `EditOrderCNO`, etc.

### **Reports Module:**
- `MyReportList.tsx` - Report listing
- `BrandWiseSaleReport.tsx` - Brand-wise sales report
- `TargetVsAchievementReport.tsx` - Target vs achievement
- Other report screens

---

## 🚀 **Starting with Shops Screens**

**First**: ShopsList (most used screen)
**Then**: ShopsDetails (complex with multiple tabs)
**Finally**: AddNewShop

---

**Status**: Phase 6 Planning Complete
**Next**: Start migrating ShopsList screen


