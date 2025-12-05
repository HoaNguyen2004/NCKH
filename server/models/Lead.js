/* server/models/Lead.js */
const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, default: '' },
  email: { type: String, default: '', lowercase: true, trim: true },
  location: { type: String, default: '' },
  interest: { type: String, default: '' },
  type: { type: String, enum: ['buyer', 'seller', 'Buying', 'Selling'], default: 'buyer' },
  budget: { type: String, default: '' },
  status: { type: String, enum: ['new', 'contacted', 'qualified', 'lost'], default: 'new' },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  source: { type: String, default: '' },
  lastContact: { type: Date, default: null },
  notes: { type: String, default: '' },
  // Thêm các trường mới cho scraper
  postUrl: { type: String, default: '' },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
