'use strict';
const Cart = {
    items: [],
    badge: null,
    storageKey: 'coelho_cart',

    init() {
        this.badge = document.querySelector('nav .fa-shopping-cart + span');
        this.loadFromStorage();
        this.setupAddToCartButtons();
        this.setupWishlistButtons();
        this.updateBadge();
    },

    loadFromStorage() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                this.items = JSON.parse(stored);
            } catch (e) {
                console.error('Error loading cart:', e);
                this.items = [];
            }
        }
    },

    saveToStorage() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    },

    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                ...product,
                quantity: 1
            });
        }
        
        this.saveToStorage();
        this.updateBadge();
    },

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveToStorage();
        this.updateBadge();
    },

    updateBadge() {
        if (!this.badge) return;
        
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        this.badge.textContent = totalItems;
        
        if (totalItems > 0) {
            this.badge.classList.add('animate-pulse');
            setTimeout(() => {
                this.badge.classList.remove('animate-pulse');
            }, 1000);
        }
    },

    getTotalPrice() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    getItemCount() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    },

    clear() {
        this.items = [];
        this.saveToStorage();
        this.updateBadge();
    }
};

const AddToCartAnimation = {
    setupAddToCartButtons() {
        document.querySelectorAll('.product-card button').forEach(btn => {
            if (!btn.querySelector('.fa-shopping-cart')) return;
            
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.animateAddToCart(btn);
                const productCard = btn.closest('.product-card');
                const product = this.extractProductInfo(productCard);
                
                if (product) {
                    Cart.addItem(product);
                }
            });
        });
    },

    extractProductInfo(card) {
        return {
            id: Date.now(),
            name: card.querySelector('h3')?.textContent || 'Producto',
            price: 196000,
            image: '/assets/images/product-placeholder.jpg'
        };
    },

    animateAddToCart(button) {
        const rect = button.getBoundingClientRect();
        const icon = this.createFlyingIcon(rect.left, rect.top);
        document.body.appendChild(icon);
        requestAnimationFrame(() => {
            setTimeout(() => {
                this.flyToCart(icon);
            }, 10);
        });
    },

    createFlyingIcon(left, top) {
        const icon = document.createElement('i');
        icon.className = 'fas fa-shopping-cart';
        icon.style.cssText = `
            position: fixed;
            left: ${left}px;
            top: ${top}px;
            font-size: 24px;
            color: #C9A86A;
            z-index: 9999;
            transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: none;
        `;
        return icon;
    },

    flyToCart(icon) {
        const navCart = document.querySelector('nav .fa-shopping-cart');
        const rect = navCart.getBoundingClientRect();
        
        icon.style.left = rect.left + 'px';
        icon.style.top = rect.top + 'px';
        icon.style.transform = 'scale(0)';
        icon.style.opacity = '0';
        
        setTimeout(() => {
            icon.remove();
            this.animateBadge();
        }, 800);
    },

    animateBadge() {
        const badge = document.querySelector('nav .fa-shopping-cart + span');
        if (!badge) return;
        
        badge.style.transform = 'scale(1.3)';
        badge.style.background = '#C9A86A';
        
        setTimeout(() => {
            badge.style.transform = 'scale(1)';
        }, 200);
    }
};
const Wishlist = {
    items: new Set(),
    storageKey: 'coelho_wishlist',

    init() {
        this.loadFromStorage();
        this.setupWishlistButtons();
    },

    loadFromStorage() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                this.items = new Set(JSON.parse(stored));
            } catch (e) {
                console.error('Error loading wishlist:', e);
                this.items = new Set();
            }
        }
    },

    saveToStorage() {
        localStorage.setItem(this.storageKey, JSON.stringify([...this.items]));
    },

    toggle(productId) {
        if (this.items.has(productId)) {
            this.items.delete(productId);
        } else {
            this.items.add(productId);
        }
        this.saveToStorage();
    },

    has(productId) {
        return this.items.has(productId);
    },

    setupWishlistButtons() {
        document.querySelectorAll('.fa-heart').forEach(heart => {
            const button = heart.parentElement;
            
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.animateToggle(button);
            });
        });
    },

    animateToggle(button) {
        const icon = button.querySelector('i');
        
        if (icon.classList.contains('far')) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            button.style.background = '#C9A86A';
            button.style.borderColor = '#C9A86A';
            
            icon.style.transform = 'scale(1.3)';
            setTimeout(() => {
                icon.style.transform = 'scale(1)';
            }, 200);
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            button.style.background = 'white';
            button.style.borderColor = '#e5e7eb';
        }
    }
};

const QuickView = {
    modal: null,

    init() {
        this.setupQuickViewButtons();
    },

    setupQuickViewButtons() {
        document.querySelectorAll('[data-quick-view]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = btn.getAttribute('data-quick-view');
                this.showModal(productId);
            });
        });
    },

    showModal(productId) {
        console.log('Quick view for product:', productId);
        alert('Vista rápida - Por implementar');
    },

    hideModal() {
        if (this.modal) {
            this.modal.classList.add('hidden');
        }
    }
};
document.addEventListener('DOMContentLoaded', () => {
    Cart.init();
    Wishlist.init();
    QuickView.init();
    AddToCartAnimation.setupAddToCartButtons();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Cart,
        AddToCartAnimation,
        Wishlist,
        QuickView
    };
}
