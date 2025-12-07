/* server/models/Group.js */
const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    url: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    // Các từ khóa đã dùng để tìm ra nhóm này
    keywords: {
      type: [String],
      default: [],
    },
    // Cờ đánh dấu loại nhóm (có thể mở rộng sau)
    isPublic: {
      type: Boolean,
      default: false,
    },
    nearMe: {
      type: Boolean,
      default: false,
    },
    isMyGroup: {
      type: Boolean,
      default: false,
    },
    // Thông tin người quét / tạo
    scrapedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    scrapedByEmail: {
      type: String,
      default: '',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

groupSchema.index({ name: 1 });
groupSchema.index({ location: 1 });

module.exports = mongoose.model('Group', groupSchema);


