/* ==========================================================================
   Віденський блакитний кролик — script.js
   Функціонал: navbar scroll, мобільне меню, reveal animations,
               counter animation, back-to-top, smooth scroll, gallery lightbox
   ========================================================================== */

(function () {
    'use strict';

    /* -----------------------------------------------------------------------
       1. NAVBAR — зміна стилю при скролі + мобільне меню
    ----------------------------------------------------------------------- */
    const navbar = document.getElementById('navbar');
    const burger = document.getElementById('burgerBtn');
    const navLinks = document.getElementById('navLinks');

    function handleNavbarScroll() {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleNavbarScroll, { passive: true });
    handleNavbarScroll();

    // Бургер-меню
    burger.addEventListener('click', function () {
        burger.classList.toggle('open');
        navbar.classList.toggle('open');
        document.body.style.overflow = navbar.classList.contains('open') ? 'hidden' : '';
    });

    // Закрити меню при кліку на посилання
    navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            burger.classList.remove('open');
            navbar.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // Закрити меню при кліку поза ним
    document.addEventListener('click', function (e) {
        if (navbar.classList.contains('open') &&
            !navbar.contains(e.target)) {
            burger.classList.remove('open');
            navbar.classList.remove('open');
            document.body.style.overflow = '';
        }
    });


    /* -----------------------------------------------------------------------
       2. REVEAL ANIMATIONS — поява елементів при скролі (IntersectionObserver)
    ----------------------------------------------------------------------- */
    const revealEls = document.querySelectorAll('.reveal, .reveal-right');

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        revealObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
        );

        revealEls.forEach(function (el) {
            revealObserver.observe(el);
        });
    } else {
        // Fallback для старих браузерів
        revealEls.forEach(function (el) { el.classList.add('visible'); });
    }


    /* -----------------------------------------------------------------------
       3. COUNTER ANIMATION — анімація цифр у stats-strip
    ----------------------------------------------------------------------- */
    function animateCounter(el, target, duration) {
        var start = 0;
        var startTime = null;
        var isFloat = String(target).includes('.');

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            // easeOut
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = start + (target - start) * eased;
            el.textContent = isFloat
                ? current.toFixed(1)
                : Math.round(current);
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target;
            }
        }
        requestAnimationFrame(step);
    }

    var statsTriggered = false;
    var statNums = document.querySelectorAll('.stat-num');

    function triggerCounters() {
        if (statsTriggered) return;
        var strip = document.querySelector('.stats-strip');
        if (!strip) return;
        var rect = strip.getBoundingClientRect();
        if (rect.top < window.innerHeight - 80) {
            statsTriggered = true;
            statNums.forEach(function (el) {
                var value = parseFloat(el.getAttribute('data-value'));
                if (!isNaN(value)) {
                    animateCounter(el, value, 1600);
                }
            });
        }
    }

    window.addEventListener('scroll', triggerCounters, { passive: true });
    triggerCounters(); // на випадок якщо strip одразу у viewport


    /* -----------------------------------------------------------------------
       4. BACK TO TOP — кнопка «нагору»
    ----------------------------------------------------------------------- */
    var backToTop = document.getElementById('backToTop');

    window.addEventListener('scroll', function () {
        if (window.scrollY > 400) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }, { passive: true });

    backToTop.addEventListener('click', function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });


    /* -----------------------------------------------------------------------
       5. SMOOTH SCROLL для усіх якірних посилань
    ----------------------------------------------------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;
            var target = document.querySelector(targetId);
            if (!target) return;
            e.preventDefault();
            var navH = navbar ? navbar.offsetHeight : 70;
            var y = target.getBoundingClientRect().top + window.scrollY - navH - 12;
            window.scrollTo({ top: y, behavior: 'smooth' });
        });
    });


    /* -----------------------------------------------------------------------
       6. ACTIVE NAV LINK — підсвічування активного розділу
    ----------------------------------------------------------------------- */
    var sections = document.querySelectorAll('section[id], header[id]');
    var navAnchors = document.querySelectorAll('.navbar__links a[href^="#"]');

    function updateActiveLink() {
        var scrollPos = window.scrollY + 120;
        var current = '';

        sections.forEach(function (sec) {
            if (sec.offsetTop <= scrollPos) {
                current = '#' + sec.id;
            }
        });

        navAnchors.forEach(function (a) {
            a.style.color = '';
            a.style.background = '';
            if (a.getAttribute('href') === current) {
                a.style.color = '#ffffff';
                a.style.background = 'rgba(255,255,255,0.15)';
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink, { passive: true });
    updateActiveLink();


    /* -----------------------------------------------------------------------
       7. GALLERY LIGHTBOX — простий лайтбокс для галереї
    ----------------------------------------------------------------------- */
    var galleryItems = document.querySelectorAll('.gallery-item');

    // Створити оверлей один раз
    var lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Збільшене зображення');
    lightbox.style.cssText = [
        'display:none',
        'position:fixed',
        'inset:0',
        'z-index:9999',
        'background:rgba(10,18,30,0.92)',
        'align-items:center',
        'justify-content:center',
        'padding:20px',
        'cursor:zoom-out',
        'backdrop-filter:blur(8px)'
    ].join(';');

    var lbImg = document.createElement('img');
    lbImg.style.cssText = [
        'max-width:90vw',
        'max-height:88vh',
        'border-radius:12px',
        'box-shadow:0 24px 80px rgba(0,0,0,0.6)',
        'object-fit:contain',
        'cursor:default'
    ].join(';');

    var lbCaption = document.createElement('p');
    lbCaption.style.cssText = [
        'position:absolute',
        'bottom:28px',
        'left:50%',
        'transform:translateX(-50%)',
        'color:rgba(255,255,255,0.7)',
        'font-size:0.88rem',
        'letter-spacing:0.04em',
        'text-align:center',
        'pointer-events:none',
        'white-space:nowrap'
    ].join(';');

    var lbClose = document.createElement('button');
    lbClose.innerHTML = '✕';
    lbClose.setAttribute('aria-label', 'Закрити');
    lbClose.style.cssText = [
        'position:absolute',
        'top:20px',
        'right:24px',
        'background:rgba(255,255,255,0.12)',
        'border:none',
        'color:white',
        'font-size:1.2rem',
        'width:40px',
        'height:40px',
        'border-radius:50%',
        'cursor:pointer',
        'display:flex',
        'align-items:center',
        'justify-content:center',
        'transition:background 0.2s'
    ].join(';');

    lbClose.addEventListener('mouseenter', function () {
        lbClose.style.background = 'rgba(255,255,255,0.25)';
    });
    lbClose.addEventListener('mouseleave', function () {
        lbClose.style.background = 'rgba(255,255,255,0.12)';
    });

    lightbox.appendChild(lbImg);
    lightbox.appendChild(lbCaption);
    lightbox.appendChild(lbClose);
    document.body.appendChild(lightbox);

    function openLightbox(src, alt) {
        lbImg.src = src;
        lbImg.alt = alt || '';
        lbCaption.textContent = alt || '';
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        lbClose.focus();
    }

    function closeLightbox() {
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
    }

    galleryItems.forEach(function (item) {
        var img = item.querySelector('img');
        if (!img) return;
        item.style.cursor = 'pointer';
        item.addEventListener('click', function () {
            openLightbox(img.src, img.alt);
        });
        item.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(img.src, img.alt);
            }
        });
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', 'Переглянути: ' + (img.alt || 'фото'));
    });

    lbClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && lightbox.style.display !== 'none') {
            closeLightbox();
        }
    });


    /* -----------------------------------------------------------------------
       8. TIMELINE HOVER — підсвічування кроків
    ----------------------------------------------------------------------- */
    document.querySelectorAll('.timeline-step').forEach(function (step) {
        step.addEventListener('mouseenter', function () {
            step.style.cursor = 'default';
        });
    });


    /* -----------------------------------------------------------------------
       9. STAGGERED ANIMATION для списку карток
    ----------------------------------------------------------------------- */
    function applyStagger(selector, delay) {
        document.querySelectorAll(selector).forEach(function (el, i) {
            el.style.transitionDelay = (i * (delay || 100)) + 'ms';
        });
    }

    applyStagger('.appear-card', 80);
    applyStagger('.prod-card', 100);
    applyStagger('.care-card', 80);
    applyStagger('.health-card', 100);
    applyStagger('.gallery-item', 60);


    /* -----------------------------------------------------------------------
       10. ТАБЛИЦЯ — highlight рядка при наведенні (доповнення до CSS)
    ----------------------------------------------------------------------- */
    document.querySelectorAll('.growth-table tbody tr').forEach(function (row) {
        row.addEventListener('mouseenter', function () {
            row.style.fontWeight = '600';
        });
        row.addEventListener('mouseleave', function () {
            row.style.fontWeight = '';
        });
    });


    /* -----------------------------------------------------------------------
       11. SCROLL PROGRESS BAR — смужка прогресу читання
    ----------------------------------------------------------------------- */
    var progressBar = document.createElement('div');
    progressBar.style.cssText = [
        'position:fixed',
        'top:0',
        'left:0',
        'height:3px',
        'background:linear-gradient(90deg,#b87333,#d4956a)',
        'z-index:2000',
        'transition:width 0.1s linear',
        'pointer-events:none'
    ].join(';');
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', function () {
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var scrolled = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
        progressBar.style.width = scrolled + '%';
    }, { passive: true });


    /* -----------------------------------------------------------------------
       12. КАРТКОВІ hover — легке підняття prod-list елементів
    ----------------------------------------------------------------------- */
    document.querySelectorAll('.prod-list li').forEach(function (li) {
        li.addEventListener('mouseenter', function () {
            li.style.color = 'var(--text-dark)';
        });
        li.addEventListener('mouseleave', function () {
            li.style.color = '';
        });
    });

    /* -----------------------------------------------------------------------
       Ініціалізація завершена
    ----------------------------------------------------------------------- */
    console.log('🐇 Vídenský Blakytny — скрипт ініціалізовано успішно.');

})();