'use strict';

const ShopifyStorefrontClient = {
  get config() {
    return window.SHOPIFY_STOREFRONT_CONFIG || {
      storeName: 'coelho-shoes',
      storefrontAccessToken: 'd7ef96dd54c658042910f43856d789d7',
      apiVersion: '2026-01'
    };
  },

  get endpoint() {
    return `https://${this.config.storeName}.myshopify.com/api/${this.config.apiVersion}/graphql.json`;
  },

  async graphql(query, variables = {}) {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': this.config.storefrontAccessToken
        },
        body: JSON.stringify({ query, variables })
      });

      if (!response.ok) {
        throw new Error('Error de conexión con el servidor. Intenta de nuevo.');
      }

      const data = await response.json();

      if (data.errors) {
        throw new Error('No se pudo completar la solicitud.');
      }

      return data.data;
    } catch (error) {
      throw error;
    }
  },

  async getProducts(first = 50) {
    const query = `
      query GetProducts($first: Int!) {
        products(first: $first) {
          edges {
            node {
              id
              title
              description
              descriptionHtml
              handle
              vendor
              productType
              tags
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              media(first: 10) {
                edges {
                  node {
                    mediaContentType
                    ... on MediaImage {
                      image { url altText }
                    }
                    ... on Video {
                      sources { url mimeType }
                      previewImage { url }
                    }
                  }
                }
              }
              variants(first: 100) {
                edges {
                  node {
                    id
                    title
                    sku
                    price {
                      amount
                      currencyCode
                    }
                    availableForSale
                    selectedOptions {
                      name
                      value
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const data = await this.graphql(query, { first });
    return data.products;
  },

  async getProductByHandle(handle) {
    const query = `
      query GetProduct($handle: String!) {
        product(handle: $handle) {
          id
          title
          description
          descriptionHtml
          handle
          vendor
          productType
          tags
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          media(first: 10) {
            edges {
              node {
                mediaContentType
                ... on MediaImage {
                  image { url altText }
                }
                ... on Video {
                  sources { url mimeType }
                  previewImage { url }
                }
              }
            }
          }
          variants(first: 100) {
            edges {
              node {
                id
                title
                sku
                price {
                  amount
                  currencyCode
                }
                availableForSale
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
        }
      }
    `;

    const data = await this.graphql(query, { handle });
    return data.product;
  }
};

const StorefrontTransformer = {
  transformProduct(shopifyProduct) {
    if (!shopifyProduct) return null;

    const numericId = this.extractNumericId(shopifyProduct.id);
    const precio = parseFloat(shopifyProduct.priceRange.minVariantPrice.amount);
    const imagenes = [];
    const videos = [];

    shopifyProduct.media.edges.forEach(({ node }) => {
      if (node.mediaContentType === 'IMAGE') {
        imagenes.push(node.image.url);
      } else if (node.mediaContentType === 'VIDEO') {
        videos.push({
          src: node.sources.find(s => s.mimeType === 'video/mp4')?.url || node.sources[0].url,
          poster: node.previewImage?.url || null,
        });
      }
    });

    const variants = shopifyProduct.variants.edges.map(edge => edge.node);

    const coloresSet = new Set();
    const tallasSet = new Set();

    variants.forEach(variant => {
      variant.selectedOptions.forEach(option => {
        const optionName = option.name.toLowerCase();
        if (optionName.includes('color') || optionName.includes('colour')) {
          coloresSet.add(option.value);
        }
        if (optionName.includes('talla') || optionName.includes('size') || optionName.includes('tamaño')) {
          tallasSet.add(option.value);
        }
      });
    });

    const colores = Array.from(coloresSet);
    const tallas = Array.from(tallasSet);
    const colorPrincipal = colores.length > 0 ? colores[0] : 'Color único';
    const tallaPrincipal = tallas.length > 0  ? tallas[0]  : 'Talla única';
    const descripcionCorta = this.extractShortDescription(shopifyProduct.description);
    const primeraVariante = variants[0];
    const sku = primeraVariante?.sku || `COELHO-${numericId}`;

    return {
      id: numericId,
      titulo: shopifyProduct.title,
      precio,
      descripcion: descripcionCorta,
      descripcionDetallada: shopifyProduct.description || 'Producto de alta calidad Coelho.',
      color: colorPrincipal,
      colores: colores.length > 0 ? colores : [colorPrincipal],
      tallas: tallas.length > 0  ? tallas  : [tallaPrincipal],
      tallaSeleccionada: tallaPrincipal,
      sku,
      referencia: `COELHO-${shopifyProduct.handle.toUpperCase()}`,
      imagenes: imagenes.length > 0 ? imagenes : ['./assets/images/placeholder.png'],
      videos, 
      shopifyData: {
        handle:      shopifyProduct.handle,
        vendor:      shopifyProduct.vendor,
        productType: shopifyProduct.productType,
        tags:        shopifyProduct.tags.join(','),
        variants,
        available:   variants.some(v => v.availableForSale)
      }
    };
  },

  extractNumericId(gid) {
    const matches = gid.match(/\/(\d+)$/);
    return matches ? parseInt(matches[1]) : Date.now();
  },

  extractShortDescription(text) {
    if (!text) return 'Calzado de alta calidad';
    return text.length > 100 ? text.substring(0, 97) + '...' : text;
  },

  transformProducts(productsData) {
    if (!productsData || !productsData.edges) return [];
    return productsData.edges
      .map(edge => this.transformProduct(edge.node))
      .filter(product => product !== null);
  }
};

const ProductManagerStorefront = {
  productos: [],
  loading:   false,
  error:     null,

  async init() {
    try {
      this.loading = true;
      this.showLoadingState();

      const productsData = await ShopifyStorefrontClient.getProducts(50);
      this.productos = StorefrontTransformer.transformProducts(productsData);

      this.loading = false;
      this.renderProducts();
    } catch (error) {
      this.loading = false;
      this.error   = error;
      this.showErrorState();
    }
  },

  showLoadingState() {
    const contenedor = document.getElementById('productos');
    if (!contenedor) return;
    contenedor.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center py-20">
        <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-coelho-gold mb-4"></div>
        <p class="text-coelho-gray text-lg">Cargando productos...</p>
      </div>
    `;
  },

  showErrorState() {
    const contenedor = document.getElementById('productos');
    if (!contenedor) return;
    contenedor.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center py-20 bg-red-50 rounded-lg border border-red-200">
        <i class="fas fa-exclamation-triangle text-red-500 text-5xl mb-4"></i>
        <h3 class="text-xl font-bold text-red-700 mb-2">Error al cargar productos</h3>
        <p class="text-red-600 text-center max-w-md mb-4">
          No pudimos conectar con la tienda. Por favor intenta de nuevo.
        </p>
        <button
          onclick="ProductManagerStorefront.init()"
          class="btn-primary px-6 py-3 rounded-none font-semibold"
        >
          Reintentar
        </button>
      </div>
    `;
  },

  renderProducts() {
    const contenedor = document.getElementById('productos');
    if (!contenedor) return;

    if (this.productos.length === 0) {
      contenedor.innerHTML = `
        <div class="col-span-full text-center py-20">
          <i class="fas fa-box-open text-6xl text-coelho-gray mb-4"></i>
          <p class="text-coelho-gray text-xl">No hay productos disponibles</p>
        </div>
      `;
      return;
    }

    contenedor.innerHTML = this.productos
      .map(producto => ProductCard(producto))
      .join('');

    document.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', () => {
        const productId = parseInt(card.dataset.productId);
        openProductModal(productId);
      });
    });
  },

  getProductById(productId) {
    return this.productos.find(p => p.id === productId) || null;
  },

  filterProducts(criteria) {
    return this.productos.filter(producto => {
      if (criteria.color && producto.color !== criteria.color)   return false;
      if (criteria.minPrice && producto.precio < criteria.minPrice) return false;
      if (criteria.maxPrice && producto.precio > criteria.maxPrice) return false;
      if (criteria.talla && !producto.tallas.includes(criteria.talla))       return false;
      return true;
    });
  }
};

window.ProductManagerStorefront = ProductManagerStorefront;
window.ShopifyStorefrontClient  = ShopifyStorefrontClient;