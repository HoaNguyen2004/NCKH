import { useState, useMemo } from 'react';
import { Search, Eye, Trash2, Archive, Wifi, WifiOff, ExternalLink, RefreshCw, UserPlus, Phone, MapPin, DollarSign, FileText, Tag } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
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
import { ScrollArea } from '../ui/scroll-area';
import { getToken } from '../../utils/api';

interface PostsManagementProps {
  posts: any[];
  socketConnected?: boolean;
  onRefresh?: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function PostsManagement({ posts, socketConnected = false, onRefresh }: PostsManagementProps) {
  const [filterType, setFilterType] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State cho dialog thêm khách hàng tiềm năng
  const [showAddLeadDialog, setShowAddLeadDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [leadFormData, setLeadFormData] = useState({
    name: '',
    phone: '',
    email: '',
    zalo: '',
    location: '',
    interest: '',
    type: 'Buying',
    budget: '',
    priority: 'medium',
    source: 'Facebook',
    notes: '',
    postUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Tính số bài đăng hôm nay
  const todayPostsCount = useMemo(() => {
    const today = new Date().toLocaleDateString('vi-VN');
    const todayPosts = posts.filter(p => {
      const postDate = p.date || new Date().toLocaleDateString('vi-VN');
      return postDate === today;
    });
    return todayPosts.length;
  }, [posts]);

  // Lọc bài viết
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const typeMatch = filterType === 'all' || post.type?.toLowerCase() === filterType;
      const platformMatch = filterPlatform === 'all' || post.platform?.toLowerCase() === filterPlatform.toLowerCase();
      const searchMatch = !searchQuery || 
        post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.category?.toLowerCase().includes(searchQuery.toLowerCase());
      return typeMatch && platformMatch && searchMatch;
    });
  }, [posts, filterType, filterPlatform, searchQuery]);

  // Hàm trích xuất số điện thoại từ nội dung
  const extractPhoneNumber = (content: string): string => {
    if (!content) return '';
    const phoneMatch = content.match(/(?:0|\+84|84)[\s.-]?\d{2,3}[\s.-]?\d{3}[\s.-]?\d{3,4}/);
    return phoneMatch ? phoneMatch[0].replace(/[\s.-]/g, '') : '';
  };

  // Hàm mở dialog thêm khách hàng tiềm năng
  const handleOpenAddLeadDialog = (post: any) => {
    setSelectedPost(post);
    const fullContent = post.fullContent || post.content || '';
    const extractedPhone = extractPhoneNumber(fullContent);
    
    setLeadFormData({
      name: post.author || '',
      phone: extractedPhone,
      email: '',
      zalo: extractedPhone, // Thường Zalo = SĐT
      location: post.location || 'Việt Nam',
      interest: post.category || '',
      type: post.type === 'Buying' ? 'Buying' : 'Selling',
      budget: post.price ? `${post.price.toLocaleString()}đ` : '',
      priority: 'medium',
      source: post.platform || 'Facebook',
      notes: fullContent.substring(0, 500),
      postUrl: post.url || ''
    });
    setSubmitMessage(null);
    setShowAddLeadDialog(true);
  };

  // Hàm submit thêm khách hàng tiềm năng
  const handleSubmitLead = async () => {
    if (!leadFormData.name.trim()) {
      setSubmitMessage({ type: 'error', text: 'Vui lòng nhập tên khách hàng' });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          ...leadFormData,
          status: 'new',
          postId: selectedPost?.id
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitMessage({ type: 'success', text: 'Đã thêm khách hàng tiềm năng thành công!' });
        setTimeout(() => {
          setShowAddLeadDialog(false);
          setSelectedPost(null);
        }, 1500);
      } else {
        setSubmitMessage({ type: 'error', text: data.message || 'Lỗi khi thêm khách hàng' });
      }
    } catch (error: any) {
      console.error('Error adding lead:', error);
      setSubmitMessage({ type: 'error', text: 'Không thể kết nối đến server' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 overflow-auto">
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900 flex items-center gap-2">
              Quản lý bài đăng
              {/* Real-time status indicator */}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                socketConnected 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {socketConnected ? (
                  <>
                    <Wifi className="w-3 h-3" />
                    Real-time
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3" />
                    Offline
                  </>
                )}
              </span>
            </h1>
            <p className="text-gray-500">Xem và quản lý tất cả bài đăng đã thu thập • Cập nhật tự động khi có dữ liệu mới</p>
          </div>
          {onRefresh && (
            <Button 
              variant="outline"
              onClick={onRefresh}
              title="Làm mới danh sách"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Làm mới
            </Button>
          )}
        </div>
      </header>

      <div className="p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-6 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-700">Tổng bài đăng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{posts.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-700">Mua</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">
                {posts.filter(p => p.type === 'Buying').length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-orange-700">Bán</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">
                {posts.filter(p => p.type === 'Selling').length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-purple-700">Facebook</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">
                {posts.filter(p => p.platform === 'Facebook').length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-pink-700">Hôm nay</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-pink-900">{todayPostsCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Posts Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Danh sách bài đăng ({filteredPosts.length})</CardTitle>
              <div className="flex items-center gap-3">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="buying">Mua</SelectItem>
                    <SelectItem value="selling">Bán</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                  </SelectContent>
                </Select>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    placeholder="Tìm kiếm..." 
                    className="pl-10 w-64" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <div className="text-gray-400 mb-2">Không có bài đăng</div>
                <div className="text-gray-400 text-sm mb-4">Bài đăng sẽ hiển thị ở đây sau khi quét từ trang "Quét dữ liệu"</div>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Nội dung</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Danh mục</TableHead>
                      <TableHead>Nền tảng</TableHead>
                      <TableHead>Tác giả</TableHead>
                      <TableHead>Giá</TableHead>
                      <TableHead>Độ tin cậy</TableHead>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPosts.map((post) => (
                      <TableRow key={post.id} className="hover:bg-gray-50">
                        <TableCell className="max-w-[250px]">
                          <div className="truncate font-medium" title={post.fullContent || post.content}>
                            {post.content}
                          </div>
                          {post.url && (
                            <a 
                              href={post.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Xem bài gốc
                            </a>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={post.type === 'Buying' ? 'default' : 'secondary'}
                            className={post.type === 'Buying' 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            }
                          >
                            {post.type === 'Buying' ? 'Mua' : post.type === 'Selling' ? 'Bán' : 'Khác'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{post.category || 'Khác'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {post.platform}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-700">{post.author}</TableCell>
                        <TableCell className="font-medium text-red-600">
                          {post.price ? `${post.price.toLocaleString()}đ` : '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-12 bg-gray-200 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-green-500 h-full"
                                style={{ width: typeof post.confidence === 'string' ? post.confidence : `${post.confidence}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600">{post.confidence}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600 text-xs">
                          <div>{post.date}</div>
                          <div>{post.time}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleOpenAddLeadDialog(post)}
                              title="Thêm vào khách hàng tiềm năng"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <UserPlus className="w-4 h-4" />
                            </Button>
                            {post.url && (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => window.open(post.url, '_blank')}
                                title="Xem bài viết gốc"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" title="Lưu trữ">
                              <Archive className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Xóa">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog thêm khách hàng tiềm năng */}
      <Dialog open={showAddLeadDialog} onOpenChange={setShowAddLeadDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-green-600" />
              Thêm khách hàng tiềm năng
            </DialogTitle>
            <DialogDescription>
              Thông tin được trích xuất từ bài đăng. Bạn có thể chỉnh sửa trước khi lưu.
            </DialogDescription>
          </DialogHeader>

          {/* Thông tin bài đăng gốc */}
          {selectedPost && (
            <div className="bg-gray-50 rounded-lg p-3 mb-2 border">
              <div className="flex items-start gap-2 text-sm">
                <FileText className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      className={selectedPost.type === 'Buying' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700'
                      }
                    >
                      {selectedPost.type === 'Buying' ? '🛒 Người mua' : '💰 Người bán'}
                    </Badge>
                    <Badge variant="outline">{selectedPost.category || 'Khác'}</Badge>
                  </div>
                  <p className="text-gray-600 line-clamp-2">{selectedPost.fullContent || selectedPost.content}</p>
                  {selectedPost.url && (
                    <a 
                      href={selectedPost.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-xs flex items-center gap-1 mt-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Xem bài gốc
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          <ScrollArea className="flex-1 pr-4">
            <div className="grid gap-4 py-2">
              {/* Tên và Loại */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lead-name" className="flex items-center gap-1">
                    <span className="text-red-500">*</span> Tên khách hàng
                  </Label>
                  <Input
                    id="lead-name"
                    placeholder="Nhập tên khách hàng"
                    value={leadFormData.name}
                    onChange={(e) => setLeadFormData({ ...leadFormData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lead-type" className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> Loại khách hàng
                  </Label>
                  <Select 
                    value={leadFormData.type} 
                    onValueChange={(val) => setLeadFormData({ ...leadFormData, type: val })}
                  >
                    <SelectTrigger id="lead-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Buying">🛒 Người mua</SelectItem>
                      <SelectItem value="Selling">💰 Người bán</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Điện thoại và Zalo */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lead-phone" className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> Số điện thoại
                  </Label>
                  <Input
                    id="lead-phone"
                    placeholder="0123456789"
                    value={leadFormData.phone}
                    onChange={(e) => setLeadFormData({ ...leadFormData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lead-zalo">Zalo</Label>
                  <Input
                    id="lead-zalo"
                    placeholder="Số Zalo"
                    value={leadFormData.zalo}
                    onChange={(e) => setLeadFormData({ ...leadFormData, zalo: e.target.value })}
                  />
                </div>
              </div>

              {/* Email và Địa điểm */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lead-email">Email</Label>
                  <Input
                    id="lead-email"
                    type="email"
                    placeholder="email@example.com"
                    value={leadFormData.email}
                    onChange={(e) => setLeadFormData({ ...leadFormData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lead-location" className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> Địa điểm
                  </Label>
                  <Input
                    id="lead-location"
                    placeholder="Hà Nội, TP.HCM..."
                    value={leadFormData.location}
                    onChange={(e) => setLeadFormData({ ...leadFormData, location: e.target.value })}
                  />
                </div>
              </div>

              {/* Sản phẩm quan tâm và Ngân sách */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lead-interest">Sản phẩm quan tâm</Label>
                  <Input
                    id="lead-interest"
                    placeholder="iPhone, Laptop..."
                    value={leadFormData.interest}
                    onChange={(e) => setLeadFormData({ ...leadFormData, interest: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lead-budget" className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" /> Ngân sách / Giá
                  </Label>
                  <Input
                    id="lead-budget"
                    placeholder="5-10 triệu"
                    value={leadFormData.budget}
                    onChange={(e) => setLeadFormData({ ...leadFormData, budget: e.target.value })}
                  />
                </div>
              </div>

              {/* Ưu tiên và Nguồn */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lead-priority">Mức độ ưu tiên</Label>
                  <Select 
                    value={leadFormData.priority} 
                    onValueChange={(val) => setLeadFormData({ ...leadFormData, priority: val })}
                  >
                    <SelectTrigger id="lead-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">🔴 Cao</SelectItem>
                      <SelectItem value="medium">🟡 Trung bình</SelectItem>
                      <SelectItem value="low">🟢 Thấp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lead-source">Nguồn</Label>
                  <Select 
                    value={leadFormData.source} 
                    onValueChange={(val) => setLeadFormData({ ...leadFormData, source: val })}
                  >
                    <SelectTrigger id="lead-source">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="Zalo">Zalo</SelectItem>
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="Other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Ghi chú */}
              <div className="space-y-2">
                <Label htmlFor="lead-notes">Ghi chú (nội dung bài đăng)</Label>
                <Textarea
                  id="lead-notes"
                  placeholder="Ghi chú thêm về khách hàng..."
                  value={leadFormData.notes}
                  onChange={(e) => setLeadFormData({ ...leadFormData, notes: e.target.value })}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
          </ScrollArea>

          {/* Thông báo */}
          {submitMessage && (
            <div className={`p-3 rounded-lg text-sm ${
              submitMessage.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {submitMessage.text}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setShowAddLeadDialog(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button 
              onClick={handleSubmitLead}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Đang lưu...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Thêm khách hàng
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
