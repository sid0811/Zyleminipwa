# Screen Migration Plan - Phase 4

## 📋 **Screen Migration Strategy**

### **Priority Order (Based on Complexity & Dependencies)**

#### **Phase 4.1: Core Screens (High Priority)**
1. ✅ `Splash/SplashScreen.tsx` - Already exists (basic)
2. ⏳ `Login/Login.tsx` - Already exists (basic), needs full implementation
3. ⏳ `Dashboard/Dashboard.tsx` - Already exists (basic), needs full implementation

#### **Phase 4.2: Essential Feature Screens (Medium Priority)**
4. ⏳ `Shops/ShopsFront/` - Shop listing
5. ⏳ `Shops/ShopsDetails/` - Shop details
6. ⏳ `Order/CreateNewOrder/` - Order creation
7. ⏳ `CollectionModule/MainScreen/` - Collections
8. ⏳ `DataCollection/DataCollectionStep1.tsx` - Data collection

#### **Phase 4.3: Secondary Feature Screens (Lower Priority)**
9. ⏳ `Reports/` - All report screens
10. ⏳ `ActivityModule/` - Activity screens
11. ⏳ `POD/PODMainScreens/` - POD screens
12. ⏳ `Survey/` - Survey screens
13. ⏳ `Resources/` - Resource screens
14. ⏳ `SideMenu/` - Side menu
15. ⏳ `Sync/` - Sync screens

---

## 🔄 **Screen Migration Process**

### **For Each Screen:**

1. **Read React Native Screen**
2. **Identify React Native Dependencies:**
   - `react-native` components (View, Text, ScrollView, etc.)
   - `react-native-responsive-screen` (wp, hp)
   - Navigation (React Navigation → React Router)
   - Native modules (Camera, Permissions, etc.)

3. **Web Adaptations Needed:**
   - Replace `View` → `<div>` or Material-UI `Box`
   - Replace `Text` → `<p>` or Material-UI `Typography`
   - Replace `ScrollView` → Material-UI `Container` or native scroll
   - Replace `TouchableOpacity` → Material-UI `Button` or `<button>`
   - Replace `Image` → `<img>` or Material-UI `Avatar`
   - Replace `StyleSheet` → CSS modules or Material-UI `sx` prop
   - Replace `wp()/hp()` → CSS units (vw, vh, %, rem, em)
   - Replace `navigation.navigate()` → `useNavigate()` from React Router
   - Replace native modules → Web APIs

4. **Copy & Adapt:**
   - Copy screen file
   - Replace all React Native components
   - Update navigation calls
   - Update styling
   - Test compilation

---

## 📊 **Screen Complexity Analysis**

### **Simple Screens (Easy to Migrate)**
- `Splash/SplashScreen.tsx` - Basic loading screen
- `Login/Login.tsx` - Form with inputs
- `SideMenu/SideMenuList.tsx` - Menu list

### **Medium Complexity Screens**
- `Dashboard/Dashboard.tsx` - Charts, lists, multiple components
- `Shops/ShopsFront/` - List with filters
- `Reports/MyReportList.tsx` - List screen

### **Complex Screens (Require Significant Adaptation)**
- `Shops/ShopsDetails/` - Multiple tabs, maps, images
- `Order/CreateNewOrder/` - Complex forms, calculations
- `CollectionModule/` - Payment processing, multiple steps
- `Dashboard/ManagerDashboard/` - Charts, graphs, data visualization

---

## 🎯 **Migration Approach**

### **Option 1: Incremental (Recommended)**
- Start with simple screens
- Build reusable web components
- Gradually migrate complex screens
- **Pros**: Learn patterns, build component library
- **Cons**: Slower initial progress

### **Option 2: Feature-by-Feature**
- Complete one feature module at a time
- **Pros**: Complete features, easier testing
- **Cons**: May need to revisit for component reuse

### **Option 3: Component-First**
- Migrate all components first
- Then migrate screens using components
- **Pros**: Better code reuse, consistent UI
- **Cons**: Requires understanding all component dependencies

---

## 📝 **Recommended: Hybrid Approach**

1. **First**: Migrate core screens (Login, Splash, Dashboard)
2. **Second**: Migrate essential components (Buttons, Inputs, Cards)
3. **Third**: Migrate feature screens using migrated components
4. **Fourth**: Migrate complex screens with custom adaptations

---

## 🔧 **Common Adaptations Needed**

### **Navigation**
```typescript
// React Native
navigation.navigate(ScreenName.DASHBOARD);

// Web (React Router)
const navigate = useNavigate();
navigate('/dashboard');
```

### **Styling**
```typescript
// React Native
const styles = StyleSheet.create({
  container: {
    width: wp('100%'),
    height: hp('50%'),
  }
});

// Web
const styles = {
  container: {
    width: '100vw',
    height: '50vh',
  }
};
```

### **Components**
```typescript
// React Native
<View style={styles.container}>
  <Text>Hello</Text>
  <TouchableOpacity onPress={handlePress}>
    <Text>Click</Text>
  </TouchableOpacity>
</View>

// Web
<Box sx={styles.container}>
  <Typography>Hello</Typography>
  <Button onClick={handlePress}>
    Click
  </Button>
</Box>
```

---

## ⚠️ **Challenges to Address**

1. **Camera/Image Picker** - Use Web Camera API
2. **File System** - Use IndexedDB/Blob storage
3. **Permissions** - Use Web Permissions API
4. **Background Tasks** - Limited (Service Workers)
5. **Push Notifications** - Web Push API
6. **Maps** - Google Maps JavaScript API
7. **Charts** - Recharts (already in dependencies)

---

## 📅 **Estimated Timeline**

- **Phase 4.1** (Core Screens): 2-3 days
- **Phase 4.2** (Essential Features): 5-7 days
- **Phase 4.3** (Secondary Features): 7-10 days
- **Total**: ~2-3 weeks for all screens

---

**Status**: Ready to begin Phase 4
**Next**: Start with Login screen full implementation


