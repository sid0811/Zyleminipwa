// Web-adapted AlertMessage component - preserving exact original styling
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import { Colors } from '../../theme/colors';

interface CustomAlertModalProps {
  visible: boolean;
  message: string;
  submitMsg: string;
  cancelMsg: string;
  onClose: () => void;
  onCancel: () => void;
  isCtaDisable?: boolean;
}

const AlertMessage: React.FC<CustomAlertModalProps> = ({
  visible,
  message,
  submitMsg,
  onClose,
  onCancel,
  cancelMsg,
  isCtaDisable,
}) => {
  return (
    <Dialog
      open={visible}
      onClose={onCancel}
      PaperProps={{
        sx: {
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          width: '80%',
          maxWidth: '400px',
        },
      }}
    >
      <DialogTitle>
        <Typography
          sx={{
            fontSize: '18px',
            marginBottom: '10px',
            fontWeight: '500',
            color: Colors.textBlack,
          }}
        >
          {message}
        </Typography>
      </DialogTitle>
      <DialogContent>
        {/* Content is in title for this component */}
      </DialogContent>
      <DialogActions
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: '0 40px',
        }}
      >
        <Button
          onClick={onCancel}
          sx={{
            color: 'blue',
            fontSize: '16px',
            fontWeight: '700',
            textTransform: 'none',
          }}
        >
          {cancelMsg}
        </Button>
        <Button
          onClick={onClose}
          disabled={isCtaDisable}
          sx={{
            color: 'blue',
            fontSize: '16px',
            fontWeight: '700',
            textTransform: 'none',
            opacity: isCtaDisable ? 0.6 : 1,
          }}
        >
          {submitMsg}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AlertMessage;


