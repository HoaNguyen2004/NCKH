import { useState, useEffect } from 'react';
import { Search, Play, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useLanguage } from '../../contexts/LanguageContext';

interface ScraperProps {
  onNavigateToPosts?: () => void;
}

// Lấy URL API - tất cả đều dùng chung 1 server
const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

// Scraper API cũng dùng chung server
const getScraperUrl = () => {
  return `${getApiUrl()}/scraper`;
};

export function Scraper({ onNavigateToPosts }: ScraperProps) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [url, setUrl] = useState('');
  const [keywords, setKeywords] = useState('');
  const [feedUrl, setFeedUrl] = useState('');
  const [feedKeywords, setFeedKeywords] = useState('');
  const [scrollCount, setScrollCount] = useState(10);
  const [mode, setMode] = useState<'search' | 'feed'>('search');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const scraperUrl = getScraperUrl();

  // Kiểm tra trạng thái server khi component mount
  useEffect(() => {
    checkServerStatus();
  }, [scraperUrl]);

  const checkServerStatus = async () => {
    setServerStatus('checking');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const res = await fetch(`${scraperUrl}/health`, {
        signal: controller.signal
      }).catch(() => null);
      
      clearTimeout(timeoutId);
      
      if (res && res.ok) {
        setServerStatus('online');
      } else {
        setServerStatus('offline');
      }
    } catch {
      setServerStatus('offline');
    }
  };

  const handleLogin = async () => {
    if (!email) {
      setStatus('error');
      setMessage('Vui lòng nhập email Facebook');
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setMessage('Đang mở Chrome để đăng nhập...');

    try {
      const res = await fetch(`${scraperUrl}/init-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (data.ok) {
        setStatus('success');
        setMessage(data.message || 'Đăng nhập thành công!');
      } else {
        setStatus('error');
        setMessage(data.error || 'Lỗi đăng nhập');
      }
    } catch (err) {
      setStatus('error');
      setMessage(`Không thể kết nối đến scraper server (${scraperUrl}). Hãy kiểm tra server đang chạy.`);
    }

    setIsLoading(false);
  };

  const handleSearch = async () => {
    if (!email || !url || !keywords) {
      setStatus('error');
      setMessage('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setMessage('Đang quét dữ liệu...');

    try {
      const res = await fetch(`${scraperUrl}/scrape-filter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, url, keywordsText: keywords })
      });
      const data = await res.json();

      if (data.ok) {
        setStatus('success');
        setMessage(`Tìm thấy ${data.matched?.length || 0} bài viết khớp từ khóa!`);
        setResults(data.matched || []);
      } else {
        setStatus('error');
        setMessage(data.error || 'Lỗi khi quét dữ liệu');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Không thể kết nối đến scraper server');
    }

    setIsLoading(false);
  };

  const handleScrapeFeed = async () => {
    if (!email || !feedUrl || !feedKeywords) {
      setStatus('error');
      setMessage('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setMessage('Đang quét feed...');

    try {
      const res = await fetch(`${scraperUrl}/scrape-feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, feedUrl, keywordsText: feedKeywords, scrollCount })
      });
      const data = await res.json();

      if (data.ok) {
        setStatus('success');
        setMessage(`Tìm thấy ${data.matched?.length || 0} bài viết khớp từ khóa!`);
        setResults(data.matched || []);
      } else {
        setStatus('error');
        setMessage(data.error || 'Lỗi khi quét feed');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Không thể kết nối đến scraper server');
    }

    setIsLoading(false);
  };

  const sendToDatabase = async () => {
    if (results.length === 0) {
      setStatus('error');
      setMessage('Chưa có dữ liệu để gửi');
      return;
    }

    setIsLoading(true);
    setMessage('Đang gửi dữ liệu lên server...');

    try {
      const response = await fetch(`${getApiUrl()}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: results })
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(`Đã thêm ${data.added} bài viết vào database!`);
        if (onNavigateToPosts) {
          setTimeout(() => onNavigateToPosts(), 1500);
        }
      } else {
        setStatus('error');
        setMessage(data.message || 'Lỗi khi lưu dữ liệu');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Không thể kết nối đến backend server');
    }

    setIsLoading(false);
  };

  return (
    <main className="flex-1 overflow-auto">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('sidebar.scraper')}</h1>
            <p className="text-gray-600">Thu thập dữ liệu từ Facebook Groups và Marketplace</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Server Status */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
              serverStatus === 'online' ? 'bg-green-100 text-green-700' :
              serverStatus === 'offline' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                serverStatus === 'online' ? 'bg-green-500' :
                serverStatus === 'offline' ? 'bg-red-500' :
                'bg-yellow-500 animate-pulse'
              }`} />
              {serverStatus === 'online' ? 'Server Online' :
               serverStatus === 'offline' ? 'Server Offline' :
               'Đang kiểm tra...'}
            </div>
            <Button variant="outline" onClick={checkServerStatus}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Offline Warning */}
        {serverStatus === 'offline' && (
          <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <div>
                <p className="font-medium">Backend server không hoạt động</p>
                <p className="text-sm">Hãy chạy backend server trước khi sử dụng tính năng này: <code className="bg-amber-100 px-2 py-1 rounded">cd server && npm start</code></p>
              </div>
            </div>
          </div>
        )}

        {/* Status Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            status === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            status === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {status === 'success' && <CheckCircle className="w-5 h-5" />}
            {status === 'error' && <AlertCircle className="w-5 h-5" />}
            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            <span>{message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Login Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🔐</span>
                Bước 1: Đăng nhập Facebook
              </CardTitle>
              <CardDescription>
                Đăng nhập để lưu cookie và sử dụng cho việc quét dữ liệu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Facebook</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleLogin} 
                disabled={isLoading || serverStatus === 'offline'}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Đăng nhập & Lưu Cookie
              </Button>
            </CardContent>
          </Card>

          {/* Mode Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">⚙️</span>
                Chọn chế độ quét
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setMode('search')}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    mode === 'search' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">🔍</div>
                  <div className="font-semibold">Search Mode</div>
                  <div className="text-sm text-gray-500">Tìm theo từ khóa</div>
                </button>
                <button
                  onClick={() => setMode('feed')}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    mode === 'feed' 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">📰</div>
                  <div className="font-semibold">Feed Mode</div>
                  <div className="text-sm text-gray-500">Cào feed + lọc</div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Search Mode */}
          {mode === 'search' && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Bước 2: Quét theo Search
                </CardTitle>
                <CardDescription>
                  Nhập link Group/Marketplace và từ khóa để tìm kiếm
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Link Group hoặc Marketplace</Label>
                  <Input
                    placeholder="https://www.facebook.com/groups/123456"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Từ khóa (mỗi dòng 1 từ khóa)</Label>
                  <Textarea
                    placeholder="iphone 15 pro max&#10;macbook m3&#10;samsung s24"
                    rows={4}
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleSearch} 
                  disabled={isLoading || serverStatus === 'offline'}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                  Bắt đầu quét
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Feed Mode */}
          {mode === 'feed' && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">📰</span>
                  Bước 2: Cào Feed + Lọc từ khóa
                </CardTitle>
                <CardDescription>
                  Vào trang feed và cuộn để load bài viết, sau đó lọc theo từ khóa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Link Feed</Label>
                  <Input
                    placeholder="https://www.facebook.com/groups/123456"
                    value={feedUrl}
                    onChange={(e) => setFeedUrl(e.target.value)}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setFeedUrl('https://www.facebook.com')}
                    >
                      🏠 Newsfeed
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setFeedUrl('https://www.facebook.com/groups/feed')}
                    >
                      👥 Tất cả Groups
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Từ khóa lọc (mỗi dòng 1 từ khóa)</Label>
                  <Textarea
                    placeholder="iphone 15 pro max&#10;macbook m3&#10;samsung s24"
                    rows={4}
                    value={feedKeywords}
                    onChange={(e) => setFeedKeywords(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Số lần cuộn trang: {scrollCount}</Label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={scrollCount}
                    onChange={(e) => setScrollCount(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>5 (Nhanh)</span>
                    <span>30 (Nhiều)</span>
                  </div>
                </div>
                <Button 
                  onClick={handleScrapeFeed} 
                  disabled={isLoading || serverStatus === 'offline'}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                  Bắt đầu cào Feed
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {results.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-xl">📊</span>
                    Kết quả: {results.length} bài viết
                  </CardTitle>
                  <Button onClick={sendToDatabase} disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Gửi về Bài đăng
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {results.slice(0, 10).map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start gap-4">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt="" 
                            className="w-20 h-20 object-cover rounded-lg"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary">{item.type || 'group'}</Badge>
                            <Badge variant="outline">{item.keyword}</Badge>
                          </div>
                          <h4 className="font-medium text-gray-900 truncate">
                            {item.title || item.fullText?.substring(0, 60) + '...'}
                          </h4>
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {item.fullText?.substring(0, 150)}...
                          </p>
                          {item.price && (
                            <p className="text-red-600 font-semibold mt-1">{item.price}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {results.length > 10 && (
                    <p className="text-center text-gray-500 py-2">
                      ... và {results.length - 10} bài viết khác
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
