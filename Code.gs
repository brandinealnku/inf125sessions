const SHEET_ID = 'PASTE_GOOGLE_SHEET_ID_HERE';
const DEFAULT_SESSION = 'Session 2';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('INF 125 Live Learning OS')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function spreadsheet_() {
  return SpreadsheetApp.openById(SHEET_ID);
}

function responsesSheet_() {
  const ss = spreadsheet_();
  return ss.getSheetByName('Responses') || ss.insertSheet('Responses');
}

function stateSheet_() {
  const ss = spreadsheet_();
  return ss.getSheetByName('SessionState') || ss.insertSheet('SessionState');
}

function participantsSheet_() {
  const ss = spreadsheet_();
  return ss.getSheetByName('Participants') || ss.insertSheet('Participants');
}

function setup() {
  const responses = responsesSheet_();
  if (responses.getLastRow() === 0) {
    responses.appendRow(['Timestamp', 'Session', 'Device', 'Name', 'Question', 'Response']);
    responses.setFrozenRows(1);
  }

  const state = stateSheet_();
  if (state.getLastRow() === 0) {
    state.appendRow(['Session', 'Step', 'ResultsVisible', 'Status', 'Updated']);
    state.appendRow([DEFAULT_SESSION, 0, false, 'waiting', new Date()]);
    state.setFrozenRows(1);
  }

  const participants = participantsSheet_();
  if (participants.getLastRow() === 0) {
    participants.appendRow(['Timestamp', 'Session', 'Device', 'Name']);
    participants.setFrozenRows(1);
  }

  return 'INF 125 Live Learning OS is ready';
}

function ensureSessionState_(session) {
  const sh = stateSheet_();
  if (sh.getLastRow() === 0) setup();
  const values = sh.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === session) return i + 1;
  }
  sh.appendRow([session, 0, false, 'waiting', new Date()]);
  return sh.getLastRow();
}

function getSessionState(session) {
  session = String(session || DEFAULT_SESSION);
  const row = ensureSessionState_(session);
  const values = stateSheet_().getRange(row, 1, 1, 5).getValues()[0];
  return {
    session: String(values[0]),
    step: Number(values[1]) || 0,
    resultsVisible: values[2] === true || String(values[2]).toLowerCase() === 'true',
    status: String(values[3] || 'waiting'),
    updated: values[4]
  };
}

function setSessionState(payload) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const session = String(payload.session || DEFAULT_SESSION);
    const row = ensureSessionState_(session);
    const current = getSessionState(session);
    const step = Number.isFinite(Number(payload.step)) ? Number(payload.step) : current.step;
    const resultsVisible = typeof payload.resultsVisible === 'boolean' ? payload.resultsVisible : current.resultsVisible;
    const status = payload.status ? String(payload.status) : current.status;
    stateSheet_().getRange(row, 1, 1, 5).setValues([[session, step, resultsVisible, status, new Date()]]);
    return getSessionState(session);
  } finally {
    lock.releaseLock();
  }
}

function joinSession(payload) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const session = String(payload.session || DEFAULT_SESSION);
    const device = String(payload.device || '');
    const name = String(payload.name || 'Anonymous').trim().slice(0, 40) || 'Anonymous';
    const sh = participantsSheet_();
    if (sh.getLastRow() === 0) setup();
    const values = sh.getDataRange().getValues();
    let existingRow = 0;
    for (let i = values.length - 1; i >= 1; i--) {
      if (String(values[i][1]) === session && String(values[i][2]) === device) {
        existingRow = i + 1;
        break;
      }
    }
    const row = [new Date(), session, device, name];
    if (existingRow) sh.getRange(existingRow, 1, 1, 4).setValues([row]);
    else sh.appendRow(row);
    return { ok: true, name: name };
  } finally {
    lock.releaseLock();
  }
}

function getParticipantCount(session) {
  session = String(session || DEFAULT_SESSION);
  const sh = participantsSheet_();
  if (sh.getLastRow() < 2) return 0;
  const devices = {};
  sh.getDataRange().getValues().slice(1).forEach(r => {
    if (String(r[1]) === session) devices[String(r[2])] = true;
  });
  return Object.keys(devices).length;
}

function submitResponse(payload) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = responsesSheet_();
    if (sh.getLastRow() === 0) setup();
    const session = String(payload.session || DEFAULT_SESSION);
    const device = String(payload.device || '');
    const name = String(payload.name || 'Anonymous').trim().slice(0, 40) || 'Anonymous';
    const question = String(payload.question || '');
    const response = JSON.stringify(payload.response ?? '');
    const values = sh.getDataRange().getValues();
    let existingRow = 0;
    for (let i = values.length - 1; i >= 1; i--) {
      if (String(values[i][1]) === session && String(values[i][2]) === device && String(values[i][4]) === question) {
        existingRow = i + 1;
        break;
      }
    }
    const row = [new Date(), session, device, name, question, response];
    if (existingRow) sh.getRange(existingRow, 1, 1, 6).setValues([row]);
    else sh.appendRow(row);
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

function getResults(session, question) {
  session = String(session || DEFAULT_SESSION);
  const sh = responsesSheet_();
  if (sh.getLastRow() < 2) return {};
  const out = {};
  sh.getDataRange().getValues().slice(1)
    .filter(r => String(r[1]) === session && String(r[4]) === String(question))
    .forEach(r => {
      let v;
      try { v = JSON.parse(r[5]); } catch (e) { v = r[5]; }
      if (typeof v === 'string' || typeof v === 'number') {
        const key = String(v);
        out[key] = (out[key] || 0) + 1;
      }
    });
  return out;
}

function getTextResponses(session, question) {
  session = String(session || DEFAULT_SESSION);
  const sh = responsesSheet_();
  if (sh.getLastRow() < 2) return [];
  return sh.getDataRange().getValues().slice(1)
    .filter(r => String(r[1]) === session && String(r[4]) === String(question))
    .map(r => {
      let v;
      try { v = JSON.parse(r[5]); } catch (e) { v = r[5]; }
      return { name: String(r[3] || 'Anonymous'), text: typeof v === 'string' ? v : JSON.stringify(v) };
    })
    .filter(r => r.text && r.text.trim());
}

function clearSessionResponses(session) {
  session = String(session || DEFAULT_SESSION);
  const sh = responsesSheet_();
  if (sh.getLastRow() <= 1) return 0;
  const values = sh.getDataRange().getValues();
  const keep = [values[0]];
  let removed = 0;
  values.slice(1).forEach(r => {
    if (String(r[1]) === session) removed++;
    else keep.push(r);
  });
  sh.clearContents();
  sh.getRange(1, 1, keep.length, keep[0].length).setValues(keep);
  sh.setFrozenRows(1);
  return removed;
}

function resetSession(session) {
  session = String(session || DEFAULT_SESSION);
  clearSessionResponses(session);
  const participant = participantsSheet_();
  if (participant.getLastRow() > 1) {
    const values = participant.getDataRange().getValues();
    const keep = [values[0]].concat(values.slice(1).filter(r => String(r[1]) !== session));
    participant.clearContents();
    participant.getRange(1, 1, keep.length, keep[0].length).setValues(keep);
    participant.setFrozenRows(1);
  }
  setSessionState({ session: session, step: 0, resultsVisible: false, status: 'waiting' });
  return { ok: true };
}
