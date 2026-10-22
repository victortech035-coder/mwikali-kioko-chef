/**
 * Catering Booking & Enquiry Management
 */

const BookingsPage = {
  init() {
    const form = document.getElementById('catering-booking-form');
    if (form) {
      this.setupDateRestrictions();
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  },

  setupDateRestrictions() {
    const dateInput = document.getElementById('event_date');
    if (dateInput && window.Validation) {
      dateInput.min = window.Validation.getTodayDateString();
    }
  },

  async handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    const customer_name = form.customer_name.value.trim();
    const customer_phone = form.customer_phone.value.trim();
    const customer_email = form.customer_email ? form.customer_email.value.trim() : '';
    const event_type = form.event_type.value;
    const event_date = form.event_date.value;
    const location = form.location.value.trim();
    const guest_count = parseInt(form.guest_count.value) || 0;
    const preferred_service = form.preferred_service ? form.preferred_service.value : '';
    const budget_range = form.budget_range ? form.budget_range.value : '';
    const additional_requirements = form.additional_requirements ? form.additional_requirements.value.trim() : '';

    // Validation
    if (!customer_name) {
      window.showToast?.('Please enter your full name.', 'error');
      return;
    }

    if (!window.Validation?.isValidPhone(customer_phone)) {
      window.showToast?.('Please enter a valid phone number (+254...).', 'error');
      return;
    }

    if (!window.Validation?.isFutureOrToday(event_date)) {
      window.showToast?.('Event date cannot be in the past.', 'error');
      return;
    }

    if (guest_count < 2) {
      window.showToast?.('Estimated guest count must be at least 2 guests.', 'error');
      return;
    }

    if (!location) {
      window.showToast?.('Please provide an event location.', 'error');
      return;
    }

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting Catering Enquiry...';
      }

      const payload = {
        customer_name,
        customer_phone: window.Validation.formatKenyaPhone(customer_phone),
        customer_email,
        event_type,
        event_date,
        location,
        guest_count,
        preferred_service,
        budget_range,
        additional_requirements
      };

      const result = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(r => r.json());

      if (!result.success) {
        throw new Error(result.message || 'Failed to submit booking enquiry.');
      }

      form.reset();
      this.setupDateRestrictions();

      // Show Booking Success Confirmation with reference and direct WhatsApp link
      const modal = document.getElementById('booking-success-modal');
      if (modal) {
        document.getElementById('booking-ref-display').textContent = result.booking.id;
        document.getElementById('booking-date-display').textContent = result.booking.event_date;
        document.getElementById('booking-guests-display').textContent = `${result.booking.guest_count} guests`;
        
        const waLink = document.getElementById('booking-whatsapp-link');
        if (waLink && result.whatsapp_url) {
          waLink.href = result.whatsapp_url;
        }

        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }

      window.showToast?.('Catering enquiry submitted successfully!', 'success');

    } catch (err) {
      window.showToast?.(err.message, 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Catering Enquiry';
      }
    }
  }
};

window.BookingsPage = BookingsPage;
document.addEventListener('DOMContentLoaded', () => BookingsPage.init());
