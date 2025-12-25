import { useState, useCallback } from 'react';
import { DialogVariant } from '../components/Dialog/ConfirmDialog';

interface DialogState {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: DialogVariant;
  onConfirm?: () => void;
}

const useDialog = () => {
  const [dialogState, setDialogState] = useState<DialogState>({
    open: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'info',
  });

  const showDialog = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      variant: DialogVariant = 'info',
      confirmText: string = 'Confirm',
      cancelText: string = 'Cancel'
    ) => {
      setDialogState({
        open: true,
        title,
        message,
        onConfirm,
        variant,
        confirmText,
        cancelText,
      });
    },
    []
  );

  const hideDialog = useCallback(() => {
    setDialogState((prev) => ({ ...prev, open: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (dialogState.onConfirm) {
      dialogState.onConfirm();
    }
    hideDialog();
  }, [dialogState.onConfirm, hideDialog]);

  return {
    dialogState,
    showDialog,
    hideDialog,
    handleConfirm,
  };
};

export default useDialog;

