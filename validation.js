/**
 * Validation utilities for forms, phone numbers, and dates
 */

const Validation = {
  /**
   * Validate phone number (Kenya format: +254... or 07... / 01...)
   */
  isValidPhone(phone) {
    if (!phone) return false;
    const cleaned = phone.replace(/[\s\-()]/g, '');
    const keRegex = /^(?:\+254|254|0)?([17]\d{8})$/;
    return keRegex.test(cleaned) || cleaned.length >= 9;
  },

  /**
   * Format phone number to international E.164 format (+254...)
   */
  formatKenyaPhone(phone) {
    if (!phone) return '';
    let cleaned = phone.replace(/[\s\-()]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '+254' + cleaned.substring(1);
    } else if (cleaned.startsWith('254')) {
      cleaned = '+' + cleaned;
    } else if (!cleaned.startsWith('+')) {
      cleaned = '+254' + cleaned;
    }
    return cleaned;
  },

  /**
   * Validate Email address
   */
  isValidEmail(email) {
    if (!email) return true; // Optional field
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
  },

  /**
   * Validate that event date is today or in the future
   */
  isFutureOrToday(dateStr) {
    if (!dateStr) return false;
    const selected = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return !isNaN(selected.getTime()) && selected >= today;
  },

  /**
   * Get today's date formatted as YYYY-MM-DD for min date attributes
   */
  getTodayDateString() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  },

  /**
   * Sanitize text against XSS injection
   */
  sanitizeText(str) {
    if (!str) return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  }
};

window.Validation = Validation;
