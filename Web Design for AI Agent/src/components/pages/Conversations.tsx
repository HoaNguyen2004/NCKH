import { useState } from 'react';
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

export function Conversations() {
  const [selectedChat, setSelectedChat] = useState(1);
  const [message, setMessage] = useState('');

  const conversations = [
    {
      id: 1,
      name: 'Nguyễn Minh Tuấn',
      avatar: 'NT',
      lastMessage: 'Laptop còn hàng không bạn?',
      time: '5 phút trước',
      unread: 2,
      online: true,
      type: 'Buying'
    },
    {
      id: 2,
      name: 'Trần Thu Hà',
      avatar: 'TH',
      lastMessage: 'Máy em bán 12.5tr được không?',
      time: '15 phút trước',
      unread: 0,
      online: true,
      type: 'Selling'
    },
    {
      id: 3,
      name: 'Lê Văn Hùng',
      avatar: 'LH',
      lastMessage: 'Anh cho em xem máy được không?',
      time: '1 giờ trước',
      unread: 1,
      online: false,
      type: 'Buying'
    },
    {
      id: 4,
      name: 'Phạm Thị Lan',
      avatar: 'PL',
      lastMessage: 'Cảm ơn anh nhé!',
      time: '2 giờ trước',
      unread: 0,
      online: false,
      type: 'Buying'
    },
  ];

  const messages = [
    {
      id: 1,
      sender: 'customer',
      text: 'Xin chào, laptop Dell 7490 còn hàng không ạ?',
      time: '14:30'
    },
    {
      id: 2,
      sender: 'me',
      text: 'Chào bạn! Vẫn còn hàng ạ. Bạn quan tâm cấu hình nào?',
      time: '14:32'
    },
    {
      id: 3,
      sender: 'customer',
      text: 'Em cần i5 gen 8, ram 8GB, giá khoảng 8tr được không?',
      time: '14:35'
    },
    {
      id: 4,
      sender: 'me',
      text: 'Có ạ, em có máy i5-8350U, RAM 8GB, SSD 256GB, màn 14 inch FHD. Giá 8.2tr bạn nhé.',
      time: '14:36'
    },
    {
      id: 5,
      sender: 'customer',
      text: 'Laptop còn hàng không bạn?',
      time: '14:40'
    },
  ];

  const selectedConversation = conversations.find(c => c.id === selectedChat);

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle send message
      setMessage('');
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
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-end gap-2">
                <Button variant="outline" size="icon">
                  <Paperclip className="w-4 h-4" />
                </Button>
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
