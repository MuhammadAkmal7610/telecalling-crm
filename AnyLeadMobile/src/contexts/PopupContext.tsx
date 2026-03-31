import React, { createContext, useContext, useState, useCallback } from 'react';
import { Popup, PopupType } from '@/src/components/common/Popup';

interface PopupOptions {
  type: PopupType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  autoHide?: boolean;
  duration?: number;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface PopupContextType {
  showPopup: (options: PopupOptions) => void;
  hidePopup: () => void;
  popup: PopupOptions | null;
  visible: boolean;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export function PopupProvider({ children }: { children: React.ReactNode }) {
  const [popup, setPopup] = useState<PopupOptions | null>(null);
  const [visible, setVisible] = useState(false);

  const showPopup = useCallback((options: PopupOptions) => {
    setPopup(options);
    setVisible(true);
  }, []);

  const hidePopup = useCallback(() => {
    setVisible(false);
    setPopup(null);
  }, []);

  const handleConfirm = useCallback(() => {
    if (popup?.onConfirm) {
      popup.onConfirm();
    }
    hidePopup();
  }, [popup, hidePopup]);

  const handleCancel = useCallback(() => {
    if (popup?.onCancel) {
      popup.onCancel();
    }
    hidePopup();
  }, [popup, hidePopup]);

  return (
    <PopupContext.Provider value={{ showPopup, hidePopup, popup, visible }}>
      {children}
      {popup && (
        <Popup
          visible={visible}
          type={popup.type}
          title={popup.title}
          message={popup.message}
          confirmText={popup.confirmText}
          cancelText={popup.cancelText}
          showCancel={popup.showCancel}
          autoHide={popup.autoHide}
          duration={popup.duration}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          onClose={hidePopup}
        />
      )}
    </PopupContext.Provider>
  );
}

export function usePopup() {
  const context = useContext(PopupContext);
  if (context === undefined) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
}