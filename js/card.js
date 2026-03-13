'use strict';

const Card = {
  get items() {
    return window.CoelhoCart ? CoelhoCart.state.lines : [];
  },

  storageKey: 'coelho_card',
  async init() {
    if (!window.CoelhoCart) {
      console.warn('CoelhoCart no está disponible. Asegúrate de cargar cart.js antes de card.js');
      return;
    }
    await CoelhoCart.init();
    console.log(' Card → CoelhoCart inicializado');
  },
  async addItem(product, tallaSeleccionada) {
    if (!window.CoelhoCart) return;

    const variants = product.shopifyData?.variants || [];
    let variant = null;

    if (variants.length === 1) {
      variant = variants[0];
    } else {
      const talla = tallaSeleccionada || product.tallaSeleccionada;
      variant = variants.find(v =>
        v.selectedOptions.some(opt =>
          ['talla', 'size', 'tamaño'].includes(opt.name.toLowerCase()) &&
          opt.value === talla
        )
      );
      if (!variant) variant = variants.find(v => v.availableForSale) || variants[0];
    }

    if (!variant) {
      CoelhoCart.showToast('Selecciona una talla primero');
      return;
    }
    if (!variant.availableForSale) {
      CoelhoCart.showToast('Esta talla no está disponible');
      return;
    }

    await CoelhoCart.addItem(variant.id, 1);
    CoelhoCart.openDrawer();
  },
  async removeItem(lineId) {
    if (!window.CoelhoCart) return;
    await CoelhoCart.removeItem(lineId);
  },
  updateBadge() {
    if (window.CoelhoCart) CoelhoCart._renderBadge();
  },

  getTotalPrice() {
    return window.CoelhoCart ? CoelhoCart.state.totalAmount : 0;
  },

  getItemCount() {
    return window.CoelhoCart ? CoelhoCart.itemCount : 0;
  },

  clear() {
    if (!window.CoelhoCart) return;
    const lineIds = CoelhoCart.state.lines.map(l => l.id);
    lineIds.forEach(id => CoelhoCart.removeItem(id));
  },
  loadFromStorage() {},
  saveToStorage()  {},
};

const Wishlist = {
  items: new Set(),
  storageKey: 'coelho_wishlist',

  init() {
    this.loadFromStorage();
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
};

const QuickView = {
  modal: null,
  init() {
    // Placeholder para futura implementación
  },
};

document.addEventListener('DOMContentLoaded', async () => {
  await Card.init();  
  Wishlist.init();
  QuickView.init();

  console.log('Card functionality loaded');
});

window.addToCart = async function (e, productId, tallaSeleccionada) {
  e.stopPropagation();

  const producto = window.ProductManagerStorefront?.getProductById(productId);
  if (!producto) {
    console.warn('Producto no encontrado:', productId);
    return;
  }

  const btn = e.currentTarget;
  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;

  try {
    await Card.addItem(producto, tallaSeleccionada);
  } catch (err) {
    if (window.CoelhoCart) CoelhoCart.showToast('Error al agregar. Intenta de nuevo.');
    console.error('addToCart error:', err);
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Card, Wishlist, QuickView };
}