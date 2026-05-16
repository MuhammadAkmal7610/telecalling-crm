import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import LeadDetailModal from '../components/LeadDetailModal';
import LeadFormModal from '../components/LeadFormModal';
import PipelineColumn from '../components/PipelineColumn';
import PipelineAnalytics from '../components/PipelineAnalytics';
import FilterPanel from '../components/FilterPanel';
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
    const [filterPanelOpen, setFilterPanelOpen] = useState(false);
    const [filters, setFilters] = useState({});

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
                const filteredLeads = leads.filter(l => {
                    if (l.stageId !== stage.id) return false;
                    if (searchTerm && !(l.name?.toLowerCase().includes(searchTerm.toLowerCase()) || l.phone?.includes(searchTerm))) return false;
                    if (filters.status?.length && !filters.status.includes(l.status)) return false;
                    // Add more filter logic here if needed
                    return true;
                });
                    
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
    }, [currentWorkspace, searchTerm, selectedPipelineId, filters]);

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
        <WorkspaceGuard>
            <div className="relative h-full flex flex-col">
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

                <div className="flex flex-1 overflow-hidden h-full">
                    <FilterPanel 
                        isOpen={filterPanelOpen}
                        onClose={() => setFilterPanelOpen(false)}
                        filters={filters}
                        onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
                        onClearFilters={() => setFilters({})}
                        counts={{}}
                    />
                    <main className="flex-1 overflow-x-auto overflow-y-hidden p-6 relative">
                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sticky left-0">
                        <div className="flex items-center gap-3">
                            <div className="relative inline-block text-left">
                                <select
                                    value={selectedPipelineId || ''}
                                    onChange={(e) => setSelectedPipelineId(e.target.value)}
                                    className="appearance-none bg-transparent hover:bg-white py-1 pl-2 pr-8 rounded-lg text-2xl font-black text-gray-900 focus:outline-none cursor-pointer transition-all border border-transparent hover:border-gray-200"
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
                            <span className="px-3 py-1 rounded-full bg-white border border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-500 shadow-sm">
                                {totalLeads} Leads
                            </span>
                            {isConnected && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Live Sync</span>
                                </div>
                            )}
                            <button onClick={fetchPipelineData} className="p-2 rounded-xl text-gray-400 hover:text-teal-600 hover:bg-white transition-all shadow-sm border border-transparent hover:border-gray-100">
                                <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative group">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search leads..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 w-64 transition-all shadow-sm"
                                />
                            </div>
                            <button 
                                onClick={() => setFilterPanelOpen(!filterPanelOpen)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:border-teal-500 hover:text-teal-600 transition-all shadow-sm"
                            >
                                <FunnelIcon className="w-4 h-4" /> Filter
                            </button>
                            <button 
                                onClick={() => setShowAnalytics(!showAnalytics)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:border-teal-500 hover:text-teal-600 transition-all shadow-sm"
                            >
                                <ChartBarIcon className="w-4 h-4" /> Analytics
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
                        <div className="flex gap-6 h-[calc(100%-80px)] min-w-max pb-4 items-start custom-scrollbar overflow-x-auto">
                            {loading ? (
                                <div className="flex gap-6">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-80 h-[600px] bg-white/50 backdrop-blur-sm rounded-3xl border border-white border-dashed animate-pulse"></div>
                                    ))}
                                </div>
                            ) : Object.keys(columns).length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-dashed border-gray-200 py-32 min-w-[800px]">
                                    <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
                                        <Bars3CenterLeftIcon className="w-10 h-10 text-gray-300" />
                                    </div>
                                    <p className="text-xl font-bold text-gray-900 tracking-tight">No pipeline stages found</p>
                                    <p className="text-sm text-gray-400 mt-2">Configure your sales stages in settings to start managing leads.</p>
                                    <button className="mt-8 px-6 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:border-teal-500 hover:text-teal-600 transition-all shadow-sm flex items-center gap-2">
                                        <PlusIcon className="w-5 h-5" /> Create First Stage
                                    </button>
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
                                <button className="w-80 flex-shrink-0 h-20 border-2 border-dashed border-gray-200 rounded-[2rem] flex items-center justify-center gap-3 text-gray-400 font-black text-sm hover:bg-white hover:border-teal-500 hover:text-teal-600 transition-all focus:outline-none shadow-sm group">
                                    <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-teal-50 transition-colors">
                                        <PlusIcon className="w-6 h-6" />
                                    </div>
                                    New Pipeline Stage
                                </button>
                            )}
                        </div>
                        
                        <DragOverlay>
                            {activeLead ? (
                                <div className="bg-white/90 backdrop-blur-xl p-5 rounded-3xl border border-teal-100 shadow-2xl cursor-grabbing scale-105 rotate-2 transition-transform w-80">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="font-black text-gray-900 line-clamp-1">{activeLead.name}</h3>
                                        <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 text-teal-600 text-xs font-black flex items-center justify-center shadow-sm shrink-0">
                                            {activeLead.assigneeInitials}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50/50 p-2 rounded-xl">
                                        <PhoneIcon className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium">{activeLead.phone}</span>
                                    </div>
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </main>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-edge { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.1); }
            `}</style>
        </WorkspaceGuard>
    );
}
