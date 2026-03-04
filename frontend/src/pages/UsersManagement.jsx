import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { usePermission } from '../hooks/usePermission';
import {
    MagnifyingGlassIcon,
    ChevronDownIcon,
    ArrowDownTrayIcon,
    UserPlusIcon,
    CreditCardIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    PhoneIcon,
    UserIcon,
    MegaphoneIcon,
    KeyIcon,
    Cog6ToothIcon,
    CheckCircleIcon,
    ArrowPathIcon,
    UserGroupIcon,
    TableCellsIcon,
    CalendarIcon,
    CheckIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import Logo from '../assets/Logo.png';
import WorkspaceGuard from '../components/WorkspaceGuard';
import ConfirmModal from '../components/ConfirmModal';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

function useClickOutside(ref, handler) {
    useEffect(() => {
        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            handler(event);
        };
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
}

const CustomCalendar = ({ value, onChange }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewDate, setViewDate] = useState(new Date(currentDate));

    const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const changeMonth = (offset, e) => {
        e.stopPropagation();
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
    };

    const handleDateClick = (day, e) => {
        e.stopPropagation();
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        const formatted = newDate.toISOString().split('T')[0];
        onChange(formatted);
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    const renderCalendarDays = () => {
        const days = [];
        const totalDays = daysInMonth(viewDate);
        const startDay = firstDayOfMonth(viewDate);

        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
        }

        for (let i = 1; i <= totalDays; i++) {
            const dateStr = new Date(viewDate.getFullYear(), viewDate.getMonth(), i).toISOString().split('T')[0];
            const isSelected = value === dateStr;
            const isToday = new Date().toDateString() === new Date(viewDate.getFullYear(), viewDate.getMonth(), i).toDateString();

            days.push(
                <button
                    key={i}
                    onClick={(e) => handleDateClick(i, e)}
                    className={`h-8 w-8 rounded-full text-sm flex items-center justify-center transition-all
                    ${isSelected ? 'bg-[#08A698] text-white font-bold shadow-md shadow-[#08A698]/30' : 'text-gray-700 hover:bg-gray-100'}
                    ${isToday && !isSelected ? 'border border-[#08A698] text-[#08A698] font-semibold' : ''}
                    `}
                >
                    {i}
                </button>
            );
        }
        return days;
    };

    return (
        <div className="p-4 bg-white border-t border-gray-100 mt-2">
            <div className="flex items-center justify-between mb-4">
                <button onClick={(e) => changeMonth(-1, e)} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 transition-colors">
                    <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-gray-900">
                    {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                </span>
                <button onClick={(e) => changeMonth(1, e)} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 transition-colors">
                    <ChevronRightIcon className="w-4 h-4" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {daysOfWeek.map(d => (
                    <div key={d} className="h-8 w-8 flex items-center justify-center text-xs font-medium text-gray-400">
                        {d}
                    </div>
                ))}
                {renderCalendarDays()}
            </div>
        </div>
    );
};

const LicenseDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const ref = useRef(null);

    useClickOutside(ref, () => setIsOpen(false));

    const options = [
        'Free',
        'Pro',
        'Expired',
        'Expiring in 7 days'
    ];

    const displayValue = selectedDate || selectedOption || 'License';

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors font-medium whitespace-nowrap
                ${(selectedOption || selectedDate || isOpen) ? 'bg-[#08A698]/5 text-[#08A698] ring-1 ring-[#08A698]/20' : 'text-[#08A698] hover:bg-[#08A698]/5'}`}
            >
                <CreditCardIcon className="w-4 h-4" />
                <span className="text-gray-600">{displayValue}</span>
                {selectedOption || selectedDate ? (
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOption('');
                            setSelectedDate('');
                        }}
                        className="p-0.5 rounded-full hover:bg-[#08A698]/10 text-[#08A698]"
                    >
                        <XMarkIcon className="w-3 h-3" />
                    </div>
                ) : (
                    <ChevronDownIcon className={`w-3 h-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                )}
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="py-2">
                        {options.map((option) => (
                            <button
                                key={option}
                                onClick={() => {
                                    setSelectedOption(option);
                                    setSelectedDate('');
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between
                                ${selectedOption === option ? 'bg-[#08A698]/5 text-[#08A698] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                {option}
                                {selectedOption === option && <CheckIcon className="w-4 h-4" />}
                            </button>
                        ))}
                    </div>

                    <CustomCalendar
                        value={selectedDate}
                        onChange={(date) => {
                            setSelectedDate(date);
                            setSelectedOption('');
                            setIsOpen(false);
                        }}
                    />
                </div>
            )}
        </div>
    );
};


const StatusDropdown = ({ selectedStatuses, toggleStatus }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useClickOutside(ref, () => setIsOpen(false));

    const options = ['Invited', 'Deleted', 'Working', 'On Leave'];

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors font-medium whitespace-nowrap
                ${(selectedStatuses.length > 0 || isOpen) ? 'bg-[#08A698]/5 text-[#08A698] ring-1 ring-[#08A698]/20' : 'text-[#08A698] hover:bg-[#08A698]/5'}`}
            >
                <CheckCircleIcon className="w-4 h-4" />
                <span className="text-gray-600">Status {selectedStatuses.length > 0 && `(${selectedStatuses.length})`}</span>
                <ChevronDownIcon className={`w-3 h-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 space-y-1">
                        {options.map((option) => (
                            <label
                                key={option}
                                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedStatuses.includes(option)}
                                    onChange={() => toggleStatus(option)}
                                    className="rounded border-gray-300 text-[#08A698] focus:ring-[#08A698] focus:ring-offset-0"
                                />
                                {option}
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


const RoleDropdown = ({ selectedRoles, toggleRole }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useClickOutside(ref, () => setIsOpen(false));

    const options = [
        { id: 'root', label: 'Root', icon: KeyIcon },
        { id: 'admin', label: 'Admin', icon: Cog6ToothIcon },
        { id: 'manager', label: 'Manager', icon: UserIcon },
        { id: 'caller', label: 'Caller', icon: PhoneIcon },
        { id: 'marketing', label: 'Marketing User', icon: MegaphoneIcon },
    ];

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors font-medium whitespace-nowrap
                ${(selectedRoles.length > 0 || isOpen) ? 'bg-[#08A698]/5 text-[#08A698] ring-1 ring-[#08A698]/20' : 'text-[#08A698] hover:bg-[#08A698]/5'}`}
            >
                <UserIcon className="w-4 h-4" />
                <span className="text-gray-600">Role {selectedRoles.length > 0 && `(${selectedRoles.length})`}</span>
                <ChevronDownIcon className={`w-3 h-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 space-y-1">
                        {options.map((option) => (
                            <label
                                key={option.id}
                                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedRoles.includes(option.id)}
                                    onChange={() => toggleRole(option.id)}
                                    className="rounded border-gray-300 text-[#08A698] focus:ring-[#08A698] focus:ring-offset-0"
                                />
                                <option.icon className="w-4 h-4 text-gray-400" />
                                {option.label}
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


const WhatsAppLogo = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
);

const AvailableLicensesModal = ({ isOpen, onClose }) => {
    const [licenseTypeOpen, setLicenseTypeOpen] = useState(false);
    const [expiryDateOpen, setExpiryDateOpen] = useState(false);
    const [selectedLicenseType, setSelectedLicenseType] = useState('');
    const [selectedExpiryDate, setSelectedExpiryDate] = useState('');

    const licenseTypeRef = useRef(null);
    const expiryDateRef = useRef(null);

    useClickOutside(licenseTypeRef, () => setLicenseTypeOpen(false));
    useClickOutside(expiryDateRef, () => setExpiryDateOpen(false));

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center font-sans">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl transform transition-all animate-in fade-in zoom-in-95 duration-200 m-4 border border-gray-100 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-white rounded-t-2xl">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-[#08A698]/10 rounded-xl">
                            <CreditCardIcon className="w-6 h-6 text-[#08A698]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 leading-tight">Available Licenses</h2>
                            <p className="text-sm text-gray-500 mt-0.5">Manage and assign your available licenses</p>
                        </div>
                        <span className="ml-2 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">
                            1 Available
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-all duration-200"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between px-8 py-5 bg-gray-50/50 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search licenses..."
                                className="pl-9 pr-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#08A698]/20 focus:border-[#08A698] w-64 transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {/* License Type Dropdown */}
                        <div className="relative" ref={licenseTypeRef}>
                            <button
                                onClick={() => setLicenseTypeOpen(!licenseTypeOpen)}
                                className={`flex items-center gap-2 px-4 py-2 bg-white border transition-all text-sm font-medium rounded-lg shadow-sm
                                ${licenseTypeOpen || selectedLicenseType ? 'border-[#08A698] text-[#08A698] ring-1 ring-[#08A698]/20' : 'border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'}`}
                            >
                                {selectedLicenseType ? (
                                    <span className="flex items-center gap-2">
                                        {selectedLicenseType === 'Whatsapp Chat Sync' && <WhatsAppLogo className="w-4 h-4" />}
                                        {selectedLicenseType}
                                    </span>
                                ) : (
                                    <>
                                        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                        All Types
                                    </>
                                )}
                                <ChevronDownIcon className={`w-4 h-4 transition-transform ${licenseTypeOpen ? 'rotate-180' : ''} ${selectedLicenseType ? 'text-[#08A698]' : 'text-gray-400'}`} />
                            </button>

                            {licenseTypeOpen && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                setSelectedLicenseType('Whatsapp Chat Sync');
                                                setLicenseTypeOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between hover:bg-gray-50"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <img src={Logo} alt="Logo" className="w-8 h-8 object-contain" />
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                                                        <WhatsAppLogo className="w-3 h-3 text-[#25D366]" />
                                                    </div>
                                                </div>
                                                <span className="text-gray-900 font-medium">Whatsapp Chat Sync</span>
                                            </div>
                                            {selectedLicenseType === 'Whatsapp Chat Sync' && <CheckIcon className="w-4 h-4 text-[#08A698]" />}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedLicenseType('Core crm');
                                                setLicenseTypeOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between hover:bg-gray-50"
                                        >
                                            <div className="flex items-center gap-3">
                                                <img src={Logo} alt="Logo" className="w-8 h-8 object-contain" />
                                                <span className="text-gray-900 font-medium">Core crm</span>
                                            </div>
                                            {selectedLicenseType === 'Core crm' && <CheckIcon className="w-4 h-4 text-[#08A698]" />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Expiry Date Dropdown */}
                        <div className="relative" ref={expiryDateRef}>
                            <button
                                onClick={() => setExpiryDateOpen(!expiryDateOpen)}
                                className={`flex items-center gap-2 px-4 py-2 bg-white border transition-all text-sm font-medium rounded-lg shadow-sm
                                ${expiryDateOpen || selectedExpiryDate ? 'border-[#08A698] text-[#08A698] ring-1 ring-[#08A698]/20' : 'border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'}`}
                            >
                                <CalendarIcon className={`w-4 h-4 ${selectedExpiryDate ? 'text-[#08A698]' : 'text-gray-500'}`} />
                                {selectedExpiryDate || 'Expiry Date'}
                                {selectedExpiryDate && (
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedExpiryDate('');
                                        }}
                                        className="p-0.5 rounded-full hover:bg-[#08A698]/10 ml-1"
                                    >
                                        <XMarkIcon className="w-3 h-3" />
                                    </div>
                                )}
                                {!selectedExpiryDate && <ChevronDownIcon className={`w-4 h-4 transition-transform ${expiryDateOpen ? 'rotate-180' : ''} text-gray-400`} />}
                            </button>

                            {expiryDateOpen && (
                                <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <CustomCalendar
                                        value={selectedExpiryDate}
                                        onChange={(date) => {
                                            setSelectedExpiryDate(date);
                                            setExpiryDateOpen(false);
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">License Type</th>
                                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Expiry Date</th>
                                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-8 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 bg-white">
                            <tr className="hover:bg-gray-50 transition-colors group">
                                <td className="px-8 py-5 whitespace-nowrap">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366] shadow-sm ring-1 ring-[#25D366]/20">
                                            <WhatsAppLogo className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-gray-900">WhatsApp ChatSync</div>
                                            <div className="text-xs text-gray-500">Business API License</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-900">17 Mar 2026</span>
                                        <span className="text-xs text-gray-500">1 year remaining</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5 whitespace-nowrap">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                        Active
                                    </span>
                                </td>
                                <td className="px-8 py-5 whitespace-nowrap text-right">
                                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#08A698] text-white text-sm font-medium rounded-lg hover:bg-[#079084] hover:shadow-md hover:shadow-[#08A698]/20 transition-all active:scale-95">
                                        <UserPlusIcon className="w-4 h-4" />
                                        Assign License
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="px-8 py-4 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between rounded-b-2xl">
                    <p className="text-xs text-gray-500">Showing 1 available license</p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// modal component for inviting a new user
const AddUserModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        initials: '',
        password: '',
        phone: '',
        role: 'caller',
        permissionTemplateId: '',
        licenseType: ''
    });
    const [templates, setTemplates] = useState([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchTemplates();
        }
    }, [isOpen]);

    const fetchTemplates = async () => {
        setLoadingTemplates(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const res = await fetch(`${API_URL}/templates`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            if (res.ok) {
                const result = await res.json();
                const data = result.data?.data || result.data || [];
                setTemplates(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setLoadingTemplates(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center font-sans">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl transform transition-all animate-in fade-in zoom-in-95 duration-200 m-4 border border-gray-100 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Add User</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-all">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    <div className="grid grid-cols-1 gap-6">

                        {/* Name & Initials */}
                        <div className="grid grid-cols-12 gap-4 items-center">
                            <label className="col-span-4 text-sm font-semibold text-gray-700">Name<span className="text-red-500">*</span></label>
                            <div className="col-span-8">
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Name"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#08A698] focus:ring-2 focus:ring-[#08A698]/10 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4 items-center">
                            <label className="col-span-4 text-sm font-semibold text-gray-700">Initials<span className="text-red-500">*</span></label>
                            <div className="col-span-8">
                                <input
                                    name="initials"
                                    value={formData.initials}
                                    onChange={handleChange}
                                    placeholder="Initials"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#08A698] focus:ring-2 focus:ring-[#08A698]/10 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="grid grid-cols-12 gap-4 items-center">
                            <label className="col-span-4 text-sm font-semibold text-gray-700">Email<span className="text-red-500">*</span></label>
                            <div className="col-span-8">
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Email"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#08A698] focus:ring-2 focus:ring-[#08A698]/10 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="grid grid-cols-12 gap-4 items-center">
                            <label className="col-span-4 text-sm font-semibold text-gray-700">Password<span className="text-red-500">*</span></label>
                            <div className="col-span-8">
                                <input
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Password"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#08A698] focus:ring-2 focus:ring-[#08A698]/10 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div className="grid grid-cols-12 gap-4 items-center">
                            <label className="col-span-4 text-sm font-semibold text-gray-700">Phone Number<span className="text-red-500">*</span></label>
                            <div className="col-span-8">
                                <div className="relative flex items-center">
                                    <div className="absolute left-4 flex items-center gap-2 pr-3 border-r border-gray-200">
                                        <span className="text-lg">🇵🇰</span>
                                        <span className="text-sm font-medium text-gray-600">+92</span>
                                    </div>
                                    <input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Enter Phone Number"
                                        className="w-full border border-gray-200 rounded-xl pl-24 pr-4 py-3 text-sm focus:border-[#08A698] focus:ring-2 focus:ring-[#08A698]/10 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <p className="text-[10px] text-red-500 mt-1 font-medium">*Phone Number is required</p>
                            </div>
                        </div>

                        {/* Role */}
                        <div className="grid grid-cols-12 gap-4 items-center">
                            <label className="col-span-4 text-sm font-semibold text-gray-700">Role<span className="text-red-500">*</span></label>
                            <div className="col-span-8">
                                <div className="relative">
                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-sm focus:border-[#08A698] focus:ring-2 focus:ring-[#08A698]/10 outline-none transition-all appearance-none bg-white"
                                        required
                                    >
                                        <option value="caller">Caller</option>
                                        <option value="manager">Manager</option>
                                        <option value="marketing">Marketing User</option>
                                        <option value="admin">Admin</option>
                                        <option value="root">Root</option>
                                    </select>
                                    <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Permission Template */}
                        <div className="grid grid-cols-12 gap-4 items-center">
                            <label className="col-span-4 text-sm font-semibold text-gray-700">Permission Template<span className="text-red-500">*</span></label>
                            <div className="col-span-8">
                                <div className="relative">
                                    <select
                                        name="permissionTemplateId"
                                        value={formData.permissionTemplateId}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#08A698] focus:ring-2 focus:ring-[#08A698]/10 outline-none transition-all appearance-none bg-white"
                                        required
                                    >
                                        <option value="">Select Permission Template</option>
                                        {templates.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* License */}
                        <div className="grid grid-cols-12 gap-4 items-center">
                            <label className="col-span-4 text-sm font-semibold text-gray-700">License</label>
                            <div className="col-span-8">
                                <div className="relative">
                                    <select
                                        name="licenseType"
                                        value={formData.licenseType}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#08A698] focus:ring-2 focus:ring-[#08A698]/10 outline-none transition-all appearance-none bg-white"
                                    >
                                        <option value="">Free</option>
                                        <option value="Core crm">Core crm</option>
                                        <option value="Whatsapp Chat Sync">Whatsapp Chat Sync</option>
                                    </select>
                                    <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/30 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-8 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-white transition-all active:scale-95 shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSubmit(formData)}
                        className="px-8 py-2.5 bg-[#08A698] text-white rounded-xl font-bold text-sm hover:bg-[#079084] transition-all active:scale-95 shadow-md shadow-[#08A698]/20 disabled:opacity-50"
                        disabled={!formData.email || !formData.name}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

// Drawer component for viewing user activity
const UserActivityDrawer = ({ isOpen, onClose, user }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            fetchActivity();
        }
    }, [isOpen, user]);

    const fetchActivity = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await (await import('../lib/supabaseClient')).supabase.auth.getSession();
            const res = await fetch(`${API_URL}/users/${user.id}/activity`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            if (res.ok) {
                const result = await res.json();
                setActivities(result.data || []);
            }
        } catch (error) {
            console.error('Error fetching activity:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] overflow-hidden font-sans">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="absolute inset-y-0 right-0 max-w-lg w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${user.color}`}>
                            {user.initials}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
                            <p className="text-xs text-gray-500">Activity History</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-all">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-3">
                            <ArrowPathIcon className="w-6 h-6 text-[#08A698] animate-spin" />
                            <span className="text-sm text-gray-500">Loading activity...</span>
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400 italic">
                            No recent activity found
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {activities.map((act) => (
                                <div key={act.id} className="relative pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-[-24px] before:w-0.5 before:bg-gray-200 last:before:hidden">
                                    <div className={`absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white shadow-sm z-10
                                        ${act.type === 'call' ? 'bg-blue-100 text-blue-600' : 'bg-teal-100 text-teal-600'}`}>
                                        {act.type === 'call' ? <PhoneIcon className="w-3.5 h-3.5" /> : <TableCellsIcon className="w-3.5 h-3.5" />}
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-bold text-gray-900 capitalize">{act.type} logged</span>
                                            <span className="text-[10px] text-gray-400 font-medium">{new Date(act.created_at).toLocaleString()}</span>
                                        </div>
                                        {act.lead && (
                                            <div className="text-xs text-gray-500 mb-2">
                                                Lead: <span className="font-semibold text-[#08A698]">{act.lead.name}</span>
                                            </div>
                                        )}
                                        {act.notes && (
                                            <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg italic">"{act.notes}"</p>
                                        )}
                                        {act.duration && (
                                            <div className="mt-2 text-[10px] font-medium text-gray-400">{Math.floor(act.duration / 60)}m {act.duration % 60}s</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function UsersManagement() {
    const navigate = useNavigate();
    const { can } = usePermission();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
    // invitation modal for adding a single user
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isActivityDrawerOpen, setIsActivityDrawerOpen] = useState(false);
    const [activeUser, setActiveUser] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState([]);

    const toggleStatus = (status) => {
        setSelectedStatuses(prev =>
            prev.includes(status)
                ? prev.filter(s => s !== status)
                : [...prev, status]
        );
    };

    const toggleRole = (roleId) => {
        setSelectedRoles(prev =>
            prev.includes(roleId)
                ? prev.filter(r => r !== roleId)
                : [...prev, roleId]
        );
    };

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, selectedStatuses, selectedRoles]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            let url = `${API_URL}/users?search=${search}`;
            if (selectedRoles.length > 0) url += `&role=${selectedRoles[0]}`; // Simple filter for now
            if (selectedStatuses.length > 0) url += `&status=${selectedStatuses[0]}`;

            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });
            if (!res.ok) {
                const text = await res.text();
                console.error('fetchUsers failed', res.status, text);
            }
            const result = await res.json();
            const data = result.data?.data || result.data || [];

            // Map backend user to frontend format if needed
            const mappedUsers = data.map(u => ({
                id: u.id,
                name: u.name,
                email: u.email,
                initials: u.initials || u.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U',
                color: 'bg-teal-100 text-teal-600',
                role: u.role?.charAt(0).toUpperCase() + u.role?.slice(1) || 'Caller',
                roleType: u.role || 'caller',
                status: u.status || 'Working',
                permission: u.permission_template?.name || 'Default Permissions',
                expiry: u.license_expiry ? new Date(u.license_expiry).toLocaleDateString() : 'N/A',
                license: u.license_type || 'None',
                phone: u.phone
            }));

            setUsers(mappedUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const inviteUser = async (formData) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // Prepend country code if phone is provided and doesn't start with +
            const body = {
                ...formData,
                phone: formData.phone && !formData.phone.startsWith('+') ? `+92${formData.phone}` : formData.phone
            };

            const res = await fetch(`${API_URL}/users/invite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify(body)
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Invite failed');
            }
            setIsInviteModalOpen(false);
            fetchUsers();
        } catch (e) {
            console.error('Error inviting user:', e);
            alert(e.message);
        }
    };

    const filteredUsers = users.filter(user => {
        const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(user.status);
        const roleMatch = selectedRoles.length === 0 || selectedRoles.includes(user.roleType);
        return statusMatch && roleMatch;
    });

    const getStatusBadge = (status) => {
        const styles = {
            'Working': 'bg-green-50 text-green-700 ring-green-600/20',
            'On Leave': 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
            'Invited': 'bg-blue-50 text-blue-700 ring-blue-600/20',
            'Deleted': 'bg-red-50 text-red-700 ring-red-600/20',
            'Suspended': 'bg-orange-50 text-orange-700 ring-orange-600/20',
        };
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ring-1 ring-inset ${styles[status]}`}>
                {status}
            </span>
        );
    };

    const handleUserStatusChange = async (userId, newStatus) => {
        try {
            const { data: { session } } = await (await import('../lib/supabaseClient')).supabase.auth.getSession();
            const res = await fetch(`${API_URL}/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                toast.success(`User status updated to ${newStatus}`);
                fetchUsers();
            } else {
                const err = await res.json();
                toast.error(err.message || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleDeleteUser = async (userId) => {
        setUserToDelete(userId);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch(`${API_URL}/users/${userToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });
            if (res.ok) {
                toast.success('User deleted successfully');
                fetchUsers();
            } else {
                const err = await res.json();
                toast.error(err.message || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Failed to delete user');
        } finally {
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
        }
    };

    const getRoleIcon = (type) => {
        const iconClass = "w-4 h-4 text-gray-500";
        switch (type) {
            case 'caller': return <PhoneIcon className={iconClass} />;
            case 'manager': return <UserIcon className={iconClass} />;
            case 'marketing': return <MegaphoneIcon className={iconClass} />;
            case 'root': return <KeyIcon className={iconClass} />;
            case 'admin': return <Cog6ToothIcon className={iconClass} />;
            default: return <UserIcon className={iconClass} />;
        }
    };

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans antialiased">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <AvailableLicensesModal
                isOpen={isLicenseModalOpen}
                onClose={() => setIsLicenseModalOpen(false)}
            />
            <UserActivityDrawer
                isOpen={isActivityDrawerOpen}
                user={activeUser}
                onClose={() => setIsActivityDrawerOpen(false)}
            />
            <AddUserModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onSubmit={inviteUser}
            />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <WorkspaceGuard>
                        <div className="max-w-7xl mx-auto">

                            {/* Header Section */}
                            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
                                <div className='flex items-center gap-3'>
                                    <UserGroupIcon className="w-8 h-8 text-gray-500" strokeWidth={1.5} />
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                            User Management
                                            <button
                                                onClick={fetchUsers}
                                                className={`p-1.5 text-gray-400 hover:text-[#08A698] hover:bg-[#08A698]/5 rounded-full transition-colors ${loading ? 'animate-spin' : ''}`}
                                            >
                                                <ArrowPathIcon className="w-4 h-4" />
                                            </button>
                                        </h1>
                                        <p className="text-gray-500 text-sm mt-1">Manage your team</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    {can('export_data') && (
                                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#08A698] text-[#08A698] rounded-lg hover:bg-[#08A698]/5 transition-colors text-sm font-medium shadow-sm">
                                            <ArrowDownTrayIcon className="w-4 h-4" />
                                            Export
                                        </button>
                                    )}

                                    {can('manage_users') && (
                                        <div className="relative">
                                            <button
                                                onClick={() => setIsAddUserOpen(!isAddUserOpen)}
                                                className={`flex items-center gap-2 px-4 py-2 bg-white border border-[#08A698] text-[#08A698] rounded-lg hover:bg-[#08A698]/5 transition-all text-sm font-medium shadow-sm ${isAddUserOpen ? 'ring-2 ring-[#08A698]/20 bg-[#08A698]/5' : ''}`}
                                            >
                                                <UserPlusIcon className="w-4 h-4" />
                                                Add User
                                                <ChevronDownIcon className={`w-3 h-3 ml-1 transition-transform duration-200 ${isAddUserOpen ? 'rotate-180' : ''}`} />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {isAddUserOpen && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-10 opacity-0"
                                                        onClick={() => setIsAddUserOpen(false)}
                                                    ></div>
                                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                                        <button
                                                            onClick={() => { setIsAddUserOpen(false); setIsInviteModalOpen(true); }}
                                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#08A698] transition-colors text-left group">
                                                            <UserPlusIcon className="w-4 h-4 text-gray-400 group-hover:text-[#08A698]" />
                                                            Add single user
                                                        </button>
                                                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#08A698] transition-colors text-left group">
                                                            <TableCellsIcon className="w-4 h-4 text-gray-400 group-hover:text-[#08A698]" />
                                                            Add from excel
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {can('view_billing') && (
                                        <button
                                            onClick={() => navigate('/billing')}
                                            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#08A698] text-[#08A698] rounded-lg hover:bg-[#08A698]/5 transition-colors text-sm font-medium shadow-sm"
                                        >
                                            <CreditCardIcon className="w-4 h-4" />
                                            Buy Licenses
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-gray-200 mb-6">
                                <div className="flex-1 w-full relative">
                                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search by Name, Email or Phone Number"
                                        className="w-full pl-10 pr-4 py-2.5 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                                    />
                                </div>
                                <div className="hidden sm:block w-px h-8 bg-gray-200"></div>
                                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto px-2">
                                    <RoleDropdown selectedRoles={selectedRoles} toggleRole={toggleRole} />
                                    <StatusDropdown selectedStatuses={selectedStatuses} toggleStatus={toggleStatus} />
                                    <LicenseDropdown />
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden z-0 relative">

                                {/* Toolbar */}
                                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/30">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <button className="p-1 rounded-md text-gray-400 hover:text-gray-600 disabled:opacity-50">
                                                <ChevronLeftIcon className="w-4 h-4" />
                                            </button>
                                            <span className="text-sm text-gray-600 font-medium">1 - {filteredUsers.length} of {filteredUsers.length}</span>
                                            <button className="p-1 rounded-md text-gray-400 hover:text-gray-600">
                                                <ChevronRightIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    {can('view_billing') && (
                                        <button
                                            onClick={() => setIsLicenseModalOpen(true)}
                                            className="px-3 py-1 bg-green-50 text-green-700 hover:bg-green-100 text-xs font-bold rounded-full border border-green-100 hover:border-green-200 flex items-center gap-1.5 transition-all cursor-pointer"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                            1 License Available
                                        </button>
                                    )}
                                </div>

                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-white">
                                            <tr>
                                                {can('manage_users') && (
                                                    <th className="px-6 py-4 text-left w-10">
                                                        <input type="checkbox" className="rounded border-gray-300 text-[#08A698] focus:ring-[#08A698]" />
                                                    </th>
                                                )}
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Permission Template</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">License Expiry</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">License Type</th>
                                                {can('manage_users') && (
                                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {loading ? (
                                                <tr>
                                                    <td colSpan="7" className="px-6 py-12 text-center">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <div className="w-8 h-8 border-2 border-[#08A698] border-t-transparent rounded-full animate-spin"></div>
                                                            <span className="text-sm text-gray-500">Loading team members...</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : filteredUsers.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400 italic">
                                                        No users found
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredUsers.map((user) => (
                                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                                        {can('manage_users') && (
                                                            <td className="px-6 py-4">
                                                                <input type="checkbox" className="rounded border-gray-300 text-[#08A698] focus:ring-[#08A698]" />
                                                            </td>
                                                        )}
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${user.color}`}>
                                                                    {user.initials}
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-2">
                                                                {getRoleIcon(user.roleType)}
                                                                <span className="text-sm text-gray-700">{user.role}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {getStatusBadge(user.status)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="text-sm text-gray-600">{user.permission}</span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                                                {user.expiry}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded bg-[#08A698]/10 flex items-center justify-center text-[#08A698]">
                                                                    <WhatsAppLogo className="w-3.5 h-3.5" />
                                                                </div>
                                                                <span className="text-sm text-gray-700">{user.license}</span>
                                                            </div>
                                                        </td>
                                                        {can('manage_users') && (
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    {user.status === 'Suspended' ? (
                                                                        <button
                                                                            onClick={() => handleUserStatusChange(user.id, 'Working')}
                                                                            className="p-1 px-2 border border-teal-200 text-teal-600 rounded hover:bg-teal-50 transition-colors"
                                                                            title="Reactivate"
                                                                        >
                                                                            Activate
                                                                        </button>
                                                                    ) : user.status !== 'Deleted' ? (
                                                                        <button
                                                                            onClick={() => handleUserStatusChange(user.id, 'Suspended')}
                                                                            className="p-1 px-2 border border-orange-200 text-orange-600 rounded hover:bg-orange-50 transition-colors"
                                                                            title="Suspend"
                                                                        >
                                                                            Suspend
                                                                        </button>
                                                                    ) : null}

                                                                    <button
                                                                        onClick={() => {
                                                                            setActiveUser(user);
                                                                            setIsActivityDrawerOpen(true);
                                                                        }}
                                                                        className="p-1 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                                                                        title="View Activity"
                                                                    >
                                                                        <ArrowPathIcon className="w-5 h-5" />
                                                                    </button>

                                                                    {user.status !== 'Deleted' && (
                                                                        <button
                                                                            onClick={() => handleDeleteUser(user.id)}
                                                                            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                                                            title="Delete User"
                                                                        >
                                                                            <XMarkIcon className="w-5 h-5" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                    </WorkspaceGuard>
                </main>
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteUser}
                title="Delete User"
                message="Are you sure you want to delete this user? This will also disable their login and remove their access to the platform."
                type="danger"
                confirmText="Delete User"
            />
        </div>
    );
}
