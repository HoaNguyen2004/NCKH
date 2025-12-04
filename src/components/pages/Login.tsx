import { useState } from 'react';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
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

interface LoginProps {
  onLogin: (email: string, password: string, remember?: boolean) => void;
  onShowRegister?: () => void;
}

// Logo SVG component
const LogoIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="50" r="48" fill="currentColor" className="text-gray-900"/>
    <g stroke="white" strokeWidth="2" fill="none">
      {/* Planet circle */}
      <ellipse cx="50" cy="50" rx="30" ry="30"/>
      {/* Orbit ring */}
      <ellipse cx="50" cy="50" rx="42" ry="16" transform="rotate(-20 50 50)"/>
      {/* Compass needle */}
      <path d="M50 25 L55 50 L50 75 L45 50 Z" fill="white" stroke="none"/>
      <circle cx="50" cy="50" r="5"/>
      {/* Star */}
      <path d="M75 22 L77 28 L83 28 L78 32 L80 38 L75 34 L70 38 L72 32 L67 28 L73 28 Z" fill="white" stroke="none"/>
    </g>
  </svg>
);

export function Login({ onLogin, onShowRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email, password, rememberMe);
    }
  };

  const handleDemoLogin = (role: string) => {
    const demoAccounts: Record<string, { email: string; password: string }> = {
      admin: { email: 'admin@demo.com', password: 'admin123' },
      manager: { email: 'manager@demo.com', password: 'manager123' },
      sales: { email: 'sales@demo.com', password: 'sales123' },
    };
    
    const account = demoAccounts[role];
    if (account) {
      setEmail(account.email);
      setPassword(account.password);
      setTimeout(() => onLogin(account.email, account.password, false), 100);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <LogoIcon className="w-20 h-20" />
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
                <div className="text-gray-500 text-sm">Phân tích xu hướng thị trường</div>
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
                  onClick={() => { setForgotOpen(true); setForgotEmail(email); setForgotStatus(null); }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <Button type="submit" className="w-full">
                <LogIn className="w-4 h-4 mr-2" />
                Đăng nhập
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

            {/* Forgot password modal (simple) */}
            {forgotOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-medium">Quên mật khẩu</h3>
                  <p className="text-sm text-gray-600">Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu.</p>
                  <div className="mt-4">
                    <Input value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="your@email.com" />
                  </div>
                    <div className="mt-4 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setForgotOpen(false)}>Hủy</Button>
                    <Button onClick={async () => {
                      if (!forgotEmail) { setForgotStatus('Vui lòng nhập email'); return; }
                      try {
                        setForgotStatus('Đang gửi...');
                        const resp = await fetch('/api/auth/forgot', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: forgotEmail })
                        });
                        const data = await resp.json();
                        if (resp.ok) {
                          if (data.resetUrl) {
                            // SMTP not configured on server: show link to user for dev
                            setForgotStatus('Reset link (dev): ' + data.resetUrl);
                          } else {
                            setForgotStatus('Nếu email tồn tại, hướng dẫn đã được gửi.');
                          }
                          setTimeout(() => setForgotOpen(false), 1800);
                        } else {
                          setForgotStatus(data.message || 'Lỗi khi gửi email');
                        }
                      } catch (err) {
                        console.error(err);
                        setForgotStatus('Lỗi kết nối đến server');
                      }
                    }}>Gửi</Button>
                  </div>
                  {forgotStatus && <div className="mt-3 text-sm text-green-600 break-words">{forgotStatus}</div>}
                </div>
              </div>
            )}

            <div className="mt-6 text-center text-sm text-gray-500">
              Chưa có tài khoản?{' '}
              <button 
                type="button"
                onClick={onShowRegister}
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