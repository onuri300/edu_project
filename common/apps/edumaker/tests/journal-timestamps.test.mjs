import {test} from 'node:test';
import assert from 'node:assert/strict';
import {InputSchema,createDraft} from '../lib/course.ts';
import {stampJournalCreation} from '../lib/journal-timestamps.ts';
const input=InputSchema.parse({topic:'기록 테스트',audience:'성인',minutes:60,sessions:1,tools:'',conditions:''});
test('최초 저장 시각은 수정 및 클라이언트 값 변경에도 유지한다',()=>{const first=stampJournalCreation(createDraft(input),undefined,'2026-10-29T01:00:00.000Z');assert.equal(first.sessions[0].journalCreatedAt,'2026-10-29T01:00:00.000Z');const changed=structuredClone(first);changed.sessions[0].journal='수정한 본문';changed.sessions[0].journalCreatedAt='1900-01-01T00:00:00.000Z';assert.equal(stampJournalCreation(changed,first,'2026-10-29T03:00:00.000Z').sessions[0].journalCreatedAt,first.sessions[0].journalCreatedAt);});
test('과거 작성 시각을 알 수 없는 기존 자료에 임의 시각을 넣지 않는다',()=>{const legacy=createDraft(input);assert.equal(stampJournalCreation(legacy,legacy,'2026-10-29T03:00:00.000Z').sessions[0].journalCreatedAt,undefined);});
test('일지 없는 자료는 일지가 처음 생길 때 작성일시를 기록한다',()=>{const empty=createDraft(input);empty.sessions[0].journal='';assert.equal(stampJournalCreation(empty,undefined,'2026-10-29T01:00:00.000Z').sessions[0].journalCreatedAt,undefined);const written=structuredClone(empty);written.sessions[0].journal='첫 일지';assert.equal(stampJournalCreation(written,empty,'2026-10-29T03:00:00.000Z').sessions[0].journalCreatedAt,'2026-10-29T03:00:00.000Z');});
