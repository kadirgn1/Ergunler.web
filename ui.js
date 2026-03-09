(() => {
  'use strict';

  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const prefersReducedMotion =
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

  const safeJSONParse = (raw, fallback = null) => {
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };

  const getLocalStorageObject = (key, errorMessage) => {
    try {
      return safeJSONParse(localStorage.getItem(key), null);
    } catch (error) {
      console.error(errorMessage, error);
      return null;
    }
  };

  const setTextIfExists = (selector, value) => {
    const element = qs(selector);
    if (element && value) {
      element.textContent = value;
    }
  };

  const applyTextMap = (mapping, data) => {
    if (!data) return;

    Object.entries(mapping).forEach(([selector, key]) => {
      setTextIfExists(selector, data[key]);
    });
  };

  const normTR = (value) =>
    (value ?? '')
      .toString()
      .toLocaleLowerCase('tr-TR')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const initPreloader = () => {
    const preloader = qs('#preloader');
    if (!preloader) return;

    const storageKey = 'introGosterildi';

    try {
      if (sessionStorage.getItem(storageKey) === 'true') {
        preloader.remove();
        return;
      }

      window.setTimeout(() => {
        preloader.style.transition = 'opacity 300ms ease, visibility 300ms ease';
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';

        window.setTimeout(() => preloader.remove(), 320);
        sessionStorage.setItem(storageKey, 'true');
      }, 650);
    } catch {
      preloader.remove();
    }
  };

  const initNavbarScroll = () => {
    const navbar = qs('.navbar');
    if (!navbar) return;

    const onScroll = () => {
      navbar.classList.toggle('is-scrolled', window.scrollY > 50);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  };

  const initCounters = () => {
    const counters = qsa('.stat-val[data-target]');
    if (!counters.length) return;

    if (prefersReducedMotion) {
      counters.forEach((element) => {
        const target = Number(element.getAttribute('data-target'));
        const suffix = element.dataset.suffix || '';

        if (Number.isFinite(target)) {
          element.textContent = `${target}${suffix}`;
        }
      });
      return;
    }

    const easeOutExpo = (progress) =>
      progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

    const animateCounter = (element) => {
      const target = Number(element.getAttribute('data-target'));
      if (!Number.isFinite(target)) return;

      const suffix = element.dataset.suffix || '';
      const duration = Number(element.dataset.duration || 1400);
      const startTime = performance.now();

      const step = (now) => {
        let progress = (now - startTime) / duration;
        if (progress > 1) progress = 1;

        const current = Math.floor(target * easeOutExpo(progress));
        element.textContent = `${current}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          element.textContent = `${target}${suffix}`;
        }
      };

      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          animateCounter(entry.target);
          currentObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.3 }
    );

    counters.forEach((counter) => observer.observe(counter));
  };

  const initMobileMenuClose = () => {
    const menu = qs('#navbarNav');
    if (!menu) return;

    menu.addEventListener('click', (event) => {
      const link = event.target.closest('a.nav-link');
      if (!link || link.classList.contains('dropdown-toggle')) return;

      if (menu.classList.contains('show') && window.bootstrap?.Collapse) {
        const instance = bootstrap.Collapse.getOrCreateInstance(menu, { toggle: false });
        instance.hide();
      }
    });
  };

  const applyCorporateContent = () => {
    const data = getLocalStorageObject(
      'ergunler_corporate_content',
      'Kurumsal veri okunamadı:'
    );

    applyTextMap(
      {
        '#corpPageTitleText': 'pageTitle',
        '#corpPageLeadText': 'pageLead',
        '#corpMainTitleText': 'mainTitle',
        '#corpMainText': 'mainText',
        '#corpVisionText': 'vision',
        '#corpMissionText': 'mission',
        '#corpOperationText': 'operation'
      },
      data
    );
  };

  const applyFacilitiesContent = () => {
    const data = getLocalStorageObject(
      'ergunler_facilities_content',
      'Tesis verisi okunamadı:'
    );

    applyTextMap(
      {
        '#facility1TopText': 'facility1Top',
        '#facility1MainText': 'facility1Main',
        '#facility1Spec1Text': 'facility1Spec1',
        '#facility1Spec2Text': 'facility1Spec2',
        '#facility1Spec3Text': 'facility1Spec3',
        '#facility2TopText': 'facility2Top',
        '#facility2MainText': 'facility2Main',
        '#facility2Spec1Text': 'facility2Spec1',
        '#facility2Spec2Text': 'facility2Spec2',
        '#facility2Spec3Text': 'facility2Spec3',
        '#facility3TopText': 'facility3Top',
        '#facility3MainText': 'facility3Main',
        '#facility3Spec1Text': 'facility3Spec1',
        '#facility3Spec2Text': 'facility3Spec2',
        '#facility3Spec3Text': 'facility3Spec3'
      },
      data
    );
  };

  const applyWhiteCalciteContent = () => {
    const data = getLocalStorageObject(
      'ergunler_facilities_advanced_content',
      'Beyaz kalsit verisi okunamadı:'
    );

    applyTextMap(
      {
        '#facilityWhiteKickerText': 'facilityWhiteKicker',
        '#facilityWhiteTitleText': 'facilityWhiteTitle',
        '#facilityWhiteTextText': 'facilityWhiteText',
        '#facilityWhiteBadge1Text': 'facilityWhiteBadge1',
        '#facilityWhiteBadge2Text': 'facilityWhiteBadge2',
        '#facilityWhiteBadge3Text': 'facilityWhiteBadge3'
      },
      data
    );
  };

  const applyFacilitiesAdvancedContent = () => {
    const data = getLocalStorageObject(
      'ergunler_facilities_advanced_content',
      'Tesis gelişmiş verisi okunamadı:'
    );

    applyTextMap(
      {
        '#facilityAsphaltKickerText': 'facilityAsphaltKicker',
        '#facilityAsphaltTitleText': 'facilityAsphaltTitle',
        '#facilityAsphaltTextText': 'facilityAsphaltText',
        '#facilityAsphaltBadge1Text': 'facilityAsphaltBadge1',
        '#facilityAsphaltBadge2Text': 'facilityAsphaltBadge2',
        '#facilityAsphaltBadge3Text': 'facilityAsphaltBadge3',
        '#facilityGrayKickerText': 'facilityGrayKicker',
        '#facilityGrayTitleText': 'facilityGrayTitle',
        '#facilityGrayTextText': 'facilityGrayText',
        '#facilityGrayBadge1Text': 'facilityGrayBadge1',
        '#facilityGrayBadge2Text': 'facilityGrayBadge2',
        '#facilityGrayBadge3Text': 'facilityGrayBadge3',
        '#facilityWhiteKickerText': 'facilityWhiteKicker',
        '#facilityWhiteTitleText': 'facilityWhiteTitle',
        '#facilityWhiteTextText': 'facilityWhiteText',
        '#facilityWhiteBadge1Text': 'facilityWhiteBadge1',
        '#facilityWhiteBadge2Text': 'facilityWhiteBadge2',
        '#facilityWhiteBadge3Text': 'facilityWhiteBadge3',
        '#facilityAgregaKickerText': 'facilityAgregaKicker',
        '#facilityAgregaTitleText': 'facilityAgregaTitle',
        '#facilityAgregaTextText': 'facilityAgregaText',
        '#facilityAgregaBadge1Text': 'facilityAgregaBadge1',
        '#facilityAgregaBadge2Text': 'facilityAgregaBadge2',
        '#facilityAgregaBadge3Text': 'facilityAgregaBadge3'
      },
      data
    );
  };

  const initJobTableFilter = () => {
    const table = qs('#jobTable');
    const search = qs('#jobSearch');
    const kurumSelect = qs('#jobKurum');
    const countEl = qs('#jobCount');

    if (!table || !search || !kurumSelect || !countEl) return;

    const rows = qsa('tbody tr', table);

    const existingOptions = new Set(
      qsa('option', kurumSelect).map((option) => option.value)
    );

    const uniqueKurums = Array.from(
      new Set(
        rows
          .map((row) => (row.dataset.kurum || '').trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b, 'tr'));

    uniqueKurums.forEach((kurum) => {
      if (existingOptions.has(kurum)) return;

      const option = document.createElement('option');
      option.value = kurum;
      option.textContent = kurum;
      kurumSelect.appendChild(option);
    });

    const applyFilter = () => {
      const query = normTR(search.value).trim();
      const selectedKurum = kurumSelect.value;
      let visibleCount = 0;

      rows.forEach((row) => {
        const text = normTR(row.innerText);
        const matchesKurum =
          selectedKurum === 'all' || (row.dataset.kurum || '') === selectedKurum;
        const matchesSearch = !query || text.includes(query);
        const shouldShow = matchesKurum && matchesSearch;

        row.style.display = shouldShow ? '' : 'none';
        if (shouldShow) visibleCount += 1;
      });

      countEl.textContent = String(visibleCount);
    };

    search.addEventListener('input', applyFilter);
    kurumSelect.addEventListener('change', applyFilter);
    applyFilter();
  };

  window.ErgunlerUI = {
    qs,
    qsa,
    normTR,
    prefersReducedMotion,
    safeJSONParse,
    getLocalStorageObject,
    applyTextMap,
    initPreloader,
    initNavbarScroll,
    initCounters,
    initMobileMenuClose,
    applyCorporateContent,
    applyFacilitiesContent,
    applyWhiteCalciteContent,
    applyFacilitiesAdvancedContent,
    initJobTableFilter
  };
})();
