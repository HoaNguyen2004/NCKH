import { BarChart3, TrendingUp, Download, Calendar } from 'lucide-react';
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

interface ReportsProps {
  posts: any[];
}

export function Reports({ posts }: ReportsProps) {
  const stats = {
    totalPosts: posts.length,
    buyingPosts: posts.filter(p => p.type === 'Buying').length,
    sellingPosts: posts.filter(p => p.type === 'Selling').length,
    avgConfidence: posts.length > 0
      ? (posts.reduce((acc, p) => acc + parseFloat(p.confidence), 0) / posts.length).toFixed(1)
      : 0
  };

  const categoryData = [
    { name: 'Laptop', count: 45, percentage: 35 },
    { name: 'Phone', count: 38, percentage: 30 },
    { name: 'Furniture', count: 25, percentage: 20 },
    { name: 'Electronics', count: 20, percentage: 15 },
  ];

  const locationData = [
    { name: 'Hà Nội', count: 52, percentage: 40 },
    { name: 'TP.HCM', count: 39, percentage: 30 },
    { name: 'Đà Nẵng', count: 26, percentage: 20 },
    { name: 'Hải Phòng', count: 13, percentage: 10 },
  ];

  return (
    <main className="flex-1 overflow-auto">
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900">Báo cáo & Phân tích</h1>
            <p className="text-gray-500">Thống kê và xu hướng thị trường</p>
          </div>
          <div className="flex items-center gap-3">
            <Select defaultValue="7days">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">7 ngày qua</SelectItem>
                <SelectItem value="30days">30 ngày qua</SelectItem>
                <SelectItem value="90days">90 ngày qua</SelectItem>
                <SelectItem value="custom">Tùy chỉnh</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Chọn ngày
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Xuất báo cáo
            </Button>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Tổng bài đăng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">{stats.totalPosts}</div>
              <div className="text-sm text-green-600 mt-1">↗ +12% so với tháng trước</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bài mua</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">{stats.buyingPosts}</div>
              <div className="text-sm text-green-600 mt-1">↗ +8% so với tháng trước</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bài bán</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">{stats.sellingPosts}</div>
              <div className="text-sm text-green-600 mt-1">↗ +15% so với tháng trước</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Độ chính xác TB</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">{stats.avgConfidence}%</div>
              <div className="text-sm text-green-600 mt-1">↗ +2% so với tháng trước</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Phân bố theo danh mục</CardTitle>
              <CardDescription>Top danh mục sản phẩm được quan tâm</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryData.map((category) => (
                  <div key={category.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700">{category.name}</span>
                      <span className="text-gray-900">{category.count} bài đăng</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Location Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Phân bố theo địa điểm</CardTitle>
              <CardDescription>Khu vực có nhu cầu cao</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {locationData.map((location) => (
                  <div key={location.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700">{location.name}</span>
                      <span className="text-gray-900">{location.count} bài đăng</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-green-600 h-full"
                        style={{ width: `${location.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trend Analysis */}
        <div className="grid grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Xu hướng giá trung bình</CardTitle>
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
              <CardTitle>Tỷ lệ mua/bán</CardTitle>
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
              <CardTitle>Thời gian phản hồi TB</CardTitle>
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
      </div>
    </main>
  );
}
