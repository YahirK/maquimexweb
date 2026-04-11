/**
 * MAQUIMEX - Main JavaScript
 * Handles navigation, scroll effects, and form handling
 */

document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    const header = document.getElementById('header');
    const navToggle = document.getElementById('navToggle');
    const navList = document.querySelector('.nav__list');
    const navLinks = document.querySelectorAll('.nav__link');
    const contactForm = document.getElementById('contactForm');

    // ============================================
    // Mobile Navigation Toggle
    // ============================================
    if (navToggle && navList) {
        navToggle.addEventListener('click', function() {
            navList.classList.toggle('active');
            navToggle.classList.toggle('active');
            
            // Update aria-label for accessibility
            const isOpen = navList.classList.contains('active');
            navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
        });

        // Close menu when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navList.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navList.contains(e.target)) {
                navList.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    }

    // ============================================
    // Header Scroll Effect
    // ============================================
    let lastScrollY = window.scrollY;
    
    function updateHeader() {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
        
        lastScrollY = currentScrollY;
    }

    // Throttle scroll events for performance
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                updateHeader();
                updateActiveNavLink();
                ticking = false;
            });
            ticking = true;
        }
    });

    // ============================================
    // Active Navigation Link on Scroll
    // ============================================
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 200;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // ============================================
    // Smooth Scroll for Anchor Links
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                const headerHeight = header.offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============================================
    // Contact Form Handling
    // ============================================
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const phone = formData.get('phone');
            const message = formData.get('message');
            
            // Validate form
            if (!name || !email || !message) {
                showNotification('Por favor, complete todos los campos requeridos.', 'error');
                return;
            }
            
            // Since we don't have a backend, redirect to WhatsApp with the message
            const whatsappMessage = encodeURIComponent(
                `*Nuevo mensaje de contacto*\n\n` +
                `*Nombre:* ${name}\n` +
                `*Email:* ${email}\n` +
                `*Teléfono:* ${phone || 'No proporcionado'}\n\n` +
                `*Mensaje:*\n${message}`
            );
            
            const whatsappURL = `https://wa.me/529995677293?text=${whatsappMessage}`;
            
            // Show confirmation and redirect
            showNotification('¡Gracias! Te redirigiremos a WhatsApp para enviar tu mensaje.', 'success');
            
            setTimeout(() => {
                window.open(whatsappURL, '_blank');
                contactForm.reset();
            }, 1500);
        });
    }

    // ============================================
    // Notification System
    // ============================================
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <p>${message}</p>
            <button class="notification__close" aria-label="Cerrar">&times;</button>
        `;
        
        // Add styles dynamically (if not already in CSS)
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            max-width: 350px;
            padding: 16px 20px;
            border-radius: 8px;
            background-color: ${type === 'error' ? '#dc3545' : '#28a745'};
            color: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            animation: slideIn 0.3s ease;
        `;
        
        // Add close functionality
        const closeBtn = notification.querySelector('.notification__close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            line-height: 1;
        `;
        closeBtn.addEventListener('click', () => notification.remove());
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // Add animation keyframes
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(styleSheet);

    // ============================================
    // Intersection Observer for Animations
    // ============================================
    if ('IntersectionObserver' in window) {
        const animatedElements = document.querySelectorAll('.service-card, .brand-card, .value-prop');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        animatedElements.forEach(el => {
            el.style.animationPlayState = 'paused';
            observer.observe(el);
        });
    }

    // ============================================
    // Gallery Filter
    // ============================================
    const filterBtns = document.querySelectorAll('.gallery__filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                // Update active button
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                const filter = this.dataset.filter;

                galleryItems.forEach((item, index) => {
                    const match = filter === 'all' || item.dataset.category === filter;
                    if (match) {
                        item.classList.remove('hidden');
                        item.style.animationDelay = (index * 0.05) + 's';
                    } else {
                        item.classList.add('hidden');
                    }
                });
            });
        });
    }

    // ============================================
    // Lightbox
    // ============================================
    const lightbox    = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxTitle   = document.getElementById('lightboxTitle');
    const lightboxCat     = document.getElementById('lightboxCat');
    const lightboxCounter = document.getElementById('lightboxCounter');
    const lightboxClose   = document.getElementById('lightboxClose');
    const lightboxPrev    = document.getElementById('lightboxPrev');
    const lightboxNext    = document.getElementById('lightboxNext');
    const lightboxBackdrop = document.getElementById('lightboxBackdrop');

    let currentLightboxIndex = 0;

    function getVisibleItems() {
        return [...document.querySelectorAll('.gallery-item:not(.hidden)')];
    }

    function openLightbox(clickedItem) {
        const visible = getVisibleItems();
        currentLightboxIndex = visible.indexOf(clickedItem);
        updateLightboxContent(visible);
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (lightboxClose) lightboxClose.focus();
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function updateLightboxContent(visible) {
        if (!visible || visible.length === 0) return;
        const item = visible[currentLightboxIndex];
        const img  = item.querySelector('img');

        // Fade transition
        lightboxImg.style.opacity = '0';
        setTimeout(() => {
            lightboxImg.src = img.src.replace(/w=\d+/, 'w=1200');
            lightboxImg.alt = img.alt;
            lightboxImg.style.opacity = '1';
        }, 150);

        lightboxTitle.textContent   = item.dataset.title || '';
        lightboxCat.textContent     = item.querySelector('.gallery-item__category')?.textContent || '';
        lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${visible.length}`;
    }

    function lightboxNavigate(direction) {
        const visible = getVisibleItems();
        currentLightboxIndex = (currentLightboxIndex + direction + visible.length) % visible.length;
        updateLightboxContent(visible);
    }

    // Attach click to each gallery item
    if (galleryItems.length > 0) {
        galleryItems.forEach(item => {
            item.addEventListener('click', () => openLightbox(item));
        });
    }

    if (lightbox) {
        lightboxClose?.addEventListener('click', closeLightbox);
        lightboxBackdrop?.addEventListener('click', closeLightbox);
        lightboxPrev?.addEventListener('click', () => lightboxNavigate(-1));
        lightboxNext?.addEventListener('click', () => lightboxNavigate(1));

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape')      closeLightbox();
            if (e.key === 'ArrowLeft')   lightboxNavigate(-1);
            if (e.key === 'ArrowRight')  lightboxNavigate(1);
        });

        // Touch/swipe support
        let touchStartX = 0;
        lightbox.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
        lightbox.addEventListener('touchend', e => {
            const diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) lightboxNavigate(diff > 0 ? 1 : -1);
        }, { passive: true });
    }

    // ============================================
    // Initialize
    // ============================================
    updateHeader();
    updateActiveNavLink();

    console.log('MAQUIMEX website initialized successfully');
});
