import React, { createContext, useContext, useState, useCallback } from 'react';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: 'info', // 'success', 'error', 'warning', 'confirm', 'info'
        title: '',
        message: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        onConfirm: null,
        onClose: null,
        loading: false,
        icon: null
    });

    const showModal = useCallback((config) => {
        setModalConfig({
            isOpen: true,
            type: config.type || 'info',
            title: config.title || '',
            message: config.message || '',
            confirmText: config.confirmText || 'Confirm',
            cancelText: config.cancelText || 'Cancel',
            onConfirm: config.onConfirm || null,
            onClose: config.onClose || null,
            loading: false,
            icon: config.icon || null
        });
    }, []);

    const hideModal = useCallback(() => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
    }, []);

    const setModalLoading = useCallback((loading) => {
        setModalConfig(prev => ({ ...prev, loading }));
    }, []);

    const confirm = useCallback((config) => {
        return new Promise((resolve) => {
            showModal({
                ...config,
                type: config.type || 'confirm',
                onConfirm: () => {
                    if (config.onConfirm) {
                        const result = config.onConfirm();
                        if (result instanceof Promise) {
                            setModalLoading(true);
                            result.then(() => {
                                hideModal();
                                resolve(true);
                            }).catch(() => {
                                setModalLoading(false);
                            });
                            return;
                        }
                    }
                    hideModal();
                    resolve(true);
                },
                onClose: () => {
                    if (config.onClose) config.onClose();
                    hideModal();
                    resolve(false);
                }
            });
        });
    }, [showModal, hideModal, setModalLoading]);

    const success = useCallback((config) => {
        showModal({
            ...config,
            type: 'success',
            confirmText: config.confirmText || 'Great!',
            onConfirm: () => {
                if (config.onConfirm) config.onConfirm();
                hideModal();
            }
        });
    }, [showModal, hideModal]);

    const error = useCallback((config) => {
        showModal({
            ...config,
            type: 'error',
            confirmText: config.confirmText || 'Close',
            onConfirm: () => {
                if (config.onConfirm) config.onConfirm();
                hideModal();
            }
        });
    }, [showModal, hideModal]);

    return (
        <ModalContext.Provider value={{ modalConfig, showModal, hideModal, confirm, success, error, setModalLoading }}>
            {children}
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};
