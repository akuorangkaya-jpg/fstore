// Configuration
const CORRECT_PIN = "072201";

// Global variables
let introScreen = null;
let roleSelectionScreen = null;
let pinModal = null;

// Initialize authentication
function initAuth() {
  const role = sessionStorage.getItem('fstore-role');
  const currentPath = window.location.pathname;
  const isHomePage = currentPath.includes('home.html') || currentPath.endsWith('/') || (currentPath.endsWith('index.html') && !role);
  
  if (!role) {
    if (isHomePage && !currentPath.includes('transaksi.html') && !currentPath.includes('panduan.html')) {
      showIntroAndRoleSelection();
    } else {
      showPinModal('restricted');
    }
  } else {
    checkPageAccess(role);
  }

  addNavbarLinkListeners();
}

// Show intro and role selection
function showIntroAndRoleSelection() {
  introScreen = document.createElement('div');
  introScreen.id = 'intro-screen';
  introScreen.innerHTML = `
    <div class="intro-container">
      <img src="logo-fstore.png" alt="Logo Fstore" class="intro-logo">
      <div class="intro-spinner"></div>
    </div>
  `;
  document.body.appendChild(introScreen);

  setTimeout(() => {
    showRoleSelection();
  }, 2500); // Dipercepat sedikit agar UX terasa lebih responsif
}

// Show role selection
function showRoleSelection() {
  if (introScreen) {
    introScreen.style.opacity = '0';
    introScreen.style.pointerEvents = 'none';
    setTimeout(() => introScreen.remove(), 400);
  }

  roleSelectionScreen = document.createElement('div');
  roleSelectionScreen.id = 'role-selection-screen';
  roleSelectionScreen.innerHTML = `
    <div class="role-selection-container">
      <div class="role-selection-header">
        <h2 class="role-selection-title">Sistem Rekap Finansial</h2>
        <p class="role-selection-subtitle">Silakan tentukan jenis hak akses Anda untuk memantau data kas Fstore</p>
      </div>
      <div class="role-cards">
        <div class="role-card stakeholder-card">
          <div class="role-icon">
            <img src="icons/stakeholder.svg" alt="Stakeholder" class="role-icon-image">
          </div>
          <h3 class="role-card-title">Stakeholder</h3>
          <p class="role-card-description">Akses penuh peninjauan metrik utama bulanan, grafik arus kas, dan pengarsipan kuitansi digital.</p>
          <button class="role-btn stakeholder-btn">Masuk Otoritas PIN</button>
        </div>
        <div class="role-card viewer-card">
          <div class="role-icon">
            <img src="icons/eye.svg" alt="Viewer" class="role-icon-image">
          </div>
          <h3 class="role-card-title">General Viewer</h3>
          <p class="role-card-description">Akses terbatas hanya untuk membaca ringkasan profil visi & misi transparansi finansial.</p>
          <button class="role-btn viewer-btn">Masuk Ruang Publik</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(roleSelectionScreen);

  document.querySelector('.stakeholder-btn').addEventListener('click', () => showPinModal('role-select'));
  document.querySelector('.viewer-btn').addEventListener('click', () => {
    sessionStorage.setItem('fstore-role', 'viewer');
    sessionStorage.setItem('pendingToast', 'Terautentikasi sebagai Viewer Publik');
    sessionStorage.setItem("pendingViewerNotice", "true");
    roleSelectionScreen.style.opacity = '0';
    roleSelectionScreen.style.pointerEvents = 'none';
    setTimeout(() => {
      roleSelectionScreen.remove();
      if (introScreen) introScreen.remove();
      window.location.href = 'home.html';
    }, 300);
  });
}

// Show PIN modal
function showPinModal(type) {
  // Prevent duplicate modals
  if (document.getElementById('pin-modal')) return;

  pinModal = document.createElement('div');
  pinModal.id = 'pin-modal';
  document.body.classList.add('modal-open');
  
  let title = "Otorisasi Hak Akses";
  let description = "Silakan masukkan 6 digit PIN koordinasi internal untuk memverifikasi akun Stakeholder.";
  
  if (type === 'restricted') {
    title = "Proteksi Akses Terbatas";
    description = "Halaman ini memerlukan validasi akuntabilitas internal. Silakan masukkan PIN pengurus Anda untuk melanjutkan.";
  }

  pinModal.innerHTML = `
    <div class="pin-modal-overlay">
      <div class="pin-modal-content">
        <button class="pin-modal-close" aria-label="Tutup">&times;</button>
        <h3 class="pin-modal-title">${title}</h3>
        <p class="pin-modal-description">${description}</p>
        <div class="pin-input-container">
          <input type="password" id="pin-input" maxlength="6" inputmode="numeric" autocomplete="one-time-code" placeholder="• • • • • •">
          <p id="pin-error" class="pin-error" style="display: none;"></p>
        </div>
        <div class="pin-modal-buttons">
          <button class="pin-modal-btn pin-cancel-btn">Kembali</button>
          <button class="pin-modal-btn pin-submit-btn" id="pin-submit-btn">Verifikasi PIN</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(pinModal);

  const pinInput = document.getElementById('pin-input');
  const pinError = document.getElementById('pin-error');
  const closeBtn = pinModal.querySelector('.pin-modal-close');
  const cancelBtn = pinModal.querySelector('.pin-cancel-btn');
  const submitBtn = document.getElementById('pin-submit-btn');

  setTimeout(() => pinInput.focus(), 100);

  pinInput.addEventListener('input', (e) => {
    pinInput.value = pinInput.value.replace(/\D/g, '');
    pinError.style.display = 'none';
  });

  submitBtn.addEventListener('click', verifyPin);
  pinInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') verifyPin();
  });

  const handleCancel = () => {
    document.body.classList.remove('modal-open');
    pinModal.remove();
    if (type === 'restricted') window.location.href = 'home.html';
  };
  closeBtn.addEventListener('click', handleCancel);
  cancelBtn.addEventListener('click', handleCancel);

  function verifyPin() {
    if (pinInput.value === CORRECT_PIN) {
      sessionStorage.setItem('fstore-role', 'stakeholder');
      sessionStorage.setItem('pendingToast', 'Otorisasi Berhasil. Selamat Datang Stakeholder');
      document.body.classList.remove('modal-open');
      pinModal.remove();
      if (roleSelectionScreen) {
        roleSelectionScreen.style.opacity = '0';
        roleSelectionScreen.style.pointerEvents = 'none';
        setTimeout(() => {
          roleSelectionScreen.remove();
          if (introScreen) introScreen.remove();
          if (type === 'role-select') window.location.href = 'home.html';
        }, 300);
      } else if (type === 'role-select' && !roleSelectionScreen) {
        if (introScreen) introScreen.remove();
        window.location.href = 'home.html';
      }
    } else {
      pinError.textContent = 'Kode kredensial PIN salah. Periksa kembali atau hubungi Administrator Keuangan.';
      pinError.style.display = 'block';
      pinInput.value = '';
      pinInput.focus();
    }
  }
}

// Check page access based on role
function checkPageAccess(role) {
  const currentPath = window.location.pathname;
  const isRestrictedPage = 
    currentPath.includes('index.html') || 
    currentPath.includes('transaksi.html') || 
    currentPath.includes('panduan.html');

  if (role === 'viewer' && isRestrictedPage) {
    showPinModal('restricted');
  }
}

// Add event listeners to navbar links
function addNavbarLinkListeners() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href) return;

    const isRestrictedLink = 
      href.includes('index.html') || 
      href.includes('transaksi.html') || 
      href.includes('panduan.html');

    const role = sessionStorage.getItem('fstore-role');
    if (isRestrictedLink && role === 'viewer') {
      e.preventDefault();
      showPinModal('restricted');
    }
  });
}

// Show login toast notification
function showLoginToast(message) {
  const existingToast = document.querySelector('.toast-notification');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);

  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Logout / Change Role
function logout() {
  sessionStorage.removeItem('fstore-role');
  window.location.href = 'home.html';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // TARGET ADJUSTMENT: Disesuaikan dengan struktur .main-header .nav-container baru
  const navbar = document.querySelector('.main-header .nav-container');
  if (navbar) {
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'logout-btn';
    logoutBtn.textContent = 'Ganti Akses';
    logoutBtn.addEventListener('click', logout);
    navbar.appendChild(logoutBtn);
  }

  const pendingToast = sessionStorage.getItem('pendingToast');
  if (pendingToast) {
    sessionStorage.removeItem('pendingToast');
    showLoginToast(pendingToast);
  }

  initAuth();
});

/* =========================================================
   VIEWER WARNING NOTIFICATION
========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const role = sessionStorage.getItem("fstore-role");
  const pendingViewerNotice = sessionStorage.getItem("pendingViewerNotice");

  const isHomePage =
    window.location.pathname.includes("home.html") ||
    window.location.pathname.endsWith("/");

  if (role === "viewer" && pendingViewerNotice === "true" && isHomePage) {
    sessionStorage.removeItem("pendingViewerNotice");
    setTimeout(function () {
      showViewerWarningNotice();
    }, 4300);
  }
});

function showViewerWarningNotice() {
  const existingNotice = document.querySelector(".viewer-warning-toast");
  if (existingNotice) existingNotice.remove();

  const notice = document.createElement("div");
  notice.className = "viewer-warning-toast";
  notice.innerHTML = `
    <button class="viewer-warning-close" aria-label="Tutup notifikasi">&times;</button>
    <div class="viewer-warning-icon">
      <img src="icons/warning.svg" alt="Warning" class="viewer-warning-icon-image">
    </div>
    <div class="viewer-warning-content">
      <h4>Restriksi Hak Akses Viewer</h4>
      <p>Akses peninjauan Anda saat ini dibatasi hanya pada halaman pandangan umum (Home). Silakan otorisasi PIN jika memerlukan transparansi data penuh buku kas.</p>
    </div>
  `;

  document.body.appendChild(notice);

  const closeButton = notice.querySelector(".viewer-warning-close");
  closeButton.addEventListener("click", function () {
    notice.classList.add("hide");
    setTimeout(function () { notice.remove(); }, 300);
  });

  setTimeout(function () {
    if (document.body.contains(notice)) {
      notice.classList.add("hide");
      setTimeout(function () { notice.remove(); }, 300);
    }
  }, 7000);
}

/* =========================================================
   AESTHETIC CLICK SOUND (Web Audio API)
========================================================= */
(function () {
  let audioContext = null;
  let isSoundReady = false;

  function initAudioContext() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
    isSoundReady = true;
  }

  function playClickSound() {
    if (!isSoundReady || !audioContext) return;

    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(820, now);
    oscillator.frequency.exponentialRampToValueAtTime(460, now + 0.055);

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.075, now + 0.006);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.08);
  }

  document.addEventListener("click", function (e) {
    const clickableElement = e.target.closest(
      "nav a, .main-header a, button, .role-card, .btn-proof-link, .pin-modal-close"
    );

    if (!clickableElement) return;

    initAudioContext();
    playClickSound();

    const isNavbarLink = clickableElement.matches(".main-header a, nav a");
    const href = clickableElement.getAttribute("href");

    if (
      isNavbarLink &&
      href &&
      !href.startsWith("#") &&
      !clickableElement.target &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.shiftKey
    ) {
      e.preventDefault();
      setTimeout(function () {
        window.location.href = href;
      }, 90);
    }
  });
})();