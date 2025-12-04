import { RefreshCw, Clock } from 'lucide-react';
import { Button } from './ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Badge } from './ui/badge';

interface FilteredPostsTableProps {
  posts: any[];
}

export function FilteredPostsTable({ posts }: FilteredPostsTableProps) {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-gray-900">Filtered Posts</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Clock className="w-4 h-4" />
            <span>Last updated: 2 minutes ago</span>
          </div>
          <Button variant="outline" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">No posts found</div>
          <div className="text-gray-400 text-sm">Try adjusting your search criteria or filters</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Content</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="max-w-xs">
                    <div className="truncate">{post.content}</div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={post.type === 'Buying' ? 'default' : 'secondary'}
                    >
                      {post.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{post.platform}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-green-500 h-full"
                          style={{ width: post.confidence }}
                        />
                      </div>
                      <span className="text-sm">{post.confidence}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-500">{post.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
