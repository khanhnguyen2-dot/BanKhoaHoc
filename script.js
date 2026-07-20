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

//form
const form = document.getElementById('contact-form');
const successMsg = document.getElementById('form-success');

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
  const giaTri = document.getElementById('ho-ten').value.trim();
  if (giaTri === '') {
    hienThiLoi('ho-ten', 'error-ho-ten', 'Vui lòng nhập họ tên.');
    return false;
  }
  xoaLoi('ho-ten', 'error-ho-ten');
  return true;
}

function kiemTraEmail() {
  const giaTri = document.getElementById('email').value.trim();
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
  const giaTri = document.getElementById('loi-nhan').value.trim();
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
  } else {
    successMsg.textContent = '';
  }
});

//footer
const yearSpan = document.getElementById('current-year');
yearSpan.textContent = new Date().getFullYear();