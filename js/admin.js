/**
 * Admin Dashboard & Management System
 */

const Admin = {
  orders: [],
  bookings: [],
  menu: [],
  gallery: [],

  async initDashboard() {
    window.Auth.requireAuth();
    this.renderAdminUser();
    await this.loadAllData();
    this.renderStats();
    this.renderRecentOrders();
    this.renderRecentBookings();
  },

  renderAdminUser() {
    const user = window.Auth.getUser();
    const userEl = document.getElementById('admin-user-display');
    if (userEl && user) {
      userEl.textContent = `${user.name} (${user.email})`;
    }
  },

  async loadAllData() {
    try {
      const [ordRes, bookRes, menuRes, galRes] = await Promise.all([
        fetch('/api/orders').then(r => r.json()),
        fetch('/api/bookings').then(r => r.json()),
        fetch('/api/menu').then(r => r.json()),
        fetch('/api/gallery').then(r => r.json())
      ]);

      this.orders = ordRes.orders || [];
      this.bookings = bookRes.bookings || [];
      this.menu = menuRes.items || [];
      this.gallery = galRes.gallery || [];
    } catch (err) {
      console.error('Error fetching admin data', err);
      window.showToast?.('Error loading dashboard data.', 'error');
    }
  },

  renderStats() {
    const totalRevenue = this.orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (o.total_amount || 0), 0);

    const pendingOrders = this.orders.filter(o => o.status === 'Pending').length;
    const newBookings = this.bookings.filter(b => b.status === 'New').length;
    const menuCount = this.menu.length;

    const revEl = document.getElementById('stat-revenue');
    const ordEl = document.getElementById('stat-orders-pending');
    const bookEl = document.getElementById('stat-bookings-new');
    const menuEl = document.getElementById('stat-menu-count');

    if (revEl) revEl.textContent = `KSh ${totalRevenue.toLocaleString()}`;
    if (ordEl) ordEl.textContent = `${pendingOrders} Pending`;
    if (bookEl) bookEl.textContent = `${newBookings} Enquiries`;
    if (menuEl) menuEl.textContent = `${menuCount} Dishes`;
  },

  renderRecentOrders() {
    const container = document.getElementById('recent-orders-table-body');
    if (!container) return;

    if (this.orders.length === 0) {
      container.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem;">No orders found yet.</td></tr>`;
      return;
    }

    container.innerHTML = this.orders.slice(0, 6).map(order => `
      <tr>
        <td class="font-semibold">${order.id}</td>
        <td>
          <div style="font-weight:600;">${order.customer_name}</div>
          <div style="font-size:0.8rem; color:var(--color-muted);">${order.customer_phone}</div>
        </td>
        <td class="tabular-nums font-semibold">KSh ${(order.total_amount || 0).toLocaleString()}</td>
        <td>${order.delivery_type === 'delivery' ? 'Delivery' : 'Kitchen Pickup'}</td>
        <td>
          <select class="status-select status-${(order.status || 'Pending').replace(/\s+/g, '')}" onchange="Admin.updateOrderStatus('${order.id}', this.value)">
            ${['Pending', 'Accepted', 'Preparing', 'Ready for collection', 'Out for delivery', 'Completed', 'Cancelled'].map(st => `
              <option value="${st}" ${order.status === st ? 'selected' : ''}>${st}</option>
            `).join('')}
          </select>
        </td>
        <td>
          <a href="https://wa.me/${(order.customer_phone || '').replace(/[^0-9]/g, '')}" target="_blank" class="btn btn-outline btn-sm" style="padding: 0.25rem 0.5rem; font-size: 0.78rem;">WhatsApp</a>
        </td>
      </tr>
    `).join('');
  },

  renderRecentBookings() {
    const container = document.getElementById('recent-bookings-table-body');
    if (!container) return;

    if (this.bookings.length === 0) {
      container.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem;">No catering enquiries received yet.</td></tr>`;
      return;
    }

    container.innerHTML = this.bookings.slice(0, 6).map(b => `
      <tr>
        <td class="font-semibold">${b.id}</td>
        <td>
          <div style="font-weight:600;">${b.customer_name}</div>
          <div style="font-size:0.8rem; color:var(--color-muted);">${b.customer_phone}</div>
        </td>
        <td>${b.event_type}</td>
        <td>${b.event_date} (${b.guest_count} guests)</td>
        <td>
          <select class="status-select status-${(b.status || 'New').replace(/\s+/g, '')}" onchange="Admin.updateBookingStatus('${b.id}', this.value)">
            ${['New', 'Contacted', 'Quote Sent', 'Confirmed', 'Completed', 'Declined'].map(st => `
              <option value="${st}" ${b.status === st ? 'selected' : ''}>${st}</option>
            `).join('')}
          </select>
        </td>
        <td>
          <a href="https://wa.me/${(b.customer_phone || '').replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(b.customer_name)}%2C%20Chef%20Mwikali%20here%20regarding%20your%20catering%20enquiry%20for%20${encodeURIComponent(b.event_date)}." target="_blank" class="btn btn-gold btn-sm" style="padding: 0.25rem 0.5rem; font-size: 0.78rem;">Contact</a>
        </td>
      </tr>
    `).join('');
  },

  async updateOrderStatus(orderId, newStatus) {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      }).then(r => r.json());

      if (res.success) {
        window.showToast?.(`Order ${orderId} status set to ${newStatus}.`, 'success');
        await this.loadAllData();
        this.renderStats();
        if (document.getElementById('orders-table-body')) {
          this.renderFullOrdersTable();
        } else {
          this.renderRecentOrders();
        }
      }
    } catch (err) {
      window.showToast?.('Failed to update status.', 'error');
    }
  },

  async updateBookingStatus(bookingId, newStatus) {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      }).then(r => r.json());

      if (res.success) {
        window.showToast?.(`Booking ${bookingId} status set to ${newStatus}.`, 'success');
        await this.loadAllData();
        this.renderStats();
        if (document.getElementById('bookings-table-body')) {
          this.renderFullBookingsTable();
        } else {
          this.renderRecentBookings();
        }
      }
    } catch (err) {
      window.showToast?.('Failed to update booking status.', 'error');
    }
  },

  // Full Orders Table Management
  async initOrdersPage() {
    window.Auth.requireAuth();
    this.renderAdminUser();
    await this.loadAllData();
    this.renderFullOrdersTable();

    const filterSelect = document.getElementById('order-filter-status');
    if (filterSelect) {
      filterSelect.addEventListener('change', () => this.renderFullOrdersTable(filterSelect.value));
    }
  },

  renderFullOrdersTable(filterStatus = 'All') {
    const container = document.getElementById('orders-table-body');
    if (!container) return;

    let list = this.orders;
    if (filterStatus !== 'All') {
      list = list.filter(o => o.status === filterStatus);
    }

    if (list.length === 0) {
      container.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2.5rem; color: var(--color-muted);">No orders matching status filter.</td></tr>`;
      return;
    }

    container.innerHTML = list.map(o => `
      <tr>
        <td class="font-semibold">${o.id}</td>
        <td>
          <div style="font-weight:600;">${o.customer_name}</div>
          <div style="font-size:0.8rem; color:var(--color-muted);">${o.customer_phone}</div>
          ${o.customer_email ? `<div style="font-size:0.75rem; color:var(--color-muted);">${o.customer_email}</div>` : ''}
        </td>
        <td>
          <div style="font-size: 0.85rem; max-width: 250px;">
            ${(o.items || []).map(i => `<div>${i.quantity}x ${i.name}</div>`).join('')}
          </div>
        </td>
        <td class="tabular-nums font-semibold">KSh ${(o.total_amount || 0).toLocaleString()}</td>
        <td>
          <div>${o.delivery_type === 'delivery' ? 'Delivery' : 'Kitchen Pickup'}</div>
          <div style="font-size:0.75rem; color:var(--color-muted);">${o.preferred_date} (${o.preferred_time})</div>
        </td>
        <td>
          <select class="status-select status-${(o.status || 'Pending').replace(/\s+/g, '')}" onchange="Admin.updateOrderStatus('${o.id}', this.value)">
            ${['Pending', 'Accepted', 'Preparing', 'Ready for collection', 'Out for delivery', 'Completed', 'Cancelled'].map(st => `
              <option value="${st}" ${o.status === st ? 'selected' : ''}>${st}</option>
            `).join('')}
          </select>
        </td>
        <td>
          <div style="display:flex; gap:0.4rem;">
            <a href="https://wa.me/${(o.customer_phone || '').replace(/[^0-9]/g, '')}" target="_blank" class="btn btn-outline btn-sm" style="padding: 0.3rem 0.5rem; font-size: 0.78rem;">WhatsApp</a>
            <button onclick="Admin.viewOrderDetails('${o.id}')" class="btn btn-primary btn-sm" style="padding: 0.3rem 0.5rem; font-size: 0.78rem;">Details</button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  viewOrderDetails(orderId) {
    const o = this.orders.find(item => item.id === orderId);
    if (!o) return;

    alert(`Order Reference: ${o.id}\nCustomer: ${o.customer_name} (${o.customer_phone})\nDate: ${o.preferred_date} (${o.preferred_time})\nType: ${o.delivery_type} - ${o.delivery_address}\n\nDishes:\n${o.items.map(i => `• ${i.quantity}x ${i.name} = KSh ${i.subtotal}`).join('\n')}\n\nSubtotal: KSh ${o.subtotal}\nDelivery: KSh ${o.delivery_fee}\nTotal: KSh ${o.total_amount}\nSpecial Notes: ${o.notes || 'None'}`);
  },

  // Full Bookings Table Management
  async initBookingsPage() {
    window.Auth.requireAuth();
    this.renderAdminUser();
    await this.loadAllData();
    this.renderFullBookingsTable();

    const filterSelect = document.getElementById('booking-filter-status');
    if (filterSelect) {
      filterSelect.addEventListener('change', () => this.renderFullBookingsTable(filterSelect.value));
    }
  },

  renderFullBookingsTable(filterStatus = 'All') {
    const container = document.getElementById('bookings-table-body');
    if (!container) return;

    let list = this.bookings;
    if (filterStatus !== 'All') {
      list = list.filter(b => b.status === filterStatus);
    }

    if (list.length === 0) {
      container.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2.5rem; color: var(--color-muted);">No catering enquiries matching status filter.</td></tr>`;
      return;
    }

    container.innerHTML = list.map(b => `
      <tr>
        <td class="font-semibold">${b.id}</td>
        <td>
          <div style="font-weight:600;">${b.customer_name}</div>
          <div style="font-size:0.8rem; color:var(--color-muted);">${b.customer_phone}</div>
          ${b.customer_email ? `<div style="font-size:0.75rem; color:var(--color-muted);">${b.customer_email}</div>` : ''}
        </td>
        <td>
          <div style="font-weight:500;">${b.event_type}</div>
          <div style="font-size:0.8rem; color:var(--color-muted);">${b.location}</div>
        </td>
        <td>
          <div>${b.event_date}</div>
          <div style="font-size:0.8rem; color:var(--color-gold); font-weight:600;">${b.guest_count} Guests</div>
        </td>
        <td>
          <div style="font-size:0.85rem;">${b.preferred_service}</div>
          <div style="font-size:0.75rem; color:var(--color-muted);">Budget: ${b.budget_range}</div>
        </td>
        <td>
          <select class="status-select status-${(b.status || 'New').replace(/\s+/g, '')}" onchange="Admin.updateBookingStatus('${b.id}', this.value)">
            ${['New', 'Contacted', 'Quote Sent', 'Confirmed', 'Completed', 'Declined'].map(st => `
              <option value="${st}" ${b.status === st ? 'selected' : ''}>${st}</option>
            `).join('')}
          </select>
        </td>
        <td>
          <div style="display:flex; gap:0.4rem;">
            <a href="https://wa.me/${(b.customer_phone || '').replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(b.customer_name)}%2C%20Chef%20Mwikali%20here%20regarding%20your%20catering%20enquiry%20for%20${encodeURIComponent(b.event_date)}." target="_blank" class="btn btn-gold btn-sm" style="padding: 0.3rem 0.5rem; font-size: 0.78rem;">WhatsApp</a>
            <button onclick="Admin.viewBookingDetails('${b.id}')" class="btn btn-outline btn-sm" style="padding: 0.3rem 0.5rem; font-size: 0.78rem;">Notes</button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  viewBookingDetails(bookingId) {
    const b = this.bookings.find(item => item.id === bookingId);
    if (!b) return;

    alert(`Booking Reference: ${b.id}\nClient: ${b.customer_name} (${b.customer_phone})\nEvent: ${b.event_type} on ${b.event_date}\nLocation: ${b.location}\nGuest Count: ${b.guest_count}\nService: ${b.preferred_service}\nBudget Range: ${b.budget_range}\n\nClient Requirements:\n${b.additional_requirements || 'None provided'}`);
  },

  // Menu Management
  async initMenuPage() {
    window.Auth.requireAuth();
    this.renderAdminUser();
    await this.loadAllData();
    this.renderAdminMenuTable();

    const addForm = document.getElementById('add-dish-form');
    if (addForm) {
      addForm.addEventListener('submit', (e) => this.handleAddDish(e));
    }
  },

  renderAdminMenuTable() {
    const container = document.getElementById('admin-menu-table-body');
    if (!container) return;

    if (this.menu.length === 0) {
      container.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem;">No menu items found.</td></tr>`;
      return;
    }

    container.innerHTML = this.menu.map(item => `
      <tr>
        <td>
          <img src="${item.image_url}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
        </td>
        <td>
          <div style="font-weight:600; font-size:0.95rem;">${item.name}</div>
          <div style="font-size:0.8rem; color:var(--color-muted);">${item.description.substring(0, 70)}...</div>
        </td>
        <td>${item.category}</td>
        <td class="tabular-nums font-semibold">KSh ${item.price.toLocaleString()}</td>
        <td>
          <button 
            class="btn btn-sm ${item.is_available ? 'btn-outline' : 'btn-primary'}" 
            style="padding: 0.25rem 0.6rem; font-size: 0.78rem;"
            onclick="Admin.toggleItemAvailability('${item.id}', ${!item.is_available})"
          >
            ${item.is_available ? 'Available' : 'Sold Out'}
          </button>
        </td>
        <td>
          <button class="btn btn-sm btn-outline" style="color:var(--color-error); border-color:var(--color-error); padding:0.25rem 0.6rem;" onclick="Admin.deleteDish('${item.id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  },

  async handleAddDish(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.dish_name.value.trim();
    const category = form.dish_category.value;
    const price = parseInt(form.dish_price.value) || 0;
    const description = form.dish_description.value.trim();
    const dietary = form.dish_dietary.value.split(',').map(s => s.trim()).filter(Boolean);
    const fileInput = document.getElementById('dish_file');
    let image_url = form.dish_image.value.trim() || '/assets/images/kenyan_beef_pilau.jpg';

    if (!name || price <= 0) {
      window.showToast?.('Please specify a valid dish name and price.', 'error');
      return;
    }

    try {
      if (fileInput && fileInput.files && fileInput.files[0]) {
        const formData = new FormData();
        formData.append('image', fileInput.files[0]);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        }).then(r => r.json());

        if (uploadRes.success && uploadRes.url) {
          image_url = uploadRes.url;
        }
      }

      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, category, price, description, dietary, image_url, is_available: true
        })
      }).then(r => r.json());

      if (res.success) {
        window.showToast?.(`Dish "${name}" added to menu!`, 'success');
        form.reset();
        await this.loadAllData();
        this.renderAdminMenuTable();
      }
    } catch (err) {
      window.showToast?.('Failed to add dish.', 'error');
    }
  },

  async toggleItemAvailability(id, newStatus) {
    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: newStatus })
      }).then(r => r.json());

      if (res.success) {
        window.showToast?.('Availability updated.', 'success');
        await this.loadAllData();
        this.renderAdminMenuTable();
      }
    } catch (err) {
      window.showToast?.('Failed to update availability.', 'error');
    }
  },

  async deleteDish(id) {
    if (!confirm('Are you sure you want to remove this dish from the menu?')) return;
    try {
      const res = await fetch(`/api/menu/${id}`, { method: 'DELETE' }).then(r => r.json());
      if (res.success) {
        window.showToast?.('Dish removed from menu.', 'success');
        await this.loadAllData();
        this.renderAdminMenuTable();
      }
    } catch (err) {
      window.showToast?.('Failed to delete dish.', 'error');
    }
  },

  // Gallery Management
  async initGalleryPage() {
    window.Auth.requireAuth();
    this.renderAdminUser();
    await this.loadAllData();
    this.renderAdminGallery();

    const fileInput = document.getElementById('gal_file');
    const previewContainer = document.getElementById('image-preview-container');
    const previewImage = document.getElementById('image-preview');
    const previewVideo = document.getElementById('video-preview');
    const categorySelect = document.getElementById('gal_cat');

    if (fileInput && previewContainer) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          const isVideo = file.type.startsWith('video/');
          if (isVideo) {
            if (previewImage) previewImage.style.display = 'none';
            if (previewVideo) {
              previewVideo.style.display = 'block';
              previewVideo.src = URL.createObjectURL(file);
            }
            if (categorySelect && categorySelect.value === 'Cuisine') {
              categorySelect.value = 'Cooking Videos';
            }
          } else {
            if (previewVideo) {
              previewVideo.pause();
              previewVideo.style.display = 'none';
              previewVideo.src = '';
            }
            if (previewImage) {
              previewImage.style.display = 'block';
              const reader = new FileReader();
              reader.onload = (evt) => {
                previewImage.src = evt.target.result;
              };
              reader.readAsDataURL(file);
            }
          }
          previewContainer.style.display = 'block';
        } else {
          previewContainer.style.display = 'none';
          if (previewVideo) {
            previewVideo.pause();
            previewVideo.src = '';
          }
        }
      });
    }

    const form = document.getElementById('add-gallery-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleUploadGallery(e));
    }
  },

  renderAdminGallery(filterCategory = 'All') {
    const container = document.getElementById('admin-gallery-grid');
    if (!container) return;

    let items = this.gallery;
    if (filterCategory !== 'All') {
      if (filterCategory === 'Cooking Videos') {
        items = items.filter(i => i.media_type === 'video' || i.category === 'Cooking Videos' || !!i.video_url);
      } else {
        items = items.filter(i => i.category === filterCategory);
      }
    }

    if (items.length === 0) {
      container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: var(--color-white); border: 1px dashed var(--color-border); border-radius: var(--radius-md); color: var(--color-muted);">No items found in this category. Upload your first photograph or video clip above!</div>`;
      return;
    }

    container.innerHTML = items.map(item => {
      const isVideo = item.media_type === 'video' || item.category === 'Cooking Videos' || !!item.video_url;
      const mediaHref = isVideo ? (item.video_url || item.image_url) : item.image_url;

      return `
        <div style="border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; background-color: var(--color-white); display: flex; flex-direction: column; box-shadow: var(--shadow-sm);">
          <div style="position: relative; width: 100%; height: 180px; background: var(--color-forest-dark);">
            <img src="${item.image_url}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='/assets/images/hero_chef_plating.jpg'">
            ${isVideo ? `
              <span style="position: absolute; top: 0.5rem; left: 0.5rem; background: var(--color-gold); color: var(--color-forest-dark); font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                ▶ Video Clip
              </span>
            ` : ''}
            <span style="position: absolute; top: 0.5rem; right: 0.5rem; background: rgba(24, 57, 43, 0.85); color: var(--color-cream); font-size: 0.72rem; font-weight: 600; padding: 0.2rem 0.5rem; border-radius: 4px;">
              ${item.category}
            </span>
          </div>
          <div style="padding: 1rem; flex-grow: 1; display: flex; flex-direction: column;">
            <h4 style="font-size: 0.98rem; color: var(--color-forest); margin-bottom: 0.25rem;">${item.title}</h4>
            <p style="font-size: 0.82rem; color: var(--color-muted); line-height: 1.45; margin-bottom: 1rem; flex-grow: 1;">${item.caption || 'No caption provided.'}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--color-border); padding-top: 0.75rem; margin-top: auto;">
              <a href="${mediaHref}" target="_blank" style="font-size: 0.8rem; color: var(--color-gold); font-weight: 500;">${isVideo ? 'Watch Video &rarr;' : 'View Full &rarr;'}</a>
              <button onclick="Admin.deleteGalleryItem('${item.id}')" class="btn btn-outline btn-sm" style="color: var(--color-error); border-color: var(--color-error); padding: 0.25rem 0.6rem; font-size: 0.75rem;">
                Delete
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  async handleUploadGallery(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    const title = document.getElementById('gal_title').value.trim();
    const category = document.getElementById('gal_cat').value;
    const caption = document.getElementById('gal_caption').value.trim();
    const fileInput = document.getElementById('gal_file');
    const existingSelect = document.getElementById('gal_image');

    const file = fileInput && fileInput.files && fileInput.files[0];
    const existingUrl = existingSelect ? existingSelect.value : '';

    if (!title) {
      window.showToast?.('Please enter a photo title.', 'error');
      return;
    }

    if (!file && !existingUrl) {
      window.showToast?.('Please select an image file to upload.', 'error');
      return;
    }

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Uploading Photo...';
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('caption', caption);

      if (file) {
        formData.append('image', file);
      } else {
        formData.append('image_url', existingUrl);
      }

      const res = await fetch('/api/gallery', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to upload image.');
      }

      window.showToast?.(`Photo "${title}" uploaded to gallery!`, 'success');
      form.reset();
      
      const previewContainer = document.getElementById('image-preview-container');
      if (previewContainer) previewContainer.style.display = 'none';

      await this.loadAllData();
      this.renderAdminGallery();

    } catch (err) {
      window.showToast?.(err.message, 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Upload Photo to Gallery';
      }
    }
  },

  async deleteGalleryItem(id) {
    if (!confirm('Are you sure you want to remove this photo from the gallery?')) return;
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' }).then(r => r.json());
      if (res.success) {
        window.showToast?.('Photo removed from gallery.', 'success');
        await this.loadAllData();
        this.renderAdminGallery();
      } else {
        window.showToast?.(res.message || 'Failed to delete photo.', 'error');
      }
    } catch (err) {
      window.showToast?.('Error deleting photo.', 'error');
    }
  }
};

window.Admin = Admin;
