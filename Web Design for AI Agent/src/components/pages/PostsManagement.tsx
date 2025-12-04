import { useState } from 'react';
import { Search, Filter, Eye, Trash2, Archive } from 'lucide-react';
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

interface PostsManagementProps {
  posts: any[];
}

export function PostsManagement({ posts }: PostsManagementProps) {
  const [filterType, setFilterType] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');

  const filteredPosts = posts.filter(post => {
    const typeMatch = filterType === 'all' || post.type.toLowerCase() === filterType;
    const platformMatch = filterPlatform === 'all' || post.platform.toLowerCase() === filterPlatform.toLowerCase();
    return typeMatch && platformMatch;
  });

  return (
    <main className="flex-1 overflow-auto">
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900">Quản lý bài đăng</h1>
            <p className="text-gray-500">Xem và quản lý tất cả bài đăng đã thu thập</p>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-5 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Tổng bài đăng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">{posts.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mua</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">
                {posts.filter(p => p.type === 'Buying').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bán</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">
                {posts.filter(p => p.type === 'Selling').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Facebook</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">
                {posts.filter(p => p.platform === 'Facebook').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hôm nay</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">{posts.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Danh sách bài đăng</CardTitle>
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
                  <Input placeholder="Tìm kiếm..." className="pl-10 w-64" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">Không có bài đăng</div>
                <div className="text-gray-400 text-sm">Bài đăng sẽ hiển thị ở đây sau khi phân tích</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nội dung</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Nền tảng</TableHead>
                    <TableHead>Tác giả</TableHead>
                    <TableHead>Địa điểm</TableHead>
                    <TableHead>Giá</TableHead>
                    <TableHead>Độ tin cậy</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="max-w-xs">
                        <div className="truncate">{post.content}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={post.type === 'Buying' ? 'default' : 'secondary'}>
                          {post.type === 'Buying' ? 'Mua' : 'Bán'}
                        </Badge>
                      </TableCell>
                      <TableCell>{post.category}</TableCell>
                      <TableCell>{post.platform}</TableCell>
                      <TableCell>{post.author}</TableCell>
                      <TableCell>{post.location}</TableCell>
                      <TableCell>{post.price.toLocaleString()}đ</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-green-500 h-full"
                              style={{ width: post.confidence }}
                            />
                          </div>
                          <span className="text-sm">{post.confidence}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        <div>{post.date}</div>
                        <div>{post.time}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Archive className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
