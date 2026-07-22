export function AdminAccessGate({ user, access, onHome, onLogin, children }) {
  if (access.loading) {
    return <div className="admin-state panel">관리자 권한을 확인하는 중...</div>;
  }
  if (!user) {
    return (
      <div className="admin-state panel">
        <span className="admin-state-icon">🔐</span>
        <h1>관리자 로그인이 필요해요</h1>
        <p>등록된 관리자 계정으로 로그인한 뒤 다시 열어 주세요.</p>
        <div><button className="primary" type="button" onClick={onLogin}>로그인</button></div>
      </div>
    );
  }
  if (!access.isAdmin) {
    return (
      <div className="admin-state panel">
        <span className="admin-state-icon">⛔</span>
        <h1>접근 권한이 없습니다</h1>
        <p>현재 계정의 회원 레벨은 관리자 권한이 아닙니다.</p>
        <code>{user.uid}</code>
        <div><button className="ghost" type="button" onClick={onHome}>홈으로</button></div>
      </div>
    );
  }
  return children;
}
