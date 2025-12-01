import { useState, useEffect } from 'react';
import { UserPlus, Search, MoreVertical, Mail, Phone, Shield } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../ui/avatar';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export function UserManagement() {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@email.com',
      phone: '0912345678',
      role: 'Store Manager',
      status: 'active',
      lastActive: '2 phút trước',
      postsAnalyzed: 245
    },
    {
      id: 2,
      name: 'Trần Thị B',
      email: 'tranthib@email.com',
      phone: '0987654321',
      role: 'Sales Staff',
      status: 'active',
      lastActive: '10 phút trước',
      postsAnalyzed: 189
    },
    {
      id: 3,
      name: 'Lê Văn C',
      email: 'levanc@email.com',
      phone: '0909123456',
      role: 'Sales Staff',
      status: 'active',
      lastActive: '1 giờ trước',
      postsAnalyzed: 312
    },
    {
      id: 4,
      name: 'Phạm Thị D',
      email: 'phamthid@email.com',
      phone: '0938765432',
      role: 'SMB Owner',
      status: 'inactive',
      lastActive: '2 ngày trước',
      postsAnalyzed: 67
    },
    {
      id: 5,
      name: 'Hoàng Văn E',
      email: 'hoangvane@email.com',
      phone: '0976543210',
      role: 'Admin',
      status: 'active',
      lastActive: '5 phút trước',
      postsAnalyzed: 521
    },
  ]);

  const [showDialog, setShowDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'Sales Staff',
    password: 'password123'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users');
      const data = await response.json();
      if (data.success && data.users) {
        const formattedUsers = data.users.map((u: any, idx: number) => ({
          id: u._id || u.id,
          _id: u._id,
          name: u.fullName,
          email: u.email,
          phone: u.phone || '',
          role: u.role || 'user',
          status: 'active',
          lastActive: new Date(u.updatedAt).toLocaleString('vi-VN'),
          postsAnalyzed: idx * 100 + 50
        }));
        setUsers(formattedUsers);
      }
    } catch (err) {
      console.error('Lỗi khi tải người dùng:', err);
    }
  };

  const handleAddUser = async () => {
    if (!formData.fullName || !formData.email) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        alert('Thêm người dùng thành công');
        setFormData({ fullName: '', email: '', phone: '', role: 'Sales Staff', password: 'password123' });
        setShowDialog(false);
        fetchUsers();
      } else {
        alert(data.message || 'Lỗi khi thêm người dùng');
      }
    } catch (err) {
      console.error('Lỗi:', err);
      alert('Lỗi khi thêm người dùng');
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUserId(user.id);
    setFormData({
      fullName: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      password: 'password123'
    });
    setShowEditDialog(true);
  };

  const handleUpdateUser = async () => {
    if (!formData.fullName || !formData.email) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/users/${editingUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          role: formData.role
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Cập nhật người dùng thành công');
        setShowEditDialog(false);
        setEditingUserId(null);
        fetchUsers();
      } else {
        alert(data.message || 'Lỗi khi cập nhật người dùng');
      }
    } catch (err) {
      console.error('Lỗi:', err);
      alert('Lỗi khi cập nhật người dùng');
    }
  };

  const handleDeleteUser = async (user: any) => {
    if (!confirm('Bạn chắc chắn muốn xóa người dùng này?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/users/${user._id || user.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        alert('Xóa người dùng thành công');
        fetchUsers();
      } else {
        alert(data.message || 'Lỗi khi xóa người dùng');
      }
    } catch (err) {
      console.error('Lỗi:', err);
      alert('Lỗi khi xóa người dùng');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-700';
      case 'Store Manager':
        return 'bg-purple-100 text-purple-700';
      case 'Sales Staff':
        return 'bg-blue-100 text-blue-700';
      case 'SMB Owner':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const { t } = useLanguage();

  return (
    <main className="flex-1 overflow-auto">
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900">{t('users.title')}</h1>
            <p className="text-gray-500">{t('users.subtitle')}</p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                {t('users.addUser')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Thêm người dùng mới</DialogTitle>
                <DialogDescription>
                  Nhập thông tin người dùng cần thêm vào hệ thống
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Tên đầy đủ</Label>
                  <Input
                    id="fullName"
                    placeholder="Nhập tên"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nhập@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
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
                  <Label htmlFor="role">Vai trò</Label>
                  <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin - Quản trị viên</SelectItem>
                      <SelectItem value="Store Manager">Store Manager</SelectItem>
                      <SelectItem value="Sales Staff">Sales Staff</SelectItem>
                      <SelectItem value="SMB Owner">SMB Owner</SelectItem>
                    </SelectContent>
                  </Select>
                  {/* Phân quyền chi tiết */}
                  <div className="mt-2">
                    <Label>Phân quyền</Label>
                    <div className="flex flex-wrap gap-2">
                      {['view_reports','manage_products','manage_leads','manage_users','access_ai','export_data'].map((perm) => (
                        <label key={perm} className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={formData.permissions?.includes(perm) || false}
                            onChange={e => {
                              const checked = e.target.checked;
                              setFormData(f => ({
                                ...f,
                                permissions: checked
                                  ? [...(f.permissions||[]), perm]
                                  : (f.permissions||[]).filter(p => p !== perm)
                              }));
                            }}
                          />
                          {perm}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Hủy
                </Button>
                <Button onClick={handleAddUser}>
                  Thêm người dùng
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
                <DialogDescription>
                  Cập nhật thông tin người dùng
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-fullName">Tên đầy đủ</Label>
                  <Input
                    id="edit-fullName"
                    placeholder="Nhập tên"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    disabled
                    value={formData.email}
                  />
                </div>
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
                  <Label htmlFor="edit-role">Vai trò</Label>
                  <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                    <SelectTrigger id="edit-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin - Quản trị viên</SelectItem>
                      <SelectItem value="Store Manager">Store Manager</SelectItem>
                      <SelectItem value="Sales Staff">Sales Staff</SelectItem>
                      <SelectItem value="SMB Owner">SMB Owner</SelectItem>
                    </SelectContent>
                  </Select>
                  {/* Phân quyền chi tiết */}
                  <div className="mt-2">
                    <Label>Phân quyền</Label>
                    <div className="flex flex-wrap gap-2">
                      {['view_reports','manage_products','manage_leads','manage_users','access_ai','export_data'].map((perm) => (
                        <label key={perm} className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={formData.permissions?.includes(perm) || false}
                            onChange={e => {
                              const checked = e.target.checked;
                              setFormData(f => ({
                                ...f,
                                permissions: checked
                                  ? [...(f.permissions||[]), perm]
                                  : (f.permissions||[]).filter(p => p !== perm)
                              }));
                            }}
                          />
                          {perm}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Hủy
                </Button>
                <Button onClick={handleUpdateUser}>
                  Cập nhật
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
              <CardTitle>{t('users.totalUsers')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">{users.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('users.activeUsers')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">
                {users.filter(u => u.status === 'active').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('role.sales')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">
                {users.filter(u => u.role === 'Sales Staff').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('role.manager')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">
                {users.filter(u => u.role === 'Store Manager').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('users.title')}</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder={t('common.search') + '...'} className="pl-10 w-64" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.name')}</TableHead>
                  <TableHead>{t('leads.contact')}</TableHead>
                  <TableHead>{t('users.role')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead>{t('users.lastActive')}</TableHead>
                  <TableHead>{t('users.postsAnalyzed')}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="text-gray-900">{user.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-3 h-3" />
                          {user.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status === 'active' ? t('common.active') : t('common.inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">{user.lastActive}</TableCell>
                    <TableCell className="text-gray-900">{user.postsAnalyzed}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditUser(user)}>
                          {t('common.edit')}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(user)}>
                          {t('common.delete')}
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
    </main>
  );
}