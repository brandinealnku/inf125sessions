import puppeteer from 'puppeteer-core';

const base=process.env.BASE||'https://classroom.itsbadlabs.com';
const session=process.env.SESSION||('group-mode-e2e-'+Date.now());
const chrome=process.env.CHROME||'/usr/bin/google-chrome';

const browser=await puppeteer.launch({headless:true,executablePath:chrome,args:['--no-sandbox','--disable-dev-shm-usage']});
const log=(m)=>console.log('[E2E]',m);
const assert=(cond,msg)=>{if(!cond)throw new Error(msg)};

async function text(page,selector){
  return page.$eval(selector,el=>(el.innerText||el.textContent||'').trim());
}
async function bodyHas(page,s){
  return (await page.$eval('body',el=>el.innerText||'')).includes(s);
}

try{
  const student=await browser.newPage();
  log('Opening student view');
  await student.goto(`${base}/groups?session=${encodeURIComponent(session)}`,{waitUntil:'domcontentloaded',timeout:10000});
  await student.waitForSelector('#name',{timeout:10000});
  await student.type('#name','Jordan',{delay:35});
  assert((await student.$eval('#name',el=>el.value))==='Jordan','Student name field did not retain typed text');
  await student.click('#joinBtn');
  await student.waitForSelector('#pTitle',{timeout:10000});
  log('Student entered marketplace');

  const title='AI + Personalized Social Media Feeds';
  const field='Communication / Social Media';
  const question='Should social media apps use AI to personalize what college students see if it may affect mood, attention, or opinions?';
  const description='I see personalized feeds every day. They can make apps useful, but they may also influence people without them realizing it.';
  const source='https://www.pewresearch.org/';

  await student.type('#pTitle',title,{delay:20});
  await student.type('#pField',field,{delay:20});
  await student.type('#pQuestion',question,{delay:10});
  await student.type('#pDescription',description,{delay:10});
  await student.type('#pSource',source,{delay:10});

  assert((await student.$eval('#pTitle',el=>el.value))===title,'BYO title field did not retain typed text');
  assert((await student.$eval('#pQuestion',el=>el.value))===question,'BYO question field did not retain typed text');

  log('Submitting Bring Your Own Case');
  await student.click('#proposeBtn');
  await student.waitForFunction(t=>document.body.innerText.includes(t),{timeout:10000},title);
  await student.waitForFunction(()=>document.body.innerText.includes('YOUR CASE'),{timeout:10000});
  assert(await bodyHas(student,title),'Submitted case not visible to student');
  assert(await bodyHas(student,'YOUR CASE'),'Submitted case not marked YOUR CASE');
  log('Student sees submitted case');

  const saveVotes=await student.$('#saveVotes');
  assert(saveVotes,'Save My Votes button missing');
  await saveVotes.click();
  await student.waitForFunction(()=>document.body.innerText.includes('Votes saved'),{timeout:10000});
  log('Student vote saved');

  const instructor=await browser.newPage();
  log('Opening instructor view');
  await instructor.goto(`${base}/groups/instructor?session=${encodeURIComponent(session)}`,{waitUntil:'domcontentloaded',timeout:10000});
  await instructor.waitForFunction(t=>document.body.innerText.includes(t),{timeout:10000},title);
  assert(await bodyHas(instructor,'INSTRUCTOR'),'Instructor view did not render instructor controls');
  assert(await bodyHas(instructor,title),'Submitted case missing from instructor view');
  log('Instructor sees submitted case');

  const room=await browser.newPage();
  log('Opening room view');
  await room.goto(`${base}/groups/room?session=${encodeURIComponent(session)}`,{waitUntil:'domcontentloaded',timeout:10000});
  await room.waitForFunction(t=>document.body.innerText.includes(t),{timeout:10000},title);
  assert(await bodyHas(room,'CASE MARKETPLACE'),'Room view did not render marketplace');
  assert(await bodyHas(room,title),'Submitted case missing from room view');
  log('Room sees submitted case');

  log('Forming groups through the same live Group Mode API used by the instructor control');
  const formRes=await fetch(`${base}/api/session/${encodeURIComponent(session)}/group-mode/form-groups`,{
    method:'POST',
    headers:{'content-type':'application/json'},
    body:'{}'
  });
  const formJson=await formRes.json();
  assert(formRes.ok && formJson?.state?.groupsFormed===true,'Group formation API failed');

  log('Re-opening all three views after group formation');
  const studentAfter=await browser.newPage();
  await studentAfter.goto(`${base}/groups?session=${encodeURIComponent(session)}`,{waitUntil:'domcontentloaded',timeout:10000});
  await studentAfter.evaluate(({session,name})=>{
    const key='inf125-case-marketplace-'+session;
    const current=JSON.parse(localStorage.getItem(key)||'{}');
    current.name=name;
    localStorage.setItem(key,JSON.stringify(current));
  },{session,name:'Jordan'});
  await studentAfter.reload({waitUntil:'domcontentloaded',timeout:10000});
  await new Promise(r=>setTimeout(r,3000));

  await instructor.reload({waitUntil:'domcontentloaded',timeout:10000});
  await room.reload({waitUntil:'domcontentloaded',timeout:10000});
  await new Promise(r=>setTimeout(r,3000));

  assert(await bodyHas(instructor,title),'Selected custom case disappeared from instructor group view after grouping');
  assert(await bodyHas(room,title),'Selected custom case disappeared from room group view after grouping');

  log('PASS: BYO case propagates Student -> Instructor -> Room before group formation and remains visible in Instructor + Room after grouping');
  log('PASS: BYO case propagates Student -> Instructor -> Room before and after group formation');
} finally {
  await browser.close();
}
