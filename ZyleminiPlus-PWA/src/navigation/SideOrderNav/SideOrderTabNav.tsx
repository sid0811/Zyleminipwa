import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, Tab, Box, useTheme, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../theme/colors';
import Header from '../../components/Header/Header';
import InProcessOrder from '../../screens/Order/SideOrder/InProcessOrder';
import PreOrders from '../../screens/Order/SideOrder/PreOrder';
import OrderHistory from '../../screens/Order/SideOrder/OrderHistory';
import PendingOrders from '../../screens/Order/SideOrder/PendingOrder';
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
      id={`order-tabpanel-${index}`}
      aria-labelledby={`order-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

export default function SideOrderTabNav() {
  const navigation = useNavigationCompat();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation();

  // Tab configuration
  const tabs = useMemo(() => [
    { label: t('TabScreen.TabScreenINPROCESS'), component: InProcessOrder, id: 'inprocess' },
    { label: t('TabScreen.TabScreenPREORDERS'), component: PreOrders, id: 'preorders' },
    { label: t('TabScreen.TabScreenORDERHISTORY'), component: OrderHistory, id: 'history' },
    { label: t('TabScreen.TabScreenPENDING'), component: PendingOrders, id: 'pending' },
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

  return (
    <>
      <Header navigation={navigation} title={t('TabScreen.TabScreenOrdersActionBarText')} />
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
            <tab.component navigation={navigation} />
          </TabPanel>
        ))}
      </Box>
    </>
  );
}

