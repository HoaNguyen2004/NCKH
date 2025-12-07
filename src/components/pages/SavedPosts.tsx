import { useState } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit2, 
  Star, 
  StarOff, 
  Filter, 
  Download, 
  Upload,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Tag,
  Calendar,
  User,
  DollarSign,
  MessageSquare,
  MoreVertical,
  CheckCircle,
  Clock,
  Archive
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Checkbox } from '../ui/checkbox';
import { useLanguage } from '../../contexts/LanguageContext';

interface SavedPost {
  id: string;
  content: string;
  fullContent?: string;
  author: string;
  platform: string;
  type: 'Buying' | 'Selling' | 'Other';
  category: string;
  price?: number;
  url?: string;
  savedAt: string;
  savedBy: string;
  status: 'new' | 'processing' | 'contacted' | 'completed' | 'archived';
  starred: boolean;
  notes?: string;
  tags?: string[];
}

// Mock data cho giao diện
const mockSavedPosts: SavedPost[] = [
  {
    id: '1',
    content: 'Cần mua iPhone 15 Pro Max 256GB màu đen, giá tốt inbox',
    fullContent: 'Cần mua iPhone 15 Pro Max 256GB màu đen, giá tốt inbox. Ưu tiên máy còn bảo hành Apple. Liên hệ Zalo 0901234567',
    author: 'Nguyễn Văn A',
    platform: 'Facebook',
    type: 'Buying',
    category: 'Điện thoại',
    price: 28000000,
    url: 'https://facebook.com/post/123',
    savedAt: '2024-01-15 14:30',
    savedBy: 'admin',
    status: 'new',
    starred: true,
    notes: 'Khách hàng tiềm năng, cần liên hệ sớm',
    tags: ['hot', 'iphone', 'urgent']
  },
  {
    id: '2',
    content: 'Bán MacBook Pro M3 14 inch mới 100% fullbox',
    fullContent: 'Bán MacBook Pro M3 14 inch mới 100% fullbox, RAM 18GB, SSD 512GB. Giá 45tr. Ship COD toàn quốc.',
    author: 'Trần Thị B',
    platform: 'Facebook',
    type: 'Selling',
    category: 'Laptop',
    price: 45000000,
    url: 'https://facebook.com/post/456',
    savedAt: '2024-01-15 10:15',
    savedBy: 'sales1',
    status: 'contacted',
    starred: false,
    tags: ['macbook', 'apple']
  },
  {
    id: '3',
    content: 'Tìm mua Samsung S24 Ultra cũ giá rẻ',
    author: 'Lê Văn C',
    platform: 'Zalo',
    type: 'Buying',
    category: 'Điện thoại',
    savedAt: '2024-01-14 16:45',
    savedBy: 'sales2',
    status: 'processing',
    starred: false,
    tags: ['samsung']
  },
];

export function SavedPosts() {
  const { t } = useLanguage();
  
  // State quản lý
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>(mockSavedPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  
  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 15;
  
  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState<SavedPost | null>(null);
  
  // Form state cho thêm mới
  const [newPostForm, setNewPostForm] = useState({
    content: '',
    author: '',
    platform: 'Facebook',
    type: 'Buying' as 'Buying' | 'Selling' | 'Other',
    category: '',
    price: '',
    url: '',
    notes: '',
    tags: ''
  });

  // Lọc bài đăng
  const filteredPosts = savedPosts.filter(post => {
    const typeMatch = filterType === 'all' || post.type === filterType;
    const statusMatch = filterStatus === 'all' || post.status === filterStatus;
    const platformMatch = filterPlatform === 'all' || post.platform.toLowerCase() === filterPlatform.toLowerCase();
    const searchMatch = !searchQuery || 
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return typeMatch && statusMatch && platformMatch && searchMatch;
  });

  // Phân trang
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

  // Handlers
  const handleToggleStar = (id: string) => {
    setSavedPosts(posts => 
      posts.map(p => p.id === id ? { ...p, starred: !p.starred } : p)
    );
  };

  const handleDeletePost = (id: string) => {
    setSavedPosts(posts => posts.filter(p => p.id !== id));
  };

  const handleBulkDelete = () => {
    setSavedPosts(posts => posts.filter(p => !selectedPosts.includes(p.id)));
    setSelectedPosts([]);
  };

  const handleSelectAll = () => {
    if (selectedPosts.length === currentPosts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(currentPosts.map(p => p.id));
    }
  };

  const handleAddPost = () => {
    // TODO: Gọi API để lưu bài đăng mới
    const newPost: SavedPost = {
      id: Date.now().toString(),
      content: newPostForm.content,
      author: newPostForm.author,
      platform: newPostForm.platform,
      type: newPostForm.type,
      category: newPostForm.category,
      price: newPostForm.price ? parseInt(newPostForm.price) : undefined,
      url: newPostForm.url,
      savedAt: new Date().toLocaleString('vi-VN'),
      savedBy: 'current_user',
      status: 'new',
      starred: false,
      notes: newPostForm.notes,
      tags: newPostForm.tags.split(',').map(t => t.trim()).filter(t => t)
    };
    setSavedPosts([newPost, ...savedPosts]);
    setShowAddDialog(false);
    setNewPostForm({
      content: '',
      author: '',
      platform: 'Facebook',
      type: 'Buying',
      category: '',
      price: '',
      url: '',
      notes: '',
      tags: ''
    });
  };

  const handleUpdateStatus = (id: string, status: SavedPost['status']) => {
    setSavedPosts(posts =>
      posts.map(p => p.id === id ? { ...p, status } : p)
    );
  };

  const getStatusBadge = (status: SavedPost['status']) => {
    const statusConfig = {
      new: { label: 'Mới', className: 'bg-blue-100 text-blue-700' },
      processing: { label: 'Đang xử lý', className: 'bg-yellow-100 text-yellow-700' },
      contacted: { label: 'Đã liên hệ', className: 'bg-purple-100 text-purple-700' },
      completed: { label: 'Hoàn thành', className: 'bg-green-100 text-green-700' },
      archived: { label: 'Lưu trữ', className: 'bg-gray-100 text-gray-700' },
    };
    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <main className="flex-1 overflow-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Archive className="w-6 h-6" />
              Bài đăng đã lưu (Lọc tay)
            </h1>
            <p className="text-gray-500">Quản lý các bài đăng đã được lọc và lưu thủ công</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Xuất Excel
            </Button>
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Nhập dữ liệu
            </Button>
            <Button 
              onClick={() => setShowAddDialog(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm bài đăng
            </Button>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-700">Tổng đã lưu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{savedPosts.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-yellow-700">Đánh dấu sao</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-900">
                {savedPosts.filter(p => p.starred).length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-700">Người mua</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">
                {savedPosts.filter(p => p.type === 'Buying').length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-orange-700">Người bán</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">
                {savedPosts.filter(p => p.type === 'Selling').length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-purple-700">Đã hoàn thành</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">
                {savedPosts.filter(p => p.status === 'completed').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm nội dung, tác giả, danh mục..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  <SelectItem value="Buying">Mua</SelectItem>
                  <SelectItem value="Selling">Bán</SelectItem>
                  <SelectItem value="Other">Khác</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="new">Mới</SelectItem>
                  <SelectItem value="processing">Đang xử lý</SelectItem>
                  <SelectItem value="contacted">Đã liên hệ</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="archived">Lưu trữ</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Nền tảng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="zalo">Zalo</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>

              {selectedPosts.length > 0 && (
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa ({selectedPosts.length})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Posts Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Danh sách bài đăng ({filteredPosts.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <Archive className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <div className="text-gray-400 mb-2">Chưa có bài đăng nào được lưu</div>
                <Button onClick={() => setShowAddDialog(true)} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm bài đăng đầu tiên
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox 
                            checked={selectedPosts.length === currentPosts.length && currentPosts.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead className="w-12"></TableHead>
                        <TableHead className="min-w-[250px]">Nội dung</TableHead>
                        <TableHead>Loại</TableHead>
                        <TableHead>Danh mục</TableHead>
                        <TableHead>Nền tảng</TableHead>
                        <TableHead>Tác giả</TableHead>
                        <TableHead>Giá</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Ngày lưu</TableHead>
                        <TableHead className="w-20">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentPosts.map((post) => (
                        <TableRow key={post.id} className="hover:bg-gray-50">
                          <TableCell>
                            <Checkbox 
                              checked={selectedPosts.includes(post.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedPosts([...selectedPosts, post.id]);
                                } else {
                                  setSelectedPosts(selectedPosts.filter(id => id !== post.id));
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleStar(post.id)}
                              className={post.starred ? 'text-yellow-500' : 'text-gray-300'}
                            >
                              {post.starred ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                            </Button>
                          </TableCell>
                          <TableCell className="min-w-[250px] max-w-[350px]">
                            <div 
                              className="truncate font-medium cursor-pointer hover:text-blue-600"
                              onClick={() => {
                                setSelectedPost(post);
                                setShowDetailDialog(true);
                              }}
                              title={post.fullContent || post.content}
                            >
                              {post.content}
                            </div>
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {post.tags.slice(0, 3).map((tag, i) => (
                                  <Badge key={i} variant="outline" className="text-xs py-0">
                                    {tag}
                                  </Badge>
                                ))}
                                {post.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs py-0">
                                    +{post.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={post.type === 'Buying' 
                                ? 'bg-green-100 text-green-700' 
                                : post.type === 'Selling'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-gray-100 text-gray-700'
                              }
                            >
                              {post.type === 'Buying' ? 'Mua' : post.type === 'Selling' ? 'Bán' : 'Khác'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{post.category || '—'}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {post.platform}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{post.author}</TableCell>
                          <TableCell className="font-medium text-red-600 whitespace-nowrap">
                            {post.price ? `${post.price.toLocaleString()}đ` : '—'}
                          </TableCell>
                          <TableCell>{getStatusBadge(post.status)}</TableCell>
                          <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                            {post.savedAt}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setSelectedPost(post);
                                  setShowDetailDialog(true);
                                }}>
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  Xem chi tiết
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedPost(post);
                                  setShowEditDialog(true);
                                }}>
                                  <Edit2 className="w-4 h-4 mr-2" />
                                  Chỉnh sửa
                                </DropdownMenuItem>
                                {post.url && (
                                  <DropdownMenuItem onClick={() => window.open(post.url, '_blank')}>
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Xem bài gốc
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateStatus(post.id, 'processing')}
                                  disabled={post.status === 'processing'}
                                >
                                  <Clock className="w-4 h-4 mr-2" />
                                  Đánh dấu đang xử lý
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateStatus(post.id, 'contacted')}
                                  disabled={post.status === 'contacted'}
                                >
                                  <User className="w-4 h-4 mr-2" />
                                  Đánh dấu đã liên hệ
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateStatus(post.id, 'completed')}
                                  disabled={post.status === 'completed'}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Đánh dấu hoàn thành
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeletePost(post.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Phân trang */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      Hiển thị {startIndex + 1} - {Math.min(startIndex + postsPerPage, filteredPosts.length)} trong tổng số {filteredPosts.length} bài
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Trước
                      </Button>
                      <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-md">
                        <span className="font-medium">{currentPage}</span>
                        <span className="text-gray-500">/</span>
                        <span className="text-gray-600">{totalPages}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Sau
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog thêm bài đăng mới */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-600" />
              Thêm bài đăng thủ công
            </DialogTitle>
            <DialogDescription>
              Nhập thông tin bài đăng bạn muốn lưu để theo dõi
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="content">Nội dung bài đăng *</Label>
              <Textarea
                id="content"
                placeholder="Nhập nội dung bài đăng..."
                value={newPostForm.content}
                onChange={(e) => setNewPostForm({ ...newPostForm, content: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author">Tác giả</Label>
                <Input
                  id="author"
                  placeholder="Tên người đăng"
                  value={newPostForm.author}
                  onChange={(e) => setNewPostForm({ ...newPostForm, author: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform">Nền tảng</Label>
                <Select 
                  value={newPostForm.platform} 
                  onValueChange={(v) => setNewPostForm({ ...newPostForm, platform: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="Zalo">Zalo</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Loại bài đăng</Label>
                <Select 
                  value={newPostForm.type} 
                  onValueChange={(v) => setNewPostForm({ ...newPostForm, type: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Buying">🛒 Mua</SelectItem>
                    <SelectItem value="Selling">💰 Bán</SelectItem>
                    <SelectItem value="Other">❓ Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Danh mục</Label>
                <Input
                  id="category"
                  placeholder="VD: Điện thoại, Laptop..."
                  value={newPostForm.category}
                  onChange={(e) => setNewPostForm({ ...newPostForm, category: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Giá (VNĐ)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="VD: 15000000"
                  value={newPostForm.price}
                  onChange={(e) => setNewPostForm({ ...newPostForm, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Link bài gốc</Label>
                <Input
                  id="url"
                  placeholder="https://..."
                  value={newPostForm.url}
                  onChange={(e) => setNewPostForm({ ...newPostForm, url: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (phân cách bằng dấu phẩy)</Label>
              <Input
                id="tags"
                placeholder="VD: iphone, urgent, hot"
                value={newPostForm.tags}
                onChange={(e) => setNewPostForm({ ...newPostForm, tags: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                placeholder="Ghi chú thêm về bài đăng này..."
                value={newPostForm.notes}
                onChange={(e) => setNewPostForm({ ...newPostForm, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddPost} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Thêm bài đăng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog xem chi tiết */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Chi tiết bài đăng
            </DialogTitle>
          </DialogHeader>

          {selectedPost && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge 
                  className={selectedPost.type === 'Buying' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-orange-100 text-orange-700'
                  }
                >
                  {selectedPost.type === 'Buying' ? '🛒 Mua' : '💰 Bán'}
                </Badge>
                <Badge variant="outline">{selectedPost.category}</Badge>
                <Badge variant="outline" className="bg-blue-50">{selectedPost.platform}</Badge>
                {getStatusBadge(selectedPost.status)}
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-800 whitespace-pre-wrap">
                  {selectedPost.fullContent || selectedPost.content}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{selectedPost.author}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{selectedPost.savedAt}</span>
                </div>
                {selectedPost.price && (
                  <div className="flex items-center gap-2 text-red-600 font-medium">
                    <DollarSign className="w-4 h-4" />
                    <span>{selectedPost.price.toLocaleString()}đ</span>
                  </div>
                )}
              </div>

              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-gray-400" />
                  {selectedPost.tags.map((tag, i) => (
                    <Badge key={i} variant="outline">{tag}</Badge>
                  ))}
                </div>
              )}

              {selectedPost.notes && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Ghi chú:</strong> {selectedPost.notes}
                  </p>
                </div>
              )}

              {selectedPost.url && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(selectedPost.url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Xem bài gốc
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}

