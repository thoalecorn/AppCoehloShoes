'use strict';
function ProductCard({ id, titulo, precio, descripcion, imagenes }) {
  return `
    <article
      class="product-card bg-white shadow-lg overflow-hidden fade-in group cursor-pointer"
      data-product-id="${id}"
    >
      <div class="relative h-80 bg-gray-100 overflow-hidden">
        <img
          src="${imagenes[0]}"
          alt="${titulo}"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          crossorigin="anonymous"
          onerror="this.style.backgroundColor='#f0f0f0'"
        />
      </div>
      <div class="p-6">
        <h3 class="text-xl font-semibold text-coelho-dark mb-2">${titulo}</h3>
        <p class="text-gray-600 text-sm mb-4">${descripcion}</p>
        <div class="flex items-center justify-between gap-4">
          <span class="text-xl font-bold text-coelho-gold">
            $${precio.toLocaleString('es-CO')}
          </span>

          <!--  Botón directo en la card — stopPropagation evita abrir el modal -->
          <button
            class="btn-add-cart bg-coelho-gold hover:bg-coelho-dark text-white
                   text-xs font-bold px-4 py-2 uppercase tracking-wider transition-colors duration-200
                   flex items-center gap-2"
            onclick="addToCart(event, ${id}, null)"
          >
            <i class="fas fa-shopping-cart"></i>
            Agregar
          </button>
        </div>
      </div>
    </article>
  `;
}

function ProductModal(producto) {
  const {
    id, titulo, precio, descripcionDetallada,
    color, colores, tallas, tallaSeleccionada,
    sku, referencia, imagenes
  } = producto;

  return `
    <div
      id="productModal"
      data-product-id="${id}"
      data-talla-seleccionada="${tallaSeleccionada}"
      class="fixed inset-0 bg-black bg-opacity-75 z-[100] flex items-center justify-center p-4
             opacity-0 pointer-events-none transition-opacity duration-300"
    >
      <div class="bg-white max-w-6xl w-full max-h-[90vh] overflow-y-auto relative
                  transform scale-95 transition-transform duration-300">

        <button
          onclick="closeProductModal()"
          class="absolute top-4 right-4 z-10 bg-white w-10 h-10 flex items-center justify-center
                 hover:bg-coelho-gold hover:text-white transition shadow-lg"
          aria-label="Cerrar"
        >
          <i class="fas fa-times text-xl"></i>
        </button>

        <div class="grid md:grid-cols-2 gap-8 p-8">

          <!-- GALERÍA -->
          <div class="space-y-4">
            <div class="relative bg-gray-100 overflow-hidden"
                style="aspect-ratio: 16/9;">
              <img 
                id="mainImage" 
                src="${imagenes[0]}" 
                alt="${titulo}"
                class="w-full h-full object-contain"
                onerror="this.src='./assets/images/placeholder.png'"
              />
            </div>
            <div class="grid grid-cols-4 gap-2">
              ${imagenes.map((img, index) => `
                <button
                  class="thumbnail-btn aspect-square bg-gray-100 overflow-hidden border-2
                         ${index === 0 ? 'border-coelho-gold' : 'border-transparent'}
                         hover:border-coelho-gold transition"
                  onclick="changeMainImage('${img}', event)"
                >
                  <img
                    src="${img}"
                    alt="Vista ${index + 1}"
                    class="w-full h-full object-cover"
                    onerror="this.src='./assets/images/placeholder.png'"
                  >
                </button>
              `).join('')}
            </div>
          </div>

          <div class="space-y-6">

            <div class="text-sm text-gray-500">SKU: ${sku}</div>

            <div>
              <h2 class="text-3xl md:text-4xl font-bold text-coelho-dark mb-4">${titulo}</h2>
              <div class="text-3xl font-bold text-coelho-gold">
                $${precio.toLocaleString('es-CO')}
              </div>
            </div>

            <!-- Color -->
            <div>
              <div class="text-sm font-semibold text-coelho-dark mb-2 uppercase">
                Color: ${color}
              </div>
              ${colores.length > 1 ? `
                <div class="flex flex-wrap gap-2">
                  ${colores.map(colorOption => `
                    <button
                      class="color-btn px-4 py-2 border font-medium transition
                             ${colorOption === color
                               ? 'bg-black text-white border-black'
                               : 'border-gray-300 hover:border-coelho-gold'}"
                      onclick="selectColor('${colorOption}', event)"
                    >${colorOption}</button>
                  `).join('')}
                </div>
              ` : ''}
            </div>

            <!-- Talla -->
            <div>
              <div class="text-sm font-semibold text-coelho-dark mb-2 uppercase">
                Talla: <span id="talla-label">${tallaSeleccionada}</span>
              </div>
              <div class="flex flex-wrap gap-2">
                ${tallas.map(talla => `
                  <button
                    class="talla-btn px-4 py-2 border font-medium transition
                           ${talla === tallaSeleccionada
                             ? 'bg-black text-white border-black'
                             : 'border-gray-300 hover:border-coelho-gold'}"
                    onclick="selectTalla('${talla}', event)"
                  >${talla}</button>
                `).join('')}
              </div>
            </div>

            <!-- Referencia -->
            <div class="bg-gray-50 p-4">
              <div class="text-sm font-semibold text-coelho-dark mb-1 uppercase">Referencia:</div>
              <div class="font-bold">${referencia}</div>
            </div>

            <!-- Cantidad + Botón -->
            <div class="flex gap-4">
              <div class="flex items-center border border-gray-300">
                <button class="w-10 h-12 hover:bg-gray-100 transition" onclick="decrementQuantity()">
                  <i class="fas fa-minus text-sm"></i>
                </button>
                <input
                  type="number"
                  id="quantity"
                  value="1"
                  min="1"
                  class="w-16 h-12 text-center border-x border-gray-300 focus:outline-none"
                  readonly
                />
                <button class="w-10 h-12 hover:bg-gray-100 transition" onclick="incrementQuantity()">
                  <i class="fas fa-plus text-sm"></i>
                </button>
              </div>

              <!--onclick corregido — llama a addToCartFromModal() -->
              <button
                id="btn-add-modal"
                class="flex-1 bg-coelho-gold text-white px-8 py-3 font-bold
                       hover:bg-coelho-dark transition uppercase tracking-wide
                       flex items-center justify-center gap-2"
                onclick="addToCartFromModal(event)"
              >
                <i class="fas fa-shopping-cart"></i>
                Añadir al carrito
              </button>
            </div>

            <!-- Descripción -->
            <div class="pt-6 border-t">
              <h3 class="text-lg font-bold text-coelho-dark mb-3">Descripción</h3>
              <p class="text-gray-600 leading-relaxed">${descripcionDetallada}</p>
            </div>
            
            ${producto.shopifyData?.tags ? `
              <div class="pt-4 border-t">
                <div class="flex flex-wrap gap-2">
                  ${producto.shopifyData.tags.split(',').map(tag => `
                    <span class="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium uppercase">
                      ${tag.trim()}
                    </span>
                  `).join('')}
                </div>
              </div>
            ` : ''}

          </div>
        </div>
      </div>
    </div>
  `;
}

function openProductModal(productId) {
  const producto = ProductManagerStorefront.getProductById(productId);
  if (!producto) { console.error('Producto no encontrado:', productId); return; }

  document.body.insertAdjacentHTML('beforeend', ProductModal(producto));

  requestAnimationFrame(() => {
    const modal = document.getElementById('productModal');
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.querySelector('.bg-white').classList.remove('scale-95');
    document.body.style.overflow = 'hidden';
  });
}

function closeProductModal() {
  const modal = document.getElementById('productModal');
  if (!modal) return;
  modal.classList.add('opacity-0');
  modal.querySelector('.bg-white').classList.add('scale-95');
  setTimeout(() => { modal.remove(); document.body.style.overflow = ''; }, 300);
}

function changeMainImage(src, event) {
  document.getElementById('mainImage').src = src;
  document.querySelectorAll('.thumbnail-btn').forEach(btn => {
    btn.classList.remove('border-coelho-gold');
    btn.classList.add('border-transparent');
  });
  event.currentTarget.classList.replace('border-transparent', 'border-coelho-gold');
}

function selectColor(color, event) {
  document.querySelectorAll('.color-btn').forEach(btn => {
    btn.classList.remove('bg-black', 'text-white', 'border-black');
    btn.classList.add('border-gray-300');
  });
  event.currentTarget.classList.add('bg-black', 'text-white', 'border-black');
  event.currentTarget.classList.remove('border-gray-300');
}

function selectTalla(talla, event) {
  document.querySelectorAll('.talla-btn').forEach(btn => {
    btn.classList.remove('bg-black', 'text-white', 'border-black');
    btn.classList.add('border-gray-300');
  });
  event.currentTarget.classList.add('bg-black', 'text-white', 'border-black');
  event.currentTarget.classList.remove('border-gray-300');

  const modal = document.getElementById('productModal');
  if (modal) {
    modal.dataset.tallaSeleccionada = talla;
    const label = document.getElementById('talla-label');
    if (label) label.textContent = talla;
  }
}


function incrementQuantity() {
  const input = document.getElementById('quantity');
  input.value = parseInt(input.value) + 1;
}

function decrementQuantity() {
  const input = document.getElementById('quantity');
  if (parseInt(input.value) > 1) input.value = parseInt(input.value) - 1;
}

async function addToCartFromModal(event) {
  const modal = document.getElementById('productModal');
  if (!modal) return;

  const productId = parseInt(modal.dataset.productId);
  const tallaSeleccionada = modal.dataset.tallaSeleccionada;
  const quantity = parseInt(document.getElementById('quantity').value) || 1;

  const producto = ProductManagerStorefront.getProductById(productId);
  if (!producto) return;

  const btn = document.getElementById('btn-add-modal');
  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Agregando...`;

  try {
    for (let i = 0; i < quantity; i++) {
      await Card.addItem(producto, tallaSeleccionada);
    }
    CoelhoCart.openDrawer();
  } catch (err) {
    CoelhoCart.showToast('Error al agregar. Intenta de nuevo.');
    console.error('addToCartFromModal error:', err);
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeProductModal();
});

document.addEventListener('DOMContentLoaded', () => {
  console.log('App.js inicializado');
  if (typeof ProductManagerStorefront !== 'undefined') {
    ProductManagerStorefront.init();
  } else {
    console.error('ProductManagerStorefront no disponible. Verifica que shopify-storefront.js esté cargado.');
  }
});

window.ProductCard = ProductCard;
window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
window.changeMainImage = changeMainImage;
window.selectColor = selectColor;
window.selectTalla = selectTalla;
window.incrementQuantity = incrementQuantity;
window.decrementQuantity = decrementQuantity;
window.addToCartFromModal = addToCartFromModal;
window.addToCard = addToCartFromModal;