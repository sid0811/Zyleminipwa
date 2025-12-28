import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, Tab, Box, useTheme, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../theme/colors';
import Header from '../../components/Header/Header';
import MyReportList from '../../screens/Reports/MyReportList';
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
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

export default function ReportTabNav() {
  const navigation = useNavigationCompat();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation();

  // Tab configuration (only one tab, but keeping structure for consistency)
  const tabs = useMemo(() => [
    { label: t('TabScreen.TabScreenDataMyReport'), component: MyReportList, id: 'myreports' },
  ], [t]);

  const [activeTab] = useState(0); // Only one tab, always 0

  return (
    <>
      <Header navigation={navigation} title={t('TabScreen.TabScreenReportsActionBarText')} />
      <Box sx={{ width: '100%' }}>
        <Box
          sx={{
            backgroundColor: Colors.DarkBrown,
            borderBottom: `5px solid ${Colors.PinkColor}`,
          }}
        >
          <Tabs
            value={activeTab}
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
              navigation: navigation,
            })}
          </TabPanel>
        ))}
      </Box>
    </>
  );
}

