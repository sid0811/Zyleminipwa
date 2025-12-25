// Web-adapted CommonModal component
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { Colors } from '../../../theme/colors';
import { globalImg } from '../../../constants/AllImages';
import { useTranslation } from 'react-i18next';
import Dropdown from '../../../components/Dropdown/Dropdown';
import { useGlobleAction } from '../../../redux/actionHooks/useGlobalAction';

interface props {
  onPress: (val: boolean) => void;
  onConfirm: (selectedItem: any) => void;
  isModalOpen: boolean;
  isLocationOpen?: boolean;
  modalTitle?: string;
  dropdownTitle?: string;
  ddlabel: any;
  icon?: any;
  modalData?: any;
}

function CommonModal(props: props) {
  const {
    isModalOpen,
    onPress,
    onConfirm,
    isLocationOpen,
    modalTitle,
    icon,
    dropdownTitle,
    ddlabel,
    modalData = [],
  } = props;

  const { t } = useTranslation();
  const { isParentUser } = useGlobleAction();
  const [selectedAtten, setSelectedAtten] = useState<any>('');
  const [selectedArea, setSelectedArea] = useState<any>({});

  const handleConfirm = () => {
    if (isLocationOpen) {
      if (isParentUser && selectedArea) {
        onConfirm(selectedArea);
      } else {
        onConfirm(selectedArea);
      }
    } else {
      if (selectedAtten) {
        onConfirm(selectedAtten);
      }
    }
    onPress(false);
  };

  return (
    <Dialog
      open={isModalOpen}
      onClose={() => onPress(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '15px',
          backgroundImage: `url(${globalImg.backgrnd})`,
          backgroundSize: 'cover',
          padding: '20px',
        },
      }}
    >
      <DialogTitle>
        <Typography
          variant="h6"
          sx={{
            textAlign: 'center',
            fontWeight: 600,
            color: Colors.black,
          }}
        >
          {modalTitle}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 2,
          }}
        >
          {icon && (
            <Box
              component="img"
              src={icon}
              alt="Modal icon"
              sx={{
                width: '80px',
                height: '80px',
                mb: 2,
              }}
            />
          )}
          <Typography
            variant="body1"
            sx={{
              mb: 2,
              fontWeight: 500,
              color: Colors.black,
            }}
          >
            {dropdownTitle}
          </Typography>
          {isLocationOpen ? (
            isParentUser ? (
              <Dropdown
                CustomDDStyle={{ width: '70%' }}
                ddItemStyle={{ width: '70%' }}
                label={ddlabel}
                data={modalData}
                onPressItem={(val: any) => setSelectedArea(val)}
                selectedValue={selectedArea?.Area}
                placeHolder="Select Area"
              />
            ) : (
              <Typography variant="body2" sx={{ color: Colors.textColor1 }}>
                {selectedArea?.Area || 'No area selected'}
              </Typography>
            )
          ) : (
            <Dropdown
              CustomDDStyle={{ width: '70%' }}
              ddItemStyle={{ width: '70%' }}
              label={ddlabel}
              data={modalData}
              onPressItem={(val: any) => setSelectedAtten(val)}
              selectedValue={selectedAtten?.name}
              placeHolder="Select"
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button
          variant="contained"
          onClick={handleConfirm}
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
          {t('Common.Confirm') || 'Confirm'}
        </Button>
        <Button
          variant="outlined"
          onClick={() => onPress(false)}
          sx={{
            borderColor: Colors.border,
            color: Colors.black,
            textTransform: 'uppercase',
            padding: '10px 30px',
          }}
        >
          {t('Common.Cancel') || 'Cancel'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CommonModal;


