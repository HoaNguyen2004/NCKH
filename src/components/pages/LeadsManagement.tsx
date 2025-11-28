import { useState, useEffect } from 'react';
import { UserPlus, Search, Phone, Mail, MapPin, Star } from 'lucide-react';
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

interface LeadsManagementProps {
  posts: any[];
}

export function LeadsManagement({ posts }: LeadsManagementProps) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  
  const [leads, setLeads] = useState([
    {
      id: 1,
      name: 'Nguyễn Minh Tuấn',
      phone: '0912345678',
      email: 'minhtuan@email.com',
      location: 'Hà Nội',
      interest: 'Laptop Dell',
      type: 'Buying',
      budget: '7-10 triệu',
      status: 'new',
      priority: 'high',
      source: 'Facebook',
      lastContact: 'Chưa liên hệ',
      notes: 'Cần mua gấp trong tuần này'
    },
    {
      id: 2,
      name: 'Trần Thu Hà',
      phone: '0987654321',
      email: 'thuha@email.com',
      location: 'TP.HCM',
      interest: 'iPhone 12',
      type: 'Selling',
      budget: '12-15 triệu',
      status: 'contacted',
      priority: 'medium',
      source: 'Facebook',
      lastContact: '1 giờ trước',
      notes: 'Máy còn mới 95%, full box'
    },
    {
      id: 3,
      name: 'Lê Văn Hùng',
      phone: '0909123456',
      email: 'vanhung@email.com',
      location: 'Đà Nẵng',
      interest: 'MacBook Pro M1',
      type: 'Buying',
      budget: '20-25 triệu',
      status: 'qualified',
      priority: 'high',
      source: 'Instagram',
      lastContact: '2 ngày trước',
      notes: 'Đã xem máy, đang cân nhắc'
    },
    {
      id: 4,
      name: 'Phạm Thị Lan',
      phone: '0938765432',
      email: 'thilan@email.com',
      location: 'Hà Nội',
      interest: 'Samsung Galaxy S21',
      type: 'Buying',
      budget: '9-12 triệu',
      status: 'lost',
      priority: 'low',
      source: 'Facebook',
      lastContact: '1 tuần trước',
      notes: 'Đã mua từ nguồn khác'
    },
  ]);

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
    notes: ''
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
    if (!formData.name || !formData.phone || !formData.email) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        alert('Thêm khách hàng thành công');
        setFormData({ name: '', phone: '', email: '', location: '', interest: '', type: 'Buying', budget: '', priority: 'medium', source: 'Facebook', notes: '' });
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
      notes: lead.notes
    });
    setShowEditDialog(true);
  };

  const handleUpdateLead = async () => {
    if (!formData.name || !formData.phone || !formData.email) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/leads/${editingLeadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

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
      const response = await fetch(`http://localhost:5000/api/leads/${leadId}`, {
        method: 'DELETE'
      });

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
        return 'Mới';
      case 'contacted':
        return 'Đã liên hệ';
      case 'qualified':
        return 'Tiềm năng';
      case 'lost':
        return 'Thất bại';
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

  const filteredLeads = filterStatus === 'all' 
    ? leads 
    : leads.filter(l => l.status === filterStatus);

  return (
    <main className="flex-1 overflow-auto">
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900">Khách hàng tiềm năng</h1>
            <p className="text-gray-500">Quản lý và theo dõi khách hàng tiềm năng</p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Thêm khách hàng
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Thêm khách hàng tiềm năng</DialogTitle>
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
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Điện thoại</Label>
                    <Input
                      id="phone"
                      placeholder="0123456789"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="khachhang@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Địa điểm</Label>
                  <Input
                    id="location"
                    placeholder="Ví dụ: Hà Nội"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="interest">Sản phẩm quan tâm</Label>
                  <Input
                    id="interest"
                    placeholder="Ví dụ: Laptop Dell"
                    value={formData.interest}
                    onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Loại</Label>
                    <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
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
                    <Select value={formData.priority} onValueChange={(val) => setFormData({ ...formData, priority: val })}>
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
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="source">Nguồn</Label>
                  <Select value={formData.source} onValueChange={(val) => setFormData({ ...formData, source: val })}>
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
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Hủy
                </Button>
                <Button onClick={handleAddLead}>
                  Thêm khách hàng
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
              <CardTitle>Tổng khách hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">{leads.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mới</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">
                {leads.filter(l => l.status === 'new').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tiềm năng cao</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">
                {leads.filter(l => l.priority === 'high').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tỷ lệ chuyển đổi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">25%</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Danh sách khách hàng tiềm năng</CardTitle>
              <div className="flex items-center gap-3">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="new">Mới</SelectItem>
                    <SelectItem value="contacted">Đã liên hệ</SelectItem>
                    <SelectItem value="qualified">Tiềm năng</SelectItem>
                    <SelectItem value="lost">Thất bại</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Tìm kiếm..." className="pl-10 w-64" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ưu tiên</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Liên hệ</TableHead>
                  <TableHead>Quan tâm</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Ngân sách</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Nguồn</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <Star className={`w-5 h-5 ${getPriorityColor(lead.priority)} fill-current`} />
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
                      <Badge variant={lead.type === 'Buying' ? 'default' : 'secondary'}>
                        {lead.type === 'Buying' ? 'Mua' : 'Bán'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">{lead.budget}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(lead.status)}>
                        {getStatusLabel(lead.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">{lead.source}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate text-sm text-gray-600">{lead.notes}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditLead(lead)}>
                          Sửa
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteLead(lead._id)}>
                          Xóa
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Lead Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa khách hàng</DialogTitle>
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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-phone">Điện thoại</Label>
                  <Input
                    id="edit-phone"
                    placeholder="0123456789"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    placeholder="khachhang@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-location">Địa điểm</Label>
                <Input
                  id="edit-location"
                  placeholder="Ví dụ: Hà Nội"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-interest">Sản phẩm quan tâm</Label>
                <Input
                  id="edit-interest"
                  placeholder="Ví dụ: Laptop Dell"
                  value={formData.interest}
                  onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-type">Loại</Label>
                  <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
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
                  <Select value={formData.priority} onValueChange={(val) => setFormData({ ...formData, priority: val })}>
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
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-source">Nguồn</Label>
                <Select value={formData.source} onValueChange={(val) => setFormData({ ...formData, source: val })}>
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
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Hủy
              </Button>
              <Button onClick={handleUpdateLead}>
                Cập nhật
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
