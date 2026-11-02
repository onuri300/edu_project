import {test} from 'node:test';
import assert from 'node:assert/strict';
import {imageType,MAX_CATEGORY_IMAGE_BYTES} from '../lib/category-images.ts';
test('허용한 이미지 헤더와 위장 형식 구분',()=>{assert.equal(imageType(Uint8Array.of(137,80,78,71,13,10,26,10)),'image/png');assert.equal(imageType(Uint8Array.of(255,216,255)),'image/jpeg');assert.equal(imageType(Buffer.from('RIFF0000WEBP')),'image/webp');assert.equal(imageType(Buffer.from('<svg/>')),null);assert.equal(imageType(Buffer.from('GIF89a')),null);assert.equal(imageType(new Uint8Array()),null);assert.equal(MAX_CATEGORY_IMAGE_BYTES,524288);});
