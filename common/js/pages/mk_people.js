(() => {
  'use strict';

  const get = id => document.getElementById(id);
  // Legacy browser evaluation keys used the former employee IDs.
  const legacyIds = new Map([
    ["HQ_001","onuri-lead"],
    ["ECP_001","agt-001"],
    ["ECP_002","agt-002"],
    ["ECP_003","studio-001"],
    ["ECP_004","studio-002"],
    ["ECP_005","studio-006"],
    ["LPM_002","agt-003"],
    ["LPM_001","agt-004"],
    ["LPM_003","studio-005"],
    ["LPM_004","studio-007"],
    ["PT_002","agt-005"],
    ["PT_001","studio-008"],
    ["OQ_002","studio-004"],
    ["OQ_001","agt-006"],
    ["OQ_003","studio-003"],
    ["OQ_004","agt-007"],
  ]);
  const client = window.eduNoticeClient;
  const login = get('staff-db-login');
  const dbStatus = get('staff-db-status');
  const loginTab = get('staff-login-new-tab');
  if (window.parent !== window) {
    loginTab.hidden = false;
    loginTab.addEventListener('click', () => {
      window.parent.postMessage({ type: 'onuri:staff-login-tab' }, '*');
    });
  }

  login.addEventListener('submit', async event => {
    event.preventDefault();
    const button = login.querySelector('button');
    button.disabled = true;
    dbStatus.textContent = '연결 중입니다.';
    try {
      const fields = new FormData(login);
      const auth = await client.auth.signInWithPassword({
        email: fields.get('username').trim(), password: fields.get('password'),
      });
      if (auth.error) throw Error('관리자 이메일과 비밀번호를 확인해 주세요.');
      await openWorkspace();
    } catch (error) {
      await client.auth.signOut({ scope: 'local' });
      dbStatus.textContent = error.message;
    } finally {
      login.elements.namedItem('password').value = '';
      button.disabled = false;
    }
  });

  async function openWorkspace() {
    await window.eduDbAdmin();
    const { data, error } = await client.from('tbl_emp')
      .select('*, tbl_dept(tbl_comcode(name))').order('sort_order');
    if (error) throw Error('DB에서 팀원 목록을 불러올 수 없습니다.');
    initialize(data.map(row => ({
      ...row.profile, id: row.emp_code, code: row.emp_code, name: row.name,
      rank: row.rank, team: row.tbl_dept.tbl_comcode.name,
    })));
    login.remove();
    get('staff-workspace').hidden = false;
    dbStatus.textContent = '';
  }

  client.auth.onAuthStateChange(event => {
    if (event === 'SIGNED_OUT' && !login.isConnected) location.reload();
  });

  async function restoreWorkspace() {
    const button = login.querySelector('button');
    button.disabled = true;
    try {
      const { data } = await client.auth.getSession();
      if (data?.session) await openWorkspace();
    } catch (error) {
      dbStatus.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  }

  restoreWorkspace();

  function initialize(staff) {
    const search = get('staff-search');
    const list = get('staff-list');
    const card = get('staff-card');
    const title = get('reader-title');
    const placeholder = get('staff-placeholder');
    const toggle = get('staff-toggle');
    const status = get('staff-evaluation-status');
    const dateFormat = new Intl.DateTimeFormat('en', {
      year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Seoul',
    });

    function formatEvaluationDate(date) {
      const parts = Object.fromEntries(dateFormat.formatToParts(new Date(date)).map(({ type, value }) => [type, value]));
      return [parts.year, parts.month, parts.day].join('-');
    }
    const workForm = get('staff-work-form');
    const deleteRecord = get('staff-delete-record');
    const saveButton = document.querySelector('button[form="staff-work-form"]');
    const assessment = workForm.elements.namedItem('assessment');
    const rating = workForm.elements.namedItem('rating');
    const stars = Array.from(rating);
    let editing = null;
    let selected = null;
    const ranks = ['파트장', '선임', '팀원'];
    const rankLabel = person => person.rank === -1 ? '전체 총괄' : ranks[person.rank];
    const teams = new Map();
    const org = get('staff-org');
    const orgToggle = get('staff-org-toggle');

    const normalize = value => value.normalize('NFKC').toLocaleLowerCase('ko');

    const entries = [...staff].sort((a, b) => a.rank - b.rank).map(person => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      const name = document.createElement('strong');
      const role = document.createElement('small');
      button.type = 'button';
      button.className = 'report-item';
      name.textContent = person.name;
      role.textContent = rankLabel(person);
      button.append(name, role);
      item.append(button);
      button.addEventListener('click', event => {
        select(person);
        if (event.detail === 0 || matchMedia('(max-width: 600px)').matches) title.focus();
      });
      const searchable = normalize([person.name, person.team, rankLabel(person), person.role, person.mission,
        ...person.duties, person.personality, person.outfit, person.strengths, person.review].join(' '));
      return { person, item, button, searchable };
    });

    function showOrganization() {
      select(null);
      placeholder.hidden = true;
      org.hidden = false;
      orgToggle.setAttribute('aria-current', 'true');
      get('staff-org-title').focus();
    }

    function renderOrgMembers(people) {
      const members = document.createElement('ul');
      members.className = 'staff-org-members';
      for (const person of people) {
        const item = document.createElement('li');
        const button = document.createElement('button');
        const image = document.createElement('img');
        const name = document.createElement('strong');
        const role = document.createElement('span');
        button.type = 'button';
        button.className = 'staff-org-person';
        image.src = '../common/images/mk.image/' + person.image;
        image.alt = '';
        image.loading = 'lazy';
        name.textContent = person.name;
        role.textContent = person.role;
        const rank = document.createElement('span');
        rank.textContent = rankLabel(person);
        const info = document.createElement('div');
        info.className = 'staff-org-info';
        info.append(name, rank, role);
        const portrait = document.createElement('span');
        portrait.className = 'staff-org-face';
        portrait.append(image);
        button.append(portrait, info);
        button.addEventListener('click', () => {
          select(person);
          title.focus();
        });
        item.append(button);
        members.append(item);
      }
      return members;
    }

    const orgTeams = get('staff-org-teams');
    const directors = staff.filter(person => person.rank === -1);
    if (directors.length) {
      const root = document.createElement('section');
      const heading = document.createElement('h3');
      root.className = 'staff-org-root';
      heading.textContent = '전체 총괄';
      root.append(heading, renderOrgMembers(directors));
      orgTeams.append(root);
    }

    const departments = document.createElement('div');
    departments.className = 'staff-org-branches';
    const departmentStaff = staff.filter(person => person.rank >= 0);
    for (const team of new Set(departmentStaff.map(person => person.team))) {
      const branch = document.createElement('section');
      const heading = document.createElement('h3');
      branch.className = 'staff-org-branch';
      heading.textContent = team;
      branch.append(heading);
      for (const rank of ranks.keys()) {
        const people = departmentStaff.filter(person => person.team === team && person.rank === rank);
        const level = document.createElement('div');
        level.className = 'staff-org-level';
        level.setAttribute('aria-label', ranks[rank]);
        if (people.length) {
          level.append(renderOrgMembers(people));
          branch.append(level);
        }
      }
      departments.append(branch);
    }
    orgTeams.append(departments);
    orgToggle.addEventListener('click', showOrganization);

    async function select(person) {
      org.hidden = true;
      orgToggle.removeAttribute('aria-current');
      if (person !== selected) {
        resetEditor();
      }
      status.textContent = '';
      selected = person;
      for (const entry of entries) {
        entry.button.setAttribute('aria-current', String(entry.person === selected));
      }
      placeholder.hidden = Boolean(person);
      card.hidden = !person;
      if (!person) return;
      saveButton.disabled = true;
      renderEvaluations([]);

      title.textContent = person.name;
      get('reader-meta').textContent = person.team + ' · ' + rankLabel(person);
      get('reader-summary').textContent = person.identity;
      get('staff-deliverable').textContent = person.deliverable;
      get('staff-code').textContent = person.code;
      const duties = person.duties.map(text => {
        const item = document.createElement('li');
        item.textContent = text;
        return item;
      });
      get('staff-duties').replaceChildren(...duties);
      get('staff-personality').textContent = person.personality;
      get('staff-outfit').textContent = person.outfit;
      get('staff-item').textContent = person.item;
      get('staff-strengths').textContent = person.strengths;
      get('staff-mission').textContent = person.mission;
      get('staff-review').textContent = person.review;
      const image = get('staff-image');
      image.alt = person.name + ' 캐릭터';
      image.src = '../common/images/mk.image/' + person.image;
      try {
        const records = await readEvaluations(person);
        if (selected === person) {
          renderEvaluations(records);
          saveButton.disabled = false;
        }
      } catch {
        if (selected !== person) return;
        renderEvaluations([]);
        get('staff-evaluation-empty').hidden = true;
        status.textContent = '저장된 평가 기록을 불러올 수 없습니다.';
      }
    }

    async function readEvaluations(person) {
      const key = 'onuri-staff-evaluations-v1:' + (legacyIds.get(person.code) ?? person.code);
      let legacy = [];
      try {
        legacy = JSON.parse(localStorage.getItem(key) ?? '[]');
      } catch {}
      const imports = legacy.filter(record => !record.deleted && record.assessment?.trim()).map(record => {
        const rating = Number(record.rating ?? record.points ?? NaN);
        return {
          member_id: person.id, assessment: record.assessment.trim(),
          evaluated_at: record.evaluatedAt ?? record.date,
          rating: Number.isInteger(rating) && rating >= 0 && rating <= 5 ? rating : null,
          details: record, import_key: record.id ?? JSON.stringify([record.date, record.work, record.assessment]),
        };
      });
      if (imports.length) {
        const { error } = await client.from('tbl_evalu').upsert(imports, {
          onConflict: 'member_id,import_key', ignoreDuplicates: true,
        });
        if (error) throw error;
        try {
          localStorage.setItem(key, JSON.stringify(legacy.filter(record => record.deleted || !record.assessment?.trim())));
        } catch {}
      }
      const { data, error } = await client.from('tbl_evalu')
        .select('id, assessment, rating, evaluated_at, details')
        .eq('member_id', person.id).order('evaluated_at', { ascending: false });
      if (error) throw error;
      return data.map(row => ({
        ...row.details, id: row.id, assessment: row.assessment, rating: row.rating, evaluatedAt: row.evaluated_at,
      }));
    }

    function renderEvaluations(records) {
      const ratings = records.map(record => record.rating ?? record.points)
        .filter(rating => Number.isInteger(rating) && rating >= 0 && rating <= 5);
      const average = ratings.length ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;
      get('staff-rating-stars').style.setProperty('--rating-fill', (average / 5 * 100) + '%');
      get('staff-rating-label').textContent = ratings.length
        ? average.toFixed(1) + ' / 5점 · ' + ratings.length + '건'
        : '평가 없음';
      get('staff-work-context').textContent = records.filter(record => record.improvement)
        .sort((a, b) => (b.evaluatedAt ?? b.date).localeCompare(a.evaluatedAt ?? a.date))
        .map(record => record.work + ' — ' + record.improvement).join('\n\n');
      const matches = records.filter(record => record.assessment);
      const history = get('staff-evaluations');
      history.replaceChildren();
      get('staff-evaluation-empty').hidden = matches.length > 0;
      get('staff-evaluation-empty').textContent = '등록된 평가가 없습니다.';
      for (const record of matches) {
        const row = document.createElement('tr');
        const score = Number(record.rating ?? record.points ?? NaN);
        const date = record.evaluatedAt ?? record.date;
        const cells = [record.assessment,
          Number.isInteger(score) && score >= 0 && score <= 5
            ? '★'.repeat(score) + '☆'.repeat(5 - score) : '—',
          formatEvaluationDate(date)];
        cells.forEach((value, index) => {
          const cell = document.createElement('td');
          if (index === 0) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'staff-record-link';
            button.textContent = value;
            cell.append(button);
          } else cell.textContent = value;
          row.append(cell);
        });
        row.addEventListener('click', () => {
          editing = record;
          assessment.value = record.assessment ?? '';
          for (const star of stars) star.checked = Number(star.value) === score;
          renderStars();
          deleteRecord.disabled = false;
          status.textContent = '선택한 기록을 수정할 수 있습니다.';
          assessment.focus();
        });
        history.append(row);
      }
    }


    function resetEditor() {
      editing = null;
      workForm.reset();
      renderStars();
      deleteRecord.disabled = true;
    }

    let saving = false;

    async function saveRecord(record, message) {
      if (saving) return;
      const person = selected;
      const existing = editing;
      saving = true;
      try {
        const table = client.from('tbl_evalu');
        const payload = record && { assessment: record.assessment, rating: record.rating, evaluated_at: record.evaluatedAt };
        const response = !record ? await table.delete().eq('id', existing.id).eq('member_id', person.id).select('id').single()
          : existing ? await table.update(payload).eq('id', existing.id).eq('member_id', person.id).select('id').single()
          : await table.insert({ ...payload, member_id: person.id }).select('id').single();
        if (response.error) throw response.error;
        if (selected !== person) return;
        resetEditor();
        status.textContent = message;
        try {
          const records = await readEvaluations(person);
          if (selected === person) renderEvaluations(records);
        } catch {
          if (selected === person) status.textContent = message + ' 목록을 다시 불러와 주세요.';
        }
      } catch {
        if (selected === person) status.textContent = 'DB에 기록을 반영할 수 없습니다. 연결 상태를 확인하세요.';
      } finally {
        saving = false;
      }
    }

    function renderStars() {
      for (const star of stars) {
        star.nextElementSibling.textContent = Number(star.value) <= Number(rating.value) ? '★' : '☆';
      }
    }

    workForm.addEventListener('change', renderStars);

    deleteRecord.addEventListener('click', () => {
      if (!selected || !editing) return;
      saveRecord(null, '기록을 삭제했습니다.');
    });

    workForm.addEventListener('submit', event => {
      event.preventDefault();
      if (!selected) return;
      const text = assessment.value.trim();
      const score = Number(rating.value);
      if (!text || !Number.isInteger(score) || score < 1 || score > 5) {
        status.textContent = '평가 내용과 별점을 입력하세요.';
        return;
      }
      const now = new Date().toISOString();
      const record = { evaluatedAt: now, assessment: text, rating: score };
      saveRecord(record, '기록을 저장했습니다.');
    });

    for (const team of new Set(staff.map(person => person.team))) {
      const group = document.createElement('details');
      const heading = document.createElement('summary');
      const members = document.createElement('ul');
      group.open = true;
      heading.textContent = team;
      group.append(heading, members);
      teams.set(team, { group, members });
      list.append(group);
    }

    function filter() {
      const query = normalize(search.value).trim();
      const terms = query.split(/\s+/);
      const matches = entries.filter(entry => terms.every(term => entry.searchable.includes(term)));
      const matchesByTeam = new Map();
      for (const entry of matches) {
        const team = entry.person.team;
        if (!matchesByTeam.has(team)) matchesByTeam.set(team, []);
        matchesByTeam.get(team).push(entry.item);
      }
      for (const [team, { group, members }] of teams) {
        const items = matchesByTeam.get(team) || [];
        group.hidden = items.length === 0;
        if (query && items.length) group.open = true;
        members.replaceChildren(...items);
      }
      get('report-count').textContent = matches.length === staff.length
        ? '전체 직원 ' + staff.length + '명'
        : '검색 결과 ' + matches.length + '명';
      placeholder.textContent = matches.length
        ? '목록에서 직원을 선택하세요.'
        : '검색 조건에 맞는 직원이 없습니다.';
      if (selected && !matches.some(entry => entry.person === selected)) select(null);
    }

    function setTeamsExpanded(expanded) {
      for (const { group } of teams.values()) group.open = expanded;
    }

    get('staff-expand-all').addEventListener('click', () => setTeamsExpanded(true));
    get('staff-collapse-all').addEventListener('click', () => setTeamsExpanded(false));

    toggle.addEventListener('click', () => {
      const collapsed = toggle.closest('.reading-layout').classList.toggle('list-collapsed');
      toggle.textContent = collapsed ? '›' : '‹';
      toggle.setAttribute('aria-expanded', String(!collapsed));
      toggle.setAttribute('aria-label', collapsed ? '직원 목록 펼치기' : '직원 목록 접기');
    });
    search.addEventListener('input', filter);
    filter();
  }
})();
