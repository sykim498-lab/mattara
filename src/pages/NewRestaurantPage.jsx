import { useState } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { RestaurantForm } from '../components/RestaurantForm';
import { submitRestaurant } from '../services/authService';

export function NewRestaurantPage({ user, loading, onHome, onLogin }) {
  const [submitted, setSubmitted] = useState(false);

  if (loading) {
    return <main className="view status-view">로그인 상태를 확인하고 있어요…</main>;
  }

  if (!user) {
    return (
      <section className="view status-view">
        <div className="panel auth-required">
          <span aria-hidden="true">🔐</span>
          <h1>로그인이 필요한 기능이에요</h1>
          <p>맛집 등록은 소셜 계정으로 로그인한 사용자만 할 수 있습니다.</p>
          <button className="primary" type="button" onClick={onLogin}>로그인하기</button>
        </div>
      </section>
    );
  }

  if (submitted) {
    return (
      <section className="view status-view">
        <div className="panel auth-required">
          <span aria-hidden="true">✅</span>
          <h1>맛집 등록 요청을 받았어요</h1>
          <p>관리자 검수가 끝나면 새로운 맛집 피드에 공개됩니다.</p>
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
          <p>직접 다녀온 곳의 생생한 이야기를 남겨 주세요. 검수 후 피드에 공개됩니다.</p>
        </div>
        <RestaurantForm
          userId={user.id}
          onSubmit={async (values) => {
            await submitRestaurant(values);
            setSubmitted(true);
          }}
        />
      </div>
    </section>
  );
}
