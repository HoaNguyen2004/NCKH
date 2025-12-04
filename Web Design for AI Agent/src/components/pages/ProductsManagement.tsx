import { useState } from 'react';
import { Plus, Search, TrendingUp, TrendingDown, Package } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useLanguage } from '../../contexts/LanguageContext';

export function ProductsManagement() {
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    keywords: '',
    status: 'tracking',
  });

  const [products] = useState([
    {
      id: 1,
      name: 'Laptop Dell Latitude 7490',
      category: 'Laptop',
      avgPrice: 8500000,
      minPrice: 7000000,
      maxPrice: 10000000,
      demand: 'high',
      buyingPosts: 45,
      sellingPosts: 32,
      trend: 'up',
      trendPercent: 12
    },
    {
      id: 2,
      name: 'iPhone 12 Pro',
      category: 'Phone',
      avgPrice: 15000000,
      minPrice: 12000000,
      maxPrice: 18000000,
      demand: 'medium',
      buyingPosts: 28,
      sellingPosts: 35,
      trend: 'down',
      trendPercent: 5
    },
    {
      id: 3,
      name: 'MacBook Pro M1',
      category: 'Laptop',
      avgPrice: 25000000,
      minPrice: 20000000,
      maxPrice: 30000000,
      demand: 'high',
      buyingPosts: 67,
      sellingPosts: 23,
      trend: 'up',
      trendPercent: 18
    },
    {
      id: 4,
      name: 'Samsung Galaxy S21',
      category: 'Phone',
      avgPrice: 12000000,
      minPrice: 9000000,
      maxPrice: 15000000,
      demand: 'low',
      buyingPosts: 15,
      sellingPosts: 42,
      trend: 'down',
      trendPercent: 8
    },
    {
      id: 5,
      name: 'iPad Air 2022',
      category: 'Tablet',
      avgPrice: 16000000,
      minPrice: 14000000,
      maxPrice: 19000000,
      demand: 'medium',
      buyingPosts: 34,
      sellingPosts: 28,
      trend: 'up',
      trendPercent: 6
    },
  ]);

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'high':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getDemandLabel = (demand: string) => {
    switch (demand) {
      case 'high':
        return 'Cao';
      case 'medium':
        return 'Trung bình';
      case 'low':
        return 'Thấp';
      default:
        return demand;
    }
  };

  return (
    <main className="flex-1 overflow-auto">
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900">Quản lý sản phẩm</h1>
            <p className="text-gray-500">Theo dõi giá và nhu cầu thị trường</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm sản phẩm theo dõi
          </Button>
        </div>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Tổng sản phẩm</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">{products.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nhu cầu cao</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">
                {products.filter(p => p.demand === 'high').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tổng bài mua</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">
                {products.reduce((acc, p) => acc + p.buyingPosts, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tổng bài bán</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">
                {products.reduce((acc, p) => acc + p.sellingPosts, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Danh sách sản phẩm</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Tìm kiếm sản phẩm..." className="pl-10 w-64" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Giá trung bình</TableHead>
                  <TableHead>Khoảng giá</TableHead>
                  <TableHead>Nhu cầu</TableHead>
                  <TableHead>Bài mua</TableHead>
                  <TableHead>Bài bán</TableHead>
                  <TableHead>Xu hướng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="text-gray-900">{product.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-gray-900">
                      {product.avgPrice.toLocaleString()}đ
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {product.minPrice.toLocaleString()}đ - {product.maxPrice.toLocaleString()}đ
                    </TableCell>
                    <TableCell>
                      <Badge className={getDemandColor(product.demand)}>
                        {getDemandLabel(product.demand)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-900">{product.buyingPosts}</TableCell>
                    <TableCell className="text-gray-900">{product.sellingPosts}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {product.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className={product.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                          {product.trendPercent}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Thêm sản phẩm theo dõi</DialogTitle>
            <DialogDescription>
              Thêm sản phẩm mới vào danh sách theo dõi.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name">Tên sản phẩm</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category">Danh mục</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Laptop">Laptop</SelectItem>
                  <SelectItem value="Phone">Phone</SelectItem>
                  <SelectItem value="Tablet">Tablet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price">Giá trung bình</Label>
              <Input
                id="price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="keywords">Từ khóa</Label>
              <Input
                id="keywords"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tracking">Theo dõi</SelectItem>
                  <SelectItem value="paused">Tạm dừng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Thêm sản phẩm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}