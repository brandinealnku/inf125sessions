# INF 125 Live — Session 1

A mobile-first classroom companion for the finalized first meeting of INF 125: AI Literacy.

## What is built
- Student/instructor views
- Opening AI-count poll
- Everyday-AI reveal
- Pair prompt
- Major/future-work poll
- 90-second Canvas race
- Canvas scavenger hunt
- Data → Model/Tool → Output → Human Interpretation → Decision/Action lens
- Maps live-demo cue
- AI trust poll/debrief
- Everyday AI Lens Check with saved notes
- Privacy poll
- Academic-integrity spectrum
- Exact three-part exit ticket
- Day 1 word-cloud fallback
- Next-step checklist
- NKU black/gold, mobile-first design

## Fastest browser test
If GitHub Pages is enabled for the repository root, open the Pages URL and the `index.html` prototype will load directly. The static prototype works immediately and stores each device's work in that browser.

## Whole-class live results
`Code.gs` is a starter Google Apps Script backend. To enable true shared live polling:
1. Create a Google Sheet.
2. Add a `Responses` sheet or let `setup()` create it.
3. Paste the Sheet ID into `SHEET_ID`.
4. In Apps Script, create `Code.gs` and an HTML file named `Index`.
5. Paste `Code.gs` and the contents of `index.html` into those files.
6. Deploy as a Web App with the access level appropriate for your class.
7. Extend the client calls from localStorage to `google.script.run.submitResponse(...)` and `getResults(...)`.

The static prototype intentionally does **not** pretend to aggregate class-wide results until the backend is connected.

## Instructor facilitation
Use one QR code to the deployed app. Students remain in the same interface for polls, prompts, the Lens Check, privacy scenario, and exit ticket. Switch the projector to live Canvas, Maps, or a generative-AI tool only at the marked demo moments.
