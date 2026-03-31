import React, { createContext, useContext, useEffect, useState } from 'react';
import { ApiService } from '../services/ApiService';
import { useAuth } from './AuthContext';

interface Workspace {
  id: string;
  name: string;
  organization_id: string;
  [key: string]: any;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  loading: boolean;
  setCurrentWorkspace: (workspace: Workspace) => void;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkspaces = async () => {
    if (!user) {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Fetch workspaces where the user is a member
      const { data, error } = await ApiService.getMyWorkspaces();

      if (error) throw error;

      const ws: Workspace[] = data || [];

      setWorkspaces(ws);
      setLoading(false);

      // Persist selected workspace or default to first
      if (ws.length > 0) {
        const activeWs = ws.find(w => w.id === user.workspace_id) || ws[0];
        setCurrentWorkspace(activeWs);
      }
    } catch (err) {
      console.error('WorkspaceContext: failed to fetch workspaces', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [user?.id, user?.workspace_id]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        loading,
        setCurrentWorkspace,
        refreshWorkspaces: fetchWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
