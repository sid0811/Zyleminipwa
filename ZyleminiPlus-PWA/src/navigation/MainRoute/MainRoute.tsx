import React from 'react';
import { Outlet } from 'react-router-dom';
import { Drawer, Box } from '@mui/material';
import { DrawerProvider, useDrawer } from '../../contexts/DrawerContext';
import SideMenu from './SideMenu';

/**
 * MainRoute Layout Component
 * Replaces React Navigation Drawer Navigator with MUI Drawer
 * Wraps main content with drawer functionality
 */
const MainRoute = () => {
  return (
    <DrawerProvider>
      <MainRouteContent />
    </DrawerProvider>
  );
};

const MainRouteContent = () => {
  const drawer = useDrawer();

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* MUI Drawer */}
      <Drawer
        anchor="left"
        open={drawer.isOpen}
        onClose={drawer.closeDrawer}
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: '400px',
            backgroundColor: 'white',
          },
        }}
        ModalProps={{
          BackdropProps: {
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        }}
      >
        <SideMenu />
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          overflow: 'auto',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainRoute;

