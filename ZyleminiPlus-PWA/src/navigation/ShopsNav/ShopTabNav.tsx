import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Tabs, Tab, Box, useTheme, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../theme/colors';
import { FABOptionsShops } from '../../utility/FabOptions';
import CustomSafeView from '../../components/GlobalComponent/CustomSafeView';
import CustomFAB from '../../components/FAB/CustomFAB';
import ShopsDetails from '../../screens/Shops/ShopsDetails/ShopsDetails';
import InfoTab from '../../screens/Shops/ShopsDetails/TabScreens/InfoTab';
import Orders from '../../screens/Shops/ShopsDetails/TabScreens/Orders';
import Payment from '../../screens/Shops/ShopsDetails/TabScreens/Payment';
import Assets from '../../screens/Shops/ShopsDetails/TabScreens/Assets';
import Remarks from '../../screens/Shops/ShopsDetails/TabScreens/Remarks';
import Surveys from '../../screens/Shops/ShopsDetails/TabScreens/Surveys';
import Schemes from '../../screens/Shops/ShopsDetails/TabScreens/Schemes';
import DataCollectionShop from '../../screens/Shops/ShopsDetails/TabScreens/DataCollection';
import MeetingShop from '../../screens/Shops/ShopsDetails/TabScreens/Meeting';
import { isAccessControlProvided } from '../../utility/utils';
import { useGlobleAction } from '../../redux/actionHooks/useGlobalAction';
import { AccessControlKeyConstants } from '../../constants/screenConstants';
import { useNavigationCompat } from '../../hooks/useNavigationCompat';

/**
 * Tab Panel Component for MUI Tabs
 */
function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`shop-tabpanel-${index}`}
      aria-labelledby={`shop-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

export default function ShopsTopNav() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Extract params from URL
  const shopId = params.shopId || searchParams.get('shopId') || '';
  const party = searchParams.get('party') ? JSON.parse(searchParams.get('party')!) : null;
  const outletInfo = searchParams.get('outletInfo') ? JSON.parse(searchParams.get('outletInfo')!) : null;
  const isNewParty = searchParams.get('isNewParty') === 'true';
  
  const { getAccessControlSettings, isShopCheckedIn, isSyncImmediate } = useGlobleAction();
  const { t } = useTranslation();

  // Get active tab from URL hash or default to 0
  const getActiveTabFromUrl = () => {
    const hash = location.hash.replace('#', '');
    const tabMap: Record<string, number> = {
      'info': 0,
      'orders': 1,
      'payments': 2,
      'assets': 3,
      'remarks': 4,
      'surveys': 5,
      'schemes': 6,
      'meetings': 7,
      'datacollection': 8,
    };
    return tabMap[hash.toLowerCase()] ?? 0;
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromUrl());

  // Update active tab when URL hash changes
  useEffect(() => {
    setActiveTab(getActiveTabFromUrl());
  }, [location.hash]);

  const propsData = useMemo(() => ({
    shopId,
    isFromShop: true,
    party,
    outletInfo,
    isNewParty,
    isShopCheckedIn,
    isSyncImmediate,
  }), [shopId, party, outletInfo, isNewParty, isShopCheckedIn, isSyncImmediate]);

  // Use navigation compatibility hook
  const navigation = useNavigationCompat();

  // Build tabs array with conditional rendering
  const tabs = useMemo(() => {
    const tabList: Array<{ label: string; component: React.ComponentType<any>; id: string }> = [];
    let tabIndex = 0;

    // Info tab (always shown)
    tabList.push({ label: t('TabScreen.TabScreenInfo'), component: InfoTab, id: 'info' });
    tabIndex++;

    // Orders tab (conditional)
    if (isAccessControlProvided(getAccessControlSettings, AccessControlKeyConstants.SIDE_MENU_ORDERS)) {
      tabList.push({ label: t('TabScreen.TabScreenOrders'), component: Orders, id: 'orders' });
      tabIndex++;
    }

    // Payments tab (conditional)
    if (isAccessControlProvided(getAccessControlSettings, AccessControlKeyConstants.SIDE_MENU_COLLECTIONS)) {
      tabList.push({ label: t('TabScreen.TabScreenPayments'), component: Payment, id: 'payments' });
      tabIndex++;
    }

    // Assets tab (always shown)
    tabList.push({ label: t('TabScreen.TabScreenAssets'), component: Assets, id: 'assets' });
    tabIndex++;

    // Remarks tab (always shown)
    tabList.push({ label: t('TabScreen.TabScreenRemarks'), component: Remarks, id: 'remarks' });
    tabIndex++;

    // Surveys tab (conditional)
    if (isAccessControlProvided(getAccessControlSettings, AccessControlKeyConstants.SIDE_MENU_SURVEYS)) {
      tabList.push({ label: t('TabScreen.TabScreenSurveys'), component: Surveys, id: 'surveys' });
      tabIndex++;
    }

    // Schemes tab (disabled - no implementation)
    // if (false) {
    //   tabList.push({ label: t('TabScreen.TabScreenSchemes'), component: Schemes, id: 'schemes' });
    //   tabIndex++;
    // }

    // Meetings tab (conditional)
    if (isAccessControlProvided(getAccessControlSettings, AccessControlKeyConstants.SIDE_MENU_ACTIVITY)) {
      tabList.push({ label: t('TabScreen.TabScreenMeetings'), component: MeetingShop, id: 'meetings' });
      tabIndex++;
    }

    // DataCollection tab (conditional)
    if (isAccessControlProvided(getAccessControlSettings, AccessControlKeyConstants.SIDE_MENU_DATACOLLECTION)) {
      tabList.push({ label: t('TabScreen.TabScreenDataCollection'), component: DataCollectionShop, id: 'datacollection' });
      tabIndex++;
    }

    return tabList;
  }, [t, getAccessControlSettings]);

  // Map activeTab index to actual tab index (accounting for conditional tabs)
  const actualTabIndex = useMemo(() => {
    const hash = location.hash.replace('#', '').toLowerCase();
    const tabIndex = tabs.findIndex(tab => tab.id === hash);
    return tabIndex >= 0 ? tabIndex : 0;
  }, [location.hash, tabs]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    const tabId = tabs[newValue]?.id;
    if (tabId) {
      navigate(`${location.pathname}#${tabId}`, { replace: true });
      setActiveTab(newValue);
    }
  };

  const ActiveTabComponent = tabs[actualTabIndex]?.component || InfoTab;

  return (
    <>
      <ShopsDetails />
      <CustomSafeView>
        <Box sx={{ width: '100%' }}>
          <Box
            sx={{
              backgroundColor: Colors.mainBackground,
              borderBottom: `5px solid ${Colors.PinkColor}`,
            }}
          >
            <Tabs
              value={actualTabIndex}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  color: '#C9B1B4',
                  fontSize: isMobile ? 11 : 13,
                  textTransform: 'none',
                  minHeight: 60,
                  '&.Mui-selected': {
                    color: Colors.white,
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: Colors.PinkColor,
                  height: 5,
                },
              }}
            >
              {tabs.map((tab, index) => (
                <Tab key={index} label={tab.label} />
              ))}
            </Tabs>
          </Box>

          {tabs.map((tab, index) => (
            <TabPanel key={index} value={actualTabIndex} index={index}>
              <tab.component {...propsData} navigation={navigation} />
            </TabPanel>
          ))}
        </Box>

        {isAccessControlProvided(
          getAccessControlSettings,
          AccessControlKeyConstants.FAB_SHOP_DETAILS,
        ) && (
          <CustomFAB
            options={FABOptionsShops(t, navigation, propsData).filter(option =>
              isAccessControlProvided(
                getAccessControlSettings,
                option.accessKeyValue,
              ),
            )}
            isNotFromShop={false}
          />
        )}
      </CustomSafeView>
    </>
  );
}

