const MOCKAPI_URL = 'https://6a980c747160beda22929f9d.mockapi.io/cart';

function doiClass(el, boClassGo, boClassThem) {
  if (boClassGo) el.classList.remove(...boClassGo.split(' '));
  if (boClassThem) el.classList.add(...boClassThem.split(' '));
}

// ===== HEADER: TOGGLE MENU HAMBURGER ====
const hamburgerBtn = document.getElementById('hamburger-btn');
const mainNav = document.getElementById('main-nav');

hamburgerBtn.addEventListener('click', function () {
  const dangAn = mainNav.classList.contains('hidden');
  if (dangAn) {
    doiClass(mainNav, 'hidden', 'flex flex-col');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
  } else {
    doiClass(mainNav, 'flex flex-col', 'hidden');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
  }
});

const navLinks = document.querySelectorAll('#main-nav a');

navLinks.forEach(function (link) {
  link.addEventListener('click', function () {
    doiClass(mainNav, 'flex flex-col', 'hidden');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
  });
});


// ===================== FLIP CARD =====================
const ROTATE_180 = '[transform:rotateY(180deg)]';
const allCards = document.querySelectorAll('.card');

allCards.forEach(function (card) {
  const cardInner = card.querySelector('.card-inner');
  const flipButtons = card.querySelectorAll('.btn-flip');

  flipButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      cardInner.classList.toggle(ROTATE_180);
    });
  });
});


// ===================== GIỎ HÀNG =====================

let gioHang = [];
const DISCOUNT_COMBO = 1000000; 

const cartList = document.getElementById('cart-list');
const cartEmpty = document.getElementById('cart-empty');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartDiscountRow = document.getElementById('cart-discount-row');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.getElementById('cart-count');

function dinhDangTien(soTien) {
  return soTien.toLocaleString('vi-VN') + 'đ';
}

function timTrongGio(moduleId) {
  return gioHang.find(function (item) {
    return item.moduleId === moduleId;
  });
}

function capNhatNutTrenCard(moduleId, daThem, dangXuLy) {
  const card = document.querySelector('.card[data-module-id="' + moduleId + '"]');
  if (!card) return;
  const addBtn = card.querySelector('.btn-add-cart');
  const gia = Number(card.dataset.price);

  if (dangXuLy) {
    addBtn.disabled = true;
    addBtn.textContent = 'Đang xử lý...';
    return;
  }

  addBtn.disabled = false;

  if (daThem) {
    doiClass(addBtn, 'bg-orange-600 hover:bg-orange-700', 'bg-emerald-600 hover:bg-emerald-700');
    addBtn.textContent = 'Đã thêm vào giỏ';
  } else {
    doiClass(addBtn, 'bg-emerald-600 hover:bg-emerald-700', 'bg-orange-600 hover:bg-[#b85c3f]');
    addBtn.textContent = 'Thêm vào giỏ';
  }
}

// ----- GET: tải giỏ hàng từ Mock API (gọi lúc tải trang, và sau mỗi lần thay đổi) -----
async function taiGioHangTuAPI() {
  try {
    const response = await fetch(MOCKAPI_URL);
    if (!response.ok) {
      throw new Error('Server phản hồi lỗi: ' + response.status);
    }
    const data = await response.json();
    gioHang = data;

    allCards.forEach(function (card) {
      const moduleId = card.dataset.moduleId;
      const daCo = !!timTrongGio(moduleId);
      capNhatNutTrenCard(moduleId, daCo, false);
    });

    veLaiGioHang();
  } catch (loi) {
    console.log('Không tải được giỏ hàng từ API:', loi);
    cartEmpty.textContent = 'Không tải được giỏ hàng, kiểm tra kết nối mạng hoặc địa chỉ Mock API.';
  }
}

// ----- POST: thêm 1 module vào giỏ hàng qua API -----
async function themVaoGioAPI(moduleId, tenModule, gia) {
  capNhatNutTrenCard(moduleId, false, true); // hiện "Đang xử lý..." trong lúc chờ

  try {
    const response = await fetch(MOCKAPI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleId: moduleId, tenModule: tenModule, gia: gia })
    });

    if (!response.ok) {
      throw new Error('Không thêm được vào giỏ, server báo lỗi ' + response.status);
    }

    checkoutMessage.textContent = ''; 
    await taiGioHangTuAPI(); 
    moGioHang();
  } catch (loi) {
    console.log('Lỗi khi thêm vào giỏ:', loi);
    capNhatNutTrenCard(moduleId, false, false);
    alert('Không thêm được vào giỏ hàng. Vui lòng thử lại.');
  }
}

// ----- DELETE: xóa 1 item khỏi giỏ hàng qua API -----
async function xoaKhoiGioAPI(itemIdTrenAPI, moduleId) {
  try {
    const response = await fetch(MOCKAPI_URL + '/' + itemIdTrenAPI, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Không xóa được, server báo lỗi ' + response.status);
    }
    
    checkoutMessage.textContent = '';
    await taiGioHangTuAPI();
  } catch (loi) {
    console.log('Lỗi khi xóa khỏi giỏ:', loi);
    alert('Không xóa được module này. Vui lòng thử lại.');
  }
}

function veLaiGioHang() {
  cartList.innerHTML = '';
  cartCount.textContent = gioHang.length;

  if (gioHang.length === 0) {
    cartEmpty.textContent = 'Chưa có module nào được chọn.';
    cartList.appendChild(cartEmpty);
    cartSubtotal.textContent = dinhDangTien(0);
    doiClass(cartDiscountRow, 'flex', 'hidden');
    cartTotal.textContent = dinhDangTien(0);
    return;
  }

  let tamTinh = 0;

  gioHang.forEach(function (item) {
    tamTinh += Number(item.gia);

    const li = document.createElement('li');
    li.className = 'flex justify-between items-start gap-2.5 py-3 border-b border-gray-100';

    const infoDiv = document.createElement('div');
    infoDiv.className = 'flex flex-col gap-1 text-sm';
    infoDiv.innerHTML = '<strong>' + item.tenModule + '</strong><span class="text-orange-600 font-semibold text-[13px]">' + dinhDangTien(Number(item.gia)) + '</span>';

    const removeBtn = document.createElement('button');
    removeBtn.className = 'bg-transparent border-0 text-red-500 cursor-pointer text-[15px] px-1.5 py-0.5';
    removeBtn.setAttribute('aria-label', 'Xóa khỏi giỏ hàng');
    removeBtn.textContent = '✕';
    removeBtn.addEventListener('click', function () {
      xoaKhoiGioAPI(item.id, item.moduleId);
    });

    li.appendChild(infoDiv);
    li.appendChild(removeBtn);
    cartList.appendChild(li);
  });

  const duDu4Module = gioHang.length === 4;
  const giamGia = duDu4Module ? DISCOUNT_COMBO : 0;
  const tongCong = tamTinh - giamGia;

  cartSubtotal.textContent = dinhDangTien(tamTinh);
  if (duDu4Module) {
    doiClass(cartDiscountRow, 'hidden', 'flex');
  } else {
    doiClass(cartDiscountRow, 'flex', 'hidden');
  }
  cartTotal.textContent = dinhDangTien(tongCong);
}

allCards.forEach(function (card) {
  const addBtn = card.querySelector('.btn-add-cart');
  const moduleId = card.dataset.moduleId;
  const gia = Number(card.dataset.price);
  const tenModule = card.querySelector('h3').textContent;

  addBtn.addEventListener('click', function (event) {
    event.stopPropagation();

    const itemDaCo = timTrongGio(moduleId);

    if (itemDaCo) {
      xoaKhoiGioAPI(itemDaCo.id, moduleId);
    } else {
      themVaoGioAPI(moduleId, tenModule, gia);
    }
  });
});

taiGioHangTuAPI(); 


// ===================== TOGGLE SIDEBAR GIỎ HÀNG =====================
const cartToggleBtn = document.getElementById('cart-toggle-btn');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartCloseBtn = document.getElementById('cart-close-btn');

function moGioHang() {
  doiClass(cartSidebar, 'translate-x-full', 'translate-x-0');
  doiClass(cartOverlay, 'opacity-0 pointer-events-none', 'opacity-100 pointer-events-auto');
  cartSidebar.setAttribute('aria-hidden', 'false');
  cartToggleBtn.setAttribute('aria-expanded', 'true');
}

function dongGioHang() {
  doiClass(cartSidebar, 'translate-x-0', 'translate-x-full');
  doiClass(cartOverlay, 'opacity-100 pointer-events-auto', 'opacity-0 pointer-events-none');
  cartSidebar.setAttribute('aria-hidden', 'true');
  cartToggleBtn.setAttribute('aria-expanded', 'false');
}

cartToggleBtn.addEventListener('click', function () {
  const dangMo = cartSidebar.classList.contains('translate-x-0');
  if (dangMo) {
    dongGioHang();
  } else {
    moGioHang();
  }
});

cartCloseBtn.addEventListener('click', dongGioHang);
cartOverlay.addEventListener('click', dongGioHang);


// ===================== NÚT THANH TOÁN =====================
const checkoutBtn = document.getElementById('btn-checkout');
const checkoutMessage = document.getElementById('checkout-message');

checkoutBtn.addEventListener('click', async function () {
  if (gioHang.length === 0) {
    checkoutMessage.textContent = 'Giỏ hàng đang trống, hãy chọn ít nhất 1 module.';
    return;
  }

  checkoutBtn.disabled = true;
  checkoutMessage.textContent = 'Đang xử lý đơn hàng...';

  try {
    // Xóa từng item khỏi Mock API — dùng Promise.all để chạy song song, nhanh hơn xóa tuần tự
    const cacYeuCauXoa = gioHang.map(function (item) {
      return fetch(MOCKAPI_URL + '/' + item.id, { method: 'DELETE' });
    });
    await Promise.all(cacYeuCauXoa);

    checkoutMessage.textContent = 'Cảm ơn bạn đã đặt hàng! Chúng tôi sẽ liên hệ sớm.';
    await taiGioHangTuAPI(); // tải lại giỏ hàng — giờ phải rỗng
  } catch (loi) {
    console.log('Lỗi khi thanh toán:', loi);
    checkoutMessage.textContent = 'Có lỗi khi xử lý đơn hàng, vui lòng thử lại.';
  } finally {
    checkoutBtn.disabled = false;
  }
});


// ===================== FORM ĐĂNG KÝ + VALIDATE =====================
const form = document.getElementById('contact-form');
const successMsg = document.getElementById('form-success');

const hoTenInput = document.getElementById('ho-ten');
const emailInput = document.getElementById('email');
const loiNhanInput = document.getElementById('loi-nhan');

const DRAFT_KEY = 'draft-form';

(function khoiPhucNhap() {
  try {
    const daLuu = localStorage.getItem(DRAFT_KEY);
    if (daLuu) {
      const duLieu = JSON.parse(daLuu);
      hoTenInput.value = duLieu.hoTen || '';
      emailInput.value = duLieu.email || '';
      loiNhanInput.value = duLieu.loiNhan || '';
    }
  } catch (e) {
    console.log('Không đọc được dữ liệu nháp:', e);
  }
})();

function luuNhap() {
  const duLieu = {
    hoTen: hoTenInput.value,
    email: emailInput.value,
    loiNhan: loiNhanInput.value
  };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(duLieu));
}

hoTenInput.addEventListener('input', luuNhap);
emailInput.addEventListener('input', luuNhap);
loiNhanInput.addEventListener('input', luuNhap);

function hienThiLoi(inputId, errorId, thongBao) {
  const input = document.getElementById(inputId);
  const errorSpan = document.getElementById(errorId);
  doiClass(input, 'border-gray-300', 'border-red-500');
  errorSpan.textContent = thongBao;
}

function xoaLoi(inputId, errorId) {
  const input = document.getElementById(inputId);
  const errorSpan = document.getElementById(errorId);
  doiClass(input, 'border-red-500', 'border-gray-300');
  errorSpan.textContent = '';
}

function kiemTraHoTen() {
  const giaTri = hoTenInput.value.trim();
  if (giaTri === '') {
    hienThiLoi('ho-ten', 'error-ho-ten', 'Vui lòng nhập họ tên.');
    return false;
  }
  xoaLoi('ho-ten', 'error-ho-ten');
  return true;
}

function kiemTraEmail() {
  const giaTri = emailInput.value.trim();
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (giaTri === '') {
    hienThiLoi('email', 'error-email', 'Vui lòng nhập email.');
    return false;
  }
  if (!regexEmail.test(giaTri)) {
    hienThiLoi('email', 'error-email', 'Email không đúng định dạng.');
    return false;
  }
  xoaLoi('email', 'error-email');
  return true;
}

function kiemTraLoiNhan() {
  const giaTri = loiNhanInput.value.trim();
  if (giaTri === '') {
    hienThiLoi('loi-nhan', 'error-loi-nhan', 'Vui lòng nhập nội dung quan tâm.');
    return false;
  }
  xoaLoi('loi-nhan', 'error-loi-nhan');
  return true;
}

form.addEventListener('submit', function (event) {
  event.preventDefault();

  const hoTenHopLe = kiemTraHoTen();
  const emailHopLe = kiemTraEmail();
  const loiNhanHopLe = kiemTraLoiNhan();

  if (hoTenHopLe && emailHopLe && loiNhanHopLe) {
    successMsg.textContent = 'Đăng ký thành công! Chúng tôi sẽ liên hệ sớm.';
    form.reset();
    localStorage.removeItem(DRAFT_KEY);
  } else {
    successMsg.textContent = '';
  }
});


// ===================== FOOTER=====================
const yearSpan = document.getElementById('current-year');
yearSpan.textContent = new Date().getFullYear();


// ===================== NÚT LÊN ĐẦU TRANG =====================
const backToTopBtn = document.getElementById('back-to-top');

window.addEventListener('scroll', function () {
  if (window.scrollY > 400) {
    doiClass(backToTopBtn, 'hidden opacity-0 translate-y-2.5', 'flex opacity-100 translate-y-0');
  } else {
    doiClass(backToTopBtn, 'flex opacity-100 translate-y-0', 'hidden opacity-0 translate-y-2.5');
  }
});

backToTopBtn.addEventListener('click', function () {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});