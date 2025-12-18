import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Download, Calendar } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import * as XLSX from 'xlsx';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useLanguage } from '../../contexts/LanguageContext';
import { DateRangeDialog } from '../dialogs/DateRangeDialog';

interface ReportsProps {
  posts: any[];
}

export function Reports({ posts }: ReportsProps) {
  const { t } = useLanguage();
  const [exportFormat, setExportFormat] = useState('xlsx');
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(null);
  const [revenueData, setRevenueData] = useState<Array<{ date: string; revenue: number; profit: number; loss: number }>>([]);

  const stats = {
    totalPosts: posts.length,
    buyingPosts: posts.filter(p => p.type === 'Buying').length,
    sellingPosts: posts.filter(p => p.type === 'Selling').length,
    avgConfidence: posts.length > 0
      ? (posts.reduce((acc, p) => acc + parseFloat(p.confidence || 0), 0) / posts.length).toFixed(1)
      : 0
  };

  const handleExportReport = async () => {
    try {
      if (exportFormat === 'xlsx') {
        exportExcel();
      } else if (exportFormat === 'csv') {
        exportCSV();
      }
      alert(t('reports.exportSuccess'));
    } catch (err) {
      console.error('Lỗi:', err);
      alert(t('reports.exportError'));
    }
  };

  const exportExcel = () => {
    const reportData = [
      ['BÁO CÁO BÁN HÀNG & PHÂN TÍCH'],
      ['Ngày xuất:', new Date().toLocaleString('vi-VN')],
      dateRange ? [`Khoảng thời gian: ${dateRange.start.toLocaleDateString('vi-VN')} - ${dateRange.end.toLocaleDateString('vi-VN')}`] : [],
      [],
      ['THỐNG KÊ CHUNG'],
      ['Chỉ số', 'Giá trị', 'Thay đổi'],
      ['Tổng bài đăng', stats.totalPosts, '+12% so với tháng trước'],
      ['Bài mua', stats.buyingPosts, '+8% so với tháng trước'],
      ['Bài bán', stats.sellingPosts, '+15% so với tháng trước'],
      ['Độ chính xác TB', `${stats.avgConfidence}%`, '+2% so với tháng trước'],
      [],
      ['BẢNG DOANH THU'],
      ['Ngày', 'Doanh thu (VNĐ)', 'Lợi nhuận (VNĐ)', 'Thua lỗ (VNĐ)', 'Tổng (VNĐ)'],
    ];

    // Thêm dữ liệu doanh thu
    if (revenueData.length > 0) {
      revenueData.forEach(item => {
        const total = item.revenue + item.profit - item.loss;
        reportData.push([
          item.date,
          item.revenue.toLocaleString('vi-VN'),
          item.profit.toLocaleString('vi-VN'),
          item.loss.toLocaleString('vi-VN'),
          total.toLocaleString('vi-VN')
        ]);
      });
    } else {
      reportData.push(['Không có dữ liệu trong khoảng thời gian được chọn', '', '', '', '']);
    }

    // Tính tổng
    const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
    const totalProfit = revenueData.reduce((sum, item) => sum + item.profit, 0);
    const totalLoss = revenueData.reduce((sum, item) => sum + item.loss, 0);
    const grandTotal = totalRevenue + totalProfit - totalLoss;

    reportData.push([]);
    reportData.push(['TỔNG CỘNG', totalRevenue.toLocaleString('vi-VN'), totalProfit.toLocaleString('vi-VN'), totalLoss.toLocaleString('vi-VN'), grandTotal.toLocaleString('vi-VN')]);

    // Tạo sheet báo cáo
    const ws = XLSX.utils.aoa_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo');

    // Tạo sheet biểu đồ doanh thu
    const chartData = [
      ['BIỂU ĐỒ DOANH THU & LỢI NHUẬN/THUA LỖ'],
      [],
      ['Ngày', 'Doanh thu', 'Lợi nhuận', 'Thua lỗ', 'Tổng'],
    ];

    if (revenueData.length > 0) {
      revenueData.forEach(item => {
        const total = item.revenue + item.profit - item.loss;
        chartData.push([
          item.date,
          item.revenue,
          item.profit,
          item.loss,
          total
        ]);
      });
    }

    const wsChart = XLSX.utils.aoa_to_sheet(chartData);
    XLSX.utils.book_append_sheet(wb, wsChart, 'Biểu đồ Doanh thu');

    // Đặt độ rộng cột
    ws['!cols'] = [
      { wch: 30 },
      { wch: 20 },
      { wch: 20 }
    ];

    wsChart['!cols'] = [
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 }
    ];

    const fileName = `bao_cao_${dateRange ? `${dateRange.start.toISOString().split('T')[0]}_${dateRange.end.toISOString().split('T')[0]}` : new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const exportCSV = () => {
    const csv = `Báo cáo Bán hàng\n\nTổng bài đăng,${stats.totalPosts}\nBài mua,${stats.buyingPosts}\nBài bán,${stats.sellingPosts}\nĐộ chính xác TB,${stats.avgConfidence}%`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const [categoryData, setCategoryData] = useState<Array<{ name: string; count: number; percentage: number }>>([]);
  const [locationData, setLocationData] = useState<Array<{ name: string; count: number; percentage: number }>>([]);

  // Hàm tính doanh thu từ posts
  const calculateRevenue = async (startDate?: Date, endDate?: Date) => {
    try {
      let filteredPosts = posts;
      
      if (startDate && endDate) {
        filteredPosts = posts.filter((post: any) => {
          const postDate = new Date(post.date || post.createdAt || Date.now());
          return postDate >= startDate && postDate <= endDate;
        });
      }

      // Tính doanh thu theo ngày
      const revenueByDate: Record<string, { revenue: number; profit: number; loss: number }> = {};
      
      filteredPosts.forEach((post: any) => {
        if (post.type === 'Selling' && post.price) {
          const postDate = new Date(post.date || post.createdAt || Date.now());
          const dateKey = postDate.toLocaleDateString('vi-VN');
          
          if (!revenueByDate[dateKey]) {
            revenueByDate[dateKey] = { revenue: 0, profit: 0, loss: 0 };
          }
          
          revenueByDate[dateKey].revenue += post.price || 0;
          
          // Giả sử lợi nhuận = 20% doanh thu, thua lỗ = 5% doanh thu (có thể điều chỉnh)
          const estimatedProfit = (post.price || 0) * 0.2;
          const estimatedLoss = (post.price || 0) * 0.05;
          
          revenueByDate[dateKey].profit += estimatedProfit;
          revenueByDate[dateKey].loss += estimatedLoss;
        }
      });

      // Chuyển đổi thành mảng và sắp xếp theo ngày
      const revenueArray = Object.entries(revenueByDate)
        .map(([date, data]) => ({
          date,
          revenue: data.revenue,
          profit: data.profit,
          loss: data.loss
        }))
        .sort((a, b) => new Date(a.date.split('/').reverse().join('-')).getTime() - new Date(b.date.split('/').reverse().join('-')).getTime());

      setRevenueData(revenueArray);
    } catch (err) {
      console.error('Error calculating revenue', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await fetch('http://localhost:5000/api/products');
        const prodJson = await prodRes.json();
        const prods = Array.isArray(prodJson.products) ? prodJson.products : prodJson || [];

        const catCounts: Record<string, number> = {};
        prods.forEach((p: any) => {
          const key = (p.category || 'Unknown').toString();
          catCounts[key] = (catCounts[key] || 0) + 1;
        });
        const totalCats = Object.values(catCounts).reduce((a, b) => a + b, 0) || 1;
        const cats = Object.entries(catCounts).map(([name, count]) => ({ name, count, percentage: Math.round((count / totalCats) * 100) }));
        cats.sort((a, b) => b.count - a.count);
        setCategoryData(cats.slice(0, 8));

        const leadRes = await fetch('http://localhost:5000/api/leads');
        const leadJson = await leadRes.json();
        const leads = Array.isArray(leadJson.leads) ? leadJson.leads : leadJson || [];

        const locCounts: Record<string, number> = {};
        leads.forEach((l: any) => {
          const key = (l.location || 'Unknown').toString();
          locCounts[key] = (locCounts[key] || 0) + 1;
        });
        const totalLocs = Object.values(locCounts).reduce((a, b) => a + b, 0) || 1;
        const locs = Object.entries(locCounts).map(([name, count]) => ({ name, count, percentage: Math.round((count / totalLocs) * 100) }));
        locs.sort((a, b) => b.count - a.count);
        setLocationData(locs.slice(0, 12));
      } catch (err) {
        console.error('Error loading report data', err);
      }
    };

    fetchData();
    calculateRevenue();
  }, [posts]);

  // Tính lại doanh thu khi date range thay đổi
  useEffect(() => {
    if (dateRange) {
      calculateRevenue(dateRange.start, dateRange.end);
    } else {
      calculateRevenue();
    }
  }, [dateRange, posts]);

  const handleDateRangeApply = (startDate: Date, endDate: Date) => {
    setDateRange({ start: startDate, end: endDate });
  };

  const CATEGORY_COLORS = ['#2563eb', '#0ea5a0', '#f97316', '#8b5cf6'];
  const LOCATION_COLOR = '#10b981';

  return (
    <main className="flex-1 overflow-auto">
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900">{t('reports.title')}</h1>
            <p className="text-gray-500">{t('reports.subtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <Select defaultValue="7days">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">{t('reports.range7days')}</SelectItem>
                <SelectItem value="30days">{t('reports.range30days')}</SelectItem>
                <SelectItem value="90days">{t('reports.range90days')}</SelectItem>
                <SelectItem value="custom">{t('reports.rangeCustom')}</SelectItem>
              </SelectContent>
            </Select>
            <DateRangeDialog onApply={handleDateRangeApply} />
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xlsx">{t('reports.exportFormatExcel')}</SelectItem>
                <SelectItem value="csv">{t('reports.exportFormatCsv')}</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExportReport}>
              <Download className="w-4 h-4 mr-2" />
              {t('reports.exportButton')}
            </Button>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('reports.totalPosts')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">{stats.totalPosts}</div>
              <div className="text-sm text-green-600 mt-1">↗ +12% so với tháng trước</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('reports.buyingPosts')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">{stats.buyingPosts}</div>
              <div className="text-sm text-green-600 mt-1">↗ +8% so với tháng trước</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('reports.sellingPosts')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">{stats.sellingPosts}</div>
              <div className="text-sm text-green-600 mt-1">↗ +15% so với tháng trước</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('reports.avgConfidence')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">{stats.avgConfidence}%</div>
              <div className="text-sm text-green-600 mt-1">↗ +2% so với tháng trước</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('reports.categoryDistributionTitle')}</CardTitle>
              <CardDescription>{t('reports.categoryDistributionDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ height: 260 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={36}
                      paddingAngle={4}
                      label={(entry) => `${entry.name}: ${entry.count}`}
                    >
                      {categoryData.map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <ReTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {categoryData.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                    <div className="text-sm">{c.name} — {c.count} ({c.percentage}%)</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('reports.locationDistributionTitle')}</CardTitle>
              <CardDescription>{t('reports.locationDistributionDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ height: 260 }}>
                <ResponsiveContainer>
                  <ReBarChart data={locationData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ReTooltip />
                    <Bar dataKey="count" fill={LOCATION_COLOR} />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('reports.avgPriceTrendTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-4xl text-gray-900 mb-2">8.5M VNĐ</div>
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>+5.2% so với tháng trước</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('reports.buySellRatioTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-4xl text-gray-900 mb-2">
                  {stats.totalPosts > 0 
                    ? ((stats.buyingPosts / stats.sellingPosts) || 0).toFixed(2)
                    : '0'}
                </div>
                <div className="text-gray-600">
                  {stats.buyingPosts} bài mua / {stats.sellingPosts} bài bán
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('reports.avgResponseTimeTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-4xl text-gray-900 mb-2">2.5 giờ</div>
                <div className="text-green-600">
                  Nhanh hơn 30 phút so với tháng trước
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Biểu đồ Doanh thu */}
        {revenueData.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Biểu đồ Doanh thu & Lợi nhuận/Thua lỗ</CardTitle>
              <CardDescription>
                {dateRange 
                  ? `Từ ${dateRange.start.toLocaleDateString('vi-VN')} đến ${dateRange.end.toLocaleDateString('vi-VN')}`
                  : 'Tất cả dữ liệu'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ height: 400 }}>
                <ResponsiveContainer>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ReTooltip 
                      formatter={(value: any) => `${value.toLocaleString('vi-VN')} VNĐ`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      name="Doanh thu"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Lợi nhuận"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="loss" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Thua lỗ"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
