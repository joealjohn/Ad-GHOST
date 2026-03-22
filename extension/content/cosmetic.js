/**
 * AdGuard — Cosmetic Filtering Content Script
 * Hides ad elements on regular websites. 
 * Does NOT run aggressive selectors on YouTube (YouTube has its own content script).
 */

(function() {
  'use strict';

  let enabled = true;

  try {
    chrome.storage.local.get(['state', 'pausedSites'], (data) => {
      if (chrome.runtime.lastError) {
         init();
         return;
      }
      const state = data.state;
      const pausedSites = data.pausedSites || [];
      const isPaused = pausedSites.includes(location.hostname);
      
      if (state) enabled = state.enabled;
      
      if (!enabled || isPaused) {
        enabled = false;
      } else {
        init();
      }
    });
  } catch {
    init();
  }

  try {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === 'STATE_CHANGED') {
        enabled = msg.enabled;
        if (!location.hostname.includes('youtube.com')) {
          toggleCosmeticCSS(enabled);
        }
      }
    });
  } catch {}

  function init() {
    // Skip YouTube — it has its own dedicated content script
    if (location.hostname.includes('youtube.com')) return;

    toggleCosmeticCSS(enabled);
    if (enabled) removeAdIframes();
  }

  /**
   * CSS to hide common ad containers (non-YouTube sites only)
   */
  function toggleCosmeticCSS(enable) {
    let style = document.getElementById('adguard-cosmetic');
    if (!enable) {
      if (style) style.remove();
      return;
    }
    if (!style) {
      style = document.createElement('style');
      style.id = 'adguard-cosmetic';
      style.textContent = `
      /* Generic eXtreme Testing & Universal Cosmetic Rules */
      .ad, .ads, .ad-box, .ad-banner, .advertisement,
      .interstitial, .interstitial-ad, .overlay-ad,
      .push-ad, .in-page-push, .push-notification-ad,
      .native-ad, .sponsored-post, .promoted-post,
      .banner-ad, .ad-container, .ad-slot, .ad-wrapper,
      .popunder, .popunder-ad, .pop-under,
      [id^="ad-"], [class^="ad-"],
      [id*="-ad-"], [class*="-ad-"],
      [id$="-ad"], [class$="-ad"],
      [id^="banner-"], [class^="banner-"],
      [id*="advertisement"], [class*="advertisement"],
      [id*="sponsored"], [class*="sponsored"],
      [href*="/ad.php"], [href*="/click.php?ad="],
      
      /* Google Ads & Specific Ad Networks */
      ins.adsbygoogle, .adsbygoogle,
      [id^="google_ads_"],
      [id^="div-gpt-ad"],
      [data-ad-slot], [data-ad-client],
      div[id*="GoogleActiveViewElement"] {
        display: none !important;
        position: absolute !important;
        left: -10000px !important;
        top: -10000px !important;
        width: 1px !important;
        height: 1px !important;
        opacity: 0 !important;
        pointer-events: none !important;
        z-index: -9999 !important;
      }

      /* Ad iframes */
      iframe[src*="doubleclick.net"],
      iframe[src*="googlesyndication.com"],
      iframe[src*="googleadservices.com"],
      iframe[src*="amazon-adsystem.com"],
      iframe[src*="taboola.com"],
      iframe[src*="outbrain.com"] {
        display: none !important;
      }

      /* Taboola / Outbrain widgets */
      .trc_rbox,
      .OUTBRAIN,
      [id^="taboola-"],
      [class*="taboola-"],
      [class*="outbrain-widget"] {
        display: none !important;
      }
    `;
      document.head?.appendChild(style);
    }
  }

  /**
   * Remove known ad iframes from the DOM
   */
  function removeAdIframes() {
    const adDomains = [
      'doubleclick.net', 'googlesyndication.com', 'googleadservices.com',
      'amazon-adsystem.com', 'taboola.com', 'outbrain.com',
      'adnxs.com', 'criteo.com', 'pubmatic.com'
    ];

    document.querySelectorAll('iframe').forEach(iframe => {
      const src = iframe.src || '';
      if (adDomains.some(d => src.includes(d))) {
        iframe.style.display = 'none';
        try { chrome.runtime.sendMessage({ type: 'AD_BLOCKED' }).catch(() => {}); } catch {}
      }
    });
  }
})();
