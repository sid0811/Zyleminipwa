import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Avatar,
} from '@mui/material';
import { LocationOn } from '@mui/icons-material';
import { Colors } from '../../../../theme/colors';
import { useTranslation } from 'react-i18next';
import { removeSpecialCharacters } from '../../../../utility/utils';

interface props {
  onPress: any;
  onConfirm: any;
  isModalOpen: boolean;
}

function CheckOutModal(props: props) {
  const { isModalOpen, onPress, onConfirm } = props;
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
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Typography
          variant="h6"
          sx={{
            color: Colors.DarkBrown,
            fontWeight: 700,
            mb: 2,
          }}
        >
          {t('Common.EnterYourRemark')}
        </Typography>
        
        {/* Location Icon */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: Colors.primary,
              boxShadow: 3,
            }}
          >
            <LocationOn sx={{ fontSize: 48 }} />
          </Avatar>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography
          sx={{
            color: Colors.DarkBrown,
            fontWeight: 700,
            fontSize: 14,
            mb: 1,
          }}
        >
          {t('Common.AddRemarks')}
        </Typography>
        
        <TextField
          fullWidth
          multiline
          rows={4}
          value={remark}
          onChange={(e) => setRemark(removeSpecialCharacters(e.target.value))}
          placeholder={t('Enter your remarks here...')}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            flex: 1,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          {t('Common.Cancel')}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          sx={{
            flex: 1,
            py: 1.5,
            borderRadius: 2,
            backgroundColor: Colors.primary,
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: Colors.primaryDark,
            },
          }}
        >
          {t('Common.Confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CheckOutModal;
