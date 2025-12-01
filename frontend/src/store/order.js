import { create } from "zustand";

export const useOrderStore = create((set, get) => ({
  orders: [],
  loading: false,
  error: null,

  // Create order from cart items
  createOrder: async (items, shippingAddress) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ loading: false, error: 'Please login to place an order' });
        return { success: false, message: 'Please login to place an order' };
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ items, shippingAddress })
      });

      const data = await res.json();
      
      if (!res.ok) {
        set({ loading: false, error: data.message });
        return { success: false, message: data.message };
      }

      set({ loading: false });
      return { success: true, data: data.data, message: data.message };
    } catch (error) {
      const message = error.message || 'Failed to create order';
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },

  // Fetch user's orders
  fetchUserOrders: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ loading: false, orders: [] });
        return;
      }

      // Build query string
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const queryString = params.toString();
      const url = queryString ? `/api/orders/my-orders?${queryString}` : '/api/orders/my-orders';

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Handle 401 (unauthorized) silently - user needs to log in
      if (res.status === 401) {
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ loading: false, orders: [] });
        return;
      }

      const data = await res.json();
      
      if (res.ok) {
        set({ loading: false, orders: data.data || [] });
      } else {
        set({ loading: false, error: data.message, orders: [] });
      }
    } catch (error) {
      set({ loading: false, error: error.message, orders: [] });
    }
  },

  // Fetch all orders (admin)
  fetchAllOrders: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      
      // Build query string
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const queryString = params.toString();
      const url = queryString ? `/api/orders/all?${queryString}` : '/api/orders/all';
      
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Handle 401 (unauthorized) silently
      if (res.status === 401 || res.status === 403) {
        // Clear invalid token on auth failure
        if (res.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        set({ loading: false, orders: [] });
        return;
      }

      const data = await res.json();
      
      if (res.ok) {
        set({ loading: false, orders: data.data || [] });
      } else {
        set({ loading: false, error: data.message, orders: [] });
      }
    } catch (error) {
      set({ loading: false, error: error.message, orders: [] });
    }
  },

  // Approve order (admin)
  approveOrder: async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders/${orderId}/approve`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      
      if (res.ok) {
        // Update local state
        set(state => ({
          orders: state.orders.map(order =>
            order._id === orderId ? { ...order, status: 'approved' } : order
          )
        }));
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: error.message || 'Failed to approve order' };
    }
  },

  // Reject order (admin)
  rejectOrder: async (orderId, reason) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders/${orderId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rejectionReason: reason })
      });

      const data = await res.json();
      
      if (res.ok) {
        // Update local state
        set(state => ({
          orders: state.orders.map(order =>
            order._id === orderId ? { ...order, status: 'rejected', rejectionReason: reason } : order
          )
        }));
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: error.message || 'Failed to reject order' };
    }
  },

  // Cancel order (user)
  cancelOrder: async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      
      if (res.ok) {
        // Update local state
        set(state => ({
          orders: state.orders.map(order =>
            order._id === orderId ? { ...order, status: 'cancelled' } : order
          )
        }));
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: error.message || 'Failed to cancel order' };
    }
  },

  // Delete single order (user)
  deleteOrder: async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      
      if (res.ok) {
        // Remove from local state
        set(state => ({
          orders: state.orders.filter(order => order._id !== orderId)
        }));
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: error.message || 'Failed to delete order' };
    }
  },

  // Delete multiple orders (bulk delete)
  deleteMultipleOrders: async (orderIds) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/orders/bulk-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ orderIds })
      });

      const data = await res.json();
      
      if (res.ok) {
        // Remove deleted orders from local state
        set(state => ({
          orders: state.orders.filter(order => !orderIds.includes(order._id))
        }));
        return { success: true, message: data.message, deletedCount: data.deletedCount };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: error.message || 'Failed to delete orders' };
    }
  },

  // Get order statistics (admin)
  fetchOrderStats: async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/orders/stats/summary', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      
      if (res.ok) {
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}));
