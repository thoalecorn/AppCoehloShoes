'use strict';
const CONFIG = {
    scrollOffset: 80,
    scrollTopThreshold: 300,
    observerThreshold: 0.1,
    observerRootMargin: '0px 0px -100px 0px',
    animationDuration: 800
};

const Utils = {
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },
    smoothScrollTo(element, offset = CONFIG.scrollOffset) {
        const elementPosition = element.offsetTop - offset;
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }
};

const Navigation = {
    navbar: null,
    menuBtn: null,
    lastScroll: 0,

    init() {
        this.navbar = document.getElementById('navbar');
        this.menuBtn = document.getElementById('menuBtn');
        
        this.setupScrollEffect();
        this.setupSmoothScroll();
        this.setupMobileMenu();
    },

    setupScrollEffect() {
        window.addEventListener('scroll', Utils.debounce(() => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 50) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }
            
            this.lastScroll = currentScroll;
        }, 10));
    },

    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    Utils.smoothScrollTo(target);
                }
            });
        });
    },

    setupMobileMenu() {
        if (this.menuBtn) {
            this.menuBtn.addEventListener('click', () => {
                alert('Menú móvil - Por implementar según diseño específico');
            });
        }
    }
};

const ScrollToTop = {
    button: null,

    init() {
        this.button = document.getElementById('scrollTop');
        if (!this.button) return;

        this.setupScrollListener();
        this.setupClickHandler();
    },

    setupScrollListener() {
        window.addEventListener('scroll', Utils.debounce(() => {
            if (window.pageYOffset > CONFIG.scrollTopThreshold) {
                this.show();
            } else {
                this.hide();
            }
        }, 100));
    },

    setupClickHandler() {
        this.button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    },

    show() {
        this.button.style.opacity = '1';
        this.button.style.pointerEvents = 'auto';
    },

    hide() {
        this.button.style.opacity = '0';
        this.button.style.pointerEvents = 'none';
    }
};

const Parallax = {
    elements: [],

    init() {
        this.elements = document.querySelectorAll('.bunny-watermark');
        if (this.elements.length === 0) return;

        this.setupScrollListener();
    },

    setupScrollListener() {
        window.addEventListener('scroll', Utils.debounce(() => {
            const scrolled = window.pageYOffset;
            
            this.elements.forEach((el, index) => {
                const speed = 0.3 + (index * 0.1);
                el.style.transform = `translateY(${scrolled * speed}px) rotate(${index * 12}deg)`;
            });
        }, 10));
    }
};

const CursorGlow = {
    glow: null,

    init() {
        if (window.innerWidth <= 768) return;

        document.addEventListener('mousemove', (e) => {
            if (!this.glow) {
                this.createGlow();
            }
            this.updatePosition(e.clientX, e.clientY);
        });
    },

    createGlow() {
        this.glow = document.createElement('div');
        this.glow.className = 'cursor-glow';
        document.body.appendChild(this.glow);
    },

    updatePosition(x, y) {
        if (this.glow) {
            this.glow.style.left = `${x}px`;
            this.glow.style.top = `${y}px`;
        }
    }
};

const Newsletter = {
    form: null,

    init() {
        this.form = document.querySelector('form');
        if (!this.form) return;

        this.setupSubmitHandler();
    },

    setupSubmitHandler() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = this.form.querySelector('input[type="email"]').value;
            alert(`¡Gracias por suscribirte! Te enviaremos un correo a: ${email}`);
            this.form.reset();
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Navigation.init();
    ScrollToTop.init();
    Parallax.init();
    CursorGlow.init();
    Newsletter.init();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Utils,
        Navigation,
        ScrollToTop,
        Parallax,
        CursorGlow,
        Newsletter
    };
}
