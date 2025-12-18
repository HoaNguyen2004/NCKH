import { useState, useEffect } from 'react';
import {
  UserPlus,
  Search,
  Phone,
  Mail,
  MapPin,
  Star,
  MessageSquare,
  Plus,
  Trash2,
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
import { getMe, getToken } from '../../utils/api';

interface LeadsManagementProps {
  posts: any[];
  onNavigate?: (page: string, params?: any) => void;
}

export function LeadsManagement({ posts, onNavigate }: LeadsManagementProps) {
  const { t } = useLanguage();

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
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

  // Sales log form data for edit dialog - array of entries
  const [salesLogEntries, setSalesLogEntries] = useState<Array<{
    caretaker: string;
    editTime: string;
    customerRequest: string;
    conclusion: string;
  }>>([]);
  
  // Current user info for auto-filling caretaker
  const [currentUser, setCurrentUser] = useState<{ fullName?: string; email?: string } | null>(null);

  useEffect(() => {
    fetchLeads();
    // Load current user info
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const result = await getMe();
      if (result.success && result.user) {
        setCurrentUser({
          fullName: result.user.fullName || result.user.name || '',
          email: result.user.email || '',
        });
      }
    } catch (err) {
      console.error('Error loading current user:', err);
    }
  };

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
    // Chỉ kiểm tra các trường bắt buộc: name, interest, type, priority, source
    // Trim để loại bỏ khoảng trắng thừa
    const name = (formData.name || '').trim();
    const interest = (formData.interest || '').trim();

    // Debug: log các giá trị để kiểm tra
    console.log('🔍 Validating form data:', {
      name: `"${name}"`,
      interest: `"${interest}"`,
      type: formData.type,
      priority: formData.priority,
      source: formData.source,
      nameEmpty: !name,
      interestEmpty: !interest,
      typeEmpty: !formData.type,
      priorityEmpty: !formData.priority,
      sourceEmpty: !formData.source
    });

    if (!name || !interest || !formData.type || !formData.priority || !formData.source) {
      const missingFields: string[] = [];
      if (!name) missingFields.push('Tên khách hàng');
      if (!interest) missingFields.push('Sản phẩm quan tâm');
      if (!formData.type) missingFields.push('Loại');
      if (!formData.priority) missingFields.push('Ưu tiên');
      if (!formData.source) missingFields.push('Nguồn');

      alert(`Vui lòng nhập đầy đủ thông tin bắt buộc (có dấu *)\n\nThiếu: ${missingFields.join(', ')}`);
      return;
    }

    try {
      // Chuẩn bị dữ liệu để gửi (trim các trường text)
      const dataToSend = {
        ...formData,
        name: (formData.name || '').trim(),
        interest: (formData.interest || '').trim(),
        phone: formData.phone || '',
        email: formData.email || '',
        location: formData.location || '',
      };

      console.log('📤 Sending data to backend:', dataToSend);

      const response = await fetch('http://localhost:5000/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();
      console.log('📥 Response from backend:', data);
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

  const handleEditLead = async (lead: any) => {
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
    
    // Load existing sales logs for this lead
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:5000/api/sales-logs?leadId=${lead._id}`, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      const data = await response.json();
      if (data.success && data.logs) {
        const formattedEntries = data.logs.map((log: any) => ({
          caretaker: log.caretaker || '',
          editTime: log.editTime ? new Date(log.editTime).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
          customerRequest: log.customerRequest || '',
          conclusion: log.conclusion || '',
        }));
        setSalesLogEntries(formattedEntries);
      } else {
        setSalesLogEntries([]);
      }
    } catch (err) {
      console.error('Error loading sales logs:', err);
      setSalesLogEntries([]);
    }
    
    setShowEditDialog(true);
  };

  const handleAddSalesLogEntry = () => {
    // Auto-fill caretaker with current user's name or email
    const caretakerName = currentUser?.fullName || currentUser?.email || '';
    
    setSalesLogEntries([
      ...salesLogEntries,
      {
        caretaker: caretakerName,
        editTime: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDTHH:mm
        customerRequest: '',
        conclusion: '',
      },
    ]);
  };

  const handleRemoveSalesLogEntry = (index: number) => {
    setSalesLogEntries(salesLogEntries.filter((_, i) => i !== index));
  };

  const handleUpdateSalesLogEntry = (index: number, field: string, value: string) => {
    const updated = [...salesLogEntries];
    updated[index] = { ...updated[index], [field]: value };
    setSalesLogEntries(updated);
  };

  const handleUpdateLead = async () => {
    // Chỉ kiểm tra các trường bắt buộc: name, interest, type, priority, source
    // Trim để loại bỏ khoảng trắng thừa
    const name = (formData.name || '').trim();
    const interest = (formData.interest || '').trim();

    if (!name || !interest || !formData.type || !formData.priority || !formData.source) {
      alert('Vui lòng nhập đầy đủ thông tin bắt buộc (có dấu *)');
      return;
    }

    try {
      // Prepare sales log entries - filter out empty entries
      const validEntries = salesLogEntries.filter(
        (entry) => entry.caretaker || entry.customerRequest || entry.conclusion
      );
      
      const updateData = {
        ...formData,
        // Add new sales log entries if any exist
        ...(validEntries.length > 0 && {
          newSalesLogs: validEntries.map((entry) => ({
            caretaker: entry.caretaker,
            editTime: entry.editTime ? new Date(entry.editTime).toISOString() : new Date().toISOString(),
            customerRequest: entry.customerRequest,
            conclusion: entry.conclusion,
            status: 'pending', // pending, approved, rejected
          }))
        })
      };

      console.log('📤 Updating lead with data:', {
        leadId: editingLeadId,
        validEntriesCount: validEntries.length,
        salesLogEntries,
        updateData
      });

      const token = getToken();
      const response = await fetch(
        `http://localhost:5000/api/leads/${editingLeadId}`,
        {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify(updateData),
        }
      );

      const data = await response.json();
      console.log('📥 Response from server:', data);
      
      if (data.success) {
        alert('Cập nhật khách hàng thành công' + (validEntries.length > 0 ? ` và đã tạo ${validEntries.length} nhật ký sales` : ''));
        setShowEditDialog(false);
        setEditingLeadId(null);
        setSalesLogEntries([]);
        fetchLeads();
      } else {
        alert(data.message || 'Lỗi khi cập nhật khách hàng');
      }
    } catch (err) {
      console.error('❌ Lỗi khi cập nhật khách hàng:', err);
      alert('Lỗi khi cập nhật khách hàng: ' + (err instanceof Error ? err.message : 'Unknown error'));
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
      case 'potential':
        return 'bg-yellow-100 text-yellow-700';
      case 'ready':
        return 'bg-green-100 text-green-700';
      case 'purchased':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new':
        return t('leads.status.new');
      case 'potential':
        return t('leads.status.potential');
      case 'ready':
        return t('leads.status.ready');
      case 'purchased':
        return t('leads.status.purchased');
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

  // Filter leads by status and search query
  const filteredLeads = leads.filter((lead) => {
    // Filter by status
    const statusMatch = filterStatus === 'all' || lead.status === filterStatus;

    // Filter by search query
    if (!searchQuery.trim()) {
      return statusMatch;
    }

    const query = searchQuery.toLowerCase();
    const name = (lead.name || '').toLowerCase();
    const phone = (lead.phone || '').toLowerCase();
    const email = (lead.email || '').toLowerCase();
    const location = (lead.location || '').toLowerCase();
    const interest = (lead.interest || '').toLowerCase();
    const notes = (lead.notes || '').toLowerCase();
    const source = (lead.source || '').toLowerCase();
    const type = (lead.type || '').toLowerCase();
    const budget = (lead.budget || '').toLowerCase();

    const searchMatch =
      name.includes(query) ||
      phone.includes(query) ||
      email.includes(query) ||
      location.includes(query) ||
      interest.includes(query) ||
      notes.includes(query) ||
      source.includes(query) ||
      type.includes(query) ||
      budget.includes(query);

    return statusMatch && searchMatch;
  });

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
                  <Label htmlFor="name">
                    Tên khách hàng <span className="text-red-500">*</span>
                  </Label>
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
                  <Label htmlFor="interest">
                    Sản phẩm quan tâm <span className="text-red-500">*</span>
                  </Label>
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
                    <Label htmlFor="type">
                      Loại <span className="text-red-500">*</span>
                    </Label>
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
                    <Label htmlFor="priority">
                      Ưu tiên <span className="text-red-500">*</span>
                    </Label>
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
                  <Label htmlFor="source">
                    Nguồn <span className="text-red-500">*</span>
                  </Label>
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

        <Card className="flex flex-col gap-0" style={{ minHeight: 0, height: '100%', maxHeight: '600px', overflow: 'hidden' }}>
          <CardHeader className="flex-shrink-0">
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
                    <SelectItem value="potential">
                      {t('leads.status.potential')}
                    </SelectItem>
                    <SelectItem value="ready">
                      {t('leads.status.ready')}
                    </SelectItem>
                    <SelectItem value="purchased">
                      {t('leads.status.purchased')}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm khách hàng..."
                    className="pl-10 w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0" style={{ minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
            <div className="p-6">
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
            </div>
          </CardContent>
        </Card>

        {/* Edit Lead Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('common.edit')}</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin khách hàng
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">
                  Tên khách hàng <span className="text-red-500">*</span>
                </Label>
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
                <Label htmlFor="edit-interest">
                  Sản phẩm quan tâm <span className="text-red-500">*</span>
                </Label>
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
                  <Label htmlFor="edit-type">
                    Loại <span className="text-red-500">*</span>
                  </Label>
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
                  <Label htmlFor="edit-priority">
                    Ưu tiên <span className="text-red-500">*</span>
                  </Label>
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
                <Label htmlFor="edit-source">
                  Nguồn <span className="text-red-500">*</span>
                </Label>
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

              {/* Sales Log Section - Table Format */}
              <div className="border-t pt-4 mt-2">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{t('salesLog.title')}</h4>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddSalesLogEntry}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Thêm dòng
                  </Button>
                </div>
                
                {salesLogEntries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    Chưa có nhật ký nào. Click "Thêm dòng" để thêm mới.
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[150px]">Người chăm sóc</TableHead>
                          <TableHead className="w-[180px]">Ngày giờ</TableHead>
                          <TableHead>Đề xuất của khách hàng</TableHead>
                          <TableHead>Kết luận</TableHead>
                          <TableHead className="w-[80px]">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {salesLogEntries.map((entry, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Input
                                placeholder={currentUser?.fullName || currentUser?.email || "Người chăm sóc..."}
                                value={entry.caretaker}
                                onChange={(e) =>
                                  handleUpdateSalesLogEntry(index, 'caretaker', e.target.value)
                                }
                                className="h-8"
                                title={entry.caretaker ? undefined : `Tự động điền từ tài khoản: ${currentUser?.fullName || currentUser?.email || 'Chưa đăng nhập'}`}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="datetime-local"
                                value={entry.editTime}
                                onChange={(e) =>
                                  handleUpdateSalesLogEntry(index, 'editTime', e.target.value)
                                }
                                className="h-8"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                placeholder="Đề xuất..."
                                value={entry.customerRequest}
                                onChange={(e) =>
                                  handleUpdateSalesLogEntry(index, 'customerRequest', e.target.value)
                                }
                                className="h-8"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                placeholder="Kết luận..."
                                value={entry.conclusion}
                                onChange={(e) =>
                                  handleUpdateSalesLogEntry(index, 'conclusion', e.target.value)
                                }
                                className="h-8"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveSalesLogEntry(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
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
