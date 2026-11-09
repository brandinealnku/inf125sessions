# INF 125 · November 10 Ethics Lab

This session lives alongside (not in place of) the production ShowRunner and Group Mode app in `brandinealnku/inf125sessions`. It uses Cloudflare Static Assets + a session-scoped Durable Object.

Proposed public links after deploying the Worker from main:

- Student: https://classroom.itsbadlabs.com/ethics-lab
- Instructor: https://classroom.itsbadlabs.com/ethics-lab/instructor
- Projector: https://classroom.itsbadlabs.com/ethics-lab/room

The new page uses existing `/groups` views for three group-mode phases and a separate API (`/api/session/inf125-nov10-ethics/ethics-lab/`) for opening polls, slide reflections, and the Gen Ed exit response. Existing classroom routes remain unchanged.

**Before class:** Open the three URLs on different devices and verify responses, state changes, group join, case choices, team formation, class voting, and CSV export. The instructor links and endpoints are not authenticated, so do not share instructor links; this is a teaching prototype, not a graded assessment service. The public room link also shows only student-safe summaries and not unmoderated responses.

**Group Mode:** The existing Group Mode has its own instructor phase controls. During the 25–68 minute block use its instructor view to form groups and move from `marketplace` to `ethics`, `critique`, and `visit`, then `signature`. An embedded view reuses the same `session=inf125-nov10-ethics` parameter so it shares state.

**Important:** Do not click Reset during an active session. Group Mode and lesson responses are stored separately but share the session's Durable Object.