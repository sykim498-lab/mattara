import { useState } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { RestaurantForm } from '../components/RestaurantForm';
import { publishRestaurant } from '../services/authService';

export function NewRestaurantPage({ user, loading, onHome, onLogin }) {
  const [publication, setPublication] = useState(null);

  if (loading) {
    return <main className="view status-view">로그인 상태를 확인하고 있어요…</main>;
  }

  if (!user) {
    return (
      <section className="view status-view">
        <div className="panel auth-required">
          <span aria-hidden="true">🔐</span>
          <h1>로그인이 필요한 기능이에요</h1>
          <p>맛집 등록은 로그인한 회원만 할 수 있습니다.</p>
          <button className="primary" type="button" onClick={onLogin}>로그인하기</button>
        </div>
      </section>
    );
  }

  if (publication) {
    return (
      <section className="view status-view">
        <div className="panel auth-required">
          <span aria-hidden="true">✅</span>
          <h1>새 게시물이 공개됐어요</h1>
          <p>등록한 맛집을 홈 피드에서 바로 확인할 수 있습니다.</p>
          {publication.imageMode === 'default' && (
            <p>사진을 처리하지 못해 대표 기본 이미지로 게시했습니다.</p>
          )}
          <button className="primary" type="button" onClick={onHome}>홈으로 돌아가기</button>
        </div>
      </section>
    );
  }

  return (
    <section className="view submission-view">
      <div className="shell submission-shell">
        <Breadcrumbs items={[{ label: '홈 피드', onClick: onHome }, { label: '맛집 등록' }]} />
        <div className="submission-heading">
          <p className="eyebrow">SHARE YOUR TASTE</p>
          <h1>새로운 맛집을 알려주세요</h1>
          <p>직접 다녀온 곳의 생생한 이야기를 남기면 피드에 바로 공개됩니다.</p>
        </div>
        <RestaurantForm
          userId={user.uid ?? user.id}
          onSubmit={async (values) => {
            const result = await publishRestaurant({
              ...values,
              author_email: user.email,
              author_name: user.displayName || user.email?.split('@')[0] || '구례 여행자',
            });
            setPublication(result);
          }}
        />
      </div>
    </section>
  );
}
