// Web-adapted CheckOutModal component - preserving exact UI and logic
import React, { useState } from 'react';
import { Dialog, DialogContent, Button, TextField, Typography, Box } from '@mui/material';
import { Colors } from '../../../../theme/colors';
import { DashboardImg } from '../../../../constants/AllImages';
import { useTranslation } from 'react-i18next';
import TextInput from '../../../../components/TextInput/TextInput';
import { removeSpecialCharacters } from '../../../../utility/utils';

interface CheckOutModalProps {
  isModalOpen: boolean;
  onPress: (val: boolean) => void;
  onConfirm: (remark: string) => void;
}

const CheckOutModal: React.FC<CheckOutModalProps> = ({
  isModalOpen,
  onPress,
  onConfirm,
}) => {
  const { t } = useTranslation();
  const [remark, setRemark] = useState('');

  const handleConfirm = () => {
    onConfirm(remark);
    setRemark('');
  };

  const handleClose = () => {
    onPress(false);
    setRemark('');
  };

  return (
    <Dialog
      open={isModalOpen}
      onClose={handleClose}
      PaperProps={{
        sx: {
          backgroundColor: Colors.white,
          borderRadius: '10px',
          width: '100vw',
          maxWidth: '100vh',
          height: 'auto',
          margin: '2vh',
          alignItems: 'center',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.25)',
        },
      }}
    >
      <DialogContent sx={{ width: '100%', padding: '20px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
          <Typography
            sx={{
              marginBottom: '20px',
              textAlign: 'center',
              fontWeight: 'bold',
              color: Colors.PinkColor,
              fontSize: '16px',
              marginTop: '4vh',
            }}
          >
            {t('Common.EnterYourRemark') || 'Enter Your Remark'}
          </Typography>
          <Box sx={{ marginBottom: '20px' }}>
            <img
              src={DashboardImg.locationIn}
              alt="Location"
              style={{ height: '5vh', width: '8vw', alignSelf: 'center' }}
            />
          </Box>
          <Box
            sx={{
              width: '14vw',
              height: '4vh',
              borderRadius: '150px',
              alignSelf: 'center',
              backgroundColor: Colors.DarkBrown,
              opacity: 0.05,
              marginTop: '-5vh',
              transform: 'scaleX(2)',
            }}
          />
        </Box>

        <Box>
          <Typography
            sx={{
              justifyContent: 'center',
              alignItems: 'center',
              fontWeight: '700',
              color: Colors.DarkBrown,
              fontSize: '2vw',
            }}
          >
            {t('Common.AddRemarks') || 'Add Remarks'}
          </Typography>
          <Box sx={{ marginTop: '1vh' }} />

          <TextInput
            multiline={true}
            value={remark}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setRemark(removeSpecialCharacters(e.target.value));
            }}
            sx={{
              width: '70vw',
              height: '15vh',
              borderColor: 'gray',
              borderWidth: '1px',
              borderRadius: '10px',
              marginTop: '1vh',
            }}
          />
        </Box>

        <Box
          sx={{
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: '10px',
          }}
        >
          <Button
            onClick={handleConfirm}
            sx={{
              backgroundColor: '#2FC36E',
              borderRadius: '24px',
              width: '132px',
              height: '40px',
              marginBottom: '2vh',
              textAlign: 'center',
              alignSelf: 'center',
              justifyContent: 'center',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#2FC36E',
                opacity: 0.9,
              },
            }}
          >
            <Typography
              sx={{
                color: Colors.white,
                padding: '5px',
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '12px',
              }}
            >
              {t('Common.Confirm') || 'Confirm'}
            </Typography>
          </Button>

          <Button
            onClick={handleClose}
            sx={{
              textTransform: 'none',
            }}
          >
            <Typography
              sx={{
                color: '#362828',
                padding: '5px',
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '12px',
                marginTop: '0.5vh',
              }}
            >
              {t('Common.Cancel') || 'Cancel'}
            </Typography>
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CheckOutModal;

