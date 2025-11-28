/* server/models/Report.js */
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['sales', 'leads', 'products', 'general'], required: true },
  dateRange: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  exportedAt: { type: Date, default: Date.now },
  exportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
