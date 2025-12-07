import { useState, useEffect } from 'react';
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
  DialogTrigger,
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
  const [products, setProducts] = useState([
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

  const [showDialog, setShowDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Laptop',
    avgPrice: '',
    minPrice: '',
    maxPrice: '',
    demand: 'medium',
    buyingPosts: 0,
    sellingPosts: 0
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      if (data.success && data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Lỗi khi tải sản phẩm:', err);
    }
  };

  const handleAddProduct = async () => {
    if (!formData.name || !formData.avgPrice) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          avgPrice: parseFloat(formData.avgPrice),
          minPrice: parseFloat(formData.minPrice || formData.avgPrice),
          maxPrice: parseFloat(formData.maxPrice || formData.avgPrice)
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Thêm sản phẩm thành công');
        setFormData({ name: '', category: 'Laptop', avgPrice: '', minPrice: '', maxPrice: '', demand: 'medium', buyingPosts: 0, sellingPosts: 0 });
        setShowDialog(false);
        fetchProducts();
      } else {
        alert(data.message || 'Lỗi khi thêm sản phẩm');
      }
    } catch (err) {
      console.error('Lỗi:', err);
      alert('Lỗi khi thêm sản phẩm');
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProductId(product._id);
    setFormData({
      name: product.name,
      category: product.category,
      avgPrice: product.avgPrice.toString(),
      minPrice: product.minPrice.toString(),
      maxPrice: product.maxPrice.toString(),
      demand: product.demand,
      buyingPosts: product.buyingPosts,
      sellingPosts: product.sellingPosts
    });
    setShowEditDialog(true);
  };

  const handleUpdateProduct = async () => {
    if (!formData.name || !formData.avgPrice) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/products/${editingProductId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          avgPrice: parseFloat(formData.avgPrice),
          minPrice: parseFloat(formData.minPrice),
          maxPrice: parseFloat(formData.maxPrice)
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Cập nhật sản phẩm thành công');
        setShowEditDialog(false);
        setEditingProductId(null);
        fetchProducts();
      } else {
        alert(data.message || 'Lỗi khi cập nhật sản phẩm');
      }
    } catch (err) {
      console.error('Lỗi:', err);
      alert('Lỗi khi cập nhật sản phẩm');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Bạn chắc chắn muốn xóa sản phẩm này?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        alert('Xóa sản phẩm thành công');
        fetchProducts();
      } else {
        alert(data.message || 'Lỗi khi xóa sản phẩm');
      }
    } catch (err) {
      console.error('Lỗi:', err);
      alert('Lỗi khi xóa sản phẩm');
    }
  };

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
            <h1 className="text-gray-900">{t('products.title')}</h1>
            <p className="text-gray-500">{t('products.subtitle')}</p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {t('products.addTrackedProduct')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{t('products.addTrackedProduct')}</DialogTitle>
                <DialogDescription>
                  Nhập thông tin sản phẩm cần theo dõi
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">{t('products.product')}</Label>
                  <Input
                    id="name"
                    placeholder="Ví dụ: Laptop Dell Latitude 7490"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">{t('products.category')}</Label>
                  <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Laptop">Laptop</SelectItem>
                      <SelectItem value="Phone">Phone</SelectItem>
                      <SelectItem value="Tablet">Tablet</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Furniture">Furniture</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="grid gap-2">
                    <Label htmlFor="avgPrice">{t('products.avgPrice')}</Label>
                    <Input
                      id="avgPrice"
                      type="number"
                      placeholder="0"
                      value={formData.avgPrice}
                      onChange={(e) => setFormData({ ...formData, avgPrice: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="minPrice">{t('products.minPrice')}</Label>
                    <Input
                      id="minPrice"
                      type="number"
                      placeholder="0"
                      value={formData.minPrice}
                      onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="maxPrice">{t('products.maxPrice')}</Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      placeholder="0"
                      value={formData.maxPrice}
                      onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="demand">{t('products.demand')}</Label>
                  <Select value={formData.demand} onValueChange={(val) => setFormData({ ...formData, demand: val })}>
                    <SelectTrigger id="demand">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">{t('products.high')}</SelectItem>
                      <SelectItem value="medium">{t('products.medium')}</SelectItem>
                      <SelectItem value="low">{t('products.low')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleAddProduct}>
                  {t('products.addProduct')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('products.totalProducts')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">{products.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('products.highDemand')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">
                {products.filter(p => p.demand === 'high').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('products.totalBuyingPosts')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">
                {products.reduce((acc, p) => acc + p.buyingPosts, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('products.totalSellingPosts')}</CardTitle>
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
              <CardTitle>{t('products.listTitle')}</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder={t('products.searchPlaceholder')} className="pl-10 w-64" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('products.product')}</TableHead>
                  <TableHead>{t('products.category')}</TableHead>
                  <TableHead>{t('products.avgPrice')}</TableHead>
                  <TableHead>{t('products.priceRange')}</TableHead>
                  <TableHead>{t('products.demand')}</TableHead>
                  <TableHead>{t('products.totalBuyingPosts')}</TableHead>
                  <TableHead>{t('products.totalSellingPosts')}</TableHead>
                  <TableHead>{t('products.trend')}</TableHead>
                  <TableHead>{t('common.actions')}</TableHead>
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
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)}>
                          {t('common.edit')}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteProduct(product._id)}>
                          {t('common.delete')}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Product Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t('products.editProduct')}</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin sản phẩm
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">{t('products.product')}</Label>
                <Input
                  id="edit-name"
                  placeholder="Ví dụ: Laptop Dell Latitude 7490"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">{t('products.category')}</Label>
                <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                  <SelectTrigger id="edit-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Laptop">Laptop</SelectItem>
                    <SelectItem value="Phone">Phone</SelectItem>
                    <SelectItem value="Tablet">Tablet</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Furniture">Furniture</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-avgPrice">{t('products.avgPrice')}</Label>
                  <Input
                    id="edit-avgPrice"
                    type="number"
                    placeholder="0"
                    value={formData.avgPrice}
                    onChange={(e) => setFormData({ ...formData, avgPrice: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-minPrice">{t('products.minPrice')}</Label>
                  <Input
                    id="edit-minPrice"
                    type="number"
                    placeholder="0"
                    value={formData.minPrice}
                    onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-maxPrice">{t('products.maxPrice')}</Label>
                  <Input
                    id="edit-maxPrice"
                    type="number"
                    placeholder="0"
                    value={formData.maxPrice}
                    onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-demand">{t('products.demand')}</Label>
                <Select value={formData.demand} onValueChange={(val) => setFormData({ ...formData, demand: val })}>
                  <SelectTrigger id="edit-demand">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">{t('products.high')}</SelectItem>
                    <SelectItem value="medium">{t('products.medium')}</SelectItem>
                    <SelectItem value="low">{t('products.low')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleUpdateProduct}>
                {t('common.save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
