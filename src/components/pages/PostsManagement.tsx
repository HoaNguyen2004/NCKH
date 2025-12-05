import { useState, useMemo } from 'react';
import { Search, Eye, Trash2, Archive, Wifi, WifiOff, ExternalLink, RefreshCw } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';

interface PostsManagementProps {
  posts: any[];
  socketConnected?: boolean;
  onRefresh?: () => void;
}

export function PostsManagement({ posts, socketConnected = false, onRefresh }: PostsManagementProps) {
  const [filterType, setFilterType] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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
    </main>
  );
}
