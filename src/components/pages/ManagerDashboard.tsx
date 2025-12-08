import { useState, useEffect } from 'react';
import { Users, Target, TrendingUp, DollarSign, BarChart3, Calendar, FileText } from 'lucide-react';
import { DateRangeDialog } from '../dialogs/DateRangeDialog';
import { useLanguage } from '../../contexts/LanguageContext';
import { getToken, fetchPostsStats } from '../../utils/api';
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

  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [postsLoading, setPostsLoading] = useState(true);

  const [businessMetrics, setBusinessMetrics] = useState([
    { label: t('manager.revenue'), value: '₫0M', change: '0%', icon: DollarSign, color: 'green' },
    { label: t('manager.totalLeads'), value: '0', change: '0%', icon: Target, color: 'blue' },
    { label: t('manager.conversionRate'), value: '0%', change: '0%', icon: TrendingUp, color: 'purple' },
    { label: t('manager.teamMembers'), value: '0', change: '0', icon: Users, color: 'pink' },
  ]);

  const [teamPerformance, setTeamPerformance] = useState([
    { name: 'Loading...', role: 'Sales Staff', leads: 0, converted: 0, revenue: '0M', performance: 'average' }
  ]);

  const [productTrends, setProductTrends] = useState([
    { product: 'Loading...', demand: 'low', posts: 0, avgPrice: '0M', trend: 'stable' }
  ]);

  const [loading, setLoading] = useState(true);

<<<<<<< Updated upstream
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
=======
  // Fetch total posts từ database
  useEffect(() => {
    const loadPostsStats = async () => {
      try {
        setPostsLoading(true);
        const data = await fetchPostsStats();
        if (data.success && data.stats) {
          setTotalPosts(data.stats.total || 0);
        }
      } catch (err) {
        console.error('Failed to fetch posts stats:', err);
      } finally {
        setPostsLoading(false);
      }
    };
    loadPostsStats();
  }, []);
>>>>>>> Stashed changes

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = getToken();
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reports/dashboard?range=${dateRange}`, { headers });
        const data = await response.json();

        if (data.success && data.data) {
          const { businessMetrics: metrics, teamPerformance: team, productTrends: products } = data.data;

          // Update business metrics with real data
          setBusinessMetrics(metrics.map((metric: any) => ({
            label: metric.label,
            value: metric.value,
            change: metric.change,
            icon: metric.icon === 'DollarSign' ? DollarSign :
                  metric.icon === 'Target' ? Target :
                  metric.icon === 'TrendingUp' ? TrendingUp : Users,
            color: metric.color
          })));

          setTeamPerformance(team);
          setProductTrends(products);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dateRange]);

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
        <div className="grid grid-cols-5 gap-6 mb-6">
          {/* Card Tổng bài đăng */}
          <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-indigo-700">{t('manager.totalPosts') || 'Tổng bài đăng'}</CardTitle>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-100 text-indigo-600">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {postsLoading ? (
                <div className="h-8 bg-indigo-200 rounded animate-pulse"></div>
              ) : (
                <div className="text-3xl font-bold text-indigo-900">{totalPosts.toLocaleString()}</div>
              )}
              <div className="text-sm text-indigo-600 mt-1">Bài đăng trong hệ thống</div>
            </CardContent>
          </Card>

          {loading ? (
            // Loading skeleton
            Array(4).fill(0).map((_, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                    <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            businessMetrics.map((metric, idx) => {
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
            })
          )}
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