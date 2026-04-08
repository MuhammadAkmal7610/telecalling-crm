import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import LeadDetailModal from '../components/LeadDetailModal';
import LeadFormModal from '../components/LeadFormModal';
import PipelineColumn from '../components/PipelineColumn';
import PipelineAnalytics from '../components/PipelineAnalytics';
import WorkspaceGuard from '../components/WorkspaceGuard';
import { useApi } from '../hooks/useApi';
import { useWorkspace } from '../context/WorkspaceContext';
import { useSocket } from '../contexts/SocketContext';
import { useEffect, useState } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    EllipsisHorizontalIcon,
    Bars3CenterLeftIcon,
    FunnelIcon,
    UserCircleIcon,
    PhoneIcon,
    CalendarIcon,
    ArrowPathIcon,
    ChartBarIcon,
    AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';


export default function Pipeline() {
    const { apiFetch } = useApi();
    const { currentWorkspace } = useWorkspace();
    const { isConnected, socketService } = useSocket();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [columns, setColumns] = useState({});
    const [stages, setStages] = useState([]);
    const [pipelines, setPipelines] = useState([]);
    const [selectedPipelineId, setSelectedPipelineId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [totalLeads, setTotalLeads] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [activeLead, setActiveLead] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const fetchPipelineData = async () => {
        setLoading(true);
        try {
            const [stagesRes, leadsRes, pipelinesRes] = await Promise.all([
                apiFetch('/lead-stages'),
                apiFetch('/leads?limit=1000'),
                apiFetch('/pipeline')
            ]);

            const stagesData = await stagesRes.json();
            const leadsData = await leadsRes.json();
            const pipelinesData = await pipelinesRes.json();

            const allStages = Array.isArray(stagesData.data) ? stagesData.data : (Array.isArray(stagesData) ? stagesData : []);
            const allLeads = Array.isArray(leadsData.data?.data) ? leadsData.data.data : (Array.isArray(leadsData.data) ? leadsData.data : []);
            const allPipelines = Array.isArray(pipelinesData.data) ? pipelinesData.data : (Array.isArray(pipelinesData) ? pipelinesData : []);

            setPipelines(allPipelines);
            
            // Determine active pipeline
            let activePipelineId = selectedPipelineId;
            if (allPipelines.length > 0 && !activePipelineId) {
                const defaultPipe = allPipelines.find(p => p.is_default) || allPipelines[0];
                activePipelineId = defaultPipe.id;
                setSelectedPipelineId(activePipelineId);
            }

            // Filter stages and leads by active pipeline
            const stages = allStages.filter(s => s.pipeline_id === activePipelineId || !s.pipeline_id);
            const leads = allLeads.filter(l => l.pipeline_id === activePipelineId || (!l.pipeline_id && activePipelineId === allPipelines.find(p => p.is_default)?.id));

            setStages(stages);
            setTotalLeads(leads.length);

            const cols = {};
            stages.forEach(stage => {
                const filteredLeads = searchTerm 
                    ? leads.filter(l => 
                        l.stageId === stage.id && 
                        (l.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         l.phone?.includes(searchTerm)))
                    : leads.filter(l => l.stageId === stage.id);
                    
                cols[stage.id] = {
                    ...stage,
                    items: filteredLeads.map(l => ({
                        id: l.id,
                        name: l.name,
                        phone: l.phone || 'N/A',
                        assigneeInitials: l.assignee?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'UN',
                        assigneeName: l.assignee?.name || 'Unassigned',
                        time: getTimeAgo(l.updatedAt),
                        original: l
                    }))
                };
            });

            setColumns(cols);
        } catch (error) {
            console.error('Error fetching pipeline data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPipelineData();
    }, [currentWorkspace, searchTerm, selectedPipelineId]);

    // Listen for real-time updates
    useEffect(() => {
        if (!isConnected) return;

        const handleLeadUpdate = (event) => {
            const { lead, action } = event.detail;
            if (action === 'stage_changed' || action === 'updated') {
                // fetchPipelineData(); // Disabled auto-refresh as requested
                console.log('Real-time update received:', action, lead.id);
            }
        };

        window.addEventListener('lead_update', handleLeadUpdate);
        return () => window.removeEventListener('lead_update', handleLeadUpdate);
    }, [isConnected]);

    const getStageColor = (name) => {
        const lower = name.toLowerCase();
        if (lower.includes('fresh')) return 'border-blue-500';
        if (lower.includes('attempt')) return 'border-yellow-500';
        if (lower.includes('connected')) return 'border-slate-400';
        if (lower.includes('interested')) return 'border-teal-500';
        if (lower.includes('won')) return 'border-green-500';
        if (lower.includes('lost')) return 'border-red-500';
        return 'border-gray-300';
    };

    const getStageBadgeColor = (name) => {
        const lower = name.toLowerCase();
        if (lower.includes('fresh')) return 'bg-blue-50 text-blue-700';
        if (lower.includes('attempt')) return 'bg-yellow-50 text-yellow-700';
        if (lower.includes('connected')) return 'bg-slate-50 text-slate-700';
        if (lower.includes('interested')) return 'bg-teal-50 text-teal-700';
        if (lower.includes('won')) return 'bg-green-50 text-green-700';
        if (lower.includes('lost')) return 'bg-red-50 text-red-700';
        return 'bg-gray-50 text-gray-700';
    };

    const getTimeAgo = (date) => {
        if (!date) return 'N/A';
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m";
        return Math.floor(seconds) + "s";
    };

    const handleLeadClick = (lead) => {
        setSelectedLead({
            ...lead.original,
            assignee: lead.assigneeName,
            time: lead.time + " ago"
        });
        setIsDetailModalOpen(true);
    };

    const handleDragStart = (event) => {
        const { active } = event;
        const lead = Object.values(columns).flatMap(col => col.items).find(l => l.id === active.id);
        setActiveLead(lead);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        
        if (!over || !active) {
            setActiveLead(null);
            return;
        }

        const leadId = active.id;
        const newStageId = over.id;
        
        // Find which column the lead came from
        let oldStageId = null;
        for (const [stageId, column] of Object.entries(columns)) {
            if (column.items.some(lead => lead.id === leadId)) {
                oldStageId = stageId;
                break;
            }
        }

        // If stage hasn't changed, do nothing
        if (oldStageId === newStageId) {
            setActiveLead(null);
            return;
        }

        try {
            const response = await apiFetch(`/leads/${leadId}/stage`, {
                method: 'PATCH',
                body: JSON.stringify({ stage_id: newStageId })
            });

            if (response.ok) {
                // Update local state immediately for responsiveness
                setColumns(prev => {
                    const newColumns = { ...prev };
                    
                    // Remove lead from old stage
                    if (newColumns[oldStageId]) {
                        newColumns[oldStageId] = {
                            ...newColumns[oldStageId],
                            items: newColumns[oldStageId].items.filter(l => l.id !== leadId)
                        };
                    }
                    
                    // Add lead to new stage
                    if (newColumns[newStageId]) {
                        const lead = newColumns[oldStageId]?.items.find(l => l.id === leadId);
                        if (lead) {
                            newColumns[newStageId] = {
                                ...newColumns[newStageId],
                                items: [...newColumns[newStageId].items, lead]
                            };
                        }
                    }
                    
                    return newColumns;
                });

                // Send real-time update
                if (socketService) {
                    socketService.sendLeadUpdate(currentWorkspace?.organizationId, {
                        id: leadId,
                        action: 'stage_changed',
                        old_stage_id: oldStageId,
                        new_stage_id: newStageId
                    });
                }
            } else {
                console.error('Failed to update lead stage');
                fetchPipelineData(); // Refresh data on error
            }
        } catch (error) {
            console.error('Error updating lead stage:', error);
            fetchPipelineData(); // Refresh data on error
        }
        
        setActiveLead(null);
    };

    const handleAddLead = (stageId) => {
        setIsAddModalOpen(true);
        // Pass stageId to modal if needed
    };

    const handleStageEdit = (stage) => {
        // Open stage edit modal
        console.log('Edit stage:', stage);
    };

    const handleStageDelete = (stage) => {
        // Open stage delete confirmation
        console.log('Delete stage:', stage);
    };

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <LeadDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                lead={selectedLead}
            />
            <LeadFormModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchPipelineData}
            />
            <PipelineAnalytics
                isOpen={showAnalytics}
                onClose={() => setShowAnalytics(false)}
            />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-x-auto overflow-y-hidden p-6 relative">
                    <WorkspaceGuard>
                        {/* Toolbar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sticky left-0">
                            <div className="flex items-center gap-3">
                                <div className="relative inline-block text-left">
                                    <select
                                        value={selectedPipelineId || ''}
                                        onChange={(e) => setSelectedPipelineId(e.target.value)}
                                        className="appearance-none bg-transparent hover:bg-gray-100 py-1 pl-2 pr-8 rounded-lg text-2xl font-bold text-gray-900 focus:outline-none cursor-pointer transition-colors"
                                    >
                                        {pipelines.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                        {pipelines.length === 0 && <option value="" disabled>Loading...</option>}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-gray-500">
                                        <svg className="w-5 h-5 text-gray-900 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                                <span className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-xs font-bold text-gray-500 shadow-sm">
                                    {totalLeads} Leads
                                </span>
                                {isConnected && (
                                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Live</span>
                                )}
                                <button onClick={fetchPipelineData} className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-white transition-all shadow-sm">
                                    <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="relative group">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#08A698] transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search leads..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#08A698] focus:ring-1 focus:ring-[#08A698] w-64 transition-all shadow-sm"
                                    />
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:border-[#08A698] hover:text-[#08A698] transition-colors shadow-sm">
                                    <FunnelIcon className="w-4 h-4" /> Filter
                                </button>
                                <button 
                                    onClick={() => setShowAnalytics(!showAnalytics)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:border-[#08A698] hover:text-[#08A698] transition-colors shadow-sm"
                                >
                                    <ChartBarIcon className="w-4 h-4" /> Analytics
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:border-[#08A698] hover:text-[#08A698] transition-colors shadow-sm">
                                    <AdjustmentsHorizontalIcon className="w-4 h-4" /> Settings
                                </button>
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#08A698] hover:bg-[#078F82] text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all"
                                >
                                    <PlusIcon className="w-5 h-5" /> Add Lead
                                </button>
                            </div>
                        </div>

                        {/* Board with Drag & Drop */}
                        <DndContext 
                            sensors={sensors}
                            collisionDetection={closestCorners}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="flex gap-4 h-[calc(100%-80px)] min-w-max pb-4 items-start">
                                {loading ? (
                                    <div className="flex gap-4">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="w-72 h-[600px] bg-gray-50/50 rounded-xl border border-gray-200 border-dashed animate-pulse"></div>
                                        ))}
                                    </div>
                                ) : Object.keys(columns).length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border border-dashed border-gray-300 py-20 min-w-[800px]">
                                        <Bars3CenterLeftIcon className="w-12 h-12 text-gray-200 mb-4" />
                                        <p className="text-gray-400 font-medium italic">No pipeline stages found</p>
                                        <p className="text-xs text-gray-300 mt-1">Configure stages in settings to see them here.</p>
                                    </div>
                                ) : (
                                    Object.values(columns).map((column) => (
                                        <PipelineColumn
                                            key={column.id}
                                            stage={column}
                                            leads={column.items}
                                            onLeadClick={handleLeadClick}
                                            onAddLead={handleAddLead}
                                            onStageEdit={handleStageEdit}
                                            onStageDelete={handleStageDelete}
                                        />
                                    ))
                                )}

                                {!loading && Object.keys(columns).length > 0 && (
                                    <button className="w-72 flex-shrink-0 h-14 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-400 font-bold text-sm hover:bg-white hover:border-primary hover:text-primary transition-all focus:outline-none shadow-sm group">
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-teal-50 transition-colors">
                                            <PlusIcon className="w-5 h-5" />
                                        </div>
                                        Add Stage
                                    </button>
                                )}
                            </div>
                            
                            <DragOverlay>
                                {activeLead ? (
                                    <div className="bg-white p-3.5 rounded-xl border shadow-lg cursor-grabbing opacity-90 w-72">
                                        <div className="flex justify-between items-start mb-2.5">
                                            <h3 className="font-bold text-sm text-gray-800 line-clamp-1">{activeLead.name}</h3>
                                            <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 text-[#08A698] text-[10px] font-bold flex items-center justify-center shadow-sm shrink-0">
                                                {activeLead.assigneeInitials}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-1.5 rounded-lg">
                                            <PhoneIcon className="w-3.5 h-3.5 text-gray-400" />
                                            <span>{activeLead.phone}</span>
                                        </div>
                                    </div>
                                ) : null}
                            </DragOverlay>
                        </DndContext>
                    </WorkspaceGuard>
                </main>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}</style>
        </div>
    );
}
