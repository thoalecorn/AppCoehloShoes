'use strict';

const ScrollReveal = {
    observer: null,
    options: {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    },

    init() {
        this.createObserver();
        this.observeElements();
    },

    createObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, this.options);
    },

    observeElements() {
        const elements = document.querySelectorAll(
            '.fade-in, .slide-in-left, .slide-in-right, .scroll-reveal'
        );
        
        elements.forEach(el => {
            this.observer.observe(el);
        });
        this.observeProductCards();
    },
    observeProductCards() {
        const productsContainer = document.getElementById('productos');
        
        if (!productsContainer) return;
        const mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.classList && node.classList.contains('product-card')) {
                        setTimeout(() => {
                            node.classList.add('active');
                        }, 50);
                    }
                });
            });
        });

        mutationObserver.observe(productsContainer, {
            childList: true,
            subtree: false
        });

        setTimeout(() => {
            document.querySelectorAll('.product-card').forEach(card => {
                if (!card.classList.contains('active')) {
                    card.classList.add('active');
                }
            });
        }, 100);
    }
};

const StaggerAnimation = {
    init() {
        const groups = document.querySelectorAll('[data-stagger]');
        
        groups.forEach(group => {
            const children = group.children;
            Array.from(children).forEach((child, index) => {
                child.style.transitionDelay = `${index * 0.1}s`;
                child.classList.add('fade-in');
            });
        });
    }
};

const CounterAnimation = {
    counters: [],

    init() {
        this.counters = document.querySelectorAll('.stats-counter');
        if (this.counters.length === 0) return;

        this.setupObserver();
    },

    setupObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.animated) {
                    this.animateCounter(entry.target);
                    entry.target.dataset.animated = 'true';
                }
            });
        }, { threshold: 0.5 });

        this.counters.forEach(counter => observer.observe(counter));
    },

    animateCounter(element) {
        const text = element.textContent;
        const hasPlus = text.includes('+');
        const hasStar = text.includes('★');
        const number = parseFloat(text.replace(/[^0-9.]/g, ''));
        
        if (isNaN(number)) return;

        const duration = 2000;
        const steps = 60;
        const increment = number / steps;
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= number) {
                current = number;
                clearInterval(timer);
            }
            
            let displayValue = hasStar 
                ? current.toFixed(1) 
                : Math.floor(current);
            
            element.textContent = displayValue + (hasPlus ? '+' : '') + (hasStar ? '★' : '');
        }, duration / steps);
    }
};

const TiltEffect = {
    init() {
        const cards = document.querySelectorAll('.product-card, .category-card');
        
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => this.handleMove(e, card));
            card.addEventListener('mouseleave', () => this.handleLeave(card));
        });
    },

    handleMove(e, card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    },

    handleLeave(card) {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    }
};

const LazyLoad = {
    observer: null,

    init() {
        const images = document.querySelectorAll('img[data-src]');
        if (images.length === 0) return;

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                }
            });
        });

        images.forEach(img => this.observer.observe(img));
    },

    loadImage(img) {
        const src = img.getAttribute('data-src');
        if (!src) return;

        img.src = src;
        img.removeAttribute('data-src');
        this.observer.unobserve(img);
    }
};

const TypingAnimation = {
    init() {
        const elements = document.querySelectorAll('[data-typing]');
        
        elements.forEach(el => {
            const text = el.textContent;
            el.textContent = '';
            el.style.opacity = '1';
            
            this.typeText(el, text);
        });
    },

    typeText(element, text, index = 0) {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            setTimeout(() => {
                this.typeText(element, text, index + 1);
            }, 50);
        }
    }
};

const ProgressBar = {
    init() {
        const bars = document.querySelectorAll('[data-progress]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateBar(entry.target);
                }
            });
        }, { threshold: 0.5 });

        bars.forEach(bar => observer.observe(bar));
    },

    animateBar(bar) {
        const progress = bar.getAttribute('data-progress');
        const fill = bar.querySelector('.progress-fill');
        
        if (fill) {
            setTimeout(() => {
                fill.style.width = progress + '%';
            }, 100);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ScrollReveal.init();
    StaggerAnimation.init();
    CounterAnimation.init();
    //TiltEffect.init();
    LazyLoad.init();
    
    console.log('✓ Animations loaded');
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ScrollReveal,
        StaggerAnimation,
        CounterAnimation,
        TiltEffect,
        LazyLoad,
        TypingAnimation,
        ProgressBar
    };
}