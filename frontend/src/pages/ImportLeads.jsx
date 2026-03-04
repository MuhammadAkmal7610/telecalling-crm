import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
    CloudArrowUpIcon,
    DocumentArrowDownIcon,
    TrashIcon,
    ArrowPathIcon,
    ChevronRightIcon,
    ChevronLeftIcon,
    CheckCircleIcon,
    UserGroupIcon,
    TableCellsIcon,
    ArrowsRightLeftIcon,
    UserCircleIcon,
    CheckIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import WorkspaceGuard from '../components/WorkspaceGuard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const STEPS = {
    UPLOAD: 'upload',
    MAPPING: 'mapping',
    ASSIGNMENT: 'assignment',
    SUCCESS: 'success'
};

export default function ImportLeads() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(STEPS.UPLOAD);
    const [isUploading, setIsUploading] = useState(false);
    const [fileData, setFileData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [mapping, setMapping] = useState({});
    const [users, setUsers] = useState([]);
    const [leadFields, setLeadFields] = useState([]);
    const [assignments, setAssignments] = useState({}); // userId -> count
    const [fileName, setFileName] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchLeadFields();
        if (currentStep === STEPS.ASSIGNMENT) {
            fetchUsers();
        }
    }, [currentStep]);

    const fetchLeadFields = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const res = await axios.get(`${API_URL}/lead-fields`, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            const fieldsData = res.data.data?.data || res.data.data || res.data || [];
            const fields = Array.isArray(fieldsData) ? fieldsData : [];
            setLeadFields(fields);
        } catch (error) {
            console.error('Error fetching lead fields:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const res = await axios.get(`${API_URL}/users`, {
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            const rawData = res.data.data?.data || res.data.data || res.data || [];
            const userData = Array.isArray(rawData) ? rawData : [];
            const validUsers = userData.filter(u => u.role !== 'root' && u.role !== 'billing_admin');
            setUsers(validUsers);

            // Default assignment: everything to first valid user
            const leadsCount = Array.isArray(fileData) ? fileData.length : 0;
            if (validUsers.length > 0) {
                setAssignments({ [validUsers[0].id]: leadsCount });
            } else {
                setAssignments({});
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error("Failed to load users for assignment");
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = new Uint8Array(evt.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                if (jsonData.length === 0) {
                    toast.error("The file is empty.");
                    return;
                }

                const sheetHeaders = Object.keys(jsonData[0]);
                setHeaders(sheetHeaders);
                setFileData(jsonData);

                // Auto-map based on common names
                const initialMapping = {};
                sheetHeaders.forEach(header => {
                    const normalized = header.toLowerCase().replace(/[\s_]/g, '');
                    const field = leadFields.find(f => {
                        const target = f.name.toLowerCase().replace(/[\s_]/g, '');
                        const labelTarget = f.label.toLowerCase().replace(/[\s_]/g, '');
                        return normalized.includes(target) || target.includes(normalized) || normalized.includes(labelTarget) || labelTarget.includes(normalized);
                    });
                    if (field) initialMapping[field.name] = header;
                });
                setMapping(initialMapping);
                setCurrentStep(STEPS.MAPPING);
            } catch (err) {
                console.error(err);
                toast.error("Failed to parse file.");
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleMappingChange = (fieldKey, headerValue) => {
        setMapping(prev => ({ ...prev, [fieldKey]: headerValue }));
    };

    const distributeLeadsEvenly = () => {
        if (users.length === 0) return;
        const countPerUser = Math.floor(fileData.length / users.length);
        const remainder = fileData.length % users.length;

        const newAssignments = {};
        users.forEach((user, index) => {
            newAssignments[user.id] = countPerUser + (index < remainder ? 1 : 0);
        });
        setAssignments(newAssignments);
    };

    const handleAssignmentChange = (userId, value) => {
        const numValue = Math.max(0, parseInt(value) || 0);
        setAssignments(prev => ({ ...prev, [userId]: numValue }));
    };

    const totalAssigned = Object.values(assignments).reduce((a, b) => a + b, 0);

    const startUpload = async () => {
        if (totalAssigned !== fileData.length) {
            toast.error(`Please assign all ${fileData.length} leads. Currently assigned: ${totalAssigned}`);
            return;
        }

        setIsUploading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();

            // Prepare data chunks for each user
            let offset = 0;
            const allLeads = [];

            for (const user of users) {
                const count = assignments[user.id] || 0;
                if (count === 0) continue;

                const userLeads = fileData.slice(offset, offset + count).map(row => {
                    const lead = { assignee_id: user.id, source: 'Import' };
                    leadFields.forEach(field => {
                        const mappedHeader = mapping[field.name];
                        if (mappedHeader) lead[field.name] = row[mappedHeader];
                    });
                    return lead;
                });
                allLeads.push(...userLeads);
                offset += count;
            }

            const response = await axios.post(`${API_URL}/leads/bulk-import`,
                { leads: allLeads },
                { headers: { Authorization: `Bearer ${session.access_token}` } }
            );

            toast.success(`Successfully imported ${response.data.inserted} leads!`);
            setCurrentStep(STEPS.SUCCESS);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to upload leads.");
        } finally {
            setIsUploading(false);
        }
    };

    const renderStepIcon = (step, index) => {
        const isActive = currentStep === step;
        const isDone = Object.values(STEPS).indexOf(currentStep) > index;

        return (
            <div className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${isDone ? 'bg-[#08A698] border-[#08A698] text-white' :
                    isActive ? 'border-[#08A698] text-[#08A698] font-bold shadow-[0_0_10px_rgba(8,166,152,0.3)]' :
                        'border-gray-300 text-gray-400'
                    }`}>
                    {isDone ? <CheckIcon className="w-5 h-5" /> : index + 1}
                </div>
                {index < 3 && <div className={`w-12 h-0.5 mx-2 ${isDone ? 'bg-[#08A698]' : 'bg-gray-200'}`} />}
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans antialiased">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto px-4 py-8 lg:px-8 bg-gray-50/30">
                    <WorkspaceGuard>
                        <div className="mx-auto max-w-6xl">

                            {/* Progress Stepper */}
                            <div className="flex justify-center mb-10">
                                <div className="flex items-center bg-white px-8 py-4 rounded-2xl shadow-sm border border-gray-100">
                                    {renderStepIcon(STEPS.UPLOAD, 0)}
                                    {renderStepIcon(STEPS.MAPPING, 1)}
                                    {renderStepIcon(STEPS.ASSIGNMENT, 2)}
                                    {renderStepIcon(STEPS.SUCCESS, 3)}
                                </div>
                            </div>

                            {/* Step 1: Upload */}
                            {currentStep === STEPS.UPLOAD && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="text-center mb-8">
                                        <h1 className="text-3xl font-bold text-gray-900">Upload Leads</h1>
                                        <p className="text-gray-500 mt-2">Bring your leads from CSV or Excel files in seconds</p>
                                    </div>

                                    <div
                                        onClick={() => !isUploading && fileInputRef.current?.click()}
                                        className="bg-white rounded-3xl border-2 border-dashed border-gray-200 hover:border-[#08A698] cursor-pointer p-20 text-center relative overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:shadow-teal-100/50"
                                    >
                                        <input type="file" hidden ref={fileInputRef} accept=".csv,.xlsx,.xls" onChange={handleFileSelect} />
                                        <div className="relative z-10">
                                            <div className="w-20 h-20 bg-teal-50 rounded-2xl flex items-center justify-center mb-8 mx-auto rotate-3 group-hover:rotate-0 transition-transform duration-500 shadow-sm border border-teal-100">
                                                <CloudArrowUpIcon className="w-10 h-10 text-[#08A698]" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Drop your leads file here</h3>
                                            <p className="text-gray-500 text-sm mb-10 max-w-sm mx-auto leading-relaxed">
                                                Supports .csv and .xlsx files. <br />
                                                Maximum 100,000 leads per upload for best performance.
                                            </p>
                                            <button className="px-10 py-4 bg-[#08A698] text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-100 transform active:scale-95">
                                                Choose File
                                            </button>
                                        </div>
                                        <div className="absolute top-0 right-0 p-8 text-gray-100 -rotate-12 translate-x-1/4 -translate-y-1/4 hidden lg:block">
                                            <TableCellsIcon className="w-64 h-64" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Mapping */}
                            {currentStep === STEPS.MAPPING && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h1 className="text-3xl font-bold text-gray-900">Map your fields</h1>
                                            <p className="text-gray-500 mt-1">Connect your spreadsheet columns to CRM lead fields</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button onClick={() => setCurrentStep(STEPS.UPLOAD)} className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all">
                                                Back
                                            </button>
                                            <button
                                                onClick={() => setCurrentStep(STEPS.ASSIGNMENT)}
                                                className="px-8 py-2.5 bg-[#08A698] text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-100 transition-all flex items-center gap-2"
                                                disabled={!mapping.name || !mapping.phone}
                                            >
                                                Next Step
                                                <ChevronRightIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden p-8">
                                        <div className="flex items-center gap-4 mb-8 bg-teal-50/50 p-4 rounded-2xl border border-teal-100/50">
                                            <ArrowsRightLeftIcon className="w-6 h-6 text-[#08A698]" />
                                            <p className="text-sm text-gray-700 font-medium">We've auto-matched some fields. Please review and connect any missing ones.</p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            {leadFields.map((field) => (
                                                <div key={field.id} className="flex items-center gap-6 p-4 rounded-2xl border border-gray-100 hover:bg-gray-50/50 transition-colors group">
                                                    <div className="w-1/3 flex items-center justify-between pr-4 border-r border-gray-100">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mapping[field.name] ? 'bg-[#08A698] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                                <span className="text-xs font-bold uppercase">{field.name.substring(0, 2)}</span>
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-gray-900 flex items-center gap-1">
                                                                    {field.label}
                                                                    {field.is_default && <span className="text-red-500 text-lg line-clamp-1">*</span>}
                                                                </div>
                                                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">CRM FIELD</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 flex items-center gap-4">
                                                        <div className="w-full relative">
                                                            <select
                                                                value={mapping[field.name] || ''}
                                                                onChange={(e) => handleMappingChange(field.name, e.target.value)}
                                                                className={`w-full bg-white border ${mapping[field.name] ? 'border-[#08A698]' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#08A698]/20 outline-none transition-all appearance-none cursor-pointer`}
                                                            >
                                                                <option value="">-- Choose Column --</option>
                                                                {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                                            </select>
                                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                                <ChevronRightIcon className={`w-4 h-4 transition-transform ${mapping[field.name] ? 'text-[#08A698]' : 'text-gray-400'}`} strokeWidth={3} />
                                                            </div>
                                                        </div>
                                                        {mapping[field.name] && (
                                                            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                                                                <CheckIcon className="w-3 h-3" strokeWidth={4} />
                                                                Mapped
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === STEPS.ASSIGNMENT && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h1 className="text-3xl font-bold text-gray-900">Lead Assignment</h1>
                                            <p className="text-gray-500 mt-1">Distribute {fileData.length} leads among your team members</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button onClick={() => setCurrentStep(STEPS.MAPPING)} className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all">
                                                Prev
                                            </button>
                                            <button
                                                onClick={startUpload}
                                                disabled={isUploading || totalAssigned !== fileData.length}
                                                className="px-10 py-2.5 bg-[#08A698] text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-100 disabled:opacity-50 transition-all flex items-center gap-2"
                                            >
                                                {isUploading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : 'Finish Import'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                                        <div className="bg-gray-50/80 p-6 flex items-center justify-between border-b border-gray-100">
                                            <div className="flex items-center gap-6">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Leads</span>
                                                    <span className="text-2xl font-black text-gray-900">{fileData.length}</span>
                                                </div>
                                                <div className="w-px h-10 bg-gray-200" />
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Assigned</span>
                                                    <span className={`text-2xl font-black ${totalAssigned === fileData.length ? 'text-[#08A698]' : 'text-orange-500'}`}>{totalAssigned}</span>
                                                </div>
                                                <div className="w-px h-10 bg-gray-200" />
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Remaining</span>
                                                    <span className="text-2xl font-black text-gray-400">{fileData.length - totalAssigned}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={distributeLeadsEvenly}
                                                className="px-4 py-2 bg-white border border-[#08A698] text-[#08A698] text-xs font-bold rounded-lg hover:bg-[#08A698] hover:text-white transition-all shadow-sm"
                                            >
                                                Distribute Evenly
                                            </button>
                                        </div>

                                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[500px] overflow-y-auto custom-scrollbar">
                                            {Array.isArray(users) && users.map((user) => (
                                                <div key={user.id} className={`p-5 rounded-2xl border ${assignments[user.id] > 0 ? 'border-[#08A698] bg-teal-50/10' : 'border-gray-100'} transition-all hover:border-[#08A698]/50`}>
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-[#08A698] font-bold border-2 border-white shadow-sm">
                                                            {user.name.substring(0, 1).toUpperCase()}
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <div className="text-sm font-bold text-gray-900 truncate">{user.name}</div>
                                                            <div className="text-[10px] text-gray-400 font-semibold uppercase truncate">{user.role}</div>
                                                        </div>
                                                    </div>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            value={assignments[user.id] || 0}
                                                            onChange={(e) => handleAssignmentChange(user.id, e.target.value)}
                                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#08A698]/20 outline-none transition-all pr-20"
                                                        />
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase">Leads</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === STEPS.SUCCESS && (
                                <div className="animate-in zoom-in-95 fade-in duration-700">
                                    <div className="bg-white rounded-3xl p-16 text-center shadow-2xl border border-gray-100 max-w-2xl mx-auto">
                                        <div className="w-32 h-32 bg-teal-50 rounded-full flex items-center justify-center mb-8 mx-auto ring-8 ring-teal-50 select-none">
                                            <CheckCircleIcon className="w-20 h-20 text-[#08A698] animate-in zoom-in-50 duration-500 delay-300" />
                                        </div>
                                        <h1 className="text-3xl font-black text-gray-900 mb-4">Import Completed!</h1>
                                        <p className="text-gray-500 mb-10 leading-relaxed">
                                            All {fileData.length} leads has been successfully mapped and assigned to your team.
                                        </p>
                                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                            <button
                                                onClick={() => window.location.href = '/all-leads'}
                                                className="px-10 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all transform active:scale-95"
                                            >
                                                View in Leads
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setCurrentStep(STEPS.UPLOAD);
                                                    setFileData([]);
                                                    setMapping({});
                                                    setAssignments({});
                                                }}
                                                className="px-10 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all transform active:scale-95"
                                            >
                                                Import More
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </WorkspaceGuard>
                </main>
            </div>
        </div>
    );
}
