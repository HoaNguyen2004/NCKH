import { Users, Activity, Database, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
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

interface AdminDashboardProps {
  onNavigate?: (page: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { t } = useLanguage();
  
  const systemStats = [
    { label: t('admin.totalUsers'), value: '247', change: '+12%', icon: Users, color: 'blue' },
    { label: t('admin.activeSessions'), value: '89', change: '+5%', icon: Activity, color: 'green' },
    { label: t('admin.apiCalls'), value: '12.4K', change: '+18%', icon: Database, color: 'purple' },
    { label: t('admin.systemUptime'), value: '99.9%', change: '+0.1%', icon: TrendingUp, color: 'pink' },
  ];

  const systemHealth = [
    { component: 'AI Model Server', status: 'healthy', uptime: '99.99%', response: '45ms' },
    { component: 'Database', status: 'healthy', uptime: '99.95%', response: '12ms' },
    { component: 'API Gateway', status: 'healthy', uptime: '99.98%', response: '8ms' },
    { component: 'Cache Server', status: 'warning', uptime: '98.50%', response: '125ms' },
  ];

  const recentActivities = [
    { user: 'Nguyễn Văn A', action: 'Created new filter configuration', time: '2 phút trước', type: 'success' },
    { user: 'Trần Thị B', action: 'Updated AI model settings', time: '15 phút trước', type: 'info' },
    { user: 'System', action: 'Backup completed successfully', time: '1 giờ trước', type: 'success' },
    { user: 'Lê Văn C', action: 'Failed login attempt', time: '2 giờ trước', type: 'warning' },
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

  return (
    <main className="flex-1 overflow-auto">
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900">{t('admin.title')}</h1>
            <p className="text-gray-500">{t('admin.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-700">All Systems Operational</Badge>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* System Stats */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          {systemStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{stat.label}</CardTitle>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getColorClass(stat.color)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-green-600">↗ {stat.change} vs last month</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* System Health */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>{t('admin.systemHealth')}</CardTitle>
              <CardDescription>Real-time system component status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uptime</TableHead>
                    <TableHead>Avg Response</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {systemHealth.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-gray-900">{item.component}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === 'healthy' ? 'default' : 'secondary'}>
                          {item.status === 'healthy' ? (
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                          ) : (
                            <AlertCircle className="w-3 h-3 mr-1" />
                          )}
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">{item.uptime}</TableCell>
                      <TableCell className="text-gray-600">{item.response}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.recentActivities')}</CardTitle>
              <CardDescription>System and user activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'warning' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <div className="text-sm text-gray-900">{activity.user}</div>
                      <div className="text-sm text-gray-600">{activity.action}</div>
                      <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <Button 
            variant="outline" 
            className="h-20"
            onClick={() => onNavigate?.('users')}
          >
            <div className="text-center">
              <Users className="w-5 h-5 mx-auto mb-1" />
              <div className="text-sm">{t('admin.manageUsers')}</div>
            </div>
          </Button>
          <Button variant="outline" className="h-20">
            <div className="text-center">
              <Database className="w-5 h-5 mx-auto mb-1" />
              <div className="text-sm">{t('admin.databaseBackup')}</div>
            </div>
          </Button>
          <Button variant="outline" className="h-20">
            <div className="text-center">
              <Activity className="w-5 h-5 mx-auto mb-1" />
              <div className="text-sm">{t('admin.viewLogs')}</div>
            </div>
          </Button>
          <Button 
            variant="outline" 
            className="h-20"
            onClick={() => onNavigate?.('reports')}
          >
            <div className="text-center">
              <TrendingUp className="w-5 h-5 mx-auto mb-1" />
              <div className="text-sm">{t('admin.analytics')}</div>
            </div>
          </Button>
        </div>
      </div>
    </main>
  );
}