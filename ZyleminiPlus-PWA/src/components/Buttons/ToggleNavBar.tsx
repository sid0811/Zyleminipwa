// Web-adapted ToggleNavBar component using Material-UI Tabs
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Box, Tabs, Tab, useMediaQuery, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useGlobleAction } from '../../redux/actionHooks/useGlobalAction';
import CustomSafeView from '../GlobalComponent/CustomSafeView';
import Icon from '../Icon/Icon';
import CustomFAB from '../FAB/CustomFAB';
import { FABOptions } from '../../utility/FabOptions';
import { isAccessControlProvided } from '../../utility/utils';
import {
  AccessControlKeyConstants,
  DEFAULT_TAB_NAMES,
} from '../../constants/screenConstants';

interface NavItem {
  id: string;
  icon: string;
  label: string;
  component: React.ReactElement;
}

interface ToggleNavBarProps {
  navItems: NavItem[];
  defaultTab?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`nav-tabpanel-${index}`}
      aria-labelledby={`nav-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ToggleNavBar: React.FC<ToggleNavBarProps> = ({
  navItems,
  defaultTab = DEFAULT_TAB_NAMES[0],
}) => {
  const { getAccessControlSettings } = useGlobleAction();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const [activeTab, setActiveTab] = useState(() => {
    return navItems.some((item) => item.id === defaultTab)
      ? defaultTab
      : navItems[0]?.id || '';
  });

  const activeTabIndex = useMemo(
    () => navItems.findIndex((item) => item.id === activeTab),
    [navItems, activeTab]
  );

  const handleChange = useCallback(
    (event: React.SyntheticEvent, newValue: number) => {
      const newTabId = navItems[newValue]?.id;
      if (newTabId) {
        setActiveTab(newTabId);
      }
    },
    [navItems]
  );

  const ActiveComponent = useMemo(
    () => navItems.find((item) => item.id === activeTab)?.component,
    [navItems, activeTab]
  );

  const renderFAB = () => {
    if (
      isAccessControlProvided(
        getAccessControlSettings,
        AccessControlKeyConstants.FAB_DASHBOARD,
      ) &&
      DEFAULT_TAB_NAMES.includes(activeTab)
    ) {
      return (
        <CustomFAB
          options={FABOptions(t, navigate).filter(option =>
            isAccessControlProvided(
              getAccessControlSettings,
              option.accessKeyValue,
            ),
          )}
        />
      );
    }
    return null;
  };

  // Responsive icon and font sizes
  const iconSize = isMobile ? 18 : isTablet ? 20 : 24;
  const fontSize = isMobile ? 11 : isTablet ? 12 : 14;

  if (!navItems.length) {
    return null;
  }

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      <Box
        sx={{
          backgroundColor: '#382928',
          borderRadius: '30px',
          display: 'flex',
          padding: '8px',
          justifyContent: 'space-between',
          margin: isMobile ? '8px' : '16px',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.25)',
        }}
      >
        <Tabs
          value={activeTabIndex >= 0 ? activeTabIndex : 0}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            width: '100%',
            '& .MuiTabs-indicator': {
              display: 'none',
            },
            '& .MuiTab-root': {
              minHeight: isMobile ? '56px' : '64px',
              flex: 1,
              position: 'relative',
              margin: '0 4px',
              '&.Mui-selected': {
                backgroundColor: '#fff',
                borderRadius: '20px',
                color: '#000',
              },
            },
          }}
        >
          {navItems.map((item, index) => (
            <Tab
              key={item.id}
              icon={
                <Icon
                  name={item.icon}
                  family="Feather"
                  size={iconSize}
                  color={activeTab === item.id ? '#000' : '#fff'}
                />
              }
              label={
                activeTab === item.id ? (
                  <Box
                    component="span"
                    sx={{
                      fontSize: `${fontSize}px`,
                      fontWeight: 600,
                      color: '#000',
                      textAlign: 'center',
                      marginTop: '2px',
                      padding: '0 4px',
                    }}
                  >
                    {item.label}
                  </Box>
                ) : null
              }
              iconPosition="top"
              sx={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px 8px',
              }}
            />
          ))}
        </Tabs>
      </Box>

      <CustomSafeView isScrollView={true}>
        {ActiveComponent}
      </CustomSafeView>
      {renderFAB()}
    </Box>
  );
};

export default React.memo(ToggleNavBar);


