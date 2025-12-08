import { useState, useEffect, useCallback } from 'react';
import { getToken } from '../../utils/api';
import { UserPlus, Search, MoreVertical, Mail, Phone, Shield, Eye, EyeOff, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
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
  // Danh sách người dùng sẽ được load từ API
  const [users, setUsers] = useState<any[]>([]);

  const [showDialog, setShowDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'sales',
    password: '',
    isActive: true,
    permissions: [] as string[]
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // States cho kiểm tra email realtime
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [emailCheckTimeout, setEmailCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  // Hàm kiểm tra email đã tồn tại chưa
  const checkEmailExists = useCallback(async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailStatus('idle');
      return;
    }

    setEmailStatus('checking');
    try {
      const res = await fetch(`${API_BASE_URL}/auth/check-email?email=${encodeURIComponent(email)}`);
      const data = await res.json();

      if (data.success) {
        setEmailStatus(data.exists ? 'taken' : 'available');
        if (data.exists) {
          setErrors(prev => ({ ...prev, email: 'Email này đã được đăng ký' }));
        }
      }
    } catch (err) {
      console.error('Check email error:', err);
      setEmailStatus('idle');
    }
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Debounce check email
    if (field === 'email') {
      setEmailStatus('idle');
      if (emailCheckTimeout) clearTimeout(emailCheckTimeout);
      const timeout = setTimeout(() => checkEmailExists(value), 500);
      setEmailCheckTimeout(timeout);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    } else if (emailStatus === 'taken') {
      newErrors.email = 'Email này đã được đăng ký';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ (10 chữ số)';
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEditForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ (10 chữ số)';
    }

    // Mật khẩu là tùy chọn khi edit
    if (formData.password && formData.password.trim()) {
      if (formData.password.length < 6) {
        newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = getToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(`${API_BASE_URL}/users`, { headers });
      const data = await response.json();
      if (data.success && data.users) {
        const formattedUsers = data.users.map((u: any) => ({
          id: u._id || u.id,
          _id: u._id,
          name: u.fullName || u.name || 'Không có tên',
          email: u.email || '',
          phone: u.phone || '',
          role: u.role || 'user',
          roleDisplay: u.role || 'user',
          permissions: u.permissions || [],
          isActive: u.isActive !== false, // Default to true if not set
          status: u.isActive !== false ? 'active' : 'inactive',
          lastActive: u.updatedAt ? new Date(u.updatedAt).toLocaleString('vi-VN') : 'Chưa có',
          // Số bài đã phân tích được lấy trực tiếp từ API
          postsAnalyzed: typeof u.postsAnalyzed === 'number' ? u.postsAnalyzed : (u.postsAnalyzed || 0)
        }));
        setUsers(formattedUsers);
      }
    } catch (err) {
      console.error('Lỗi khi tải người dùng:', err);
    }
  };

  const handleAddUser = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const token = getToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          password: formData.password,
          permissions: []
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Thêm người dùng thành công');
        setFormData({ fullName: '', email: '', phone: '', role: 'sales', password: '', isActive: true, permissions: [] });
        setErrors({});
        setEmailStatus('idle');
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
      password: '', // Để trống khi edit
      isActive: user.isActive !== false, // Default to true if not set
      permissions: user.permissions || []
    });
    setShowEditDialog(true);
  };

  const handleUpdateUser = async () => {
    if (!validateEditForm()) {
      return;
    }

    try {
      const token = getToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const updateData: any = {
        fullName: formData.fullName,
        phone: formData.phone,
        role: formData.role,
        isActive: formData.isActive,
        permissions: []
      };

      // Chỉ gửi mật khẩu nếu người dùng nhập
      if (formData.password && formData.password.trim()) {
        updateData.password = formData.password;
      }

      const response = await fetch(`${API_BASE_URL}/users/${editingUserId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateData)
      });

      const data = await response.json();
      if (data.success) {
        alert('Cập nhật người dùng thành công');
        setShowEditDialog(false);
        setEditingUserId(null);
        setErrors({});
        fetchUsers();
      } else {
        alert(data.message || 'Lỗi khi cập nhật người dùng');
      }
    } catch (err) {
      console.error('Lỗi:', err);
      alert('Lỗi khi cập nhật người dùng');
    }
  };

  const handleToggleUserStatus = async (user: any) => {
    const newStatus = user.isActive ? 'vô hiệu hóa' : 'kích hoạt';
    if (!confirm(`Bạn chắc chắn muốn ${newStatus} tài khoản của người dùng này?`)) return;

    try {
      const token = getToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/users/${user._id || user.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          fullName: user.name,
          phone: user.phone,
          role: user.role,
          isActive: !user.isActive,
          permissions: user.permissions || []
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} tài khoản thành công`);
        fetchUsers();
      } else {
        alert(data.message || `Lỗi khi ${newStatus} tài khoản`);
      }
    } catch (err) {
      console.error('Lỗi:', err);
      alert(`Lỗi khi ${newStatus} tài khoản`);
    }
  };

  const handleDeleteUser = async (user: any) => {
    if (!confirm('Bạn chắc chắn muốn xóa người dùng này?')) return;

    try {
      const token = getToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(`${API_BASE_URL}/users/${user._id || user.id}`, {
        method: 'DELETE',
        headers
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
      case 'smb':
        return 'bg-green-100 text-green-700';
      case 'sales':
        return 'bg-blue-100 text-blue-700';
      case 'manager':
        return 'bg-purple-100 text-purple-700';
      case 'student':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'smb': 'SMB Owner',
      'sales': 'Sales Staff',
      'manager': 'Store Manager',
      'student': 'IT Student',
      'admin': 'Admin'
    };
    return roleMap[role] || role;
  };

  const getInitials = (name: string | undefined) => {
    if (!name || typeof name !== 'string') return '??';
    const parts = name.trim().split(' ').filter(n => n.length > 0);
    if (parts.length === 0) return '??';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.phone.includes(query) ||
      getRoleDisplayName(user.role).toLowerCase().includes(query)
    );
  });

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
                    onChange={(e) => handleChange('fullName', e.target.value)}
                  />
                  {errors.fullName && <div className="text-red-500 text-sm">{errors.fullName}</div>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="nhập@email.com"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className={errors.email ? 'border-red-500' : emailStatus === 'available' ? 'border-green-500' : ''}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {emailStatus === 'checking' && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                      {emailStatus === 'available' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {emailStatus === 'taken' && <XCircle className="w-4 h-4 text-red-500" />}
                    </div>
                  </div>
                  {errors.email && <div className="text-red-500 text-sm">{errors.email}</div>}
                  {emailStatus === 'available' && <div className="text-green-500 text-sm">Email có thể sử dụng</div>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Điện thoại</Label>
                  <Input
                    id="phone"
                    placeholder="0123456789"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                  {errors.phone && <div className="text-red-500 text-sm">{errors.phone}</div>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className={errors.password ? 'border-red-500' : ''}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password && <div className="text-red-500 text-sm">{errors.password}</div>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Vai trò</Label>
                  <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="smb">SMB Owner - Chủ cửa hàng nhỏ</SelectItem>
                      <SelectItem value="sales">Sales Staff - Nhân viên bán hàng</SelectItem>
                      <SelectItem value="manager">Store Manager - Quản lý cửa hàng</SelectItem>
                      <SelectItem value="student">IT Student - Sinh viên IT</SelectItem>
                    </SelectContent>
                  </Select>
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
                    onChange={(e) => handleChange('fullName', e.target.value)}
                  />
                  {errors.fullName && <div className="text-red-500 text-sm">{errors.fullName}</div>}
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
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                  {errors.phone && <div className="text-red-500 text-sm">{errors.phone}</div>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-password">Mật khẩu mới (tùy chọn)</Label>
                  <div className="relative">
                    <Input
                      id="edit-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Để trống nếu không đổi mật khẩu"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className={errors.password ? 'border-red-500' : ''}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password && <div className="text-red-500 text-sm">{errors.password}</div>}
                  <div className="text-gray-500 text-xs">Để trống nếu không muốn thay đổi mật khẩu</div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-role">Vai trò</Label>
                  <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                    <SelectTrigger id="edit-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="smb">SMB Owner - Chủ cửa hàng nhỏ</SelectItem>
                      <SelectItem value="sales">Sales Staff - Nhân viên bán hàng</SelectItem>
                      <SelectItem value="manager">Store Manager - Quản lý cửa hàng</SelectItem>
                      <SelectItem value="student">IT Student - Sinh viên IT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="edit-isActive" className="text-sm font-normal">
                    Tài khoản hoạt động
                  </Label>
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
              <CardTitle>Tổng người dùng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">{users.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Người dùng hoạt động</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">
                {users.filter(u => u.status === 'active').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sales Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">
                {users.filter(u => u.role === 'sales').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Store Manager</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl text-gray-900">
                {users.filter(u => u.role === 'manager').length}
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
                <Input 
                  placeholder={t('common.search') + '...'} 
                  className="pl-10 w-64" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
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
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="text-gray-900">{user.name || 'Không có tên'}</div>
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
                        {getRoleDisplayName(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.status === 'active' ? 'default' : 'secondary'}
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => handleToggleUserStatus(user)}
                      >
                        {user.status === 'active' ? 'Hoạt động' : 'Vô hiệu hóa'}
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