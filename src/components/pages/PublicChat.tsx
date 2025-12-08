import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent } from '../ui/card';
import { io, Socket } from 'socket.io-client';

interface PublicChatProps {
  leadId: string;
}

export function PublicChat({ leadId }: PublicChatProps) {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [leadName, setLeadName] = useState('');
  const [leadInfo, setLeadInfo] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const messageIdsRef = useRef<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const env = (import.meta as any)?.env || {};
  const API_BASE = env.VITE_API_URL || 'http://localhost:5000/api';
  const SOCKET_URL =
    env.VITE_SOCKET_URL || (env.VITE_API_URL ? env.VITE_API_URL.replace(/\/api$/, '') : 'http://localhost:5000');
  const API_URL = `${API_BASE}/messages/public`;

  // Log leadId when component mounts
  useEffect(() => {
    console.log('💬 PublicChat component mounted with leadId:', leadId);
    if (!leadId || leadId.trim() === '') {
      console.error('❌ Invalid leadId:', leadId);
    }
  }, [leadId]);

  // Load messages và join socket room
  useEffect(() => {
    if (!leadId) {
      setLoading(false);
      alert('Không tìm thấy thông tin khách hàng. Vui lòng kiểm tra lại link.');
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching messages for leadId:', leadId);
        console.log('📡 API URL:', `${API_URL}/${leadId}`);

        const res = await fetch(`${API_URL}/${leadId}`);

        if (!res.ok) {
          const errorText = await res.text();
          console.error('❌ Error loading messages:', res.status, res.statusText, errorText);

          let errorMessage = 'Không thể tải tin nhắn.';
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch {
            if (res.status === 404) {
              errorMessage = 'Không tìm thấy khách hàng. Vui lòng kiểm tra lại link.';
            } else if (res.status === 400) {
              errorMessage = 'Link không hợp lệ. Vui lòng kiểm tra lại.';
            } else {
              errorMessage = `Lỗi ${res.status}: ${res.statusText}`;
            }
          }

          alert(errorMessage);
          setLoading(false);
          return;
        }

        const data = await res.json();
        console.log('✅ Received data:', data);

        if (data.success && data.messages) {
          const msgs = data.messages.map((m: any) => ({
            id: m._id,
            sender: m.sender,
            text: m.text,
            time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            attachment: m.attachment || null
          }));
          const ids = new Set<string>(msgs.map((x: any) => String(x.id)));
          messageIdsRef.current = ids;
          setMessages(msgs);
          if (data.leadName) setLeadName(data.leadName);
          if (data.lead) setLeadInfo(data.lead);
          console.log('✅ Loaded', msgs.length, 'messages');
        } else if (!data.success) {
          console.error('❌ API returned success: false', data);
          alert(data.message || 'Không thể tải tin nhắn');
        }
      } catch (err: any) {
        console.error('❌ Lỗi khi tải messages', err);
        const errorMsg = err?.message || 'Không thể kết nối đến server';
        alert(`Lỗi kết nối: ${errorMsg}\n\nVui lòng:\n1. Kiểm tra server có đang chạy không\n2. Kiểm tra kết nối mạng\n3. Thử lại sau`);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Load thông tin lead nếu backend chưa trả kèm theo
    const fetchLeadInfo = async () => {
      try {
        const res = await fetch(`${API_BASE}/leads/${leadId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data?.success && data.lead) {
          setLeadInfo(data.lead);
          if (data.lead.name && !leadName) setLeadName(data.lead.name);
        }
      } catch (err) {
        console.warn('Không thể tải thông tin lead:', err);
      }
    };
    fetchLeadInfo();

    // Initialize socket.io client
    try {
      socketRef.current = io(SOCKET_URL);

      socketRef.current.on('connect', () => {
        console.log('Socket connected:', socketRef.current?.id);
        // Join room for this leadId
        socketRef.current?.emit('join', leadId);
      });

      // Listen for new messages
      socketRef.current.on('message', (m: any) => {
        if (!m || !m._id) return;
        if (messageIdsRef.current.has(m._id)) return; // dedupe
        messageIdsRef.current.add(m._id);
        const newMsg = {
          id: m._id,
          sender: m.sender,
          text: m.text,
          time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          attachment: m.attachment || null
        };
        setMessages((prev) => [...prev, newMsg]);
      });
    } catch (err) {
      console.error('Socket init failed', err);
    }

    return () => {
      try {
        socketRef.current?.emit('leave', leadId);
        socketRef.current?.disconnect();
        socketRef.current = null;
      } catch (e) {
        // noop
      }
    };
  }, [leadId]);

  // Auto-scroll when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() && !file) return;
    if (!leadId) {
      alert('Không tìm thấy thông tin khách hàng. Vui lòng kiểm tra lại link.');
      return;
    }

    try {
      const form = new FormData();
      form.append('leadId', leadId);
      form.append('text', message.trim() || '');
      if (file) form.append('file', file, file.name);

      const res = await fetch(API_URL, {
        method: 'POST',
        body: form
      });

      // Check if response is ok
      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = 'Lỗi khi gửi tin nhắn';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `Lỗi ${res.status}: ${res.statusText}`;
        }
        alert(errorMessage);
        console.error('Response error:', res.status, errorText);
        return;
      }

      const data = await res.json();
      if (data.success && data.data) {
        const m = data.data;
        if (m._id) messageIdsRef.current.add(m._id);
        const newMsg = {
          id: m._id,
          sender: m.sender,
          text: m.text,
          time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          attachment: m.attachment || null
        };
        setMessages((prev) => [...prev, newMsg]);
        setMessage('');
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        alert(data.message || 'Lỗi khi gửi tin nhắn');
      }
    } catch (err: any) {
      console.error('Lỗi khi gửi tin nhắn', err);
      const errorMsg = err?.message || 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
      alert(`Lỗi: ${errorMsg}`);
    }
  };

  if (!leadId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">Lỗi</div>
          <div className="text-gray-600">Không tìm thấy thông tin khách hàng.</div>
          <div className="text-gray-500 text-sm mt-2">Vui lòng kiểm tra lại link hoặc liên hệ với nhân viên hỗ trợ.</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="h-[calc(100vh-2rem)] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-white flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Trò chuyện với {leadName || leadInfo?.name || 'Khách hàng'}
              </h1>
              <p className="text-sm text-gray-500">Chúng tôi sẽ phản hồi sớm nhất có thể</p>
              {leadInfo && (
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  {leadInfo.email && <div>Email: {leadInfo.email}</div>}
                  {leadInfo.phone && <div>Phone: {leadInfo.phone}</div>}
                  {leadInfo.source && <div>Nguồn: {leadInfo.source}</div>}
                  {leadInfo.note && <div>Ghi chú: {leadInfo.note}</div>}
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md px-4 py-2 rounded-lg ${msg.sender === 'customer'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                  >
                    <div>{msg.text}</div>
                    {msg.attachment && (
                      <div className="mt-2">
                        <a
                          href={`${SOCKET_URL}${msg.attachment.url}`}
                          target="_blank"
                          rel="noreferrer"
                          className={`underline text-sm ${msg.sender === 'customer' ? 'text-blue-100' : 'text-blue-600'
                            }`}
                        >
                          📎 {msg.attachment.originalname || msg.attachment.filename}
                        </a>
                      </div>
                    )}
                    <div
                      className={`text-xs mt-1 ${msg.sender === 'customer' ? 'text-blue-100' : 'text-gray-500'
                        }`}
                    >
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-end gap-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setFile(f);
                }}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              {file && (
                <div className="text-sm truncate max-w-xs text-gray-600">
                  Đã chọn: {file.name}
                </div>
              )}
              <Textarea
                placeholder="Nhập tin nhắn của bạn..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="resize-none min-h-[60px]"
              />
              <Button onClick={handleSendMessage} disabled={!message.trim() && !file}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
