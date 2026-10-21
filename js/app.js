/**
 * HỆ THỐNG QUẢN LÝ NHẬP - XUẤT - BÁN & TỒN KHO ÁO ĐOÀN THANH NIÊN
 * CLB TÌNH NGUYỆN TRẺ TRỐNG ĐỒNG - ĐOÀN TRƯỜNG CAO ĐẲNG LONG AN
 */

// Key LocalStorage (Phiên bản v3 sạch 100% để nhập dữ liệu thực tế)
const STORAGE_KEYS = {
  INVENTORY: 'clb_trongdong_inventory_live_v3',
  IMPORTS: 'clb_trongdong_imports_live_v3',
  SALES: 'clb_trongdong_sales_live_v3',
  THEME: 'clb_trongdong_theme'
};

// ==========================================================================
// CẤU HÌNH & XÁC THỰC QUẢN TRỊ VIÊN (ADMIN)
// User: TrongDong2@26 | Mật khẩu: trongdong2026
// ==========================================================================
const ADMIN_CONFIG = {
  USERNAME: 'TrongDong2@26',
  PASSWORD: 'trongdong2026',
  SESSION_KEY: 'clb_trongdong_admin_session'
};

let pendingAdminAction = null;

// Kiểm tra quyền Admin
function isAdmin() {
  return sessionStorage.getItem(ADMIN_CONFIG.SESSION_KEY) === 'true';
}

// Đăng nhập Admin
function loginAdmin(username, password) {
  if (username === ADMIN_CONFIG.USERNAME && password === ADMIN_CONFIG.PASSWORD) {
    sessionStorage.setItem(ADMIN_CONFIG.SESSION_KEY, 'true');
    updateAdminUI();
    showToast('Đăng nhập Quản trị viên (Admin) thành công!', 'success');
    return true;
  }
  return false;
}

// Đăng xuất Admin
function logoutAdmin() {
  sessionStorage.removeItem(ADMIN_CONFIG.SESSION_KEY);
  updateAdminUI();
  showToast('Đã đăng xuất khỏi tài khoản Admin. Đang ở chế độ Nhân viên bán hàng.', 'info');
}

// Bấm nút Admin trên header (Đăng nhập hoặc Đăng xuất)
function handleAdminAuthButtonClick() {
  if (isAdmin()) {
    if (confirm('Bạn có chắc muốn đăng xuất khỏi quyền Quản trị viên (Admin)?')) {
      logoutAdmin();
    }
  } else {
    openAdminLoginModal();
  }
}

// Mở modal đăng nhập Admin
function openAdminLoginModal(onSuccessCallback = null) {
  pendingAdminAction = onSuccessCallback;
  const modal = document.getElementById('modal-admin-login');
  const userInp = document.getElementById('admin-login-username');
  const passInp = document.getElementById('admin-login-password');
  const errorBox = document.getElementById('admin-login-error');

  if (errorBox) errorBox.style.display = 'none';
  if (userInp) userInp.value = '';
  if (passInp) passInp.value = '';

  if (modal) {
    modal.classList.add('active');
    setTimeout(() => {
      if (userInp) userInp.focus();
    }, 150);
  }
}

// Đóng modal đăng nhập Admin
function closeAdminLoginModal() {
  const modal = document.getElementById('modal-admin-login');
  if (modal) modal.classList.remove('active');
  pendingAdminAction = null;
}

// Xử lý gửi form đăng nhập Admin
function handleAdminLoginSubmit(e) {
  if (e) e.preventDefault();
  const user = document.getElementById('admin-login-username')?.value.trim();
  const pass = document.getElementById('admin-login-password')?.value;
  const errorBox = document.getElementById('admin-login-error');

  if (loginAdmin(user, pass)) {
    closeAdminLoginModal();
    if (typeof pendingAdminAction === 'function') {
      const action = pendingAdminAction;
      pendingAdminAction = null;
      action();
    }
  } else {
    if (errorBox) {
      errorBox.style.display = 'block';
      errorBox.innerHTML = '<i class="fas fa-circle-exclamation"></i> Tên tài khoản hoặc mật khẩu không chính xác! Vui lòng thử lại.';
    }
  }
}

// Guard chặn thao tác yêu cầu Admin
function requireAdmin(actionCallback) {
  if (isAdmin()) {
    actionCallback();
  } else {
    showToast('Chức năng này yêu cầu quyền Quản trị viên (Admin)!', 'warning');
    openAdminLoginModal(actionCallback);
  }
}

// Cập nhật giao diện theo trạng thái đăng nhập
function updateAdminUI() {
  const adminActive = isAdmin();
  const roleBadge = document.getElementById('header-role-badge');
  const authBtn = document.getElementById('btn-admin-auth-toggle');
  const importLockBanner = document.getElementById('import-admin-lock-banner');

  if (roleBadge) {
    if (adminActive) {
      roleBadge.className = 'badge-role badge-role-admin';
      roleBadge.innerHTML = '<i class="fas fa-user-shield"></i> Admin: TrongDong2@26';
    } else {
      roleBadge.className = 'badge-role badge-role-staff';
      roleBadge.innerHTML = '<i class="fas fa-user"></i> NV Bán Hàng';
    }
  }

  if (authBtn) {
    if (adminActive) {
      authBtn.className = 'btn-header btn-header-admin-active';
      authBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Đăng xuất Admin';
      authBtn.title = 'Nhấp để đăng xuất khỏi quyền Admin';
    } else {
      authBtn.className = 'btn-header';
      authBtn.innerHTML = '<i class="fas fa-lock"></i> Đăng nhập Admin';
      authBtn.title = 'Đăng nhập tài khoản Quản trị viên (Admin)';
    }
  }

  if (importLockBanner) {
    if (adminActive) {
      importLockBanner.innerHTML = '';
      importLockBanner.style.display = 'none';
    } else {
      importLockBanner.style.display = 'block';
      importLockBanner.innerHTML = `
        <div class="admin-lock-banner">
          <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-shield-halved" style="font-size: 1.4rem; color: #f59e0b;"></i>
            <div>
              <strong>CHẾ ĐỘ NHÂN VIÊN:</strong> Bạn chỉ được ghi hóa đơn bán hàng tại quầy (POS).
              Chức năng Nhập hàng, Sửa/Xóa hóa đơn yêu cầu đăng nhập tài khoản Quản trị viên (Admin).
            </div>
          </div>
          <button type="button" class="btn btn-primary" onclick="openAdminLoginModal()" style="font-size: 0.82rem; padding: 6px 14px; white-space: nowrap;">
            <i class="fas fa-lock"></i> Đăng nhập Admin
          </button>
        </div>
      `;
    }
  }
}

// State toàn cục
let state = {
  inventory: [],
  imports: [],
  sales: [],
  cart: [],
  activeCategoryFilter: 'all',
  activeStockFilter: 'all',
  currentTab: 'dashboard'
};

// Khởi chạy khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  initStorage();
  initTheme();
  setupEventListeners();
  updateAdminUI();
  renderAll();
  startClock();
});

// ==========================================================================
// KHỞI TẠO & LƯU TRỮ LOCALSTORAGE
// ==========================================================================
function initStorage() {
  // Dọn dẹp các phiên bản dữ liệu cũ trước đây nếu có
  ['clb_trongdong_inventory_v1', 'clb_trongdong_imports_v1', 'clb_trongdong_sales_v1',
   'clb_trongdong_inventory_live_v2', 'clb_trongdong_imports_live_v2', 'clb_trongdong_sales_live_v2'
  ].forEach(oldKey => localStorage.removeItem(oldKey));

  const storedInventory = localStorage.getItem(STORAGE_KEYS.INVENTORY);
  const storedImports = localStorage.getItem(STORAGE_KEYS.IMPORTS);
  const storedSales = localStorage.getItem(STORAGE_KEYS.SALES);

  if (storedInventory && storedImports && storedSales) {
    try {
      state.inventory = JSON.parse(storedInventory);
      state.imports = JSON.parse(storedImports);
      state.sales = JSON.parse(storedSales);
    } catch (e) {
      console.error('Lỗi phân tích dữ liệu lưu trữ, khởi tạo lại về 0:', e);
      resetAllToZero();
    }
  } else {
    // Khởi tạo sạch toàn bộ tồn kho, nhập, bán VỀ 0
    resetAllToZero();
  }
}

// Hàm xóa trắng toàn bộ dữ liệu về 0
function resetAllToZero() {
  state.inventory = getInitialInventory(); // Toàn bộ stock = 0, imported = 0, sold = 0
  state.imports = [];                     // Phiếu nhập trống []
  state.sales = [];                       // Đơn bán trống []
  state.cart = [];
  saveAllToStorage();
}

// Hàm nạp dữ liệu mẫu thử nghiệm
function loadDemoDataSample() {
  state.inventory = getDemoInventorySample();
  state.imports = getDemoImportsSample();
  state.sales = getDemoSalesSample();
  state.cart = [];
  saveAllToStorage();
}

function saveAllToStorage() {
  localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(state.inventory));
  localStorage.setItem(STORAGE_KEYS.IMPORTS, JSON.stringify(state.imports));
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(state.sales));
}

function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount).replace('₫', 'đ');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Đồng hồ thời gian thực
function startClock() {
  const clockEl = document.getElementById('realtime-clock');
  const update = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    if (clockEl) {
      clockEl.innerHTML = `<i class="far fa-clock"></i> ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} - ${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
    }
  };
  update();
  setInterval(update, 1000);
}

// Chế độ Dark / Light
function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
  const toggleBtn = document.getElementById('btn-toggle-theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-sun"></i> Giao diện sáng';
  }
}

function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
  const toggleBtn = document.getElementById('btn-toggle-theme');
  if (toggleBtn) {
    toggleBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i> Giao diện sáng' : '<i class="fas fa-moon"></i> Giao diện tối';
  }
  showToast(isDark ? 'Đã bật chế độ giao diện tối' : 'Đã bật chế độ giao diện sáng', 'info');
}

// ==========================================================================
// TOAST NOTIFICATION
// ==========================================================================
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'fa-check-circle';
  if (type === 'error') icon = 'fa-exclamation-circle';
  if (type === 'warning') icon = 'fa-exclamation-triangle';
  if (type === 'info') icon = 'fa-info-circle';

  toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ==========================================================================
// THIẾT LẬP SỰ KIỆN TƯƠNG TÁC
// ==========================================================================
function setupEventListeners() {
  // Chuyển Tab điều hướng
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // Nút theme
  const btnTheme = document.getElementById('btn-toggle-theme');
  if (btnTheme) btnTheme.addEventListener('click', toggleTheme);

  // Nút xóa trắng toàn bộ dữ liệu về 0 (Yêu cầu quyền Admin)
  const btnResetZero = document.getElementById('btn-reset-zero');
  if (btnResetZero) {
    btnResetZero.addEventListener('click', () => {
      requireAdmin(() => {
        if (confirm('XÁC NHẬN LÀM MỚI VỀ 0:\n\nBạn có chắc muốn đặt toàn bộ Tồn kho, Lịch sử nhập và Lịch sử bán về 0 để nhập dữ liệu mới từ đầu không?')) {
          resetAllToZero();
          renderAll();
          showToast('Đã đưa toàn bộ dữ liệu về 0! Bạn có thể bắt đầu nhập hàng mới.', 'success');
        }
      });
    });
  }

  // Nút nạp dữ liệu mẫu thử nghiệm (Yêu cầu quyền Admin)
  const btnLoadDemo = document.getElementById('btn-load-demo');
  if (btnLoadDemo) {
    btnLoadDemo.addEventListener('click', () => {
      requireAdmin(() => {
        if (confirm('Bạn có muốn nạp dữ liệu mẫu thử nghiệm của CLB Trống Đồng không?')) {
          loadDemoDataSample();
          renderAll();
          showToast('Đã nạp dữ liệu mẫu thử nghiệm thành công!', 'info');
        }
      });
    });
  }

  // Nút sao lưu JSON & Nhập JSON
  const btnExportJson = document.getElementById('btn-export-json');
  if (btnExportJson) {
    btnExportJson.addEventListener('click', exportDatabaseJSON);
  }

  const fileInputJson = document.getElementById('input-import-json');
  if (fileInputJson) {
    fileInputJson.addEventListener('change', (e) => {
      requireAdmin(() => {
        importDatabaseJSON(e);
      });
    });
  }

  // Lọc sản phẩm trong trang POS
  document.querySelectorAll('.pos-cat-filter').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.pos-cat-filter').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.activeCategoryFilter = chip.getAttribute('data-cat');
      renderPOSProducts();
    });
  });

  // Tìm kiếm sản phẩm POS
  const inputSearchPOS = document.getElementById('pos-search-input');
  if (inputSearchPOS) {
    inputSearchPOS.addEventListener('input', () => {
      renderPOSProducts();
    });
  }

  // Form Bán Hàng - Nút Thanh toán
  const btnCheckout = document.getElementById('btn-checkout');
  if (btnCheckout) {
    btnCheckout.addEventListener('click', handleCheckout);
  }

  // Form Bán Hàng - Xóa giỏ hàng
  const btnClearCart = document.getElementById('btn-clear-cart');
  if (btnClearCart) {
    btnClearCart.addEventListener('click', () => {
      if (state.cart.length === 0) return;
      if (confirm('Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ hàng?')) {
        state.cart = [];
        renderPOSCart();
        showToast('Đã xóa sạch giỏ hàng');
      }
    });
  }

  // Khách đưa tiền -> Tính tiền thừa
  const inputCustomerPaid = document.getElementById('pos-customer-paid');
  if (inputCustomerPaid) {
    inputCustomerPaid.addEventListener('input', calculateChange);
  }

  // Phương thức thanh toán chuyển khoản
  const selectPayment = document.getElementById('pos-payment-method');
  if (selectPayment) {
    selectPayment.addEventListener('change', (e) => {
      const qrBox = document.getElementById('pos-vietqr-box');
      if (qrBox) {
        qrBox.style.display = e.target.value.includes('Chuyển khoản') ? 'block' : 'none';
        updateVietQRPreview();
      }
    });
  }

  // SỰ KIỆN NHẬP KHO GOM 1 PHIẾU DUY NHẤT
  const selectCatImport = document.getElementById('import-category-select');
  const inputBatchCost = document.getElementById('import-batch-cost');
  if (selectCatImport && inputBatchCost) {
    selectCatImport.addEventListener('change', () => {
      const catId = selectCatImport.value;
      inputBatchCost.value = catId === 'ao-thun' ? 75000 : 85000;
    });
  }

  // Nút xóa các ô số lượng size
  const btnClearMatrix = document.getElementById('btn-clear-matrix-inputs');
  if (btnClearMatrix) {
    btnClearMatrix.addEventListener('click', () => {
      document.querySelectorAll('.input-size-qty').forEach(inp => inp.value = '');
    });
  }

  // Nút đưa các size trên vào phiếu nhập này
  const btnAddBatchToDraft = document.getElementById('btn-add-batch-to-draft');
  if (btnAddBatchToDraft) {
    btnAddBatchToDraft.addEventListener('click', handleAddBatchToDraft);
  }

  // Nút xác nhận lưu toàn bộ vào 1 phiếu duy nhất
  const btnSaveSingleImport = document.getElementById('btn-save-single-import-receipt');
  if (btnSaveSingleImport) {
    btnSaveSingleImport.addEventListener('click', handleSaveSingleImportReceipt);
  }

  // Lọc kho hàng (Inventory)
  const filterStockStatus = document.getElementById('inventory-stock-filter');
  if (filterStockStatus) {
    filterStockStatus.addEventListener('change', (e) => {
      state.activeStockFilter = e.target.value;
      renderInventoryTable();
    });
  }

  const searchInventory = document.getElementById('inventory-search-input');
  if (searchInventory) {
    searchInventory.addEventListener('input', renderInventoryTable);
  }

  // Lọc lịch sử
  const historyFilter = document.getElementById('history-type-filter');
  if (historyFilter) {
    historyFilter.addEventListener('change', renderHistory);
  }
}

// Chuyển Tab
function switchTab(tabId) {
  state.currentTab = tabId;
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    const isActive = btn.getAttribute('data-tab') === tabId;
    btn.classList.toggle('active', isActive);
    if (isActive) {
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  });
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.remove('active');
  });
  const targetPane = document.getElementById(`tab-${tabId}`);
  if (targetPane) {
    targetPane.classList.add('active');
  }

  if (tabId === 'dashboard') {
    renderDashboard();
  } else if (tabId === 'pos') {
    renderPOSProducts();
    renderPOSCart();
  } else if (tabId === 'inventory') {
    renderInventoryTable();
  } else if (tabId === 'import') {
    renderImportHistory();
  } else if (tabId === 'history') {
    renderHistory();
  }
}

// Render toàn bộ
function renderAll() {
  renderDashboard();
  renderPOSProducts();
  renderPOSCart();
  renderInventoryTable();
  renderImportHistory();
  renderHistory();
  renderPricingCards();
}

// ==========================================================================
// 1. DASHBOARD & THỐNG KÊ TỔNG QUAN
// ==========================================================================
function renderDashboard() {
  // Tính toán chỉ số KPI
  let totalStock = 0;
  let totalImported = 0;
  let totalSold = 0;
  let totalRevenue = 0;
  let totalCostOfSold = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  state.inventory.forEach(item => {
    totalStock += item.stock;
    totalImported += item.totalImported;
    totalSold += item.totalSold;

    if (item.stock === 0) {
      outOfStockCount++;
    } else if (item.stock <= item.lowStockThreshold) {
      lowStockCount++;
    }
  });

  state.sales.forEach(s => {
    totalRevenue += s.totalAmount;
    // Tính vốn xuất bán
    s.items.forEach(it => {
      const found = state.inventory.find(inv => inv.categoryId === it.categoryId && inv.size === it.size);
      const cost = found ? found.costPrice : 80000;
      totalCostOfSold += cost * it.quantity;
    });
  });

  const grossProfit = totalRevenue - totalCostOfSold;

  // Cập nhật DOM KPI
  const elStock = document.getElementById('kpi-total-stock');
  const elSold = document.getElementById('kpi-total-sold');
  const elImported = document.getElementById('kpi-total-imported');
  const elRevenue = document.getElementById('kpi-total-revenue');
  const elProfit = document.getElementById('kpi-total-profit');
  const elAlertStock = document.getElementById('kpi-stock-alert');

  if (elStock) elStock.textContent = totalStock.toLocaleString('vi-VN') + ' cái';
  if (elSold) elSold.textContent = totalSold.toLocaleString('vi-VN') + ' cái';
  if (elImported) elImported.textContent = totalImported.toLocaleString('vi-VN') + ' cái';
  if (elRevenue) elRevenue.textContent = formatVND(totalRevenue);
  if (elProfit) elProfit.textContent = formatVND(grossProfit);

  if (elAlertStock) {
    if (outOfStockCount > 0 || lowStockCount > 0) {
      elAlertStock.innerHTML = `<span class="badge-stock stock-out"><i class="fas fa-exclamation-triangle"></i> ${outOfStockCount} size hết hàng</span> <span class="badge-stock stock-low" style="margin-left: 6px;"><i class="fas fa-bell"></i> ${lowStockCount} size sắp hết (&le;5)</span>`;
    } else {
      elAlertStock.innerHTML = `<span class="badge-stock stock-in"><i class="fas fa-check-circle"></i> Đầy đủ số lượng trong kho</span>`;
    }
  }

  // Thống kê theo loại áo
  renderCategoryBreakdown();
  renderRecentTransactions();
}

function renderCategoryBreakdown() {
  const container = document.getElementById('dashboard-category-breakdown');
  if (!container) return;

  const catStats = PRODUCT_CATEGORIES.map(cat => {
    const items = state.inventory.filter(i => i.categoryId === cat.id);
    const stock = items.reduce((acc, cur) => acc + cur.stock, 0);
    const sold = items.reduce((acc, cur) => acc + cur.totalSold, 0);
    const imported = items.reduce((acc, cur) => acc + cur.totalImported, 0);
    return { ...cat, stock, sold, imported };
  });

  let html = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
  `;

  catStats.forEach(stat => {
    const total = stat.imported || 1;
    const soldPercent = Math.min(100, Math.round((stat.sold / total) * 100));
    const stockPercent = 100 - soldPercent;

    html += `
      <div style="background: var(--bg-card-alt); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h4 style="font-size: 1rem; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
            <i class="fas ${stat.icon}" style="color: var(--primary);"></i> ${stat.name}
          </h4>
          <span class="badge-tag ${stat.badgeClass}">${stat.target}</span>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; text-align: center; margin-bottom: 14px;">
          <div style="background: var(--bg-card); padding: 8px; border-radius: 8px; border: 1px solid var(--border-color);">
            <div style="font-size: 0.74rem; color: var(--text-muted); font-weight: 600;">TỒN KHO</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: #0284c7;">${stat.stock}</div>
          </div>
          <div style="background: var(--bg-card); padding: 8px; border-radius: 8px; border: 1px solid var(--border-color);">
            <div style="font-size: 0.74rem; color: var(--text-muted); font-weight: 600;">ĐÃ BÁN</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: #10b981;">${stat.sold}</div>
          </div>
          <div style="background: var(--bg-card); padding: 8px; border-radius: 8px; border: 1px solid var(--border-color);">
            <div style="font-size: 0.74rem; color: var(--text-muted); font-weight: 600;">ĐÃ NHẬP</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: #f59e0b;">${stat.imported}</div>
          </div>
        </div>

        <div style="font-size: 0.78rem; display: flex; justify-content: space-between; margin-bottom: 4px; font-weight: 600;">
          <span>Tỷ lệ xuất bán: ${soldPercent}%</span>
          <span>Tồn: ${stat.stock} cái</span>
        </div>
        <div style="width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; display: flex;">
          <div style="width: ${soldPercent}%; background: #10b981; height: 100%;"></div>
          <div style="width: ${stockPercent}%; background: #0284c7; height: 100%;"></div>
        </div>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
}

function renderRecentTransactions() {
  const container = document.getElementById('dashboard-recent-transactions');
  if (!container) return;

  // Lấy 5 đơn bán gần nhất
  const recentSales = [...state.sales].reverse().slice(0, 5);

  if (recentSales.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-muted);">Chưa có giao dịch bán hàng nào.</div>';
    return;
  }

  let html = `
    <table class="table-custom">
      <thead>
        <tr>
          <th>Mã đơn</th>
          <th>Thời gian</th>
          <th>Đoàn viên / Khách</th>
          <th>Chi tiết áo</th>
          <th>Tổng tiền</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
  `;

  recentSales.forEach(sale => {
    const itemsSummary = sale.items.map(it => `${it.categoryName.replace('Áo sơ mi Đoàn - Tay dài', 'Sơ mi').replace('Áo thun Đoàn Thanh Niên', 'Áo thun')} (${it.size}) x${it.quantity}`).join(', ');

    html += `
      <tr>
        <td><strong>${sale.id}</strong></td>
        <td>${formatDate(sale.date)}</td>
        <td>
          <div style="font-weight: 600;">${sale.customerName}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${sale.customerClass || 'Khách vãng lai'}</div>
        </td>
        <td style="max-width: 250px; font-size: 0.85rem;">${itemsSummary}</td>
        <td><strong style="color: var(--accent-red);">${formatVND(sale.totalAmount)}</strong></td>
        <td>
          <div class="action-btn-group">
            <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem;" onclick="viewReceipt('${sale.id}')" title="In biên lai">
              <i class="fas fa-print"></i> In
            </button>
            <button class="btn-danger-sm" onclick="deleteSaleOrder('${sale.id}')" title="Xóa đơn bán và hoàn lại tồn kho">
              <i class="fas fa-trash-alt"></i> Xóa
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

// ==========================================================================
// 2. MÀN HÌNH BÁN HÀNG TẠI QUẦY (POS)
// ==========================================================================
function renderPOSProducts() {
  const container = document.getElementById('pos-products-container');
  if (!container) return;

  const searchQuery = (document.getElementById('pos-search-input')?.value || '').toLowerCase().trim();
  const filterCat = state.activeCategoryFilter;

  let filtered = state.inventory.filter(item => {
    const matchCat = filterCat === 'all' || item.categoryId === filterCat;
    const matchSearch = item.categoryName.toLowerCase().includes(searchQuery) ||
                        item.size.toLowerCase().includes(searchQuery) ||
                        item.target.toLowerCase().includes(searchQuery);
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
        <i class="fas fa-box-open" style="font-size: 2.5rem; margin-bottom: 12px; display: block; opacity: 0.5;"></i>
        Không tìm thấy sản phẩm nào khớp với tìm kiếm.
      </div>
    `;
    return;
  }

  let html = '';
  filtered.forEach(item => {
    const isOut = item.stock <= 0;
    const isLow = item.stock > 0 && item.stock <= item.lowStockThreshold;

    let badgeStock = `<span class="badge-stock stock-in"><i class="fas fa-check"></i> Còn: ${item.stock}</span>`;
    if (isOut) {
      badgeStock = `<span class="badge-stock stock-out"><i class="fas fa-times"></i> Hết hàng</span>`;
    } else if (isLow) {
      badgeStock = `<span class="badge-stock stock-low"><i class="fas fa-exclamation"></i> Sắp hết: ${item.stock}</span>`;
    }

    html += `
      <div class="product-item-card ${isOut ? 'out-of-stock' : ''}" onclick="addToCart('${item.sku}')">
        <div class="product-head">
          <div class="product-title">${item.shortName}</div>
          <span class="product-size-badge">Size ${item.size}</span>
        </div>
        
        <div style="font-size: 0.78rem; color: var(--text-muted);">
          Đối tượng: <strong>${item.target}</strong>
        </div>

        <div class="product-price-row">
          <span class="price-tag">${formatVND(item.sellingPrice)}</span>
          ${badgeStock}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function addToCart(sku) {
  const item = state.inventory.find(i => i.sku === sku);
  if (!item) return;

  if (item.stock <= 0) {
    showToast(`Size ${item.size} của ${item.shortName} đã hết hàng trong kho!`, 'error');
    return;
  }

  const existingInCart = state.cart.find(c => c.sku === sku);
  if (existingInCart) {
    if (existingInCart.quantity >= item.stock) {
      showToast(`Không thể thêm! Kho hiện chỉ còn ${item.stock} cái cho size này.`, 'warning');
      return;
    }
    existingInCart.quantity += 1;
    existingInCart.subtotal = existingInCart.quantity * existingInCart.unitPrice;
  } else {
    state.cart.push({
      sku: item.sku,
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      shortName: item.shortName,
      size: item.size,
      unitPrice: item.sellingPrice,
      quantity: 1,
      subtotal: item.sellingPrice,
      maxStock: item.stock
    });
  }

  showToast(`Đã thêm ${item.shortName} (Size ${item.size}) vào đơn hàng`);
  renderPOSCart();
}

function updateCartQuantity(sku, delta) {
  const cartItem = state.cart.find(c => c.sku === sku);
  if (!cartItem) return;

  const invItem = state.inventory.find(i => i.sku === sku);
  const maxStock = invItem ? invItem.stock : cartItem.quantity;

  const newQty = cartItem.quantity + delta;

  if (newQty <= 0) {
    state.cart = state.cart.filter(c => c.sku !== sku);
    showToast('Đã xóa món khỏi đơn hàng', 'info');
  } else if (newQty > maxStock) {
    showToast(`Chỉ còn ${maxStock} cái trong kho!`, 'warning');
    return;
  } else {
    cartItem.quantity = newQty;
    cartItem.subtotal = cartItem.quantity * cartItem.unitPrice;
  }

  renderPOSCart();
}

function removeFromCart(sku) {
  state.cart = state.cart.filter(c => c.sku !== sku);
  renderPOSCart();
  showToast('Đã xóa món khỏi đơn hàng', 'info');
}

function renderPOSCart() {
  const container = document.getElementById('pos-cart-items');
  const countBadge = document.getElementById('pos-cart-count');
  const totalAmountEl = document.getElementById('pos-total-amount');
  const totalQtyEl = document.getElementById('pos-total-quantity');

  if (!container) return;

  const totalQty = state.cart.reduce((acc, cur) => acc + cur.quantity, 0);
  const totalAmount = state.cart.reduce((acc, cur) => acc + cur.subtotal, 0);

  if (countBadge) countBadge.textContent = totalQty;
  if (totalQtyEl) totalQtyEl.textContent = totalQty + ' cái';
  if (totalAmountEl) totalAmountEl.textContent = formatVND(totalAmount);

  calculateChange();

  if (state.cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 35px 15px; color: var(--text-muted);">
        <i class="fas fa-shopping-basket" style="font-size: 2.2rem; opacity: 0.4; margin-bottom: 8px; display: block;"></i>
        Chưa có áo nào được chọn.<br>
        <small>Nhấp vào các sản phẩm bên trái để đưa vào đơn bán.</small>
      </div>
    `;
    return;
  }

  let html = '';
  state.cart.forEach(item => {
    html += `
      <div class="cart-item-row">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.shortName}</div>
          <div class="cart-item-detail">
            Size: <strong style="color: var(--primary);">${item.size}</strong> &bull; Đơn giá: ${formatVND(item.unitPrice)}
          </div>
        </div>

        <div class="cart-qty-controls">
          <button class="btn-qty" onclick="updateCartQuantity('${item.sku}', -1)">-</button>
          <span class="cart-qty-value">${item.quantity}</span>
          <button class="btn-qty" onclick="updateCartQuantity('${item.sku}', 1)">+</button>
        </div>

        <div class="cart-item-subtotal">${formatVND(item.subtotal)}</div>

        <button class="btn-remove-item" onclick="removeFromCart('${item.sku}')" title="Xóa món này">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    `;
  });

  container.innerHTML = html;
}

function calculateChange() {
  const totalAmount = state.cart.reduce((acc, cur) => acc + cur.subtotal, 0);
  const inputPaid = document.getElementById('pos-customer-paid');
  const changeEl = document.getElementById('pos-customer-change');
  if (!inputPaid || !changeEl) return;

  const paid = parseFloat(inputPaid.value) || 0;
  if (paid === 0) {
    changeEl.textContent = '0 đ';
    return;
  }

  const change = paid - totalAmount;
  if (change >= 0) {
    changeEl.textContent = formatVND(change);
    changeEl.style.color = '#10b981';
  } else {
    changeEl.textContent = 'Còn thiếu ' + formatVND(Math.abs(change));
    changeEl.style.color = '#ef4444';
  }
}

function updateVietQRPreview() {
  const qrImg = document.getElementById('pos-qr-img');
  const totalAmount = state.cart.reduce((acc, cur) => acc + cur.subtotal, 0);
  if (!qrImg) return;

  // VietQR URL mẫu dành cho Đoàn trường / CLB Trống Đồng
  const bank = 'MB'; // Ngân hàng Quân Đội
  const accountNo = '0379888999'; // Số tài khoản tượng trưng của CLB Trống Đồng
  const accountName = 'CLB TNTN TRONG DONG';
  const memo = encodeURIComponent(`TIEN AO DOAN ${Date.now().toString().slice(-4)}`);
  
  qrImg.src = `https://img.vietqr.io/image/${bank}-${accountNo}-compact2.png?amount=${totalAmount}&addInfo=${memo}&accountName=${encodeURIComponent(accountName)}`;
}

// Xử lý tạo đơn bán hàng
function handleCheckout() {
  if (state.cart.length === 0) {
    showToast('Giỏ hàng đang trống! Vui lòng chọn áo cần bán.', 'error');
    return;
  }

  const customerName = document.getElementById('pos-customer-name')?.value.trim() || 'Đoàn viên / Sinh viên';
  const customerClass = document.getElementById('pos-customer-class')?.value.trim() || 'Trường Cao đẳng Long An';
  const customerPhone = document.getElementById('pos-customer-phone')?.value.trim() || '';
  const seller = document.getElementById('pos-seller-name')?.value.trim() || 'Văn phòng Đoàn';
  const paymentMethod = document.getElementById('pos-payment-method')?.value || 'Tiền mặt';
  const note = document.getElementById('pos-order-note')?.value.trim() || '';

  // Kiểm tra lại tồn kho thực tế trước khi chốt đơn
  for (const cartItem of state.cart) {
    const invItem = state.inventory.find(i => i.sku === cartItem.sku);
    if (!invItem || invItem.stock < cartItem.quantity) {
      showToast(`Không đủ số lượng cho ${cartItem.shortName} (Size ${cartItem.size})! Tồn kho chỉ còn ${invItem ? invItem.stock : 0}.`, 'error');
      return;
    }
  }

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const orderId = `BH-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  const totalAmount = state.cart.reduce((acc, cur) => acc + cur.subtotal, 0);
  const totalQuantity = state.cart.reduce((acc, cur) => acc + cur.quantity, 0);

  const newSale = {
    id: orderId,
    date: now.toISOString().replace('T', ' ').substring(0, 16),
    customerName,
    customerClass,
    customerPhone,
    seller,
    paymentMethod,
    discount: 0,
    note,
    items: JSON.parse(JSON.stringify(state.cart)),
    totalQuantity,
    totalAmount
  };

  // Trừ tồn kho và tăng tổng đã bán
  state.cart.forEach(cartItem => {
    const invItem = state.inventory.find(i => i.sku === cartItem.sku);
    if (invItem) {
      invItem.stock -= cartItem.quantity;
      invItem.totalSold += cartItem.quantity;
    }
  });

  // Lưu lịch sử bán hàng
  state.sales.unshift(newSale);
  saveAllToStorage();

  // Reset giỏ hàng và form
  const lastCart = [...state.cart];
  state.cart = [];
  document.getElementById('pos-customer-name').value = '';
  document.getElementById('pos-customer-class').value = '';
  document.getElementById('pos-customer-phone').value = '';
  document.getElementById('pos-order-note').value = '';
  document.getElementById('pos-customer-paid').value = '';

  renderPOSCart();
  renderPOSProducts();
  renderDashboard();
  renderInventoryTable();
  renderHistory();

  showToast(`Tạo đơn bán hàng ${orderId} thành công!`, 'success');

  // Mở popup biên lai bán hàng
  viewReceipt(orderId);
}

// ==========================================================================
// 3. QUẢN LÝ NHẬP HÀNG (GOM NHIỀU SIZE TRÊN 1 PHIẾU DUY NHẤT)
// ==========================================================================
let draftImportItems = [];
let activeViewingImportId = null;

// Thêm các size có số lượng > 0 vào danh sách tạm của phiếu nhập hiện tại (Yêu cầu Admin)
function handleAddBatchToDraft() {
  if (!isAdmin()) {
    requireAdmin(() => handleAddBatchToDraft());
    return;
  }

  const categoryId = document.getElementById('import-category-select').value;
  const costPrice = parseFloat(document.getElementById('import-batch-cost').value) || 85000;
  const cat = PRODUCT_CATEGORIES.find(c => c.id === categoryId);

  let addedCount = 0;
  const sizeInputs = document.querySelectorAll('.input-size-qty');

  sizeInputs.forEach(input => {
    const size = input.getAttribute('data-size');
    const qty = parseInt(input.value, 10);

    if (qty && qty > 0) {
      // Kiểm tra xem món này đã có trong danh sách tạm chưa
      const existing = draftImportItems.find(it => it.categoryId === categoryId && it.size === size);
      if (existing) {
        existing.quantity += qty;
        existing.costPrice = costPrice;
        existing.subtotal = existing.quantity * existing.costPrice;
      } else {
        draftImportItems.push({
          sku: `${categoryId}-${size}`,
          categoryId,
          categoryName: cat ? cat.name : categoryId,
          shortName: cat ? cat.shortName : categoryId,
          size,
          quantity: qty,
          costPrice,
          subtotal: qty * costPrice
        });
      }
      addedCount += qty;
      input.value = ''; // xóa trắng ô sau khi thêm
    }
  });

  if (addedCount === 0) {
    showToast('Vui lòng điền số lượng ít nhất 1 size trước khi thêm!', 'warning');
    return;
  }

  renderDraftImportTable();
  showToast(`Đã thêm ${addedCount} cái áo ${cat ? cat.shortName : ''} vào phiếu nhập hiện tại!`, 'success');
}

// Xóa 1 dòng khỏi danh sách tạm của phiếu nhập
function removeDraftImportItem(index) {
  draftImportItems.splice(index, 1);
  renderDraftImportTable();
}

// Hiển thị danh sách các mặt hàng đang chờ trong phiếu nhập này
function renderDraftImportTable() {
  const container = document.getElementById('pending-import-table-body');
  const countEl = document.getElementById('pending-items-count');
  const totalQtyEl = document.getElementById('pending-total-qty');
  const totalAmountEl = document.getElementById('pending-total-amount');

  if (!container) return;

  const totalQty = draftImportItems.reduce((acc, cur) => acc + cur.quantity, 0);
  const totalAmount = draftImportItems.reduce((acc, cur) => acc + cur.subtotal, 0);

  if (countEl) countEl.textContent = `${draftImportItems.length} mặt hàng`;
  if (totalQtyEl) totalQtyEl.textContent = `${totalQty} cái`;
  if (totalAmountEl) totalAmountEl.textContent = formatVND(totalAmount);

  if (draftImportItems.length === 0) {
    container.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 16px;">Chưa có món nào. Hãy điền số lượng các size bên trên và bấm "+ Đưa Vào Phiếu Này".</td></tr>`;
    return;
  }

  let html = '';
  draftImportItems.forEach((item, index) => {
    html += `
      <tr>
        <td><strong>${item.shortName}</strong></td>
        <td><span class="size-pill">${item.size}</span></td>
        <td style="text-align: center; font-weight: 700;">${item.quantity}</td>
        <td style="text-align: right;">${formatVND(item.costPrice)}</td>
        <td style="text-align: right; font-weight: 700; color: #f59e0b;">${formatVND(item.subtotal)}</td>
        <td style="text-align: center;">
          <button class="btn-remove-item" onclick="removeDraftImportItem(${index})" title="Xóa món này">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      </tr>
    `;
  });

  container.innerHTML = html;
}

// Lưu toàn bộ danh sách tạm vào DUY NHẤT 1 PHIẾU NHẬP (Yêu cầu Admin)
function handleSaveSingleImportReceipt() {
  if (!isAdmin()) {
    requireAdmin(() => handleSaveSingleImportReceipt());
    return;
  }

  if (draftImportItems.length === 0) {
    showToast('Phiếu nhập chưa có mặt hàng nào! Vui lòng thêm các size áo vào phiếu trước khi lưu.', 'error');
    return;
  }

  const supplier = document.getElementById('import-supplier').value.trim() || 'Xưởng May Cờ & Áo Đoàn Việt';
  const receiver = document.getElementById('import-receiver').value.trim() || 'BCH CLB Tình Nguyện Trẻ Trống Đồng';
  const note = document.getElementById('import-note').value.trim() || '';

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const importId = `NH-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  const totalQuantity = draftImportItems.reduce((acc, cur) => acc + cur.quantity, 0);
  const totalAmount = draftImportItems.reduce((acc, cur) => acc + cur.subtotal, 0);

  const newImport = {
    id: importId,
    date: now.toISOString().replace('T', ' ').substring(0, 16),
    supplier,
    receiver,
    note,
    items: JSON.parse(JSON.stringify(draftImportItems)),
    totalQuantity,
    totalAmount
  };

  // Cập nhật tồn kho tất cả các mặt hàng cùng 1 lúc
  draftImportItems.forEach(item => {
    const invItem = state.inventory.find(i => 
      (item.sku && i.sku === item.sku) || 
      (i.categoryId === item.categoryId && i.size === item.size)
    );
    if (invItem) {
      invItem.stock += item.quantity;
      invItem.totalImported += item.quantity;
      invItem.costPrice = item.costPrice;
    }
  });

  // Lưu vào lịch sử phiếu nhập
  state.imports.unshift(newImport);
  saveAllToStorage();

  // Xóa rỗng danh sách tạm sau khi đã tạo phiếu thành công
  draftImportItems = [];
  renderDraftImportTable();

  // Reset ghi chú
  document.getElementById('import-note').value = '';

  // Cập nhật giao diện
  renderImportHistory();
  renderDashboard();
  renderInventoryTable();
  renderPOSProducts();
  renderHistory();
  renderPricingCards();

  showToast(`Tạo thành công 1 phiếu nhập duy nhất: ${importId} (Tổng: ${totalQuantity} cái áo)!`, 'success');

  // Mở popup chi tiết phiếu nhập vừa tạo
  viewImportDetail(importId);
}

// Render lịch sử các đợt nhập hàng
function renderImportHistory() {
  const container = document.getElementById('import-history-table-body');
  if (!container) return;

  if (state.imports.length === 0) {
    container.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 20px;">Chưa có phiếu nhập hàng nào.</td></tr>`;
    return;
  }

  let html = '';
  state.imports.forEach(imp => {
    // Tóm tắt chi tiết các size trong phiếu
    const itemsDetail = imp.items.map(it => {
      const cat = PRODUCT_CATEGORIES.find(c => c.id === it.categoryId);
      const name = cat ? cat.shortName : (it.categoryName || it.categoryId);
      return `&bull; ${name} (${it.size}): <strong>${it.quantity} cái</strong>`;
    }).join('<br>');

    html += `
      <tr>
        <td><strong>${imp.id}</strong></td>
        <td>${formatDate(imp.date)}</td>
        <td>${imp.supplier}</td>
        <td style="font-size: 0.82rem; max-width: 260px;">${itemsDetail}</td>
        <td><strong style="color: #0284c7; font-size: 1rem;">${imp.totalQuantity} cái</strong></td>
        <td><strong style="color: #f59e0b; font-size: 0.95rem;">${formatVND(imp.totalAmount)}</strong></td>
        <td><small style="color: var(--text-muted);">${imp.note || 'Không có ghi chú'}</small></td>
        <td>
          <div class="action-btn-group">
            <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.78rem;" onclick="viewImportDetail('${imp.id}')" title="Xem chi tiết & In phiếu">
              <i class="fas fa-eye"></i> Xem / In
            </button>
            <button class="btn-danger-sm" onclick="deleteImportOrder('${imp.id}')" title="Xóa toàn bộ phiếu nhập này và trừ lùi kho">
              <i class="fas fa-trash-alt"></i> Xóa
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  container.innerHTML = html;
}

// Modal Xem Chi Tiết & In Phiếu Nhập Kho
function viewImportDetail(importId) {
  const imp = state.imports.find(i => i.id === importId);
  if (!imp) {
    showToast('Không tìm thấy phiếu nhập ' + importId, 'error');
    return;
  }

  activeViewingImportId = importId;
  const modal = document.getElementById('modal-import-detail');
  const body = document.getElementById('import-detail-modal-content');
  if (!modal || !body) return;

  let itemsHtml = '';
  imp.items.forEach((item, index) => {
    itemsHtml += `
      <tr>
        <td style="text-align: center;">${index + 1}</td>
        <td>
          <strong>${item.categoryName || item.shortName}</strong>
        </td>
        <td style="text-align: center;"><span class="size-pill">${item.size}</span></td>
        <td style="text-align: center; font-weight: 700;">${item.quantity}</td>
        <td style="text-align: right;">${formatVND(item.costPrice)}</td>
        <td style="text-align: right; font-weight: 700;">${formatVND(item.subtotal || item.quantity * item.costPrice)}</td>
      </tr>
    `;
  });

  body.innerHTML = `
    <div class="receipt-paper">
      <div class="receipt-header">
        <img src="assets/logo-clb-trong-dong.png" alt="Logo CLB Trống Đồng" class="receipt-logo" onerror="this.src='assets/media_1792458976201.jpg'">
        <div class="receipt-org">ĐOÀN TNCS HỒ CHÍ MINH - TRƯỜNG CAO ĐẲNG LONG AN</div>
        <div class="receipt-clb">CLB TÌNH NGUYỆN TRẺ TRỐNG ĐỒNG</div>
        <div class="receipt-title">PHIẾU NHẬP KHO ÁO ĐOÀN THANH NIÊN</div>
        <div style="font-size: 0.8rem; font-style: italic;">(Kiểm kê tiếp nhận lô hàng tại Văn phòng Đoàn)</div>
      </div>

      <div class="receipt-meta">
        <span><strong>Mã phiếu:</strong> ${imp.id}</span>
        <span><strong>Ngày nhập:</strong> ${formatDate(imp.date)}</span>
      </div>

      <div class="receipt-customer-box">
        <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
          <div><strong>Nhà cung cấp / Xưởng:</strong> ${imp.supplier}</div>
          <div><strong>Người tiếp nhận:</strong> ${imp.receiver}</div>
        </div>
        <div style="margin-top: 4px;">
          <strong>Ghi chú:</strong> ${imp.note || 'Không có ghi chú'}
        </div>
      </div>

      <table class="receipt-table">
        <thead>
          <tr>
            <th style="width: 35px; text-align: center;">STT</th>
            <th>Tên sản phẩm</th>
            <th style="width: 50px; text-align: center;">Size</th>
            <th style="width: 50px; text-align: center;">SL</th>
            <th style="width: 95px; text-align: right;">Giá vốn</th>
            <th style="width: 105px; text-align: right;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="receipt-total-box">
        <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 4px;">
          <span>Tổng số lượng áo nhập:</span>
          <strong style="color: #0284c7; font-size: 1.05rem;">${imp.totalQuantity} cái</strong>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 1.15rem; font-weight: 800; color: #f59e0b;">
          <span>TỔNG TIỀN PHIẾU NHẬP:</span>
          <span>${formatVND(imp.totalAmount)}</span>
        </div>
      </div>

      <div class="receipt-signatures">
        <div>
          <div class="sign-title">ĐẠI DIỆN BÊN GIAO HÀNG</div>
          <div style="font-style: italic; color: #64748b;">(Ký và ghi rõ họ tên)</div>
          <div style="margin-top: 35px; font-weight: 600;">${imp.supplier}</div>
        </div>
        <div>
          <div class="sign-title">NGƯỜI LẬP PHIẾU / THỦ KHO</div>
          <div style="font-style: italic; color: #64748b;">(Ký nhận)</div>
          <div style="margin-top: 35px; font-weight: 600;">${imp.receiver}</div>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

function closeImportDetailModal() {
  const modal = document.getElementById('modal-import-detail');
  if (modal) modal.classList.remove('active');
  activeViewingImportId = null;
}

function printImportReceipt() {
  window.print();
}

function deleteActiveImport() {
  if (activeViewingImportId) {
    const id = activeViewingImportId;
    closeImportDetailModal();
    deleteImportOrder(id);
  }
}


// ==========================================================================
// 4. BẢNG MA TRẬN KHO HÀNG & TỒN KHO CHI TIẾT
// ==========================================================================
function renderInventoryTable() {
  const container = document.getElementById('inventory-table-body');
  if (!container) return;

  const searchQuery = (document.getElementById('inventory-search-input')?.value || '').toLowerCase().trim();
  const stockFilter = state.activeStockFilter;

  let filtered = state.inventory.filter(item => {
    let matchStatus = true;
    if (stockFilter === 'in_stock') matchStatus = item.stock > item.lowStockThreshold;
    if (stockFilter === 'low_stock') matchStatus = item.stock > 0 && item.stock <= item.lowStockThreshold;
    if (stockFilter === 'out_of_stock') matchStatus = item.stock <= 0;

    const matchSearch = item.categoryName.toLowerCase().includes(searchQuery) ||
                        item.size.toLowerCase().includes(searchQuery) ||
                        item.target.toLowerCase().includes(searchQuery);

    return matchStatus && matchSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 30px;">Không có mục kho hàng nào phù hợp với bộ lọc.</td></tr>`;
    return;
  }

  let html = '';
  filtered.forEach(item => {
    let statusBadge = `<span class="badge-stock stock-in"><i class="fas fa-check-circle"></i> Đủ hàng (${item.stock})</span>`;
    if (item.stock <= 0) {
      statusBadge = `<span class="badge-stock stock-out"><i class="fas fa-times-circle"></i> Hết hàng (0)</span>`;
    } else if (item.stock <= item.lowStockThreshold) {
      statusBadge = `<span class="badge-stock stock-low"><i class="fas fa-exclamation-triangle"></i> Sắp hết (${item.stock})</span>`;
    }

    const catBadgeClass = item.categoryId === 'so-mi-nam' ? 'badge-male' : (item.categoryId === 'so-mi-nu' ? 'badge-female' : 'badge-unisex');

    html += `
      <tr>
        <td><strong style="color: var(--text-main); font-family: monospace;">${item.sku}</strong></td>
        <td>
          <div style="font-weight: 700;">${item.categoryName}</div>
          <span class="badge-tag ${catBadgeClass}">${item.target}</span>
        </td>
        <td><span class="size-pill">${item.size}</span></td>
        <td><strong style="color: #f59e0b;">${item.totalImported}</strong></td>
        <td><strong style="color: #10b981;">${item.totalSold}</strong></td>
        <td><strong style="font-size: 1.05rem; color: #0284c7;">${item.stock}</strong></td>
        <td><span class="price-tag">${formatVND(item.sellingPrice)}</span></td>
        <td>${statusBadge}</td>
        <td>
          <button class="btn btn-outline" style="padding: 4px 10px; font-size: 0.78rem;" onclick="openAdjustStockModal('${item.sku}')">
            <i class="fas fa-edit"></i> Kiểm kê
          </button>
        </td>
      </tr>
    `;
  });

  container.innerHTML = html;
}

// Modal Kiểm kê / Điều chỉnh tồn kho thủ công (Yêu cầu Admin)
function openAdjustStockModal(sku) {
  requireAdmin(() => {
    const item = state.inventory.find(i => i.sku === sku);
    if (!item) return;

    const newStockStr = prompt(`[KIỂM KÊ KHO]\nSản phẩm: ${item.categoryName} (Size ${item.size})\nTồn kho hiện tại trong hệ thống: ${item.stock} cái\n\nNhập số lượng tồn kho thực tế đếm được:`, item.stock);
    if (newStockStr === null) return;

    const newStock = parseInt(newStockStr, 10);
    if (isNaN(newStock) || newStock < 0) {
      showToast('Số lượng tồn kho không hợp lệ!', 'error');
      return;
    }

    const diff = newStock - item.stock;
    item.stock = newStock;
    saveAllToStorage();

    renderInventoryTable();
    renderPOSProducts();
    renderDashboard();

    showToast(`Đã cập nhật tồn kho cho size ${item.size} thành ${newStock} cái (Chênh lệch: ${diff >= 0 ? '+' : ''}${diff})`);
  });
}

// ==========================================================================
// 5. LỊCH SỬ GIAO DỊCH & XUẤT DỮ LIỆU
// ==========================================================================
function renderHistory() {
  const container = document.getElementById('history-table-body');
  if (!container) return;

  const filterType = document.getElementById('history-type-filter')?.value || 'all';

  let list = [];

  if (filterType === 'all' || filterType === 'sale') {
    state.sales.forEach(s => {
      list.push({
        type: 'sale',
        id: s.id,
        date: s.date,
        partner: s.customerName + (s.customerClass ? ` (${s.customerClass})` : ''),
        itemsSummary: s.items.map(it => `${it.categoryName.replace('Áo sơ mi Đoàn - Tay dài', 'Sơ mi').replace('Áo thun Đoàn Thanh Niên', 'Áo thun')} [${it.size}] x${it.quantity}`).join(', '),
        quantity: s.totalQuantity,
        amount: s.totalAmount,
        note: s.paymentMethod
      });
    });
  }

  if (filterType === 'all' || filterType === 'import') {
    state.imports.forEach(i => {
      list.push({
        type: 'import',
        id: i.id,
        date: i.date,
        partner: i.supplier,
        itemsSummary: i.items.map(it => {
          const cat = PRODUCT_CATEGORIES.find(c => c.id === it.categoryId);
          return `${cat ? cat.shortName : (it.categoryName || it.categoryId)} [${it.size}] x${it.quantity}`;
        }).join(', '),
        quantity: i.totalQuantity,
        amount: i.totalAmount,
        note: i.receiver || i.note
      });
    });
  }

  // Sắp xếp giảm dần theo ngày
  list.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (list.length === 0) {
    container.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 30px;">Chưa có giao dịch nào phù hợp.</td></tr>`;
    return;
  }

  let html = '';
  list.forEach(item => {
    const isSale = item.type === 'sale';
    const typeBadge = isSale 
      ? `<span class="badge-tag" style="background: #d1fae5; color: #065f46;"><i class="fas fa-shopping-cart"></i> Bán hàng</span>`
      : `<span class="badge-tag" style="background: #fef3c7; color: #92400e;"><i class="fas fa-arrow-down"></i> Nhập kho</span>`;

    html += `
      <tr>
        <td>${typeBadge}</td>
        <td><strong>${item.id}</strong></td>
        <td>${formatDate(item.date)}</td>
        <td>${item.partner}</td>
        <td style="max-width: 280px; font-size: 0.84rem;">${item.itemsSummary}</td>
        <td><strong>${item.quantity} cái</strong></td>
        <td><strong style="color: ${isSale ? 'var(--accent-red)' : '#f59e0b'};">${formatVND(item.amount)}</strong></td>
        <td>
          <div class="action-btn-group">
            ${isSale 
              ? `<button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.78rem;" onclick="viewReceipt('${item.id}')" title="Xem & In biên lai"><i class="fas fa-print"></i> In</button>
                 <button class="btn-warning-sm" onclick="openEditSaleModal('${item.id}')" title="Chỉnh sửa hóa đơn này (Admin)"><i class="fas fa-edit"></i> Sửa</button>`
              : `<button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.78rem;" onclick="viewImportDetail('${item.id}')" title="Xem & In phiếu nhập kho"><i class="fas fa-print"></i> In</button>`
            }
            <button class="btn-danger-sm" onclick="${isSale ? `deleteSaleOrder('${item.id}')` : `deleteImportOrder('${item.id}')`}" title="${isSale ? 'Xóa đơn bán và hoàn lại kho (Admin)' : 'Xóa phiếu nhập và trừ lùi kho (Admin)'}">
              <i class="fas fa-trash-alt"></i> Xóa
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  container.innerHTML = html;
}

// Tính lợi nhuận gộp ước tính
function calculateTotalProfit() {
  let totalRevenue = 0;
  let totalCostOfSold = 0;
  state.sales.forEach(s => {
    totalRevenue += s.totalAmount;
    s.items.forEach(it => {
      const found = state.inventory.find(inv => inv.categoryId === it.categoryId && inv.size === it.size);
      const cost = found ? found.costPrice : 80000;
      totalCostOfSold += cost * it.quantity;
    });
  });
  return totalRevenue - totalCostOfSold;
}

// ==========================================================================
// TÍNH NĂNG XUẤT DỮ LIỆU THÀNH FILE EXCEL (.XLSX)
// ==========================================================================

// Xuất toàn bộ CSDL và báo cáo ra 1 file Excel đa trang tính
function exportFullDataExcel() {
  if (typeof XLSX === 'undefined') {
    showToast('Đang tải SheetJS, chuyển sang xuất file CSV...', 'warning');
    exportInventoryCSV();
    return;
  }

  const wb = XLSX.utils.book_new();
  const now = new Date();

  // 1. Sheet Tổng Quan
  const summaryData = [
    ['CLB TÌNH NGUYỆN TRẺ TRỐNG ĐỒNG - ĐOÀN TRƯỜNG CAO ĐẲNG LONG AN'],
    ['BÁO CÁO TỔNG HỢP NHẬP - XUẤT - BÁN & TỒN KHO ÁO ĐOÀN THANH NIÊN'],
    ['Thời gian xuất:', formatDate(now.toISOString())],
    ['Đơn vị:', 'Văn phòng Đoàn Thanh niên - Số 60, QL1A, P.5, TP. Tân An, Long An'],
    [''],
    ['CHỈ SỐ THỐNG KÊ', 'GIÁ TRỊ'],
    ['Tổng áo tồn kho hiện tại', state.inventory.reduce((a, b) => a + b.stock, 0) + ' cái'],
    ['Tổng áo đã bán ra', state.inventory.reduce((a, b) => a + b.totalSold, 0) + ' cái'],
    ['Tổng áo đã nhập vào', state.inventory.reduce((a, b) => a + b.totalImported, 0) + ' cái'],
    ['Tổng doanh thu bán áo', formatVND(state.sales.reduce((a, b) => a + b.totalAmount, 0))],
    ['Lợi nhuận gộp ước tính', formatVND(calculateTotalProfit())]
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 32 }, { wch: 38 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'TongQuan');

  // 2. Sheet Báo Cáo Tồn Kho
  const inventoryHeaders = [
    'Mã SKU', 'Tên Loại Áo', 'Đối Tượng', 'Kích Cỡ', 'Giá Bán VPĐ (đ)', 'Giá Vốn Nhập (đ)',
    'Tổng Đã Nhập', 'Tổng Đã Bán', 'Tồn Kho Hiện Tại', 'Giá Trị Tồn Kho (đ)', 'Trạng Thái'
  ];
  const inventoryRows = state.inventory.map(i => {
    let status = 'Còn hàng đầy đủ';
    if (i.stock <= 0) status = 'Hết hàng';
    else if (i.stock <= i.lowStockThreshold) status = 'Sắp hết';

    return [
      i.sku,
      i.categoryName,
      i.target,
      i.size,
      i.sellingPrice,
      i.costPrice,
      i.totalImported,
      i.totalSold,
      i.stock,
      i.stock * i.costPrice,
      status
    ];
  });
  const wsInventory = XLSX.utils.aoa_to_sheet([inventoryHeaders, ...inventoryRows]);
  wsInventory['!cols'] = [
    { wch: 16 }, { wch: 32 }, { wch: 18 }, { wch: 10 }, { wch: 16 }, { wch: 16 },
    { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 18 }, { wch: 18 }
  ];
  XLSX.utils.book_append_sheet(wb, wsInventory, 'TonKho');

  // 3. Sheet Lịch Sử Bán Hàng
  const salesHeaders = [
    'Mã Hóa Đơn', 'Ngày Giờ Bán', 'Người Mua', 'Lớp / Chi Đoàn', 'Số Điện Thoại',
    'Người Bán VPĐ', 'Loại Áo', 'Kích Cỡ', 'Số Lượng', 'Đơn Giá (đ)', 'Thành Tiền (đ)',
    'Phương Thức TT', 'Tổng Tiền Đơn (đ)', 'Ghi Chú'
  ];
  const salesRows = [];
  state.sales.forEach(s => {
    if (s.items && s.items.length > 0) {
      s.items.forEach((it, idx) => {
        salesRows.push([
          idx === 0 ? s.id : '',
          idx === 0 ? formatDate(s.date) : '',
          idx === 0 ? s.customerName : '',
          idx === 0 ? (s.customerClass || '') : '',
          idx === 0 ? (s.customerPhone || '') : '',
          idx === 0 ? (s.seller || '') : '',
          it.categoryName || it.shortName,
          it.size,
          it.quantity,
          it.unitPrice,
          it.subtotal,
          idx === 0 ? s.paymentMethod : '',
          idx === 0 ? s.totalAmount : '',
          idx === 0 ? (s.note || '') : ''
        ]);
      });
    } else {
      salesRows.push([
        s.id, formatDate(s.date), s.customerName, s.customerClass || '', s.customerPhone || '',
        s.seller || '', '', '', s.totalQuantity, '', s.totalAmount, s.paymentMethod, s.totalAmount, s.note || ''
      ]);
    }
  });
  const wsSales = XLSX.utils.aoa_to_sheet([salesHeaders, ...salesRows]);
  wsSales['!cols'] = [
    { wch: 22 }, { wch: 18 }, { wch: 22 }, { wch: 20 }, { wch: 15 },
    { wch: 22 }, { wch: 30 }, { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 15 },
    { wch: 22 }, { wch: 16 }, { wch: 25 }
  ];
  XLSX.utils.book_append_sheet(wb, wsSales, 'LichSuBanHang');

  // 4. Sheet Lịch Sử Nhập Hàng
  const importHeaders = [
    'Mã Phiếu Nhập', 'Ngày Giờ Nhập', 'Nhà Cung Cấp', 'Người Nhận VPĐ',
    'Loại Áo', 'Kích Cỡ', 'Số Lượng', 'Giá Vốn (đ)', 'Thành Tiền (đ)',
    'Tổng Tiền Phiếu (đ)', 'Ghi Chú'
  ];
  const importRows = [];
  state.imports.forEach(imp => {
    if (imp.items && imp.items.length > 0) {
      imp.items.forEach((it, idx) => {
        const cat = PRODUCT_CATEGORIES.find(c => c.id === it.categoryId);
        const catName = cat ? cat.name : (it.categoryName || it.categoryId);
        importRows.push([
          idx === 0 ? imp.id : '',
          idx === 0 ? formatDate(imp.date) : '',
          idx === 0 ? imp.supplier : '',
          idx === 0 ? (imp.receiver || '') : '',
          catName,
          it.size,
          it.quantity,
          it.costPrice,
          it.subtotal,
          idx === 0 ? imp.totalAmount : '',
          idx === 0 ? (imp.note || '') : ''
        ]);
      });
    }
  });
  const wsImport = XLSX.utils.aoa_to_sheet([importHeaders, ...importRows]);
  wsImport['!cols'] = [
    { wch: 22 }, { wch: 18 }, { wch: 25 }, { wch: 25 },
    { wch: 30 }, { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 15 },
    { wch: 18 }, { wch: 25 }
  ];
  XLSX.utils.book_append_sheet(wb, wsImport, 'LichSuNhapHang');

  const fileName = `Bao_Cao_Tong_Hop_Ao_Doan_CLB_Trong_Dong_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
  showToast('Đã xuất toàn bộ dữ liệu ra tệp Excel (.xlsx) thành công!', 'success');
}

// Xuất riêng Báo Cáo Tồn Kho ra file Excel
function exportInventoryExcel() {
  if (typeof XLSX === 'undefined') {
    showToast('Đang tải SheetJS, chuyển sang xuất CSV...', 'warning');
    exportInventoryCSV();
    return;
  }
  const wb = XLSX.utils.book_new();
  const inventoryHeaders = [
    'Mã SKU', 'Tên Loại Áo', 'Đối Tượng', 'Kích Cỡ', 'Giá Bán VPĐ (đ)', 'Giá Vốn Nhập (đ)',
    'Tổng Đã Nhập', 'Tổng Đã Bán', 'Tồn Kho Hiện Tại', 'Giá Trị Tồn Kho (đ)', 'Trạng Thái'
  ];
  const inventoryRows = state.inventory.map(i => {
    let status = 'Còn hàng đầy đủ';
    if (i.stock <= 0) status = 'Hết hàng';
    else if (i.stock <= i.lowStockThreshold) status = 'Sắp hết';

    return [
      i.sku,
      i.categoryName,
      i.target,
      i.size,
      i.sellingPrice,
      i.costPrice,
      i.totalImported,
      i.totalSold,
      i.stock,
      i.stock * i.costPrice,
      status
    ];
  });
  const ws = XLSX.utils.aoa_to_sheet([
    ['BÁO CÁO TỒN KHO ÁO ĐOÀN THANH NIÊN - CLB TNTN TRỐNG ĐỒNG'],
    [`Ngày xuất báo cáo: ${formatDate(new Date().toISOString())}`],
    [''],
    inventoryHeaders,
    ...inventoryRows
  ]);
  ws['!cols'] = [
    { wch: 16 }, { wch: 32 }, { wch: 18 }, { wch: 10 }, { wch: 16 }, { wch: 16 },
    { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 18 }, { wch: 18 }
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'TonKho');
  XLSX.writeFile(wb, `Bao_Cao_Ton_Kho_Ao_Doan_${new Date().toISOString().slice(0, 10)}.xlsx`);
  showToast('Đã xuất báo cáo tồn kho ra file Excel (.xlsx) thành công!');
}

// Xuất riêng Lịch Sử Bán Hàng ra file Excel
function exportSalesExcel() {
  if (typeof XLSX === 'undefined') {
    showToast('Đang tải SheetJS, vui lòng thử lại sau...', 'warning');
    return;
  }
  const wb = XLSX.utils.book_new();
  const salesHeaders = [
    'Mã Hóa Đơn', 'Ngày Giờ Bán', 'Người Mua', 'Lớp / Chi Đoàn', 'Số Điện Thoại',
    'Người Bán VPĐ', 'Loại Áo', 'Kích Cỡ', 'Số Lượng', 'Đơn Giá (đ)', 'Thành Tiền (đ)',
    'Phương Thức TT', 'Tổng Tiền Đơn (đ)', 'Ghi Chú'
  ];
  const salesRows = [];
  state.sales.forEach(s => {
    if (s.items && s.items.length > 0) {
      s.items.forEach((it, idx) => {
        salesRows.push([
          idx === 0 ? s.id : '',
          idx === 0 ? formatDate(s.date) : '',
          idx === 0 ? s.customerName : '',
          idx === 0 ? (s.customerClass || '') : '',
          idx === 0 ? (s.customerPhone || '') : '',
          idx === 0 ? (s.seller || '') : '',
          it.categoryName || it.shortName,
          it.size,
          it.quantity,
          it.unitPrice,
          it.subtotal,
          idx === 0 ? s.paymentMethod : '',
          idx === 0 ? s.totalAmount : '',
          idx === 0 ? (s.note || '') : ''
        ]);
      });
    } else {
      salesRows.push([
        s.id, formatDate(s.date), s.customerName, s.customerClass || '', s.customerPhone || '',
        s.seller || '', '', '', s.totalQuantity, '', s.totalAmount, s.paymentMethod, s.totalAmount, s.note || ''
      ]);
    }
  });
  const ws = XLSX.utils.aoa_to_sheet([
    ['NHẬT KÝ BÁN HÀNG ÁO ĐOÀN THANH NIÊN - CLB TNTN TRỐNG ĐỒNG'],
    [`Ngày xuất báo cáo: ${formatDate(new Date().toISOString())}`],
    [''],
    salesHeaders,
    ...salesRows
  ]);
  ws['!cols'] = [
    { wch: 22 }, { wch: 18 }, { wch: 22 }, { wch: 20 }, { wch: 15 },
    { wch: 22 }, { wch: 30 }, { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 15 },
    { wch: 22 }, { wch: 16 }, { wch: 25 }
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'DonBanHang');
  XLSX.writeFile(wb, `Lich_Su_Ban_Hang_Ao_Doan_${new Date().toISOString().slice(0, 10)}.xlsx`);
  showToast('Đã xuất lịch sử bán hàng ra file Excel (.xlsx) thành công!');
}

// Xuất file CSV dự phòng
function exportInventoryCSV() {
  let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
  csvContent += 'Mã SKU,Loại Áo,Đối Tượng,Size,Giá Bán (đ),Tổng Đã Nhập,Tổng Đã Bán,Tồn Kho Hiện Tại,Trạng Thái\n';

  state.inventory.forEach(i => {
    let status = 'Đủ hàng';
    if (i.stock <= 0) status = 'Hết hàng';
    else if (i.stock <= i.lowStockThreshold) status = 'Sắp hết';

    csvContent += `"${i.sku}","${i.categoryName}","${i.target}","${i.size}",${i.sellingPrice},${i.totalImported},${i.totalSold},${i.stock},"${status}"\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Bao_Cao_Ton_Kho_Ao_Doan_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();

  showToast('Đã xuất báo cáo tồn kho ra tệp CSV thành công!');
}

// Sao lưu toàn bộ Database ra file JSON
function exportDatabaseJSON() {
  const data = {
    appName: 'QUAN_LY_AO_DOAN_CLB_TRONG_DONG',
    exportedAt: new Date().toISOString(),
    inventory: state.inventory,
    imports: state.imports,
    sales: state.sales
  };

  const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', jsonStr);
  link.setAttribute('download', `Sao_Luu_Du_Lieu_Ao_Doan_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  link.remove();

  showToast('Đã tải tệp sao lưu dữ liệu JSON về máy!');
}

// Phục hồi dữ liệu từ file JSON
function importDatabaseJSON(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const parsed = JSON.parse(evt.target.result);
      if (parsed.inventory && parsed.sales && parsed.imports) {
        state.inventory = parsed.inventory;
        state.sales = parsed.sales;
        state.imports = parsed.imports;
        saveAllToStorage();
        renderAll();
        showToast('Khôi phục dữ liệu từ tệp JSON thành công!', 'success');
      } else {
        showToast('Tệp JSON không đúng định dạng dữ liệu hệ thống!', 'error');
      }
    } catch (err) {
      showToast('Lỗi đọc tệp JSON: ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
}

// ==========================================================================
// 6. XEM BẢNG GIÁ NIÊM YẾT & MODAL BIÊN LAI
// ==========================================================================
function renderPricingCards() {
  const container = document.getElementById('pricing-grid-display');
  if (!container) return;

  let html = '';
  PRODUCT_CATEGORIES.forEach(cat => {
    html += `
      <div style="background: var(--bg-card); border: 2px solid var(--border-color); border-radius: var(--radius-lg); padding: 22px; box-shadow: var(--shadow-sm); display: flex; flex-direction: column;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <div>
            <h3 style="font-size: 1.15rem; font-weight: 800; color: #0052cc;">
              <i class="fas ${cat.icon}" style="margin-right: 6px;"></i> ${cat.name}
            </h3>
            <span class="badge-tag ${cat.badgeClass}" style="margin-top: 4px;">${cat.target}</span>
          </div>
          <span style="background: #e0f2fe; color: #0284c7; padding: 4px 8px; border-radius: 6px; font-weight: 700; font-size: 0.8rem;">VPĐ Niêm Yết</span>
        </div>

        <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 16px;">
          ${cat.description}
        </p>

        <table style="width: 100%; border-collapse: collapse; font-size: 0.88rem; margin-bottom: 18px;">
          <thead>
            <tr style="background: var(--bg-card-alt); border-bottom: 1px solid var(--border-color);">
              <th style="padding: 8px; text-align: left;">Nhóm Size</th>
              <th style="padding: 8px; text-align: right;">Đơn Giá</th>
              <th style="padding: 8px; text-align: center;">Tồn Kho</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid var(--border-color);">
              <td style="padding: 8px;"><strong>Size S - 3XL</strong></td>
              <td style="padding: 8px; text-align: right; color: var(--accent-red); font-weight: 800;">120.000 đ</td>
              <td style="padding: 8px; text-align: center; color: #0284c7; font-weight: 700;">
                ${state.inventory.filter(i => i.categoryId === cat.id && ['S','M','L','XL','2XL','3XL'].includes(i.size)).reduce((a,b)=>a+b.stock,0)} cái
              </td>
            </tr>
            <tr style="border-bottom: 1px solid var(--border-color);">
              <td style="padding: 8px;"><strong>Size 4XL - 5XL</strong></td>
              <td style="padding: 8px; text-align: right; color: var(--accent-red); font-weight: 800;">125.000 đ</td>
              <td style="padding: 8px; text-align: center; color: #0284c7; font-weight: 700;">
                ${state.inventory.filter(i => i.categoryId === cat.id && ['4XL','5XL'].includes(i.size)).reduce((a,b)=>a+b.stock,0)} cái
              </td>
            </tr>
            <tr>
              <td style="padding: 8px;"><strong>Size 6XL (Đặc biệt)</strong></td>
              <td style="padding: 8px; text-align: right; color: var(--accent-red); font-weight: 800;">130.000 đ</td>
              <td style="padding: 8px; text-align: center; color: #0284c7; font-weight: 700;">
                ${state.inventory.filter(i => i.categoryId === cat.id && i.size === '6XL').reduce((a,b)=>a+b.stock,0)} cái
              </td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: auto;">
          <button class="btn btn-primary btn-block" onclick="quickSelectCategory('${cat.id}')">
            <i class="fas fa-cart-plus"></i> Bán Áo Loại Này Ngay
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function quickSelectCategory(catId) {
  switchTab('pos');
  const chip = document.querySelector(`.pos-cat-filter[data-cat="${catId}"]`);
  if (chip) chip.click();
}

// Xem biên lai / In hóa đơn
function viewReceipt(saleId) {
  const sale = state.sales.find(s => s.id === saleId);
  if (!sale) {
    showToast('Không tìm thấy thông tin đơn hàng ' + saleId, 'error');
    return;
  }

  const modal = document.getElementById('modal-receipt');
  const body = document.getElementById('receipt-modal-content');
  if (!modal || !body) return;

  let itemsHtml = '';
  sale.items.forEach((item, index) => {
    itemsHtml += `
      <tr>
        <td style="text-align: center;">${index + 1}</td>
        <td>
          <strong>${item.categoryName}</strong><br>
          <small>Size: <strong>${item.size}</strong></small>
        </td>
        <td style="text-align: center; font-weight: 700;">${item.quantity}</td>
        <td style="text-align: right;">${formatVND(item.unitPrice)}</td>
        <td style="text-align: right; font-weight: 700;">${formatVND(item.subtotal)}</td>
      </tr>
    `;
  });

  body.innerHTML = `
    <div class="receipt-paper">
      <div class="receipt-header">
        <img src="assets/logo-clb-trong-dong.png" alt="Logo CLB Trống Đồng" class="receipt-logo" onerror="this.src='assets/media_1792458976201.jpg'">
        <div class="receipt-org">ĐOÀN TNCS HỒ CHÍ MINH - TRƯỜNG CAO ĐẲNG LONG AN</div>
        <div class="receipt-clb">CLB TÌNH NGUYỆN TRẺ TRỐNG ĐỒNG</div>
        <div class="receipt-address">Địa chỉ: Văn phòng Đoàn Thanh niên - Số 60, QL1A, P.5, TP. Tân An, Long An</div>
        <div class="receipt-title">PHIẾU BÁN ÁO ĐOÀN THANH NIÊN</div>
        <div style="font-size: 0.8rem; font-style: italic;">(Bảng giá niêm yết Văn phòng Đoàn)</div>
      </div>

      <div class="receipt-meta">
        <span><strong>Số phiếu:</strong> ${sale.id}</span>
        <span><strong>Ngày lập:</strong> ${formatDate(sale.date)}</span>
      </div>

      <div class="receipt-customer-box">
        <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
          <div><strong>Người mua:</strong> ${sale.customerName}</div>
          <div><strong>Lớp / Chi đoàn:</strong> ${sale.customerClass || 'N/A'}</div>
        </div>
        <div style="display: flex; justify-content: space-between; flex-wrap: wrap; margin-top: 4px;">
          <div><strong>Điện thoại:</strong> ${sale.customerPhone || 'Chưa cung cấp'}</div>
          <div><strong>Thanh toán:</strong> <span style="color: var(--primary); font-weight: 700;">${sale.paymentMethod}</span></div>
        </div>
      </div>

      <table class="receipt-table">
        <thead>
          <tr>
            <th style="width: 35px; text-align: center;">STT</th>
            <th>Loại áo & Kích cỡ</th>
            <th style="width: 50px; text-align: center;">SL</th>
            <th style="width: 95px; text-align: right;">Đơn giá</th>
            <th style="width: 105px; text-align: right;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="receipt-total-box">
        <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 4px;">
          <span>Tổng số lượng áo:</span>
          <strong>${sale.totalQuantity} cái</strong>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 1.15rem; font-weight: 800; color: #d90429;">
          <span>TỔNG CỘNG THANH TOÁN:</span>
          <span>${formatVND(sale.totalAmount)}</span>
        </div>
      </div>

      <div style="font-size: 0.76rem; font-style: italic; text-align: center; color: #475569; margin-top: 10px;">
        * Đoàn viên vui lòng kiểm tra kỹ loại áo, size áo trước khi rời quầy.<br>
        "Tuổi trẻ Đoàn kết - Cống hiến &bull; Cùng khoác lên màu áo xanh vì một tương lai tốt đẹp hơn!"
      </div>

      <div class="receipt-signatures">
        <div>
          <div class="sign-title">NGƯỜI MUA HÀNG</div>
          <div style="font-style: italic; color: #64748b;">(Ký và ghi rõ họ tên)</div>
          <div style="margin-top: 35px; font-weight: 600;">${sale.customerName}</div>
        </div>
        <div>
          <div class="sign-title">ĐẠI DIỆN VĂN PHÒNG ĐOÀN</div>
          <div style="font-style: italic; color: #64748b;">(Ký nhận)</div>
          <div style="margin-top: 35px; font-weight: 600;">${sale.seller || 'BCH CLB Trống Đồng'}</div>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
  activeViewingReceiptId = saleId;
}

let activeViewingReceiptId = null;

function closeReceiptModal() {
  const modal = document.getElementById('modal-receipt');
  if (modal) modal.classList.remove('active');
  activeViewingReceiptId = null;
}

function printReceipt() {
  window.print();
}

// ==========================================================================
// 7. CÁC HÀM XỬ LÝ XÓA PHIẾU & DỌN DẸP LỊCH SỬ GIAO DỊCH
// ==========================================================================

// Xóa 1 đơn bán hàng và tự động hoàn trả số áo vào tồn kho (Yêu cầu Admin)
function deleteSaleOrder(saleId) {
  requireAdmin(() => {
    const sale = state.sales.find(s => s.id === saleId);
    if (!sale) return;

    const totalQty = sale.totalQuantity || sale.items.reduce((a, b) => a + b.quantity, 0);
    const confirmMsg = `[XÁC NHẬN XÓA ĐƠN BÁN HÀNG]\n\nBạn có chắc muốn xóa đơn ${sale.id} của khách "${sale.customerName}"?\nTổng tiền: ${formatVND(sale.totalAmount)}\n\n⚠️ Lưu ý: Hệ thống sẽ tự động HOÀN TRẢ LẠI ${totalQty} cái áo vào số lượng TỒN KHO để đảm bảo kho không bị thất thoát!`;

    if (!confirm(confirmMsg)) return;

    // Hoàn trả số lượng vào tồn kho và giảm tổng đã bán
    sale.items.forEach(cartItem => {
      const invItem = state.inventory.find(i => 
        i.sku === cartItem.sku || 
        (i.categoryId === cartItem.categoryId && i.size === cartItem.size)
      );
      if (invItem) {
        invItem.stock += cartItem.quantity;
        invItem.totalSold = Math.max(0, invItem.totalSold - cartItem.quantity);
      }
    });

    // Xóa khỏi danh sách đơn
    state.sales = state.sales.filter(s => s.id !== saleId);
    saveAllToStorage();

    // Đóng modal biên lai nếu đang xem đơn này
    if (activeViewingReceiptId === saleId) {
      closeReceiptModal();
    }

    // Cập nhật lại toàn bộ giao diện
    renderDashboard();
    renderPOSProducts();
    renderInventoryTable();
    renderHistory();
    renderPricingCards();

    showToast(`Đã xóa đơn ${saleId} và hoàn trả ${totalQty} cái áo vào kho thành công!`, 'success');
  });
}

// Xóa đơn đang xem trong popup biên lai
function deleteActiveReceipt() {
  if (activeViewingReceiptId) {
    deleteSaleOrder(activeViewingReceiptId);
  }
}

// Chỉnh sửa đơn đang xem trong popup biên lai
function editActiveReceipt() {
  if (activeViewingReceiptId) {
    openEditSaleModal(activeViewingReceiptId);
  }
}

// Xóa 1 phiếu nhập hàng và tự động trừ lùi tồn kho (Yêu cầu Admin)
function deleteImportOrder(importId) {
  requireAdmin(() => {
    const imp = state.imports.find(i => i.id === importId);
    if (!imp) return;

    const totalQty = imp.totalQuantity || imp.items.reduce((a, b) => a + b.quantity, 0);
    const confirmMsg = `[XÁC NHẬN XÓA PHIẾU NHẬP HÀNG]\n\nBạn có chắc muốn xóa phiếu nhập ${imp.id}?\nNhà cung cấp: ${imp.supplier}\nTổng tiền: ${formatVND(imp.totalAmount)}\n\n⚠️ Lưu ý: Hệ thống sẽ tự động TRỪ LÙI ${totalQty} cái áo khỏi TỒN KHO và TỔNG ĐÃ NHẬP!`;

    if (!confirm(confirmMsg)) return;

    // Trừ lùi tồn kho
    imp.items.forEach(it => {
      const invItem = state.inventory.find(i => 
        (it.sku && i.sku === it.sku) || 
        (i.categoryId === it.categoryId && i.size === it.size)
      );
      if (invItem) {
        invItem.stock = Math.max(0, invItem.stock - it.quantity);
        invItem.totalImported = Math.max(0, invItem.totalImported - it.quantity);
      }
    });

    // Xóa khỏi danh sách phiếu nhập
    state.imports = state.imports.filter(i => i.id !== importId);
    saveAllToStorage();

    // Cập nhật lại giao diện
    renderImportHistory();
    renderDashboard();
    renderInventoryTable();
    renderPOSProducts();
    renderHistory();
    renderPricingCards();

    showToast(`Đã xóa phiếu nhập ${importId} và cập nhật trừ lùi ${totalQty} áo khỏi kho!`, 'success');
  });
}

// Xóa toàn bộ lịch sử bán hàng (Yêu cầu Admin)
function confirmClearSalesHistory() {
  requireAdmin(() => {
    if (state.sales.length === 0) {
      showToast('Hiện không có đơn bán hàng nào trong hệ thống!', 'info');
      return;
    }

    const promptMsg = prompt(
      `[CẢNH BÁO: XÓA TOÀN BỘ LỊCH SỬ BÁN HÀNG]\n\n` +
      `Hiện có ${state.sales.length} đơn bán trong hệ thống.\n` +
      `Nếu bạn muốn xóa sạch toàn bộ lịch sử đơn bán (để bắt đầu năm học mới hoặc dọn dữ liệu thử nghiệm):\n\n` +
      `👉 Hãy nhập chữ "XOA" (in hoa không dấu) vào ô bên dưới và nhấn OK:`
    );

    if (promptMsg === 'XOA') {
      state.sales = [];
      saveAllToStorage();
      renderDashboard();
      renderHistory();
      showToast('Đã dọn dẹp xóa toàn bộ lịch sử đơn bán hàng!', 'success');
    }
  });
}

// Xóa toàn bộ lịch sử phiếu nhập hàng (Yêu cầu Admin)
function confirmClearImportsHistory() {
  requireAdmin(() => {
    if (state.imports.length === 0) {
      showToast('Hiện không có phiếu nhập hàng nào trong hệ thống!', 'info');
      return;
    }

    const promptMsg = prompt(
      `[CẢNH BÁO: XÓA TOÀN BỘ PHIẾU NHẬP HÀNG]\n\n` +
      `Hiện có ${state.imports.length} phiếu nhập trong hệ thống.\n` +
      `👉 Hãy nhập chữ "XOA" (in hoa không dấu) vào ô bên dưới và nhấn OK:`
    );

    if (promptMsg === 'XOA') {
      state.imports = [];
      saveAllToStorage();
      renderImportHistory();
      renderDashboard();
      renderHistory();
      showToast('Đã xóa toàn bộ phiếu nhập kho!', 'success');
    }
  });
}

// Modal xem ảnh poster gốc
function openPosterModal() {
  const modal = document.getElementById('modal-poster');
  if (modal) modal.classList.add('active');
}

function closePosterModal() {
  const modal = document.getElementById('modal-poster');
  if (modal) modal.classList.remove('active');
}

// ==========================================================================
// 8. TÍNH NĂNG CHỈNH SỬA HÓA ĐƠN BÁN HÀNG (YÊU CẦU QUYỀN ADMIN)
// ==========================================================================
let editingSaleId = null;
let editingSaleItems = [];

// Mở modal chỉnh sửa hóa đơn bán hàng
function openEditSaleModal(saleId) {
  requireAdmin(() => {
    const sale = state.sales.find(s => s.id === saleId);
    if (!sale) {
      showToast('Không tìm thấy thông tin đơn hàng ' + saleId, 'error');
      return;
    }

    editingSaleId = saleId;
    editingSaleItems = JSON.parse(JSON.stringify(sale.items || []));

    // Điền thông tin vào form
    const idHidden = document.getElementById('edit-sale-id');
    const idBadge = document.getElementById('edit-sale-id-badge');
    const custName = document.getElementById('edit-sale-customer-name');
    const custClass = document.getElementById('edit-sale-customer-class');
    const custPhone = document.getElementById('edit-sale-customer-phone');
    const seller = document.getElementById('edit-sale-seller');
    const dateInp = document.getElementById('edit-sale-date');
    const payment = document.getElementById('edit-sale-payment-method');
    const note = document.getElementById('edit-sale-note');

    if (idHidden) idHidden.value = sale.id;
    if (idBadge) idBadge.textContent = `(${sale.id})`;
    if (custName) custName.value = sale.customerName || '';
    if (custClass) custClass.value = sale.customerClass || '';
    if (custPhone) custPhone.value = sale.customerPhone || '';
    if (seller) seller.value = sale.seller || 'BCH CLB Trống Đồng';
    if (dateInp) dateInp.value = sale.date || '';
    if (payment) payment.value = sale.paymentMethod || 'Tiền mặt';
    if (note) note.value = sale.note || '';

    // Render danh sách mặt hàng
    renderEditingSaleItems();

    const modal = document.getElementById('modal-edit-sale');
    if (modal) modal.classList.add('active');
  });
}

// Đóng modal chỉnh sửa
function closeEditSaleModal() {
  const modal = document.getElementById('modal-edit-sale');
  if (modal) modal.classList.remove('active');
  editingSaleId = null;
  editingSaleItems = [];
}

// Render các mặt hàng trong đơn đang sửa
function renderEditingSaleItems() {
  const tbody = document.getElementById('edit-sale-items-body');
  const countBadge = document.getElementById('edit-items-count-badge');
  const totalQtyEl = document.getElementById('edit-summary-total-qty');
  const totalAmountEl = document.getElementById('edit-summary-total-amount');

  if (!tbody) return;

  const totalQty = editingSaleItems.reduce((a, b) => a + (parseInt(b.quantity, 10) || 0), 0);
  const totalAmount = editingSaleItems.reduce((a, b) => a + ((parseInt(b.quantity, 10) || 0) * (b.unitPrice || 0)), 0);

  if (countBadge) countBadge.textContent = `${editingSaleItems.length} mặt hàng`;
  if (totalQtyEl) totalQtyEl.textContent = `${totalQty} cái`;
  if (totalAmountEl) totalAmountEl.textContent = formatVND(totalAmount);

  if (editingSaleItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 18px;">Hóa đơn hiện chưa có mặt hàng nào. Vui lòng thêm ít nhất 1 mặt hàng phía dưới!</td></tr>`;
    return;
  }

  let html = '';
  editingSaleItems.forEach((it, idx) => {
    const qty = parseInt(it.quantity, 10) || 0;
    const subtotal = qty * (it.unitPrice || 0);
    it.subtotal = subtotal;

    html += `
      <tr>
        <td style="text-align: center; font-weight: 600;">${idx + 1}</td>
        <td>
          <strong>${it.categoryName || it.shortName}</strong>
          <span class="size-pill" style="margin-left: 6px;">Size ${it.size}</span>
        </td>
        <td style="text-align: center;">
          <div style="display: inline-flex; align-items: center; justify-content: center; gap: 4px;">
            <button type="button" class="btn btn-outline" style="padding: 2px 8px; font-size: 0.75rem;" onclick="changeEditingItemQty(${idx}, -1)">-</button>
            <input type="number" class="edit-qty-input" value="${qty}" min="1" onchange="setEditingItemQty(${idx}, this.value)">
            <button type="button" class="btn btn-outline" style="padding: 2px 8px; font-size: 0.75rem;" onclick="changeEditingItemQty(${idx}, 1)">+</button>
          </div>
        </td>
        <td style="text-align: right; font-weight: 600;">${formatVND(it.unitPrice)}</td>
        <td style="text-align: right; font-weight: 700; color: var(--accent-red);">${formatVND(subtotal)}</td>
        <td style="text-align: center;">
          <button type="button" class="btn-remove-item" onclick="removeEditingItem(${idx})" title="Xóa món này khỏi đơn">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// Tăng / giảm số lượng
function changeEditingItemQty(index, delta) {
  if (!editingSaleItems[index]) return;
  const current = parseInt(editingSaleItems[index].quantity, 10) || 0;
  const newQty = current + delta;
  if (newQty <= 0) {
    if (confirm(`Bạn có muốn xóa mặt hàng "${editingSaleItems[index].shortName || editingSaleItems[index].categoryName} [${editingSaleItems[index].size}]" khỏi hóa đơn?`)) {
      removeEditingItem(index);
    }
    return;
  }
  editingSaleItems[index].quantity = newQty;
  editingSaleItems[index].subtotal = newQty * (editingSaleItems[index].unitPrice || 0);
  renderEditingSaleItems();
}

// Điền số lượng trực tiếp
function setEditingItemQty(index, value) {
  if (!editingSaleItems[index]) return;
  let val = parseInt(value, 10);
  if (isNaN(val) || val <= 0) val = 1;
  editingSaleItems[index].quantity = val;
  editingSaleItems[index].subtotal = val * (editingSaleItems[index].unitPrice || 0);
  renderEditingSaleItems();
}

// Xóa 1 mặt hàng trong hóa đơn đang sửa
function removeEditingItem(index) {
  editingSaleItems.splice(index, 1);
  renderEditingSaleItems();
}

// Thêm mặt hàng mới vào hóa đơn đang sửa
function handleAddProductToEditingSale() {
  const catId = document.getElementById('edit-add-category').value;
  const size = document.getElementById('edit-add-size').value;
  const qty = parseInt(document.getElementById('edit-add-quantity').value, 10) || 1;

  if (qty <= 0) {
    showToast('Số lượng áo phải lớn hơn 0!', 'warning');
    return;
  }

  const cat = PRODUCT_CATEGORIES.find(c => c.id === catId);
  const sku = `${catId}-${size}`;
  const unitPrice = getSellingPrice(catId, size);

  // Kiểm tra xem món này đã có trong danh sách sửa chưa
  const existing = editingSaleItems.find(it => it.sku === sku || (it.categoryId === catId && it.size === size));
  if (existing) {
    existing.quantity = (parseInt(existing.quantity, 10) || 0) + qty;
    existing.subtotal = existing.quantity * existing.unitPrice;
  } else {
    editingSaleItems.push({
      sku,
      categoryId: catId,
      categoryName: cat ? cat.name : catId,
      shortName: cat ? cat.shortName : catId,
      size,
      quantity: qty,
      unitPrice,
      subtotal: qty * unitPrice
    });
  }

  document.getElementById('edit-add-quantity').value = 1;
  renderEditingSaleItems();
  showToast(`Đã thêm ${cat ? cat.shortName : ''} [${size}] vào đơn!`, 'info');
}

// Lưu toàn bộ chỉnh sửa hóa đơn & đồng bộ tồn kho
function handleSaveEditedSale(e) {
  if (e) e.preventDefault();

  if (!isAdmin()) {
    showToast('Yêu cầu quyền Admin để lưu chỉnh sửa hóa đơn!', 'error');
    openAdminLoginModal();
    return;
  }

  if (!editingSaleId) return;
  const sale = state.sales.find(s => s.id === editingSaleId);
  if (!sale) {
    showToast('Không tìm thấy hóa đơn cần lưu chỉnh sửa!', 'error');
    return;
  }

  if (editingSaleItems.length === 0) {
    showToast('Hóa đơn phải có ít nhất 1 mặt hàng áo!', 'error');
    return;
  }

  // 1. Kiểm tra tồn kho an toàn bằng cách tạo bản sao tồn kho
  const tempInventory = JSON.parse(JSON.stringify(state.inventory));

  // Hoàn lại số lượng cũ của đơn hàng về kho tạm
  sale.items.forEach(oldItem => {
    const inv = tempInventory.find(i => 
      i.sku === oldItem.sku || 
      (i.categoryId === oldItem.categoryId && i.size === oldItem.size)
    );
    if (inv) {
      inv.stock += oldItem.quantity;
      inv.totalSold = Math.max(0, inv.totalSold - oldItem.quantity);
    }
  });

  // Kiểm tra từng món mới xem kho tạm có đủ đáp ứng không
  for (const newItem of editingSaleItems) {
    const inv = tempInventory.find(i => 
      i.sku === newItem.sku || 
      (i.categoryId === newItem.categoryId && i.size === newItem.size)
    );
    const requiredQty = parseInt(newItem.quantity, 10) || 0;
    if (!inv || inv.stock < requiredQty) {
      const available = inv ? inv.stock : 0;
      showToast(`Không đủ tồn kho cho ${newItem.shortName || newItem.categoryName} [Size ${newItem.size}]! Tồn kho khả dụng chỉ còn: ${available} cái.`, 'error');
      return;
    }
  }

  // Nếu đủ toàn bộ, trừ kho tạm theo số lượng mới
  editingSaleItems.forEach(newItem => {
    const inv = tempInventory.find(i => 
      i.sku === newItem.sku || 
      (i.categoryId === newItem.categoryId && i.size === newItem.size)
    );
    const requiredQty = parseInt(newItem.quantity, 10) || 0;
    if (inv) {
      inv.stock -= requiredQty;
      inv.totalSold += requiredQty;
    }
  });

  // Áp dụng kho tạm vào kho chính thức
  state.inventory = tempInventory;

  // Cập nhật thông tin khách hàng và chi tiết đơn
  sale.customerName = document.getElementById('edit-sale-customer-name')?.value.trim() || 'Đoàn viên / Sinh viên';
  sale.customerClass = document.getElementById('edit-sale-customer-class')?.value.trim() || '';
  sale.customerPhone = document.getElementById('edit-sale-customer-phone')?.value.trim() || '';
  sale.seller = document.getElementById('edit-sale-seller')?.value.trim() || 'Văn phòng Đoàn';
  sale.date = document.getElementById('edit-sale-date')?.value.trim() || sale.date;
  sale.paymentMethod = document.getElementById('edit-sale-payment-method')?.value || 'Tiền mặt';
  sale.note = document.getElementById('edit-sale-note')?.value.trim() || '';

  sale.items = JSON.parse(JSON.stringify(editingSaleItems));
  sale.totalQuantity = editingSaleItems.reduce((a, b) => a + (parseInt(b.quantity, 10) || 0), 0);
  sale.totalAmount = editingSaleItems.reduce((a, b) => a + ((parseInt(b.quantity, 10) || 0) * (b.unitPrice || 0)), 0);

  // Lưu vào LocalStorage
  saveAllToStorage();

  // Cập nhật lại toàn bộ màn hình
  renderAll();

  const savedId = sale.id;
  closeEditSaleModal();

  // Cập nhật lại biên lai nếu đang mở xem đơn này
  if (activeViewingReceiptId === savedId) {
    viewReceipt(savedId);
  }

  showToast(`Đã lưu thay đổi hóa đơn ${savedId} và đồng bộ kho thành công!`, 'success');
}

/**
 * Bật/tắt thanh tiện ích trên thiết bị di động (Mobile Secondary Actions)
 */
function toggleMobileSecondaryMenu() {
  const menu = document.getElementById('header-secondary-actions');
  const btn = document.getElementById('btn-mobile-menu-toggle');
  if (!menu) return;

  menu.classList.toggle('is-open');
  if (btn) {
    if (menu.classList.contains('is-open')) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  }
}

// Tự động đóng menu phụ khi người dùng chạm ra ngoài trên điện thoại
document.addEventListener('click', (e) => {
  const menu = document.getElementById('header-secondary-actions');
  const btn = document.getElementById('btn-mobile-menu-toggle');
  if (menu && menu.classList.contains('is-open')) {
    if (!menu.contains(e.target) && !btn?.contains(e.target)) {
      menu.classList.remove('is-open');
      btn?.classList.remove('active');
    }
  }
});

