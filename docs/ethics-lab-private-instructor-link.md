# Private instructor access for the INF 125 Ethics Lab

The instructor page supports a private URL with a 256-bit random access key in its **fragment** (`#access=...`), with only a SHA-256 digest of that key committed in `src/ethics-lab-api.js`. The key is never committed, sent in the URL HTTP request, or displayed to students. The instructor page stores it in sessionStorage and removes the fragment from the address bar on first visit.

## How it works

1. Open the private instructor URL once in the browser used to teach.
2. The page loads the token from the fragment and stores it for that tab/session.
3. Authorized API requests send the key in an `x-inf125-instructor-key` header over HTTPS.
4. The Durable Object validates the hash for phase control, group formation/reset, and exports.
5. Students use `https://classroom.itsbadlabs.com/ethics-lab` and do **not** need this key.

The original Cloudflare PIN authentication remains supported as an optional alternative.

## Important

- **Treat the entire private link as a password.** Anyone with it can control the session and export responses. Never show it on the projector, include it in a QR code, paste it into Canvas, or send it to students.
- Browser fragment keys avoid ordinary server request logs and Referrer headers, but remain visible in browser history until loaded and are exposed by screenshots, extensions, and anyone with local browser access. The raw key is also shared in the private ChatGPT conversation when delivered.
- If it leaks, rotate: generate a new cryptographically random key, replace its SHA-256 digest in `src/ethics-lab-api.js`, merge, and deploy. The old URL will immediately stop working after deployment.
- Existing instructor sessions that are PIN-cookie authenticated remain subject to the optional Cloudflare PIN settings.
- A merged GitHub commit only changes source code. Confirm the Cloudflare Worker has actually deployed the new commit and rehearse a cross-device session before class.
