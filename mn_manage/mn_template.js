window.eduBoardTemplate = `<div class="bd-layout document-reader reading-page">
<div class="bd-board-column bd-pane"><nav id="bd-board-pane" class="bd-nav reading-sidebar" aria-label="Board list">
  <h2>Boards</h2>
  <div id="bd-navigation">
  <a href="./mn_notice.html" data-board-key="notice">Notice 공지사항</a>
  <a href="./mn_library.html" data-board-key="library">Library 자료실</a>
  </div>
</nav><div class="reading-divider"><button type="button" class="document-sidebar-toggle" data-bd-toggle="boards" aria-controls="bd-board-pane" aria-expanded="true" aria-label="Collapse boards">‹</button></div></div>
<div class="bd-post-column bd-pane"><section id="bd-post-pane" class="bd-list reading-sidebar" aria-label="Post list">
<form id="bd-search" class="bd-search" role="search">
  <label><span class="bd-sr">Search by</span><select id="bd-field"><option value="title">Title</option><option value="content">Content</option></select></label>
  <label><span class="bd-sr">Keyword search</span><input id="bd-keyword" type="search" maxlength="100" placeholder="Enter a keyword"></label>
  <button type="submit"><svg aria-hidden="true" viewBox="0 0 24 24" class="bd-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 5 5"/></svg>Search</button>
</form>
<div class="bd-toolbar">
  <p id="notice-status" role="status"></p>
  <div class="bd-page-controls"><label for="bd-size">Per page</label><select id="bd-size"><option value="10">10</option><option value="20">20</option><option value="50">50</option></select><button id="new-notice" type="button" class="onuri-button" hidden>New</button></div>
</div>
<div class="bd-table-wrap" role="region" aria-label="Post list" tabindex="0">
  <table class="bd-table"><caption class="bd-sr">Post list</caption><colgroup><col><col><col></colgroup><thead><tr><th scope="col">Title</th><th scope="col">Date</th><th scope="col">Files</th></tr></thead><tbody id="notices"></tbody></table>
</div>
<nav id="bd-pages" class="notice-actions bd-pages" aria-label="Post pagination"></nav>
<div class="notice-actions bd-admin"><button id="admin-login" type="button">Admin sign-in</button></div>
</section><div class="reading-divider"><button type="button" class="document-sidebar-toggle" data-bd-toggle="posts" aria-controls="bd-post-pane" aria-expanded="true" aria-label="Collapse posts">‹</button></div></div>
<section class="bd-reader reading-content" aria-label="Post details">
  <p id="bd-detail-placeholder">Select a post to read it here.</p>
  <article id="bd-detail" aria-labelledby="bd-detail-title" hidden>
    <header class="bd-article-header"><h2 id="bd-detail-title" tabindex="-1"></h2><div class="notice-actions"><button type="button" class="onuri-button" id="bd-edit" hidden>Edit</button><button type="button" class="onuri-button" id="bd-cancel" hidden>Cancel</button><button type="submit" class="onuri-button" form="bd-inline-form" id="bd-save" hidden>Save</button><button type="button" class="onuri-button onuri-button-danger" id="bd-delete" hidden>Delete</button></div></header><p id="bd-detail-meta"></p>
    <div id="bd-detail-content" class="notice-content reader-markdown"></div>
    <section id="bd-attachments" aria-labelledby="bd-files-title" hidden>
      <h3 id="bd-files-title"><svg aria-hidden="true" viewBox="0 0 24 24" class="bd-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 13l7-7a3 3 0 0 1 4 4l-9 9a5 5 0 0 1-7-7l9-9"/></svg>Files</h3>
      <ul id="bd-detail-files"></ul>
    </section>
    <form id="bd-inline-form" class="bd-inline-form" hidden>
      <label class="bd-form-row" id="bd-new-title-label" hidden><span>Title</span><input id="bd-new-title" maxlength="200" required disabled></label>
      <label class="bd-form-row"><span>Date</span><input id="bd-post-date" type="date" required></label>
      <label class="bd-form-row" id="bd-new-content-label" hidden><span>Content</span><textarea id="bd-new-content" rows="5" maxlength="20000" required disabled></textarea></label>
      <div class="bd-form-row bd-edit-files"><span>Files</span><div>
        <label class="onuri-button bd-file-action bd-file-picker" for="bd-file-input">Choose files</label>
        <input id="bd-file-input" class="bd-sr" type="file" multiple>
        <ul id="bd-edit-files" aria-label="Selected files"></ul>
      </div></div>
      <p id="bd-inline-status" role="status"></p>
    </form>
  </article>
</section>
</div>
  <dialog id="login-dialog" class="notice-dialog surface-panel">
    <form id="login-form">
      <h2>Admin sign-in</h2><p>Sign in with your administrator account.</p>
      <label for="admin-email">Email</label><input id="admin-email" type="email" autocomplete="username" required>
      <label for="admin-password">Password</label><input id="admin-password" type="password" autocomplete="current-password" required>
      <p id="login-status" role="status" aria-live="polite"></p>
      <div class="notice-actions"><button type="button" data-close="login-dialog">Cancel</button><button type="submit">Sign in</button></div>
    </form>
  </dialog>
  <dialog id="delete-dialog" class="notice-dialog surface-panel">
    <h2>Delete post</h2><p id="delete-title"></p><p>Deleted posts cannot be restored.</p>
    <p id="delete-status" role="status" aria-live="polite"></p>
    <div class="notice-actions"><button type="button" data-close="delete-dialog">Cancel</button><button type="button" class="onuri-button onuri-button-danger" id="confirm-delete">Delete</button></div>
  </dialog>`;
