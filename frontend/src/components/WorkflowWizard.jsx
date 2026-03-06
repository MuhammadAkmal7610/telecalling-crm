import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';
import { useApi } from '../hooks/useApi';
import { useWorkspace } from '../context/WorkspaceContext';

const WorkflowWizard = ({ isOpen, onClose, onSuccess, workflow = null }) => {
    const { currentWorkspace } = useWorkspace();
    const { apiFetch } = useApi();
    
    const [currentStep, setCurrentStep] = useState(1);
    const [isTestMode, setIsTestMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Workflow data
    const [workflowData, setWorkflowData] = useState({
        name: workflow?.name || '',
        description: workflow?.description || '',
        is_active: workflow?.is_active !== false,
        is_test_mode: false,
        trigger: {
            type: workflow?.trigger?.type || 'lead_created',
            config: workflow?.trigger?.config || {}
        },
        conditions: workflow?.conditions || [],
        actions: workflow?.actions || []
    });

    const steps = [
        { id: 1, title: 'Basic Info', description: 'Name and description' },
        { id: 2, title: 'Trigger', description: 'When to execute this workflow' },
        { id: 3, title: 'Conditions', description: 'Optional conditions to filter execution' },
        { id: 4, title: 'Actions', description: 'What to do when triggered' },
        { id: 5, title: 'Test & Save', description: 'Test and save your workflow' }
    ];

    const triggerTypes = [
        { value: 'lead_created', label: 'Lead Created', description: 'When a new lead is created' },
        { value: 'status_changed', label: 'Status Changed', description: 'When lead status changes' },
        { value: 'field_updated', label: 'Field Updated', description: 'When a specific field is updated' },
        { value: 'time_based', label: 'Time Based', description: 'At specific times or intervals' },
        { value: 'webhook_received', label: 'Webhook Received', description: 'When external webhook is called' }
    ];

    const actionTypes = [
        { value: 'assign_to', label: 'Assign to User', icon: '👤' },
        { value: 'update_field', label: 'Update Field', icon: '✏️' },
        { value: 'send_email', label: 'Send Email', icon: '📧' },
        { value: 'send_sms', label: 'Send SMS', icon: '💬' },
        { value: 'create_task', label: 'Create Task', icon: '📋' },
        { value: 'webhook_call', label: 'Call Webhook', icon: '🔗' },
        { value: 'add_tag', label: 'Add Tag', icon: '🏷️' },
        { value: 'remove_tag', label: 'Remove Tag', icon: '🚫' }
    ];

    const operators = [
        { value: 'equals', label: 'Equals' },
        { value: 'not_equals', label: 'Not Equals' },
        { value: 'contains', label: 'Contains' },
        { value: 'not_contains', label: 'Not Contains' },
        { value: 'greater_than', label: 'Greater Than' },
        { value: 'less_than', label: 'Less Than' },
        { value: 'in', label: 'In List' },
        { value: 'not_in', label: 'Not In List' }
    ];

    const handleNext = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const url = workflow ? `/workflows/${workflow.id}` : '/workflows';
            const method = workflow ? 'PATCH' : 'POST';
            
            const response = await apiFetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(workflowData)
            });

            if (response.ok) {
                onSuccess();
                onClose();
            } else {
                throw new Error('Failed to save workflow');
            }
        } catch (error) {
            console.error('Error saving workflow:', error);
            alert('Error saving workflow: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleTest = async () => {
        setIsTestMode(true);
        try {
            const response = await apiFetch('/workflows/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(workflowData)
            });

            if (response.ok) {
                const result = await response.json();
                alert('Test successful! ' + JSON.stringify(result, null, 2));
            } else {
                throw new Error('Test failed');
            }
        } catch (error) {
            console.error('Error testing workflow:', error);
            alert('Test failed: ' + error.message);
        } finally {
            setIsTestMode(false);
        }
    };

    const addCondition = () => {
        setWorkflowData(prev => ({
            ...prev,
            conditions: [...prev.conditions, {
                field: '',
                operator: 'equals',
                value: '',
                logical_operator: 'AND'
            }]
        }));
    };

    const removeCondition = (index) => {
        setWorkflowData(prev => ({
            ...prev,
            conditions: prev.conditions.filter((_, i) => i !== index)
        }));
    };

    const updateCondition = (index, field, value) => {
        setWorkflowData(prev => ({
            ...prev,
            conditions: prev.conditions.map((cond, i) => 
                i === index ? { ...cond, [field]: value } : cond
            )
        }));
    };

    const addAction = () => {
        setWorkflowData(prev => ({
            ...prev,
            actions: [...prev.actions, {
                type: 'assign_to',
                config: {},
                delay_minutes: 0
            }]
        }));
    };

    const removeAction = (index) => {
        setWorkflowData(prev => ({
            ...prev,
            actions: prev.actions.filter((_, i) => i !== index)
        }));
    };

    const updateAction = (index, field, value) => {
        setWorkflowData(prev => ({
            ...prev,
            actions: prev.actions.map((action, i) => 
                i === index ? { ...action, [field]: value } : action
            )
        }));
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Workflow Name</label>
                            <input
                                type="text"
                                value={workflowData.name}
                                onChange={(e) => setWorkflowData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder="Enter workflow name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                value={workflowData.description}
                                onChange={(e) => setWorkflowData(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                rows={3}
                                placeholder="Describe what this workflow does"
                            />
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={workflowData.is_active}
                                onChange={(e) => setWorkflowData(prev => ({ ...prev, is_active: e.target.checked }))}
                                className="mr-2"
                            />
                            <label className="text-sm text-gray-700">Active</label>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Trigger Type</label>
                            <select
                                value={workflowData.trigger.type}
                                onChange={(e) => setWorkflowData(prev => ({
                                    ...prev,
                                    trigger: { ...prev.trigger, type: e.target.value }
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                                {triggerTypes.map(trigger => (
                                    <option key={trigger.value} value={trigger.value}>
                                        {trigger.label}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                {triggerTypes.find(t => t.value === workflowData.trigger.type)?.description}
                            </p>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Conditions</h3>
                            <button
                                onClick={addCondition}
                                className="bg-teal-600 text-white px-3 py-1 rounded-md text-sm hover:bg-teal-700"
                            >
                                Add Condition
                            </button>
                        </div>
                        
                        {workflowData.conditions.map((condition, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                                <div className="grid grid-cols-4 gap-3">
                                    <select
                                        value={condition.field}
                                        onChange={(e) => updateCondition(index, 'field', e.target.value)}
                                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                                    >
                                        <option value="">Select Field</option>
                                        <option value="status">Status</option>
                                        <option value="source">Source</option>
                                        <option value="assignee_id">Assignee</option>
                                        <option value="score">Score</option>
                                    </select>
                                    
                                    <select
                                        value={condition.operator}
                                        onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                                    >
                                        {operators.map(op => (
                                            <option key={op.value} value={op.value}>
                                                {op.label}
                                            </option>
                                        ))}
                                    </select>
                                    
                                    <input
                                        type="text"
                                        value={condition.value}
                                        onChange={(e) => updateCondition(index, 'value', e.target.value)}
                                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                                        placeholder="Value"
                                    />
                                    
                                    <button
                                        onClick={() => removeCondition(index)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                        {workflowData.conditions.length === 0 && (
                            <p className="text-gray-500 text-center py-4">
                                No conditions - workflow will execute for all triggers
                            </p>
                        )}
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Actions</h3>
                            <button
                                onClick={addAction}
                                className="bg-teal-600 text-white px-3 py-1 rounded-md text-sm hover:bg-teal-700"
                            >
                                Add Action
                            </button>
                        </div>
                        
                        {workflowData.actions.map((action, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between mb-3">
                                    <select
                                        value={action.type}
                                        onChange={(e) => updateAction(index, 'type', e.target.value)}
                                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                                    >
                                        {actionTypes.map(act => (
                                            <option key={act.value} value={act.value}>
                                                {act.icon} {act.label}
                                            </option>
                                        ))}
                                    </select>
                                    
                                    <button
                                        onClick={() => removeAction(index)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Delay (minutes)</label>
                                        <input
                                            type="number"
                                            value={action.delay_minutes || 0}
                                            onChange={(e) => updateAction(index, 'delay_minutes', parseInt(e.target.value))}
                                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                            min="0"
                                        />
                                    </div>
                                </div>
                                
                                {/* Action-specific configuration */}
                                {action.type === 'assign_to' && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Assignment Type</label>
                                            <select
                                                value={action.config?.assignee_type || 'fixed'}
                                                onChange={(e) => updateAction(index, 'config', {
                                                    ...action.config,
                                                    assignee_type: e.target.value
                                                })}
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                            >
                                                <option value="fixed">Fixed User</option>
                                                <option value="round_robin">Round Robin</option>
                                                <option value="field">From Field</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Value</label>
                                            <input
                                                type="text"
                                                value={action.config?.assignee_value || ''}
                                                onChange={(e) => updateAction(index, 'config', {
                                                    ...action.config,
                                                    assignee_value: e.target.value
                                                })}
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                placeholder="User ID or list"
                                            />
                                        </div>
                                    </div>
                                )}
                                
                                {action.type === 'update_field' && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Field</label>
                                            <input
                                                type="text"
                                                value={action.config?.field || ''}
                                                onChange={(e) => updateAction(index, 'config', {
                                                    ...action.config,
                                                    field: e.target.value
                                                })}
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                placeholder="Field name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Value</label>
                                            <input
                                                type="text"
                                                value={action.config?.value || ''}
                                                onChange={(e) => updateAction(index, 'config', {
                                                    ...action.config,
                                                    value: e.target.value
                                                })}
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                placeholder="New value"
                                            />
                                        </div>
                                    </div>
                                )}
                                
                                {(action.type === 'send_email' || action.type === 'send_sms') && (
                                    <div className="space-y-2">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Recipient</label>
                                            <input
                                                type="text"
                                                value={action.config?.to || ''}
                                                onChange={(e) => updateAction(index, 'config', {
                                                    ...action.config,
                                                    to: e.target.value
                                                })}
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                placeholder="{{lead.email}}"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
                                            <input
                                                type="text"
                                                value={action.config?.subject || ''}
                                                onChange={(e) => updateAction(index, 'config', {
                                                    ...action.config,
                                                    subject: e.target.value
                                                })}
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                placeholder="Email subject"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Message</label>
                                            <textarea
                                                value={action.config?.body || ''}
                                                onChange={(e) => updateAction(index, 'config', {
                                                    ...action.config,
                                                    body: e.target.value
                                                })}
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                rows={3}
                                                placeholder="Message content with variables like {{lead.name}}"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        
                        {workflowData.actions.length === 0 && (
                            <p className="text-gray-500 text-center py-4">
                                No actions configured - add actions to execute when triggered
                            </p>
                        )}
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-4">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h3 className="text-lg font-medium text-yellow-800 mb-2">Test & Save</h3>
                            <p className="text-yellow-700 mb-4">
                                Review your workflow configuration before saving. You can test it to ensure it works as expected.
                            </p>
                            
                            <div className="flex gap-3">
                                <button
                                    onClick={handleTest}
                                    disabled={isTestMode}
                                    className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 disabled:opacity-50"
                                >
                                    {isTestMode ? (
                                        <span className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-r-2 border-t-2 border-l-2 border-yellow-600"></div>
                                            Testing...
                                        </span>
                                    ) : (
                                        <span className="flex items-center">
                                            <PlayIcon className="w-4 h-4 mr-2" />
                                            Test Workflow
                                        </span>
                                    )}
                                </button>
                                
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <span className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-r-2 border-t-2 border-l-2 border-white"></div>
                                            Saving...
                                        </span>
                                    ) : (
                                        <span className="flex items-center">
                                            <PlusIcon className="w-4 h-4 mr-2" />
                                            {workflow ? 'Update Workflow' : 'Create Workflow'}
                                        </span>
                                    )}
                                </button>
                            </div>
                            
                            <div className="mt-4 text-sm text-yellow-700">
                                <strong>Workflow Summary:</strong>
                                <ul className="mt-2 space-y-1">
                                    <li>• Trigger: {triggerTypes.find(t => t.value === workflowData.trigger.type)?.label}</li>
                                    <li>• Conditions: {workflowData.conditions.length} configured</li>
                                    <li>• Actions: {workflowData.actions.length} configured</li>
                                    <li>• Status: {workflowData.is_active ? 'Active' : 'Inactive'}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {workflow ? 'Edit Workflow' : 'Create Workflow'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center px-6 py-4 bg-gray-50 border-b border-gray-200">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                                currentStep > step.id 
                                    ? 'bg-teal-600 text-white' 
                                    : currentStep === step.id 
                                        ? 'bg-teal-600 text-white' 
                                        : 'bg-gray-300 text-gray-600'
                            }`}>
                                {step.id}
                            </div>
                            <div className={`flex-1 h-1 mx-2 ${
                                currentStep > step.id ? 'bg-teal-600' : 'bg-gray-300'
                            }`}></div>
                        </div>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {renderStepContent()}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={handlePrevious}
                        disabled={currentStep === 1}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    
                    <div className="text-sm text-gray-500">
                        Step {currentStep} of {steps.length}
                    </div>
                    
                    <button
                        onClick={handleNext}
                        disabled={currentStep === steps.length}
                        className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
                    >
                        {currentStep === steps.length ? 'Finish' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WorkflowWizard;
