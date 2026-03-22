/**
 * YouTube Ad Skipper — Ghost Mode v3
 * Dual-strategy: (1) Auto-dismiss anti-adblock popups, (2) Fast-forward video ads.
 * Zero fingerprints. No custom attributes, no console, no CSS injection.
 */

(function() {
  'use strict';

  let enabled = true;
  let adsSkipped = 0;
  let lastAdState = false;

  // Check initial state silently
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

  // Listen for state changes silently
  try {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === 'STATE_CHANGED') {
        enabled = msg.enabled;
      }
    });
  } catch {}

  // ==========================================
  // STRATEGY 1: Auto-dismiss anti-adblock popup
  // Only remove the DIALOG itself, never the player container
  // ==========================================
  function dismissAntiAdblockPopup() {
    // Remove ONLY the enforcement message dialog — this is the actual popup
    const popups = document.querySelectorAll('ytd-enforcement-message-view-model');
    popups.forEach(el => el.remove());

    // Remove the dark overlay backdrop (blocks interaction)
    const backdrops = document.querySelectorAll('tp-yt-iron-overlay-backdrop');
    backdrops.forEach(el => el.remove());

    // Remove any paper dialogs related to enforcement
    const dialogs = document.querySelectorAll('tp-yt-paper-dialog');
    dialogs.forEach(el => {
      // Only remove if it contains enforcement content
      if (el.querySelector('ytd-enforcement-message-view-model') || 
          el.textContent.includes('Ad blockers violate')) {
        el.remove();
      }
    });

    // Fix body scroll lock left behind by the dialog
    if (document.body) {
      document.body.style.overflow = '';
    }

    // If the video player exists but video is paused, try to resume
    const video = document.querySelector('video');
    if (video && video.paused && !video.ended && video.readyState > 0) {
      try { video.play(); } catch {}
    }

    // If the playability error screen is showing, hide it so the player is visible
    const errorScreen = document.querySelector('.ytp-error');
    if (errorScreen) {
      errorScreen.style.display = 'none';
    }
  }

  // ==========================================
  // STRATEGY 2: Fast-forward video ads
  // ==========================================
  function skipVideoAds() {
    const video = document.querySelector('video');
    if (!video) return;

    const player = document.querySelector('.html5-video-player');
    if (!player) return;

    // Use multiple signals to confirm ad is playing
    const adShowing = player.classList.contains('ad-showing');
    const adContainer = document.querySelector('.video-ads');
    const hasAdChildren = adContainer && adContainer.children.length > 0;

    const isAd = adShowing || hasAdChildren;

    if (isAd) {
      video.muted = true;

      // Fast-forward to end of ad
      if (video.duration && video.duration > 0.5 && video.currentTime < video.duration - 0.5) {
        video.currentTime = video.duration - 0.1;
      }
      try { video.playbackRate = 16; } catch {}

      if (!lastAdState) {
        reportBlocked();
        lastAdState = true;
      }

      clickSkipButton();
    } else {
      if (lastAdState) {
        video.muted = false;
        try { video.playbackRate = 1; } catch {}
        lastAdState = false;
      }
    }
  }

  // ==========================================
  // Click any visible skip button
  // ==========================================
  function clickSkipButton() {
    const skipSelectors = [
      '.ytp-skip-ad-button',
      '.ytp-ad-skip-button',
      '.ytp-ad-skip-button-modern',
      'button.ytp-ad-skip-button',
      '.videoAdUiSkipButton',
      '.ytp-ad-skip-button-slot button',
      '.ytp-ad-skip-button-container button',
    ];

    for (const sel of skipSelectors) {
      const btn = document.querySelector(sel);
      if (btn) {
        btn.click();
        reportBlocked();
        return true;
      }
    }
    return false;
  }

  function reportBlocked() {
    adsSkipped++;
    try {
      chrome.runtime.sendMessage({ type: 'AD_BLOCKED' }).catch(() => {});
    } catch {}
  }

  // ==========================================
  // Main loop
  // ==========================================
  function mainLoop() {
    if (!enabled) return;
    try {
      dismissAntiAdblockPopup();
      skipVideoAds();
      clickSkipButton();
    } catch {}
  }

  // Watch for dynamically inserted enforcement popups only
  const observer = new MutationObserver((mutations) => {
    if (!enabled) return;
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === 1) {
          const tag = node.tagName?.toLowerCase();
          // Only remove the enforcement dialog and backdrop — NEVER the player
          if (tag === 'ytd-enforcement-message-view-model' ||
              tag === 'tp-yt-iron-overlay-backdrop') {
            node.remove();
            // Try to resume video
            const video = document.querySelector('video');
            if (video && video.paused) {
              try { video.play(); } catch {}
            }
          }
        }
      }
    }
  });

  // Start observer when DOM is ready
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }

  // === INIT ===
  setInterval(mainLoop, 150);

})();
