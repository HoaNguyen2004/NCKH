/* server/models/Lead.js */
const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  location: { type: String, required: true },
  interest: { type: String, required: true },
  type: { type: String, enum: ['Buying', 'Selling'], required: true },
  budget: { type: String, required: true },
  status: { type: String, enum: ['new', 'contacted', 'qualified', 'lost'], default: 'new' },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  source: { type: String, required: true },
  lastContact: { type: Date, default: null },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
