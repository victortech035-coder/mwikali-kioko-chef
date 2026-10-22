/**
 * Supabase Client & Backend API Integration
 * Bridges Supabase database calls and server API endpoints
 */

const SupabaseBridge = {
  client: null,

  init() {
    if (window.supabase && window.CONFIG.supabaseUrl && !window.CONFIG.supabaseUrl.includes('placeholder')) {
      try {
        this.client = window.supabase.createClient(
          window.CONFIG.supabaseUrl,
          window.CONFIG.supabaseAnonKey
        );
        console.log('Supabase client initialized successfully.');
      } catch (e) {
        console.warn('Supabase client initialization skipped, using local API.', e);
      }
    }
  },

  async getMenuItems(category = null, search = null) {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);

    const res = await fetch(`/api/menu?${params.toString()}`);
    const data = await res.json();
    return data.items || [];
  },

  async submitOrder(orderPayload) {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });
    return await res.json();
  },

  async submitBooking(bookingPayload) {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload)
    });
    return await res.json();
  },

  async getGallery() {
    const res = await fetch('/api/gallery');
    const data = await res.json();
    return data.gallery || [];
  },

  async getServices() {
    const res = await fetch('/api/services');
    const data = await res.json();
    return data.services || [];
  }
};

window.SupabaseBridge = SupabaseBridge;
document.addEventListener('DOMContentLoaded', () => SupabaseBridge.init());
