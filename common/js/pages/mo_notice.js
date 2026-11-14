(() => {
'use strict';
const client=window.eduNoticeClient;
const $=s=>document.querySelector(s), list=$('#notices'),status=$('#notice-status'),more=$('#more'),refresh=$('#refresh');
let admin=null,offset=0,revision=0,pending=false,editing=null,deleting=null;
const boardType=document.body.dataset.boardCode;
async function loadBoardName(){
 const {data}=await client.from('tbl_comcode').select('name').eq('code_group','BOARD').eq('code',boardType).maybeSingle();
 if(data){$('#resource-title').textContent=data.name;document.title=data.name+' | Onuri';}
}
const fields='id,title,content,published,created_at,updated_at';
loadBoardName();
function ui(user){admin=user;$('#admin-login').hidden=!!user;$('#new-notice').hidden=$('#admin-logout').hidden=!user;$('#admin-status').textContent=user?'관리자 모드 · 공개 공지와 비공개 초안을 관리할 수 있습니다.':'';if(!user){$('#editor-dialog').close();$('#delete-dialog').close();}}
function busy(root,value){pending=value;root.querySelectorAll('button').forEach(b=>b.disabled=value);}
const verify=()=>window.eduDbAdmin();
async function load(reset=false){
 const ticket=++revision,start=reset?0:offset;refresh.disabled=more.disabled=true;status.textContent='공지사항을 불러오는 중입니다.';if(reset)list.replaceChildren();
 try{
 let q=client.from('tbl_board').select(fields).eq('board_type',boardType).order('created_at',{ascending:false}).order('id',{ascending:false}).range(start,start+19);if(!admin)q=q.eq('published',true);
 const {data:rows,error}=await q;if(ticket!==revision)return;if(error)throw error;
 for(const row of rows){const item=document.createElement('details'),title=document.createElement('summary'),time=document.createElement('time'),content=document.createElement('div');title.textContent=row.title+(admin&&!row.published?' · 비공개':'');const date=new Date(row.created_at);if(!Number.isNaN(date.getTime())){time.dateTime=date.toISOString();time.textContent=new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',dateStyle:'long'}).format(date);}content.className='notice-content';content.textContent=row.content;item.append(title,time,content);
 if(admin){const actions=document.createElement('div');actions.className='notice-actions notice-row-actions';for(const [label,action] of [['수정',()=>openEditor(row)],['삭제',()=>{deleting=row;$('#delete-title').textContent=row.title;$('#delete-status').textContent='';$('#delete-dialog').showModal();}]]){const button=document.createElement('button');button.type='button';button.textContent=label;button.addEventListener('click',action);actions.append(button);}item.append(actions);}list.append(item);}
 offset=start+rows.length;more.hidden=rows.length<20;status.textContent=offset?`${offset}개의 공지사항을 표시합니다. 제목을 누르면 내용을 볼 수 있습니다.`:'등록된 공지사항이 없습니다.';
 }catch{if(ticket===revision)status.textContent='공지사항을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';}finally{if(ticket===revision)refresh.disabled=more.disabled=false;}
}
function openEditor(row=null){if(!admin)return;editing=row;$('#editor-heading').textContent=row?'공지 수정':'공지 작성';$('#notice-title').value=row?.title||'';$('#notice-content').value=row?.content||'';$('#notice-published').checked=row?.published??true;$('#editor-status').textContent='';$('#editor-dialog').showModal();}
$('#admin-login').addEventListener('click',()=>{$('#login-status').textContent='';$('#login-dialog').showModal();});
$('#login-form').addEventListener('submit',async e=>{e.preventDefault();if(pending)return;busy($('#login-form'),true);$('#login-status').textContent='로그인 확인 중입니다.';try{const {error}=await client.auth.signInWithPassword({email:$('#admin-email').value.trim(),password:$('#admin-password').value});$('#admin-password').value='';if(error)throw Error('이메일 또는 비밀번호를 확인해 주세요. 계정의 이메일 인증도 필요합니다.');const user=await verify();ui(user);$('#login-dialog').close();await load(true);}catch(error){await client.auth.signOut({scope:'local'});$('#login-status').textContent=error.message;}finally{busy($('#login-form'),false);}});
$('#admin-logout').addEventListener('click',async()=>{$('#admin-logout').disabled=true;const {error}=await client.auth.signOut({scope:'local'});$('#admin-logout').disabled=false;if(error){$('#admin-status').textContent='로그아웃하지 못했습니다. 다시 시도해 주세요.';return;}ui(null);await load(true);});
$('#new-notice').addEventListener('click',()=>openEditor());
$('#editor-form').addEventListener('submit',async e=>{e.preventDefault();if(pending||!admin)return;const title=$('#notice-title').value.trim(),content=$('#notice-content').value.trim();if(!title||!content){$('#editor-status').textContent='제목과 내용을 입력해 주세요.';return;}busy($('#editor-form'),true);$('#editor-status').textContent='저장 중입니다.';try{await verify();const values={title,content,published:$('#notice-published').checked};const q=editing?client.from('tbl_board').update(values).eq('board_type',boardType).eq('id',editing.id).eq('updated_at',editing.updated_at):client.from('tbl_board').insert({...values,board_type:boardType});const {data,error}=await q.select('id');if(error)throw Error('저장하지 못했습니다. 권한과 연결 상태를 확인해 주세요.');if(!data?.length)throw Error('공지가 변경되었거나 권한이 없습니다. 목록을 새로고침해 주세요.');$('#editor-dialog').close();await load(true);}catch(error){$('#editor-status').textContent=error.message;}finally{busy($('#editor-form'),false);}});
$('#confirm-delete').addEventListener('click',async()=>{if(pending||!admin||!deleting)return;busy($('#delete-dialog'),true);$('#delete-status').textContent='삭제 중입니다.';try{await verify();const {data,error}=await client.from('tbl_board').delete().eq('board_type',boardType).eq('id',deleting.id).eq('updated_at',deleting.updated_at).select('id');if(error)throw Error('삭제하지 못했습니다. 권한과 연결 상태를 확인해 주세요.');if(!data?.length)throw Error('공지가 변경되었거나 권한이 없습니다. 목록을 새로고침해 주세요.');$('#delete-dialog').close();await load(true);}catch(error){$('#delete-status').textContent=error.message;}finally{busy($('#delete-dialog'),false);}});
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>$('#'+b.dataset.close).close()));
for(const id of ['login-dialog','editor-dialog','delete-dialog'])$('#'+id).addEventListener('cancel',e=>{if(pending)e.preventDefault();});
$('#login-dialog').addEventListener('close',()=>{$('#admin-password').value='';});
client.auth.onAuthStateChange(event=>{if(event==='SIGNED_OUT'){ui(null);setTimeout(()=>load(true),0);}});
refresh.addEventListener('click',()=>load(true));more.addEventListener('click',()=>load());ui(null);
(async()=>{
 try{const {data}=await client.auth.getSession();if(data?.session)ui(await verify());}catch{}
 await load(true);
})();
})();
