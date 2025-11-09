import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Login } from './components/pages/Login';
import { Register } from './components/pages/Register';
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
  const [posts, setPosts] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  const handleLogin = (userData: any) => {
    if (userData) {
      setUser(userData);
      setIsLoggedIn(true);
      setShowRegister(false);
    }
  };

  const handleRegister = (userData: any) => {
    if (userData) {
      setUser(userData);
      setIsLoggedIn(true);
      setShowRegister(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setShowRegister(false);
    setCurrentPage('dashboard');
    // Remove token from localStorage
    localStorage.removeItem('token');
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
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard posts={posts} onAnalyze={handleAnalyzePost} />;
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

  if (!isLoggedIn) {
    if (showRegister) {
      return (
        <Register 
          onRegister={handleRegister} 
          onSwitchToLogin={() => setShowRegister(false)} 
        />
      );
    }
    return (
      <Login 
        onLogin={handleLogin} 
        onSwitchToRegister={() => setShowRegister(true)}
      />
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} onLogout={handleLogout} />
      {renderPage()}
    </div>
  );
}