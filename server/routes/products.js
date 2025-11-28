/* server/routes/products.js */
const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

// GET /api/products - Lấy tất cả sản phẩm
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    return res.json({ success: true, products });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

// GET /api/products/:id - Lấy chi tiết sản phẩm
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    return res.json({ success: true, product });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

// POST /api/products - Thêm sản phẩm mới
router.post('/', async (req, res) => {
  try {
    const { name, category, avgPrice, minPrice, maxPrice, demand, buyingPosts, sellingPosts, trend, trendPercent } = req.body;

    if (!name || !category || avgPrice === undefined) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
    }

    const product = await Product.create({
      name,
      category,
      avgPrice,
      minPrice: minPrice || avgPrice,
      maxPrice: maxPrice || avgPrice,
      demand: demand || 'medium',
      buyingPosts: buyingPosts || 0,
      sellingPosts: sellingPosts || 0,
      trend: trend || 'up',
      trendPercent: trendPercent || 0
    });

    return res.status(201).json({
      success: true,
      message: 'Thêm sản phẩm thành công',
      product
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

// PUT /api/products/:id - Cập nhật sản phẩm
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    
    return res.json({ success: true, message: 'Cập nhật thành công', product });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

// DELETE /api/products/:id - Xóa sản phẩm
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    
    return res.json({ success: true, message: 'Xóa sản phẩm thành công' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
});

module.exports = router;
