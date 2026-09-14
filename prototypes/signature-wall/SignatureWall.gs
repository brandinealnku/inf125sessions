const SIGNATURE_WALL_PROP = 'INF125_SIGNATURE_WALL_SHEET_ID';
const SIGNATURE_SHEET = 'Signatures';
const MAX_SIGNATURES = 30;

function setupSignatureWall() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty(SIGNATURE_WALL_PROP);
  let ss;
  if (id) {
    ss = SpreadsheetApp.openById(id);
  } else {
    ss = SpreadsheetApp.create('INF 125 Signature Wall — Fall 2026');
    id = ss.getId();
    props.setProperty(SIGNATURE_WALL_PROP, id);
  }

  let sh = ss.getSheetByName(SIGNATURE_SHEET);
  if (!sh) sh = ss.insertSheet(SIGNATURE_SHEET);
  if (sh.getLastRow() === 0) {
    sh.appendRow(['Timestamp', 'Id', 'Name', 'Color', 'StrokesJSON']);
    sh.setFrozenRows(1);
  }
  return { ok: true, spreadsheetId: id, spreadsheetUrl: ss.getUrl() };
}

function doGet(e) {
  const action = String((e && e.parameter && e.parameter.action) || 'list');
  if (action === 'list') return json_(listSignatures_());
  if (action === 'count') return json_({ ok: true, count: listSignatures_().signatures.length, max: MAX_SIGNATURES });
  if (action === 'health') return json_({ ok: true, service: 'INF125 Signature Wall', max: MAX_SIGNATURES });
  return json_({ ok: false, error: 'Unknown action' });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const payload = parsePayload_(e);
    const action = String(payload.action || 'submit');
    if (action === 'submit') return json_(submitSignature_(payload));
    if (action === 'reset') return json_(resetSignatures_(payload));
    return json_({ ok: false, error: 'Unknown action' });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  } finally {
    lock.releaseLock();
  }
}

function sheet_() {
  let id = PropertiesService.getScriptProperties().getProperty(SIGNATURE_WALL_PROP);
  if (!id) {
    setupSignatureWall();
    id = PropertiesService.getScriptProperties().getProperty(SIGNATURE_WALL_PROP);
  }
  const ss = SpreadsheetApp.openById(id);
  let sh = ss.getSheetByName(SIGNATURE_SHEET);
  if (!sh) {
    sh = ss.insertSheet(SIGNATURE_SHEET);
    sh.appendRow(['Timestamp', 'Id', 'Name', 'Color', 'StrokesJSON']);
    sh.setFrozenRows(1);
  }
  return sh;
}

function listSignatures_() {
  const sh = sheet_();
  if (sh.getLastRow() < 2) return { ok: true, max: MAX_SIGNATURES, signatures: [] };
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, 5).getValues();
  const signatures = rows.map(r => {
    let strokes = [];
    try { strokes = JSON.parse(String(r[4] || '[]')); } catch (_) {}
    return {
      id: String(r[1] || ''),
      name: String(r[2] || ''),
      color: String(r[3] || '#17214c'),
      strokes: strokes,
      timestamp: r[0] instanceof Date ? r[0].toISOString() : String(r[0] || '')
    };
  }).filter(x => x.id && x.name).slice(0, MAX_SIGNATURES);
  return { ok: true, max: MAX_SIGNATURES, signatures: signatures };
}

function submitSignature_(payload) {
  const sh = sheet_();
  const current = Math.max(0, sh.getLastRow() - 1);
  if (current >= MAX_SIGNATURES) return { ok: false, error: 'Wall is full', count: current, max: MAX_SIGNATURES };

  const name = String(payload.name || '').trim().slice(0, 30);
  const color = /^#[0-9a-fA-F]{6}$/.test(String(payload.color || '')) ? String(payload.color) : '#17214c';
  const strokes = normalizeStrokes_(payload.strokes);
  if (!name) return { ok: false, error: 'Name is required' };
  if (!strokes.length) return { ok: false, error: 'Signature is required' };

  const id = Utilities.getUuid();
  sh.appendRow([new Date(), id, name, color, JSON.stringify(strokes)]);
  return { ok: true, id: id, count: current + 1, max: MAX_SIGNATURES };
}

function normalizeStrokes_(value) {
  let strokes = value;
  if (typeof strokes === 'string') {
    try { strokes = JSON.parse(strokes); } catch (_) { return []; }
  }
  if (!Array.isArray(strokes)) return [];
  return strokes.slice(0, 40).map(stroke => {
    if (!Array.isArray(stroke)) return [];
    return stroke.slice(0, 500).map(pt => {
      if (!pt || typeof pt !== 'object') return null;
      const x = Math.max(0, Math.min(1, Number(pt.x)));
      const y = Math.max(0, Math.min(1, Number(pt.y)));
      if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
      return { x: Math.round(x * 10000) / 10000, y: Math.round(y * 10000) / 10000 };
    }).filter(Boolean);
  }).filter(stroke => stroke.length > 0);
}

function resetSignatures_(payload) {
  const token = String(payload.token || '');
  const expected = PropertiesService.getScriptProperties().getProperty('INF125_SIGNATURE_WALL_RESET_TOKEN');
  if (!expected || token !== expected) return { ok: false, error: 'Unauthorized' };
  const sh = sheet_();
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).clearContent();
  return { ok: true, count: 0, max: MAX_SIGNATURES };
}

function parsePayload_(e) {
  if (!e) return {};
  const raw = e.postData && e.postData.contents ? e.postData.contents : '';
  if (raw) {
    try { return JSON.parse(raw); } catch (_) {}
  }
  const p = e.parameter || {};
  return {
    action: p.action,
    name: p.name,
    color: p.color,
    strokes: p.strokes,
    token: p.token
  };
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
