import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

/**
 * ConfirmModal
 * 
 * A reusable confirmation modal for destructive actions.
 */
const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger', // danger, warning, info
    loading = false
}) => {
    const typeThemes = {
        danger: {
            icon: ExclamationTriangleIcon,
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            btnBg: 'bg-red-600 hover:bg-red-700 shadow-red-100',
        },
        warning: {
            icon: ExclamationTriangleIcon,
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600',
            btnBg: 'bg-amber-600 hover:bg-amber-700 shadow-amber-100',
        },
        info: {
            icon: ExclamationTriangleIcon, // Could use Info icon
            iconBg: 'bg-teal-100',
            iconColor: 'text-teal-600',
            btnBg: 'bg-[#08A698] hover:bg-teal-700 shadow-teal-100',
        }
    };

    const theme = typeThemes[type] || typeThemes.danger;
    const Icon = theme.icon;

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500/75 backdrop-blur-sm transition-opacity" />
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
                            <Dialog.Panel className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-gray-100">
                                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                                    <button
                                        type="button"
                                        className="rounded-full bg-white text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-1 transition-all"
                                        onClick={onClose}
                                    >
                                        <span className="sr-only">Close</span>
                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div>

                                <div className="bg-white px-4 pb-4 pt-5 sm:p-8 sm:pb-6">
                                    <div className="sm:flex sm:items-start flex-col items-center sm:items-start text-center sm:text-left">
                                        <div className={`mx-auto flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl ${theme.iconBg} sm:mx-0 mb-6 shadow-sm ring-1 ring-white/50`}>
                                            <Icon className={`h-8 w-8 ${theme.iconColor}`} aria-hidden="true" />
                                        </div>
                                        <div className="mt-3 text-center sm:ml-0 sm:mt-0 sm:text-left">
                                            <Dialog.Title as="h3" className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">
                                                {title}
                                            </Dialog.Title>
                                            <div className="mt-2 text-sm text-gray-500 leading-relaxed font-medium">
                                                {message}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50/50 px-4 py-6 sm:flex sm:flex-row-reverse sm:px-8 gap-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        disabled={loading}
                                        className={`inline-flex w-full justify-center rounded-2xl px-8 py-3.5 text-base font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 sm:w-auto ${theme.btnBg}`}
                                        onClick={onConfirm}
                                    >
                                        {loading ? (
                                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : confirmText}
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 inline-flex w-full justify-center rounded-2xl bg-white px-8 py-3.5 text-base font-bold text-gray-600 shadow-sm ring-1 ring-inset ring-gray-200 hover:bg-gray-50 sm:mt-0 sm:w-auto transition-all active:scale-95"
                                        onClick={onClose}
                                    >
                                        {cancelText}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
};

export default ConfirmModal;
