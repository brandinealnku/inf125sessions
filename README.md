# INF 125 Live Learning OS — V1

This repository is now a synchronized classroom experience for **INF 125: AI Literacy**.

## What V1 does

- One student URL for the whole class.
- Students enter a first name or classroom nickname and join the live session.
- The instructor opens the same URL with `?instructor=1`.
- The instructor controls the current activity for the entire room.
- Student screens automatically advance when the instructor advances the session.
- Polls and written responses aggregate across the class.
- The instructor can reveal or hide results.
- Session 2 is prebuilt around **How AI Works** using the framework:
  `DATA → MODEL / TOOL → OUTPUT → HUMAN INTERPRETATION → DECISION / ACTION`.
- Browser-only GitHub Pages mode remains available for interface preview, but true multi-device synchronization requires the Google Apps Script deployment.

## Session 2 student flow

1. Join the class.
2. Cold open: what information would an AI need before advising a student to drop calculus?
3. Five-part AI system mini-lesson.
4. Students build the advising system themselves.
5. First recommendation vote.
6. Reveal and discuss the class distribution.
7. Add new information and vote again.
8. Compare before/after class results.
9. Identify the system's greatest failure point.
10. Define the human's continuing responsibility.
11. Exit reflection.
12. Closing framework.

## A. Preview the interface with GitHub Pages

GitHub Pages is useful for checking layout and student interactions, but it does **not** synchronize multiple devices.

1. Open **Settings → Pages** in this repository.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select `main` and `/(root)` after this PR is merged.
4. Open `https://brandinealnku.github.io/inf125sessions/`.
5. Add `?instructor=1` to preview the instructor interface.

## B. Deploy the real classroom version with Google Apps Script

### 1. Create the data sheet

Create a Google Sheet named something like **INF 125 Live Learning OS** and copy the Sheet ID from the URL. It is the long value between `/d/` and `/edit`.

### 2. Create or update the Apps Script project

From the Sheet:

1. Open **Extensions → Apps Script**.
2. Replace the script contents with this repository's `Code.gs`.
3. Replace `PASTE_GOOGLE_SHEET_ID_HERE` with your Sheet ID.
4. Add or replace an HTML file named **Index**.
5. Paste the complete contents of this repository's `index.html` into `Index`.

### 3. Initialize the backend

In Apps Script:

1. Select the `setup` function.
2. Click **Run** once.
3. Approve Google permissions if prompted.

The spreadsheet will receive three tabs:

- `Responses`
- `SessionState`
- `Participants`

### 4. Deploy as a Web App

1. Click **Deploy → New deployment**.
2. Choose **Web app**.
3. Execute as **Me**.
4. Select the broadest access level your NKU Google Workspace policy permits for your students.
5. Click **Deploy**.
6. Copy the Web App URL.

When updating an existing deployment, use **Deploy → Manage deployments → Edit → New version → Deploy** so students receive the newest code.

## C. URLs to use in class

### Students

Give students the normal Web App URL:

`YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL`

Students enter a first name or nickname and click **Join class**.

### Instructor / projector

Open the same URL with:

`?instructor=1`

Example:

`YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL?instructor=1`

This opens the classroom console with:

- joined-student count
- Back
- Reveal/Hide Results
- Next
- Reset

## D. Test before class

Use at least three browser contexts:

1. Instructor URL on your laptop.
2. Student URL on your phone.
3. Student URL in an incognito/private window.

Confirm all of the following:

- Each student can join.
- The instructor count increases.
- Clicking **Start Session 2** moves students out of the waiting screen.
- Clicking **Next** changes all student screens within a few seconds.
- Student votes appear on the instructor screen.
- Written responses appear in the instructor response feed.
- The two recommendation votes can be compared later in the session.
- Reset returns the class to the waiting state and clears Session 2 participant/response data.

## E. Day-of-class workflow

1. Put the student Web App URL into Canvas or generate one QR code.
2. Open the instructor URL on the projected computer.
3. Ask students to join as they arrive.
4. Watch the connected count approach your attendance count.
5. Click **Start Session 2**.
6. Use **Next** to control the class rhythm.
7. Use **Reveal results** only after students have committed to an answer when you want to avoid conformity effects.
8. Leave the instructor page open throughout class.

## Important V1 behavior

- Every browser receives a persistent random device ID.
- A student's new answer to the same question updates that browser's previous answer rather than adding a duplicate.
- The instructor controls the current activity through the shared `SessionState` sheet.
- Student browsers poll the shared state approximately every 2.2 seconds.
- This V1 is intentionally optimized for a single instructor-led classroom rather than hardened as a public multi-tenant product.

## After the pilot

Good V2 candidates are instructor authentication, reusable JSON session definitions, AI clustering of written answers, misconception detection, timed activities, team modes, saved session analytics, Canvas links, and a dedicated Cloudflare backend so setup no longer depends on copying code into Apps Script.
