import React, { useState, useEffect } from 'react';
import FilterPageTemplate from '../components/FilterPageTemplate';
import LeadDetailModal from '../components/LeadDetailModal';
import WorkspaceGuard from '../components/WorkspaceGuard';
import { useApi } from '../hooks/useApi';

export default function DailyReport() {
    const { apiFetch } = useApi();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchDailyLeads();
    }, []);

    const fetchDailyLeads = async () => {
        setLoading(true);
        try {
            // Fetch leads for today
            const today = new Date().toISOString().split('T')[0];
            const res = await apiFetch(`/leads?limit=500`);
            const result = await res.json();
            const data = result.data?.data || result.data || [];

            // Filter for today's leads in JS for simplicity or add to API later
            const filtered = data.filter(l => l.created_at.startsWith(today));

            const mappedData = filtered.map(lead => ({
                id: lead.id,
                name: lead.name,
                phone: lead.phone,
                status: lead.status,
                rating: lead.rating || 0,
                assigneeInitials: lead.assignee?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??',
                assigneeName: lead.assignee?.name || 'Unassigned',
                createdOn: new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                modifiedOn: new Date(lead.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                source: lead.source,
                originalData: lead
            }));

            setLeads(mappedData);
        } catch (error) {
            console.error('Error fetching daily leads:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRowClick = (lead) => {
        setSelectedLead({
            ...lead.originalData,
            assignee: lead.assigneeName,
            time: lead.modifiedOn
        });
        setIsModalOpen(true);
    };

    return (
        <WorkspaceGuard>
            <FilterPageTemplate
                title="Daily Report"
                data={leads}
                showEmptyState={!loading && leads.length === 0}
                onRowClick={handleRowClick}
            />
            <LeadDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                lead={selectedLead}
            />
        </WorkspaceGuard>
    );
}
