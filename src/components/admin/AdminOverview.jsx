export function AdminOverview({ data }) {
  const pending = data.submissions.filter(({ status }) => status === 'pending').length;
  const cards = [
    ['게시물', data.posts.length, '구례 피드 콘텐츠'],
    ['추천 코스', data.courses.length, '구례 로컬 동선'],
    ['전체 회원', data.users.length, 'Firebase 가입 계정'],
    ['기존 검토 대기', pending, '이전 맛집 제보'],
  ];

  return (
    <div className="admin-overview">
      <div className="admin-stat-grid">
        {cards.map(([label, value, note]) => (
          <article className="admin-stat panel" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{note}</small>
          </article>
        ))}
      </div>
      <article className="admin-welcome panel">
        <div>
          <p className="eyebrow">TODAY'S CHECKLIST</p>
          <h2>구례 로컬 콘텐츠 운영 현황</h2>
        </div>
        <ul>
          <li><b>{pending}건</b>의 기존 맛집 제보 검토</li>
          <li>게시물과 코스의 구례 주소·프랜차이즈 여부 확인</li>
          <li>회원 레벨 변경 내역과 관리자 권한 점검</li>
        </ul>
      </article>
    </div>
  );
}
