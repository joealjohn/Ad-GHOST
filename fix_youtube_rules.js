const fs = require('fs');
const path = require('path');

const rulesPath = path.join(__dirname, 'extension', 'rules', 'rules.json');
const rawData = fs.readFileSync(rulesPath, 'utf8');
const rules = JSON.parse(rawData);

// These are the domains YouTube uses to serve/track ads.
// We must NOT block these when the user is on a YouTube tab,
// otherwise YouTube's server detects our blocker.
const ytAdDomains = [
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtube-nocookie.com',
  'googlevideo.com',
  'ytimg.com',
];

let modified = 0;

rules.forEach(rule => {
  if (rule.action && rule.action.type === 'block') {
    // Add excludedInitiatorDomains (requests FROM YouTube)
    if (!rule.condition.excludedInitiatorDomains) {
      rule.condition.excludedInitiatorDomains = [];
    }
    for (const d of ytAdDomains) {
      if (!rule.condition.excludedInitiatorDomains.includes(d)) {
        rule.condition.excludedInitiatorDomains.push(d);
      }
    }

    // Add excludedRequestDomains (requests TO YouTube-related domains)
    // This prevents blocking googlevideo/ytimg which break the player
    if (!rule.condition.excludedRequestDomains) {
      rule.condition.excludedRequestDomains = [];
    }
    for (const d of ['googlevideo.com', 'ytimg.com', 'youtube.com', 'youtube-nocookie.com']) {
      if (!rule.condition.excludedRequestDomains.includes(d)) {
        rule.condition.excludedRequestDomains.push(d);
      }
    }

    modified++;
  }
});

fs.writeFileSync(rulesPath, JSON.stringify(rules, null, 2));
console.log(`Patched ${modified} rules with full YouTube domain exclusions.`);
