const SHEET_ID = 'PASTE_GOOGLE_SHEET_ID_HERE';
const SESSION = 'Session 1';

function doGet(){
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('INF 125 Live')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function sheet_(){
  const ss = SpreadsheetApp.openById(SHEET_ID);
  return ss.getSheetByName('Responses') || ss.insertSheet('Responses');
}

function setup(){
  const sh = sheet_();
  if(sh.getLastRow() === 0){
    sh.appendRow(['Timestamp','Session','Device','Question','Response']);
    sh.setFrozenRows(1);
  }
  return 'Ready';
}

function submitResponse(payload){
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet_();
    if(sh.getLastRow() === 0) setup();
    const device = String(payload.device || '');
    const question = String(payload.question || '');
    const response = JSON.stringify(payload.response ?? '');
    const values = sh.getDataRange().getValues();
    let existingRow = 0;
    for(let i = values.length - 1; i >= 1; i--){
      if(values[i][1] === SESSION && values[i][2] === device && values[i][3] === question){
        existingRow = i + 1;
        break;
      }
    }
    if(existingRow){
      sh.getRange(existingRow,1,1,5).setValues([[new Date(),SESSION,device,question,response]]);
    } else {
      sh.appendRow([new Date(),SESSION,device,question,response]);
    }
    return {ok:true};
  } finally {
    lock.releaseLock();
  }
}

function getResults(question){
  const sh = sheet_();
  if(sh.getLastRow() < 2) return {};
  const values = sh.getDataRange().getValues();
  const out = {};
  values.slice(1)
    .filter(r => r[1] === SESSION && r[3] === question)
    .forEach(r => {
      let v; try { v = JSON.parse(r[4]); } catch(e) { v = r[4]; }
      if(typeof v === 'string') out[v] = (out[v] || 0) + 1;
    });
  return out;
}

function getTextResponses(question){
  const sh = sheet_();
  if(sh.getLastRow() < 2) return [];
  const values = sh.getDataRange().getValues();
  return values.slice(1)
    .filter(r => r[1] === SESSION && r[3] === question)
    .map(r => { try { return JSON.parse(r[4]); } catch(e) { return r[4]; } })
    .filter(v => typeof v === 'string' && v.trim());
}

function clearSessionResponses(){
  const sh = sheet_();
  if(sh.getLastRow() <= 1) return 0;
  const values = sh.getDataRange().getValues();
  const keep = [values[0]];
  let removed = 0;
  values.slice(1).forEach(r => {
    if(r[1] === SESSION) removed++;
    else keep.push(r);
  });
  sh.clearContents();
  sh.getRange(1,1,keep.length,keep[0].length).setValues(keep);
  sh.setFrozenRows(1);
  return removed;
}
