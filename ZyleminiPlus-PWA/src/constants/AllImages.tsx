// Web-adapted AllImages.tsx - using public folder paths instead of require()
import Icon from '../components/Icon/Icon';
import { Colors } from '../theme/colors';

// Web: Images should be placed in public/assets/ folder
// Using public paths instead of require()
const getImagePath = (path: string) => `/assets/${path}`;

export const globalImg = {
  companyName: getImagePath('icons/pluss.png'),
  loader: getImagePath('animation/loader.json'),
  loaderloading: getImagePath('animation/lottieloading.json'),
  Logo: getImagePath('icons/zylemini_logo.png'),
  down: getImagePath('icons/down.png'),
  backgrnd: getImagePath('icons/android_BG.png'),
  deleteRed: getImagePath('icons/delete_red.png'),
  close: getImagePath('icons/Close.png'),
  plusIcon: getImagePath('icons/plus.png'),
  SortByIcon: getImagePath('icons/Sort_by.png'),
  BackIcon: <Icon family="Ionicons" name="chevron-back" size={26} />,
  BackArrow: (
    <Icon
      family="MaterialIcons"
      name="keyboard-backspace"
      size={25}
      color={Colors.white}
    />
  ),
  editVerticalDot: (
    <Icon
      family="MaterialCommunityIcons"
      name="dots-vertical"
      size={30}
      color={Colors.white}
    />
  ),
  calendarIcon: (
    <Icon
      family="MaterialIcons"
      name="calendar-today"
      size={16}
      color={Colors.white}
    />
  ),
  calendarIconBlack: (
    <Icon
      family="MaterialIcons"
      name="calendar-today"
      size={22}
      color={Colors.black}
    />
  ),
  QrIcon: (
    <Icon
      family="MaterialCommunityIcons"
      name="qrcode-scan"
      size={34}
      color={Colors.black}
    />
  ),
  Cross: <Icon family="Entypo" name="cross" size={34} color={Colors.white} />,
  rightArrow: (
    <Icon
      family="MaterialIcons"
      name="arrow-forward-ios"
      size={34}
      color={Colors.black}
    />
  ),
  pencilIcon: (size = 22, color = '#CC1167') => (
    <Icon name={'pencil'} family={'FontAwesome'} size={size} color={color} />
  ),
  searchIcon: (
    <Icon name={'search-outline'} family={'Ionicons'} size={22} color="#fff" />
  ),
  animatedMic: getImagePath('animation/mic.json'),
  uploadFile: (
    <Icon
      name={'upload-file'}
      family={'MaterialIcons'}
      size={30}
      color={Colors.black}
    />
  ),
  deleteIcon: (
    <Icon name={'delete'} family={'AntDesign'} size={30} color={Colors.white} />
  ),
  cameraIcon: (size = 24, color = Colors.white) => (
    <Icon
      name={'camera-outline'}
      family={'Ionicons'}
      size={size}
      color={color}
    />
  ),
  folderIcon: (size = 24, color = Colors.white) => (
    <Icon
      name={'folder-outline'}
      family={'Ionicons'}
      size={size}
      color={color}
    />
  ),
  cameraclick: getImagePath('icons/cameraPOD.png'),
  folderFile: getImagePath('icons/folderfile.png'),
  folderFileShade: getImagePath('icons/files_Folder.png'),
};

export const FABIcon = {
  Plus: getImagePath('icons/PlusIcon.png'),
  Folder: getImagePath('icons/FolderIcon.png'),
  file: getImagePath('icons/FileIcon.png'),
  editFile: getImagePath('icons/PenIcon.png'),
};

export const LoginImg = {
  searchPng: getImagePath('mockImage/loupe.png'),
  passIcon: (
    <Icon family="MaterialCommunityIcons" name="arrow-right-thin" size={30} />
  ),
};

export const OTPScreenImg = {
  backgrndImg: getImagePath('icons/splashBottom.png'),
};

export const DashboardImg = {
  sideMenu: getImagePath('icons/menu_white.png'),
  fingerIn: getImagePath('icons/Fingerprint.png'),
  fingerOut: getImagePath('icons/Finger.png'),
  fingerOuts: getImagePath('icons/fingerprintOuts.png'),
  fingerOut1: (
    <Icon family="Ionicons" name="finger-print" size={40} color="green" />
  ),
  fingerEndDay: (
    <Icon family="Ionicons" name="finger-print" size={40} color="grey" />
  ),
  greenSync: getImagePath('icons/greensync.png'),
  redSync: getImagePath('icons/redsync.png'),
  location: getImagePath('icons/location_check.png'),
  locationIn: getImagePath('icons/location_checkin.png'),
  productDelivery: getImagePath('icons/delivery.png'),
};

export const SideMenuImg = {
  userProfile: getImagePath('icons/User_Profile_Pic_Default.png'),
  close: getImagePath('icons/Close.png'),
  sync: getImagePath('icons/refresh_button.png'),
  shopIcon: getImagePath('icons/Shop_sidebar.png'),
  shopIconFade: getImagePath('icons/Shop_card_watermark.png'),
  paymentCard: getImagePath('icons/cards.png'),
  order: getImagePath('icons/Orders.png'),
  meeting: getImagePath('icons/meeting.png'),
  survey: getImagePath('icons/SurveyDrawer.png'),
  resource: getImagePath('icons/Resources.png'),
  report: getImagePath('icons/Reports.png'),
  logout: getImagePath('icons/logout.png'),
  companyName: getImagePath('icons/pluss.png'),
  sos: getImagePath('icons/sos.png'),
};

export const ShopImgs = {
  ShopImg: getImagePath('icons/shopImg.png'),
  CardView: getImagePath('icons/Card_View.png'),
  ListView: getImagePath('icons/List_View_Selected.png'),
  Camera: getImagePath('icons/Camera2.jpg'),
  filterIcon: getImagePath('icons/filter_list_shop.png'),
  rightArrow: getImagePath('icons/right_arrow_front.png'),
  surveyCard: getImagePath('icons/SurveyCard.png'),
  share: getImagePath('icons/Share.png'),
  weeklyoff: getImagePath('icons/WeeklyOff.png'),
  directions: getImagePath('icons/directions_maps.png'),
};

export const OrdersImgs = {
  Schemes: getImagePath('icons/Schemes_drawer.png'),
};

export const DataCollImgs = {
  shop: getImagePath('icons/Shop_sidebar.png'),
  dist: getImagePath('icons/Distributor.png'),
  others: getImagePath('icons/others.png'),
};

export const MyReportImgs = {
  dataUpload: getImagePath('icons/Data_Upload.png'),
  redPin: getImagePath('icons/red_pin.png'),
  greenPin: getImagePath('icons/green_pin.png'),
  bluePin: getImagePath('icons/blue_pin.png'),
  radio_Unchecked: getImagePath('icons/radio_unchecked.png'),
  radio_Checked: getImagePath('icons/radio_checked.png'),
  timeline: getImagePath('icons/timeline.png'),
  navigation: getImagePath('icons/navigation.png'),
  executives: getImagePath('icons/expand-executives.png'),
  map: getImagePath('icons/map.png'),
  user_location: getImagePath('icons/location.png'),
  outlet_map_icon: getImagePath('icons/outlet_map_icon.png'),
};

export const PODImages = {
  claim: getImagePath('icons/claim.png'),
  invoice: getImagePath('icons/invoice.png'),
};

export const DropdownIcon = {
  // Placeholder for dropdown icons
};

export const ShopListImgs = {
  geofenceIcon: getImagePath('icons/geofence_map_icon.png'),
  in_geofenceIcon: getImagePath('icons/enter_geofence2.png'),
  not_in_geofenceIcon: getImagePath('icons/not_in_geofence1.png'),
  not_registered_geofenceIcon: getImagePath('icons/geofence_not_registered2.png'),
};

export const SideMenuIcon = {
  sync: (
    <Icon
      family="MaterialCommunityIcons"
      name="sync"
      size={28}
      color={Colors.black}
    />
  ),
  refresh: (
    <Icon
      family="MaterialCommunityIcons"
      name="database-sync-outline"
      size={28}
      color={Colors.black}
    />
  ),
  shopIcon: <Icon family="Entypo" name="shop" size={28} color={Colors.black} />,
  shopIconDC: (
    <Icon
      family="MaterialCommunityIcons"
      name="clipboard-list-outline"
      size={28}
      color={Colors.black}
    />
  ),
  shopIconFade: (
    <Icon
      family="MaterialIcons"
      name="calendar-today"
      size={28}
      color={Colors.black}
    />
  ),
  dataCard: (
    <Icon
      family="MaterialCommunityIcons"
      name="newspaper-variant-multiple-outline"
      size={28}
      color={Colors.black}
    />
  ),
  paymentCard: (
    <Icon
      family="MaterialIcons"
      name="payments"
      size={28}
      color={Colors.black}
    />
  ),
  order: <Icon family="Entypo" name="box" size={28} color={Colors.black} />,
  meeting: (
    <Icon
      family="FontAwesome"
      name="calendar-check-o"
      size={28}
      color={Colors.black}
    />
  ),
  survey: (
    <Icon
      family="MaterialCommunityIcons"
      name="file-document-edit-outline"
      size={28}
      color={Colors.black}
    />
  ),
  resource: (
    <Icon
      family="MaterialIcons"
      name="calendar-today"
      size={28}
      color={Colors.black}
    />
  ),
  report: (
    <Icon
      family="FontAwesome"
      name="bar-chart"
      size={28}
      color={Colors.black}
    />
  ),
  advReport: (
    <Icon
      family="FontAwesome"
      name="pie-chart"
      size={28}
      color={Colors.black}
    />
  ),
  logout: (
    <Icon family="MaterialIcons" name="logout" size={28} color={Colors.black} />
  ),
  companyName: (
    <Icon
      family="MaterialIcons"
      name="calendar-today"
      size={28}
      color={Colors.black}
    />
  ),
  sos: (
    <Icon
      family="MaterialIcons"
      name="error-outline"
      size={28}
      color={Colors.black}
    />
  ),
  brandWiseSale: (
    <Icon
      family="MaterialCommunityIcons"
      name="chart-bar"
      size={28}
      color={Colors.black}
    />
  ),
  targetVsAch: (
    <Icon
      family="MaterialCommunityIcons"
      name="chart-multiple"
      size={28}
      color={Colors.black}
    />
  ),
  distributorDataUpload: (
    <Icon
      family="MaterialCommunityIcons"
      name="file-chart-outline"
      size={28}
      color={Colors.black}
    />
  ),
  outletvisit: (
    <Icon
      family="MaterialCommunityIcons"
      name="chart-gantt"
      size={28}
      color={Colors.black}
    />
  ),
  myActivity: (
    <Icon
      family="MaterialCommunityIcons"
      name="chart-bell-curve-cumulative"
      size={28}
      color={Colors.black}
    />
  ),
  outletPerformance: (
    <Icon
      family="MaterialCommunityIcons"
      name="chart-bar-stacked"
      size={28}
      color={Colors.black}
    />
  ),
  visitBasedMap: (
    <Icon
      family="MaterialCommunityIcons"
      name="chart-scatter-plot"
      size={28}
      color={Colors.black}
    />
  ),
  liveLocationMap: (
    <Icon
      family="MaterialCommunityIcons"
      name="chart-scatter-plot-hexbin"
      size={28}
      color={Colors.black}
    />
  ),
};


