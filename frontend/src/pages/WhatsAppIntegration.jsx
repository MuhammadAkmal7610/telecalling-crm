import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  MessageSquare, 
  Send, 
  Search, 
  Filter, 
  MoreVertical,
  User,
  Clock,
  Check,
  CheckCheck,
  Paperclip,
  Smile,
  PhoneCall,
  Video,
  Settings,
  Users,
  Megaphone,
  Bot,
  BarChart3
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useWorkspace } from '../context/WorkspaceContext';
import { useSocket } from '../contexts/SocketContext';
import WorkspaceGuard from '../components/WorkspaceGuard';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export default function WhatsAppIntegration() {
  const { apiFetch } = useApi();
  const { currentWorkspace } = useWorkspace();
  const { isConnected } = useSocket();
  
  const [activeTab, setActiveTab] = useState('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showAutomationModal, setShowAutomationModal] = useState(false);
  
  // Mock data - in real app, fetch from API
  const [chats, setChats] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [automations, setAutomations] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchConversations();
    // fetchCampaigns();
    // fetchAutomations();
  }, [currentWorkspace]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.lead_id || selectedChat.id);
    }
  }, [selectedChat]);

  useEffect(() => {
    const handleNewMessage = (event) => {
      const msg = event.detail;
      if (selectedChat && (msg.lead_id === selectedChat.id || msg.from === selectedChat.phone)) {
        setMessages(prev => [...prev, msg]);
      }
      fetchConversations(); // Refresh list to update last message
    };

    const handleStatusUpdate = (event) => {
      const { external_id, status } = event.detail;
      setMessages(prev => prev.map(m => m.external_id === external_id ? { ...m, status } : m));
    };

    window.addEventListener('whatsapp_message_received', handleNewMessage);
    window.addEventListener('whatsapp_message_status', handleStatusUpdate);

    return () => {
      window.removeEventListener('whatsapp_message_received', handleNewMessage);
      window.removeEventListener('whatsapp_message_status', handleStatusUpdate);
    };
  }, [selectedChat]);

  const fetchConversations = async () => {
    try {
      const res = await apiFetch('/whatsapp/conversations');
      const data = await res.json();
      if (res.ok) setChats(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (leadId) => {
    try {
      const res = await apiFetch(`/whatsapp/messages/${leadId}`);
      const data = await res.json();
      if (res.ok) setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const tabs = [
    { id: 'chats', label: 'Chats', icon: MessageSquare, count: chats.length },
    { id: 'contacts', label: 'Contacts', icon: User, count: 0 },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone, count: campaigns.length },
    { id: 'automation', label: 'Automation', icon: Bot, count: automations.length }
  ];

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat) return;

    const messageData = {
      to: selectedChat.phone,
      message: messageInput,
      lead_id: selectedChat.lead_id || selectedChat.id,
      type: 'text'
    };

    try {
      const response = await apiFetch('/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      const sentMsg = await response.json();
      
      // Update local state with the sent message
      setMessages(prev => [...prev, {
        ...sentMsg,
        text: messageInput,
        sender: 'agent',
        timestamp: 'Just now'
      }]);
      setMessageInput('');
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleCallContact = (contact) => {
    // Implement call functionality
    window.open(`tel:${contact.phone}`);
  };

  const createLeadFromChat = (chat) => {
    // Implement lead creation
    console.log('Creating lead from chat:', chat);
  };

  const renderChatsTab = () => (
    <div className="flex h-full">
      {/* Chat List */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                selectedChat?.id === chat.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {chat.avatar}
                </div>
                {chat.status === 'online' && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                )}
              </div>
              
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{chat.name}</h3>
                  <span className="text-xs text-gray-500">{chat.timestamp}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                  {chat.unread > 0 && (
                    <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                      {chat.unread}
                    </span>
                  )}
                </div>
                {chat.isLead && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded ${
                      chat.leadStatus === 'hot' ? 'bg-red-100 text-red-700' :
                      chat.leadStatus === 'warm' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {chat.leadStatus} lead
                    </span>
                    <span className="text-xs text-gray-500">Assigned to {chat.assignee}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedChat.avatar}
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900">{selectedChat.name}</h3>
                  <p className="text-sm text-gray-500">{selectedChat.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCallContact(selectedChat)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title="Call"
                >
                  <Phone className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => createLeadFromChat(selectedChat)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title="Create Lead"
                >
                  <User className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg" title="More Options">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages
              .filter(msg => msg.chatId === selectedChat.id)
              .map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${
                    message.sender === 'agent' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
                  } rounded-lg px-4 py-2`}>
                    <p>{message.text}</p>
                    <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                      message.sender === 'agent' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      <span>{message.timestamp}</span>
                      {message.sender === 'agent' && (
                        message.status === 'read' ? <CheckCheck className="w-3 h-3" /> :
                        message.status === 'delivered' ? <Check className="w-3 h-3" /> :
                        <Clock className="w-3 h-3" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Paperclip className="w-5 h-5 text-gray-600" />
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Smile className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={handleSendMessage}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
            <p className="text-gray-500">Choose a chat from the list to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderCampaignsTab = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">WhatsApp Campaigns</h2>
        <button
          onClick={() => setShowCampaignModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Create Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                campaign.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {campaign.status}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Template:</span>
                <span className="font-medium">{campaign.template}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sent:</span>
                <span className="font-medium">{campaign.sent}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivered:</span>
                <span className="font-medium text-green-600">{campaign.delivered}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Read:</span>
                <span className="font-medium text-blue-600">{campaign.read}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Failed:</span>
                <span className="font-medium text-red-600">{campaign.failed}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                View Details
              </button>
              <button className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAutomationTab = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">WhatsApp Automation</h2>
        <button
          onClick={() => setShowAutomationModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Create Automation
        </button>
      </div>

      <div className="space-y-4">
        {automations.map((automation) => (
          <div key={automation.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{automation.name}</h3>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  automation.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {automation.status}
                </span>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Settings className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Trigger</p>
                <p className="font-medium">{automation.trigger}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Actions</p>
                <p className="font-medium">{automation.actions}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Performance</p>
                <p className="font-medium">{automation.triggered} triggered, {automation.completed} completed</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                View Logs
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                Edit
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                Test
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContactsTab = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">WhatsApp Contacts</h2>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          Sync Contacts
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search contacts..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {chats.map((chat) => (
                <tr key={chat.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {chat.avatar}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{chat.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {chat.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      chat.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {chat.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {chat.isLead ? (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        chat.leadStatus === 'hot' ? 'bg-red-100 text-red-800' :
                        chat.leadStatus === 'warm' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {chat.leadStatus}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {chat.lastMessage}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Phone className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <User className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chats':
        return renderChatsTab();
      case 'contacts':
        return renderContactsTab();
      case 'campaigns':
        return renderCampaignsTab();
      case 'automation':
        return renderAutomationTab();
      default:
        return renderChatsTab();
    }
  };

  return (
    <WorkspaceGuard>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              WhatsApp CRM
            </h1>
          </div>

          <nav className="px-4 pb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 mb-1 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </div>
                  {tab.count > 0 && (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="px-4 pb-6 border-t border-gray-200">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Analytics</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </h2>
                <p className="text-sm text-gray-500">
                  Manage your WhatsApp communications and automation
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Team
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
              </div>
            </div>
          </header>

          {/* Tab Content */}
          <main className="flex-1 overflow-hidden">
            {renderTabContent()}
          </main>
        </div>
      </div>
    </WorkspaceGuard>
  );
}
