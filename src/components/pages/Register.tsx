import React, { useState, FormEvent } from 'react';
import { UserPlus, Mail, Lock, User, Phone, MapPin, Eye, EyeOff, Building2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { register } from '../../utils/api';

interface RegisterProps {
  onRegister: (userData: any) => void;
  onSwitchToLogin: () => void;
}

export function Register({ onRegister, onSwitchToLogin }: RegisterProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    location: '',
    role: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.role) {
      newErrors.role = 'Vui lòng chọn vai trò';
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }

    if (!agreeTerms) {
      newErrors.terms = 'Vui lòng đồng ý với điều khoản';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await register(formData);
      if (response.success && response.user) {
        onRegister(response.user);
      } else {
        setSubmitError(response.message || 'Đăng ký thất bại');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      
      // Handle specific error cases
      if (err.message.includes('Email này đã được sử dụng')) {
        setErrors(prev => ({ ...prev, email: 'Email này đã được sử dụng' }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900 text-3xl">AI Filter</h1>
              <p className="text-gray-600">Social Media Analyzer</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-gray-900 text-4xl">
              Bắt đầu miễn phí ngay hôm nay
            </h2>
            <p className="text-gray-600 text-lg">
              Tạo tài khoản và trải nghiệm sức mạnh của AI trong phân tích mạng xã hội
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600">🚀</span>
              </div>
              <div>
                <div className="text-gray-900">Dùng thử 30 ngày miễn phí</div>
                <div className="text-gray-500 text-sm">Không cần thẻ tín dụng</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600">⚡</span>
              </div>
              <div>
                <div className="text-gray-900">Thiết lập trong 5 phút</div>
                <div className="text-gray-500 text-sm">Dễ dàng và nhanh chóng</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-green-600">💎</span>
              </div>
              <div>
                <div className="text-gray-900">Hỗ trợ 24/7</div>
                <div className="text-gray-500 text-sm">Đội ngũ chăm sóc khách hàng luôn sẵn sàng</div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <p className="text-gray-500 text-sm">
              Đã có tài khoản?{' '}
              <button 
                onClick={onSwitchToLogin}
                className="text-purple-600 hover:underline"
              >
                Đăng nhập ngay
              </button>
            </p>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Tạo tài khoản</CardTitle>
            <CardDescription>
              Điền thông tin để bắt đầu sử dụng AI Filter
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{submitError}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ và tên *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="fullName"
                      placeholder="Nguyễn Văn A"
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      className={`pl-10 ${errors.fullName ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-red-500 text-sm">{errors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="phone"
                      placeholder="0912345678"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-sm">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Công ty</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="company"
                      placeholder="Tên công ty"
                      value={formData.company}
                      onChange={(e) => handleChange('company', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Địa điểm</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="location"
                      placeholder="Hà Nội"
                      value={formData.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Vai trò *</Label>
                <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
                  <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Chọn vai trò của bạn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smb">SMB Owner - Chủ cửa hàng nhỏ</SelectItem>
                    <SelectItem value="sales">Sales Staff - Nhân viên bán hàng</SelectItem>
                    <SelectItem value="manager">Store Manager - Quản lý cửa hàng</SelectItem>
                    <SelectItem value="student">IT Student - Sinh viên IT</SelectItem>
                    <SelectItem value="admin">System Admin - Quản trị hệ thống</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-red-500 text-sm">{errors.role}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    checked={agreeTerms}
                    onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                    className={errors.terms ? 'border-red-500' : ''}
                  />
                  <Label htmlFor="terms" className="cursor-pointer text-sm leading-relaxed">
                    Tôi đồng ý với{' '}
                    <button type="button" className="text-purple-600 hover:underline">
                      Điều khoản sử dụng
                    </button>
                    {' '}và{' '}
                    <button type="button" className="text-purple-600 hover:underline">
                      Chính sách bảo mật
                    </button>
                  </Label>
                </div>
                {errors.terms && (
                  <p className="text-red-500 text-sm">{errors.terms}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                <UserPlus className="w-4 h-4 mr-2" />
                {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              Bằng cách đăng ký, bạn đồng ý nhận email từ AI Filter về sản phẩm, 
              cập nhật và khuyến mãi.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
