import {readFile,appendFile} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
const file=new URL('../.dev.vars',import.meta.url);
let content='';try{content=await readFile(file,'utf8');}catch(e){if(e.code!=='ENOENT')throw e;}
if(/^CANVA_TOKEN_KEY=.+$/m.test(content)){console.log('기존 Canva 암호화 키가 있어 유지했습니다.');}
else{await appendFile(file,`\nCANVA_TOKEN_KEY=${randomBytes(32).toString('base64')}\n`);console.log('서버용 Canva 암호화 키를 .dev.vars에 저장했습니다. 값은 출력하지 않습니다.');}
