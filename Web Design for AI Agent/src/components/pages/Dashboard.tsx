import { MetricsCards } from '../MetricsCards';
import { AIPostAnalyzer } from '../AIPostAnalyzer';
import { FilteredPostsTable } from '../FilteredPostsTable';
import { Search, SlidersHorizontal, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface DashboardProps {
  posts: any[];
  onAnalyze: (data: any) => void;
}

export function Dashboard({ posts, onAnalyze }: DashboardProps) {
  return (
    <main className="flex-1 overflow-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900">AI Content Analysis Dashboard</h1>
            <p className="text-gray-500">Real-time buying and selling demand filtering</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search posts..." 
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="icon">
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-8">
        <MetricsCards posts={posts} />
        
        <div className="grid grid-cols-5 gap-6 mt-8">
          <div className="col-span-2">
            <AIPostAnalyzer onAnalyze={onAnalyze} />
          </div>
          
          <div className="col-span-3">
            <FilteredPostsTable posts={posts} />
          </div>
        </div>
      </div>
    </main>
  );
}
