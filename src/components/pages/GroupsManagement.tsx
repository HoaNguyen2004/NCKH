import { useEffect, useState, useMemo } from 'react';
import { Users, Search as SearchIcon, Globe2, Trash2, Plus, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { getToken } from '../../utils/api';
import { useLanguage } from '../../contexts/LanguageContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Group {
  _id: string;
  name: string;
  url: string;
  location?: string;
  keywords?: string[];
  createdAt?: string;
}

export function GroupsManagement() {
  const { t } = useLanguage();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addEmail, setAddEmail] = useState('');
  const [addUrl, setAddUrl] = useState('');
  const [addName, setAddName] = useState('');
  const [addLocation, setAddLocation] = useState('');
  const [addKeywords, setAddKeywords] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [autoNameLoading, setAutoNameLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const token = getToken();
      const params = new URLSearchParams();
      if (search) params.append('q', search);

      const res = await fetch(`${API_URL}/groups?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.message || 'Lấy danh sách nhóm thất bại');
      }

      setGroups(data.groups || []);
    } catch (err: any) {
      console.error('Fetch groups error:', err);
      setErrorMessage(err?.message || 'Không thể tải danh sách nhóm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const filteredGroups = useMemo(() => {
    if (!search) return groups;
    const q = search.toLowerCase();
    return groups.filter((g) => {
      return (
        g.name.toLowerCase().includes(q) ||
        g.url.toLowerCase().includes(q) ||
        (g.location || '').toLowerCase().includes(q)
      );
    });
  }, [groups, search]);

  const handleDeleteGroup = async (id: string) => {
    if (!window.confirm(t('groups.deleteConfirm'))) return;

    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/groups/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.message || 'Xóa nhóm thất bại');
      }
      setGroups((prev) => prev.filter((g) => g._id !== id));
    } catch (err: any) {
      console.error('Delete group error:', err);
      alert(err?.message || 'Xóa nhóm thất bại');
    }
  };

  const handleFetchGroupName = async () => {
    if (!addEmail || !addUrl) {
      setErrorMessage('Vui lòng nhập email Facebook (đã login cookie) và URL nhóm');
      return;
    }

    try {
      setAutoNameLoading(true);
      setErrorMessage(null);

      const token = getToken();
      const res = await fetch(`${API_URL}/scraper/group-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ email: addEmail, url: addUrl }),
      });
      const data = await res.json();

      if (!data.ok) {
        throw new Error(data.error || 'Không lấy được tên nhóm');
      }

      setAddName(data.group?.name || '');
      setSuccessMessage('Đã lấy tên nhóm thành công');
    } catch (err: any) {
      console.error('Fetch group name error:', err);
      setErrorMessage(err?.message || 'Không lấy được tên nhóm');
    } finally {
      setAutoNameLoading(false);
    }
  };

  const handleSubmitAddGroup = async () => {
    if (!addName || !addUrl) {
      setErrorMessage('Vui lòng nhập đầy đủ Tên nhóm và URL');
      return;
    }

    try {
      setAddLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const token = getToken();
      const res = await fetch(`${API_URL}/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: addName,
          url: addUrl,
          location: addLocation,
          keywords: addKeywords
            ? addKeywords
                .split(/\r?\n|,/)
                .map((x) => x.trim())
                .filter(Boolean)
            : [],
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.message || 'Thêm nhóm thất bại');
      }

      setGroups((prev) => [data.group, ...prev]);
      setSuccessMessage('Đã thêm nhóm thành công');
      setTimeout(() => {
        setAddDialogOpen(false);
        setAddName('');
        setAddUrl('');
        setAddLocation('');
        setAddKeywords('');
        setAddEmail('');
        setSuccessMessage(null);
      }, 1000);
    } catch (err: any) {
      console.error('Add group error:', err);
      setErrorMessage(err?.message || 'Thêm nhóm thất bại');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <main className="flex-1 overflow-auto">
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              {t('groups.title')}
            </h1>
            <p className="text-gray-500">{t('groups.subtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={fetchGroups}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Làm mới
            </Button>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t('groups.addGroup')}
            </Button>
          </div>
        </div>
      </header>

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-700">
                {t('groups.totalGroups')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{groups.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>
                  {t('groups.title')} ({filteredGroups.length})
                </CardTitle>
                <CardDescription>
                  {t('groups.subtitle')}
                </CardDescription>
              </div>
              <div className="relative w-80">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder={t('groups.searchPlaceholder')}
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') fetchGroups();
                  }}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm">
                {errorMessage}
              </div>
            )}
            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,3fr)_minmax(0,2fr)_80px] bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500">
                <div>{t('groups.name')}</div>
                <div>{t('groups.url')}</div>
                <div>{t('groups.location')}</div>
                <div className="text-right">Actions</div>
              </div>
              <ScrollArea className="max-h-[480px]">
                {loading ? (
                  <div className="p-6 text-center text-gray-500 text-sm">
                    Đang tải danh sách nhóm...
                  </div>
                ) : filteredGroups.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-sm">
                    Chưa có nhóm nào. Hãy quét dữ liệu nhóm hoặc thêm thủ công.
                  </div>
                ) : (
                  <div>
                    {filteredGroups.map((g) => (
                      <div
                        key={g._id}
                        className="grid grid-cols-[minmax(0,3fr)_minmax(0,3fr)_minmax(0,2fr)_80px] px-4 py-2 text-sm border-t border-gray-100 items-center hover:bg-gray-50"
                      >
                        <div className="truncate flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span className="truncate" title={g.name}>
                            {g.name}
                          </span>
                        </div>
                        <div className="truncate flex items-center gap-2">
                          <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <a
                            href={g.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate text-blue-600 hover:underline"
                            title={g.url}
                          >
                            {g.url}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe2 className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <span className="truncate" title={g.location}>
                            {g.location || '—'}
                          </span>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteGroup(g._id)}
                            title="Xóa nhóm"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{t('groups.addGroup')}</DialogTitle>
            <DialogDescription>
              Nhập URL nhóm Facebook. Bạn có thể dùng email đã login cookie để tự động lấy tên nhóm.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="group-email">Email Facebook (đã dùng để login cookie)</Label>
              <Input
                id="group-email"
                placeholder="your@email.com"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Dùng email này để mở Facebook và tự động lấy tên nhóm từ URL.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-url">{t('groups.url')}</Label>
              <Input
                id="group-url"
                placeholder="https://www.facebook.com/groups/123456"
                value={addUrl}
                onChange={(e) => setAddUrl(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="group-name">{t('groups.name')}</Label>
                <Input
                  id="group-name"
                  placeholder="Tên nhóm"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="mt-7 whitespace-nowrap"
                onClick={handleFetchGroupName}
                disabled={autoNameLoading}
              >
                {autoNameLoading ? 'Đang lấy...' : t('groups.fetchName')}
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-location">{t('groups.location')}</Label>
              <Input
                id="group-location"
                placeholder="Hà Nội, TP.HCM..."
                value={addLocation}
                onChange={(e) => setAddLocation(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-keywords">{t('groups.keywords')} (mỗi dòng 1 từ khóa - tùy chọn)</Label>
              <textarea
                id="group-keywords"
                className="w-full border rounded-md px-3 py-2 text-sm min-h-[80px]"
                value={addKeywords}
                onChange={(e) => setAddKeywords(e.target.value)}
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="p-3 rounded-lg bg-green-50 text-green-700 border border-green-200 text-sm">
                {successMessage}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
              disabled={addLoading || autoNameLoading}
            >
              Hủy
            </Button>
            <Button onClick={handleSubmitAddGroup} disabled={addLoading}>
              {addLoading ? 'Đang lưu...' : 'Lưu nhóm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}


