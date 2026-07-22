export function Header({ user, onAdmin, onAuth, onHome, onNewPost, onSaved, onSignOut }) {
  const accountName = user?.displayName ?? user?.email?.split('@')[0];
  return (
    <header className="topbar">
      <div className="shell nav">
        <a className="brand" href="#/home" onClick={onHome} aria-label="맛따라 홈으로 이동">
          <img
            className="brand-logo"
            src={`${import.meta.env.BASE_URL}mattara-logo.png`}
            alt=""
            aria-hidden="true"
          />
          <span>맛따라</span>
        </a>
        <nav className="nav-right" aria-label="주요 메뉴">
          <button className="ghost" type="button" onClick={onHome}>
            맛집 둘러보기
          </button>
          <button className="ghost admin-link" type="button" onClick={onAdmin}>
            카테고리 관리
          </button>
          <button className="ghost" type="button" onClick={onSaved}>
            마이페이지
          </button>
          <button className="primary" type="button" onClick={onNewPost}>
            맛집 등록
          </button>
          {user ? (
            <button className="account-button" type="button" onClick={onSignOut}>
              {accountName ? `${accountName} · 로그아웃` : '로그아웃'}
            </button>
          ) : (
            <button className="account-button" type="button" onClick={onAuth}>
              로그인
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
