# INF 125 Signature Wall — Shared Setup

The front end stays on GitHub Pages. Google Apps Script + Google Sheets provide the small shared data layer for up to 30 signatures.

## 1. Create the Apps Script backend

1. Go to https://script.google.com and create a new project.
2. Replace the default `Code.gs` with the contents of `SignatureWall.gs` from this folder.
3. Save the project as `INF 125 Signature Wall`.
4. In the Apps Script editor, run `setupSignatureWall()` once.
5. Approve the requested Google permissions.
6. The function creates a Google Sheet named `INF 125 Signature Wall — Fall 2026` and stores its ID in Script Properties.

## 2. Deploy as a web app

1. Click **Deploy → New deployment**.
2. Select **Web app**.
3. Execute as: **Me**.
4. Who has access: **Anyone**.
5. Click **Deploy** and copy the `/exec` URL.

Test the deployment by opening:

`YOUR_EXEC_URL?action=health`

Expected response:

```json
{"ok":true,"service":"INF125 Signature Wall","max":30}
```

## 3. Connect the GitHub Pages front end

The live front end needs the Apps Script `/exec` URL in its `BACKEND_URL` configuration. Once the URL is available, update `prototypes/signature-wall/index.html`.

Shared mode will then:

- submit each student's display name, selected ink color, and vector stroke data;
- reload the shared wall from the backend;
- show up to 30 signatures on every device;
- avoid storing legal-signature images or student IDs;
- keep the GitHub Pages front end unchanged as the public site.

## Data stored

The Google Sheet contains only:

- timestamp
- generated submission ID
- display name
- ink color
- normalized drawing stroke coordinates

It does **not** require NKU login, student ID, Canvas ID, email, or a legal signature image.

## Reset protection

The backend includes an optional reset endpoint protected by the Script Property:

`INF125_SIGNATURE_WALL_RESET_TOKEN`

Do not place this token in the public GitHub Pages JavaScript. For the classroom prototype, reset the Google Sheet manually if needed, or use an instructor-only script/tool later.
