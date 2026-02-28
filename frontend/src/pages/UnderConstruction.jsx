import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export default function UnderConstruction() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto bg-gray-50/50 flex flex-col items-center justify-center p-6">
                    <div className="max-w-md w-full text-center">

                        {/* Illustration Container */}
                        <div className="relative w-64 h-64 mx-auto mb-8">
                            {/* Animated Background Blob */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-teal-100 to-purple-50 rounded-full blur-2xl opacity-60 animate-pulse"></div>

                            {/* Construction Icon / Graphic */}
                            <div className="relative z-10 w-full h-full flex items-center justify-center">
                                <svg className="w-40 h-40 text-[#08A698]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.703.127 1.543.9 1.09 3.07.471 4.504A17.118 17.118 0 0116 21.38m-7.856-.379a2.75 2.75 0 003.882-3.882L6.15 11.232a2.75 2.75 0 00-3.882 3.882l5.876 5.879zM16 11.23l-3.033 2.497c-.383.316-.626.74-.766 1.207l1.303 1.583m-4.138-1.583l-1.303 1.583" />
                                </svg>
                            </div>
                        </div>

                        {/* Text Content */}
                        <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
                            Under Construction
                        </h1>
                        <p className="text-gray-500 mb-10 leading-relaxed text-lg">
                            We're working hard to bring you this feature. <br />
                            Stay tuned for something amazing!
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="px-8 py-3 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 hover:text-[#08A698] transition-all shadow-sm hover:shadow-md flex items-center gap-2 group"
                            >
                                <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                Go Back
                            </button>
                            <button className="px-8 py-3 bg-[#08A698] text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-all shadow-md shadow-teal-200 hover:shadow-lg hover:-translate-y-0.5">
                                Notify Me When Ready
                            </button>
                        </div>

                    </div>

                    {/* Footer / Copyright overlay */}
                    <div className="absolute bottom-6 text-xs text-gray-400">
                        &copy; 2024 WeWave CRM. All rights reserved.
                    </div>
                </main>
            </div>
        </div>
    );
}
