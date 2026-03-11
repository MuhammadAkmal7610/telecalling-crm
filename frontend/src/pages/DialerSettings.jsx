import { PhoneIcon, ClockIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function DialerSettings() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [progressiveEnabled, setProgressiveEnabled] = useState(localStorage.getItem('progressive_dialer') === 'true');
    const [wrapupTime, setWrapupTime] = useState(localStorage.getItem('wrapup_time') || '30');
    const [autoRecord, setAutoRecord] = useState(localStorage.getItem('auto_record') === 'true');

    const handleSave = () => {
        localStorage.setItem('progressive_dialer', progressiveEnabled);
        localStorage.setItem('wrapup_time', wrapupTime);
        localStorage.setItem('auto_record', autoRecord);
        toast.success('Dialer settings saved locally!');
    };

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto bg-gray-50/50 p-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-gray-900">Auto-Dialer Settings</h1>
                            <p className="text-gray-500 mt-1">Configure automated calling parameters for your agents.</p>
                        </div>

                        <div className="space-y-6">

                            {/* General Settings Card */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                    <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                                        <PhoneIcon className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-900">Calling Sequence</h2>
                                </div>

                                <div className="space-y-5">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-medium text-gray-900 text-sm">Enable Progressive Dialer</h3>
                                            <p className="text-gray-500 text-xs mt-1">Automatically dial the next lead when a call ends.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={progressiveEnabled}
                                                onChange={() => setProgressiveEnabled(!progressiveEnabled)}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#08A698]"></div>
                                        </label>
                                    </div>

                                    <div className="flex justify-between items-center pt-2">
                                        <div>
                                            <h3 className="font-medium text-gray-900 text-sm">Post-Call Wrap-up Time</h3>
                                            <p className="text-gray-500 text-xs mt-1">Time allowed for agents to take notes before the next call.</p>
                                        </div>
                                        <select
                                            value={wrapupTime}
                                            onChange={(e) => setWrapupTime(e.target.value)}
                                            className="border border-gray-300 rounded-lg text-sm px-3 py-1.5 bg-white text-gray-700 outline-none focus:border-[#08A698]"
                                        >
                                            <option value="15">15 Seconds</option>
                                            <option value="30">30 Seconds</option>
                                            <option value="60">60 Seconds</option>
                                            <option value="0">Manual Wrap-up</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Call Recording */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                    <div className="bg-red-50 text-red-600 p-2 rounded-lg">
                                        <ClockIcon className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-900">Recording & Tracking</h2>
                                </div>

                                <div className="space-y-5">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-medium text-gray-900 text-sm">Auto-Record All Calls</h3>
                                            <p className="text-gray-500 text-xs mt-1">Save recordings securely in the cloud.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={autoRecord}
                                                onChange={() => setAutoRecord(!autoRecord)}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#08A698]"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleSave}
                                    className="bg-[#08A698] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-teal-700 transition shadow-sm"
                                >
                                    Save Dialer Settings
                                </button>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
