import {test} from 'node:test';
import assert from 'node:assert/strict';
import {librarySort} from '../lib/library.ts';
test('정렬 기준 및 방향은 지정한 값만 허용한다',()=>{assert.equal(librarySort(null,null).key,'date');assert.equal(librarySort('date','asc').direction,'ASC');assert.equal(librarySort('topic','desc').direction,'DESC');assert.throws(()=>librarySort('created; DROP TABLE courses','asc'));assert.throws(()=>librarySort('date','desc; DROP TABLE courses'));});
