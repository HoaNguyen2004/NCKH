import { useState, useEffect } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { Sidebar } from './components/Sidebar';
import { Login } from './components/pages/Login';
import { Register } from './components/pages/Register';
import { AdminDashboard } from './components/pages/AdminDashboard';
import { ManagerDashboard } from './components/pages/ManagerDashboard';
import { SalesDashboard } from './components/pages/SalesDashboard';
import { Dashboard } from './components/pages/Dashboard';
import { UserManagement } from './components/pages/UserManagement';
import { PostsManagement } from './components/pages/PostsManagement';
import { ProductsManagement } from './components/pages/ProductsManagement';
import { LeadsManagement } from './components/pages/LeadsManagement';
import { Conversations } from './components/pages/Conversations';
import { Reports } from './components/pages/Reports';
import { ContentFilter } from './components/pages/ContentFilter';
import { AISettings } from './components/pages/AISettings';
import { DataSources } from './components/pages/DataSources';
import { Research } from './components/pages/Research';
import { History } from './components/pages/History';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [userRole, setUserRole] = useState<'admin' | 'manager' | 'sales'>('admin');
  const [posts, setPosts] = useState<any[]>([]);

  const handleLogin = (email: string, password: string, remember: boolean = false) => {
    // Simple demo authentication with role detection
    if (email && password) {
      setIsLoggedIn(true);
      setShowRegister(false);
      
      // Detect role from email
      if (email.includes('admin')) {
        setUserRole('admin');
      } else if (email.includes('manager')) {
        setUserRole('manager');
      } else if (email.includes('sales')) {
        setUserRole('sales');
      }
      // Persist session when requested
      if (remember) {
        try {
          localStorage.setItem('aifilter.session', JSON.stringify({ isLoggedIn: true, userRole: email.includes('admin') ? 'admin' : email.includes('manager') ? 'manager' : email.includes('sales') ? 'sales' : 'sales' }));
        } catch (e) {
          // ignore
        }
      }
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem('aifilter.session');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.isLoggedIn && parsed.userRole) {
          setIsLoggedIn(true);
          setUserRole(parsed.userRole);
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleRegister = (userData: any) => {
    // Simple demo registration - in real app, would call API
    console.log('Registered user:', userData);
    setIsLoggedIn(true);
    setShowRegister(false);
    
    // Set role from registration
    if (userData.role === 'admin') {
      setUserRole('admin');
    } else if (userData.role === 'manager') {
      setUserRole('manager');
    } else {
      setUserRole('sales');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowRegister(false);
    setCurrentPage('dashboard');
    setUserRole('admin');
    try { localStorage.removeItem('aifilter.session'); } catch (e) {}
  };

  const handleAnalyzePost = (postData: any) => {
    const newPost = {
      id: Date.now(),
      content: postData.content.substring(0, 50) + '...',
      fullContent: postData.content,
      type: Math.random() > 0.5 ? 'Buying' : 'Selling',
      platform: postData.platform || 'Facebook',
      confidence: (Math.random() * 20 + 80).toFixed(1) + '%',
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
      author: postData.author || 'Unknown',
      price: Math.floor(Math.random() * 10000000) + 1000000,
      location: ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Hải Phòng'][Math.floor(Math.random() * 4)],
      category: ['Laptop', 'Phone', 'Furniture', 'Electronics'][Math.floor(Math.random() * 4)],
      status: 'new'
    };
    setPosts([newPost, ...posts]);
  };

  const renderPage = () => {
    // Render role-specific dashboard
    if (currentPage === 'dashboard') {
      switch (userRole) {
        case 'admin':
          return <AdminDashboard onNavigate={setCurrentPage} />;
        case 'manager':
          return <ManagerDashboard onNavigate={setCurrentPage} />;
        case 'sales':
          return <SalesDashboard onNavigate={setCurrentPage} />;
        default:
          return <Dashboard posts={posts} onAnalyze={handleAnalyzePost} />;
      }
    }

    switch (currentPage) {
      case 'users':
        return <UserManagement />;
      case 'posts':
        return <PostsManagement posts={posts} />;
      case 'products':
        return <ProductsManagement />;
      case 'leads':
        return <LeadsManagement posts={posts} />;
      case 'conversations':
        return <Conversations />;
      case 'reports':
        return <Reports posts={posts} />;
      case 'filter':
        return <ContentFilter posts={posts} />;
      case 'ai-settings':
        return <AISettings />;
      case 'sources':
        return <DataSources />;
      case 'research':
        return <Research />;
      case 'history':
        return <History posts={posts} />;
      default:
        return <Dashboard posts={posts} onAnalyze={handleAnalyzePost} />;
    }
  };

  return (
    <LanguageProvider>
      {!isLoggedIn ? (
        showRegister ? (
          <Register 
            onRegister={handleRegister}
            onShowLogin={() => setShowRegister(false)}
          />
        ) : (
          <Login 
            onLogin={handleLogin}
            onShowRegister={() => setShowRegister(true)}
          />
        )
      ) : (
        <div className="flex h-screen bg-gray-50">
          <Sidebar 
            currentPage={currentPage} 
            onPageChange={setCurrentPage} 
            onLogout={handleLogout}
            userRole={userRole}
          />
          {renderPage()}
        </div>
      )}
    </LanguageProvider>
  );
}