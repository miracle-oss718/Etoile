// ============================================
// MON ÉTOILE - Luxury Unisex Accessories
// JavaScript Application
// ============================================

// ============================================
// CURRENCY SYSTEM
// ============================================
const CurrencyManager = {
  // Exchange rates (base: USD)
  rates: {
    USD: { rate: 1, symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
    EUR: { rate: 0.92, symbol: '€', name: 'Euro', flag: '🇪🇺' },
    GBP: { rate: 0.79, symbol: '£', name: 'British Pound', flag: '🇬🇧' },
    NGN: { rate: 1500, symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬' },
    CNY: { rate: 7.24, symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳' },
    JPY: { rate: 151.5, symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
    CAD: { rate: 1.36, symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
    AUD: { rate: 1.52, symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
    CHF: { rate: 0.90, symbol: 'Fr', name: 'Swiss Franc', flag: '🇨🇭' },
    AED: { rate: 3.67, symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪' },
    INR: { rate: 83.5, symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
    ZAR: { rate: 18.9, symbol: 'R', name: 'South African Rand', flag: '🇿🇦' },
    SGD: { rate: 1.35, symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬' },
    KRW: { rate: 1350, symbol: '₩', name: 'South Korean Won', flag: '🇰🇷' },
    BRL: { rate: 5.15, symbol: 'R$', name: 'Brazilian Real', flag: '🇧🇷' }
  },

  currentCurrency: 'USD',

  init() {
    const saved = localStorage.getItem('monetoile_currency');
    if (saved && this.rates[saved]) {
      this.currentCurrency = saved;
    }
    this.updateUI();
    this.setupEventListeners();
  },

  setupEventListeners() {
    // Currency selector in navbar
    const selector = document.getElementById('currencySelect');
    if (selector) {
      selector.value = this.currentCurrency;
      selector.addEventListener('change', (e) => {
        this.setCurrency(e.target.value);
      });
    }

    // Currency modal options
    document.querySelectorAll('.currency-option').forEach(option => {
      option.addEventListener('click', () => {
        const code = option.dataset.currency;
        this.setCurrency(code);
        this.closeModal();
      });
    });

    // Modal triggers
    const modalTrigger = document.getElementById('currencyModalTrigger');
    if (modalTrigger) {
      modalTrigger.addEventListener('click', () => this.openModal());
    }

    const modalClose = document.getElementById('currencyModalClose');
    if (modalClose) {
      modalClose.addEventListener('click', () => this.closeModal());
    }

    // Close modal on overlay click
    const modal = document.getElementById('currencyModal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal();
      });
    }
  },

  setCurrency(code) {
    if (!this.rates[code]) return;
    this.currentCurrency = code;
    localStorage.setItem('monetoile_currency', code);
    this.updateUI();
    this.updateAllPrices();

    // Update selector if exists
    const selector = document.getElementById('currencySelect');
    if (selector) selector.value = code;

    Toast.show(`Currency changed to ${this.rates[code].name} (${code})`);
  },

  convert(amount, from = 'USD') {
    const fromRate = this.rates[from].rate;
    const toRate = this.rates[this.currentCurrency].rate;
    const converted = (amount / fromRate) * toRate;
    return Math.round(converted * 100) / 100;
  },

  format(amount, code = null) {
    const currency = code || this.currentCurrency;
    const info = this.rates[currency];
    const converted = this.convert(amount);

    // Format based on currency
    let formatted;
    if (currency === 'JPY' || currency === 'KRW' || currency === 'NGN') {
      formatted = converted.toLocaleString('en-US', { maximumFractionDigits: 0 });
    } else {
      formatted = converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    return `${info.symbol}${formatted}`;
  },

  updateAllPrices() {
    document.querySelectorAll('[data-price-usd]').forEach(el => {
      const usdPrice = parseFloat(el.dataset.priceUsd);
      if (!isNaN(usdPrice)) {
        el.textContent = this.format(usdPrice);
      }
    });

    // Update cart total
    Cart.updateTotal();
  },

  updateUI() {
    // Update currency modal active state
    document.querySelectorAll('.currency-option').forEach(option => {
      option.classList.toggle('active', option.dataset.currency === this.currentCurrency);
    });
  },

  openModal() {
    const modal = document.getElementById('currencyModal');
    if (modal) modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeModal() {
    const modal = document.getElementById('currencyModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
  }
};

// ============================================
// SHOPPING CART
// ============================================
const Cart = {
  items: [],

  init() {
    const saved = localStorage.getItem('monetoile_cart');
    if (saved) {
      try {
        this.items = JSON.parse(saved);
      } catch (e) {
        this.items = [];
      }
    }
    this.updateUI();
    this.setupEventListeners();
  },

  setupEventListeners() {
    // Cart toggle
    const cartToggle = document.getElementById('cartToggle');
    const cartClose = document.getElementById('cartClose');
    const cartOverlay = document.getElementById('cartOverlay');

    if (cartToggle) cartToggle.addEventListener('click', () => this.open());
    if (cartClose) cartClose.addEventListener('click', () => this.close());
    if (cartOverlay) cartOverlay.addEventListener('click', () => this.close());
  },

  add(product) {
    const existing = this.items.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += product.quantity || 1;
    } else {
      this.items.push({ ...product, quantity: product.quantity || 1 });
    }
    this.save();
    this.updateUI();
    Toast.show(`${product.name} added to cart`);
  },

  remove(id) {
    this.items = this.items.filter(item => item.id !== id);
    this.save();
    this.updateUI();
  },

  updateQuantity(id, quantity) {
    const item = this.items.find(item => item.id === id);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.save();
      this.updateUI();
    }
  },

  getTotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  getCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  },

  save() {
    localStorage.setItem('monetoile_cart', JSON.stringify(this.items));
  },

  open() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    if (sidebar) sidebar.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.renderItems();
  },

  close() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  },

  updateUI() {
    // Update cart count badge
    const countEl = document.getElementById('cartCount');
    if (countEl) {
      const count = this.getCount();
      countEl.textContent = count;
      countEl.style.display = count > 0 ? 'flex' : 'none';
    }
  },

  updateTotal() {
    const totalEl = document.getElementById('cartTotal');
    if (totalEl) {
      totalEl.textContent = CurrencyManager.format(this.getTotal());
    }
  },

  renderItems() {
    const container = document.getElementById('cartItems');
    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <p>Your cart is empty</p>
          <a href="products.html" class="btn btn-outline" style="margin-top: 20px;">Continue Shopping</a>
        </div>
      `;
      this.updateTotal();
      return;
    }

    container.innerHTML = this.items.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price" data-price-usd="${item.price}">${CurrencyManager.format(item.price)}</div>
          <div style="margin-top: 8px; color: var(--gray); font-size: 0.8rem;">Qty: ${item.quantity}</div>
        </div>
        <button class="cart-item-remove" onclick="Cart.remove('${item.id}')">×</button>
      </div>
    `).join('');

    this.updateTotal();
  }
};

// ============================================
// TOAST NOTIFICATIONS
// ============================================
const Toast = {
  container: null,

  init() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  },

  show(message, duration = 3000) {
    if (!this.container) this.init();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span class="toast-icon">✦</span>
      <span class="toast-message">${message}</span>
    `;

    this.container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, duration);
  }
};

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================
const Navbar = {
  init() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });

    // Mobile menu
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn && navLinks) {
      mobileBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
      });
    }

    // Active nav link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
      if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
      }
    });
  }
};

// ============================================
// SCROLL ANIMATIONS
// ============================================
const ScrollAnimations = {
  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => {
      observer.observe(el);
    });
  }
};

// ============================================
// PRODUCT FILTERS
// ============================================
const ProductFilters = {
  init() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        // Update active button
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Filter products
        productCards.forEach(card => {
          const category = card.dataset.category;
          if (filter === 'all' || category === filter) {
            card.style.display = 'block';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 50);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 300);
          }
        });
      });
    });
  }
};

// ============================================
// PRODUCT DETAIL PAGE
// ============================================
const ProductDetail = {
  init() {
    // Image gallery
    const mainImg = document.getElementById('productMainImg');
    const thumbs = document.querySelectorAll('.product-thumb');

    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        if (mainImg) {
          mainImg.src = thumb.src;
          thumbs.forEach(t => t.classList.remove('active'));
          thumb.classList.add('active');
        }
      });
    });

    // Quantity controls
    const qtyInput = document.getElementById('quantityInput');
    const qtyMinus = document.getElementById('qtyMinus');
    const qtyPlus = document.getElementById('qtyPlus');

    if (qtyMinus && qtyInput) {
      qtyMinus.addEventListener('click', () => {
        qtyInput.value = Math.max(1, parseInt(qtyInput.value) - 1);
      });
    }

    if (qtyPlus && qtyInput) {
      qtyPlus.addEventListener('click', () => {
        qtyInput.value = parseInt(qtyInput.value) + 1;
      });
    }

    // Add to cart
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', () => {
        const product = {
          id: addToCartBtn.dataset.id,
          name: addToCartBtn.dataset.name,
          price: parseFloat(addToCartBtn.dataset.price),
          image: addToCartBtn.dataset.image,
          quantity: parseInt(qtyInput?.value || 1)
        };
        Cart.add(product);
      });
    }
  }
};

// ============================================
// BOOKING FORM
// ============================================
const BookingForm = {
  init() {
    const form = document.getElementById('bookingForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      // Simulate booking submission
      Toast.show('Booking submitted successfully! We will contact you shortly.');
      form.reset();
    });

    // Date validation
    const dateInput = document.getElementById('bookingDate');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.setAttribute('min', today);
    }
  }
};





// ============================================
// QUICK ADD TO CART (from product cards)
// ============================================
function quickAddToCart(button) {
  const product = {
    id: button.dataset.id,
    name: button.dataset.name,
    price: parseFloat(button.dataset.price),
    image: button.dataset.image,
    quantity: 1
  };
  Cart.add(product);
}

// ============================================
// INITIALIZE EVERYTHING
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  CurrencyManager.init();
  Cart.init();
  Toast.init();
  Navbar.init();
  ScrollAnimations.init();
  ProductFilters.init();
  ProductDetail.init();
  BookingForm.init();
});

function setupForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const response = await fetch("https://formspree.io/f/mzdlgydz", {
      method: "POST",
      body: new FormData(form),
      headers: {
        "Accept": "application/json"
      }
    });

    if (response.ok) {
      window.location.href = "thank.html";
    } else {
      alert("Something went wrong. Please try again.");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupForm("newsletterForm");
  setupForm("contactForm");
});