import assert from 'node:assert/strict';
import test from 'node:test';
import { matchesRestaurant } from '../lib/restaurantSearch';
import { exportCalendar, readCalendar, type CalendarEvent } from '../lib/furconCalendar';
import { contributionProgress } from '../lib/contributions/progress';
import type { Restaurant } from '../data/types';
import type { EvaluationReport } from '../lib/contributions/evaluation';

const restaurant: Restaurant = { id:'one', slug:'kiln', name:'Kiln 云南', cuisine:'Thai', tags:['Spicy'], shortDescription:'', description:'', images:[], mustTry:[] };
test('query composes with cuisine and tags without needing multiple cuisines', () => {
  for (const query of ['', '  ', 'KILN', '云南', 'spicy', 'thai']) assert.ok(matchesRestaurant(restaurant,query));
  assert.ok(matchesRestaurant(restaurant,' KILN ','Spicy'));
  assert.equal(matchesRestaurant(restaurant,'Kiln','Indian'),false);
  assert.equal(matchesRestaurant(restaurant,'absent'),false);
});

const event: CalendarEvent = { uid:'event-2026@cffa.uk', name:'见面, Party; \\ London', start:'2026-12-31', end:'2027-01-02', location:'London\nSecond line', description:'兽聚'.repeat(80), url:'https://example.com/meet' };
test('ICS uses CRLF, exclusive end dates, stable IDs, UTF-8 folding and escaped text', async () => {
  const text = exportCalendar([event,event,{...event,uid:'cancelled',cancelled:true}],new Date('2026-11-07T00:00:00Z'));
  assert.ok(text.includes('DTEND;VALUE=DATE:20270103'));
  assert.ok(text.includes('DTSTAMP:20261107T000000Z'));
  assert.equal((text.match(/BEGIN:VEVENT/g)??[]).length,1);
  for(const line of text.split('\r\n')) assert.ok(Buffer.byteLength(line)<=75);
  const result = await readCalendar(text);
  assert.equal(result[0].name,event.name);
  assert.equal(result[0].location,event.location);
  assert.match(result[0].when,/2026-12-31 — 2027-01-02 · 全天/);
  const again=exportCalendar([{...event,start:'2027-01-03',end:'2027-01-04'}]);
  assert.ok(again.includes(`UID:${event.uid}`));
});
test('single day ICS and leap day are exclusive by one day',()=>{
  assert.ok(exportCalendar([{...event,start:'2028-02-29',end:'2028-02-29'}]).includes('DTEND;VALUE=DATE:20280301'));
  assert.throws(()=>exportCalendar([{...event,start:'2026-02-30'}]));
  assert.throws(()=>exportCalendar([{...event,end:'2025-01-01'}]));
});
test('calendar preview preserves time zone, cancellation and recurrence without expanding it',async()=>{
  const result=await readCalendar('BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nUID:local\r\nSUMMARY:<script>not executed</script>\r\nDTSTART;TZID=Europe/London:20261121T120000\r\nDTEND;TZID=Europe/London:20261121T150000\r\nRRULE:FREQ=WEEKLY\r\nSTATUS:CANCELLED\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n');
  assert.equal(result.length,1);
  assert.match(result[0].when,/Europe\/London/);
  assert.equal(result[0].cancelled,true);
  assert.equal(result[0].recurring,true);
});
test('invalid, empty and oversized calendar input gives an error',async()=>{
  await assert.rejects(readCalendar('not a calendar'));
  await assert.rejects(readCalendar('BEGIN:VCALENDAR\r\nVERSION:2.0\r\nEND:VCALENDAR'));
  await assert.rejects(readCalendar('a'.repeat(1_000_001)),/1 MB/);
});

const report: EvaluationReport = {version:1,issueNumber:24,pullRequestNumber:26,headSha:'a'.repeat(40),baseSha:'b'.repeat(40),runId:'123',evaluatedAt:'2026-11-07T00:00:00Z',deterministicPassed:true,sourceRecall:1,dynamicCasePassed:true,judgeScores:[90,90],judgeAverage:90,threshold:95,failures:['Judge average 90.00% is below 95%'],explanation:'Evidence'};
test('admin distinguishes program failure, AI judgement and unknown evidence',()=>{
  assert.equal(contributionProgress('status:failed').label,'程序处理失败');
  assert.match(contributionProgress('status:manual-review',report).label,/AI/);
  assert.match(contributionProgress('status:manual-review',null).label,/证据待核实/);
  assert.match(contributionProgress('status:manual-review',report,null,false).label,/证据待核实/);
  assert.equal(contributionProgress('status:manual-review',{...report,deterministicPassed:false}).label,'程序处理失败');
});
test('Ready or merged labels alone never imply deployed',()=>{
  assert.match(contributionProgress('status:ready').label,/尚未上线/);
  assert.match(contributionProgress('status:merged').label,/待核实/);
  assert.equal(contributionProgress('status:merged',null,{state:'live',prUrl:'https://github.com/a/b/pull/1',message:'Verified'}).label,'网站已上线');
});
