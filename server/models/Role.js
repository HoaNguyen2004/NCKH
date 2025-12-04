/* server/models/Role.js */
const mongoose = require('mongoose');

// Role riêng biệt lưu trong MongoDB, dùng để phân quyền
// key: khoá kỹ thuật (admin, manager, sales, user, ...)
// name: tên hiển thị
// permissions: danh sách quyền chi tiết (ví dụ: 'users.read', 'users.write', ...)
const roleSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    permissions: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Role', roleSchema);


