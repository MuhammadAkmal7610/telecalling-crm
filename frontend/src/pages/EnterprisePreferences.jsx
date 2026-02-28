import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
    Cog6ToothIcon,
    GlobeAltIcon,
    ClockIcon,
    CurrencyDollarIcon,
    PhoneIcon,
    PowerIcon,
    ChartBarIcon,
    FunnelIcon,
    StarIcon,
    MapPinIcon,
    MegaphoneIcon,
    WrenchScrewdriverIcon,
    UserGroupIcon,
    CommandLineIcon,
    ChevronDownIcon,
    CheckIcon,
    BuildingOfficeIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

const useClickOutside = (ref, handler) => {
    useEffect(() => {
        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            handler(event);
        };
        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);
        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [ref, handler]);
};

const CustomSelect = ({ value, onChange, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useClickOutside(ref, () => setIsOpen(false));

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`relative w-full py-2.5 pl-4 pr-10 text-left bg-white rounded-lg border cursor-pointer focus:outline-none transition-all duration-200 shadow-sm
                ${isOpen ? 'border-[#08A698] ring-1 ring-[#08A698] shadow-md' : 'border-gray-300 hover:border-[#08A698] hover:shadow-md text-gray-700'}`}
            >
                <span className="block truncate text-sm font-medium">{value}</span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ChevronDownIcon
                        className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180 text-[#08A698]' : ''}`}
                        aria-hidden="true"
                    />
                </span>
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-1.5 w-full bg-white rounded-xl shadow-2xl border border-gray-100 py-1.5 animate-in fade-in zoom-in-95 duration-200 origin-top ring-1 ring-black/5">
                    {options.map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => {
                                onChange({ target: { value: option } });
                                setIsOpen(false);
                            }}
                            className={`relative w-full cursor-pointer select-none py-2.5 pl-4 pr-9 text-left text-sm transition-all duration-150
                                ${option === value ? 'bg-[#08A698]/5 text-[#08A698] font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                        >
                            <span className="block truncate">{option}</span>
                            {option === value && (
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#08A698]">
                                    <CheckIcon className="h-4 w-4" aria-hidden="true" />
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const Toggle = ({ enabled, onChange }) => (
    <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#08A698] focus:ring-offset-2 ${enabled ? 'bg-[#08A698]' : 'bg-gray-200'
            }`}
    >
        <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
        />
    </button>
);

const Section = ({ title, children }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 rounded-t-xl">
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="p-6 space-y-6 rounded-b-xl">
            {children}
        </div>
    </div>
);

const SettingRow = ({ icon: Icon, label, children }) => (
    <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <div className="w-full max-w-xs">{children}</div>
    </div>
);

const ToggleRow = ({ icon: Icon, label, enabled, onChange }) => (
    <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <Toggle enabled={enabled} onChange={onChange} />
    </div>
);

export default function EnterprisePreferences() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // State
    const [countryCode, setCountryCode] = useState('92');
    const [timezone, setTimezone] = useState('Asia/Karachi');
    const [currency, setCurrency] = useState('PKR');
    const [minDuration, setMinDuration] = useState('2');
    const [sessionTimeout, setSessionTimeout] = useState('Never');

    // Toggles
    const [toggles, setToggles] = useState({
        newReporting: true,
        leadStage: true,
        leadRating: false,
        locationCheckIn: false,
        campaign: true,
        customActions: false,
        salesGroup: false
    });

    const handleToggle = (key) => {
        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans antialiased">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <div className="max-w-5xl mx-auto">

                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
                            <div className='flex items-center gap-3'>
                                <BuildingOfficeIcon className="w-8 h-8 text-gray-500" strokeWidth={1.5} />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                        Enterprise Preferences
                                        <button className="p-1.5 text-gray-400 hover:text-[#08A698] hover:bg-[#08A698]/5 rounded-full transition-colors">
                                            <ArrowPathIcon className="w-4 h-4" />
                                        </button>
                                    </h1>
                                    <p className="text-gray-500 text-sm mt-1">Manage your workspace settings and feature accessibility</p>
                                </div>
                            </div>
                        </div>

                        <Section title="Workspace Preferences">
                            <SettingRow icon={GlobeAltIcon} label="Default Country Code">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-lg">🇵🇰</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={countryCode}
                                        onChange={(e) => setCountryCode(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2.5 text-right border-gray-300 rounded-lg text-sm focus:ring-[#08A698] focus:border-[#08A698] shadow-sm bg-gray-50 border transition-all duration-200"
                                    />
                                </div>
                            </SettingRow>

                            <SettingRow icon={ClockIcon} label="Default Timezone">
                                <CustomSelect
                                    value={timezone}
                                    onChange={(e) => setTimezone(e.target.value)}
                                    options={['Asia/Karachi', 'Asia/Dubai', 'Europe/London', 'America/New_York']}
                                />
                            </SettingRow>

                            <SettingRow icon={CurrencyDollarIcon} label="Default Currency">
                                <CustomSelect
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    options={['PKR', 'USD', 'EUR', 'AED']}
                                />
                            </SettingRow>

                            <SettingRow icon={PhoneIcon} label="Connected Call Minimum Duration (in sec)">
                                <input
                                    type="number"
                                    value={minDuration}
                                    onChange={(e) => setMinDuration(e.target.value)}
                                    className="block w-full py-2.5 px-3 text-right border border-gray-300 rounded-lg text-sm focus:ring-[#08A698] focus:border-[#08A698] shadow-sm transition-all duration-200"
                                />
                            </SettingRow>

                            <SettingRow icon={PowerIcon} label="Session Timeout">
                                <CustomSelect
                                    value={sessionTimeout}
                                    onChange={(e) => setSessionTimeout(e.target.value)}
                                    options={['Never', '30 Minutes', '1 Hour', '4 Hours']}
                                />
                            </SettingRow>
                        </Section>

                        <Section title="Leaderboard">
                            <ToggleRow
                                icon={ChartBarIcon}
                                label="New Reporting"
                                enabled={toggles.newReporting}
                                onChange={() => handleToggle('newReporting')}
                            />
                            <ToggleRow
                                icon={FunnelIcon}
                                label="Lead Stage"
                                enabled={toggles.leadStage}
                                onChange={() => handleToggle('leadStage')}
                            />
                            <ToggleRow
                                icon={StarIcon}
                                label="Lead Rating"
                                enabled={toggles.leadRating}
                                onChange={() => handleToggle('leadRating')}
                            />
                        </Section>

                        <Section title="Features">
                            <ToggleRow
                                icon={MapPinIcon}
                                label="Location Check-in"
                                enabled={toggles.locationCheckIn}
                                onChange={() => handleToggle('locationCheckIn')}
                            />
                            <ToggleRow
                                icon={MegaphoneIcon}
                                label="Campaign"
                                enabled={toggles.campaign}
                                onChange={() => handleToggle('campaign')}
                            />
                            <ToggleRow
                                icon={CommandLineIcon}
                                label="Custom Actions"
                                enabled={toggles.customActions}
                                onChange={() => handleToggle('customActions')}
                            />
                            <ToggleRow
                                icon={UserGroupIcon}
                                label="Sales Group"
                                enabled={toggles.salesGroup}
                                onChange={() => handleToggle('salesGroup')}
                            />
                        </Section>

                    </div>
                </main>
            </div>
        </div>
    );
}
