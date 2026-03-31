import { usePopup } from '@/src/contexts/PopupContext';

export function usePopupMessages() {
  const { showPopup } = usePopup();

  const showSuccess = (message: string, onConfirm?: () => void) => {
    showPopup({
      type: 'success',
      title: 'Success',
      message,
      confirmText: 'OK',
      onConfirm,
    });
  };

  const showError = (message: string, duration: number = 3000) => {
    showPopup({
      type: 'error',
      title: 'Error',
      message,
      autoHide: true,
      duration,
    });
  };

  const showWarning = (message: string, duration: number = 3000) => {
    showPopup({
      type: 'warning',
      title: 'Warning',
      message,
      autoHide: true,
      duration,
    });
  };

  const showInfo = (message: string, duration: number = 3000) => {
    showPopup({
      type: 'info',
      title: 'Information',
      message,
      autoHide: true,
      duration,
    });
  };

  const showConfirmation = (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel'
  ) => {
    showPopup({
      type: 'confirmation',
      title,
      message,
      confirmText,
      cancelText,
      showCancel: true,
      onConfirm,
      onCancel,
    });
  };

  const showValidation = (message: string) => {
    showPopup({
      type: 'error',
      title: 'Validation Error',
      message,
      autoHide: true,
      duration: 2000,
    });
  };

  const showLoading = (message: string = 'Processing...') => {
    showPopup({
      type: 'info',
      title: 'Please Wait',
      message,
      autoHide: false,
    });
  };

  const hidePopup = () => {
    // This would need to be implemented in the PopupContext
    // For now, we'll rely on autoHide or user interaction
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirmation,
    showValidation,
    showLoading,
    hidePopup,
  };
}