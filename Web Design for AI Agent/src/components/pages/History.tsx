import { useState } from 'react';
import { Calendar, Download, Filter, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface HistoryProps {
  posts: any[];
}

export function History({ posts }: HistoryProps) {
  const [filterType, setFilterType] = useState('all');
  const [selectedPost, setSelectedPost] = useState<any>(null);

  const filteredPosts = filterType === 'all' 
    ? posts 
    : posts.filter(p => p.type.toLowerCase() === filterType);

  return (
    <main className="flex-1 overflow-auto">
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900">Analysis History</h1>
            <p className="text-gray-500">View and export historical analysis data</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Date Range
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Analyzed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">{posts.length}</div>
              <p className="text-gray-500 text-sm">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Buying Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">
                {posts.filter(p => p.type === 'Buying').length}
              </div>
              <p className="text-gray-500 text-sm">
                {posts.length > 0 
                  ? `${((posts.filter(p => p.type === 'Buying').length / posts.length) * 100).toFixed(1)}%` 
                  : '0%'} of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Selling Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">
                {posts.filter(p => p.type === 'Selling').length}
              </div>
              <p className="text-gray-500 text-sm">
                {posts.length > 0 
                  ? `${((posts.filter(p => p.type === 'Selling').length / posts.length) * 100).toFixed(1)}%` 
                  : '0%'} of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Avg. Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">
                {posts.length > 0
                  ? `${(posts.reduce((acc, p) => acc + parseFloat(p.confidence), 0) / posts.length).toFixed(1)}%`
                  : '0%'}
              </div>
              <p className="text-gray-500 text-sm">Across all posts</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Analysis Records</CardTitle>
                <CardDescription>Complete history of analyzed posts</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="buying">Buying</SelectItem>
                    <SelectItem value="selling">Selling</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">No history records found</div>
                <div className="text-gray-400 text-sm">Analyzed posts will appear here</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="text-sm">
                          <div>{post.date}</div>
                          <div className="text-gray-500">{post.time}</div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate">{post.content}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={post.type === 'Buying' ? 'default' : 'secondary'}>
                          {post.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{post.platform}</TableCell>
                      <TableCell>{post.location}</TableCell>
                      <TableCell>{post.price.toLocaleString()} đ</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-green-500 h-full"
                              style={{ width: post.confidence }}
                            />
                          </div>
                          <span className="text-sm">{post.confidence}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedPost(post)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Post Details</DialogTitle>
                              <DialogDescription>
                                Complete analysis information
                              </DialogDescription>
                            </DialogHeader>
                            {selectedPost && (
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-gray-600">Full Content</Label>
                                  <div className="mt-1 p-4 bg-gray-50 rounded-lg">
                                    {selectedPost.fullContent}
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-gray-600">Type</Label>
                                    <div className="mt-1">
                                      <Badge variant={selectedPost.type === 'Buying' ? 'default' : 'secondary'}>
                                        {selectedPost.type}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-gray-600">Platform</Label>
                                    <div className="mt-1">{selectedPost.platform}</div>
                                  </div>
                                  <div>
                                    <Label className="text-gray-600">Author</Label>
                                    <div className="mt-1">{selectedPost.author}</div>
                                  </div>
                                  <div>
                                    <Label className="text-gray-600">Confidence</Label>
                                    <div className="mt-1">{selectedPost.confidence}</div>
                                  </div>
                                  <div>
                                    <Label className="text-gray-600">Price</Label>
                                    <div className="mt-1">{selectedPost.price.toLocaleString()} đ</div>
                                  </div>
                                  <div>
                                    <Label className="text-gray-600">Location</Label>
                                    <div className="mt-1">{selectedPost.location}</div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
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
