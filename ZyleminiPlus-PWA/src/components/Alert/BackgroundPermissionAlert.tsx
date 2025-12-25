// Web-adapted BackgroundPermissionAlert component
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

function BackgroundPermissionAlert(props: props) {
  const { isModalOpen, onPress } = props;
  const { t } = useTranslation();
  const { setIsBGLocationGranted } = useLocationAction();

  const checkLocationPermission = () => {
    // Web: Background location is limited, but we can set the flag
    setIsBGLocationGranted?.(true);
    onPress();
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
          backgroundColor: Colors.white,
        },
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h6"
            sx={{
              color: Colors.black,
              fontSize: '18px',
              fontWeight: 600,
              mb: 1,
            }}
          >
            Enhance your shop-visiting experience!
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography
          variant="body2"
          sx={{
            color: Colors.textColor1,
            fontSize: '14px',
            lineHeight: 1.6,
            textAlign: 'center',
          }}
        >
          To enable features like automatic shop list activation or access to
          shop-specific functionalities, we need to access your Location,
          Physical activity even when the app is closed or not in use. We
          don't store your current Location or Physical activity to track you.
          You can always control this permission in your settings.
        </Typography>
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
          OKAY
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default BackgroundPermissionAlert;


