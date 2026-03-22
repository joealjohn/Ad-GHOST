/**
 * YouTube Ad Handler — Ghost Mode v8 (Synchronous Injection)
 * Critical Fix: The interceptor MUST be injected synchronously before 
 * chrome.storage checks, otherwise it loses the race against YouTube's 
 * native scripts and the ads load anyway.
 */

(function() {
  'use strict';

  // ==========================================
  // Layer 1: Synchronous Injection (CRITICAL)
  // Run this absolutely first, before any async storage checks!
  // ==========================================
  try {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('content/interceptor.js');
    script.onload = function() { this.remove(); };
    (document.head || document.documentElement).appendChild(script);
  } catch (e) {}

  let enabled = true;
  let adsSkipped = 0;
  let lastAdState = false;

  // Now we can do our async storage checks for the fallback loops
  try {
    chrome.storage.local.get(['state', 'pausedSites'], (data) => {
      if (chrome.runtime.lastError) return;
      const state = data.state;
      const pausedSites = data.pausedSites || [];
      const isPaused = pausedSites.includes(location.hostname);
      if (state) enabled = state.enabled;
      if (!enabled || isPaused) enabled = false;
    });
  } catch {}

  try {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === 'STATE_CHANGED') {
        enabled = msg.enabled;
      }
    });
  } catch {}

  // ==========================================
  // Layer 2: Ultra-Aggressive Fallback Scrubber
  // ==========================================
  function handleAdsFallback() {
    if (!enabled) return;

    const player = document.querySelector('.html5-video-player');
    if (!player) return;

    const adShowing = player.classList.contains('ad-showing');
    
    // Make absolutely sure it's an ad. Just checking generic 'children' is dangerous
    // because YouTube sometimes puts hidden metadata divs in the ad container.
    const adContainer = document.querySelector('.video-ads');
    const hasAdModule = adContainer && adContainer.querySelector('.ytp-ad-module, .ytp-ad-player-overlay, .ytp-ad-text, .ytp-ad-message') !== null;
    
    const isAdContent = window.location.href.includes('adformat=');

    const isAd = adShowing || hasAdModule || isAdContent;

    // Grab ALL video elements (sometimes YouTube uses dual-video layers for ads)
    const videos = document.querySelectorAll('video');

    if (isAd) {
      videos.forEach(video => {
        video.muted = true; // Kill ad audio instantly
        
        // Scrub timeline to exactly 0.1s before the end
        if (video.duration && video.duration > 0.5 && video.currentTime < video.duration - 0.5) {
          video.currentTime = video.duration - 0.1;
        }
        
        // Force 16x speed to kill whatever milliseconds remain
        try { video.playbackRate = 16; } catch {}
      });

      if (!lastAdState) {
        reportBlocked();
        lastAdState = true;
      }

      // Spam the skip buttons
      clickSkipButton();
    } else {
      if (lastAdState) {
        // Restore videos to normal
        videos.forEach(video => {
          video.muted = false;
          try { video.playbackRate = 1; } catch {}
        });
        lastAdState = false;
      }
    }
  }

  function clickSkipButton() {
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
      if (btn) {
        btn.click();
        return;
      }
    }
  }

  function reportBlocked() {
    adsSkipped++;
    try {
      chrome.runtime.sendMessage({ type: 'AD_BLOCKED' }).catch(() => {});
    } catch {}
  }

  // ==========================================
  // Layer 3: Popups
  // ==========================================
  function dismissPopups() {
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
  }

  const observer = new MutationObserver(() => {
    if (!enabled) return;
    dismissPopups();
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }

  // Fire fallback logic aggressively every 50ms
  setInterval(() => {
    handleAdsFallback();
    dismissPopups();
  }, 50);

})();
