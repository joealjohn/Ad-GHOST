<div align="center">
  <img src="extension/icons/icon128.png" width="120" alt="GHOST Logo">
  <h1>👻 GHOST Ad Blocker</h1>
  
  <p><strong>A hyper-aggressive, stealth-focused Ad, Tracker, and Anti-Adblock eliminator built for Manifest V3.</strong></p>

  <p>
    <a href="https://github.com/joealjohn/Ad-GHOST"><img src="https://img.shields.io/badge/Manifest-V3-6A37CC?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Manifest V3"></a>
    <a href="https://github.com/joealjohn/Ad-GHOST"><img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" alt="Status"></a>
    <a href="https://github.com/joealjohn/Ad-GHOST"><img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License"></a>
  </p>
</div>

---

## ⚡ Overview
> **GHOST** is not just another ad blocker. 
Built exclusively on Chrome's modern **Manifest V3** architecture, GHOST combines lightning-fast network interception with advanced DOM manipulation. It completely eradicates ads across the web, specifically targeting YouTube and hostile anti-adblock websites that force you to disable your blocker.

## 🚀 Key Features

| Feature | Description |
|---|---|
| 🛡️ **Network-Level Eradication** | Utilizes `declarativeNetRequest` to silently drop connections to over 140+ major ad syndicates, telemetry trackers (Google Analytics, Hotjar), and OEM beacons before they even load. |
| 🎯 **YouTube Ad Skipper Engine** | A dedicated content script that intercepts and brutally skips YouTube pre-roll, mid-roll, and overlay ads instantly, automatically clicking skip buttons and forwarding video players. |
| 🥷 **Anti-Adblock Spoofing** | Defeats *"Please Disable Your Adblocker"* overlays (commonly found on download and link-shortener sites) by directly injecting native JavaScript stubs (spoofing `window.ga`, `document.offsetHeight`, etc.) to trick the site into thinking ads successfully rendered. |
| 🧹 **Whitespace Collapse** | Uses proactive `MutationObservers` to hunt down and completely collapse floating video players, sticky widgets, and the gaping white spaces left behind by deleted ads. |
| 🚫 **Popup Neutralizer** | Natively intercepts `window.open()` mechanisms to block malicious pop-unders and deceptive new-tab spawns. |
| 📺 **Picture-in-Picture** | Native built-in interface to instantly pop out your YouTube videos into floating PiP windows. |

## 🛠️ Installation Guide

1. Clone or download this repository to your local machine:
   ```bash
   git clone https://github.com/joealjohn/Ad-GHOST.git
   ```
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle in the top right corner.
4. Click on the **Load unpacked** button.
5. Select the `extension` folder from this downloaded repository.
6. Pin **GHOST** to your toolbar and enjoy a unified, ad-free web!

## ⚙️ How it Works under the Hood

Unlike traditional ad blockers that inject thousands of heavy CSS rules slowing down your browser, GHOST prioritizes **stealth**:

* **Dimension Lying:** Instead of blindly hiding ad-blocker honeypots, GHOST overrides `getComputedStyle` and `clientHeight` to lie to trackers, feeding them artificially generated dimensions so they unlock the site's content automatically.
* **State Machine Override:** YouTube logic is heavily refined to outmaneuver Google's anti-adblock TOS scripts by manipulating the media player's internal state machine directly.

## 🖌️ Aesthetics 
Includes a sleek, dark-mode native Glassmorphic popup UI giving you instant access to pause enforcement on specific domains and toggle YouTube Picture-in-Picture mode.

---
<div align="center">
  <i>Developed for a seamless, private, and unstoppable browsing experience.</i>
</div>
