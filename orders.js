/**
 * Order Tracking & Verification Utilities
 */

const OrdersPage = {
  async trackOrder(orderId) {
    if (!orderId) return null;
    try {
      const res = await fetch(`/api/orders`);
      const data = await res.json();
      if (!data.success) return null;
      return (data.orders || []).find(o => o.id === orderId.trim());
    } catch (e) {
      console.error('Error tracking order', e);
      return null;
    }
  }
};

window.OrdersPage = OrdersPage;
