/* server/models/Lead.js */
const mongoose = require('mongoose');

// Schema cho sản phẩm quan tâm
const interestedProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: 'Khác' },
  budget: { type: Number, default: 0 },
  condition: { type: String, default: 'Không rõ' }
}, { _id: false });

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, default: '' },
  email: { type: String, default: '', lowercase: true, trim: true },
  zalo: { type: String, default: '' },
  messenger: { type: String, default: '' },
  location: { type: String, default: '' },
  interest: { type: String, default: '' },
  // Danh sách sản phẩm quan tâm (tách từ bài đăng)
  interestedProducts: [interestedProductSchema],
  type: { type: String, enum: ['buyer', 'seller', 'Buying', 'Selling'], default: 'buyer' },
  budget: { type: String, default: '' },
  budgetNumber: { type: Number, default: 0 },
  status: { type: String, enum: ['new', 'contacted', 'qualified', 'lost'], default: 'new' },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  urgency: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  requirements: { type: String, default: '' },
  source: { type: String, default: '' },
  lastContact: { type: Date, default: null },
  notes: { type: String, default: '' },
  // Thêm các trường mới cho scraper
  postUrl: { type: String, default: '' },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
  // Người quét/tạo lead
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdByEmail: { type: String, default: '' },
  // Người được assign xử lý
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedToEmail: { type: String, default: '' },
}, { timestamps: true });

// Index để tìm kiếm nhanh
leadSchema.index({ status: 1, priority: 1 });
leadSchema.index({ type: 1 });
leadSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Lead', leadSchema);
