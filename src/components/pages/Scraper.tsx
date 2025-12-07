import { useState, useEffect } from 'react';
import { Search, Play, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useLanguage } from '../../contexts/LanguageContext';
import { getToken } from '../../utils/api';

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
  const [feedUrl, setFeedUrl] = useState(''); // không còn dùng nhưng giữ để tránh breaking cũ
  const [scrollCount, setScrollCount] = useState(10); // không còn dùng nhưng giữ để tránh breaking cũ
  const [mode, setMode] = useState<'search' | 'feed'>('search');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [groupLocation, setGroupLocation] = useState<string>('');
  const [savedGroups, setSavedGroups] = useState<any[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [isLoadingSavedGroups, setIsLoadingSavedGroups] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const scraperUrl = getScraperUrl();

  // Kiểm tra trạng thái server khi component mount và load danh sách nhóm đã lưu
  useEffect(() => {
    checkServerStatus();
    loadSavedGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const loadSavedGroups = async () => {
    setIsLoadingSavedGroups(true);
    try {
      const token = getToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${getApiUrl()}/groups`, {
        headers,
      });
      const data = await res.json();

      if (data.success) {
        setSavedGroups(data.groups || []);
      }
    } catch (err) {
      console.error('Không thể tải danh sách nhóm đã lưu:', err);
    } finally {
      setIsLoadingSavedGroups(false);
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
        // Sau khi quét nhóm, reload danh sách nhóm đã lưu cho feed mode
        loadSavedGroups();
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
    if (!email || selectedGroupIds.length === 0) {
      setStatus('error');
      setMessage('Vui lòng nhập email và chọn ít nhất 1 nhóm để quét feed');
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setMessage('Đang quét feed các nhóm đã chọn và phân tích với AI...');

    try {
      const token = getToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const res = await fetch(`${scraperUrl}/scrape-groups-feed`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, groupIds: selectedGroupIds })
      });
      const data = await res.json();

      if (data.ok) {
        setResults(data.matched || []);
        
        const savedInfo = data.saved 
          ? `\n✅ Đã lưu: ${data.saved.posts} bài đăng, ${data.saved.leads} khách hàng tiềm năng` 
          : '';
        
        setStatus('success');
        setMessage(
          `Tìm thấy ${data.matched?.length || 0} bài viết từ ${selectedGroupIds.length} nhóm đã chọn!${savedInfo}`
        );
        
        if (data.saved?.posts > 0 && onNavigateToPosts) {
          setTimeout(() => onNavigateToPosts(), 2500);
        }
      } else {
        setStatus('error');
        setMessage(data.error || 'Lỗi khi quét feed các nhóm');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Không thể kết nối đến server (quét feed nhóm)');
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
            <span>{message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Login Card */}
          <Card>
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
          <Card>
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
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
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
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 hover:border-gray-300'
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
            <Card className="lg:col-span-2">
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
                  <Label>{t('scraper.groupLinkLabel')}</Label>
                  <Input
                    placeholder="https://www.facebook.com/groups/123456"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('scraper.keywordsLabel')}</Label>
                  <Textarea
                    placeholder="iphone 15 pro max&#10;macbook m3&#10;samsung s24"
                    rows={4}
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Địa điểm (tùy chọn)</Label>
                  <Input
                    placeholder="VD: Hà Nội, TP.HCM, Đà Nẵng..."
                    value={groupLocation}
                    onChange={(e) => setGroupLocation(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Nếu nhập địa điểm, hệ thống sẽ ưu tiên tìm các nhóm liên quan tới khu vực đó (bằng cách cộng thêm địa điểm vào từ khóa tìm kiếm).
                  </p>
                </div>
                <div className="pt-2 space-y-3">
                  <Button 
                    onClick={handleSearch} 
                    disabled={isLoading || serverStatus === 'offline'}
                    className="w-full h-12 text-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {t('scraper.searchButtonLoading')}
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-2" />
                        {t('scraper.searchButtonIdle')}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSearchGroups}
                    disabled={isLoading || serverStatus === 'offline'}
                    className="w-full"
                  >
                    🔍 Quét danh sách hội nhóm theo từ khóa
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feed Mode */}
          {mode === 'feed' && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">📰</span>
                  {t('scraper.step2FeedTitle')}
                </CardTitle>
                <CardDescription>
                  Chọn các nhóm đã quét để cào feed. Mỗi nhóm sẽ được cuộn 5 lần.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Danh sách nhóm đã lưu</Label>
                  {isLoadingSavedGroups ? (
                    <p className="text-sm text-gray-500">Đang tải danh sách nhóm...</p>
                  ) : savedGroups.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Chưa có nhóm nào trong hệ thống. Hãy dùng chức năng "Quét danh sách hội nhóm theo từ khóa" hoặc thêm nhóm thủ công ở trang "Nhóm đã quét".
                    </p>
                  ) : (
                    <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-2">
                      {savedGroups.map((g: any) => {
                        const checked = selectedGroupIds.includes(g._id);
                        return (
                          <label
                            key={g._id}
                            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${
                              checked ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4"
                              checked={checked}
                              onChange={(e) => {
                                setSelectedGroupIds((prev) =>
                                  e.target.checked ? [...prev, g._id] : prev.filter((id) => id !== g._id)
                                );
                              }}
                            />
                            <div className="min-w-0">
                              <p className="font-medium text-sm text-gray-900 truncate">{g.name}</p>
                              <p className="text-xs text-gray-500 truncate">{g.url}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                  <div className="flex justify-end mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadSavedGroups}
                      disabled={isLoadingSavedGroups}
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Làm mới danh sách nhóm
                    </Button>
                  </div>
                </div>
                <div className="pt-2">
                  <Button 
                    onClick={handleScrapeFeed} 
                    disabled={isLoading || serverStatus === 'offline' || selectedGroupIds.length === 0}
                    className="w-full h-12 text-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
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
                </div>
              </CardContent>
            </Card>
          )}

          {/* Group Results từ search */}
          {groups.length > 0 && (
            <Card className="lg:col-span-2">
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
            <Card className="lg:col-span-2">
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
    </main>
  );
}
