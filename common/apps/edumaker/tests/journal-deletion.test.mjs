import {test} from 'node:test';
import assert from 'node:assert/strict';
import {InputSchema,createDraft} from '../lib/course.ts';
import {changeJournalDeletion,preserveJournalDeletion} from '../lib/journal-deletion.ts';
const input=InputSchema.parse({topic:'삭제 검증',audience:'성인',minutes:60,sessions:2,tools:'',conditions:''});
test('선택 회차만 숨기며 원본 기록·다른 회차·교안을 보존하고 복구한다',()=>{const c=createDraft(input),deleted=changeJournalDeletion(c,[0],'delete','2026-10-29T01:00:00.000Z');assert.ok(deleted.sessions[0].journalDeletedAt);assert.equal(deleted.sessions[1].journalDeletedAt,undefined);assert.equal(deleted.sessions[0].journal,c.sessions[0].journal);assert.deepEqual(deleted.slides,c.slides);const restored=changeJournalDeletion(deleted,[0],'restore','2026-10-29T02:00:00.000Z');assert.equal(restored.sessions[0].journalDeletedAt,undefined);assert.equal(restored.sessions[0].journal,c.sessions[0].journal);});
test('회차 범위 검증 및 오래된 저장 요청의 삭제 상태 보존',()=>{const c=createDraft(input);assert.throws(()=>changeJournalDeletion(c,[2],'delete','now'));const deleted=changeJournalDeletion(c,[0],'delete','2026-10-29T01:00:00.000Z');assert.equal(preserveJournalDeletion(c,deleted).sessions[0].journalDeletedAt,deleted.sessions[0].journalDeletedAt);});
