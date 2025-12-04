import { useState } from 'react';
import { UserPlus, Search, Phone, Mail, MapPin, Star, Calendar as CalendarIcon } from 'lucide-react';
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
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Calendar } from '../ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { useLanguage } from '../../contexts/LanguageContext';

interface LeadsManagementProps {
  posts: any[];
}

export function LeadsManagement({ posts }: LeadsManagementProps) {
  const { t } = useLanguage();
  const [filterStatus, setFilterStatus] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    interest: '',
    type: '',
    budget: '',
    priority: '',
    source: '',
    notes: '',
  });

  const [leads] = useState([
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
          <Button onClick={() => setIsDialogOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Thêm khách hàng
          </Button>
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
                        <Button size="sm" variant="outline">
                          <Phone className="w-3 h-3 mr-1" />
                          Gọi
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="w-3 h-3 mr-1" />
                          Email
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('leads.addLeadTitle')}</DialogTitle>
            <DialogDescription>
              {t('leads.addLeadDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {t('leads.fullName')}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('leads.namePlaceholder')}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                {t('leads.phoneNumber')}
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder={t('leads.phonePlaceholder')}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                {t('leads.emailAddress')}
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t('leads.emailPlaceholder')}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                {t('leads.location')}
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder={t('leads.locationPlaceholder')}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="interest" className="text-right">
                {t('leads.productInterest')}
              </Label>
              <Input
                id="interest"
                value={formData.interest}
                onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                placeholder={t('leads.interestPlaceholder')}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                {t('leads.type')}
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t('leads.selectType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buying">{t('leads.buying')}</SelectItem>
                  <SelectItem value="selling">{t('leads.selling')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="budget" className="text-right">
                {t('leads.budget')}
              </Label>
              <Input
                id="budget"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder={t('leads.budgetPlaceholder')}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                {t('leads.priority')}
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t('leads.selectPriority')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">{t('leads.highPriority')}</SelectItem>
                  <SelectItem value="medium">{t('leads.mediumPriority')}</SelectItem>
                  <SelectItem value="low">{t('leads.lowPriority')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="source" className="text-right">
                {t('leads.source')}
              </Label>
              <Select
                value={formData.source}
                onValueChange={(value) => setFormData({ ...formData, source: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t('leads.selectSource')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facebook">{t('leads.facebook')}</SelectItem>
                  <SelectItem value="instagram">{t('leads.instagram')}</SelectItem>
                  <SelectItem value="twitter">{t('leads.twitter')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                {t('leads.contactDate')}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="col-span-3 justify-start text-left"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? date.toLocaleDateString('vi-VN') : t('leads.selectDate')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                {t('leads.notes')}
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={t('leads.notesPlaceholder')}
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">{t('leads.addLead')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}