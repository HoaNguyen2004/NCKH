import React, { useState, useEffect, useMemo } from 'react';
import { Search, Play, Loader2, CheckCircle, AlertCircle, RefreshCw, Users, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useLanguage } from '../../contexts/LanguageContext';
import { getToken } from '../../utils/api';

interface ScraperProps {
  onNavigateToPosts?: () => void;
}

interface SavedGroup {
  _id: string;
  name: string;
  url: string;
  keywords?: string[];
  location?: string;
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
  const [scrollCount, setScrollCount] = useState(10);
  const [mode, setMode] = useState<'search' | 'feed'>('search');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [groupLocation, setGroupLocation] = useState<string>('');
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const scraperUrl = getScraperUrl();

  // State cho popup chọn nhóm đã quét
  const [showGroupSelector, setShowGroupSelector] = useState(false);
  const [savedGroups, setSavedGroups] = useState<SavedGroup[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [groupSelectorPage, setGroupSelectorPage] = useState(1);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [scrapePriority, setScrapePriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const groupsPerPage = 10;

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

  // Lấy danh sách nhóm đã quét từ database
  const fetchSavedGroups = async () => {
    setIsLoadingGroups(true);
    try {
      const token = getToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${getApiUrl()}/groups`, { headers });
      const data = await res.json();

      if (data.success && data.groups) {
        setSavedGroups(data.groups);
      } else if (Array.isArray(data)) {
        setSavedGroups(data);
      }
    } catch (err) {
      console.error('Error fetching saved groups:', err);
    }
    setIsLoadingGroups(false);
  };

  // Mở popup chọn nhóm
  const handleOpenGroupSelector = () => {
    fetchSavedGroups();
    setShowGroupSelector(true);
    setGroupSelectorPage(1);
    setSelectedGroupIds([]);
    setGroupSearchQuery('');
  };

  // Toggle chọn nhóm
  const handleToggleGroup = (groupId: string) => {
    setSelectedGroupIds(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  // Chọn tất cả nhóm trong trang hiện tại
  const handleSelectAllInPage = () => {
    const pageGroupIds = paginatedGroups.map(g => g._id);
    
    const allSelected = pageGroupIds.every(id => selectedGroupIds.includes(id));
    
    if (allSelected) {
      setSelectedGroupIds(prev => prev.filter(id => !pageGroupIds.includes(id)));
    } else {
      setSelectedGroupIds(prev => [...new Set([...prev, ...pageGroupIds])]);
    }
  };

  // Áp dụng nhóm đã chọn
  const handleApplySelectedGroups = () => {
    const selectedUrls = savedGroups
      .filter(g => selectedGroupIds.includes(g._id))
      .map(g => g.url)
      .join('\n');
    
    if (selectedUrls) {
      setFeedUrl(selectedUrls);
    }
    setShowGroupSelector(false);
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
    setMessage('Đang quét dữ liệu và phân tích với AI...');

    try {
      const token = getToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const res = await fetch(`${scraperUrl}/scrape-filter`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, url, keywordsText: keywords })
      });
      const data = await res.json();

      if (data.ok) {
        setResults(data.matched || []);
        
        // Hiển thị kết quả đã lưu
        const savedInfo = data.saved 
          ? `\n✅ Đã lưu: ${data.saved.posts} bài đăng, ${data.saved.leads} khách hàng tiềm năng` 
          : '';
        
        setStatus('success');
        setMessage(`Tìm thấy ${data.matched?.length || 0} bài viết!${savedInfo}`);
        
        // Tự động chuyển sang trang bài đăng sau 2 giây
        if (data.saved?.posts > 0 && onNavigateToPosts) {
          setTimeout(() => onNavigateToPosts(), 2500);
        }
      } else {
        setStatus('error');
        setMessage(data.error || 'Lỗi khi quét dữ liệu');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Không thể kết nối đến server');
    }

    setIsLoading(false);
  };

  const handleSearchGroups = async () => {
    if (!email || !keywords) {
      setStatus('error');
      setMessage('Vui lòng nhập email và từ khóa');
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setMessage('Đang quét danh sách hội nhóm liên quan tới từ khóa...');

    try {
      const token = getToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${scraperUrl}/scrape-groups`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, keywordsText: keywords, location: groupLocation })
      });
      const data = await res.json();

      if (data.ok) {
        setGroups(data.groups || []);
        setStatus('success');
        setMessage(`Tìm thấy ${data.groups?.length || 0} hội nhóm liên quan tới từ khóa`);
      } else {
        setStatus('error');
        setMessage(data.error || 'Lỗi khi quét danh sách hội nhóm');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Không thể kết nối đến server (quét hội nhóm)');
    }

    setIsLoading(false);
  };

  const handleScrapeFeed = async () => {
    if (!email || !feedUrl) {
      setStatus('error');
      setMessage('Vui lòng điền đầy đủ thông tin (email và link feed)');
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    
    // Xử lý nhiều links nếu có
    const urls = feedUrl.split('\n').map(u => u.trim()).filter(u => u);
    setMessage(`Đang quét ${urls.length} feed với mức độ ưu tiên ${scrapePriority === 'high' ? 'Cao' : scrapePriority === 'medium' ? 'Trung bình' : 'Thấp'}...`);

    try {
      const token = getToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      let totalMatched: any[] = [];
      let totalSaved = { posts: 0, leads: 0 };

      // Quét từng URL
      for (const singleUrl of urls) {
        const res = await fetch(`${scraperUrl}/scrape-feed`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ 
            email, 
            feedUrl: singleUrl, 
            scrollCount,
            priority: scrapePriority 
          })
        });
        const data = await res.json();

        if (data.ok) {
          totalMatched = [...totalMatched, ...(data.matched || [])];
          if (data.saved) {
            totalSaved.posts += data.saved.posts || 0;
            totalSaved.leads += data.saved.leads || 0;
          }
        }
      }

      setResults(totalMatched);
      
      const savedInfo = totalSaved.posts > 0
        ? `\n✅ Đã lưu: ${totalSaved.posts} bài đăng, ${totalSaved.leads} khách hàng tiềm năng` 
        : '';
      
      setStatus('success');
      setMessage(`Tìm thấy ${totalMatched.length} bài viết từ ${urls.length} nhóm!${savedInfo}`);
      
      if (totalSaved.posts > 0 && onNavigateToPosts) {
        setTimeout(() => onNavigateToPosts(), 2500);
      }
    } catch (err) {
      setStatus('error');
      setMessage('Không thể kết nối đến server');
    }

    setIsLoading(false);
  };

  // Lọc nhóm theo từ khóa tìm kiếm
  const filteredSavedGroups = useMemo(() => {
    if (!groupSearchQuery.trim()) return savedGroups;
    const query = groupSearchQuery.toLowerCase().trim();
    return savedGroups.filter(group => 
      group.name.toLowerCase().includes(query) ||
      group.url.toLowerCase().includes(query) ||
      (group.keywords && group.keywords.some(kw => kw.toLowerCase().includes(query)))
    );
  }, [savedGroups, groupSearchQuery]);

  // Tính toán phân trang cho popup nhóm
  const totalGroupPages = Math.ceil(filteredSavedGroups.length / groupsPerPage);
  const paginatedGroups = filteredSavedGroups.slice(
    (groupSelectorPage - 1) * groupsPerPage,
    groupSelectorPage * groupsPerPage
  );

  return (
    <main className="flex-1 overflow-auto">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('sidebar.scraper')}</h1>
            <p className="text-gray-600">{t('scraper.subtitle')}</p>
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
              {serverStatus === 'online' ? t('scraper.serverOnline') :
               serverStatus === 'offline' ? t('scraper.serverOffline') :
               t('scraper.serverChecking')}
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
                <p className="font-medium">{t('scraper.offlineTitle')}</p>
                <p className="text-sm">
                  {t('scraper.offlineDesc')}{' '}
                  <code className="bg-amber-100 px-2 py-1 rounded">cd server && npm start</code>
                </p>
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
            <span className="whitespace-pre-line">{message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Login Card */}
          <Card className="border-2 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🔐</span>
                {t('scraper.step1Title')}
              </CardTitle>
              <CardDescription>
                {t('scraper.step1Desc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('scraper.emailLabel')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-2"
                />
              </div>
              <Button 
                onClick={handleLogin} 
                disabled={isLoading || serverStatus === 'offline'}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {t('scraper.loginButton')}
              </Button>
            </CardContent>
          </Card>

          {/* Mode Selection */}
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">⚙️</span>
                {t('scraper.modeTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setMode('search')}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    mode === 'search' 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  <div className="text-2xl mb-2">🔍</div>
                  <div className="font-semibold">{t('scraper.searchModeTitle')}</div>
                  <div className="text-sm text-gray-500">{t('scraper.searchModeDesc')}</div>
                </button>
                <button
                  onClick={() => setMode('feed')}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    mode === 'feed' 
                      ? 'border-orange-500 bg-orange-50 shadow-md' 
                      : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
                  }`}
                >
                  <div className="text-2xl mb-2">📰</div>
                  <div className="font-semibold">{t('scraper.feedModeTitle')}</div>
                  <div className="text-sm text-gray-500">{t('scraper.feedModeDesc')}</div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Search Mode */}
          {mode === 'search' && (
            <Card className="lg:col-span-2 border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  {t('scraper.step2SearchTitle')}
                </CardTitle>
                <CardDescription>
                  {t('scraper.step2SearchDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('scraper.keywordsLabel')}</Label>
                  <Textarea
                    placeholder="iphone 15 pro max&#10;macbook m3&#10;samsung s24"
                    rows={4}
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Địa điểm (tùy chọn)</Label>
                  <Input
                    placeholder="VD: Hà Nội, TP.HCM, Đà Nẵng..."
                    value={groupLocation}
                    onChange={(e) => setGroupLocation(e.target.value)}
                    className="border-2"
                  />
                  <p className="text-xs text-gray-500">
                    Nếu nhập địa điểm, hệ thống sẽ ưu tiên tìm các nhóm liên quan tới khu vực đó.
                  </p>
                </div>
                <div className="pt-2 space-y-3">
                  <Button
                    variant="outline"
                    onClick={handleSearchGroups}
                    disabled={isLoading || serverStatus === 'offline'}
                    className="w-full h-12 text-lg border-2 border-blue-300 hover:bg-blue-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Đang quét...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-2" />
                        🔍 Quét danh sách hội nhóm theo từ khóa
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feed Mode */}
          {mode === 'feed' && (
            <Card className="lg:col-span-2 border-2 border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">📰</span>
                  {t('scraper.step2FeedTitle')}
                </CardTitle>
                <CardDescription>
                  {t('scraper.step2FeedDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Nhập URL nhóm hoặc chọn từ danh sách */}
                <div className="space-y-2">
                  <Label>Link nhóm Facebook (hoặc chọn từ danh sách đã quét)</Label>
                  <Textarea
                    placeholder="https://www.facebook.com/groups/123456789&#10;https://www.facebook.com/groups/987654321&#10;(Mỗi link 1 dòng)"
                    rows={3}
                    value={feedUrl}
                    onChange={(e) => setFeedUrl(e.target.value)}
                    className="border-2"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleOpenGroupSelector}
                      className="flex-1 h-10 border-2 border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Chọn từ nhóm đã quét ({savedGroups.length > 0 ? savedGroups.length : '...'})
                    </Button>
                    {feedUrl && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setFeedUrl('')}
                        className="h-10 px-3 text-gray-500 hover:text-red-500 hover:border-red-300"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Xóa
                      </Button>
                    )}
                  </div>
                  {feedUrl && (
                    <p className="text-xs text-green-600">
                      ✓ Đã chọn {feedUrl.split('\n').filter(u => u.trim()).length} nhóm
                    </p>
                  )}
                </div>

                {/* Mức độ ưu tiên */}
                <div className="space-y-2">
                  <Label>Mức độ ưu tiên quét</Label>
                  <Select value={scrapePriority} onValueChange={(v) => setScrapePriority(v as any)}>
                    <SelectTrigger className="border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                          Cao - Quét kỹ, nhiều bài hơn
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                          Trung bình - Cân bằng
                        </div>
                      </SelectItem>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          Thấp - Nhanh, ít bài hơn
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('scraper.scrollLabel')}: {scrollCount}</Label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={scrollCount}
                    onChange={(e) => setScrollCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{t('scraper.scrollMin')}</span>
                    <span>{t('scraper.scrollMax')}</span>
                  </div>
                </div>
                <div className="pt-2">
                  <Button 
                    onClick={handleScrapeFeed} 
                    disabled={isLoading || serverStatus === 'offline'}
                    className="w-full h-12 text-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {t('scraper.feedButtonLoading')}
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        {t('scraper.feedButtonIdle')}
                      </>
                    )}
                  </Button>
                  {!feedUrl && (
                    <p className="text-xs text-amber-600 mt-2 text-center">
                      ⚠️ Vui lòng nhập link nhóm hoặc chọn từ danh sách đã quét
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Group Results */}
          {groups.length > 0 && (
            <Card className="lg:col-span-2 border-2 border-indigo-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">👥</span>
                  Danh sách hội nhóm liên quan tới từ khóa ({groups.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {groups.map((group, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {group.name}
                        </p>
                        {group.keywords && group.keywords.length > 0 && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            Từ khóa: {group.keywords.join(', ')}
                          </p>
                        )}
                      </div>
                      {group.url && (
                        <a
                          href={group.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline ml-4 shrink-0"
                        >
                          Mở nhóm
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Post Results */}
          {results.length > 0 && (
            <Card className="lg:col-span-2 border-2 border-emerald-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-xl">📊</span>
                    Kết quả: {results.length} bài viết (đã tự động lưu)
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge className="bg-green-100 text-green-700">
                      {results.filter(r => r.type === 'Buying').length} Mua
                    </Badge>
                    <Badge className="bg-orange-100 text-orange-700">
                      {results.filter(r => r.type === 'Selling').length} Bán
                    </Badge>
                  </div>
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
                            <Badge 
                              className={item.type === 'Buying' 
                                ? 'bg-green-100 text-green-700' 
                                : item.type === 'Selling' 
                                ? 'bg-orange-100 text-orange-700' 
                                : 'bg-gray-100 text-gray-700'
                              }
                            >
                              {item.type === 'Buying' ? '🛒 Mua' : item.type === 'Selling' ? '💰 Bán' : '❓ Khác'}
                            </Badge>
                            <Badge variant="outline">{item.category || item.keyword}</Badge>
                            <Badge variant="secondary" className="text-xs">
                              {item.confidence || 50}% tin cậy
                            </Badge>
                          </div>
                          <h4 className="font-medium text-gray-900 truncate">
                            {item.title || item.fullText?.substring(0, 60) + '...'}
                          </h4>
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {item.fullText?.substring(0, 150)}...
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            {(item.estimatedPrice || item.price) && (
                              <span className="text-red-600 font-semibold">
                                {item.estimatedPrice 
                                  ? `~${item.estimatedPrice.toLocaleString()}đ` 
                                  : item.price
                                }
                              </span>
                            )}
                            {item.author && (
                              <span className="text-xs text-gray-400">👤 {item.author}</span>
                            )}
                          </div>
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

      {/* Dialog chọn nhóm đã quét */}
      <Dialog open={showGroupSelector} onOpenChange={setShowGroupSelector}>
        <DialogContent className="w-[95vw] max-w-[95vw] h-[90vh] max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Chọn nhóm đã quét
            </DialogTitle>
            <DialogDescription>
              Chọn các nhóm bạn muốn quét feed. Có thể chọn nhiều nhóm cùng lúc.
            </DialogDescription>
          </DialogHeader>

          {isLoadingGroups ? (
            <div className="flex items-center justify-center flex-1">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : savedGroups.length === 0 ? (
            <div className="text-center flex-1 flex flex-col items-center justify-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Chưa có nhóm nào được quét</p>
              <p className="text-sm text-gray-400">Hãy quét nhóm từ Search Mode trước</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden px-6 py-4">
              {/* Thanh tìm kiếm */}
              <div className="flex items-center gap-4 mb-4 shrink-0">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm nhóm theo tên, URL hoặc từ khóa..."
                    value={groupSearchQuery}
                    onChange={(e) => {
                      setGroupSearchQuery(e.target.value);
                      setGroupSelectorPage(1);
                    }}
                    className="pl-10 border-2"
                  />
                </div>
                <Badge variant="secondary" className="shrink-0 px-3 py-1.5">
                  Tìm thấy: {filteredSavedGroups.length} nhóm
                </Badge>
              </div>

              {/* Header với nút chọn tất cả */}
              <div className="flex items-center justify-between py-2 border-b shrink-0">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={paginatedGroups.length > 0 && paginatedGroups.every(g => selectedGroupIds.includes(g._id))}
                    onCheckedChange={handleSelectAllInPage}
                  />
                  <span className="text-sm text-gray-600">
                    Chọn tất cả trang này ({paginatedGroups.length})
                  </span>
                </div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  Đã chọn: {selectedGroupIds.length}/{savedGroups.length}
                </Badge>
              </div>

              {/* Danh sách nhóm - chia 2 cột 50:50 */}
              <div className="flex-1 overflow-y-auto py-3">
                {filteredSavedGroups.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">Không tìm thấy nhóm nào phù hợp</p>
                    <p className="text-sm text-gray-400">Thử từ khóa khác</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {paginatedGroups.map((group) => (
                      <div
                        key={group._id}
                        className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedGroupIds.includes(group._id) 
                            ? 'bg-purple-50 border-purple-400 shadow-sm' 
                            : 'hover:bg-gray-50 hover:border-gray-300'
                        }`}
                        onClick={() => handleToggleGroup(group._id)}
                      >
                        <Checkbox 
                          checked={selectedGroupIds.includes(group._id)}
                          onCheckedChange={() => handleToggleGroup(group._id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate text-sm">{group.name}</p>
                          <p className="text-xs text-gray-500 truncate">{group.url}</p>
                          {group.keywords && group.keywords.length > 0 && (
                            <div className="flex gap-1 mt-1.5 flex-wrap">
                              {group.keywords.slice(0, 3).map((kw, i) => (
                                <Badge key={i} variant="outline" className="text-xs py-0 px-1.5">
                                  {kw}
                                </Badge>
                              ))}
                              {group.keywords.length > 3 && (
                                <Badge variant="outline" className="text-xs py-0 px-1.5 bg-gray-50">
                                  +{group.keywords.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Phân trang */}
              {totalGroupPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t shrink-0">
                  <div className="text-sm text-gray-600">
                    Trang {groupSelectorPage}/{totalGroupPages} • {filteredSavedGroups.length} nhóm
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setGroupSelectorPage(p => Math.max(1, p - 1))}
                      disabled={groupSelectorPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="px-3 py-1 bg-gray-100 rounded text-sm font-medium">
                      {groupSelectorPage}/{totalGroupPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setGroupSelectorPage(p => Math.min(totalGroupPages, p + 1))}
                      disabled={groupSelectorPage === totalGroupPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="px-6 py-4 border-t shrink-0 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowGroupSelector(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleApplySelectedGroups}
              disabled={selectedGroupIds.length === 0}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Users className="w-4 h-4 mr-2" />
              Áp dụng ({selectedGroupIds.length} nhóm)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
