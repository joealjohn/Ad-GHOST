# 🛡️ AdGuard pro — Ghost Mode Edition

The ultimate, undetectable Chrome extension designed specifically to bypass modern anti-adblock restrictions with zero player crashes. Built around a robust Manifest V3 architecture, AdGuard pro utilizes advanced sub-frame DOM scrubbing to seamlessly vaporize ads without triggering catastrophic video freezes.

> **Status:** Stable — 100% Crash-Proof against YouTube's 2025/2026 Anti-Adblock Systems.

---

## ✨ Key Features

### 👻 Ghost Mode (Ultra-Stable YouTube Bypass)
Unlike legacy adblockers that recklessly intercept backend API requests or mutate playtime timestamps (which YouTube actively detects and punishes with permanent black screens), Ghost Mode uses **Native Timeline Fast-Forwarding**. 
- The exact millisecond an unskippable video ad appears, the extension enforces a `16.0x` native playback rate.
- The ad plays out naturally at blinding speed while completely muted, finishing a 15-second ad in under `0.9` seconds.
- Because the ad officially "completes" according to the browser's native event listeners, YouTube's state machine transitions flawlessly back to your main video. **Zero buffering freezes. Zero black screens.**

### 🗡️ Deep Cosmetic Sweeps
A lightweight, global CSS injector is initialized at `document_start`, wiping out structural UI ads before the DOM even begins rendering on your screen.
- Scans `ytd-rich-item-renderer` and sidebar recommendation grids.
- Actively hunts for the legally mandated *Sponsored* tags (`.badge-style-type-ad`) to destroy promoted products and "Sparkles" tiles instantly.

### 🛑 Network-Level Engine
Powered by Manifest V3's lightning-fast `declarativeNetRequest` API, the core engine blocks over 3,000 known tracking domains, analytics beacons, and third-party advertising hosts directly at the browser's networking layer, preventing them from ever utilizing your bandwidth.

### 📱 Premium Popup UI
A beautiful, glassmorphic Control Center built with vanilla HTML/CSS. Features dynamic particle animations, real-time statistics of trackers destroyed, and an instant global kill-switch.

---

## 🛠️ Architecture

* **`manifest.json`** — Manifest V3 compliant base utilizing `declarativeNetRequest` for optimal performance.
* **`rules.json`** — 3000+ domain-accurate networking filters.
* **`youtube.js`** — The pure DOM-scrubbing script injected specifically for modern YouTube player configurations.
* **`cosmetic.js`** — Removes empty ad-spaces and popups gracefully across the remainder of the web.

## 🚀 Installation

1. Clone or download this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions`.
3. Toggle the **Developer mode** switch in the top right corner.
4. Click **Load unpacked** and select the `/extension` directory.
5. Pin the extension to your toolbar and enjoy a flawless viewing experience.
