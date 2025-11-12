// script.js
document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const opened = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  // Hero slider
  const slider = document.getElementById('heroSlider');
  const dotsWrap = document.getElementById('heroDots');
  const prevBtn = document.getElementById('prevHero');
  const nextBtn = document.getElementById('nextHero');

  if (slider && dotsWrap && prevBtn && nextBtn) {
    const slides = Array.from(slider.children);
    let current = 0;
    const slideCount = slides.length;
    const AUTOPLAY_INTERVAL = 5000;
    let autoplay = true;
    let timer = null;
    let startX = 0;
    let isDragging = false;

    // Build dots
    function buildDots() {
      dotsWrap.innerHTML = '';
      slides.forEach((_, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = i === 0 ? 'active' : '';
        btn.setAttribute('aria-label', `슬라이드 ${i + 1}`);
        btn.dataset.index = i;
        btn.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(btn);
      });
    }

    function updateDots() {
      Array.from(dotsWrap.children).forEach((b, i) => {
        b.classList.toggle('active', i === current);
      });
    }

    function showSlide(index) {
      const clamped = ((index % slideCount) + slideCount) % slideCount;
      slider.style.transform = `translateX(-${clamped * 100}%)`;
      slides.forEach((s, i) => s.setAttribute('aria-hidden', i !== clamped));
      current = clamped;
      updateDots();
    }

    function prev() { showSlide(current - 1); resetAutoplay(); }
    function next() { showSlide(current + 1); resetAutoplay(); }
    function goTo(i) { showSlide(i); resetAutoplay(); }

    prevBtn.addEventListener('click', prev);
    nextBtn.addEventListener('click', next);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    });

    // Autoplay
    function startAutoplay() {
      if (!autoplay || timer) return;
      timer = setInterval(() => showSlide(current + 1), AUTOPLAY_INTERVAL);
    }
    function stopAutoplay() {
      if (timer) { clearInterval(timer); timer = null; }
    }
    function resetAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    // Pause on hover / focus
    const viewport = slider.parentElement;
    viewport.addEventListener('mouseenter', stopAutoplay);
    viewport.addEventListener('mouseleave', () => { if (autoplay) startAutoplay(); });
    viewport.addEventListener('focusin', stopAutoplay);
    viewport.addEventListener('focusout', () => { if (autoplay) startAutoplay(); });

    // Touch / swipe support
    viewport.addEventListener('touchstart', (e) => {
      stopAutoplay();
      isDragging = true;
      startX = e.touches[0].clientX;
    }, { passive: true });

    viewport.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const dx = e.touches[0].clientX - startX;
      // small drag moves the slider visually for better UX
      slider.style.transition = 'none';
      slider.style.transform = `translateX(calc(-${current * 100}% + ${dx}px))`;
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      isDragging = false;
      slider.style.transition = '';
      const endX = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientX : startX;
      const dx = endX - startX;
      const threshold = Math.max(30, viewport.clientWidth * 0.12);
      if (dx > threshold) prev();
      else if (dx < -threshold) next();
      else showSlide(current);
      if (autoplay) startAutoplay();
    });

    // Accessibility: allow dots to be keyboard-focusable (native buttons already are)
    buildDots();
    showSlide(0);
    if (autoplay) startAutoplay();
  }

  // Lazy-load images attribute (help browsers that don't auto)
  document.querySelectorAll('img:not([loading])').forEach(img => {
    try { img.loading = 'lazy'; } catch (e) { /* ignore */ }
  });
});