/**
 * Main Application Logic & UI Interactions
 */

// Toast Notifications
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
  toast.innerHTML = `
    <span>${message}</span>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
window.showToast = showToast;

// Global Mobile Menu
function initMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-menu-toggle');
  const overlay = document.querySelector('.mobile-nav-overlay');
  const panel = document.querySelector('.mobile-nav-panel');
  const closeBtn = document.querySelector('.mobile-nav-close');

  if (!toggleBtn || !panel) return;

  function openMenu() {
    overlay?.classList.add('open');
    panel.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    overlay?.classList.remove('open');
    panel.classList.remove('open');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', openMenu);
  overlay?.addEventListener('click', closeMenu);
  closeBtn?.addEventListener('click', closeMenu);
}

// Active Nav Link
function highlightActiveNav() {
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const cleanHref = href.replace(/\/$/, '') || '/';
    
    if (currentPath === cleanHref || 
       (cleanHref !== '/' && currentPath.endsWith(cleanHref)) ||
       (cleanHref.includes('menu') && currentPath.includes('menu')) ||
       (cleanHref.includes('about') && currentPath.includes('about')) ||
       (cleanHref.includes('services') && currentPath.includes('services')) ||
       (cleanHref.includes('gallery') && currentPath.includes('gallery')) ||
       (cleanHref.includes('bookings') && currentPath.includes('bookings')) ||
       (cleanHref.includes('contact') && currentPath.includes('contact'))) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Update WhatsApp Floating CTA Link
function updateWhatsAppButtons() {
  const defaultMsg = "Hello Chef Mwikali, I would like to enquire about your culinary and catering services.";
  const waUrl = window.buildWhatsAppLink ? window.buildWhatsAppLink(defaultMsg) : "https://wa.me/254757246896";
  
  const floatingBtn = document.getElementById('floating-whatsapp-btn');
  if (floatingBtn) {
    floatingBtn.href = waUrl;
  }

  document.querySelectorAll('.js-whatsapp-link').forEach(link => {
    link.href = waUrl;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  highlightActiveNav();
  updateWhatsAppButtons();
});
