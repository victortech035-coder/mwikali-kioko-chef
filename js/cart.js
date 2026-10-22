/**
 * Shopping Cart & Online Ordering Workflow
 */

const Cart = {
  items: [],
  deliveryType: 'delivery', // 'delivery' | 'collection'
  deliveryFee: 300,

  init() {
    this.load();
    this.renderBadge();
    this.attachEvents();
  },

  load() {
    try {
      const stored = localStorage.getItem('mk_chef_cart');
      this.items = stored ? JSON.parse(stored) : [];
    } catch (e) {
      this.items = [];
    }
  },

  save() {
    localStorage.setItem('mk_chef_cart', JSON.stringify(this.items));
    this.renderBadge();
    this.renderDrawer();
  },

  addItem(item, qty = 1) {
    const existing = this.items.find(i => i.id === item.id);
    if (existing) {
      existing.quantity += qty;
    } else {
      this.items.push({
        id: item.id,
        name: item.name,
        price: item.price,
        image_url: item.image_url,
        quantity: qty
      });
    }
    this.save();
    window.showToast?.(`Added "${item.name}" to your order.`, 'success');
  },

  updateQuantity(id, delta) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
      this.items = this.items.filter(i => i.id !== id);
    }
    this.save();
  },

  removeItem(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.save();
  },

  clear() {
    this.items = [];
    this.save();
  },

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  getTotal() {
    const subtotal = this.getSubtotal();
    const fee = this.deliveryType === 'delivery' && subtotal > 0 ? this.deliveryFee : 0;
    return subtotal + fee;
  },

  getItemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  },

  renderBadge() {
    const count = this.getItemCount();
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? 'flex' : 'none';
    });
  },

  renderDrawer() {
    const drawerList = document.getElementById('cart-items-list');
    const emptyState = document.getElementById('cart-empty-state');
    const footer = document.getElementById('cart-drawer-footer');
    const subtotalEl = document.getElementById('cart-subtotal-val');
    const feeEl = document.getElementById('cart-fee-val');
    const totalEl = document.getElementById('cart-total-val');

    if (!drawerList) return;

    if (this.items.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      if (drawerList) drawerList.innerHTML = '';
      if (footer) footer.style.display = 'none';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (footer) footer.style.display = 'block';

    drawerList.innerHTML = this.items.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price tabular-nums">KSh ${item.price.toLocaleString()} each</div>
        </div>
        <div class="cart-qty-controls">
          <button class="qty-btn" onclick="Cart.updateQuantity('${item.id}', -1)" aria-label="Decrease quantity">−</button>
          <span class="qty-display tabular-nums">${item.quantity}</span>
          <button class="qty-btn" onclick="Cart.updateQuantity('${item.id}', 1)" aria-label="Increase quantity">+</button>
        </div>
      </div>
    `).join('');

    const subtotal = this.getSubtotal();
    const fee = this.deliveryType === 'delivery' ? this.deliveryFee : 0;
    const total = this.getTotal();

    if (subtotalEl) subtotalEl.textContent = `KSh ${subtotal.toLocaleString()}`;
    if (feeEl) feeEl.textContent = this.deliveryType === 'delivery' ? `KSh ${fee.toLocaleString()}` : 'Free';
    if (totalEl) totalEl.textContent = `KSh ${total.toLocaleString()}`;
  },

  openDrawer() {
    this.renderDrawer();
    const overlay = document.getElementById('cart-drawer-overlay');
    const drawer = document.getElementById('cart-drawer');
    if (overlay && drawer) {
      overlay.classList.add('open');
      drawer.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  },

  closeDrawer() {
    const overlay = document.getElementById('cart-drawer-overlay');
    const drawer = document.getElementById('cart-drawer');
    if (overlay && drawer) {
      overlay.classList.remove('open');
      drawer.classList.remove('open');
      document.body.style.overflow = '';
    }
  },

  openCheckoutModal() {
    if (this.items.length === 0) {
      window.showToast?.('Your order is empty. Please select dishes first.', 'error');
      return;
    }
    this.closeDrawer();
    const modal = document.getElementById('checkout-modal');
    if (modal) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';

      // Set min date to today
      const dateInput = document.getElementById('checkout-date');
      if (dateInput && window.Validation) {
        dateInput.min = window.Validation.getTodayDateString();
        if (!dateInput.value) dateInput.value = window.Validation.getTodayDateString();
      }

      this.updateCheckoutSummary();
    }
  },

  closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  },

  updateCheckoutSummary() {
    const summaryList = document.getElementById('checkout-summary-list');
    const totalEl = document.getElementById('checkout-total-val');
    if (!summaryList) return;

    summaryList.innerHTML = this.items.map(i => `
      <div style="display:flex; justify-content:space-between; margin-bottom: 0.35rem; font-size: 0.9rem;">
        <span>${i.quantity}x ${i.name}</span>
        <span class="tabular-nums font-semibold">KSh ${(i.price * i.quantity).toLocaleString()}</span>
      </div>
    `).join('');

    if (totalEl) totalEl.textContent = `KSh ${this.getTotal().toLocaleString()}`;
  },

  async handleOrderSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    const name = form.customer_name.value.trim();
    const phone = form.customer_phone.value.trim();
    const email = form.customer_email.value.trim();
    const deliveryType = form.delivery_type.value;
    const address = form.delivery_address ? form.delivery_address.value.trim() : '';
    const preferredDate = form.preferred_date.value;
    const preferredTime = form.preferred_time.value;
    const notes = form.notes.value.trim();

    // Validation
    if (!name) {
      window.showToast?.('Please enter your full name.', 'error');
      return;
    }

    if (!window.Validation?.isValidPhone(phone)) {
      window.showToast?.('Please enter a valid phone number (+254...).', 'error');
      return;
    }

    if (deliveryType === 'delivery' && !address) {
      window.showToast?.('Please enter your delivery address in Nairobi.', 'error');
      return;
    }

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting Order Enquiry...';
      }

      const payload = {
        customer_name: name,
        customer_phone: window.Validation.formatKenyaPhone(phone),
        customer_email: email,
        delivery_type: deliveryType,
        delivery_address: address,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        notes: notes,
        items: this.items
      };

      const result = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(r => r.json());

      if (!result.success) {
        throw new Error(result.message || 'Failed to submit order.');
      }

      // Order created successfully
      this.clear();
      this.closeCheckoutModal();

      // Show Order Success Modal with reference & WhatsApp button
      this.showOrderSuccess(result.order, result.whatsapp_url);

    } catch (err) {
      window.showToast?.(err.message, 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Order Enquiry';
      }
    }
  },

  showOrderSuccess(order, whatsappUrl) {
    const successModal = document.getElementById('order-success-modal');
    if (!successModal) return;

    document.getElementById('success-order-ref').textContent = order.id;
    document.getElementById('success-order-total').textContent = `KSh ${order.total_amount.toLocaleString()}`;
    document.getElementById('success-order-name').textContent = order.customer_name;
    document.getElementById('success-order-delivery').textContent = order.delivery_type === 'delivery' ? `Delivery to: ${order.delivery_address}` : 'Kitchen Pickup';
    
    const waBtn = document.getElementById('success-order-whatsapp-btn');
    if (waBtn && whatsappUrl) {
      waBtn.href = whatsappUrl;
    }

    successModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  attachEvents() {
    // Delivery type radio buttons change handler
    document.querySelectorAll('input[name="delivery_type"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.deliveryType = e.target.value;
        const addrField = document.getElementById('delivery-address-group');
        if (addrField) {
          addrField.style.display = this.deliveryType === 'delivery' ? 'block' : 'none';
        }
        this.renderDrawer();
        this.updateCheckoutSummary();
      });
    });
  }
};

window.Cart = Cart;
document.addEventListener('DOMContentLoaded', () => Cart.init());
