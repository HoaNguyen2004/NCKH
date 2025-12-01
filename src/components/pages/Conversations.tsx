import { useState, useEffect, useRef } from 'react';
import { Search, Send, Paperclip, Phone, Video, MoreVertical } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  Card,
  CardContent,
} from '../ui/card';

import { io, Socket } from 'socket.io-client';

export function Conversations() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const messageIdsRef = useRef<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // load conversation list from leads
    const fetchConversations = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/leads');
        const data = await res.json();
        if (data.success && data.leads) {
          const convs = data.leads.map((l: any) => ({
            id: l._id,
            name: l.name,
            avatar: l.name ? l.name.split(' ').map((n: string)=>n[0]).slice(0,2).join('').toUpperCase() : 'NA',
            lastMessage: l.interest || '',
            time: l.lastContact || '',
            unread: 0,
            online: false,
            type: l.type || 'Buying'
          }));
          setConversations(convs);
          if (convs.length > 0) setSelectedChat(convs[0].id);
        }
      } catch (err) {
        console.error('Lỗi khi tải conversations', err);
      }
    };

    fetchConversations();

    // initialize socket.io client once
    try {
      socketRef.current = io('http://localhost:5000');

      socketRef.current.on('connect', () => {
        console.log('Socket connected:', socketRef.current?.id);
      });

      // server will emit 'message' events for new messages
      socketRef.current.on('message', (m: any) => {
        if (!m || !m._id) return;
        if (messageIdsRef.current.has(m._id)) return; // dedupe
        messageIdsRef.current.add(m._id);
        const newMsg = {
          id: m._id,
          sender: m.sender,
          text: m.text,
          time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          leadId: m.leadId,
          attachment: m.attachment || null
        };
        setMessages((prev) => {
          if (String(m.leadId) === String(selectedChat)) return [...prev, newMsg];
          return prev;
        });
      });
      socketRef.current.on('read', (payload: any) => {
        try {
          if (!payload || !payload.messageIds) return;
          const ids = new Set(payload.messageIds.map((id: any) => String(id)));
          setMessages((prev) => prev.map((msg) => ids.has(String(msg.id)) ? { ...msg, read: true } : msg));
        } catch (e) {
          // ignore
        }
      });
    } catch (err) {
      console.error('Socket init failed', err);
    }

    return () => {
      try {
        socketRef.current?.disconnect();
        socketRef.current = null;
      } catch (e) {
        // noop
      }
    };
  }, []);

  // load messages for the selected chat
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;
      try {
        const res = await fetch(`http://localhost:5000/api/messages/${selectedChat}`);
        const data = await res.json();
        if (data.success && data.messages) {
          const msgs = data.messages.map((m: any) => ({
            id: m._id,
            sender: m.sender,
            text: m.text,
            time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            attachment: m.attachment || null
          }));
          // populate dedupe set for this chat
          const ids = new Set<string>(msgs.map((x: any) => String(x.id)));
          messageIdsRef.current = ids;
          setMessages(msgs);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error('Lỗi khi tải messages', err);
        setMessages([]);
      }
    };

    fetchMessages();
  }, [selectedChat]);

  // join socket room when selecting a chat
  useEffect(() => {
    if (!selectedChat) return;
    try {
      // reset dedupe set for this chat
      messageIdsRef.current = new Set<string>();
      socketRef.current?.emit('join', selectedChat);
      // mark messages as read for this lead (server will emit read event)
      try {
        fetch(`http://localhost:5000/api/messages/${selectedChat}/read`, { method: 'PUT' })
          .then(() => {})
          .catch((e) => console.error('Mark read failed', e));
      } catch (e) {
        // ignore
      }
    } catch (e) {
      // ignore
    }
  }, [selectedChat]);

  // auto-scroll when messages change
  useEffect(() => {
    try {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    } catch (e) {
      // ignore
    }
  }, [messages]);

  const selectedConversation = conversations.find(c => c.id === selectedChat);

  const handleSendMessage = async () => {
    if (!selectedChat) {
      alert('Vui lòng chọn cuộc trò chuyện');
      return;
    }
    if (!message.trim() && !file) return;

    try {
      const form = new FormData();
      form.append('leadId', selectedChat);
      form.append('sender', 'me');
      form.append('text', message.trim() || '');
      if (file) form.append('file', file, file.name);

      const res = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        body: form
      });
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
    } catch (err) {
      console.error('Lỗi khi gửi tin nhắn', err);
      alert('Lỗi khi gửi tin nhắn');
    }
  };

  return (
    <main className="flex-1 overflow-auto">
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900">Cuộc trò chuyện</h1>
            <p className="text-gray-500">Trò chuyện với khách hàng tiềm năng</p>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="col-span-1">
            <CardContent className="p-4">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Tìm kiếm..." className="pl-10" />
                </div>
              </div>

              <div className="space-y-2">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedChat(conv.id)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedChat === conv.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarFallback>{conv.avatar}</AvatarFallback>
                        </Avatar>
                        {conv.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-gray-900 truncate">{conv.name}</div>
                          <div className="text-xs text-gray-500">{conv.time}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600 truncate">{conv.lastMessage}</div>
                          {conv.unread > 0 && (
                            <Badge className="ml-2 bg-blue-600 text-white">{conv.unread}</Badge>
                          )}
                        </div>
                        <div className="mt-1">
                          <Badge variant={conv.type === 'Buying' ? 'default' : 'secondary'} className="text-xs">
                            {conv.type === 'Buying' ? 'Mua' : 'Bán'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="col-span-2 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback>{selectedConversation?.avatar}</AvatarFallback>
                    </Avatar>
                    {selectedConversation?.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <div className="text-gray-900">{selectedConversation?.name}</div>
                    <div className="text-sm text-gray-500">
                      {selectedConversation?.online ? 'Đang hoạt động' : 'Không hoạt động'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md px-4 py-2 rounded-lg ${
                      msg.sender === 'me'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div>{msg.text}</div>
                    {msg.attachment && (
                      <div className="mt-2">
                        <a href={msg.attachment.url} target="_blank" rel="noreferrer" className="underline text-sm">
                          Tệp đính kèm: {msg.attachment.originalname || msg.attachment.filename}
                        </a>
                      </div>
                    )}
                    <div
                      className={`text-xs mt-1 ${
                        msg.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
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
                <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()}>
                  <Paperclip className="w-4 h-4" />
                </Button>
                {file && <div className="text-sm truncate max-w-xs">Đã chọn: {file.name}</div>}
                <Textarea
                  placeholder="Nhập tin nhắn..."
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
                <Button onClick={handleSendMessage}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
