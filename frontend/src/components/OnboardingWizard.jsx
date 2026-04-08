import React, { useState } from 'react';
import { 
    CheckCircleIcon, 
    XMarkIcon,
    BuildingOfficeIcon,
    UserGroupIcon,
    ShieldCheckIcon,
    PuzzlePieceIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';

const steps = [
    { id: 1, name: 'Workspace Config', icon: BuildingOfficeIcon, description: 'Set up your main workspace' },
    { id: 2, name: 'Invite Team', icon: UserGroupIcon, description: 'Add your callers and managers' },
    { id: 3, name: 'Permissions', icon: ShieldCheckIcon, description: 'Assign roles & access' },
    { id: 4, name: 'Integrations', icon: PuzzlePieceIcon, description: 'Connect third-party tools' }
];

export default function OnboardingWizard({ isOpen, onClose }) {
    const [currentStep, setCurrentStep] = useState(1);

    if (!isOpen) return null;

    const nextStep = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        } else {
            onClose(); // Finish onboarding
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300 min-h-[500px]">
                
                {/* Left side: Progress stepper */}
                <div className="bg-gray-50 border-r border-gray-100 p-8 w-full md:w-1/3 flex flex-col">
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900">Getting Started</h2>
                        <p className="text-sm text-gray-500 mt-1">Let's set up your organization</p>
                    </div>

                    <div className="flex-1">
                        <nav aria-label="Progress">
                            <ol role="list" className="overflow-hidden">
                                {steps.map((step, stepIdx) => (
                                    <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'pb-10' : ''}`}>
                                        {stepIdx !== steps.length - 1 ? (
                                            <div className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                        ) : null}
                                        
                                        <div className="relative flex items-start group">
                                            <span className="h-9 flex items-center">
                                                <span className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full border-2 
                                                    ${step.id < currentStep ? 'bg-[#08A698] border-[#08A698]' : 
                                                      step.id === currentStep ? 'bg-white border-[#08A698]' : 'bg-white border-gray-300'}`}
                                                >
                                                    {step.id < currentStep ? (
                                                        <CheckCircleIcon className="w-5 h-5 text-white" aria-hidden="true" />
                                                    ) : (
                                                        <step.icon className={`w-4 h-4 ${step.id === currentStep ? 'text-[#08A698]' : 'text-gray-400'}`} />
                                                    )}
                                                </span>
                                            </span>
                                            <span className="ml-4 min-w-0 flex flex-col">
                                                <span className={`text-sm font-bold tracking-wide ${step.id <= currentStep ? 'text-[#08A698]' : 'text-gray-500'}`}>
                                                    {step.name}
                                                </span>
                                                <span className="text-xs text-gray-500 mt-0.5">{step.description}</span>
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </nav>
                    </div>
                </div>

                {/* Right side: Step content */}
                <div className="flex-1 p-8 flex flex-col bg-white">
                    <div className="flex justify-end">
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 py-6">
                        {currentStep === 1 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Create Workspace</h3>
                                <p className="text-gray-500 mb-6 font-medium">Your workspace is where your leads and campaigns live.</p>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Workspace Name</label>
                                        <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#08A698] focus:border-[#08A698]" placeholder="e.g., Global Sales Team" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#08A698] focus:border-[#08A698]">
                                            <option>Real Estate</option>
                                            <option>EdTech</option>
                                            <option>Finance</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Invite Your Team</h3>
                                <p className="text-gray-500 mb-6 font-medium">Add members to start collaborating immediately.</p>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Addresses (comma separated)</label>
                                        <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#08A698] focus:border-[#08A698]" rows="3" placeholder="john@example.com, jane@example.com"></textarea>
                                    </div>
                                    <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm flex gap-3">
                                        <UserGroupIcon className="w-5 h-5 flex-shrink-0" />
                                        <p>You can also upload a CSV of team members later from the Users Management page.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Role Assignment &amp; Access</h3>
                                <p className="text-gray-500 mb-6 font-medium">Define what your invited users can see and do.</p>
                                
                                <div className="space-y-4 border border-gray-200 rounded-xl divide-y divide-gray-100">
                                    <div className="p-4 flex justify-between items-center bg-gray-50">
                                        <div>
                                            <p className="font-bold text-gray-900">Default Caller Role</p>
                                            <p className="text-xs text-gray-500">Can view assigned leads and make calls</p>
                                        </div>
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-semibold">Active</span>
                                    </div>
                                    <div className="p-4 flex justify-between items-center bg-gray-50">
                                        <div>
                                            <p className="font-bold text-gray-900">Default Manager Role</p>
                                            <p className="text-xs text-gray-500">Can view all team leads and access reports</p>
                                        </div>
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-semibold">Active</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Connect Integrations</h3>
                                <p className="text-gray-500 mb-6 font-medium">Auto-sync leads from your existing platforms.</p>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-[#08A698] hover:bg-[#08A698]/5 transition-all">
                                        <PuzzlePieceIcon className="w-8 h-8 text-blue-600 mb-2" />
                                        <p className="font-bold text-sm">Facebook Leads</p>
                                    </div>
                                    <div className="border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-[#08A698] hover:bg-[#08A698]/5 transition-all">
                                        <PuzzlePieceIcon className="w-8 h-8 text-green-500 mb-2" />
                                        <p className="font-bold text-sm">WhatsApp</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                        <button 
                            onClick={prevStep} 
                            disabled={currentStep === 1}
                            className={`px-5 py-2.5 font-medium rounded-lg transition-colors ${currentStep === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            Back
                        </button>
                        
                        <button 
                            onClick={nextStep}
                            className="flex items-center gap-2 px-6 py-2.5 bg-[#08A698] hover:bg-[#079186] text-white font-medium rounded-lg shadow-sm transition-all active:scale-95"
                        >
                            {currentStep === steps.length ? 'Complete Setup' : 'Continue'}
                            {currentStep !== steps.length && <ChevronRightIcon className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
