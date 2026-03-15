import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { 
  MessageSquare, Send, Paperclip, Search, 
  MoreVertical, User, Phone, CheckCheck, 
  Clock, Filter, Zap, BarChart3, ChevronRight
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import WorkspaceGuard from '../components/WorkspaceGuard';

export default function WhatsApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const { apiFetch } = useApi();

  useEffect(() => {
    fetchConversations();
  }, [activeTab]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.lead_id);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/whatsapp/conversations?status=${activeTab}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (leadId) => {
    try {
      const res = await apiFetch(`/whatsapp/messages/${leadId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const res = await apiFetch('/whatsapp/send', {
        method: 'POST',
        body: JSON.stringify({
          to: selectedConversation.phone_number,
          message: newMessage,
          lead_id: selectedConversation.lead_id,
          type: 'text'
        })
      });

      if (res.ok) {
        setNewMessage('');
        fetchMessages(selectedConversation.lead_id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans antialiased overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex flex-1 flex-col h-full min-w-0">
        <Header setIsSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 overflow-hidden">
          <WorkspaceGuard>
            <div className="flex h-full bg-white">
              {/* Conversations List */}
              <div className="w-80 border-r border-gray-200 flex flex-col shrink-0">
                <div className="p-4 border-b border-gray-200 bg-gray-50/50">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">WhatsApp</h2>
                    <div className="flex gap-1">
                      <button className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500">
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500">
                        <Filter className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search chats..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
                  ) : conversations.length === 0 ? (
                    <div className="p-8 text-center">
                      <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No conversations found</p>
                    </div>
                  ) : (
                    conversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv)}
                        className={`p-4 flex gap-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 ${selectedConversation?.id === conv.id ? 'bg-teal-50/50 border-l-4 border-teal-500' : ''}`}
                      >
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                          <User className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-0.5">
                            <h4 className="font-semibold text-gray-900 text-sm truncate">
                              {conv.lead?.name || conv.phone_number}
                            </h4>
                            <span className="text-[10px] text-gray-400">
                              {conv.last_message_at ? new Date(conv.last_message_at).toLocaleDateString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {conv.last_message?.message || 'No messages yet'}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Window */}
              <div className="flex-1 flex flex-col bg-gray-50">
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="h-16 px-6 bg-white border-b border-gray-200 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">{selectedConversation.lead?.name || selectedConversation.phone_number}</h3>
                          <p className="text-[10px] text-teal-600 font-medium">Online</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                          <Phone className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                          <Zap className="w-4 h-4 text-teal-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.from === selectedConversation.phone_number ? 'justify-start' : 'justify-end'}`}
                        >
                          <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                            msg.from === selectedConversation.phone_number 
                              ? 'bg-white text-gray-800 rounded-tl-none' 
                              : 'bg-teal-600 text-white rounded-tr-none'
                          }`}>
                            <p>{msg.message}</p>
                            <div className={`text-[9px] mt-1 flex items-center gap-1 ${
                              msg.from === selectedConversation.phone_number ? 'text-gray-400' : 'text-teal-100'
                            }`}>
                              {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              {msg.from !== selectedConversation.phone_number && (
                                <CheckCheck className="w-3 h-3" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-200">
                      <form onSubmit={handleSendMessage} className="flex gap-2">
                        <button type="button" className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors">
                          <Paperclip className="w-5 h-5" />
                        </button>
                        <input
                          type="text"
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none"
                        />
                        <button 
                          type="submit"
                          disabled={!newMessage.trim()}
                          className="p-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-teal-600/20"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl shadow-gray-200/50 mb-6">
                      <MessageSquare className="w-12 h-12 text-teal-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">WhatsApp CRM</h2>
                    <p className="text-sm text-gray-500 max-w-sm">
                      Select a conversation from the list to start chatting. Manage your leads and follow-ups directly via WhatsApp.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </WorkspaceGuard>
        </main>
      </div>
    </div>
  );
}
