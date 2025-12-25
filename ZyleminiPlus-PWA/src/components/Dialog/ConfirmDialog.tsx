import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
  Box,
} from '@mui/material';
import { Close, Warning, Info, Error as ErrorIcon, CheckCircle } from '@mui/icons-material';
import { Colors } from '../../theme/colors';

export type DialogVariant = 'info' | 'warning' | 'error' | 'success';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: DialogVariant;
  showCloseButton?: boolean;
}

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  showCloseButton = true,
}: ConfirmDialogProps) => {
  const getIcon = () => {
    switch (variant) {
      case 'warning':
        return <Warning sx={{ fontSize: 48, color: Colors.warning }} />;
      case 'error':
        return <ErrorIcon sx={{ fontSize: 48, color: Colors.error }} />;
      case 'success':
        return <CheckCircle sx={{ fontSize: 48, color: Colors.success }} />;
      case 'info':
      default:
        return <Info sx={{ fontSize: 48, color: Colors.primary }} />;
    }
  };

  const getConfirmButtonColor = (): any => {
    switch (variant) {
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'success':
        return 'success';
      case 'info':
      default:
        return 'primary';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 1,
        },
      }}
    >
      {showCloseButton && (
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: Colors.TexthintColor,
          }}
        >
          <Close />
        </IconButton>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 1 }}>
        {getIcon()}
      </Box>

      <DialogTitle sx={{ textAlign: 'center', fontWeight: 600, pb: 1 }}>
        {title}
      </DialogTitle>

      <DialogContent>
        <DialogContentText sx={{ textAlign: 'center', color: Colors.textSecondary }}>
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ minWidth: 100 }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          variant="contained"
          color={getConfirmButtonColor()}
          sx={{ minWidth: 100 }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;

