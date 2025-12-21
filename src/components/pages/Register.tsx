import { useState, useCallback } from 'react';
import { UserPlus, Mail, Lock, User, Phone, MapPin, Eye, EyeOff, Building2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
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
import { useLanguage } from '../../contexts/LanguageContext';

// Logo SVG component
const LogoIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="50" r="48" fill="currentColor" className="text-gray-900" />
    <g stroke="white" strokeWidth="2" fill="none">
      {/* Planet circle */}
      <ellipse cx="50" cy="50" rx="30" ry="30" />
      {/* Orbit ring */}
      <ellipse cx="50" cy="50" rx="42" ry="16" transform="rotate(-20 50 50)" />
      {/* Compass needle */}
      <path d="M50 25 L55 50 L50 75 L45 50 Z" fill="white" stroke="none" />
      <circle cx="50" cy="50" r="5" />
      {/* Star */}
      <path d="M75 22 L77 28 L83 28 L78 32 L80 38 L75 34 L70 38 L72 32 L67 28 L73 28 Z" fill="white" stroke="none" />
    </g>
  </svg>
);

// API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
import { sendRegisterOtp } from '../../utils/api';

interface RegisterProps {
  onRegister: (userData: any) => void;
  onShowLogin: () => void;
}

export function Register({ onRegister, onShowLogin }: RegisterProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    location: '',
    role: '',
    password: '',
    confirmPassword: '',
    otp: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // States cho kiểm tra email/phone realtime
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [phoneStatus, setPhoneStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [emailCheckTimeout, setEmailCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  const [phoneCheckTimeout, setPhoneCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  const [otpSending, setOtpSending] = useState(false);
  const [otpInfo, setOtpInfo] = useState<string | null>(null);

  // Hàm kiểm tra email đã tồn tại chưa
  const checkEmailExists = useCallback(async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailStatus('idle');
      return;
    }

    setEmailStatus('checking');
    try {
      const res = await fetch(`${API_URL}/auth/check-email?email=${encodeURIComponent(email)}`);
      const data = await res.json();

      if (data.success) {
        setEmailStatus(data.exists ? 'taken' : 'available');
        if (data.exists) {
          setErrors(prev => ({ ...prev, email: t('register.emailTaken') }));
        }
      }
    } catch (err) {
      console.error('Check email error:', err);
      setEmailStatus('idle');
    }
  }, [t]);

  // Hàm kiểm tra số điện thoại đã tồn tại chưa
  const checkPhoneExists = useCallback(async (phone: string) => {
    const normalizedPhone = phone.replace(/[\s\-\.]/g, '');
    if (!normalizedPhone || normalizedPhone.length < 10) {
      setPhoneStatus('idle');
      return;
    }

    setPhoneStatus('checking');
    try {
      const res = await fetch(`${API_URL}/auth/check-phone?phone=${encodeURIComponent(normalizedPhone)}`);
      const data = await res.json();

      if (data.success) {
        setPhoneStatus(data.exists ? 'taken' : 'available');
        if (data.exists) {
          setErrors(prev => ({ ...prev, phone: t('register.phoneTaken') }));
        }
      }
    } catch (err) {
      console.error('Check phone error:', err);
      setPhoneStatus('idle');
    }
  }, [t]);

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

    // Debounce check phone
    if (field === 'phone') {
      setPhoneStatus('idle');
      if (phoneCheckTimeout) clearTimeout(phoneCheckTimeout);
      const timeout = setTimeout(() => checkPhoneExists(value), 500);
      setPhoneCheckTimeout(timeout);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = t('register.validation.fullName');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('register.validation.email');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('register.validation.emailInvalid');
    } else if (emailStatus === 'taken') {
      newErrors.email = t('register.emailTaken');
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('register.validation.phone');
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = t('register.validation.phoneInvalid');
    } else if (phoneStatus === 'taken') {
      newErrors.phone = t('register.phoneTaken');
    }

    if (!formData.role) {
      newErrors.role = t('register.validation.role');
    }

    if (!formData.password) {
      newErrors.password = t('register.validation.password');
    } else if (formData.password.length < 6) {
      newErrors.password = t('register.validation.passwordMin');
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('register.validation.passwordMismatch');
    }

    if (!formData.otp.trim()) {
      newErrors.otp = t('register.validation.otp');
    }

    if (!agreeTerms) {
      newErrors.terms = t('register.validation.terms');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onRegister(formData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <LogoIcon className="w-20 h-20" />
          </div>

          <div className="space-y-4">
            <h2 className="text-gray-900 text-4xl">
              {t('register.startFree')}
            </h2>
            <p className="text-gray-600 text-lg">
              {t('register.createDesc')}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600">🚀</span>
              </div>
              <div>
                <div className="text-gray-900">{t('register.freeTrial')}</div>
                <div className="text-gray-500 text-sm">{t('register.noCard')}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600">⚡</span>
              </div>
              <div>
                <div className="text-gray-900">{t('register.setup5min')}</div>
                <div className="text-gray-500 text-sm">{t('register.easyFast')}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-green-600">💎</span>
              </div>
              <div>
                <div className="text-gray-900">{t('register.support247')}</div>
                <div className="text-gray-500 text-sm">{t('register.supportDesc')}</div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <p className="text-gray-500 text-sm">
              {t('register.haveAccount')}{' '}
              <button
                onClick={onShowLogin}
                className="text-purple-600 hover:underline"
              >
                {t('register.loginNow')}
              </button>
            </p>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>{t('register.createAccount')}</CardTitle>
            <CardDescription>
              {t('register.fillInfo')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t('register.fullName')} *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="fullName"
                      placeholder={t('register.namePlaceholder')}
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
                  <Label htmlFor="phone">{t('register.phone')} *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="phone"
                      placeholder={t('register.phonePlaceholder')}
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className={`pl-10 pr-10 ${errors.phone ? 'border-red-500' : phoneStatus === 'available' ? 'border-green-500' : ''}`}
                    />
                    {/* Icon trạng thái kiểm tra phone */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {phoneStatus === 'checking' && (
                        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                      )}
                      {phoneStatus === 'available' && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {phoneStatus === 'taken' && (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-sm">{errors.phone}</p>
                  )}
                  {phoneStatus === 'available' && !errors.phone && (
                    <p className="text-green-500 text-sm">✓ {t('register.phoneAvailable')}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')} *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`pl-10 pr-10 ${errors.email ? 'border-red-500' : emailStatus === 'available' ? 'border-green-500' : ''}`}
                  />
                  {/* Icon trạng thái kiểm tra email */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {emailStatus === 'checking' && (
                      <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                    )}
                    {emailStatus === 'available' && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {emailStatus === 'taken' && (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
                {emailStatus === 'available' && !errors.email && (
                  <p className="text-green-500 text-sm">✓ {t('register.emailAvailable')}</p>
                )}
              </div>

              <div className="mt-2 grid grid-cols-[2fr,1fr] gap-2">
                <div className="space-y-2">
                  <Label htmlFor="register-otp">{t('register.otpLabel')} *</Label>
                  <Input
                    id="register-otp"
                    placeholder={t('register.otpPlaceholder')}
                    value={formData.otp}
                    onChange={(e) => handleChange('otp', e.target.value)}
                    className={errors.otp ? 'border-red-500' : ''}
                  />
                  {errors.otp && (
                    <p className="text-red-500 text-sm">{errors.otp}</p>
                  )}
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={
                      otpSending ||
                      !formData.email ||
                      !!errors.email ||
                      emailStatus === 'checking' ||
                      emailStatus === 'taken'
                    }
                    onClick={async () => {
                      if (!formData.email) {
                        setErrors((prev) => ({
                          ...prev,
                          email: prev.email || t('register.enterEmailFirst'),
                        }));
                        return;
                      }

                      try {
                        setOtpSending(true);
                        setOtpInfo(t('register.otpSending'));
                        await sendRegisterOtp(formData.email);
                        setOtpInfo(t('register.otpSent'));
                      } catch (err: any) {
                        console.error('Send register OTP failed', err);
                        setOtpInfo(err?.message || t('register.otpError'));
                      } finally {
                        setOtpSending(false);
                      }
                    }}
                  >
                    {otpSending ? t('register.sendingOtp') : t('register.sendOtp')}
                  </Button>
                </div>
              </div>
              {otpInfo && (
                <p className="text-xs text-green-600 mt-1">{otpInfo}</p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">{t('register.company')}</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="company"
                      placeholder={t('register.companyPlaceholder')}
                      value={formData.company}
                      onChange={(e) => handleChange('company', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">{t('register.location')}</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="location"
                      placeholder={t('register.locationPlaceholder')}
                      value={formData.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">{t('register.role')} *</Label>
                <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
                  <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                    <SelectValue placeholder={t('register.rolePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smb">{t('register.roleSMB')}</SelectItem>
                    <SelectItem value="sales">{t('register.roleSales')}</SelectItem>
                    <SelectItem value="manager">{t('register.roleManager')}</SelectItem>
                    <SelectItem value="student">{t('register.roleStudent')}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-red-500 text-sm">{errors.role}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">{t('register.password')} *</Label>
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
                  <Label htmlFor="confirmPassword">{t('register.confirmPassword')} *</Label>
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
                    {t('register.agreeTerms')}{' '}
                    <button type="button" className="text-purple-600 hover:underline">
                      {t('register.termsOfUse')}
                    </button>
                    {' '}{t('register.and')}{' '}
                    <button type="button" className="text-purple-600 hover:underline">
                      {t('register.privacyPolicy')}
                    </button>
                  </Label>
                </div>
                {errors.terms && (
                  <p className="text-red-500 text-sm">{errors.terms}</p>
                )}
              </div>

              <Button type="submit" className="w-full">
                <UserPlus className="w-4 h-4 mr-2" />
                {t('register.createButton')}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              {t('register.consentText')}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}