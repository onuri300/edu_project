'use strict';
window.eduNoticeClient = window.supabase.createClient('https://sqsynpvdtgaoklqzkwrw.supabase.co','sb_publishable_T8Uxfrz4CIRl2RNEZpVOFg_SXxOlOzW',{
  auth: { storageKey: 'onuri-db-session-v1', persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
});

window.eduDbAdmin = async function () {
  const { data, error } = await window.eduNoticeClient.auth.getUser();
  if (error || !data.user) throw Error('DB 관리자 로그인이 필요합니다.');
  const membership = await window.eduNoticeClient.from('tbl_users').select('user_id')
    .eq('user_id', data.user.id).maybeSingle();
  if (membership.error || !membership.data) throw Error('DB 관리자 권한을 확인할 수 없습니다.');
  return data.user;
};
