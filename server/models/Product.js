/* server/models/Product.js */
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  avgPrice: { type: Number, required: true },
  minPrice: { type: Number, required: true },
  maxPrice: { type: Number, required: true },
  demand: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  buyingPosts: { type: Number, default: 0 },
  sellingPosts: { type: Number, default: 0 },
  trend: { type: String, enum: ['up', 'down'], default: 'up' },
  trendPercent: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
