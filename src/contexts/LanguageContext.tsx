import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'vi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  vi: {
    // Common
    'common.search': 'Tìm kiếm',
    'common.filter': 'Lọc',
    'common.export': 'Xuất dữ liệu',
    'common.add': 'Thêm mới',
    'common.edit': 'Chỉnh sửa',
    'common.delete': 'Xóa',
    'common.save': 'Lưu',
    'common.cancel': 'Hủy',
    'common.apply': 'Áp dụng',
    'common.view': 'Xem',
    'common.actions': 'Hành động',
    'common.status': 'Trạng thái',
    'common.date': 'Ngày',
    'common.from': 'Từ',
    'common.to': 'Đến',
    'common.selectDate': 'Chọn ngày',
    'common.name': 'Tên',
    'common.email': 'Email',
    'common.phone': 'Số điện thoại',
    'common.active': 'Hoạt động',
    'common.inactive': 'Không hoạt động',
    'common.all': 'Tất cả',
    
    // Auth
    'auth.login': 'Đăng nhập',
    'auth.logout': 'Đăng xuất',
    'auth.register': 'Đăng ký',
    'auth.email': 'Email',
    'auth.password': 'Mật khẩu',
    'auth.confirmPassword': 'Xác nhận mật khẩu',
    'auth.fullName': 'Họ và tên',
    'auth.role': 'Vai trò',
    'auth.rememberMe': 'Ghi nhớ đăng nhập',
    'auth.forgotPassword': 'Quên mật khẩu?',
    'auth.noAccount': 'Chưa có tài khoản?',
    'auth.haveAccount': 'Đã có tài khoản?',
    
    // Sidebar
    'sidebar.dashboard': 'Trang chủ',
    'sidebar.users': 'Người dùng',
    'sidebar.posts': 'Bài đăng',
    'sidebar.scraper': 'Quét dữ liệu',
    'sidebar.products': 'Sản phẩm',
    'sidebar.leads': 'Khách hàng tiềm năng',
    'sidebar.conversations': 'Cuộc trò chuyện',
    'sidebar.reports': 'Báo cáo',
    'sidebar.aiSettings': 'Hệ thống AI',
    'sidebar.sources': 'Kết nối',
    'sidebar.research': 'Nghiên cứu',
    
    // Admin Dashboard
    'admin.title': 'Trang quản trị',
    'admin.subtitle': 'Tổng quan hệ thống và quản lý',
    'admin.totalUsers': 'Tổng người dùng',
    'admin.activeSessions': 'Phiên hoạt động',
    'admin.apiCalls': 'API Calls hôm nay',
    'admin.systemUptime': 'Thời gian hoạt động',
    'admin.systemHealth': 'Giám sát sức khỏe hệ thống',
    'admin.recentActivities': 'Hoạt động gần đây',
    'admin.manageUsers': 'Quản lý người dùng',
    'admin.databaseBackup': 'Sao lưu dữ liệu',
    'admin.viewLogs': 'Xem nhật ký',
    'admin.analytics': 'Phân tích',
    
    // Manager Dashboard
    'manager.title': 'Trang quản lý',
    'manager.subtitle': 'Thông tin kinh doanh và quản lý đội nhóm',
    'manager.revenue': 'Doanh thu tháng này',
    'manager.totalLeads': 'Tổng khách hàng tiềm năng',
    'manager.conversionRate': 'Tỷ lệ chuyển đổi',
    'manager.teamMembers': 'Thành viên đội nhóm',
    'manager.teamPerformance': 'Hiệu suất đội nhóm',
    'manager.productTrends': 'Xu hướng sản phẩm',
    'manager.revenueOverview': 'Tổng quan doanh thu',
    'manager.fullReport': 'Báo cáo đầy đủ',
    'manager.thisMonth': 'Tháng này',
    'manager.7days': '7 ngày qua',
    'manager.90days': '90 ngày qua',
    'manager.custom': 'Tùy chỉnh',
    'manager.manageTeam': 'Quản lý đội nhóm',
    'manager.viewAllLeads': 'Xem tất cả khách hàng',
    'manager.reports': 'Báo cáo',
    'manager.setGoals': 'Đặt mục tiêu',
    
    // Sales Dashboard
    'sales.title': 'Trang bán hàng',
    'sales.subtitle': 'Hoạt động bán hàng và khách hàng tiềm năng hàng ngày',
    'sales.myLeads': 'Khách hàng của tôi',
    'sales.activeChats': 'Cuộc trò chuyện đang hoạt động',
    'sales.callsMade': 'Cuộc gọi đã thực hiện',
    'sales.conversionRate': 'Tỷ lệ chuyển đổi',
    'sales.urgentLeads': 'Khách hàng cần xử lý gấp',
    'sales.recentChats': 'Cuộc trò chuyện gần đây',
    'sales.todayTasks': 'Nhiệm vụ hôm nay',
    'sales.makeCall': 'Thực hiện cuộc gọi',
    'sales.sendMessage': 'Gửi tin nhắn',
    'sales.addLead': 'Thêm khách hàng',
    'sales.updateStatus': 'Cập nhật trạng thái',
    'sales.myStats': 'Thống kê của tôi',
    'sales.viewAllChats': 'Xem tất cả cuộc trò chuyện',
    
    // Users Page
    'users.title': 'Quản lý người dùng',
    'users.subtitle': 'Quản lý tài khoản người dùng và phân quyền',
    'users.addUser': 'Thêm người dùng',
    'users.totalUsers': 'Tổng số người dùng',
    'users.activeUsers': 'Người dùng hoạt động',
    'users.newThisMonth': 'Mới trong tháng',
    'users.role': 'Vai trò',
    'users.lastActive': 'Hoạt động lần cuối',
    'users.postsAnalyzed': 'Bài đăng đã phân tích',
    'users.viewDetails': 'Xem chi tiết',
    
    // Posts Page
    'posts.title': 'Quản lý bài đăng',
    'posts.subtitle': 'Bài đăng từ mạng xã hội đã thu thập và phân tích',
    'posts.totalPosts': 'Tổng bài đăng',
    'posts.buyingDemand': 'Cần mua',
    'posts.sellingDemand': 'Cần bán',
    'posts.filtered': 'Đã lọc',
    'posts.platform': 'Nền tảng',
    'posts.content': 'Nội dung',
    'posts.sentiment': 'Cảm xúc',
    'posts.author': 'Tác giả',
    'posts.type': 'Loại',
    'posts.buying': 'Mua',
    'posts.selling': 'Bán',
    'posts.spam': 'Spam',
    'posts.positive': 'Tích cực',
    'posts.neutral': 'Trung tính',
    'posts.negative': 'Tiêu cực',
    
    // Products Page
    'products.title': 'Quản lý sản phẩm',
    'products.subtitle': 'Sản phẩm được trích xuất từ bài đăng',
    'products.addProduct': 'Thêm sản phẩm',
    'products.totalProducts': 'Tổng sản phẩm',
    'products.highDemand': 'Nhu cầu cao',
    'products.avgPrice': 'Giá trung bình',
    'products.product': 'Sản phẩm',
    'products.category': 'Danh mục',
    'products.price': 'Giá',
    'products.demand': 'Nhu cầu',
    'products.mentions': 'Đề cập',
    'products.trend': 'Xu hướng',
    'products.high': 'Cao',
    'products.medium': 'Trung bình',
    'products.low': 'Thấp',
    'products.trending': 'Đang tăng',
    'products.stable': 'Ổn định',
    'products.declining': 'Giảm',
    
    // Leads Page
    'leads.title': 'Quản lý khách hàng tiềm năng',
    'leads.subtitle': 'Theo dõi và quản lý khách hàng tiềm năng',
    'leads.addLead': 'Thêm khách hàng',
    'leads.totalLeads': 'Tổng khách hàng',
    'leads.hot': 'Nóng',
    'leads.contacted': 'Đã liên hệ',
    'leads.converted': 'Đã chuyển đổi',
    'leads.lead': 'Khách hàng',
    'leads.contact': 'Liên hệ',
    'leads.interest': 'Quan tâm',
    'leads.source': 'Nguồn',
    'leads.assignedTo': 'Phân công cho',
    'leads.priority': 'Ưu tiên',
    'leads.new': 'Mới',
    'leads.inProgress': 'Đang xử lý',
    'leads.closed': 'Đã đóng',
    
    // Conversations Page
    'conversations.title': 'Cuộc trò chuyện',
    'conversations.subtitle': 'Quản lý tin nhắn và tương tác với khách hàng',
    'conversations.totalChats': 'Tổng cuộc trò chuyện',
    'conversations.unread': 'Chưa đọc',
    'conversations.avgResponse': 'Phản hồi TB',
    'conversations.satisfaction': 'Hài lòng',
    'conversations.selectChat': 'Chọn cuộc trò chuyện để xem chi tiết',
    'conversations.typeMessage': 'Nhập tin nhắn...',
    'conversations.send': 'Gửi',
    
    // Reports Page
    'reports.title': 'Báo cáo và phân tích',
    'reports.subtitle': 'Tổng quan hiệu suất và xu hướng',
    'reports.generateReport': 'Tạo báo cáo',
    'reports.totalRevenue': 'Tổng doanh thu',
    'reports.newLeads': 'Khách hàng mới',
    'reports.conversionRate': 'Tỷ lệ chuyển đổi',
    'reports.customerSatisfaction': 'Sự hài lòng khách hàng',
    'reports.performanceOverview': 'Tổng quan hiệu suất',
    'reports.topProducts': 'Sản phẩm hàng đầu',
    
    // AI Settings Page
    'ai.title': 'Cài đặt hệ thống AI',
    'ai.subtitle': 'Cấu hình và quản lý các mô hình AI',
    'ai.models': 'Mô hình AI',
    'ai.nlpModel': 'Mô hình NLP',
    'ai.ocrModel': 'Mô hình OCR',
    'ai.spamDetector': 'Phát hiện Spam',
    'ai.priceExtractor': 'Trích xuất giá',
    'ai.confidence': 'Độ tin cậy',
    'ai.accuracy': 'Độ chính xác',
    'ai.performance': 'Hiệu suất',
    'ai.configure': 'Cấu hình',
    'ai.retrain': 'Huấn luyện lại',
    
    // Sources Page
    'sources.title': 'Kết nối nguồn dữ liệu',
    'sources.subtitle': 'Quản lý kết nối mạng xã hội và thu thập dữ liệu',
    'sources.addSource': 'Thêm nguồn mới',
    'sources.source': 'Nguồn',
    'sources.connected': 'Đã kết nối',
    'sources.postsCollected': 'Bài đăng thu thập',
    'sources.lastSync': 'Đồng bộ lần cuối',
    'sources.syncNow': 'Đồng bộ ngay',
    'sources.disconnect': 'Ngắt kết nối',
    
    // Research Page
    'research.title': 'Nghiên cứu thị trường',
    'research.subtitle': 'Phân tích xu hướng và insights thị trường',
    'research.startResearch': 'Bắt đầu nghiên cứu',
    'research.marketTrends': 'Xu hướng thị trường',
    'research.keywords': 'Từ khóa',
    'research.insights': 'Insights',
    
    // Roles
    'role.admin': 'Quản trị viên',
    'role.manager': 'Quản lý',
    'role.sales': 'Nhân viên bán hàng',
    'role.student': 'Sinh viên IT',

    // Account
    'account.button': 'Tài khoản',
    'account.title': 'Quản lý tài khoản',
    'account.subtitle': 'Xem và chỉnh sửa thông tin tài khoản của bạn',
    'account.profileTab': 'Thông tin cá nhân',
    'account.passwordTab': 'Đổi mật khẩu',
    'account.createdAt': 'Ngày tạo',
    'account.unknown': 'Không xác định',
    'account.enterName': 'Nhập họ và tên',
    'account.emailCannotChange': 'Email không thể thay đổi',
    'account.currentPassword': 'Mật khẩu hiện tại',
    'account.newPassword': 'Mật khẩu mới',
    'account.enterCurrentPassword': 'Nhập mật khẩu hiện tại',
    'account.enterNewPassword': 'Nhập mật khẩu mới',
    'account.confirmNewPassword': 'Xác nhận mật khẩu mới',
    'account.changePassword': 'Đổi mật khẩu',
    'account.saving': 'Đang lưu...',
    'account.updateSuccess': 'Cập nhật thông tin thành công',
    'account.updateFailed': 'Cập nhật thông tin thất bại',
    'account.changePasswordSuccess': 'Đổi mật khẩu thành công',
    'account.changePasswordFailed': 'Đổi mật khẩu thất bại',
    'account.fillAllFields': 'Vui lòng điền đầy đủ thông tin',
    'account.passwordMismatch': 'Mật khẩu xác nhận không khớp',
    'account.passwordTooShort': 'Mật khẩu phải có ít nhất 6 ký tự',
    'account.enterPhone': 'Nhập số điện thoại',
    'account.company': 'Công ty / Tổ chức',
    'account.enterCompany': 'Nhập tên công ty hoặc tổ chức',
    'account.location': 'Địa chỉ',
    'account.enterLocation': 'Nhập địa chỉ của bạn',
  },
  en: {
    // Common
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.add': 'Add New',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.apply': 'Apply',
    'common.view': 'View',
    'common.actions': 'Actions',
    'common.status': 'Status',
    'common.date': 'Date',
    'common.from': 'From',
    'common.to': 'To',
    'common.selectDate': 'Select date',
    'common.name': 'Name',
    'common.email': 'Email',
    'common.phone': 'Phone',
    'common.active': 'Active',
    'common.inactive': 'Inactive',
    'common.all': 'All',
    
    // Auth
    'auth.login': 'Login',
    'auth.logout': 'Logout',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.fullName': 'Full Name',
    'auth.role': 'Role',
    'auth.rememberMe': 'Remember me',
    'auth.forgotPassword': 'Forgot password?',
    'auth.noAccount': "Don't have an account?",
    'auth.haveAccount': 'Already have an account?',
    
    // Sidebar
    'sidebar.dashboard': 'Dashboard',
    'sidebar.users': 'Users',
    'sidebar.posts': 'Posts',
    'sidebar.scraper': 'Data Scraper',
    'sidebar.products': 'Products',
    'sidebar.leads': 'Leads',
    'sidebar.conversations': 'Conversations',
    'sidebar.reports': 'Reports',
    'sidebar.aiSettings': 'AI System',
    'sidebar.sources': 'Connections',
    'sidebar.research': 'Research',
    
    // Admin Dashboard
    'admin.title': 'Admin Dashboard',
    'admin.subtitle': 'System overview and management',
    'admin.totalUsers': 'Total Users',
    'admin.activeSessions': 'Active Sessions',
    'admin.apiCalls': 'API Calls Today',
    'admin.systemUptime': 'System Uptime',
    'admin.systemHealth': 'System Health Monitor',
    'admin.recentActivities': 'Recent Activities',
    'admin.manageUsers': 'Manage Users',
    'admin.databaseBackup': 'Database Backup',
    'admin.viewLogs': 'View Logs',
    'admin.analytics': 'Analytics',
    
    // Manager Dashboard
    'manager.title': 'Manager Dashboard',
    'manager.subtitle': 'Business insights and team management',
    'manager.revenue': 'Revenue This Month',
    'manager.totalLeads': 'Total Leads',
    'manager.conversionRate': 'Conversion Rate',
    'manager.teamMembers': 'Team Members',
    'manager.teamPerformance': 'Team Performance',
    'manager.productTrends': 'Product Trends',
    'manager.revenueOverview': 'Revenue Overview',
    'manager.fullReport': 'Full Report',
    'manager.thisMonth': 'This Month',
    'manager.7days': 'Last 7 days',
    'manager.90days': 'Last 90 days',
    'manager.custom': 'Custom',
    'manager.manageTeam': 'Manage Team',
    'manager.viewAllLeads': 'View All Leads',
    'manager.reports': 'Reports',
    'manager.setGoals': 'Set Goals',
    
    // Sales Dashboard
    'sales.title': 'Sales Dashboard',
    'sales.subtitle': 'Your daily sales activities and leads',
    'sales.myLeads': 'My Leads',
    'sales.activeChats': 'Active Chats',
    'sales.callsMade': 'Calls Made',
    'sales.conversionRate': 'Conversion Rate',
    'sales.urgentLeads': 'Urgent Leads - Action Required',
    'sales.recentChats': 'Recent Chats',
    'sales.todayTasks': "Today's Tasks",
    'sales.makeCall': 'Make Call',
    'sales.sendMessage': 'Send Message',
    'sales.addLead': 'Add Lead',
    'sales.updateStatus': 'Update Status',
    'sales.myStats': 'My Stats',
    'sales.viewAllChats': 'View All Chats',
    
    // Users Page
    'users.title': 'User Management',
    'users.subtitle': 'Manage user accounts and permissions',
    'users.addUser': 'Add User',
    'users.totalUsers': 'Total Users',
    'users.activeUsers': 'Active Users',
    'users.newThisMonth': 'New This Month',
    'users.role': 'Role',
    'users.lastActive': 'Last Active',
    'users.postsAnalyzed': 'Posts Analyzed',
    'users.viewDetails': 'View Details',
    
    // Posts Page
    'posts.title': 'Posts Management',
    'posts.subtitle': 'Social media posts collected and analyzed',
    'posts.totalPosts': 'Total Posts',
    'posts.buyingDemand': 'Buying Demand',
    'posts.sellingDemand': 'Selling Demand',
    'posts.filtered': 'Filtered',
    'posts.platform': 'Platform',
    'posts.content': 'Content',
    'posts.sentiment': 'Sentiment',
    'posts.author': 'Author',
    'posts.type': 'Type',
    'posts.buying': 'Buying',
    'posts.selling': 'Selling',
    'posts.spam': 'Spam',
    'posts.positive': 'Positive',
    'posts.neutral': 'Neutral',
    'posts.negative': 'Negative',
    
    // Products Page
    'products.title': 'Product Management',
    'products.subtitle': 'Products extracted from social media posts',
    'products.addProduct': 'Add Product',
    'products.totalProducts': 'Total Products',
    'products.highDemand': 'High Demand',
    'products.avgPrice': 'Avg Price',
    'products.product': 'Product',
    'products.category': 'Category',
    'products.price': 'Price',
    'products.demand': 'Demand',
    'products.mentions': 'Mentions',
    'products.trend': 'Trend',
    'products.high': 'High',
    'products.medium': 'Medium',
    'products.low': 'Low',
    'products.trending': 'Trending',
    'products.stable': 'Stable',
    'products.declining': 'Declining',
    
    // Leads Page
    'leads.title': 'Lead Management',
    'leads.subtitle': 'Track and manage potential customers',
    'leads.addLead': 'Add Lead',
    'leads.totalLeads': 'Total Leads',
    'leads.hot': 'Hot Leads',
    'leads.contacted': 'Contacted',
    'leads.converted': 'Converted',
    'leads.lead': 'Lead',
    'leads.contact': 'Contact',
    'leads.interest': 'Interest',
    'leads.source': 'Source',
    'leads.assignedTo': 'Assigned To',
    'leads.priority': 'Priority',
    'leads.new': 'New',
    'leads.inProgress': 'In Progress',
    'leads.closed': 'Closed',
    
    // Conversations Page
    'conversations.title': 'Conversations',
    'conversations.subtitle': 'Manage messages and customer interactions',
    'conversations.totalChats': 'Total Chats',
    'conversations.unread': 'Unread',
    'conversations.avgResponse': 'Avg Response',
    'conversations.satisfaction': 'Satisfaction',
    'conversations.selectChat': 'Select a chat to view details',
    'conversations.typeMessage': 'Type a message...',
    'conversations.send': 'Send',
    
    // Reports Page
    'reports.title': 'Reports & Analytics',
    'reports.subtitle': 'Performance overview and trends',
    'reports.generateReport': 'Generate Report',
    'reports.totalRevenue': 'Total Revenue',
    'reports.newLeads': 'New Leads',
    'reports.conversionRate': 'Conversion Rate',
    'reports.customerSatisfaction': 'Customer Satisfaction',
    'reports.performanceOverview': 'Performance Overview',
    'reports.topProducts': 'Top Products',
    
    // AI Settings Page
    'ai.title': 'AI System Settings',
    'ai.subtitle': 'Configure and manage AI models',
    'ai.models': 'AI Models',
    'ai.nlpModel': 'NLP Model',
    'ai.ocrModel': 'OCR Model',
    'ai.spamDetector': 'Spam Detector',
    'ai.priceExtractor': 'Price Extractor',
    'ai.confidence': 'Confidence',
    'ai.accuracy': 'Accuracy',
    'ai.performance': 'Performance',
    'ai.configure': 'Configure',
    'ai.retrain': 'Retrain',
    
    // Sources Page
    'sources.title': 'Data Sources',
    'sources.subtitle': 'Manage social media connections and data collection',
    'sources.addSource': 'Add New Source',
    'sources.source': 'Source',
    'sources.connected': 'Connected',
    'sources.postsCollected': 'Posts Collected',
    'sources.lastSync': 'Last Sync',
    'sources.syncNow': 'Sync Now',
    'sources.disconnect': 'Disconnect',
    
    // Research Page
    'research.title': 'Market Research',
    'research.subtitle': 'Analyze market trends and insights',
    'research.startResearch': 'Start Research',
    'research.marketTrends': 'Market Trends',
    'research.keywords': 'Keywords',
    'research.insights': 'Insights',
    
    // Roles
    'role.admin': 'Administrator',
    'role.manager': 'Manager',
    'role.sales': 'Sales Staff',
    'role.student': 'IT Student',

    // Account
    'account.button': 'Account',
    'account.title': 'Account Management',
    'account.subtitle': 'View and edit your account information',
    'account.profileTab': 'Profile',
    'account.passwordTab': 'Change Password',
    'account.createdAt': 'Created',
    'account.unknown': 'Unknown',
    'account.enterName': 'Enter your full name',
    'account.emailCannotChange': 'Email cannot be changed',
    'account.currentPassword': 'Current Password',
    'account.newPassword': 'New Password',
    'account.enterCurrentPassword': 'Enter current password',
    'account.enterNewPassword': 'Enter new password',
    'account.confirmNewPassword': 'Confirm new password',
    'account.changePassword': 'Change Password',
    'account.saving': 'Saving...',
    'account.updateSuccess': 'Profile updated successfully',
    'account.updateFailed': 'Failed to update profile',
    'account.changePasswordSuccess': 'Password changed successfully',
    'account.changePasswordFailed': 'Failed to change password',
    'account.fillAllFields': 'Please fill in all fields',
    'account.passwordMismatch': 'Passwords do not match',
    'account.passwordTooShort': 'Password must be at least 6 characters',
    'account.enterPhone': 'Enter phone number',
    'account.company': 'Company / Organization',
    'account.enterCompany': 'Enter company or organization name',
    'account.location': 'Address',
    'account.enterLocation': 'Enter your address',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Khởi tạo ngôn ngữ từ localStorage hoặc mặc định là 'vi'
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('aifilter.language');
      if (saved === 'en' || saved === 'vi') return saved;
    } catch {
      // ignore
    }
    return 'vi';
  });

  // Wrapper để lưu vào localStorage khi thay đổi ngôn ngữ
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('aifilter.language', lang);
    } catch {
      // ignore
    }
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['vi']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}