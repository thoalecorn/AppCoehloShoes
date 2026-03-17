'use strict';

const CoelhoCart = {
  state: {
    cartId:      null,
    checkoutUrl: null,
    lines:       [],
    totalAmount: 0,
    currencyCode: 'COP',
  },

  saveState() {
    localStorage.setItem('coelho_cart_id', this.state.cartId || '');
    localStorage.setItem('coelho_checkout_url', this.state.checkoutUrl || '');
  },

  loadState() {
    this.state.cartId = localStorage.getItem('coelho_cart_id') || null;
    this.state.checkoutUrl = localStorage.getItem('coelho_checkout_url') || null;
  },

  async createCart() {
    const mutation = `
      mutation cartCreate {
        cartCreate {
          cart {
            id checkoutUrl
            lines(first: 100) { edges { node { id quantity merchandise { ... on ProductVariant { id title price { amount currencyCode } product { title images(first:1){ edges { node { url } } } } } } } } }
            cost { totalAmount { amount currencyCode } }
          }
          userErrors { field message }
        }
      }
    `;
    const data = await ShopifyStorefrontClient.graphql(mutation);
    this._applyCart(data.cartCreate.cart);
    this.saveState();
    return data.cartCreate.cart;
  },

  async fetchCart() {
    if (!this.state.cartId) return null;
    const query = `
      query getCart($cartId: ID!) {
        cart(id: $cartId) {
          id checkoutUrl
          lines(first: 100) { edges { node { id quantity merchandise { ... on ProductVariant { id title price { amount currencyCode } product { title images(first:1){ edges { node { url } } } } } } } } }
          cost { totalAmount { amount currencyCode } }
        }
      }
    `;
    try {
      const data = await ShopifyStorefrontClient.graphql(query, { cartId: this.state.cartId });
      if (data.cart) { this._applyCart(data.cart); return data.cart; }
    } catch {
      this.state.cartId = null;
    }
    return null;
  },

  async addItem(variantId, quantity = 1) {
    if (!this.state.cartId) await this.createCart();

    const mutation = `
      mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            id checkoutUrl
            lines(first: 100) { edges { node { id quantity merchandise { ... on ProductVariant { id title price { amount currencyCode } product { title images(first:1){ edges { node { url } } } } } } } } }
            cost { totalAmount { amount currencyCode } }
          }
          userErrors { field message }
        }
      }
    `;

    let data;
    try {
      data = await ShopifyStorefrontClient.graphql(mutation, {
        cartId: this.state.cartId,
        lines: [{ merchandiseId: variantId, quantity }],
      });
    } catch (err) {
      const msg = err.message?.toLowerCase() || '';
      if (msg.includes('no existe') || msg.includes('not found') || msg.includes('invalid')) {
        this.state.cartId      = null;
        this.state.checkoutUrl = null;
        localStorage.removeItem('coelho_cart_id');
        localStorage.removeItem('coelho_checkout_url');
        await this.createCart();
        data = await ShopifyStorefrontClient.graphql(mutation, {
          cartId: this.state.cartId,
          lines: [{ merchandiseId: variantId, quantity }],
        });
      } else {
        throw err;
      }
    }

    const errors = data.cartLinesAdd.userErrors;
    if (errors.length) throw new Error(errors[0].message);

    this._applyCart(data.cartLinesAdd.cart);
    this.saveState();
    this.render();
    this.showToast('¡Producto agregado al carrito!');
  },

  async updateItem(lineId, quantity) {
    const mutation = `
      mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            id checkoutUrl
            lines(first: 100) { edges { node { id quantity merchandise { ... on ProductVariant { id title price { amount currencyCode } product { title images(first:1){ edges { node { url } } } } } } } } }
            cost { totalAmount { amount currencyCode } }
          }
          userErrors { field message }
        }
      }
    `;
    const data = await ShopifyStorefrontClient.graphql(mutation, {
      cartId: this.state.cartId,
      lines: [{ id: lineId, quantity }],
    });
    this._applyCart(data.cartLinesUpdate.cart);
    this.render();
  },

  async removeItem(lineId) {
    const mutation = `
      mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            id checkoutUrl
            lines(first: 100) { edges { node { id quantity merchandise { ... on ProductVariant { id title price { amount currencyCode } product { title images(first:1){ edges { node { url } } } } } } } } }
            cost { totalAmount { amount currencyCode } }
          }
          userErrors { field message }
        }
      }
    `;
    const data = await ShopifyStorefrontClient.graphql(mutation, {
      cartId: this.state.cartId,
      lineIds: [lineId],
    });
    this._applyCart(data.cartLinesRemove.cart);
    this.render();
  },

  goToCheckout() {
    if (!this.state.checkoutUrl) return;
    window.location.href = this.state.checkoutUrl;
  },

  _applyCart(cart) {
    this.state.cartId = cart.id;
    this.state.checkoutUrl = cart.checkoutUrl;
    this.state.lines = cart.lines.edges.map(e => e.node);
    this.state.totalAmount = parseFloat(cart.cost.totalAmount.amount);
    this.state.currencyCode = cart.cost.totalAmount.currencyCode;
  },

  get itemCount() {
    return this.state.lines.reduce((sum, l) => sum + l.quantity, 0);
  },

  formatPrice(amount, currency) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency || this.state.currencyCode,
      minimumFractionDigits: 0,
    }).format(amount);
  },

    async init() {
    this.loadState();

    if (this.state.cartId) {
        const cart = await this.fetchCart();
        if (!cart) {
        this.state.cartId      = null;
        this.state.checkoutUrl = null;
        localStorage.removeItem('coelho_cart_id');
        localStorage.removeItem('coelho_checkout_url');
        }
    }

    this._injectDrawer();
    this._bindGlobalEvents();
    this.render();
    },

  _injectDrawer() {
    if (document.getElementById('cart-drawer')) return;

    const drawer = document.createElement('div');
    drawer.id = 'cart-drawer';
    drawer.innerHTML = `
      <div id="cart-overlay"
           class="fixed inset-0 bg-black/60 z-[60] opacity-0 pointer-events-none transition-opacity duration-300"
           onclick="CoelhoCart.closeDrawer()">
      </div>

      <aside id="cart-panel"
             class="fixed top-0 right-0 h-full w-full max-w-md bg-[#1a1a1a] z-[70]
                    flex flex-col shadow-2xl translate-x-full transition-transform duration-300 ease-in-out">

        <div class="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div class="flex items-center gap-3">
            <i class="fas fa-shopping-cart text-coelho-gold text-lg"></i>
            <h2 class="text-white font-bold text-lg tracking-wide">Tu Carrito</h2>
            <span id="cart-count-badge"
                  class="bg-coelho-gold text-white text-xs font-bold rounded-full w-5 h-5
                         flex items-center justify-center">0</span>
          </div>
          <button onclick="CoelhoCart.closeDrawer()"
                  class="text-gray-400 hover:text-white transition w-8 h-8 flex items-center justify-center">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <div id="cart-items" class="flex-1 overflow-y-auto px-6 py-4 space-y-4"></div>

        <div id="cart-footer" class="px-6 py-5 border-t border-white/10 bg-[#111]">
          <div class="flex justify-between items-center mb-4">
            <span class="text-gray-400 text-sm uppercase tracking-wider">Total</span>
            <span id="cart-total" class="text-white font-bold text-xl">$0</span>
          </div>

          <button id="btn-checkout"
                  onclick="CoelhoCart.goToCheckout()"
                  class="w-full bg-coelho-gold hover:bg-yellow-600 text-white font-bold py-4
                        tracking-widest uppercase text-sm transition-colors duration-200
                        flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <span>Proceder con la compra</span>
            <i class="fas fa-arrow-right"></i>
          </button>

          <div class="flex items-center justify-center gap-2 mt-3">
            <i class="fas fa-shield-alt text-coelho-gold text-xs"></i>
            <p class="text-gray-400 text-xs">
              Pago contra entrega — pagas al recibir tu pedido
            </p>
          </div>
        </div>
      </aside>

      <div id="cart-toast"
           class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80]
                  bg-coelho-gold text-white text-sm font-semibold px-5 py-3
                  opacity-0 pointer-events-none transition-all duration-300 shadow-xl
                  flex items-center gap-2">
        <i class="fas fa-check-circle"></i>
        <span id="cart-toast-msg"></span>
      </div>
    `;
    document.body.appendChild(drawer);
  },

  _bindGlobalEvents() {
    document.querySelectorAll('[aria-label="Carrito de compras"]').forEach(btn => {
      btn.addEventListener('click', () => this.openDrawer());
    });
  },

  openDrawer() {
    document.getElementById('cart-overlay').classList.remove('opacity-0', 'pointer-events-none');
    document.getElementById('cart-overlay').classList.add('opacity-100');
    document.getElementById('cart-panel').classList.remove('translate-x-full');
    document.body.style.overflow = 'hidden';
  },

  closeDrawer() {
    document.getElementById('cart-overlay').classList.add('opacity-0', 'pointer-events-none');
    document.getElementById('cart-overlay').classList.remove('opacity-100');
    document.getElementById('cart-panel').classList.add('translate-x-full');
    document.body.style.overflow = '';
  },

  showToast(msg) {
    const toast = document.getElementById('cart-toast');
    document.getElementById('cart-toast-msg').textContent = msg;
    toast.classList.remove('opacity-0');
    toast.classList.add('opacity-100');
    setTimeout(() => {
      toast.classList.add('opacity-0');
      toast.classList.remove('opacity-100');
    }, 2800);
  },

  render() {
    this._renderItems();
    this._renderTotal();
    this._renderBadge();
  },

  _renderBadge() {
    const count = this.itemCount;
    document.querySelectorAll('[aria-label="Carrito de compras"] span').forEach(el => {
      el.textContent = count;
    });
    const badge = document.getElementById('cart-count-badge');
    if (badge) badge.textContent = count;
  },

  _renderTotal() {
    const el = document.getElementById('cart-total');
    if (el) el.textContent = this.formatPrice(this.state.totalAmount);
    const btn = document.getElementById('btn-checkout');
    if (btn) btn.disabled = this.state.lines.length === 0;
  },

  _renderItems() {
    const container = document.getElementById('cart-items');
    if (!container) return;

    if (this.state.lines.length === 0) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full py-16 text-center">
          <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <i class="fas fa-shopping-bag text-coelho-gold text-2xl"></i>
          </div>
          <p class="text-gray-400 text-sm">Tu carrito está vacío</p>
          <button onclick="CoelhoCart.closeDrawer()"
                  class="mt-4 text-coelho-gold text-sm underline hover:text-yellow-400 transition">
            Seguir explorando
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = this.state.lines.map(line => {
      const merch = line.merchandise;
      const img = merch.product.images.edges[0]?.node.url || './assets/images/placeholder.png';
      const price = parseFloat(merch.price.amount);
      const currency = merch.price.currencyCode;

      return `
        <div class="flex gap-4 bg-white/5 p-3 border border-white/10 group relative">
          <div class="w-20 h-20 bg-black flex-shrink-0 overflow-hidden">
            <img src="${img}" alt="${merch.product.title}"
                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-white text-sm font-semibold truncate">${merch.product.title}</p>
            <p class="text-gray-400 text-xs mb-2">${merch.title !== 'Default Title' ? merch.title : ''}</p>
            <p class="text-coelho-gold text-sm font-bold">${this.formatPrice(price, currency)}</p>
            <div class="flex items-center gap-2 mt-2">
              <button onclick="CoelhoCart._changeQty('${line.id}', ${line.quantity - 1})"
                      class="w-6 h-6 bg-white/10 hover:bg-white/20 text-white text-xs flex items-center justify-center transition">
                <i class="fas fa-minus"></i>
              </button>
              <span class="text-white text-sm w-4 text-center">${line.quantity}</span>
              <button onclick="CoelhoCart._changeQty('${line.id}', ${line.quantity + 1})"
                      class="w-6 h-6 bg-white/10 hover:bg-white/20 text-white text-xs flex items-center justify-center transition">
                <i class="fas fa-plus"></i>
              </button>
            </div>
          </div>
          <div class="flex flex-col items-end justify-between">
            <button onclick="CoelhoCart.removeItem('${line.id}')"
                    class="text-gray-500 hover:text-red-400 transition text-xs">
              <i class="fas fa-trash"></i>
            </button>
            <p class="text-white text-xs font-semibold">
              ${this.formatPrice(price * line.quantity, currency)}
            </p>
          </div>
        </div>
      `;
    }).join('');
  },

  async _changeQty(lineId, newQty) {
    if (newQty <= 0) await this.removeItem(lineId);
    else await this.updateItem(lineId, newQty);
  },
};

window.CoelhoCart = CoelhoCart;