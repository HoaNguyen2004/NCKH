import React from 'react';
import { Target, MessageSquare, Phone, TrendingUp, Star, Clock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';

interface SalesDashboardProps {
  onNavigate?: (page: string) => void;
}

export function SalesDashboard({ onNavigate }: SalesDashboardProps) {
  const { t } = useLanguage();
  
  const salesMetrics = [
    { label: t('sales.myLeads'), value: '45', change: '+8 today', icon: Target, color: 'blue' },
    { label: t('sales.activeChats'), value: '12', change: '3 unread', icon: MessageSquare, color: 'green' },
    { label: t('sales.callsMade'), value: '28', change: 'Today', icon: Phone, color: 'purple' },
    { label: t('sales.conversionRate'), value: '32%', change: '+5%', icon: TrendingUp, color: 'pink' },
  ];

  const urgentLeads = [
    { 
      name: 'Nguyễn Minh Tuấn', 
      product: 'Laptop Dell', 
      budget: '7-10M', 
      priority: 'high',
      lastContact: '2 giờ trước',
      status: 'new',
      phone: '0912345678'
    },
    { 
      name: 'Trần Thu Hà', 
      product: 'iPhone 12', 
      budget: '12-15M', 
      priority: 'high',
      lastContact: '3 giờ trước',
      status: 'contacted',
      phone: '0987654321'
    },
    { 
      name: 'Lê Văn Hùng', 
      product: 'MacBook Pro M1', 
      budget: '20-25M', 
      priority: 'medium',
      lastContact: '5 giờ trước',
      status: 'qualified',
      phone: '0909123456'
    },
  ];

  const recentChats = [
    { name: 'Nguyễn Văn A', message: 'Laptop còn hàng không bạn?', time: '5 phút', unread: 2, online: true },
    { name: 'Trần Thị B', message: 'Máy em bán 12.5tr được không?', time: '15 phút', unread: 0, online: true },
    { name: 'Lê Văn C', message: 'Anh cho em xem máy được không?', time: '1 giờ', unread: 1, online: false },
  ];

  const todayTasks = [
    { task: 'Follow up với Nguyễn Minh Tuấn', time: '10:00 AM', status: 'pending' },
    { task: 'Demo sản phẩm cho Trần Thu Hà', time: '2:00 PM', status: 'pending' },
    { task: 'Gọi điện cho 5 leads mới', time: '4:00 PM', status: 'pending' },
    { task: 'Cập nhật CRM', time: '5:00 PM', status: 'completed' },
  ];

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      pink: 'bg-pink-100 text-pink-600',
    };
    return colors[color] || 'bg-gray-100 text-gray-600';
  };

  const getPriorityColor = (priority: string) => {
    return priority === 'high' ? 'text-red-600' : 'text-yellow-600';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <main className="flex-1 overflow-auto">
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900">{t('sales.title')}</h1>
            <p className="text-gray-500">{t('sales.subtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <MessageSquare className="w-4 h-4 mr-2" />
              {t('sales.viewAllChats')}
            </Button>
            <Button onClick={() => onNavigate?.('leads')}>
              <Target className="w-4 h-4 mr-2" />
              {t('sales.myLeads')}
            </Button>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Sales Metrics */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          {salesMetrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{metric.label}</CardTitle>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getColorClass(metric.color)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl text-gray-900 mb-1">{metric.value}</div>
                  <div className="text-sm text-gray-600">{metric.change}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Urgent Leads */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Urgent Leads - Action Required</CardTitle>
              <CardDescription>High priority leads that need immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Priority</TableHead>
                    <TableHead>Lead</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Last Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {urgentLeads.map((lead, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Star className={`w-5 h-5 ${getPriorityColor(lead.priority)} fill-current`} />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-gray-900">{lead.name}</div>
                          <div className="text-sm text-gray-500">{lead.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-900">{lead.product}</TableCell>
                      <TableCell className="text-gray-600">₫{lead.budget}</TableCell>
                      <TableCell className="text-gray-600">{lead.lastContact}</TableCell>
                      <TableCell>
                        <Badge variant={lead.status === 'new' ? 'default' : 'secondary'}>
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Phone className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Chats & Tasks */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Chats</CardTitle>
                <CardDescription>Active conversations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentChats.map((chat, idx) => (
                    <button
                      key={idx}
                      onClick={() => onNavigate?.('conversations')}
                      className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="relative">
                        <Avatar>
                          <AvatarFallback>{getInitials(chat.name)}</AvatarFallback>
                        </Avatar>
                        {chat.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-sm text-gray-900 truncate">{chat.name}</div>
                          <div className="text-xs text-gray-500">{chat.time}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600 truncate">{chat.message}</div>
                          {chat.unread > 0 && (
                            <Badge className="ml-2 bg-blue-600 text-white">{chat.unread}</Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('sales.todayTasks')}</CardTitle>
                <CardDescription>Your schedule for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todayTasks.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        item.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      <div className="flex-1">
                        <div className={`text-sm ${
                          item.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                        }`}>
                          {item.task}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Clock className="w-3 h-3" />
                          {item.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-5 gap-4 mt-6">
          <Button 
            variant="outline" 
            className="h-20"
            onClick={() => {
              const lead = urgentLeads[0];
              if (lead) {
                window.location.href = `tel:${lead.phone}`;
              }
            }}
          >
            <div className="text-center">
              <Phone className="w-5 h-5 mx-auto mb-1" />
              <div className="text-sm">{t('sales.makeCall')}</div>
            </div>
          </Button>
          <Button 
            variant="outline" 
            className="h-20"
            onClick={() => onNavigate?.('conversations')}
          >
            <div className="text-center">
              <MessageSquare className="w-5 h-5 mx-auto mb-1" />
              <div className="text-sm">{t('sales.sendMessage')}</div>
            </div>
          </Button>
          <Button 
            variant="outline" 
            className="h-20"
            onClick={() => onNavigate?.('leads')}
          >
            <div className="text-center">
              <Target className="w-5 h-5 mx-auto mb-1" />
              <div className="text-sm">{t('sales.addLead')}</div>
            </div>
          </Button>
          <Button 
            variant="outline" 
            className="h-20"
            onClick={() => onNavigate?.('leads')}
          >
            <div className="text-center">
              <Star className="w-5 h-5 mx-auto mb-1" />
              <div className="text-sm">{t('sales.updateStatus')}</div>
            </div>
          </Button>
          <Button 
            variant="outline" 
            className="h-20"
            onClick={() => onNavigate?.('reports')}
          >
            <div className="text-center">
              <TrendingUp className="w-5 h-5 mx-auto mb-1" />
              <div className="text-sm">{t('sales.myStats')}</div>
            </div>
          </Button>
        </div>
      </div>
    </main>
  );
}
