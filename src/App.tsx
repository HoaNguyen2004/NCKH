import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
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

// Backend API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [userRole, setUserRole] = useState<'admin' | 'manager' | 'sales'>('admin');
  const [posts, setPosts] = useState<any[]>([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

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

  // ==========================================
  // SOCKET.IO CONNECTION & REAL-TIME UPDATES
  // ==========================================
  
  // Fetch posts from API
  const fetchPosts = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/posts?limit=200`);
      const data = await response.json();
      if (data.success && data.posts) {
        // Chuyển đổi từ database format sang frontend format
        const formattedPosts = data.posts.map((post: any) => ({
          id: post._id,
          content: post.title,
          fullContent: post.fullContent,
          type: post.type,
          platform: post.platform,
          confidence: post.confidence + '%',
          time: new Date(post.createdAt).toLocaleTimeString(),
          date: new Date(post.createdAt).toLocaleDateString(),
          author: post.author,
          price: post.price,
          location: post.location,
          category: post.category,
          status: post.status,
          url: post.url,
          image: post.image
        }));
        setPosts(formattedPosts);
        console.log(`📥 Loaded ${formattedPosts.length} posts from database`);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  }, []);

  // Socket.IO connection
  useEffect(() => {
    // Kết nối Socket.IO
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 Socket connected:', socket.id);
      setSocketConnected(true);
      // Subscribe để nhận cập nhật posts
      socket.emit('posts:subscribe');
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      setSocketConnected(false);
    });

    // 🔥 REAL-TIME: Nhận bài viết mới từ server
    socket.on('posts:new', (data: { count: number; posts: any[] }) => {
      console.log(`📡 Real-time: Received ${data.count} new posts`);
      
      // Chuyển đổi và thêm vào state
      const newPosts = data.posts.map((post: any) => ({
        id: post._id,
        content: post.title,
        fullContent: post.fullContent,
        type: post.type,
        platform: post.platform,
        confidence: post.confidence + '%',
        time: new Date(post.createdAt).toLocaleTimeString(),
        date: new Date(post.createdAt).toLocaleDateString(),
        author: post.author,
        price: post.price,
        location: post.location,
        category: post.category,
        status: post.status,
        url: post.url,
        image: post.image
      }));

      setPosts(prev => [...newPosts, ...prev]);
      
      // Hiển thị notification (có thể thêm toast notification ở đây)
      console.log(`✅ Added ${newPosts.length} new posts to UI`);
    });

    // Nhận cập nhật bài viết
    socket.on('posts:updated', (data: { post: any }) => {
      setPosts(prev => prev.map(p => 
        p.id === data.post._id ? { ...p, ...data.post } : p
      ));
    });

    // Nhận thông báo xóa bài viết
    socket.on('posts:deleted', (data: { id: string }) => {
      setPosts(prev => prev.filter(p => p.id !== data.id));
    });

    // Xóa tất cả posts
    socket.on('posts:cleared', () => {
      setPosts([]);
    });

    // Cleanup
    return () => {
      socket.emit('posts:unsubscribe');
      socket.disconnect();
    };
  }, []);

  // Fetch posts khi đăng nhập thành công
  useEffect(() => {
    if (isLoggedIn) {
      fetchPosts();
    }
  }, [isLoggedIn, fetchPosts]);

  // Hàm tạo hash từ nội dung để kiểm tra trùng lặp
  const createContentHash = (content: string): string => {
    // Chuẩn hóa nội dung: lowercase, bỏ khoảng trắng thừa, lấy 100 ký tự đầu
    const normalized = content?.toLowerCase().replace(/\s+/g, ' ').trim().substring(0, 100) || '';
    return normalized;
  };

  // Hàm lọc bài viết trùng lặp
  const filterDuplicates = (newItems: any[], existingPosts: any[]): any[] => {
    // Tạo Set chứa các URL và content hash của bài viết đã có
    const existingUrls = new Set(existingPosts.map(p => p.url?.split('?')[0]).filter(Boolean));
    const existingHashes = new Set(existingPosts.map(p => createContentHash(p.fullContent || p.content)));
    
    const uniqueItems: any[] = [];
    const seenInBatch = new Set<string>(); // Kiểm tra trùng trong cùng batch

    for (const item of newItems) {
      const url = item.url?.split('?')[0]; // Bỏ query params
      const contentHash = createContentHash(item.fullText || item.title);
      
      // Kiểm tra trùng lặp
      const isDuplicateUrl = url && existingUrls.has(url);
      const isDuplicateContent = contentHash && existingHashes.has(contentHash);
      const isDuplicateInBatch = seenInBatch.has(url || contentHash);

      if (!isDuplicateUrl && !isDuplicateContent && !isDuplicateInBatch) {
        uniqueItems.push(item);
        if (url) seenInBatch.add(url);
        if (contentHash) seenInBatch.add(contentHash);
      }
    }

    return uniqueItems;
  };

  // Lắng nghe dữ liệu từ Facebook Scraper
  useEffect(() => {
    // Lắng nghe postMessage từ popup window scraper
    const handleScraperMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SCRAPER_DATA') {
        const { items } = event.data.data;
        if (items && items.length > 0) {
          setPosts(prevPosts => {
            // Lọc bài viết trùng lặp
            const uniqueItems = filterDuplicates(items, prevPosts);
            
            if (uniqueItems.length === 0) {
              console.log(`Đã lọc ${items.length} bài trùng lặp, không có bài mới`);
              return prevPosts;
            }

            console.log(`Đã lọc ${items.length - uniqueItems.length} bài trùng lặp, thêm ${uniqueItems.length} bài mới`);

            // Chuyển đổi dữ liệu từ scraper sang format posts
            const newPosts = uniqueItems.map((item: any, index: number) => ({
              id: Date.now() + index,
              content: item.title || item.fullText?.substring(0, 50) + '...',
              fullContent: item.fullText || item.title,
              type: item.type === 'marketplace' ? 'Selling' : 'Buying',
              platform: 'Facebook',
              confidence: (Math.random() * 20 + 80).toFixed(1) + '%',
              time: new Date().toLocaleTimeString(),
              date: new Date().toLocaleDateString(),
              author: item.author || 'Unknown',
              price: item.price ? parseInt(item.price.replace(/[^\d]/g, '')) || 0 : 0,
              location: item.location || 'Việt Nam',
              category: item.keyword || 'Khác',
              status: 'new',
              url: item.url,
              image: item.image
            }));

            return [...newPosts, ...prevPosts];
          });
          // Chuyển đến trang posts
          setCurrentPage('posts');
        }
      }
    };

    window.addEventListener('message', handleScraperMessage);

    // Kiểm tra localStorage khi focus lại window
    const checkScraperData = () => {
      const savedData = localStorage.getItem('scraperData');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          // Chỉ load nếu dữ liệu mới (trong vòng 5 phút)
          if (parsed.timestamp && Date.now() - parsed.timestamp < 5 * 60 * 1000 && parsed.items?.length > 0) {
            setPosts(prevPosts => {
              // Lọc bài viết trùng lặp
              const uniqueItems = filterDuplicates(parsed.items, prevPosts);
              
              if (uniqueItems.length === 0) {
                console.log(`Đã lọc ${parsed.items.length} bài trùng lặp, không có bài mới`);
                return prevPosts;
              }

              console.log(`Đã lọc ${parsed.items.length - uniqueItems.length} bài trùng lặp, thêm ${uniqueItems.length} bài mới`);

              const newPosts = uniqueItems.map((item: any, index: number) => ({
                id: Date.now() + index,
                content: item.title || item.fullText?.substring(0, 50) + '...',
                fullContent: item.fullText || item.title,
                type: item.type === 'marketplace' ? 'Selling' : 'Buying',
                platform: 'Facebook',
                confidence: (Math.random() * 20 + 80).toFixed(1) + '%',
                time: new Date().toLocaleTimeString(),
                date: new Date().toLocaleDateString(),
                author: item.author || 'Unknown',
                price: item.price ? parseInt(item.price.replace(/[^\d]/g, '')) || 0 : 0,
                location: item.location || 'Việt Nam',
                category: item.keyword || 'Khác',
                status: 'new',
                url: item.url,
                image: item.image
              }));

              return [...newPosts, ...prevPosts];
            });
            setCurrentPage('posts');
            // Xóa dữ liệu sau khi đã load
            localStorage.removeItem('scraperData');
          }
        } catch (e) {
          console.error('Error parsing scraper data:', e);
        }
      }
    };

    checkScraperData();
    window.addEventListener('focus', checkScraperData);

    return () => {
      window.removeEventListener('message', handleScraperMessage);
      window.removeEventListener('focus', checkScraperData);
    };
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
        return <PostsManagement posts={posts} socketConnected={socketConnected} />;
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