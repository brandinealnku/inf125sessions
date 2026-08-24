const SHEET_ID = 'PASTE_GOOGLE_SHEET_ID_HERE';
function doGet(){ return HtmlService.createHtmlOutputFromFile('Index').setTitle('INF 125 Live'); }
function sheet_(){ const ss=SpreadsheetApp.openById(SHEET_ID); return ss.getSheetByName('Responses') || ss.insertSheet('Responses'); }
function setup(){
 const sh=sheet_();
 if(sh.getLastRow()===0) sh.appendRow(['Timestamp','Session','Device','Question','Response']);
 return 'Ready';
}
function submitResponse(payload){
 const sh=sheet_();
 if(sh.getLastRow()===0) setup();
 sh.appendRow([new Date(),'Session 1',payload.device||'',payload.question||'',JSON.stringify(payload.response||'')]);
 return {ok:true};
}
function getResults(question){
 const sh=sheet_(), values=sh.getDataRange().getValues(), out={};
 values.slice(1).filter(r=>r[3]===question).forEach(r=>{let v;try{v=JSON.parse(r[4])}catch(e){v=r[4]} out[v]=(out[v]||0)+1});
 return out;
}
