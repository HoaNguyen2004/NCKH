import { useState } from 'react';
import { Users, Target, TrendingUp, DollarSign, BarChart3, Calendar } from 'lucide-react';
import { DateRangeDialog } from '../dialogs/DateRangeDialog';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface ManagerDashboardProps {
  onNavigate?: (page: string) => void;
}

export function ManagerDashboard({ onNavigate }: ManagerDashboardProps) {
  const { t } = useLanguage();
  
  const businessMetrics = [
    { label: t('manager.revenue'), value: '₫45.2M', change: '+23%', icon: DollarSign, color: 'green' },
    { label: t('manager.totalLeads'), value: '342', change: '+15%', icon: Target, color: 'blue' },
    { label: t('manager.conversionRate'), value: '28.5%', change: '+5%', icon: TrendingUp, color: 'purple' },
    { label: t('manager.teamMembers'), value: '12', change: '+2', icon: Users, color: 'pink' },
  ];

  const teamPerformance = [
    { name: 'Nguyễn Văn A', role: 'Sales Staff', leads: 45, converted: 12, revenue: '12.5M', performance: 'excellent' },
    { name: 'Trần Thị B', role: 'Sales Staff', leads: 38, converted: 10, revenue: '9.8M', performance: 'good' },
    { name: 'Lê Văn C', role: 'Sales Staff', leads: 32, converted: 8, revenue: '8.2M', performance: 'good' },
    { name: 'Phạm Thị D', role: 'Sales Staff', leads: 25, converted: 5, revenue: '5.5M', performance: 'average' },
  ];

  const productTrends = [
    { product: 'Laptop Dell', demand: 'high', posts: 89, avgPrice: '8.5M', trend: 'up' },
    { product: 'iPhone 12', demand: 'high', posts: 67, avgPrice: '15M', trend: 'up' },
    { product: 'MacBook Pro', demand: 'medium', posts: 45, avgPrice: '25M', trend: 'stable' },
    { product: 'Samsung Galaxy', demand: 'low', posts: 23, avgPrice: '12M', trend: 'down' },
  ];

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      green: 'bg-green-100 text-green-600',
      blue: 'bg-blue-100 text-blue-600',
      purple: 'bg-purple-100 text-purple-600',
      pink: 'bg-pink-100 text-pink-600',
    };
    return colors[color] || 'bg-gray-100 text-gray-600';
  };

  const getPerformanceBadge = (performance: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'outline'; label: string }> = {
      excellent: { variant: 'default', label: 'Xuất sắc' },
      good: { variant: 'secondary', label: 'Tốt' },
      average: { variant: 'outline', label: 'Trung bình' },
    };
    const config = variants[performance] || variants.average;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const [dateRange, setDateRange] = useState('month');
  const [selectedDateStart, setSelectedDateStart] = useState<Date | null>(null);
  const [selectedDateEnd, setSelectedDateEnd] = useState<Date | null>(null);

  const handleDateRangeApply = (startDate: Date, endDate: Date) => {
    setSelectedDateStart(startDate);
    setSelectedDateEnd(endDate);
    setDateRange('custom');
  };

  return (
    <main className="flex-1 overflow-auto">
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900">{t('manager.title')}</h1>
            <p className="text-gray-500">{t('manager.subtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">{t('manager.7days')}</SelectItem>
                <SelectItem value="month">{t('manager.thisMonth')}</SelectItem>
                <SelectItem value="90days">{t('manager.90days')}</SelectItem>
                <SelectItem value="custom">{t('manager.custom')}</SelectItem>
              </SelectContent>
            </Select>
            <DateRangeDialog onApply={handleDateRangeApply} />
            <Button onClick={() => onNavigate?.('reports')}>
              <BarChart3 className="w-4 h-4 mr-2" />
              {t('manager.fullReport')}
            </Button>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Business Metrics */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          {businessMetrics.map((metric, idx) => {
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
                  <div className="text-sm text-green-600">↗ {metric.change} vs last month</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Team Performance */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
              <CardDescription>Sales team results this month</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team Member</TableHead>
                    <TableHead>Leads</TableHead>
                    <TableHead>Converted</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamPerformance.map((member, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <div>
                          <div className="text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.role}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-900">{member.leads}</TableCell>
                      <TableCell className="text-gray-900">{member.converted}</TableCell>
                      <TableCell className="text-gray-900">₫{member.revenue}</TableCell>
                      <TableCell>{getPerformanceBadge(member.performance)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Product Trends */}
          <Card>
            <CardHeader>
              <CardTitle>{t('manager.productTrends')}</CardTitle>
              <CardDescription>Market demand overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productTrends.map((product, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-900">{product.product}</div>
                      <Badge variant={product.demand === 'high' ? 'default' : 'secondary'}>
                        {product.demand}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{product.posts} posts</span>
                      <span>₫{product.avgPrice}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full"
                          style={{ width: `${(product.posts / 100) * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs ${
                        product.trend === 'up' ? 'text-green-600' :
                        product.trend === 'down' ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {product.trend === 'up' ? '↗' : product.trend === 'down' ? '↘' : '→'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart Placeholder */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t('manager.revenueOverview')}</CardTitle>
            <CardDescription>Monthly revenue and projections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <div>Revenue chart visualization</div>
                <div className="text-sm">Track your business growth over time</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <Button 
            variant="outline" 
            className="h-20"
            onClick={() => onNavigate?.('users')}
          >
            <div className="text-center">
              <Users className="w-5 h-5 mx-auto mb-1" />
              <div className="text-sm">{t('manager.manageTeam')}</div>
            </div>
          </Button>
          <Button 
            variant="outline" 
            className="h-20"
            onClick={() => onNavigate?.('leads')}
          >
            <div className="text-center">
              <Target className="w-5 h-5 mx-auto mb-1" />
              <div className="text-sm">{t('manager.viewAllLeads')}</div>
            </div>
          </Button>
          <Button 
            variant="outline" 
            className="h-20"
            onClick={() => onNavigate?.('reports')}
          >
            <div className="text-center">
              <BarChart3 className="w-5 h-5 mx-auto mb-1" />
              <div className="text-sm">{t('manager.reports')}</div>
            </div>
          </Button>
          <Button variant="outline" className="h-20">
            <div className="text-center">
              <TrendingUp className="w-5 h-5 mx-auto mb-1" />
              <div className="text-sm">{t('manager.setGoals')}</div>
            </div>
          </Button>
        </div>
      </div>
    </main>
  );
}