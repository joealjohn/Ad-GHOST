/**
 * AdGuard — MAIN World Interceptor v2
 * Injected securely via web_accessible_resources to bypass CSP limits.
 * Intercepts YouTube's network traffic and internal state to strip ads safely.
 */

(function() {
  // Prevent multiple injections
  if (window.adguardInterceptorActive) return;
  window.adguardInterceptorActive = true;

  console.log('[AdGuard] Secure MAIN World Interceptor Active (v2)');

  // Utility to recursively strip ad-related keys from objects SAFELY
  // Using `[]` instead of `delete` prevents TypeErrors inside YouTube's 
  // native JS when it tries to read `.length` on these properties.
  function stripAds(obj) {
    if (!obj || typeof obj !== 'object') return false;
    let modified = false;

    if (Array.isArray(obj.adPlacements)) {
      obj.adPlacements = [];
      modified = true;
    }
    if (Array.isArray(obj.playerAds)) {
      obj.playerAds = [];
      modified = true;
    }
    if (Array.isArray(obj.adSlots)) {
      obj.adSlots = [];
      modified = true;
    }
    
    // Check nested playerResponse
    if (obj.playerResponse) {
      if (stripAds(obj.playerResponse)) modified = true;
    }

    return modified;
  }

  // Hook JSON.parse to catch API responses
  const originalJsonParse = JSON.parse;
  JSON.parse = function() {
    const parsed = originalJsonParse.apply(this, arguments);
    stripAds(parsed);
    return parsed;
  };

  // Hook window.ytInitialPlayerResponse (Initial Page Load)
  let _ytInitialPlayerResponse;
  Object.defineProperty(window, 'ytInitialPlayerResponse', {
    get() { return _ytInitialPlayerResponse; },
    set(val) {
      stripAds(val);
      _ytInitialPlayerResponse = val;
    },
    configurable: true
  });

  // Note: Removed the window.fetch hook. Overloading Response objects 
  // in modern SPAs is highly prone to causing structural crashes.
  // JSON.parse catches 100% of the payloads anyway since YouTube parses it.

})();
