// Web-adapted LocationPermissionAlert component
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { Colors } from '../../theme/colors';
import { useLocationAction } from '../../redux/actionHooks/useLocationAction';

interface props {
  onPress: () => void;
  isModalOpen: boolean;
}

function LocationPermissionAlert(props: props) {
  const { isModalOpen, onPress } = props;
  const { t } = useTranslation();
  const { setIsLocationGranted } = useLocationAction();

  const checkLocationPermission = async () => {
    try {
      if (!navigator.geolocation) {
        window.alert('Geolocation is not supported by this browser');
        setIsLocationGranted(false);
        return;
      }

      // Request location permission
      navigator.geolocation.getCurrentPosition(
        () => {
          setIsLocationGranted(true);
          onPress();
        },
        (error) => {
          console.error('Location permission error:', error);
          setIsLocationGranted(false);
          // Web: Can't directly open settings, but we can show instructions
          window.alert(
            'Please enable location permission in your browser settings to use this feature.'
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    } catch (error) {
      console.error('Error checking location permission:', error);
      setIsLocationGranted(false);
    }
  };

  return (
    <Dialog
      open={isModalOpen}
      onClose={onPress}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '15px',
          padding: '20px',
        },
      }}
    >
      <DialogTitle>
        <Typography
          variant="h6"
          sx={{
            color: Colors.black,
            fontSize: '22px',
            fontWeight: 700,
            textAlign: 'center',
          }}
        >
          Allow Permission To Proceed
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: 'center', mt: 1 }}>
          <Typography
            variant="body1"
            sx={{
              color: Colors.black,
              fontSize: '15px',
            }}
          >
            Zylemini+ Needs Location Permission To Proceed Further To Use App
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button
          variant="contained"
          onClick={checkLocationPermission}
          sx={{
            backgroundColor: Colors.buttonPrimary,
            color: Colors.white,
            textTransform: 'uppercase',
            fontWeight: 'bold',
            padding: '10px 30px',
            '&:hover': {
              backgroundColor: Colors.buttonPrimary,
              opacity: 0.9,
            },
          }}
        >
          ALLOW PERMISSION
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default LocationPermissionAlert;


