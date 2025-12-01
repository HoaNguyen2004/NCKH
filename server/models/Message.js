/* server/models/Message.js */
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  sender: { type: String, enum: ['me', 'customer'], required: true },
  text: { type: String, default: '' },
  read: { type: Boolean, default: false },
  attachment: {
    filename: { type: String },
    originalname: { type: String },
    mimetype: { type: String },
    size: { type: Number },
    url: { type: String }
  },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
