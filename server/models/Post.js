/* server/models/Post.js */
const mongoose = require('mongoose');

// Schema cho sản phẩm được tách từ bài đăng
const extractedProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: 'Khác' },
  price: { type: Number, default: 0 },
  priceText: { type: String, default: '' },
  condition: { type: String, enum: ['Mới', 'Đã sử dụng', 'Không rõ'], default: 'Không rõ' },
  description: { type: String, default: '' },
  brand: { type: String, default: '' }
}, { _id: true });

// Schema cho thông tin người mua (khách hàng tiềm năng)
const buyerInfoSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  budget: { type: String, default: '' },
  urgency: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  requirements: { type: String, default: '' }
}, { _id: false });

// Schema cho thông tin người bán
const sellerInfoSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  negotiable: { type: Boolean, default: true },
  warranty: { type: String, default: '' }
}, { _id: false });

// Schema cho thông tin liên hệ
const contactInfoSchema = new mongoose.Schema({
  phone: { type: String, default: '' },
  zalo: { type: String, default: '' },
  messenger: { type: String, default: '' }
}, { _id: false });

const postSchema = new mongoose.Schema({
  // Nội dung bài viết
  title: {
    type: String,
    required: true,
    maxlength: 500
  },
  fullContent: {
    type: String,
    required: true
  },
  
  // Phân loại
  type: {
    type: String,
    enum: ['Buying', 'Selling', 'Unknown'],
    default: 'Unknown'
  },
  category: {
    type: String,
    default: 'Khác'
  },
  
  // Nguồn
  platform: {
    type: String,
    enum: ['Facebook', 'Instagram', 'Twitter', 'Other'],
    default: 'Facebook'
  },
  sourceType: {
    type: String,
    enum: ['marketplace', 'group_post', 'newsfeed', 'other'],
    default: 'other'
  },
  
  // Thông tin bài viết
  url: {
    type: String,
    unique: true,
    sparse: true // Cho phép null nhưng unique khi có giá trị
  },
  image: String,
  price: {
    type: Number,
    default: 0
  },
  priceText: String,
  
  // Thông tin người đăng
  author: {
    type: String,
    default: 'Unknown'
  },
  authorId: String,
  location: {
    type: String,
    default: 'Việt Nam'
  },
  
  // Từ khóa đã match
  keyword: String,
  
  // Độ tin cậy phân tích AI
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 85
  },
  
  // Trạng thái xử lý
  status: {
    type: String,
    enum: ['new', 'processing', 'contacted', 'converted', 'archived'],
    default: 'new'
  },
  
  // Hash để kiểm tra trùng lặp
  contentHash: {
    type: String,
    index: true
  },
  
  // ========== PHẦN MỚI: Sản phẩm được tách từ bài đăng ==========
  // Danh sách sản phẩm được AI tách ra từ bài đăng
  extractedProducts: [extractedProductSchema],
  
  // Số lượng sản phẩm được tách
  productCount: {
    type: Number,
    default: 0
  },
  
  // Thông tin người mua (nếu là bài mua)
  buyerInfo: buyerInfoSchema,
  
  // Thông tin người bán (nếu là bài bán)
  sellerInfo: sellerInfoSchema,
  
  // Thông tin liên hệ trích xuất từ bài
  contactInfo: contactInfoSchema,
  
  // Đã được AI phân tích nâng cao chưa
  aiAnalyzed: {
    type: Boolean,
    default: false
  },
  
  // Thời gian phân tích AI
  aiAnalyzedAt: Date,
  // ========== KẾT THÚC PHẦN MỚI ==========
  
  // Metadata
  scrapedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: Date,
  
  // Ghi chú
  notes: String,
  
  // Người quét dữ liệu (userId)
  scrapedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  scrapedByEmail: {
    type: String,
    index: true
  }
}, {
  timestamps: true // Tự động thêm createdAt, updatedAt
});

// Index để tìm kiếm nhanh
postSchema.index({ platform: 1, type: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ status: 1 });
postSchema.index({ keyword: 1 });

// Static method tạo hash từ content
postSchema.statics.createContentHash = function(content) {
  if (!content) return '';
  return content.toLowerCase().replace(/\s+/g, ' ').trim().substring(0, 100);
};

// Pre-save middleware để tạo contentHash
postSchema.pre('save', function(next) {
  if (this.fullContent && !this.contentHash) {
    this.contentHash = this.constructor.createContentHash(this.fullContent);
  }
  next();
});

module.exports = mongoose.model('Post', postSchema);

