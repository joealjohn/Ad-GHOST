/**
 * YouTube Ad Handler — Ghost Mode Ultimate Stable
 * No JSON interception. No network blocking. No popups.
 * Pure, sub-frame DOM scrubbing for 100% crash-proof ad skipping.
 */

(function() {
  'use strict';

  // Inject CSS to hide all cosmetic/feed ads on YouTube instantly
  function injectCosmeticCSS() {
    if (document.getElementById('adguard-yt-cosmetic')) return;
    const style = document.createElement('style');
    style.id = 'adguard-yt-cosmetic';
    style.textContent = `
      ytd-ad-slot-renderer,
      ytd-rich-item-renderer:has(ytd-ad-slot-renderer),
      ytd-in-feed-ad-layout-renderer,
      ytd-rich-section-renderer:has(ytd-ad-slot-renderer),
      #masthead-ad,
      ytd-banner-promo-renderer,
      ytd-statement-banner-renderer,
      ytd-promoted-sparkles-web-renderer,
      ytd-search-pyv-renderer,
      ytd-action-companion-ad-renderer,
      .ytd-player-legacy-desktop-watch-ads-renderer,
      #player-ads
      { display: none !important; }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  // Listen for state changes
  try {
    chrome.storage.local.get(['state', 'pausedSites'], (data) => {
      if (chrome.runtime.lastError) return;
      const state = data.state;
      const pausedSites = data.pausedSites || [];
      const isPaused = pausedSites.includes(location.hostname);
      if (state) enabled = state.enabled;
      if (!enabled || isPaused) enabled = false;
      
      if (enabled) injectCosmeticCSS();
    });

    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === 'STATE_CHANGED') {
        enabled = msg.enabled;
        if (enabled) {
          injectCosmeticCSS();
        } else {
          const style = document.getElementById('adguard-yt-cosmetic');
          if (style) style.remove();
        }
      }
    });
  } catch {}

  function skipAds() {
    if (!enabled) return;

    // 1. Remove anti-adblock popups
    const popups = document.querySelectorAll('ytd-enforcement-message-view-model, tp-yt-iron-overlay-backdrop');
    if (popups.length > 0) {
      popups.forEach(el => el.remove());
      if (document.body && document.body.style.overflow === 'hidden') {
        document.body.style.overflow = '';
      }
      const errorScreen = document.querySelector('.ytp-error');
      if (errorScreen) errorScreen.style.display = 'none';

      const videos = document.querySelectorAll('video');
      videos.forEach(video => {
        if (video.paused && video.readyState > 0) {
          try { video.play(); } catch {}
        }
      });
    }

    // 2. Ultra-stable Ad Speedup & Skip
    const player = document.querySelector('.html5-video-player');
    if (player && player.classList.contains('ad-showing')) {
      const video = document.querySelector('video');
      if (video) {
        // Mute and turbo-speed the video.
        // We DO NOT touch video.currentTime because rapidly modifying the timestamps
        // causes the player to freeze in a permanent buffering state.
        video.muted = true;
        try { video.playbackRate = 16; } catch {}
      }

      // Spam click any skip buttons the millisecond they render
      const skipSelectors = [
        '.ytp-skip-ad-button',
        '.ytp-ad-skip-button',
        '.ytp-ad-skip-button-modern',
        'button.ytp-ad-skip-button',
        '.videoAdUiSkipButton',
        '.ytp-ad-skip-button-slot button'
      ];
      for (const sel of skipSelectors) {
        const btn = document.querySelector(sel);
        if (btn) btn.click();
      }
    }
  }

  // Use MutationObserver for instant reaction to UI changes
  const observer = new MutationObserver(() => {
    if (enabled) skipAds();
  });
  
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }

  // 10ms interval guarantees sub-frame reaction times for video events
  setInterval(skipAds, 10);

})();
