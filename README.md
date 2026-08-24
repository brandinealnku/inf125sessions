# INF 125 Live — Session 1

This repository supports two modes:

1. **GitHub Pages** — fast browser/UI testing. Responses are stored only in that browser.
2. **Google Apps Script Web App** — classroom mode with whole-class live aggregation in Google Sheets.

## A. Test the interface now with GitHub Pages

1. In GitHub, open **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select **main** and **/(root)**, then **Save**.
4. After GitHub publishes the site, open:
   `https://brandinealnku.github.io/inf125sessions/`
5. Test on both your computer and your phone.

GitHub Pages is for interface testing only. It does not aggregate responses across devices.

## B. Turn on whole-class live aggregation

### 1. Create the response sheet
- Create a new Google Sheet, e.g. **INF 125 Live Responses**.
- Copy the Sheet ID from its URL (the long value between `/d/` and `/edit`).

### 2. Create the Apps Script project
- From the Google Sheet, open **Extensions → Apps Script**.
- Replace the default script with the repository's `Code.gs`.
- Replace `PASTE_GOOGLE_SHEET_ID_HERE` with your real Sheet ID.
- Add a new HTML file named **Index**.
- Paste the full contents of `index.html` into that `Index` file.

### 3. Initialize
- In Apps Script, select the `setup` function and click **Run** once.
- Approve permissions when Google prompts you.
- Confirm the Sheet now contains a `Responses` tab with headers.

### 4. Deploy as a Web App
- Click **Deploy → New deployment**.
- Choose **Web app**.
- Execute as: **Me**.
- Choose the access level appropriate for your students. For a classroom pilot, select the broadest option your NKU Google Workspace policy permits.
- Click **Deploy** and copy the Web App URL.

### 5. Test true live aggregation
- Open the Web App URL on your laptop.
- Open the same URL on your phone (or an incognito/private browser window).
- On the laptop, click **Instructor view**.
- On the phone, stay in **Student** view.
- Answer the opening poll from the phone.
- Within about 5 seconds, the instructor view should show the aggregated result.
- Test with multiple devices or incognito windows to simulate students.

### 6. Day-of-class workflow
- Create **one QR code** pointing to the Apps Script Web App URL.
- Project the same URL on your instructor computer and toggle **Instructor view**.
- Students scan the QR code and remain in student view.
- Poll results refresh every ~5 seconds on the instructor screen.
- The Everyday AI Lens Check and exit ticket are written to the Google Sheet.
- The word-cloud screen aggregates the class's `AI literacy means...` responses.

## Important behavior
- Each browser gets a random device ID.
- If a student changes a poll answer, the backend **updates** that student's prior response instead of double-counting it.
- Instructor results are class-wide only when the app is served through Apps Script.
- GitHub Pages intentionally stays a local-storage-only test mode.

## Reset before class
Run `clearSessionResponses()` in Apps Script to remove Session 1 test responses while keeping the header row.
