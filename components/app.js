const productos = [
  {
    id: 1,
    titulo: "Zapato Gris Elegante",
    precio: 230000,
    descripcion: "Zapato elegante para toda ocasión",
    descripcionDetallada: "Diseño moderno y versátil que combina comodidad con estilo. Perfecto para uso diario y ocasiones especiales.",
    color: "Gris",
    colores: ["Gris", "Negro", "Blanco"],
    tallas: ["7 US", "8 US", "9 US", "10 US", "11 US"],
    tallaSeleccionada: "10 US",
    sku: "COELHO-GRY-001",
    referencia: "COELHO-ELEGANTE-01",
    imagenes: [
      "./assets/images/ZapatoNegro.jpeg",
      "./assets/images/Pot1Shoes.png",
      "./assets/images/ZapatoNegro.jpeg",
      "./assets/images/Pot1Shoes.png"
    ]
  },
  {
    id: 2,
    titulo: "Zapato Negro Formal",
    precio: 250000,
    descripcion: "Zapato formal clásico",
    descripcionDetallada: "Elegancia atemporal en cada paso. Ideal para ambientes corporativos y eventos formales.",
    color: "Negro",
    colores: ["Negro", "Gris"],
    tallas: ["7 US", "8 US", "9 US", "10 US"],
    tallaSeleccionada: "9 US",
    sku: "COELHO-BLK-002",
    referencia: "COELHO-FORMAL-02",
    imagenes: [
      "./assets/images/ZapatoNegro.jpeg",
      "./assets/images/Pot1Shoes.png",
      "./assets/images/ZapatoNegro.jpeg"
    ]
  },
  {
    id: 3,
    titulo: "Zapato Blanco Casual",
    precio: 220000,
    descripcion: "Zapato casual urbano",
    descripcionDetallada: "Estilo deportivo refinado para el día a día. Comodidad sin sacrificar la presencia.",
    color: "Blanco",
    colores: ["Blanco", "Gris", "Negro"],
    tallas: ["7 US", "8 US", "9 US", "10 US", "11 US"],
    tallaSeleccionada: "8 US",
    sku: "COELHO-WHT-003",
    referencia: "COELHO-CASUAL-03",
    imagenes: [
      "./assets/images/Pot1Shoes.png",
      "./assets/images/ZapatoNegro.jpeg",
      "./assets/images/Pot1Shoes.png"
    ]
  }
]

function ProductCard({ id, titulo, precio, descripcion, imagenes }) {
  return `
    <article class="product-card bg-white shadow-lg overflow-hidden fade-in group cursor-pointer" data-product-id="${id}">
      <div class="relative h-80 bg-gray-100 overflow-hidden">
        <img
          src="${imagenes[0]}"
          alt="${titulo}"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div class="p-6">
        <h3 class="text-xl font-semibold text-coelho-dark mb-2">
          ${titulo}
        </h3>
        <p class="text-gray-600 text-sm mb-4">
          ${descripcion}
        </p>
        <div class="flex items-center justify-between">
          <span class="text-xl font-bold text-coelho-gold">
            $${precio.toLocaleString('es-CO')}
          </span>
          <button class="text-sm font-semibold tracking-wide hover:text-coelho-gold transition">
            Ver detalle →
          </button>
        </div>
      </div>
    </article>
  `
}

function ProductModal(producto) {
  const { titulo, precio, descripcionDetallada, color, colores, tallas, tallaSeleccionada, sku, referencia, imagenes } = producto

  return `
    <div id="productModal" class="fixed inset-0 bg-black bg-opacity-75 z-[100] flex items-center justify-center p-4 opacity-0 pointer-events-none transition-opacity duration-300">
      <div class="bg-white max-w-6xl w-full max-h-[90vh] overflow-y-auto relative transform scale-95 transition-transform duration-300">
        
        <button 
          onclick="closeProductModal()" 
          class="absolute top-4 right-4 z-10 bg-white w-10 h-10 flex items-center justify-center hover:bg-coelho-gold hover:text-white transition shadow-lg"
          aria-label="Cerrar"
        >
          <i class="fas fa-times text-xl"></i>
        </button>

        <div class="grid md:grid-cols-2 gap-8 p-8">
          
          <!-- GALERÍA DE IMÁGENES -->
          <div class="space-y-4">
            <div class="relative bg-gray-100 aspect-square overflow-hidden">
              <img 
                id="mainImage" 
                src="${imagenes[0]}" 
                alt="${titulo}"
                class="w-full h-full object-cover"
              />
            </div>

            <!-- Miniaturas -->
            <div class="grid grid-cols-4 gap-2">
              ${imagenes.map((img, index) => `
                <button 
                  class="thumbnail-btn aspect-square bg-gray-100 overflow-hidden border-2 ${index === 0 ? 'border-coelho-gold' : 'border-transparent'} hover:border-coelho-gold transition"
                  onclick="changeMainImage('${img}', event)"
                >
                  <img src="${img}" alt="Vista ${index + 1}" class="w-full h-full object-cover">
                </button>
              `).join('')}
            </div>
          </div>

          <div class="space-y-6">
            
            <!-- SKU -->
            <div class="text-sm text-gray-500">
              SKU: ${sku}
            </div>

            <!-- Título y Precio -->
            <div>
              <h2 class="text-3xl md:text-4xl font-bold text-coelho-dark mb-4">
                ${titulo}
              </h2>
              <div class="text-3xl font-bold text-coelho-gold">
                $${precio.toLocaleString('es-CO')}
              </div>
            </div>

            <!-- Color -->
              <div class="text-sm font-semibold text-coelho-dark mb-2 uppercase">
                Color: ${color}
              </div>

            <!-- Talla -->
            <div>
              <div class="text-sm font-semibold text-coelho-dark mb-2 uppercase">
                Talla: ${tallaSeleccionada}
              </div>
              <div class="flex flex-wrap gap-2">
                ${tallas.map(talla => `
                  <button 
                    class="talla-btn px-4 py-2 border ${talla === tallaSeleccionada ? 'bg-black text-white border-black' : 'border-gray-300 hover:border-coelho-gold'} transition font-medium"
                    onclick="selectTalla('${talla}', event)"
                  >
                    ${talla}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Referencia -->
            <div class="bg-gray-50 p-4">
              <div class="text-sm font-semibold text-coelho-dark mb-1 uppercase">
                Referencia:
              </div>
              <div class="font-bold">${referencia}</div>
            </div>

            <!-- Cantidad y Botón -->
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

              <button class="flex-1 bg-coelho-gold text-white px-8 py-3 font-bold hover:bg-coelho-dark transition uppercase tracking-wide">
                Añadir al carrito
              </button>
            </div>

            <!-- Descripción -->
            <div class="pt-6 border-t">
              <h3 class="text-lg font-bold text-coelho-dark mb-3">Descripción</h3>
              <p class="text-gray-600 leading-relaxed">
                ${descripcionDetallada}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  `
}

function openProductModal(productId) {
  const producto = productos.find(p => p.id === productId)
  if (!producto) return

  const modalHTML = ProductModal(producto)
  document.body.insertAdjacentHTML('beforeend', modalHTML)

  // Codigo para poder animar la entrada
  requestAnimationFrame(() => {
    const modal = document.getElementById('productModal')
    modal.classList.remove('opacity-0', 'pointer-events-none')
    modal.querySelector('.bg-white').classList.remove('scale-95')
    document.body.style.overflow = 'hidden'
  })
}

function closeProductModal() {
  const modal = document.getElementById('productModal')
  if (!modal) return

  modal.classList.add('opacity-0')
  modal.querySelector('.bg-white').classList.add('scale-95')
  
  setTimeout(() => {
    modal.remove()
    document.body.style.overflow = ''
  }, 300)
}

function changeMainImage(src, event) {
  const mainImg = document.getElementById('mainImage')
  mainImg.src = src

  document.querySelectorAll('.thumbnail-btn').forEach(btn => {
    btn.classList.remove('border-coelho-gold')
    btn.classList.add('border-transparent')
  })
  event.currentTarget.classList.remove('border-transparent')
  event.currentTarget.classList.add('border-coelho-gold')
}

function selectColor(color) {
  console.log('Color seleccionado:', color)
  // Aquí puedes actualizar el estado o cambiar las imágenes según el color
}

function selectTalla(talla, event) {
  document.querySelectorAll('.talla-btn').forEach(btn => {
    btn.classList.remove('bg-black', 'text-white', 'border-black')
    btn.classList.add('border-gray-300')
  })
  event.currentTarget.classList.add('bg-black', 'text-white', 'border-black')
  event.currentTarget.classList.remove('border-gray-300')
}

function incrementQuantity() {
  const input = document.getElementById('quantity')
  input.value = parseInt(input.value) + 1
}

function decrementQuantity() {
  const input = document.getElementById('quantity')
  if (parseInt(input.value) > 1) {
    input.value = parseInt(input.value) - 1
  }
}

// Cierro el modal con ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeProductModal()
})

document.addEventListener('DOMContentLoaded', () => {
  const contenedor = document.getElementById('productos')

  if (!contenedor) {
    console.error('No se encontró el contenedor #productos')
    return
  }

  contenedor.innerHTML = productos
    .map(producto => ProductCard(producto))
    .join('')

  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => {
      const productId = parseInt(card.dataset.productId)
      openProductModal(productId)
    })
  })
})