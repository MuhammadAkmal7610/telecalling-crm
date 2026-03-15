import React, { useState, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, { 
  addEdge, 
  Background, 
  Controls, 
  Panel,
  useNodesState,
  useEdgesState,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  PlayIcon, 
  PauseIcon, 
  PlusIcon, 
  TrashIcon, 
  DevicePhoneMobileIcon, 
  EnvelopeIcon, 
  ArrowsRightLeftIcon,
  TagIcon,
  GlobeAltIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Start: Lead Created' },
    position: { x: 250, y: 5 },
    style: { background: '#08A698', color: '#fff', borderRadius: '8px', border: 'none', padding: '10px' }
  },
];

const initialEdges = [];

const VisualWorkflowBuilder = ({ workflow, onSave, onClose }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    if (workflow?.canvas_data) {
      if (workflow.canvas_data.nodes && workflow.canvas_data.nodes.length > 0) {
        setNodes(workflow.canvas_data.nodes);
      }
      if (workflow.canvas_data.edges) {
        setEdges(workflow.canvas_data.edges);
      }
    }
  }, [workflow, setNodes, setEdges]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true, markerEnd: { type: MarkerType.ArrowClosed } }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const updateNodeData = (nodeId, newData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      })
    );
  };

  const addNode = (type) => {
    const id = `${nodes.length + 1}`;
    let label = '';
    let color = '#fff';
    let textColor = '#333';

    switch(type) {
        case 'send_email': label = '📧 Send Email'; color = '#E1F5FE'; break;
        case 'send_sms': label = '💬 Send SMS'; color = '#E8F5E9'; break;
        case 'assign_to': label = '👤 Assign to User'; color = '#FFF3E0'; break;
        case 'update_field': label = '✏️ Update Field'; color = '#F3E5F5'; break;
        case 'webhook_call': label = '🔗 Call Webhook'; color = '#F1F8E1'; break;
        case 'condition': label = '❓ Condition'; color = '#FFFDE7'; break;
        default: label = 'New Step';
    }

    const newNode = {
      id,
      data: { label },
      position: { x: 100, y: 100 + nodes.length * 50 },
      style: { background: color, color: textColor, borderRadius: '8px', border: '1px solid #ccc', padding: '10px', minWidth: '150px' }
    };
    setNodes((nds) => nds.concat(newNode));
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
            <h2 className="text-lg font-semibold">{workflow?.name || 'New Workflow'}</h2>
            <p className="text-xs text-gray-400">{workflow?.description || 'Design your automation flow'}</p>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={() => onSave({ nodes, edges })}
                className="px-4 py-2 text-sm text-white bg-[#08A698] rounded-md hover:bg-teal-700 transition-colors"
            >
                Save Flow
            </button>
        </div>
      </div>

      <div className="flex-1 w-full relative h-[600px]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          fitView
        >
          <Background />
          <Controls />
          <Panel position="top-left" className="bg-white p-2 rounded-lg shadow-md border flex flex-col gap-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase px-1 mb-1">Actions</h3>
            <button onClick={() => addNode('send_email')} className="flex items-center gap-2 text-xs p-2 hover:bg-teal-50 rounded transition-colors text-left">
                <EnvelopeIcon className="w-4 h-4 text-blue-500" /> Send Email
            </button>
            <button onClick={() => addNode('send_sms')} className="flex items-center gap-2 text-xs p-2 hover:bg-teal-50 rounded transition-colors text-left">
                <DevicePhoneMobileIcon className="w-4 h-4 text-green-500" /> Send SMS
            </button>
            <button onClick={() => addNode('assign_to')} className="flex items-center gap-2 text-xs p-2 hover:bg-teal-50 rounded transition-colors text-left">
                <ArrowsRightLeftIcon className="w-4 h-4 text-orange-500" /> Assign to User
            </button>
            <button onClick={() => addNode('webhook_call')} className="flex items-center gap-2 text-xs p-2 hover:bg-teal-50 rounded transition-colors text-left">
                <GlobeAltIcon className="w-4 h-4 text-purple-500" /> Call Webhook
            </button>
            <div className="h-px bg-gray-200 my-1"></div>
            <button onClick={() => addNode('condition')} className="flex items-center gap-2 text-xs p-2 hover:bg-teal-50 rounded transition-colors text-left">
                <PlusIcon className="w-4 h-4 text-gray-500" /> Add Condition
            </button>
          </Panel>
        </ReactFlow>

        {/* Properties Panel */}
        {selectedNode && (
            <div className="absolute right-4 top-4 bottom-4 w-80 bg-white shadow-2xl border border-gray-200 rounded-xl overflow-hidden flex flex-col z-10">
                <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Cog6ToothIcon className="w-5 h-5 text-gray-500" /> Properties
                    </h3>
                    <button onClick={() => setSelectedNode(null)} className="p-1 hover:bg-gray-200 rounded-full">
                        <XMarkIcon className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
                <div className="p-4 flex-1 overflow-y-auto space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Node Label</label>
                        <input 
                            type="text" 
                            value={selectedNode.data.label}
                            onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded text-sm outline-none focus:ring-1 focus:ring-teal-500"
                        />
                    </div>

                    {/* Action Specific Configs */}
                    {(selectedNode.data.type === 'send_email') && (
                        <div className="space-y-3 pt-2 border-t">
                            <h4 className="text-xs font-bold text-teal-600 uppercase">Email Options</h4>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Subject</label>
                                <input 
                                    type="text" 
                                    value={selectedNode.data.config?.subject || ''}
                                    onChange={(e) => updateNodeData(selectedNode.id, { config: { ...selectedNode.data.config, subject: e.target.value } })}
                                    className="w-full p-2 border border-gray-200 rounded text-sm"
                                    placeholder="Enter subject"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Body Content</label>
                                <textarea 
                                    value={selectedNode.data.config?.body || ''}
                                    onChange={(e) => updateNodeData(selectedNode.id, { config: { ...selectedNode.data.config, body: e.target.value } })}
                                    className="w-full p-2 border border-gray-200 rounded text-sm"
                                    rows={4}
                                    placeholder="Use {{lead.name}} for variables"
                                />
                            </div>
                        </div>
                    )}

                    {(selectedNode.data.type === 'send_sms') && (
                        <div className="space-y-3 pt-2 border-t">
                            <h4 className="text-xs font-bold text-green-600 uppercase">SMS Options</h4>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Message</label>
                                <textarea 
                                    value={selectedNode.data.config?.message || ''}
                                    onChange={(e) => updateNodeData(selectedNode.id, { config: { ...selectedNode.data.config, message: e.target.value } })}
                                    className="w-full p-2 border border-gray-200 rounded text-sm"
                                    rows={3}
                                    placeholder="Message content..."
                                />
                            </div>
                        </div>
                    )}

                    {(selectedNode.data.type === 'assign_to') && (
                        <div className="space-y-3 pt-2 border-t">
                            <h4 className="text-xs font-bold text-orange-600 uppercase">Assignment</h4>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Assign to User ID</label>
                                <input 
                                    type="text" 
                                    value={selectedNode.data.config?.assignee_id || ''}
                                    onChange={(e) => updateNodeData(selectedNode.id, { config: { ...selectedNode.data.config, assignee_id: e.target.value } })}
                                    className="w-full p-2 border border-gray-200 rounded text-sm"
                                    placeholder="User UUID"
                                />
                            </div>
                        </div>
                    )}

                    {(selectedNode.data.type === 'webhook_call') && (
                        <div className="space-y-3 pt-2 border-t">
                            <h4 className="text-xs font-bold text-purple-600 uppercase">External API</h4>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">URL</label>
                                <input 
                                    type="text" 
                                    value={selectedNode.data.config?.url || ''}
                                    onChange={(e) => updateNodeData(selectedNode.id, { config: { ...selectedNode.data.config, url: e.target.value } })}
                                    className="w-full p-2 border border-gray-200 rounded text-sm"
                                    placeholder="https://api.example.com/endpoint"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Method</label>
                                <select 
                                    value={selectedNode.data.config?.method || 'POST'}
                                    onChange={(e) => updateNodeData(selectedNode.id, { config: { ...selectedNode.data.config, method: e.target.value } })}
                                    className="w-full p-2 border border-gray-200 rounded text-sm"
                                >
                                    <option value="POST">POST</option>
                                    <option value="GET">GET</option>
                                    <option value="PUT">PUT</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-4 bg-gray-50 border-t flex justify-between">
                    <button 
                        onClick={() => {
                            setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
                            setSelectedNode(null);
                        }}
                        className="text-red-500 text-xs font-bold flex items-center gap-1 hover:text-red-700"
                    >
                        <TrashIcon className="w-4 h-4" /> Delete Node
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
);
};

export default VisualWorkflowBuilder;
