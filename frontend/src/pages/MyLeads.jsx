import React, { useState, useEffect } from 'react';
import FilterPageTemplate from '../components/FilterPageTemplate';
import LeadDetailModal from '../components/LeadDetailModal';
import WorkspaceGuard from '../components/WorkspaceGuard';
import { supabase } from '../lib/supabaseClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export default function MyLeads() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchMyLeads();
    }, []);

    const fetchMyLeads = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const userId = session.user.id;
            const res = await fetch(`${API_URL}/leads?creatorId=${userId}`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            const result = await res.json();
            const data = result.data?.data || result.data || [];

            const mappedData = data.map(lead => ({
                id: lead.id,
                name: lead.name,
                phone: lead.phone,
                status: lead.status,
                rating: lead.rating || 0,
                assigneeInitials: lead.assignee?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??',
                assigneeName: lead.assignee?.name || 'Unassigned',
                createdOn: new Date(lead.created_at).toLocaleDateString(),
                modifiedOn: new Date(lead.updated_at).toLocaleDateString(),
                source: lead.source,
                originalData: lead
            }));

            setLeads(mappedData);
        } catch (error) {
            console.error('Error fetching my leads:', error);
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
                title="My Leads"
                data={leads}
                showEmptyState={!loading && leads.length === 0}
                onRowClick={handleRowClick}
                fetchLeads={fetchMyLeads}
            />
            <LeadDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                lead={selectedLead}
            />
        </WorkspaceGuard>
    );
}
