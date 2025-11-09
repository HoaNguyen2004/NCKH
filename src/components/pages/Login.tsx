import { useState } from 'react';
import { LogIn, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
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
import { login } from '../../utils/api';

interface LoginProps {
  onLogin: (userData: any) => void;
  onSwitchToRegister?: () => void;
}

export function Login({ onLogin, onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Vui lòng nhập email và mật khẩu');
      return;
    }

    setLoading(true);
    try {
      const response = await login({ email, password });
      if (response.success && response.user) {
        onLogin(response.user);
      } else {
        setError(response.message || 'Đăng nhập thất bại');
      }
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: string) => {
    const demoAccounts: Record<string, { email: string; password: string }> = {
      admin: { email: 'admin@aifilter.com', password: 'admin123' },
      manager: { email: 'manager@aifilter.com', password: 'manager123' },
      sales: { email: 'sales@aifilter.com', password: 'sales123' },
    };
    
    const account = demoAccounts[role];
    if (account) {
      setEmail(account.email);
      setPassword(account.password);
      setError('');
      setLoading(true);
      
      try {
        const response = await login(account);
        if (response.success && response.user) {
          onLogin(response.user);
        } else {
          setError(response.message || 'Đăng nhập thất bại');
        }
      } catch (err: any) {
        setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900 text-3xl">AI Filter</h1>
              <p className="text-gray-600">Social Media Analyzer</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-gray-900 text-4xl">
              Chào mừng trở lại!
            </h2>
            <p className="text-gray-600 text-lg">
              Hệ thống AI phân tích nhu cầu mua bán trên mạng xã hội
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600">✓</span>
              </div>
              <div>
                <div className="text-gray-900">Phân tích AI thông minh</div>
                <div className="text-gray-500 text-sm">Độ chính xác lên đến 94.2%</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600">✓</span>
              </div>
              <div>
                <div className="text-gray-900">Tự động thu thập dữ liệu</div>
                <div className="text-gray-500 text-sm">Từ Facebook, Instagram, Twitter</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-green-600">✓</span>
              </div>
              <div>
                <div className="text-gray-900">Báo cáo chi tiết</div>
                <div className="text-gray-500 text-sm">Phân tích axu hướng thị trường</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Đăng nhập</CardTitle>
            <CardDescription>
              Nhập thông tin tài khoản để tiếp tục
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
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
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="cursor-pointer text-sm">
                    Ghi nhớ đăng nhập
                  </Label>
                </div>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                <LogIn className="w-4 h-4 mr-2" />
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Hoặc dùng tài khoản demo
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDemoLogin('admin')}
                  className="text-sm"
                >
                  Admin
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDemoLogin('manager')}
                  className="text-sm"
                >
                  Manager
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDemoLogin('sales')}
                  className="text-sm"
                >
                  Sales
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              Chưa có tài khoản?{' '}
              <button 
                type="button"
                onClick={onSwitchToRegister}
                className="text-blue-600 hover:underline"
              >
                Đăng ký ngay
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}