import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isLocalSignInNavigation} from '../build/sites-vite-plugin.ts';
test('외부 페이지의 명시적인 로컬 로그인 이동만 허용',()=>{assert.equal(isLocalSignInNavigation('GET','/signin-with-chatgpt','navigate','document'),true);for(const args of [['POST','/signin-with-chatgpt','navigate','document'],['GET','/signout-with-chatgpt','navigate','document'],['GET','/signin-with-chatgpt','cors','empty'],['GET','/signin-with-chatgpt','navigate','iframe'],['GET','/signin-with-chatgpt',undefined,undefined]])assert.equal(isLocalSignInNavigation(...args),false);});
