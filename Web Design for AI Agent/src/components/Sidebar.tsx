import { 
  Home, Users, FileText, ShoppingCart, UserCheck, MessageSquare, 
  BarChart3, Filter, Brain, Link, GraduationCap, History, Activity, LogOut 
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '../contexts/LanguageContext';
import logoImage from 'figma:asset/39f210f37c2c398aad05c42945540d65a295aca6.png';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout?: () => void;
  userRole?: 'admin' | 'manager' | 'sales';
}

export function Sidebar({ currentPage, onPageChange, onLogout, userRole = 'admin' }: SidebarProps) {
  const { t } = useLanguage();
  
  // Define menu items based on user role
  const getMenuItems = () => {
    const allItems = [
      { id: 'dashboard', icon: Home, label: t('sidebar.dashboard'), roles: ['admin', 'manager', 'sales'] },
      { id: 'users', icon: Users, label: t('sidebar.users'), roles: ['admin'] },
      { id: 'posts', icon: FileText, label: t('sidebar.posts'), roles: ['admin', 'manager', 'sales'] },
      { id: 'products', icon: ShoppingCart, label: t('sidebar.products'), roles: ['admin', 'manager'] },
      { id: 'leads', icon: UserCheck, label: t('sidebar.leads'), roles: ['admin', 'manager', 'sales'] },
      { id: 'conversations', icon: MessageSquare, label: t('sidebar.conversations'), roles: ['admin', 'manager', 'sales'] },
      { id: 'reports', icon: BarChart3, label: t('sidebar.reports'), roles: ['admin', 'manager'] },
      { id: 'ai-settings', icon: Brain, label: t('sidebar.aiSettings'), roles: ['admin'] },
      { id: 'sources', icon: Link, label: t('sidebar.sources'), roles: ['admin'] },
      { id: 'research', icon: GraduationCap, label: t('sidebar.research'), roles: ['admin'] },
    ];

    return allItems.filter(item => item.roles.includes(userRole));
  };

  const menuItems = getMenuItems();

  const getRoleBadge = () => {
    const badges: Record<string, { label: string; color: string }> = {
      admin: { label: t('role.admin'), color: 'bg-red-600' },
      manager: { label: t('role.manager'), color: 'bg-purple-600' },
      sales: { label: t('role.sales'), color: 'bg-blue-600' },
    };
    return badges[userRole] || badges.admin;
  };

  const roleBadge = getRoleBadge();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <img src={logoImage} alt="Logo" className="w-10 h-10 rounded-lg" />
          <Badge className={`${roleBadge.color} text-white`}>
            {roleBadge.label}
          </Badge>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Processing Status */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        <LanguageSwitcher />
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          onClick={onLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          {t('auth.logout')}
        </Button>
      </div>
    </aside>
  );
}