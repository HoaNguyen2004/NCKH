import { useState, useEffect } from 'react';
import {
  UserPlus,
  Search,
  Phone,
  Mail,
  MapPin,
  Star,
  MessageSquare,
} from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { useLanguage } from '../../contexts/LanguageContext';

interface LeadsManagementProps {
  posts: any[];
  onNavigate?: (page: string, params?: any) => void;
}

export function LeadsManagement({ posts, onNavigate }: LeadsManagementProps) {
  const { t } = useLanguage();

  const [filterStatus, setFilterStatus] = useState('all');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [copiedLeadId, setCopiedLeadId] = useState<string | null>(null);

  const [leads, setLeads] = useState<any[]>([]);

  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    interest: '',
    type: 'Buying',
    budget: '',
    priority: 'medium',
    source: 'Facebook',
    notes: '',
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/leads');
      const data = await response.json();
      if (data.success && data.leads) {
        setLeads(data.leads);
      }
    } catch (err) {
      console.error('Lỗi khi tải khách hàng:', err);
    }
  };

  const handleAddLead = async () => {
    if (!formData.name) {
      alert('Vui lòng nhập tên khách hàng');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        alert('Thêm khách hàng thành công');
        setFormData({
          name: '',
          phone: '',
          email: '',
          location: '',
          interest: '',
          type: 'Buying',
          budget: '',
          priority: 'medium',
          source: 'Facebook',
          notes: '',
        });
        setShowDialog(false);
        fetchLeads();
      } else {
        alert(data.message || 'Lỗi khi thêm khách hàng');
      }
    } catch (err) {
      console.error('Lỗi:', err);
      alert('Lỗi khi thêm khách hàng');
    }
  };

  const handleEditLead = (lead: any) => {
    setEditingLeadId(lead._id);
    setFormData({
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      location: lead.location,
      interest: lead.interest,
      type: lead.type,
      budget: lead.budget,
      priority: lead.priority,
      source: lead.source,
      notes: lead.notes,
    });
    setShowEditDialog(true);
  };

  const handleUpdateLead = async () => {
    if (!formData.name) {
      alert('Vui lòng nhập tên khách hàng');
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/leads/${editingLeadId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      if (data.success) {
        alert('Cập nhật khách hàng thành công');
        setShowEditDialog(false);
        setEditingLeadId(null);
        fetchLeads();
      } else {
        alert(data.message || 'Lỗi khi cập nhật khách hàng');
      }
    } catch (err) {
      console.error('Lỗi:', err);
      alert('Lỗi khi cập nhật khách hàng');
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Bạn chắc chắn muốn xóa khách hàng này?')) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/leads/${leadId}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();
      if (data.success) {
        alert('Xóa khách hàng thành công');
        fetchLeads();
      } else {
        alert(data.message || 'Lỗi khi xóa khách hàng');
      }
    } catch (err) {
      console.error('Lỗi:', err);
      alert('Lỗi khi xóa khách hàng');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-700';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-700';
      case 'qualified':
        return 'bg-green-100 text-green-700';
      case 'lost':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new':
        return t('leads.status.new');
      case 'contacted':
        return t('leads.status.contacted');
      case 'qualified':
        return t('leads.status.qualified');
      case 'lost':
        return t('leads.status.lost');
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleCopyChatLink = async (leadId: string) => {
    try {
      const chatUrl = `${window.location.origin}?leadId=${leadId}`;
      await navigator.clipboard.writeText(chatUrl);
      setCopiedLeadId(leadId);
      setTimeout(() => setCopiedLeadId(null), 2000);
      alert(
        `Đã copy link chat: ${chatUrl}\n\nGửi link này cho khách hàng để họ có thể trò chuyện với bạn.`
      );
    } catch (err) {
      console.error('Lỗi khi copy link:', err);
      alert('Không thể copy link. Vui lòng thử lại.');
    }
  };

  const filteredLeads =
    filterStatus === 'all'
      ? leads
      : leads.filter((l) => l.status === filterStatus);

  return (
    <main className="flex-1 overflow-auto">
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900">{t('leads.title')}</h1>
            <p className="text-gray-500">{t('leads.subtitle')}</p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                {t('leads.addLead')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>{t('leads.addLead')}</DialogTitle>
                <DialogDescription>
                  Nhập thông tin khách hàng mới
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[400px] overflow-y-auto">
                <div className="grid gap-2">
                  <Label htmlFor="name">Tên khách hàng</Label>
                  <Input
                    id="name"
                    placeholder="Ví dụ: Nguyễn Văn A"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Điện thoại</Label>
                    <Input
                      id="phone"
                      placeholder="0123456789"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="khachhang@email.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Địa điểm</Label>
                  <Input
                    id="location"
                    placeholder="Ví dụ: Hà Nội"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="interest">Sản phẩm quan tâm</Label>
                  <Input
                    id="interest"
                    placeholder="Ví dụ: Laptop Dell"
                    value={formData.interest}
                    onChange={(e) =>
                      setFormData({ ...formData, interest: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Loại</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(val) =>
                        setFormData({ ...formData, type: val })
                      }
                    >
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Buying">Mua</SelectItem>
                        <SelectItem value="Selling">Bán</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Ưu tiên</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(val) =>
                        setFormData({ ...formData, priority: val })
                      }
                    >
                      <SelectTrigger id="priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">Cao</SelectItem>
                        <SelectItem value="medium">Trung bình</SelectItem>
                        <SelectItem value="low">Thấp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="budget">Ngân sách</Label>
                  <Input
                    id="budget"
                    placeholder="Ví dụ: 7-10 triệu"
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData({ ...formData, budget: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="source">Nguồn</Label>
                  <Select
                    value={formData.source}
                    onValueChange={(val) =>
                      setFormData({ ...formData, source: val })
                    }
                  >
                    <SelectTrigger id="source">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="Other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Ghi chú</Label>
                  <Input
                    id="notes"
                    placeholder="Thông tin thêm..."
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleAddLead}>
                  {t('leads.addLead')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('leads.totalLeads')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">{leads.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('leads.new')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">
                {leads.filter((l) => l.status === 'new').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('leads.highPotential')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">
                {leads.filter((l) => l.priority === 'high').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('leads.conversionRate')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">25%</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('leads.title')}</CardTitle>
              <div className="flex items-center gap-3">
                <Select
                  value={filterStatus}
                  onValueChange={setFilterStatus}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={t('common.status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    <SelectItem value="new">
                      {t('leads.status.new')}
                    </SelectItem>
                    <SelectItem value="contacted">
                      {t('leads.status.contacted')}
                    </SelectItem>
                    <SelectItem value="qualified">
                      {t('leads.status.qualified')}
                    </SelectItem>
                    <SelectItem value="lost">
                      {t('leads.status.lost')}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder={t('leads.filter.placeholder')}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('leads.table.priority')}</TableHead>
                  <TableHead>{t('leads.table.lead')}</TableHead>
                  <TableHead>{t('leads.table.contact')}</TableHead>
                  <TableHead>{t('leads.table.interest')}</TableHead>
                  <TableHead>{t('leads.table.type')}</TableHead>
                  <TableHead>{t('leads.table.budget')}</TableHead>
                  <TableHead>{t('leads.table.status')}</TableHead>
                  <TableHead>{t('leads.table.source')}</TableHead>
                  <TableHead>{t('leads.table.notes')}</TableHead>
                  <TableHead>{t('leads.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => {
                  const leadId = lead._id || lead.id;
                  return (
                    <TableRow key={leadId}>
                      <TableCell>
                        <Star
                          className={`w-5 h-5 ${getPriorityColor(
                            lead.priority
                          )} fill-current`}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-gray-900">{lead.name}</div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="w-3 h-3" />
                            {lead.location}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-3 h-3" />
                            {lead.phone}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-3 h-3" />
                            {lead.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{lead.interest}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            lead.type === 'Buying' ? 'default' : 'secondary'
                          }
                        >
                          {lead.type === 'Buying'
                            ? t('posts.buying')
                            : t('posts.selling')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {lead.budget}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(lead.status)}>
                          {getStatusLabel(lead.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {lead.source}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate text-sm text-gray-600">
                          {lead.notes}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              console.log(
                                '🔘 Chat button clicked for lead:',
                                leadId,
                                'Full lead:',
                                lead
                              );
                              if (!leadId) {
                                console.error(
                                  '❌ Lead ID is missing!',
                                  lead
                                );
                                alert(
                                  'Không tìm thấy ID khách hàng. Vui lòng thử lại.'
                                );
                                return;
                              }
                              if (onNavigate) {
                                console.log(
                                  '✅ onNavigate available, navigating to conversations with leadId:',
                                  leadId
                                );
                                onNavigate('conversations', { leadId });
                              } else {
                                console.warn(
                                  '⚠️ onNavigate not available, falling back to copy link'
                                );
                                handleCopyChatLink(leadId);
                              }
                            }}
                            title="Chuyển sang trang cuộc trò chuyện"
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Chat
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditLead(lead)}
                          >
                            {t('common.edit')}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              handleDeleteLead(leadId as string)
                            }
                          >
                            {t('common.delete')}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Lead Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>{t('common.edit')}</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin khách hàng
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[400px] overflow-y-auto">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Tên khách hàng</Label>
                <Input
                  id="edit-name"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-phone">Điện thoại</Label>
                  <Input
                    id="edit-phone"
                    placeholder="0123456789"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    placeholder="khachhang@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-location">Địa điểm</Label>
                <Input
                  id="edit-location"
                  placeholder="Ví dụ: Hà Nội"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-interest">Sản phẩm quan tâm</Label>
                <Input
                  id="edit-interest"
                  placeholder="Ví dụ: Laptop Dell"
                  value={formData.interest}
                  onChange={(e) =>
                    setFormData({ ...formData, interest: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-type">Loại</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(val) =>
                      setFormData({ ...formData, type: val })
                    }
                  >
                    <SelectTrigger id="edit-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Buying">Mua</SelectItem>
                      <SelectItem value="Selling">Bán</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-priority">Ưu tiên</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(val) =>
                      setFormData({ ...formData, priority: val })
                    }
                  >
                    <SelectTrigger id="edit-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Cao</SelectItem>
                      <SelectItem value="medium">Trung bình</SelectItem>
                      <SelectItem value="low">Thấp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-budget">Ngân sách</Label>
                <Input
                  id="edit-budget"
                  placeholder="Ví dụ: 7-10 triệu"
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData({ ...formData, budget: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-source">Nguồn</Label>
                <Select
                  value={formData.source}
                  onValueChange={(val) =>
                    setFormData({ ...formData, source: val })
                  }
                >
                  <SelectTrigger id="edit-source">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-notes">Ghi chú</Label>
                <Input
                  id="edit-notes"
                  placeholder="Thông tin thêm..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button onClick={handleUpdateLead}>{t('common.save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
