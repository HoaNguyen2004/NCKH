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
import { forgotPasswordOtp, resetPasswordWithOtp } from '../../utils/api';

interface LoginProps {
  onLogin: (email: string, password: string, remember?: boolean) => void;
  onShowRegister?: () => void;
  error?: string;
  loading?: boolean;
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

export function Login({ onLogin, onShowRegister, error, loading }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<string | null>(null);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

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
                    disabled={!!loading}
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
                    disabled={!!loading}
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
                    disabled={!!loading}
                  />
                  <Label htmlFor="remember" className="cursor-pointer text-sm">
                    Ghi nhớ đăng nhập
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setForgotOpen(true);
                    setForgotEmail(email);
                    setForgotStatus(null);
                    setForgotStep(1);
                    setOtp('');
                    setNewPassword('');
                    setConfirmNewPassword('');
                  }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={!!loading}>
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

            {/* Forgot password modal (simple) */}
            {forgotOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-medium">Quên mật khẩu</h3>
                  {forgotStep === 1 ? (
                    <>
                      <p className="text-sm text-gray-600 mt-1">
                        Nhập email của bạn để nhận mã xác nhận (OTP) đặt lại mật khẩu.
                      </p>
                      <div className="mt-4 space-y-2">
                        <Label htmlFor="forgot-email">Email</Label>
                        <Input
                          id="forgot-email"
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="your@email.com"
                          disabled={forgotLoading}
                        />
                      </div>
                      <div className="mt-4 flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setForgotOpen(false);
                            setForgotStatus(null);
                            setForgotStep(1);
                            setOtp('');
                            setNewPassword('');
                            setConfirmNewPassword('');
                          }}
                          disabled={forgotLoading}
                        >
                          Hủy
                        </Button>
                        <Button
                          onClick={async () => {
                            if (!forgotEmail) {
                              setForgotStatus('Vui lòng nhập email');
                              return;
                            }
                            try {
                              setForgotLoading(true);
                              setForgotStatus('Đang gửi mã xác nhận...');
                              await forgotPasswordOtp(forgotEmail);
                              setForgotStatus(
                                'Nếu email tồn tại, mã xác nhận đã được gửi. Vui lòng kiểm tra hộp thư.'
                              );
                              setForgotStep(2);
                            } catch (err: any) {
                              console.error(err);
                              setForgotStatus(err?.message || 'Lỗi khi gửi mã xác nhận');
                            } finally {
                              setForgotLoading(false);
                            }
                          }}
                          disabled={forgotLoading}
                        >
                          {forgotLoading ? 'Đang gửi...' : 'Gửi mã'}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 mt-1">
                        Nhập mã xác nhận đã được gửi đến email của bạn và đặt mật khẩu mới.
                      </p>
                      <div className="mt-4 space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="forgot-otp">Mã xác nhận (OTP)</Label>
                          <Input
                            id="forgot-otp"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Nhập mã 6 số"
                            disabled={forgotLoading}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-password">Mật khẩu mới</Label>
                          <Input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            disabled={forgotLoading}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-new-password">Xác nhận mật khẩu mới</Label>
                          <Input
                            id="confirm-new-password"
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            placeholder="••••••••"
                            disabled={forgotLoading}
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setForgotStep(1);
                            setOtp('');
                            setNewPassword('');
                            setConfirmNewPassword('');
                            setForgotStatus(null);
                          }}
                          disabled={forgotLoading}
                        >
                          Quay lại
                        </Button>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={async () => {
                              // Cho phép gửi lại mã OTP
                              if (!forgotEmail) {
                                setForgotStatus('Vui lòng nhập email để gửi lại mã');
                                setForgotStep(1);
                                return;
                              }
                              try {
                                setForgotLoading(true);
                                setForgotStatus('Đang gửi lại mã xác nhận...');
                                await forgotPasswordOtp(forgotEmail);
                                setForgotStatus(
                                  'Nếu email tồn tại, mã xác nhận mới đã được gửi. Vui lòng kiểm tra hộp thư.'
                                );
                              } catch (err: any) {
                                console.error(err);
                                setForgotStatus(err?.message || 'Lỗi khi gửi lại mã xác nhận');
                              } finally {
                                setForgotLoading(false);
                              }
                            }}
                            disabled={forgotLoading}
                          >
                            Gửi lại mã
                          </Button>
                          <Button
                            onClick={async () => {
                              if (!forgotEmail || !otp || !newPassword || !confirmNewPassword) {
                                setForgotStatus('Vui lòng nhập đầy đủ thông tin');
                                return;
                              }
                              try {
                                setForgotLoading(true);
                                setForgotStatus('Đang đổi mật khẩu...');
                                const result = await resetPasswordWithOtp({
                                  email: forgotEmail,
                                  otp,
                                  password: newPassword,
                                  confirmPassword: confirmNewPassword,
                                });
                                setForgotStatus(result?.message || 'Đổi mật khẩu thành công');
                                // Optional: tự động điền mật khẩu mới vào form đăng nhập
                                setPassword(newPassword);
                                setTimeout(() => {
                                  setForgotOpen(false);
                                  setForgotStep(1);
                                  setOtp('');
                                  setNewPassword('');
                                  setConfirmNewPassword('');
                                  setForgotStatus(null);
                                }, 2000);
                              } catch (err: any) {
                                console.error(err);
                                setForgotStatus(err?.message || 'Đổi mật khẩu thất bại');
                              } finally {
                                setForgotLoading(false);
                              }
                            }}
                            disabled={forgotLoading}
                          >
                            {forgotLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                  {forgotStatus && (
                    <div className="mt-3 text-sm text-green-600 break-words">
                      {forgotStatus}
                    </div>
                  )}
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