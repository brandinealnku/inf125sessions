# INF 125 Ethics Lab V2 — November 10, 2026

Integrated Class Runner, running in the existing `inf125sessions` Cloudflare Worker + Durable Object, with a single instructor controller and native student/group/room views (no iframe). Six phases preserve the 75-minute agenda and align with slides 14–27 of `INF125_HandsOn_AI_Learning_Ethics(1).pptx`.

## URLs (after Cloudflare deployment)
- Student / QR code: https://classroom.itsbadlabs.com/ethics-lab
- Instructor: https://classroom.itsbadlabs.com/ethics-lab/instructor
- Room/projector: https://classroom.itsbadlabs.com/ethics-lab/room

## Critical deployment prerequisite
Configure a secret before using the instructor view:

```sh
npx wrangler secret put INF125_INSTRUCTOR_PIN
```

Use a strong unique PIN/passphrase (12+ characters), never commit it to GitHub, and do not distribute the instructor URL or PIN. If the secret is missing, instructor actions and exports fail closed. This prototype uses a signed HttpOnly Secure SameSite cookie lasting ten hours. Existing non-Ethics Group Mode routes retain their historical controls; restrict external access to those routes separately before using them for sensitive or graded work.

## Instructor controls
One phase button controls student, room, and Group Mode stage. In the marketplace phase click **Form four groups** after votes are collected; this uses the existing Group Mode group-formation algorithm. The group cases are the four scenarios from slides 15–18, fixed to Red Tutor, Blue Monitoring, Purple Hiring, Gold Art. Group Mode remains stored in its `gm*` Durable Object keys.

## Data and privacy
- Single browser identity persists across individual and group activities.
- Drafts are saved locally while typing and group answers can be revised.
- The instructor's single CSV includes individual answers, team responses, case preferences, and Group Mode individual starters. This export requires authentication.
- Do not submit sensitive records or use nickname-only participation as grading evidence.
- The previous classroom Group Mode public snapshot behavior remains in place and should be reviewed before collecting identifiable educational records.
- The session ID is fixed for Nov 10. Avoid test submissions in production or archive/reset carefully (there is no public reset action in V2).

## Go/no-go classroom rehearsal
1. Confirm all three URLs respond after deployment.
2. Configure the instructor secret and sign in; verify incorrect PIN is rejected and export is unavailable when signed out.
3. Join using a student phone, submit Phase 1 and 2 answers, refresh, and verify the same identity and answers/drafts persist.
4. Enter marketplace, vote for cases, form groups, see zone/role, submit a team ethics verdict.
5. Advance once into critique and again into visit-design; verify projector and student task change and team work survives.
6. Advance to signature assignment, submit researchable question and evidence need.
7. Export CSV; verify each type of record appears.

Validation scope: JavaScript syntax, auth API unit tests and code inspection completed locally. Real Cloudflare deployment, binding, network, phones, and end-to-end classroom testing still required.