/**
 * Digital Menu Page Functionality
 */

const MenuPage = {
  currentCategory: 'All',
  searchQuery: '',
  items: [],

  async init() {
    this.attachEventListeners();
    await this.fetchAndRender();
  },

  attachEventListeners() {
    // Category filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentCategory = btn.dataset.category || 'All';
        this.fetchAndRender();
      });
    });

    // Search input
    const searchInput = document.getElementById('menu-search-input');
    if (searchInput) {
      let timeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          this.searchQuery = e.target.value.trim();
          this.fetchAndRender();
        }, 250);
      });
    }
  },

  async fetchAndRender() {
    const grid = document.getElementById('menu-grid');
    const loading = document.getElementById('menu-loading');
    const emptyState = document.getElementById('menu-empty-state');

    if (!grid) return;

    if (loading) loading.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';

    try {
      this.items = await window.SupabaseBridge.getMenuItems(this.currentCategory, this.searchQuery);
      
      if (loading) loading.style.display = 'none';

      if (!this.items || this.items.length === 0) {
        grid.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
      }

      grid.innerHTML = this.items.map(item => this.renderDishCard(item)).join('');

    } catch (err) {
      console.error('Error loading menu', err);
      if (loading) loading.style.display = 'none';
      if (grid) grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--color-error);">Unable to load dishes right now. Please refresh the page.</p>`;
    }
  },

  renderDishCard(item) {
    const dietaryList = Array.isArray(item.dietary) ? item.dietary.join(' · ') : (item.dietary || '');
    const isAvail = item.is_available !== false;

    return `
      <article class="dish-card">
        <div class="dish-card-media">
          <img src="${item.image_url}" alt="${item.name}" loading="lazy" onerror="this.src='/assets/images/kenyan_beef_pilau.jpg'">
          ${!isAvail ? `<div class="dish-availability-badge" style="background-color: var(--color-error);">Sold Out</div>` : ''}
        </div>
        <div class="dish-card-body">
          <div class="dish-metadata">
            <span>${item.category}</span>
            ${dietaryList ? `<span aria-hidden="true">·</span><span>${dietaryList}</span>` : ''}
          </div>
          <h3 class="dish-name">${item.name}</h3>
          ${item.description ? `<p class="dish-desc">${item.description}</p>` : ''}
          <div class="dish-card-footer">
            <div class="dish-price">
              <span class="dish-price-currency">KSh</span>${item.price.toLocaleString()}
            </div>
            <button 
              class="btn btn-primary btn-sm"
              onclick="Cart.addItem({ id: '${item.id}', name: '${item.name.replace(/'/g, "\\'")}', price: ${item.price}, image_url: '${item.image_url}' })"
              ${!isAvail ? 'disabled' : ''}
            >
              ${isAvail ? '+ Add to Order' : 'Unavailable'}
            </button>
          </div>
        </div>
      </article>
    `;
  }
};

window.MenuPage = MenuPage;
document.addEventListener('DOMContentLoaded', () => MenuPage.init());
