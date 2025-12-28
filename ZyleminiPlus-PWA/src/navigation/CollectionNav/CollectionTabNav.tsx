import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, Tab, Box, useTheme, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../theme/colors';
import { FABOptionCollection } from '../../utility/FabOptions';
import CustomSafeView from '../../components/GlobalComponent/CustomSafeView';
import Header from '../../components/Header/Header';
import CustomFAB from '../../components/FAB/CustomFAB';
import { useNavigationCompat } from '../../hooks/useNavigationCompat';
// TODO: Uncomment when CollectionModule screens are migrated
// import PaymentsOutStandingLists from '../../screens/CollectionModule/MainScreen/PaymentsOutStandingLists1';
// import CollectionMain from '../../screens/CollectionModule/MainScreen/CollectionMain';
// import PaymentsHistoryList from '../../screens/CollectionModule/MainScreen/PaymentsHistoryList';
// import PaymentsBouncedChekedlist from '../../screens/CollectionModule/MainScreen/PaymentsBouncedChekedlist';

// Placeholder components until screens are migrated
const PaymentsOutStandingLists = () => <div>PaymentsOutStandingLists - Coming Soon</div>;
const CollectionMain = () => <div>CollectionMain - Coming Soon</div>;
const PaymentsHistoryList = () => <div>PaymentsHistoryList - Coming Soon</div>;
const PaymentsBouncedChekedlist = () => <div>PaymentsBouncedChekedlist - Coming Soon</div>;
import { isAccessControlProvided } from '../../utility/utils';
import { useGlobleAction } from '../../redux/actionHooks/useGlobalAction';
import { useRouteCompat } from '../../hooks/useNavigationCompat';

/**
 * Tab Panel Component for MUI Tabs
 */
function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`collection-tabpanel-${index}`}
      aria-labelledby={`collection-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

export default function CollectionTabNav() {
  const navigation = useNavigationCompat();
  const route = useRouteCompat();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation();
  const { getAccessControlSettings } = useGlobleAction();
  const { propsData } = route;

  // Tab configuration
  const tabs = useMemo(() => [
    { label: t('TabScreen.TabScreenOutstanding'), component: PaymentsOutStandingLists, id: 'outstanding' },
    { label: t('TabScreen.TabScreenCollections'), component: CollectionMain, id: 'collections' },
    { label: t('Header4.HeaderBouncedCheque'), component: PaymentsBouncedChekedlist, id: 'bounced' },
    { label: t('TabScreen.TabScreenHistory'), component: PaymentsHistoryList, id: 'history' },
  ], [t]);

  // Get active tab from URL hash
  const getActiveTabFromUrl = () => {
    const hash = location.hash.replace('#', '').toLowerCase();
    const tabIndex = tabs.findIndex(tab => tab.id === hash);
    return tabIndex >= 0 ? tabIndex : 0;
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromUrl());

  useEffect(() => {
    setActiveTab(getActiveTabFromUrl());
  }, [location.hash, tabs]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    const tabId = tabs[newValue]?.id;
    if (tabId) {
      navigate(`${location.pathname}#${tabId}`, { replace: true });
      setActiveTab(newValue);
    }
  };

  const ActiveTabComponent = tabs[activeTab]?.component || PaymentsOutStandingLists;

  return (
    <>
      <Header
        navigation={navigation}
        title={t('TabScreen.TabScreenCollectionsActionBarText')}
      />
      <Box sx={{ width: '100%' }}>
        <Box
          sx={{
            backgroundColor: Colors.mainBackground,
            borderBottom: `5px solid ${Colors.PinkColor}`,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              height: 60,
              '& .MuiTab-root': {
                color: '#C9B1B4',
                fontSize: isMobile ? 12 : 14,
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
          <TabPanel key={index} value={activeTab} index={index}>
            {React.createElement(tab.component as React.ComponentType<any>, {
              ...(propsData ? propsData : {}),
              navigation: navigation,
            })}
          </TabPanel>
        ))}
      </Box>
      <CustomFAB
        options={FABOptionCollection(t, navigation).filter(option =>
          isAccessControlProvided(
            getAccessControlSettings,
            option.accessKeyValue,
          ),
        )}
      />
    </>
  );
}

