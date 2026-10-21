/**
 * DỮ LIỆU CẤU HÌNH & KHỞI TẠO HỆ THỐNG
 * CLB TÌNH NGUYỆN TRẺ TRỐNG ĐỒNG - ĐOÀN TRƯỜNG CAO ĐẲNG LONG AN
 * Dựa trên bảng giá bán Áo Đoàn Thanh Niên tại Văn phòng Đoàn
 */

const PRODUCT_CATEGORIES = [
  {
    id: 'so-mi-nam',
    name: 'Áo sơ mi Đoàn - Tay dài (Nam)',
    shortName: 'Sơ mi Nam',
    target: 'Nam',
    icon: 'fa-user-tie',
    badgeClass: 'badge-male',
    description: 'Chất liệu vải kate silk cao cấp, thoáng mát, thêu logo Đoàn sắc nét trên ngực trái.',
    sizes: [
      { size: 'S', price: 120000, defaultCost: 85000 },
      { size: 'M', price: 120000, defaultCost: 85000 },
      { size: 'L', price: 120000, defaultCost: 85000 },
      { size: 'XL', price: 120000, defaultCost: 85000 },
      { size: '2XL', price: 120000, defaultCost: 85000 },
      { size: '3XL', price: 120000, defaultCost: 85000 },
      { size: '4XL', price: 125000, defaultCost: 90000 },
      { size: '5XL', price: 125000, defaultCost: 90000 },
      { size: '6XL', price: 130000, defaultCost: 95000 },
    ]
  },
  {
    id: 'so-mi-nu',
    name: 'Áo sơ mi Đoàn - Tay dài (Nữ)',
    shortName: 'Sơ mi Nữ',
    target: 'Nữ',
    icon: 'fa-female',
    badgeClass: 'badge-female',
    description: 'Chiết eo tôn dáng nữ tính, vải kate chống nhăn, thêu logo Đoàn chuẩn điều lệ.',
    sizes: [
      { size: 'S', price: 120000, defaultCost: 85000 },
      { size: 'M', price: 120000, defaultCost: 85000 },
      { size: 'L', price: 120000, defaultCost: 85000 },
      { size: 'XL', price: 120000, defaultCost: 85000 },
      { size: '2XL', price: 120000, defaultCost: 85000 },
      { size: '3XL', price: 120000, defaultCost: 85000 },
      { size: '4XL', price: 125000, defaultCost: 90000 },
      { size: '5XL', price: 125000, defaultCost: 90000 },
      { size: '6XL', price: 130000, defaultCost: 95000 },
    ]
  },
  {
    id: 'ao-thun',
    name: 'Áo thun Đoàn Thanh Niên',
    shortName: 'Áo thun Đoàn',
    target: 'Unisex (Nam/Nữ)',
    icon: 'fa-tshirt',
    badgeClass: 'badge-unisex',
    description: 'Vải thun cá sấu 4 chiều co giãn tốt, thấm hút mồ hôi, in logo trước ngực và dòng chữ Tuổi trẻ Việt Nam sau lưng.',
    sizes: [
      { size: 'S', price: 120000, defaultCost: 75000 },
      { size: 'M', price: 120000, defaultCost: 75000 },
      { size: 'L', price: 120000, defaultCost: 75000 },
      { size: 'XL', price: 120000, defaultCost: 75000 },
      { size: '2XL', price: 120000, defaultCost: 75000 },
      { size: '3XL', price: 120000, defaultCost: 75000 },
      { size: '4XL', price: 125000, defaultCost: 80000 },
      { size: '5XL', price: 125000, defaultCost: 80000 },
      { size: '6XL', price: 130000, defaultCost: 85000 },
    ]
  }
];

const ALL_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'];

// Hàm lấy giá bán theo loại và size chuẩn bảng giá VPĐ
function getSellingPrice(categoryId, size) {
  if (['S', 'M', 'L', 'XL', '2XL', '3XL'].includes(size)) {
    return 120000;
  } else if (['4XL', '5XL'].includes(size)) {
    return 125000;
  } else if (size === '6XL') {
    return 130000;
  }
  return 120000;
}

// Khởi tạo danh mục kho hàng trắng sạch (TẤT CẢ VỀ 0 ĐỂ NGƯỜI DÙNG BẮT ĐẦU NHẬP MỚI)
function getInitialInventory() {
  const inventory = [];

  PRODUCT_CATEGORIES.forEach(cat => {
    cat.sizes.forEach(s => {
      inventory.push({
        sku: `${cat.id}-${s.size}`,
        categoryId: cat.id,
        categoryName: cat.name,
        shortName: cat.shortName,
        target: cat.target,
        size: s.size,
        sellingPrice: s.price,
        costPrice: s.defaultCost,
        totalImported: 0, // Về 0
        totalSold: 0,     // Về 0
        stock: 0,         // Về 0
        lowStockThreshold: 5
      });
    });
  });

  return inventory;
}

// Lịch sử nhập ban đầu (VỀ 0 / RỖNG)
function getInitialImports() {
  return [];
}

// Lịch sử bán ban đầu (VỀ 0 / RỖNG)
function getInitialSales() {
  return [];
}

// ==========================================================================
// DỮ LIỆU DEMO DỰ PHÒNG (NẾU MUỐN THỬ NGHIỆM GIAO DIỆN)
// ==========================================================================
function getDemoInventorySample() {
  const inventory = [];
  PRODUCT_CATEGORIES.forEach(cat => {
    cat.sizes.forEach(s => {
      let initialStock = 0;
      if (['M', 'L', 'XL'].includes(s.size)) {
        initialStock = cat.id === 'ao-thun' ? 35 : 25;
      } else if (['S', '2XL'].includes(s.size)) {
        initialStock = cat.id === 'ao-thun' ? 20 : 15;
      } else if (s.size === '3XL') {
        initialStock = 10;
      } else if (['4XL', '5XL'].includes(s.size)) {
        initialStock = 5;
      } else if (s.size === '6XL') {
        initialStock = 3;
      }

      inventory.push({
        sku: `${cat.id}-${s.size}`,
        categoryId: cat.id,
        categoryName: cat.name,
        shortName: cat.shortName,
        target: cat.target,
        size: s.size,
        sellingPrice: s.price,
        costPrice: s.defaultCost,
        totalImported: initialStock + (['M', 'L'].includes(s.size) ? 10 : 3),
        totalSold: ['M', 'L'].includes(s.size) ? 10 : 3,
        stock: initialStock,
        lowStockThreshold: 5
      });
    });
  });
  return inventory;
}

function getDemoImportsSample() {
  const now = new Date();
  const d1 = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0];
  const d2 = new Date(now.getTime() - 3 * 86400000).toISOString().split('T')[0];

  return [
    {
      id: 'NH-2026-001',
      date: d1 + ' 09:30',
      supplier: 'Xưởng May Cờ & Áo Đoàn Việt',
      receiver: 'BCH CLB Trống Đồng',
      note: 'Nhập đầu năm học phục vụ đoàn viên mới',
      items: [
        { categoryId: 'so-mi-nam', size: 'M', quantity: 35, costPrice: 85000, subtotal: 35 * 85000 },
        { categoryId: 'so-mi-nam', size: 'L', quantity: 35, costPrice: 85000, subtotal: 35 * 85000 },
        { categoryId: 'so-mi-nam', size: 'XL', quantity: 25, costPrice: 85000, subtotal: 25 * 85000 },
      ],
      totalQuantity: 95,
      totalAmount: 8075000
    }
  ];
}

function getDemoSalesSample() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  return [
    {
      id: 'BH-2026-001',
      date: today + ' 08:30',
      customerName: 'Nguyễn Văn An',
      customerClass: 'CĐ Điện K18A',
      customerPhone: '0912345678',
      seller: 'BCH CLB Trống Đồng',
      paymentMethod: 'Chuyển khoản (VietQR)',
      discount: 0,
      note: 'Mua áo sơ mi kết nạp Đoàn',
      items: [
        { categoryId: 'so-mi-nam', categoryName: 'Áo sơ mi Đoàn - Tay dài (Nam)', size: 'L', quantity: 1, unitPrice: 120000, subtotal: 120000 }
      ],
      totalQuantity: 1,
      totalAmount: 120000
    }
  ];
}
