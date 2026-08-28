# INF 125 Live Learning OS

A synchronized browser-based classroom experience for **INF 125: AI Literacy**.

## Current architecture

The app is now Cloudflare-native:

- **Cloudflare Worker** serves the application and API.
- **Static Assets** serve the student/instructor interface from `public/`.
- **Durable Objects** hold the live classroom state, active participants, and responses.
- **GitHub** is the source of truth.
- Google Sheets and Apps Script are no longer required for the live version.

## Classroom URLs

After deployment:

- Students: `https://YOUR-WORKER-URL/`
- Instructor/projector: `https://YOUR-WORKER-URL/?instructor=1`

Students enter a first name or nickname. The instructor controls the current activity for the room. Student screens poll the shared session state every 1.5 seconds and follow the instructor automatically.

## Session 2: How AI Works

The included lesson follows:

`DATA → MODEL / TOOL → OUTPUT → HUMAN INTERPRETATION → DECISION / ACTION`

Flow:

1. Join the live room.
2. Cold open: what information would an AI need before advising a student to drop calculus?
3. Five-part AI system model.
4. Students build the advising system.
5. First recommendation vote.
6. Reveal class results.
7. Add new information and vote again.
8. Compare before/after results.
9. Identify the system's greatest failure point.
10. Define the human's continuing responsibility.
11. Exit reflection.
12. Closing framework.

## Local development

```bash
npm install
npm run dev
```

Then open the local URL printed by Wrangler. Add `?instructor=1` for the instructor view.

## Validate before deployment

```bash
npm install
npm run check
```

`npm run check` performs a Wrangler dry-run deployment validation.

## Deploy manually

```bash
npm install
npm run deploy
```

Wrangler must be authenticated to the intended Cloudflare account.

## Recommended GitHub → Cloudflare deployment

Connect this repository to Cloudflare once, using `main` as the production branch. The Worker is configured by `wrangler.jsonc`, so subsequent merges to `main` can become the deployment workflow instead of copying files into another platform.

Repository structure:

```text
public/
  index.html        student + instructor interface
src/
  index.js          Worker API + Durable Object
wrangler.jsonc      Cloudflare configuration
package.json        dev/check/deploy commands
```

## Live-state behavior

One Durable Object instance is used for the current classroom session. It stores:

- current activity step
- whether results are visible
- class status
- active participants
- one current answer per browser/device per question

Participants are counted as active when they have checked in during the previous two minutes. Student clients send a periodic heartbeat while the class is open.

## Instructor controls

The instructor view provides:

- active participant count
- Back
- Reveal/Hide Results
- Next
- Reset

This V1 intentionally prioritizes a frictionless classroom pilot. The instructor route is not yet authenticated, so do not publish the instructor URL to students.

## Legacy files

`Code.gs` and the root `index.html` are retained temporarily as the previous Apps Script/GitHub Pages prototype. The production Cloudflare application uses `src/index.js` and `public/index.html`.

## Good next upgrades

- instructor authentication
- reusable session JSON files
- session picker/dashboard
- WebSocket push instead of polling
- AI clustering of written responses
- misconception detection
- timers and team modes
- saved class analytics
- Canvas links or roster integration
