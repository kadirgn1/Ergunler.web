(() => {
  'use strict';

  const boot = () => {
    const ui = window.ErgunlerUI;
    if (!ui) return;

    ui.initNavbarScroll();
    ui.initCounters();
    ui.initMobileMenuClose();
    ui.initJobTableFilter();
    ui.applyCorporateContent();
    ui.applyFacilitiesContent();
    ui.applyWhiteCalciteContent();
    ui.applyFacilitiesAdvancedContent();

    if (window.ErgunlerMachine) {
      window.ErgunlerMachine.initMachineParkuru();
    }

    if (window.ErgunlerNews) {
      const news = window.ErgunlerNews.loadNews();

      if (ui.qs('#homeNewsFeatured') || ui.qs('#homeNewsSide')) {
        window.ErgunlerNews.renderHomeNews(news);
      }

      if (ui.qs('#newsList')) {
        window.ErgunlerNews.renderNewsPage(news);
      }

      if (ui.qs('#newsDetail')) {
        window.ErgunlerNews.renderNewsDetail(news);
      }
    }
  };

  window.addEventListener('load', () => {
    if (window.ErgunlerUI) {
      window.ErgunlerUI.initPreloader();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
