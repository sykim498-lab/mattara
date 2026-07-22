import { useEffect, useRef, useState } from 'react';
import { AdminAccessGate } from '../components/admin/AdminAccessGate';
import { AdminMembers } from '../components/admin/AdminMembers';
import { AdminOverview } from '../components/admin/AdminOverview';
import { AdminResourcePanel } from '../components/admin/AdminResourcePanel';
import { AdminSubmissions } from '../components/admin/AdminSubmissions';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useAdminData } from '../hooks/useAdminData';
import { promoteLegacyMembers } from '../services/adminService';
import { AdminCategoriesPage } from './AdminCategoriesPage';

const TABS = [
  ['overview', '운영 현황'],
  ['members', '회원 관리'],
  ['posts', '게시물'],
  ['courses', '추천 코스'],
  ['submissions', '맛집 제보'],
  ['categories', '피드 카테고리'],
];

export function AdminPage({ user, access, categoryStore, onHome, onLogin }) {
  const data = useAdminData(access.isAdmin);
  const [tab, setTab] = useState('overview');
  const migrated = useRef(false);

  useEffect(() => {
    if (!access.isAdmin || migrated.current || !data.users.length) return;
    const legacyIds = data.users.filter(({ role }) => !role).map(({ documentId }) => documentId);
    if (!legacyIds.length) {
      migrated.current = true;
      return;
    }
    migrated.current = true;
    promoteLegacyMembers(legacyIds).catch(() => {
      migrated.current = false;
    });
  }, [access.isAdmin, data.users]);

  const content = () => {
    if (data.loading) return <div className="admin-state panel">관리 데이터를 불러오는 중...</div>;
    if (data.error) return <div className="admin-state panel">{data.error}</div>;
    if (tab === 'members') return <AdminMembers users={data.users} currentUserId={user.uid} />;
    if (tab === 'posts') return <AdminResourcePanel type="posts" items={data.posts} />;
    if (tab === 'courses') return <AdminResourcePanel type="courses" items={data.courses} />;
    if (tab === 'submissions') return <AdminSubmissions submissions={data.submissions} />;
    if (tab === 'categories') return <AdminCategoriesPage embedded categoryStore={categoryStore} />;
    return <AdminOverview data={data} />;
  };

  return (
    <section className="view admin-dashboard-view">
      <div className="shell">
        <Breadcrumbs items={[{ label: '홈 피드', onClick: onHome }, { label: '관리자 센터' }]} />
        <AdminAccessGate user={user} access={access} onHome={onHome} onLogin={onLogin}>
          <div className="admin-dashboard-head">
            <div>
              <p className="eyebrow">MATTARA ADMIN CENTER</p>
              <h1>맛따라 관리자 센터</h1>
              <p>구례 로컬 콘텐츠와 회원 권한을 한곳에서 운영합니다.</p>
            </div>
            <span className="admin-account">관리자 · {user?.email}</span>
          </div>
          <nav className="admin-tabs" aria-label="관리자 메뉴">
            {TABS.map(([id, label]) => (
              <button className={tab === id ? 'active' : ''} type="button" onClick={() => setTab(id)} key={id}>{label}</button>
            ))}
          </nav>
          {content()}
        </AdminAccessGate>
      </div>
    </section>
  );
}
