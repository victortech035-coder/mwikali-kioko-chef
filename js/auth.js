/**
 * Admin Authentication & Session Management
 */

const Auth = {
  TOKEN_KEY: 'mk_chef_admin_token',
  USER_KEY: 'mk_chef_admin_user',

  isAuthenticated() {
    return !!localStorage.getItem(this.TOKEN_KEY);
  },

  getUser() {
    try {
      const u = localStorage.getItem(this.USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  },

  async login(email, password) {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error(`Admin login returned an invalid response (HTTP ${res.status}). Check that the website API is deployed correctly.`);
    }

    if (!res.ok || !data.success) {
      throw new Error(data.message || `Login failed (HTTP ${res.status}).`);
    }

    localStorage.setItem(this.TOKEN_KEY, data.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
    return data;
  },

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    window.location.href = '/admin/index.html';
  },

  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = '/admin/index.html';
    }
  }
};

window.Auth = Auth;
