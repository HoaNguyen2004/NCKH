import { useState } from 'react';
import { Send, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface AIPostAnalyzerProps {
  onAnalyze: (data: any) => void;
}

export function AIPostAnalyzer({ onAnalyze }: AIPostAnalyzerProps) {
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [platform, setPlatform] = useState('');

  const handleAnalyze = () => {
    if (content.trim()) {
      onAnalyze({ content, author, platform });
      setContent('');
      setAuthor('');
      setPlatform('');
    }
  };

  const handleLoadDemo = () => {
    const demoContent = 'Cần mua laptop Dell cũ, giá khoảng 5-7 triệu, khu vực Hà Nội. Liên hệ: 0912345678';
    setContent(demoContent);
    setAuthor('demo_user');
    setPlatform('facebook');
  };

  const handleClear = () => {
    setContent('');
    setAuthor('');
    setPlatform('');
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-gray-900">AI Post Analyzer</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Post Content</label>
          <Textarea
            placeholder="Enter the social media post content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-32 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Author</label>
            <Input
              placeholder="Username"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Platform</label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={handleAnalyze} 
            className="flex-1"
            disabled={!content.trim()}
          >
            <Send className="w-4 h-4 mr-2" />
            Analyze Post
          </Button>
          <Button 
            variant="outline" 
            onClick={handleClear}
          >
            Clear
          </Button>
        </div>

        <Button 
          variant="outline" 
          className="w-full"
          onClick={handleLoadDemo}
        >
          <Zap className="w-4 h-4 mr-2" />
          Load Demo Data
        </Button>
      </div>
    </div>
  );
}
