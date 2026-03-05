(() => {
  'use strict';

  /* ---------------------------
     Helpers
  --------------------------- */
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

  // Basit güvenli metin (XSS riskini azaltır)
  const escapeHTML = (str) => {
    if (str == null) return '';
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  };

  // Background görseli: inline style yerine CSS değişkeni (daha temiz)
  const setBg = (el, url) => {
    if (!el) return;
    const safe = url ? `url("${String(url).replaceAll('"', '\\"')}")` : 'none';
    el.style.setProperty('--bg', safe);
  };

  const getQueryParam = (name) => new URL(window.location.href).searchParams.get(name);

  // Tek formatter instance (performans)
  const dtfTR = new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const formatDateTR = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return dtfTR.format(d);
  };

  /* ---------------------------
     1) Preloader (daha sağlam)
  --------------------------- */
  const initPreloader = () => {
    const preloader = qs('#preloader');
    if (!preloader) return;

    const KEY = 'introGosterildi';
    try {
      if (sessionStorage.getItem(KEY) === 'true') {
        preloader.remove();
        return;
      }

      // küçük gecikme (logo görünsün)
      window.setTimeout(() => {
        preloader.style.transition = 'opacity 300ms ease, visibility 300ms ease';
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';

        window.setTimeout(() => preloader.remove(), 320);
        sessionStorage.setItem(KEY, 'true');
      }, 650);

    } catch {
      // Incognito / storage kapalıysa
      preloader.remove();
    }
  };

  /* ---------------------------
     2) News Data (normalize)
  --------------------------- */
  const loadNews = () => {
    const data = window.NEWS_DATA;
    if (!Array.isArray(data)) return [];

    // Tarihi bir kez parse edip sakla
    const normalized = data
      .map((x) => {
        const dateObj = new Date(x?.date);
        return {
          ...x,
          _dateObj: Number.isNaN(dateObj.getTime()) ? new Date(0) : dateObj,
          // Güvenli metin alanları
          _safeTitle: escapeHTML(x?.title),
          _safeCategory: escapeHTML(x?.category),
          _safeExcerpt: escapeHTML(x?.excerpt),
          // Görsel url'yi stringe çevir (boş olabilir)
          _img: x?.image ? String(x.image) : ''
        };
      })
      .sort((a, b) => b._dateObj - a._dateObj);

    return normalized;
  };

  /* ---------------------------
     3) Render: Home News
     - INLINE style yerine CSS class
  --------------------------- */
  const renderHomeNews = (items) => {
    const featuredEl = qs('#homeNewsFeatured');
    const sideEl = qs('#homeNewsSide');
    if (!featuredEl || !sideEl) return;

    const top = items.slice(0, 3);
    if (!top.length) {
      featuredEl.innerHTML = `<div class="content-card text-center">Henüz haber eklenmedi.</div>`;
      sideEl.innerHTML = '';
      return;
    }

    const [a, b, c] = top;

    // Featured
    featuredEl.innerHTML = `
      <a href="haber-detay.html?id=${encodeURIComponent(a.id)}" class="news-overlay-card h-100">
        <div class="news-overlay-bg"></div>
        <div class="news-overlay-gradient"></div>
        <div class="news-overlay-content">
          <span class="news-overlay-date">${a._safeCategory}</span>
          <h3 class="news-overlay-title">${a._safeTitle}</h3>
          <p class="text-white opacity-75 mb-0 d-none d-md-block">${a._safeExcerpt}</p>
        </div>
      </a>
    `;

    setBg(qs('.news-overlay-bg', featuredEl), a._img);

    // Side cards (küçük)
    const smallCardHTML = (x) => `
      <div class="col-12">
        <a href="haber-detay.html?id=${encodeURIComponent(x.id)}" class="news-overlay-card news-overlay-card--sm">
          <div class="news-overlay-bg"></div>
          <div class="news-overlay-gradient"></div>
          <div class="news-overlay-content news-overlay-content--sm">
            <span class="news-overlay-date news-overlay-date--sm">${x._safeCategory}</span>
            <h3 class="news-overlay-title news-overlay-title--sm">${x._safeTitle}</h3>
          </div>
        </a>
      </div>
    `;

    sideEl.innerHTML = `${b ? smallCardHTML(b) : ''}${c ? smallCardHTML(c) : ''}`;

    // bg set
    const sideCards = qsa('.news-overlay-card--sm', sideEl);
    sideCards.forEach((card) => {
      const id = new URL(card.href).searchParams.get('id');
      const item = items.find(n => String(n.id) === String(id));
      if (item) setBg(qs('.news-overlay-bg', card), item._img);
    });
  };

  /* ---------------------------
     4) Render: News List
  --------------------------- */
  const renderNewsPage = (items) => {
    const listEl = qs('#newsList');
    if (!listEl) return;

    if (!items.length) {
      listEl.innerHTML = `<div class="col-12"><div class="content-card text-center">Henüz haber eklenmedi.</div></div>`;
      return;
    }

    listEl.innerHTML = items.map(x => `
      <div class="col-lg-4 col-md-6 mb-4">
        <div class="news-card">
          <div class="news-img"></div>
          <div class="news-body">
            <span class="news-date">${formatDateTR(x._dateObj)}</span>
            <h3 class="news-title">${x._safeTitle}</h3>
            <p class="news-desc">${x._safeExcerpt}</p>
            <a href="haber-detay.html?id=${encodeURIComponent(x.id)}" class="news-btn mt-auto">
              Haberi Oku <i class="bi bi-arrow-right"></i>
            </a>
          </div>
        </div>
      </div>
    `).join('');

    // img bg’leri tek turda bas
    qsa('.news-card .news-img', listEl).forEach((imgEl, i) => {
      setBg(imgEl, items[i]?._img);
    });
  };

  /* ---------------------------
     5) Render: News Detail
     Not: item.content HTML ise (sen yazıyorsan sorun yok),
     ama dışarıdan geliyorsa sanitize gerekir.
  --------------------------- */
  const renderNewsDetail = (items) => {
    const detailEl = qs('#newsDetail');
    if (!detailEl) return;

    const id = getQueryParam('id');
    const item = items.find(x => String(x.id) === String(id));

    const titleEl = qs('#detailTitle');
    const metaEl = qs('#detailMeta');

    if (!item) {
      if (titleEl) titleEl.textContent = 'Haber bulunamadı';
      if (metaEl) metaEl.textContent = 'Hata';
      detailEl.innerHTML = `
        <div class="content-card text-center">
          <p class="mb-0">Aradığınız haber bulunamadı veya yayından kaldırılmış olabilir.</p>
          <a href="haberler.html" class="btn-teklif mt-4">Haberlere Dön</a>
        </div>
      `;
      return;
    }

    if (titleEl) titleEl.textContent = item.title ?? '';
    if (metaEl) metaEl.textContent = `${formatDateTR(item._dateObj)} • ${item.category ?? ''}`;

    // content HTML kullanıyorsan (sen yazıyorsan okay)
    const bodyHtml = item.content ? item.content : `<p class="lead">${item._safeExcerpt}</p>`;

    detailEl.innerHTML = `
      <div class="content-card mt-0 border-0 shadow-none px-0">
        <div class="news-detail-cover"></div>
        <div class="mt-5 fs-5" style="color: var(--text);">
          ${bodyHtml}
        </div>
      </div>
    `;

    setBg(qs('.news-detail-cover', detailEl), item._img);
  };

  /* ---------------------------
     6) Navbar Scroll
  --------------------------- */
  const initNavbarScroll = () => {
    const navbar = qs('.navbar');
    if (!navbar) return;

    const onScroll = () => navbar.classList.toggle('is-scrolled', window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  };

  /* ---------------------------
     7) Counter (reduced-motion destekli)
  --------------------------- */
  const initCounters = () => {
    const counters = qsa('.stat-val[data-target]');
    if (!counters.length) return;

    // Reduced motion: direkt hedef yaz
    if (prefersReducedMotion) {
      counters.forEach(el => {
        const target = Number(el.getAttribute('data-target'));
        const suffix = el.dataset.suffix || '';
        if (Number.isFinite(target)) el.textContent = `${target}${suffix}`;
      });
      return;
    }

    const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const animateCounter = (el) => {
      const target = Number(el.getAttribute('data-target'));
      if (!Number.isFinite(target)) return;

      const suffix = el.dataset.suffix || '';
      const duration = Number(el.dataset.duration || 1400);
      const startTime = performance.now();

      const step = (now) => {
        let p = (now - startTime) / duration;
        if (p > 1) p = 1;

        const current = Math.floor(target * easeOutExpo(p));
        el.textContent = `${current}${suffix}`;

        if (p < 1) requestAnimationFrame(step);
        else el.textContent = `${target}${suffix}`;
      };

      requestAnimationFrame(step);
    };

    const obs = new IntersectionObserver((entries, observer) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          animateCounter(e.target);
          observer.unobserve(e.target);
        }
      }
    }, { threshold: 0.3 });

    counters.forEach(c => obs.observe(c));
  };

  /* ---------------------------
     8) Mobile menu close (delegation)
  --------------------------- */
  const initMobileMenuClose = () => {
    const menu = qs('#navbarNav');
    if (!menu) return;

    menu.addEventListener('click', (e) => {
      const link = e.target.closest('a.nav-link');
      if (!link) return;

      // dropdown toggle'a basıldıysa kapatma
      if (link.classList.contains('dropdown-toggle')) return;

      if (menu.classList.contains('show') && window.bootstrap?.Collapse) {
        const inst = bootstrap.Collapse.getOrCreateInstance(menu, { toggle: false });
        inst.hide();
      }
    });
  };

  /* ---------------------------
     9) Boot
  --------------------------- */
  window.addEventListener('load', initPreloader);

  document.addEventListener('DOMContentLoaded', () => {
    initNavbarScroll();
    initCounters();
    initMobileMenuClose();

    const news = loadNews();

    // Sayfada hangi container varsa sadece onu render et
    if (qs('#homeNewsFeatured') || qs('#homeNewsSide')) renderHomeNews(news);
    if (qs('#newsList')) renderNewsPage(news);
    if (qs('#newsDetail')) renderNewsDetail(news);
  });

})();