
  // 데모용 프론트엔드 폼 처리 (실제 전송은 백엔드/이메일 서비스 연동 필요)
  document.getElementById("contact-form").addEventListener("submit", function (e) {
    e.preventDefault();
    document.getElementById("form-status").textContent = "메시지가 준비되었습니다. (실제 전송은 이메일 서비스 연동 후 동작합니다)";
    this.reset();
  });
