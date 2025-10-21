// js/header.js
(() => {
  const mqMobile = window.matchMedia('(max-width: 1084px)');
  const headerBar = document.querySelector('.td-header__bar');

  // ---- Centre the desktop nav by mirroring logo width on the left ----
  const brandEl  = document.querySelector('.td-header__brand');
  const spacerEl = document.querySelector('.td-header__spacer');

  function syncSpacer() {
    if (!spacerEl) return;
    if (mqMobile.matches) { spacerEl.style.width = '0px'; return; }
    spacerEl.style.width = (brandEl ? brandEl.offsetWidth : 0) + 'px';
  }
  window.addEventListener('resize', syncSpacer);
  if ('ResizeObserver' in window && brandEl) new ResizeObserver(syncSpacer).observe(brandEl);
  syncSpacer();

  // ---- Mobile drawer (burger -> cross) ----
  const drawer    = document.getElementById('td-mobile-drawer');
  const toggleBtn = document.querySelector('.td-menu-toggle');
  const labelEl   = toggleBtn ? toggleBtn.querySelector('.td-menu-toggle__label') : null;

  function headerHeight(){ return headerBar ? headerBar.offsetHeight : 0; }
  function drawerTargetHeight(){
    if (!drawer) return 0;
    const maxOpen = Math.max(0, window.innerHeight - headerHeight());
    drawer.style.maxHeight = 'none';
    return Math.min(drawer.scrollHeight, maxOpen);
  }
  function openMenu(){
    if (!drawer || !toggleBtn) return;
    drawer.classList.add('is-open');
    toggleBtn.classList.add('is-open');
    toggleBtn.setAttribute('aria-expanded','true');
    if (labelEl) labelEl.textContent = 'Close';
    document.body.classList.add('td-no-scroll');
    requestAnimationFrame(() => { drawer.style.maxHeight = drawerTargetHeight() + 'px'; });
  }
  function closeMenu(){
    if (!drawer || !toggleBtn) return;
    drawer.style.maxHeight = '0px';
    drawer.classList.remove('is-open');
    toggleBtn.classList.remove('is-open');
    toggleBtn.setAttribute('aria-expanded','false');
    if (labelEl) labelEl.textContent = 'Menu';
    document.body.classList.remove('td-no-scroll');
  }
  if (toggleBtn && drawer) {
    toggleBtn.addEventListener('click', () => {
      drawer.classList.contains('is-open') ? closeMenu() : openMenu();
    });
    // Keep height smooth when submenu (<details>) toggles
    drawer.addEventListener('toggle', (e) => {
      if (e.target && e.target.tagName === 'DETAILS' && drawer.classList.contains('is-open')) {
        requestAnimationFrame(() => requestAnimationFrame(() => {
          drawer.style.maxHeight = drawerTargetHeight() + 'px';
        }));
      }
    }, true);
    window.addEventListener('resize', () => {
      if (drawer.classList.contains('is-open')) {
        drawer.style.maxHeight = drawerTargetHeight() + 'px';
      }
    });
  }

  // ---- Desktop dropdown ARIA + click-to-open for touch/hybrids ----
  const items = Array.from(document.querySelectorAll('.td-has-sub'));
  function closeAllDropdowns(){ items.forEach(li => li.classList.remove('is-open')); }

  items.forEach(li => {
    const btn = li.querySelector('.td-nav__trigger');
    if (!btn) return;

    // Hover/focus semantics
    li.addEventListener('mouseenter', () => btn.setAttribute('aria-expanded','true'));
    li.addEventListener('mouseleave', () => { btn.setAttribute('aria-expanded','false'); li.classList.remove('is-open'); });
    li.addEventListener('focusin',  () => btn.setAttribute('aria-expanded','true'));
    li.addEventListener('focusout', () => btn.setAttribute('aria-expanded','false'));

    // Click toggle (ignored on mobile — mobile uses drawer)
    btn.addEventListener('click', (e) => {
      if (mqMobile.matches) return;
      const open = li.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) items.filter(x => x !== li).forEach(x => x.classList.remove('is-open'));
      e.preventDefault();
    });
  });

  document.addEventListener('click', (e) => {
    if (mqMobile.matches) return;
    if (!e.target.closest('.td-has-sub')) closeAllDropdowns();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAllDropdowns(); });
})();

