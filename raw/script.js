//HEADER: TOGGLE MENU HAMBURGER
const hamburgerBtn = document.getElementById('hamburger-btn');
const mainNav = document.getElementById('main-nav');

hamburgerBtn.addEventListener('click', function () {
  const dangMo = mainNav.classList.toggle('active');
  hamburgerBtn.setAttribute('aria-expanded', dangMo);
});

const navLinks = document.querySelectorAll('.nav-menu a');

navLinks.forEach(function (link) {
  link.addEventListener('click', function () {
    mainNav.classList.remove('active');
    hamburgerBtn.setAttribute('aria-expanded', false);
  });
});


// FLIP CARD 
const allCards = document.querySelectorAll('.card');

allCards.forEach(function (card) {
  const flipButtons = card.querySelectorAll('.btn-flip');
  flipButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      card.classList.toggle('flipped');
    });
  });
});


// GIỎ HÀNG
const gioHang = []; // mảng lưu các module_id đã thêm, ví dụ ['1', '3']
const DISCOUNT_COMBO = 1000000; // giảm 1 triệu nếu mua đủ 4 module

const cartList = document.getElementById('cart-list');
const cartEmpty = document.getElementById('cart-empty');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartDiscountRow = document.getElementById('cart-discount-row');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.getElementById('cart-count');

function dinhDangTien(soTien) {
  return soTien.toLocaleString('vi-VN') + 'đ';
}

function capNhatNutTrenCard(moduleId, daThem) {
  const card = document.querySelector('.card[data-module-id="' + moduleId + '"]');
  if (!card) return;
  const addBtn = card.querySelector('.btn-add-cart');
  const gia = Number(card.dataset.price);

  if (daThem) {
    addBtn.classList.add('in-cart');
    addBtn.textContent = 'Đã thêm vào giỏ ';
  } else {
    addBtn.classList.remove('in-cart');
    addBtn.textContent = 'Thêm vào giỏ'
  }
}

function goKhoiGio(moduleId) {
  const viTri = gioHang.indexOf(moduleId);
  if (viTri !== -1) {
    gioHang.splice(viTri, 1);
    capNhatNutTrenCard(moduleId, false);
    capNhatGioHang();
  }
}

function capNhatGioHang() {
  cartList.innerHTML = '';
  cartCount.textContent = gioHang.length;

  if (gioHang.length === 0) {
    cartList.appendChild(cartEmpty);
    cartSubtotal.textContent = dinhDangTien(0);
    cartDiscountRow.style.display = 'none';
    cartTotal.textContent = dinhDangTien(0);
    return;
  }

const checkoutBtn = document.getElementById('btn-checkout');
const checkoutMessage = document.getElementById('checkout-message');

checkoutBtn.addEventListener('click', function () {
  if (gioHang.length === 0) {
    checkoutMessage.textContent = 'Giỏ hàng đang trống, hãy chọn ít nhất 1 module.';
    return;
  }

  checkoutMessage.textContent = 'Cảm ơn bạn đã đặt hàng! Chúng tôi sẽ liên hệ sớm.';

  // xóa giỏ hàng sau khi "thanh toán"
  gioHang.forEach(function (moduleId) {
    capNhatNutTrenCard(moduleId, false);
  });
  gioHang.length = 0;
  capNhatGioHang();
});

  let tamTinh = 0;

  gioHang.forEach(function (moduleId) {
    const card = document.querySelector('.card[data-module-id="' + moduleId + '"]');
    const gia = Number(card.dataset.price);
    const tenModule = card.querySelector('h3').textContent;
    tamTinh += gia;

    const li = document.createElement('li');
    li.className = 'cart-item';

    const infoDiv = document.createElement('div');
    infoDiv.className = 'cart-item-info';
    infoDiv.innerHTML = '<strong>' + tenModule + '</strong><span>' + dinhDangTien(gia) + '</span>';

    const removeBtn = document.createElement('button');
    removeBtn.className = 'cart-item-remove';
    removeBtn.setAttribute('aria-label', 'Xóa khỏi giỏ hàng');
    removeBtn.textContent = '✕';
    removeBtn.addEventListener('click', function () {
      goKhoiGio(moduleId);
    });

    li.appendChild(infoDiv);
    li.appendChild(removeBtn);
    cartList.appendChild(li);
  });

  const duDu4Module = gioHang.length === 4;
  const giamGia = duDu4Module ? DISCOUNT_COMBO : 0;
  const tongCong = tamTinh - giamGia;

  cartSubtotal.textContent = dinhDangTien(tamTinh);
  cartDiscountRow.style.display = duDu4Module ? 'flex' : 'none';
  cartTotal.textContent = dinhDangTien(tongCong);
}

allCards.forEach(function (card) {
  const addBtn = card.querySelector('.btn-add-cart');
  const moduleId = card.dataset.moduleId;

  addBtn.addEventListener('click', function (event) {
    event.stopPropagation();

    const daCoTrongGio = gioHang.includes(moduleId);

    if (daCoTrongGio) {
      goKhoiGio(moduleId);
    } else {
      gioHang.push(moduleId);
      capNhatNutTrenCard(moduleId, true);
      capNhatGioHang();
      moGioHang(); // tự động mở giỏ hàng ra để người dùng thấy ngay
    }
  });
});

capNhatGioHang(); // gọi 1 lần lúc tải trang để hiện đúng trạng thái ban đầu


// ===================== TOGGLE SIDEBAR GIỎ HÀNG =====================
const cartToggleBtn = document.getElementById('cart-toggle-btn');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartCloseBtn = document.getElementById('cart-close-btn');

function moGioHang() {
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('open');
  cartSidebar.setAttribute('aria-hidden', 'false');
  cartToggleBtn.setAttribute('aria-expanded', 'true');
}

function dongGioHang() {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('open');
  cartSidebar.setAttribute('aria-hidden', 'true');
  cartToggleBtn.setAttribute('aria-expanded', 'false');
}

cartToggleBtn.addEventListener('click', function () {
  const dangMo = cartSidebar.classList.contains('open');
  if (dangMo) {
    dongGioHang();
  } else {
    moGioHang();
  }
});

cartCloseBtn.addEventListener('click', dongGioHang);
cartOverlay.addEventListener('click', dongGioHang);


// ===================== FORM ĐĂNG KÝ + VALIDATE =====================
const form = document.getElementById('contact-form');
const successMsg = document.getElementById('form-success');

const hoTenInput = document.getElementById('ho-ten');
const emailInput = document.getElementById('email');
const loiNhanInput = document.getElementById('loi-nhan');

const DRAFT_KEY = 'draft-form';

// Đọc lại dữ liệu nháp đã lưu (nếu có) ngay khi tải trang
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

// Tự động lưu nháp mỗi khi người dùng gõ
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
  input.classList.add('invalid');
  errorSpan.textContent = thongBao;
}

function xoaLoi(inputId, errorId) {
  const input = document.getElementById(inputId);
  const errorSpan = document.getElementById(errorId);
  input.classList.remove('invalid');
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


// ===================== FOOTER: NĂM TỰ ĐỘNG =====================
const yearSpan = document.getElementById('current-year');
yearSpan.textContent = new Date().getFullYear();


// NÚT LÊN ĐẦU TRANG
const backToTopBtn = document.getElementById('back-to-top');

window.addEventListener('scroll', function () {
  if (window.scrollY > 400) {
    backToTopBtn.classList.add('show');
  } else {
    backToTopBtn.classList.remove('show');
  }
});

backToTopBtn.addEventListener('click', function () {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});