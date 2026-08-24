/**
 * MQMX — Main JavaScript
 * Architecture: Modular interactive engine
 * Features: Responsive Nav, Projects Carousel, Animated Counters, Modals, WhatsApp Form
 */

document.addEventListener('DOMContentLoaded', function () {

    /* ────────────────────────────────────────────
       1. DOM REFERENCES
    ──────────────────────────────────────────── */
    const header        = document.getElementById('header');
    const navToggle     = document.getElementById('navToggle');
    const navList       = document.getElementById('navList');
    const navLinks      = document.querySelectorAll('.nav__link');
    const contactForm   = document.getElementById('contactForm');

    // Modals
    const privacyModal  = document.getElementById('privacyModal');
    const openPrivacyBtn= document.getElementById('openPrivacyBtn');
    const closePrivacyBtn= document.getElementById('closePrivacyBtn');
    const privacyBackdrop= document.getElementById('privacyBackdrop');
    const confirmPrivacyBtn = document.getElementById('confirmPrivacyBtn');

    const videoModal    = document.getElementById('videoModal');
    const playVideoBtn  = document.getElementById('playVideoBtn');
    const closeVideoBtn = document.getElementById('closeVideoBtn');
    const videoBackdrop = document.getElementById('videoBackdrop');

    // Carousel
    const carouselTrack = document.getElementById('carouselTrack');
    const carouselSlides = document.querySelectorAll('.project-slide');
    const carouselPrevBtn= document.getElementById('carouselPrevBtn');
    const carouselNextBtn= document.getElementById('carouselNextBtn');
    const carouselDotsContainer = document.getElementById('carouselDots');
    const carouselCounter = document.getElementById('carouselCounter');

    let currentSlide = 0;
    const totalSlides = carouselSlides.length;
    let carouselInterval = null;


    /* ────────────────────────────────────────────
       2. MOBILE MENU & ACTIVE NAV
    ──────────────────────────────────────────── */
    if (navToggle && navList) {
        navToggle.addEventListener('click', function () {
            const isOpen = navList.classList.toggle('active');
            navToggle.classList.toggle('active', isOpen);
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navList.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });

        document.addEventListener('click', function (e) {
            if (!navToggle.contains(e.target) && !navList.contains(e.target)) {
                navList.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Header scroll blur & active section highlighter
    let ticking = false;

    function handleScroll() {
        if (window.scrollY > 50) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }

        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 140;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPosition >= top && scrollPosition < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    handleScroll();


    /* ────────────────────────────────────────────
       3. INTERACTIVE PROJECTS CAROUSEL
    ──────────────────────────────────────────── */
    if (carouselSlides.length > 0 && carouselTrack) {

        // Build dots
        if (carouselDotsContainer) {
            carouselDotsContainer.innerHTML = '';
            carouselSlides.forEach((_, idx) => {
                const dot = document.createElement('span');
                dot.className = `carousel-dot ${idx === 0 ? 'active' : ''}`;
                dot.setAttribute('aria-label', `Ir a diapositiva ${idx + 1}`);
                dot.addEventListener('click', () => {
                    goToSlide(idx);
                    resetAutoplay();
                });
                carouselDotsContainer.appendChild(dot);
            });
        }

        function updateSlideUI() {
            carouselSlides.forEach((slide, idx) => {
                slide.classList.toggle('active', idx === currentSlide);
            });

            const dots = document.querySelectorAll('.carousel-dot');
            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === currentSlide);
            });

            if (carouselCounter) {
                const padCurr = String(currentSlide + 1).padStart(2, '0');
                const padTot  = String(totalSlides).padStart(2, '0');
                carouselCounter.textContent = `${padCurr} / ${padTot}`;
            }
        }

        function goToSlide(index) {
            currentSlide = (index + totalSlides) % totalSlides;
            updateSlideUI();
        }

        function nextSlide() {
            goToSlide(currentSlide + 1);
        }

        function prevSlide() {
            goToSlide(currentSlide - 1);
        }

        if (carouselNextBtn) {
            carouselNextBtn.addEventListener('click', () => {
                nextSlide();
                resetAutoplay();
            });
        }

        if (carouselPrevBtn) {
            carouselPrevBtn.addEventListener('click', () => {
                prevSlide();
                resetAutoplay();
            });
        }

        function startAutoplay() {
            carouselInterval = setInterval(nextSlide, 4800);
        }

        function stopAutoplay() {
            if (carouselInterval) clearInterval(carouselInterval);
        }

        function resetAutoplay() {
            stopAutoplay();
            startAutoplay();
        }

        startAutoplay();

        const carouselBox = document.getElementById('projectCarousel');
        if (carouselBox) {
            carouselBox.addEventListener('mouseenter', stopAutoplay);
            carouselBox.addEventListener('mouseleave', startAutoplay);

            // Touch Swipe support
            let touchStartX = 0;
            carouselBox.addEventListener('touchstart', e => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            carouselBox.addEventListener('touchend', e => {
                const diff = touchStartX - e.changedTouches[0].screenX;
                if (Math.abs(diff) > 40) {
                    if (diff > 0) nextSlide();
                    else prevSlide();
                    resetAutoplay();
                }
            }, { passive: true });
        }
    }


    /* ────────────────────────────────────────────
       4. ANIMATED STATS COUNTERS
    ──────────────────────────────────────────── */
    function animateCounter(el, target, duration = 1800) {
        const start = performance.now();
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        const isDecimal = String(target).includes('.');

        function step(now) {
            const progress = Math.min((now - start) / duration, 1);
            // Ease-out expo
            const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const current = isDecimal 
                ? (target * ease).toFixed(1) 
                : Math.round(target * ease);

            // Format thousands
            const formatted = current.toLocaleString('es-MX');
            el.textContent = `${prefix}${formatted}${suffix}`;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = `${prefix}${target.toLocaleString('es-MX')}${suffix}`;
            }
        }
        requestAnimationFrame(step);
    }

    const statsCounters = document.getElementById('statsCounters');
    if (statsCounters && 'IntersectionObserver' in window) {
        let animated = false;
        const statsIO = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !animated) {
                    animated = true;
                    const counters = statsCounters.querySelectorAll('.stat-card__number');
                    counters.forEach(counter => {
                        const rawTarget = parseFloat(counter.dataset.target || counter.textContent.replace(/[^0-9.]/g, ''));
                        if (!isNaN(rawTarget)) {
                            animateCounter(counter, rawTarget, 2000);
                        }
                    });
                    statsIO.unobserve(entry.target);
                }
            });
        }, { threshold: 0.25 });

        statsIO.observe(statsCounters);
    }


    /* ────────────────────────────────────────────
       5. SCROLL REVEAL OBSERVER
    ──────────────────────────────────────────── */
    if ('IntersectionObserver' in window) {
        const revealIO = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealIO.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll('.reveal').forEach(el => revealIO.observe(el));
    } else {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'));
    }


    /* ────────────────────────────────────────────
       6. MODALS HANDLER (PRIVACY & VIDEO)
    ──────────────────────────────────────────── */
    function toggleModal(modal, show) {
        if (!modal) return;
        if (show) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Privacy Modal
    if (openPrivacyBtn) {
        openPrivacyBtn.addEventListener('click', () => toggleModal(privacyModal, true));
    }
    if (closePrivacyBtn) {
        closePrivacyBtn.addEventListener('click', () => toggleModal(privacyModal, false));
    }
    if (privacyBackdrop) {
        privacyBackdrop.addEventListener('click', () => toggleModal(privacyModal, false));
    }
    if (confirmPrivacyBtn) {
        confirmPrivacyBtn.addEventListener('click', () => toggleModal(privacyModal, false));
    }

    // Video Modal
    if (playVideoBtn) {
        playVideoBtn.addEventListener('click', () => toggleModal(videoModal, true));
    }
    if (closeVideoBtn) {
        closeVideoBtn.addEventListener('click', () => toggleModal(videoModal, false));
    }
    if (videoBackdrop) {
        videoBackdrop.addEventListener('click', () => toggleModal(videoModal, false));
    }

    // Escape Key for Modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (privacyModal?.classList.contains('active')) toggleModal(privacyModal, false);
            if (videoModal?.classList.contains('active')) toggleModal(videoModal, false);
        }
    });


    /* ────────────────────────────────────────────
       7. CONTACT FORM → WHATSAPP INTEGRATION
    ──────────────────────────────────────────── */
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = contactForm.name.value.trim();
            const email = contactForm.email.value.trim();
            const phone = contactForm.phone.value.trim();
            const message = contactForm.message.value.trim();

            if (!name || !email || !phone || !message) {
                showToast('Por favor completa todos los campos requeridos.', 'error');
                return;
            }

            const payload = encodeURIComponent(
                `*NUEVA SOLICITUD — MQMX WEB*\n\n` +
                `*Cliente / Contacto:* ${name}\n` +
                `*Email:* ${email}\n` +
                `*Teléfono:* ${phone}\n\n` +
                `*Requerimiento Técnico:* \n${message}\n\n` +
                `_Enviado desde el portal oficial de MQMX_`
            );

            showToast('¡Información validada! Conectando con WhatsApp…', 'success');

            setTimeout(() => {
                window.open(`https://wa.me/529995677293?text=${payload}`, '_blank');
                contactForm.reset();
            }, 900);
        });
    }


    /* ────────────────────────────────────────────
       8. TOAST NOTIFICATION UTILITY
    ──────────────────────────────────────────── */
    function showToast(msg, type = 'info') {
        document.querySelector('.mq-toast')?.remove();

        const toast = document.createElement('div');
        toast.className = 'mq-toast';
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `<span>${msg}</span><button class="mq-toast__close" aria-label="Cerrar">×</button>`;

        const bg = type === 'error' ? '#9e2a2b' : type === 'success' ? '#1b4d3e' : '#141921';
        const border = type === 'error' ? '#d90429' : type === 'success' ? '#25d366' : '#d97736';

        Object.assign(toast.style, {
            position:       'fixed',
            bottom:         '30px',
            left:           '24px',
            maxWidth:       '380px',
            padding:        '14px 18px',
            borderRadius:   '4px',
            background:     bg,
            color:          '#ffffff',
            boxShadow:      '0 12px 36px rgba(0,0,0,0.6)',
            zIndex:         '99999',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            gap:            '14px',
            fontFamily:     '"DM Sans", sans-serif',
            fontSize:       '0.88rem',
            borderLeft:     `4px solid ${border}`,
            animation:      'mqToastIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        });

        const closeBtn = toast.querySelector('.mq-toast__close');
        Object.assign(closeBtn.style, {
            background: 'none',
            border:     'none',
            color:      '#ffffff',
            fontSize:   '1.3rem',
            cursor:     'pointer',
            opacity:    '0.7',
            padding:    '0'
        });
        closeBtn.addEventListener('click', () => toast.remove());
        document.body.appendChild(toast);

        setTimeout(() => toast?.remove(), 4500);
    }

    // Keyframe for toast
    const toastStyle = document.createElement('style');
    toastStyle.textContent = `
        @keyframes mqToastIn {
            from { transform: translateY(100%); opacity: 0; }
            to   { transform: translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(toastStyle);

    /* ────────────────────────────────────────────
       SERVICES IMAGE TAB
    ──────────────────────────────────────────── */
    const serviceRows = document.querySelectorAll('.service-row');
    const servicePhoto = document.querySelector('.services-summary__photo');

    if (serviceRows.length && servicePhoto) {
        serviceRows.forEach(row => {
            row.addEventListener('click', function () {
                // Remove active class from all
                serviceRows.forEach(r => r.classList.remove('active'));
                
                // Add active class to clicked row
                this.classList.add('active');

                // Update image
                const newImg = this.getAttribute('data-img');
                if (newImg) {
                    // Optional: add a tiny fade effect by resetting opacity
                    servicePhoto.style.opacity = '0.5';
                    setTimeout(() => {
                        servicePhoto.src = newImg;
                        servicePhoto.style.opacity = '1';
                    }, 150);
                }
            });
        });
    }

    /* ────────────────────────────────────────────
       ABOUT SECTION — FACTORY CAROUSEL
    ──────────────────────────────────────────── */
    const aboutCarousel = document.getElementById('aboutCarousel');
    const aboutSlides = document.querySelectorAll('.about-carousel__slide');
    const aboutPrevBtn = document.getElementById('aboutPrevBtn');
    const aboutNextBtn = document.getElementById('aboutNextBtn');
    const aboutDotsContainer = document.getElementById('aboutCarouselDots');

    if (aboutCarousel && aboutSlides.length) {
        let currentAboutSlide = 0;
        const totalAboutSlides = aboutSlides.length;
        let aboutInterval = null;

        // Build dots
        if (aboutDotsContainer) {
            aboutDotsContainer.innerHTML = '';
            aboutSlides.forEach((_, idx) => {
                const dot = document.createElement('span');
                dot.className = `about-carousel__dot ${idx === 0 ? 'active' : ''}`;
                dot.setAttribute('aria-label', `Ver foto de fábrica ${idx + 1}`);
                dot.addEventListener('click', (e) => {
                    e.stopPropagation();
                    goToAboutSlide(idx);
                    resetAboutAutoplay();
                });
                aboutDotsContainer.appendChild(dot);
            });
        }

        function updateAboutSlideUI() {
            aboutSlides.forEach((slide, idx) => {
                slide.classList.toggle('active', idx === currentAboutSlide);
            });

            const dots = document.querySelectorAll('.about-carousel__dot');
            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === currentAboutSlide);
            });
        }

        function goToAboutSlide(index) {
            currentAboutSlide = (index + totalAboutSlides) % totalAboutSlides;
            updateAboutSlideUI();
        }

        function nextAboutSlide() {
            goToAboutSlide(currentAboutSlide + 1);
        }

        function prevAboutSlide() {
            goToAboutSlide(currentAboutSlide - 1);
        }

        if (aboutNextBtn) {
            aboutNextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                nextAboutSlide();
                resetAboutAutoplay();
            });
        }

        if (aboutPrevBtn) {
            aboutPrevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                prevAboutSlide();
                resetAboutAutoplay();
            });
        }

        // Clicking the slide advances to next
        aboutSlides.forEach(slide => {
            slide.addEventListener('click', () => {
                nextAboutSlide();
                resetAboutAutoplay();
            });
        });

        // Autoplay every 4.5 seconds
        function startAboutAutoplay() {
            if (aboutInterval) clearInterval(aboutInterval);
            aboutInterval = setInterval(nextAboutSlide, 4500);
        }

        function resetAboutAutoplay() {
            startAboutAutoplay();
        }

        aboutCarousel.addEventListener('mouseenter', () => {
            if (aboutInterval) clearInterval(aboutInterval);
        });

        aboutCarousel.addEventListener('mouseleave', () => {
            startAboutAutoplay();
        });

        startAboutAutoplay();
    }

    console.log('%cMQMX ⚙️  Comercializadora de Maquinaria Industrial & Metallium', 'color:#E66826;font-weight:bold;font-size:13px;');
});

