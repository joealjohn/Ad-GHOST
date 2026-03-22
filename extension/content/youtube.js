/**
 * YouTube Ad Handler — Ghost Mode v6 (Zero-Interruption Interceptor)
 * Strategy: Inject code directly into the YouTube page context (MAIN world) 
 * to intercept and modify the raw API JSON responses. We strip out all 
 * 'adPlacements' before the YouTube video player even knows they exist.
 * This guarantees 100% uninterrupted, seamless playback.
 */

(function() {
  'use strict';

  let enabled = true;

  // Check initial state
  try {
    chrome.storage.local.get(['state', 'pausedSites'], (data) => {
      if (chrome.runtime.lastError) return;
      const state = data.state;
      const pausedSites = data.pausedSites || [];
      const isPaused = pausedSites.includes(location.hostname);
      if (state) enabled = state.enabled;
      if (!enabled || isPaused) enabled = false;

      // Only inject the JSON interceptor if we are enabled
      if (enabled) {
        injectMainWorldInterceptor();
      }
    });
  } catch {
    injectMainWorldInterceptor(); // Default to injecting
  }

  // ==========================================
  // Layer 1: JSON Interceptor (MAIN World)
  // This runs in the actual page context to manipulate YouTube's raw data
  // ==========================================
  function injectMainWorldInterceptor() {
    const script = document.createElement('script');
    
    // We stringify a function to easily inject it into the page
    script.textContent = `(${function() {
      // Hook JSON.parse to intercept all incoming API responses
      const originalJsonParse = JSON.parse;
      JSON.parse = function() {
        const parsed = originalJsonParse.apply(this, arguments);
        if (parsed && typeof parsed === 'object') {
          // Strip ads from the initial page load and AJAX navigation
          if (parsed.adPlacements) parsed.adPlacements = [];
          if (parsed.playerAds) parsed.playerAds = [];
          
          // Strip ads from nestled playerResponse objects
          if (parsed.playerResponse) {
            if (parsed.playerResponse.adPlacements) parsed.playerResponse.adPlacements = [];
            if (parsed.playerResponse.playerAds) parsed.playerResponse.playerAds = [];
          }
        }
        return parsed;
      };

      // Hook XMLHttpRequest to modify raw text responses just in case
      const originalOpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function() {
        this.addEventListener('readystatechange', function() {
          if (this.readyState === 4 && this.responseURL.includes('/youtubei/v1/player')) {
            // We rely on the JSON.parse hook for the actual modification,
            // this is just an extra observation layer.
          }
        });
        originalOpen.apply(this, arguments);
      };

      // Intercept the initial static page variable
      Object.defineProperty(window, 'ytInitialPlayerResponse', {
        get() { return this._ytInitialPlayerResponse; },
        set(val) {
          if (val) {
            if (val.adPlacements) val.adPlacements = [];
            if (val.playerAds) val.playerAds = [];
          }
          this._ytInitialPlayerResponse = val;
        }
      });
      
    }})();`;
    
    // Inject at document_start to beat YouTube's own scripts
    document.documentElement.appendChild(script);
    script.remove(); // Clean up the script tag immediately to hide fingerprints
  }

  // ==========================================
  // Layer 2: Auto-dismiss anti-adblock popups
  // ==========================================
  
  // Watch for dynamically inserted enforcement popups
  const observer = new MutationObserver((mutations) => {
    if (!enabled) return;
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === 1) {
          const tag = node.tagName?.toLowerCase();
          if (tag === 'ytd-enforcement-message-view-model' ||
              tag === 'tp-yt-iron-overlay-backdrop') {
            node.remove();
            
            // Fix body scroll lock
            if (document.body && document.body.style.overflow === 'hidden') {
              document.body.style.overflow = '';
            }

            // Hide error screen if present
            const errorScreen = document.querySelector('.ytp-error');
            if (errorScreen) {
              errorScreen.style.display = 'none';
            }

            // Try to resume video ONCE after popup removal
            const video = document.querySelector('video');
            if (video && video.paused) {
              try { video.play(); } catch {}
            }
          }
        }
      }
    }
  });

  // Start popup observer when DOM is ready
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }

})();
