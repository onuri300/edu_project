(() => {
'use strict';

const client = window.eduNoticeClient;
const $ = selector => document.querySelector(selector);
$('#bd-app').innerHTML = window.eduBoardTemplate;
const boardType = document.body.dataset.boardCode;
const boardLabels = { notice: 'Notice', library: 'Library' };
const boardTitles = { notice: 'Notice', library: '자료실' };
const list = $('#notices');
const status = $('#notice-status');
const fields = 'board_id,title,content,published,created_at,updated_at,attachment_paths,view_count';
const dates = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' });
let admin = null, revision = 0, pending = false, draft = null, deleting = null;
let page = 1, keyword = '', searchField = 'title';
let selectedButton = null;
let selectedPost = null;
const inlineForm = $('#bd-inline-form');
for (const button of document.querySelectorAll('[data-bd-toggle]')) {
  button.addEventListener('click', () => {
    const pane = document.getElementById(button.getAttribute('aria-controls'));
    pane.hidden = !pane.hidden;
    button.closest('.bd-pane').classList.toggle('bd-pane-collapsed', pane.hidden);
    button.textContent = pane.hidden ? '›' : '‹';
    button.setAttribute('aria-expanded', String(!pane.hidden));
    button.setAttribute('aria-label', (pane.hidden ? 'Expand ' : 'Collapse ') + (button.dataset.bdToggle === 'boards' ? 'boards' : 'posts'));
  });
}

function markBoard() {
  for (const link of document.querySelectorAll('.bd-nav a')) {
    if (link.pathname === location.pathname) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
}
markBoard();
if (window.parent !== window && location.origin !== 'null') {
  window.parent.postMessage({ type: 'onuri:board-page', path: location.pathname }, location.origin);
}

async function loadBoardMenu() {
  try {
    const { data, error } = await client.from('tbl_menu')
      .select('page_path,menu:tbl_comcode!tbl_menu_menu_code_fk(name)')
      .eq('group_code', 'mn_').order('menu_order');
    if (error || !data?.length) return;
    const links = [];
    for (const row of data) {
      const path = row.page_path;
      if (!row.menu?.name || !/^mn_manage\/mn_(notice|library)\.html$/.test(path)) continue;
      const key = path.match(/mn_([a-z0-9_-]+)[.]html$/i)?.[1];
      const link = element('a', boardLabels[key] || row.menu.name);
      link.href = '../' + path;
      links.push(link);
    }
    if (links.length) {
      $('#bd-navigation').replaceChildren(...links);
      markBoard();
    }
  } catch { /* The entry menu also works when offline. */ }
}
loadBoardMenu();

async function loadBoardName() {
  try {
    const { data } = await client.from('tbl_comcode').select('name').eq('code_group', 'BOARD').eq('code', boardType).maybeSingle();
    if (data) $('#resource-title').textContent = document.title = boardTitles[boardType] || data.name;
  } catch { /* The entry page supplies the default title. */ }
}
loadBoardName();

function element(tag, text) {
  const node = document.createElement(tag);
  if (text != null) node.textContent = text;
  return node;
}

function ui(user) {
  if (!user && draft) discardDraft();
  admin = user;
  $('#admin-login').hidden = Boolean(user);
  $('#new-notice').hidden = !user;
  if (!user) for (const id of ['#delete-dialog']) $(id).close();
}

function busy(root, value) {
  pending = value;
  root.querySelectorAll('button').forEach(button => { button.disabled = value; });
}

const verify = () => window.eduDbAdmin();
const dateLabel = value => dates.format(new Date(value)).replace(/[.\s]+/g, '-').replace(/-$/, '');

function attachment(path) {
  const parts = path.split('/');
  if (!/^(?:mn_manage\/mn_files\/|common\/file\/cl\.file\/)/.test(path) ||
      parts.some(part => !part || part === '.' || part === '..' || /[\\%?#:\x00-\x1f]/.test(part))) return null;
  const link = element('a', parts.at(-1));
  link.href = '../' + parts.map(encodeURIComponent).join('/');
  link.download = parts.at(-1);
  return link;
}

function postValues(rawTitle, rawContent, files, published) {
  const title = rawTitle.trim(), content = rawContent.trim();
  if (title.length > 200 || content.length > 20000) throw Error('Use up to 200 characters for the title and 20,000 for the content.');
  if (!title || !content) throw Error('Enter a title and content.');
  const paths = [...new Set(files.split(/\r?\n/).map(path => path.trim()).filter(Boolean))];
  if (paths.length > 20 || paths.some(path => path.length > 1024 || !attachment(path))) {
    throw Error('Choose up to 20 files from mn_manage/mn_files/ or common/file/cl.file/.');
  }
  return { title, content, published, attachment_paths: paths };
}

function closeDetail(restoreFocus = false) {
  const previous = selectedButton;
  selectedButton?.removeAttribute('aria-current');
  selectedButton = null;
  selectedPost = null;
  $('.bd-layout').classList.remove('bd-show-detail');
  $('#bd-detail').hidden = true;
  $('#bd-detail-placeholder').hidden = false;
  if (restoreFocus) previous?.focus();
}

function renderPost(row, author) {
  const title = $('#bd-detail-title');
  title.textContent = row.title;
  $('#bd-detail-meta').textContent = [dateLabel(row.created_at), author, row.published ? '' : 'Draft'].filter(Boolean).join(' · ');
  const content = $('#bd-detail-content');
  content.replaceChildren(...row.content.trim().split(/\n\s*\n/).filter(Boolean).map(block => element('p', block)));
  const files = (row.attachment_paths || []).map(attachment).filter(Boolean);
  $('#bd-attachments').hidden = !files.length;
  $('#bd-detail-files').replaceChildren(...files.map(link => {
    const item = element('li');
    const fileName = element('span', link.download);
    const actions = element('div');
    actions.className = 'notice-actions';
    if (/\.(?:pdf|txt|png|apng|jpe?g|gif|webp|avif|bmp|ico|mp3|wav|ogg|mp4|webm)$/i.test(link.download)) {
      const preview = element('a', 'Preview');
      preview.className = 'onuri-button bd-file-action';
      preview.href = link.href;
      preview.target = '_blank';
      preview.rel = 'noopener noreferrer';
      actions.append(preview);
    }
    link.textContent = 'Download';
    link.className = 'onuri-button bd-file-action';
    link.setAttribute('aria-label', link.download + ' Download');
    actions.append(link);
    item.append(fileName, actions);
    return item;
  }));
}

function showDetail(row, author, button) {
  if (pending || draft) return;
  selectedButton?.removeAttribute('aria-current');
  selectedButton = button;
  selectedPost = { row, author };
  button.setAttribute('aria-current', 'true');
  renderPost(row, author);
  setEditing(false);
  $('#bd-delete').onclick = () => {
    deleting = row;
    $('#delete-title').textContent = row.title;
    $('#delete-status').textContent = '';
    $('#delete-dialog').showModal();
  };
  $('#bd-detail-placeholder').hidden = true;
  $('#bd-detail').hidden = false;
  $('.bd-layout').classList.add('bd-show-detail');
  $('#bd-detail-title').focus();
  if (row.published) {
    client.rpc('bd_register_view', { post_id: row.board_id, post_type: boardType }).then(({ data, error }) => {
      if (!error && data != null) row.view_count = data;
    }, () => {});
  }
}

function setEditing(editing) {
  if (editing && (!admin || !selectedPost)) return;
  const title = $('#bd-detail-title');
  const content = $('#bd-detail-content');
  $('#bd-edit').hidden = !admin || editing;
  $('#bd-delete').hidden = !admin || Boolean(draft);
  $('#bd-save').hidden = $('#bd-cancel').hidden = inlineForm.hidden = !editing;
  $('#bd-inline-status').textContent = '';
  for (const field of [title, content]) {
    if (editing) field.setAttribute('contenteditable', 'plaintext-only');
    else field.removeAttribute('contenteditable');
  }
  for (const field of ['title', 'content']) {
    $('#bd-new-' + field + '-label').hidden = !draft;
    $('#bd-new-' + field).disabled = !draft;
  }
  content.hidden = title.hidden = Boolean(draft);
  if (!editing) return;
  const { row } = selectedPost;
  pickedFiles.clear();
  content.textContent = row.content;
  filePaths = [...(row.attachment_paths || [])];
  renderChosenFiles();
  $('#bd-post-date').value = dateLabel(row.created_at);
  if (!draft) title.focus();
}

$('#bd-edit').addEventListener('click', () => setEditing(true));
$('#bd-cancel').addEventListener('click', () => {
  if (!selectedPost || pending) return;
  if (draft) {
    discardDraft();
    $('#new-notice').focus();
    return;
  }
  renderPost(selectedPost.row, selectedPost.author);
  setEditing(false);
  $('#bd-edit').focus();
});

inlineForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (!admin || !selectedPost || pending) return;
  const { row, author } = selectedPost;
  const status = $('#bd-inline-status');
  pending = $('#bd-save').disabled = $('#bd-delete').disabled = true;
  status.textContent = 'Saving…';
  try {
    const creating = Boolean(draft);
    const title = creating ? $('#bd-new-title').value : $('#bd-detail-title').innerText;
    const content = creating ? $('#bd-new-content').value : $('#bd-detail-content').innerText;
    const values = postValues(title, content, filePaths.join('\n'), row.published);
    const date = $('#bd-post-date').value;
    if (!date) throw Error('Select a date.');
    if (date !== dateLabel(row.created_at)) values.created_at = new Date(date + 'T00:00:00+09:00').toISOString();
    await checkSelectedFiles(values.attachment_paths);
    await verify();
    const table = client.from('tbl_board');
    const query = creating ? table.insert({ ...values, board_type: boardType }) :
      table.update(values).eq('board_type', boardType).eq('board_id', row.board_id).eq('updated_at', row.updated_at);
    const { data, error } = await query.select(fields).maybeSingle();
    if (error || !data) throw Error('Could not save. Check the post in the list and try again.');
    if (creating) {
      discardDraft();
      keyword = '';
      $('#bd-keyword').value = '';
      await load(true);
      const saved = document.getElementById('bd-post-' + data.board_id);
      if (saved) {
        pending = false;
        saved.click();
      }
      return;
    }
    Object.assign(row, data);
    if (selectedPost?.row !== row) return;
    renderPost(row, author);
    await load();
    pending = false;
    document.getElementById('bd-post-' + row.board_id)?.click();
  } catch (error) {
    status.textContent = error.message;
  } finally {
    pending = $('#bd-save').disabled = $('#bd-delete').disabled = false;
  }
});

const pickedFiles = new Set();
let filePaths = [];
function renderChosenFiles() {
  $('#bd-edit-files').replaceChildren(...filePaths.map(path => {
    const name = path.split('/').at(-1);
    const item = element('li');
    const remove = element('button', 'Remove');
    remove.type = 'button';
    remove.className = 'onuri-button bd-file-action';
    remove.setAttribute('aria-label', name + ' Remove');
    remove.onclick = () => {
      filePaths = filePaths.filter(file => file !== path);
      pickedFiles.delete(path);
      renderChosenFiles();
      $('#bd-file-input').focus();
    };
    item.append(element('span', name), remove);
    return item;
  }));
}
$('#bd-file-input').addEventListener('change', event => {
  for (const file of event.target.files) {
    const path = 'mn_manage/mn_files/' + file.name;
    if (filePaths.includes(path)) continue;
    filePaths.push(path);
    pickedFiles.add(path);
  }
  renderChosenFiles();
  event.target.value = '';
});

const dateInput = $('#bd-post-date');
dateInput.addEventListener('click', () => {
  try { dateInput.showPicker?.(); } catch { /* The native calendar remains available. */ }
});
dateInput.addEventListener('input', () => {
  if (draft) draft.cells[1].textContent = dateInput.value;
});

async function checkSelectedFiles(paths) {
  if (location.protocol === 'file:') return;
  for (const path of paths.filter(path => pickedFiles.has(path))) {
    const response = await fetch(attachment(path).href, { method: 'HEAD', cache: 'no-store' });
    if (!response.ok) throw Error('Place the file in mn_manage/mn_files and try saving again. (' + path.split('/').at(-1) + ')');
  }
}

function openDraft() {
  if (!admin || pending || draft) return;
  revision++;
  closeDetail();
  const row = { title: '', content: '', attachment_paths: [], created_at: new Date().toISOString(), published: true };
  draft = element('tr');
  draft.className = 'bd-draft-row';
  draft.setAttribute('aria-label', 'Unsaved post');
  draft.append(element('td'), element('td', dateLabel(row.created_at)), element('td'));
  list.prepend(draft);
  selectedPost = { row, author: '' };
  renderPost(row, '');
  $('#bd-detail-title').textContent = 'New post';
  $('#bd-detail-placeholder').hidden = true;
  $('#bd-detail').hidden = false;
  $('.bd-layout').classList.add('bd-show-detail');
  $('#bd-new-title').value = '';
  $('#bd-new-content').value = '';
  setEditing(true);
  $('#bd-detail-title').removeAttribute('contenteditable');
  $('#bd-new-title').focus();
}

function discardDraft() {
  draft?.remove();
  draft = null;
  closeDetail();
}

function renderPagination(totalPages) {
  const nav = $('#bd-pages');
  nav.replaceChildren();
  if (totalPages < 2) return;
  const first = Math.floor((page - 1) / 10) * 10 + 1;
  const last = Math.min(first + 9, totalPages);
  function button(label, target, disabled = false, current = false) {
    const control = element('button', label);
    control.type = 'button';
    control.disabled = disabled;
    if (current) control.setAttribute('aria-current', 'page');
    control.onclick = () => { page = target; load(); };
    nav.append(control);
  }
  button('Previous', page - 1, page === 1);
  for (let number = first; number <= last; number++) button(number, number, number === page, number === page);
  button('Next', page + 1, page === totalPages);
}

async function load(reset = false) {
  closeDetail();
  if (draft) return;
  if (reset) page = 1;
  const ticket = ++revision;
  const size = Number($('#bd-size').value);
  const offset = (page - 1) * size;
  status.textContent = 'Loading posts…';
  list.replaceChildren();
  $('#bd-pages').replaceChildren();
  try {
    let query = client.from('tbl_board').select(fields, { count: 'exact' }).eq('board_type', boardType);
    if (!admin) query = query.eq('published', true);
    if (keyword) {
      const literal = keyword.replace(/[.*+?^$(){}|[\]\\]/g, '\\$&');
      query = query.filter(searchField, 'imatch', literal);
    }
    const { data: rows, count, error } = await query.order('created_at', { ascending: false })
      .order('board_id', { ascending: false }).range(offset, offset + size - 1);
    if (ticket !== revision) return;
    if (error && !(error.code === 'PGRST103' && count != null)) throw error;
    const totalPages = Math.max(1, Math.ceil(count / size));
    if (page > totalPages) { page = totalPages; return load(); }
    const posts = rows || [];
    const authors = posts.length ? await client.rpc('board_author_names', { ids: posts.map(row => row.board_id) }) : { data: [] };
    if (ticket !== revision) return;
    const names = new Map((authors.data || []).map(author => [author.board_id, author.display_name]));
    for (const row of posts) {
      const tr = element('tr');
      const subject = element('td');
      const link = element('a', row.title);
      link.href = '#bd-detail';
      link.id = 'bd-post-' + row.board_id;
      link.className = 'bd-subject';
      subject.append(link);
      if (!row.published) subject.append(element('span', ' · Draft'));
      const author = names.get(row.board_id) || '—';
      const fileCount = (row.attachment_paths || []).length;
      link.addEventListener('click', event => {
        event.preventDefault();
        showDetail(row, author, link);
      });
      tr.addEventListener('click', event => {
        if (!event.target.closest('a,button')) link.click();
      });
      tr.append(subject, element('td', dateLabel(row.created_at)), element('td', fileCount ? String(fileCount) : ''));
      list.append(tr);
    }
    if (!posts.length) {
      const row = element('tr');
      const cell = element('td', keyword ? 'No matching posts.' : 'No posts yet.');
      cell.colSpan = 3;
      row.append(cell);
      list.append(row);
    }
    status.textContent = count.toLocaleString('en-US') + ' posts (page ' + page + ' of ' + totalPages + ')';
    renderPagination(totalPages);
  } catch {
    if (ticket === revision) status.textContent = 'Could not load posts. Try again.';
  }
}

$('#bd-search').addEventListener('submit', event => {
  event.preventDefault();
  keyword = $('#bd-keyword').value.trim();
  searchField = $('#bd-field').value === 'content' ? 'content' : 'title';
  load(true);
});
$('#bd-size').addEventListener('change', () => load(true));
$('#admin-login').addEventListener('click',()=>{$('#login-status').textContent='';$('#login-dialog').showModal();});
$('#login-form').addEventListener('submit',async e=>{e.preventDefault();if(pending)return;busy($('#login-form'),true);$('#login-status').textContent='Signing in…';try{const {error}=await client.auth.signInWithPassword({email:$('#admin-email').value.trim(),password:$('#admin-password').value});$('#admin-password').value='';if(error)throw Error('Check your email and password, and verify your email address.');const user=await verify();ui(user);$('#login-dialog').close();await load(true);}catch(error){await client.auth.signOut({scope:'local'});$('#login-status').textContent=error.message;}finally{busy($('#login-form'),false);}});
$('#new-notice').addEventListener('click', openDraft);
$('#confirm-delete').addEventListener('click',async()=>{if(pending||!admin||!deleting)return;busy($('#delete-dialog'),true);$('#delete-status').textContent='Deleting…';try{await verify();const {data,error}=await client.from('tbl_board').delete().eq('board_type',boardType).eq('board_id',deleting.board_id).eq('updated_at',deleting.updated_at).select('board_id');if(error)throw Error('Could not delete. Check your permissions and connection.');if(!data?.length)throw Error('The post has changed or access was denied. Reload the list.');$('#delete-dialog').close();await load(true);}catch(error){$('#delete-status').textContent=error.message;}finally{busy($('#delete-dialog'),false);}});
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>$('#'+b.dataset.close).close()));
for(const id of ['login-dialog','delete-dialog'])$('#'+id).addEventListener('cancel',e=>{if(pending)e.preventDefault();});
$('#login-dialog').addEventListener('close',()=>{$('#admin-password').value='';});
client.auth.onAuthStateChange(event=>{if(event==='SIGNED_OUT'){ui(null);setTimeout(()=>load(true),0);}});
ui(null);
(async()=>{
 try{const {data}=await client.auth.getSession();if(data?.session)ui(await verify());}catch{}
 await load(true);
})();
})();
