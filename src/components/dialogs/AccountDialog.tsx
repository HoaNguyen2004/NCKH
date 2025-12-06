import { useState, useEffect } from 'react';
import { User, Lock, Calendar, Shield, Save, Eye, EyeOff, Phone, Building2, MapPin } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useLanguage } from '../../contexts/LanguageContext';
import { getMe, getToken } from '../../utils/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRole: 'admin' | 'manager' | 'sales';
}

interface UserInfo {
  _id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  company?: string;
  location?: string;
  role?: string;
  createdAt?: string;
}

export function AccountDialog({ open, onOpenChange, userRole }: AccountDialogProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // User info state
  const [userInfo, setUserInfo] = useState<UserInfo>({});
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch user info when dialog opens
  useEffect(() => {
    if (open) {
      fetchUserInfo();
    }
  }, [open]);

  const fetchUserInfo = async () => {
    try {
      const result = await getMe();
      if (result?.user) {
        setUserInfo(result.user);
        setName(result.user.fullName || '');
        setEmail(result.user.email || '');
        setPhone(result.user.phone || '');
        setCompany(result.user.company || '');
        setLocation(result.user.location || '');
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const getRoleBadge = () => {
    const badges: Record<string, { label: string; color: string }> = {
      admin: { label: t('role.admin'), color: 'bg-red-600' },
      manager: { label: t('role.manager'), color: 'bg-purple-600' },
      sales: { label: t('role.sales'), color: 'bg-blue-600' },
    };
    return badges[userRole] || badges.admin;
  };

  const roleBadge = getRoleBadge();

  const formatDate = (dateString?: string) => {
    if (!dateString) return t('account.unknown');
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return t('account.unknown');
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, phone, company, location })
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json?.message || t('account.updateFailed'));
      }
      
      setMessage({ type: 'success', text: t('account.updateSuccess') });
      // Refresh user info
      await fetchUserInfo();
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message || t('account.updateFailed') });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setMessage(null);
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: t('account.fillAllFields') });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: t('account.passwordMismatch') });
      return;
    }
    
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: t('account.passwordTooShort') });
      return;
    }
    
    setLoading(true);
    
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        })
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json?.message || t('account.changePasswordFailed'));
      }
      
      setMessage({ type: 'success', text: t('account.changePasswordSuccess') });
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.message || t('account.changePasswordFailed') });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMessage(null);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {t('account.title')}
          </DialogTitle>
          <DialogDescription>
            {t('account.subtitle')}
          </DialogDescription>
        </DialogHeader>

        {/* Role and Created Date Badges */}
        <div className="flex flex-wrap gap-2 pb-2">
          <Badge className={`${roleBadge.color} text-white flex items-center gap-1.5`}>
            <Shield className="w-3.5 h-3.5" />
            {roleBadge.label}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1.5 text-gray-600">
            <Calendar className="w-3.5 h-3.5" />
            {t('account.createdAt')}: {formatDate(userInfo.createdAt)}
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {t('account.profileTab')}
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              {t('account.passwordTab')}
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4 pt-4 max-h-[400px] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label htmlFor="name">{t('auth.fullName')}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('account.enterName')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                value={email}
                disabled
                className="bg-gray-50 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500">{t('account.emailCannotChange')}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {t('common.phone')}
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('account.enterPhone')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {t('account.company')}
              </Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder={t('account.enterCompany')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {t('account.location')}
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t('account.enterLocation')}
              />
            </div>

            {message && activeTab === 'profile' && (
              <div className={`p-3 rounded-lg text-sm ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            <Button 
              onClick={handleUpdateProfile} 
              disabled={loading}
              className="w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? t('account.saving') : t('common.save')}
            </Button>
          </TabsContent>

          {/* Password Tab */}
          <TabsContent value="password" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">{t('account.currentPassword')}</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={t('account.enterCurrentPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t('account.newPassword')}</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('account.enterNewPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('account.confirmNewPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {message && activeTab === 'password' && (
              <div className={`p-3 rounded-lg text-sm ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            <Button 
              onClick={handleChangePassword} 
              disabled={loading}
              className="w-full"
            >
              <Lock className="w-4 h-4 mr-2" />
              {loading ? t('account.saving') : t('account.changePassword')}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

