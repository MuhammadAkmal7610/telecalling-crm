import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
    ExclamationTriangleIcon, 
    CheckCircleIcon, 
    XCircleIcon, 
    InformationCircleIcon,
    XMarkIcon 
} from '@heroicons/react/24/outline';
import { useModal } from '../context/ModalContext';

const GlobalModal = () => {
    const { modalConfig, hideModal } = useModal();
    const { 
        isOpen, 
        type, 
        title, 
        message, 
        confirmText, 
        cancelText, 
        onConfirm, 
        onClose, 
        loading,
        icon: CustomIcon
    } = modalConfig;

    const typeThemes = {
        success: {
            icon: CheckCircleIcon,
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-500',
            btnBg: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200',
        },
        error: {
            icon: XCircleIcon,
            iconBg: 'bg-rose-50',
            iconColor: 'text-rose-500',
            btnBg: 'bg-rose-600 hover:bg-rose-700 shadow-rose-200',
        },
        warning: {
            icon: ExclamationTriangleIcon,
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-500',
            btnBg: 'bg-amber-600 hover:bg-amber-700 shadow-amber-200',
        },
        confirm: {
            icon: ExclamationTriangleIcon,
            iconBg: 'bg-teal-50',
            iconColor: 'text-teal-600',
            btnBg: 'bg-[#08A698] hover:bg-[#079084] shadow-teal-200',
        },
        info: {
            icon: InformationCircleIcon,
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-500',
            btnBg: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200',
        }
    };

    const theme = typeThemes[type] || typeThemes.info;
    const Icon = CustomIcon || theme.icon;

    const handleClose = () => {
        if (onClose) onClose();
        hideModal();
    };

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        else hideModal();
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[1000]" onClose={handleClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-[2.5rem] bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-white/20">
                                {/* Header / Close Button */}
                                <div className="absolute right-6 top-6 z-10">
                                    <button
                                        type="button"
                                        className="rounded-full bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 p-2 transition-all active:scale-90"
                                        onClick={handleClose}
                                    >
                                        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </div>

                                <div className="bg-white px-8 pb-8 pt-10">
                                    <div className="flex flex-col items-center text-center">
                                        <div className={`flex h-20 w-20 items-center justify-center rounded-[2rem] ${theme.iconBg} mb-8 shadow-inner ring-4 ring-white`}>
                                            <Icon className={`h-10 w-10 ${theme.iconColor}`} aria-hidden="true" />
                                        </div>
                                        <Dialog.Title as="h3" className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
                                            {title}
                                        </Dialog.Title>
                                        <div className="text-sm text-gray-500 leading-relaxed font-medium">
                                            {message}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50/50 px-8 py-8 flex flex-col gap-3 border-t border-gray-100/50">
                                    <button
                                        type="button"
                                        disabled={loading}
                                        className={`w-full justify-center rounded-2xl px-6 py-4 text-base font-black text-white shadow-xl transition-all active:scale-95 disabled:opacity-50 ${theme.btnBg}`}
                                        onClick={handleConfirm}
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                <span>Processing...</span>
                                            </div>
                                        ) : confirmText}
                                    </button>
                                    
                                    {(type === 'confirm' || type === 'warning') && (
                                        <button
                                            type="button"
                                            className="w-full justify-center rounded-2xl bg-white px-6 py-4 text-base font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all active:scale-95"
                                            onClick={handleClose}
                                        >
                                            {cancelText}
                                        </button>
                                    )}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
};

export default GlobalModal;
