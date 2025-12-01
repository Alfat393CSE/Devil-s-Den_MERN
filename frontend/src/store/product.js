import { create } from "zustand";

// Helper to get current user ID
const getCurrentUserId = () => {
	try {
		if (typeof window !== 'undefined') {
			const raw = localStorage.getItem('user');
			if (raw) {
				const user = JSON.parse(raw);
				return user._id || user.id;
			}
		}
	} catch (e) {}
	return null;
};

// Helper to get cart key for current user
const getCartKey = () => {
	const userId = getCurrentUserId();
	return userId ? `cart_${userId}` : 'cart_guest';
};

let __initial_cart = [];
try {
	if (typeof window !== 'undefined') {
		const cartKey = getCartKey();
		const raw = localStorage.getItem(cartKey);
		if (raw) __initial_cart = JSON.parse(raw);
	}
} catch (e) { __initial_cart = []; }

export const useProductStore = create((set, get) => ({
	products: [],
	cart: __initial_cart || [],
	setProducts: (products) => set({ products }),
	
	// Load cart for current user
	loadUserCart: () => {
		try {
			if (typeof window !== 'undefined') {
				const cartKey = getCartKey();
				const raw = localStorage.getItem(cartKey);
				const cart = raw ? JSON.parse(raw) : [];
				set({ cart });
			}
		} catch (e) {
			set({ cart: [] });
		}
	},
	
	createProduct: async (newProduct) => {
		if (!newProduct.name || !newProduct.image || !newProduct.price) {
			return { success: false, message: "Please fill in all fields." };
		}
		try {
			const headers = { "Content-Type": "application/json" };
			const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
			if (token) headers.Authorization = `Bearer ${token}`;
			const res = await fetch("/api/products", {
				method: "POST",
				headers,
				body: JSON.stringify(newProduct),
			});
			const data = await res.json();
			if (!res.ok) return { success: false, message: data.message || 'Unauthorized' };
			set((state) => ({ products: [...state.products, data.data] }));
			return { success: true, message: "Product created successfully" };
		} catch (err) {
			return { success: false, message: err.message || 'Network error' };
		}
	},
	buyProduct: async (productId) => {
		try {
			const headers = { 'Content-Type': 'application/json' };
			const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
			if (token) headers.Authorization = `Bearer ${token}`;
			const res = await fetch('/api/purchases', {
				method: 'POST',
				headers,
				body: JSON.stringify({ 
					items: [{ productId, quantity: 1 }]
				}),
			});
			const data = await res.json();
			if (!res.ok) return { success: false, message: data.message || 'Purchase failed' };
			// Optionally refresh products
			await set((s) => s);
			return { success: true, data };
		} catch (err) {
			return { success: false, message: err.message || 'Network error' };
		}
	},
	// submit a product as a user (requires auth) -> admin must approve
	submitProduct: async (newProduct) => {
		if (!newProduct.name || !newProduct.image || !newProduct.price) {
			return { success: false, message: 'Please fill in all fields.' };
		}
		try {
			const headers = { 'Content-Type': 'application/json' };
			const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
			if (token) headers.Authorization = `Bearer ${token}`;
			const res = await fetch('/api/products/submit', {
				method: 'POST',
				headers,
				body: JSON.stringify(newProduct),
			});
			const data = await res.json();
			if (!res.ok) return { success: false, message: data.message || 'Submission failed' };
			return { success: true, data };
		} catch (err) {
			return { success: false, message: err.message || 'Network error' };
		}
	},
	fetchProducts: async () => {
		try {
			const res = await fetch("/api/products");
			const data = await res.json();
			if (res.ok) set({ products: data.data || [] });
		} catch (err) {
			console.error('Failed to fetch products', err);
		}
	},

	addToCart: (product) => {
		const state = useProductStore.getState();
		const exists = state.cart.find(p => p._id === product._id);
		let next;
		if (exists) {
			next = state.cart.map(p => p._id === product._id ? { ...p, qty: (p.qty || 1) + 1 } : p);
		} else {
			next = [...state.cart, { ...product, qty: 1 }];
		}
		
		try {
			const cartKey = getCartKey();
			localStorage.setItem(cartKey, JSON.stringify(next));
		} catch (e) {}
		
		useProductStore.setState({ cart: next });
		return { success: true, message: 'Added to cart' };
	},

	updateCartQty: (productId, qty) => set((state) => {
		let next = state.cart.map(p => p._id === productId ? { ...p, qty: qty < 1 ? 1 : qty } : p);
		// if qty is 0 or less, remove
		if (qty <= 0) next = next.filter(p => p._id !== productId);
		try {
			const cartKey = getCartKey();
			localStorage.setItem(cartKey, JSON.stringify(next));
		} catch (e) {}
		return { cart: next };
	}),
	removeFromCart: (productId) => set((state) => {
		const next = state.cart.filter(p => p._id !== productId);
		try {
			const cartKey = getCartKey();
			localStorage.setItem(cartKey, JSON.stringify(next));
		} catch (e) {}
		return { cart: next };
	}),
	clearCart: () => {
		try {
			const cartKey = getCartKey();
			localStorage.removeItem(cartKey);
		} catch (e) {}
		return set({ cart: [] });
	},

	checkoutCart: async () => {
		try {
			const headers = { 'Content-Type': 'application/json' };
			const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
			if (token) headers.Authorization = `Bearer ${token}`;
			// read current cart from store
			const cart = get().cart || [];
			if (!cart.length) return { success: false, message: 'Cart is empty' };
			const items = cart.map(i => ({ productId: i._id, qty: i.qty || 1 }));
			const res = await fetch('/api/purchases/checkout', {
				method: 'POST',
				headers,
				body: JSON.stringify({ items }),
			});
			const data = await res.json();
			if (!res.ok) return { success: false, message: data.message || 'Checkout failed' };
			// clear cart on success
			localStorage.removeItem('cart');
			set({ cart: [] });
			return { success: true, data };
		} catch (err) {
			return { success: false, message: err.message || 'Network error' };
		}
	},
	deleteProduct: async (pid) => {
		try {
			const headers = {};
			const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
			if (token) headers.Authorization = `Bearer ${token}`;
			const res = await fetch(`/api/products/${pid}`, {
				method: "DELETE",
				headers,
			});
			const data = await res.json();
			if (!res.ok) return { success: false, message: data.message || 'Unauthorized' };
			set((state) => ({ products: state.products.filter((product) => product._id !== pid) }));
			return { success: true, message: data.message || 'Product deleted' };
		} catch (err) {
			return { success: false, message: err.message || 'Network error' };
		}
	},
	updateProduct: async (pid, updatedProduct) => {
		try {
			const headers = { "Content-Type": "application/json" };
			const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
			if (token) headers.Authorization = `Bearer ${token}`;
			const res = await fetch(`/api/products/${pid}`, {
				method: "PUT",
				headers,
				body: JSON.stringify(updatedProduct),
			});
			const data = await res.json();
			if (!res.ok) return { success: false, message: data.message || 'Unauthorized' };
			set((state) => ({
				products: state.products.map((product) => (product._id === pid ? data.data : product)),
			}));
			return { success: true, message: data.message || 'Product updated' };
		} catch (err) {
			return { success: false, message: err.message || 'Network error' };
		}
	},
	updateStock: async (pid, stock) => {
		try {
			const headers = { "Content-Type": "application/json" };
			const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
			if (token) headers.Authorization = `Bearer ${token}`;
			const res = await fetch(`/api/products/${pid}/stock`, {
				method: "PATCH",
				headers,
				body: JSON.stringify({ stock }),
			});
			const data = await res.json();
			if (!res.ok) return { success: false, message: data.message || 'Unauthorized' };
			set((state) => ({
				products: state.products.map((product) => (product._id === pid ? data.data : product)),
			}));
			return { success: true, message: data.message || 'Stock updated' };
		} catch (err) {
			return { success: false, message: err.message || 'Network error' };
		}
	},
}));