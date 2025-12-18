/* server/models/SalesLog.js */
const mongoose = require('mongoose');

const salesLogSchema = new mongoose.Schema({
  leadId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Lead', 
    required: true 
  },
  leadName: { 
    type: String, 
    required: true 
  },
  caretaker: { 
    type: String, 
    default: '' 
  },
  editTime: { 
    type: Date, 
    default: Date.now 
  },
  customerRequest: { 
    type: String, 
    default: '' 
  },
  conclusion: { 
    type: String, 
    default: '' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  adminResponse: { 
    type: String, 
    default: '' 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },
  createdByEmail: { 
    type: String, 
    default: '' 
  },
  reviewedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },
  reviewedAt: { 
    type: Date, 
    default: null 
  },
}, { timestamps: true });

// Index để tìm kiếm nhanh
salesLogSchema.index({ leadId: 1, createdAt: -1 });
salesLogSchema.index({ status: 1 });
salesLogSchema.index({ createdBy: 1 });

module.exports = mongoose.model('SalesLog', salesLogSchema);

