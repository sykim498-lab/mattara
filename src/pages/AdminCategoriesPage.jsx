import { useState } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { CategoryForm } from '../components/CategoryForm';

export function AdminCategoriesPage({ categoryStore, onHome, embedded = false }) {
  const [editingId, setEditingId] = useState(null);
  const { categories, addCategory, updateCategory, deleteCategory, resetCategories } =
    categoryStore;
  const editingCategory = categories.find(({ id }) => id === editingId);

  const saveCategory = (values) => {
    if (editingCategory) {
      updateCategory(editingCategory.id, values);
      setEditingId(null);
    } else {
      addCategory(values);
    }
  };

  const removeCategory = (category) => {
    if (category.protected) return;
    if (window.confirm(`‘${category.label}’ 카테고리를 삭제할까요?`)) {
      deleteCategory(category.id);
      if (editingId === category.id) setEditingId(null);
    }
  };

  const contents = (
    <>
        <div className="admin-heading">
          <div>
            <p className="eyebrow">ADMIN · FEED SETTINGS</p>
            <h1>피드 카테고리 관리</h1>
            <p>사용자에게 보여줄 필터와 게시물 태그의 연결 기준을 관리합니다.</p>
          </div>
          <button className="ghost" type="button" onClick={resetCategories}>
            기본값 복원
          </button>
        </div>
        <div className="admin-layout">
          <div className="category-list panel">
            <div className="list-heading">
              <strong>노출 중인 카테고리</strong>
              <span>{categories.length}개</span>
            </div>
            {categories.map((category) => (
              <article className="category-row" key={category.id}>
                <span className="category-icon" aria-hidden="true">
                  {category.icon || '◻'}
                </span>
                <div className="category-copy">
                  <strong>{category.label}</strong>
                  <small>
                    {category.protected
                      ? '모든 게시물을 보여주는 시스템 카테고리'
                      : category.matchTags.map((tag) => `#${tag}`).join(' · ')}
                  </small>
                </div>
                <div className="row-actions">
                  <button type="button" onClick={() => setEditingId(category.id)}>
                    수정
                  </button>
                  <button
                    className="danger"
                    type="button"
                    onClick={() => removeCategory(category)}
                    disabled={category.protected}
                  >
                    삭제
                  </button>
                </div>
              </article>
            ))}
          </div>
          <CategoryForm
            key={editingCategory?.id ?? 'new-category'}
            editingCategory={editingCategory}
            onCancel={() => setEditingId(null)}
            onSave={saveCategory}
          />
        </div>
        <p className="admin-note">
          현재 프로토타입에서는 이 브라우저에 저장됩니다. 운영 환경에서는 관리자
          인증과 서버 API를 통해 같은 데이터 구조를 저장하도록 연결합니다.
        </p>
    </>
  );

  if (embedded) return <div className="admin-categories-embedded">{contents}</div>;
  return (
    <section className="view admin-view">
      <div className="shell">
        <Breadcrumbs items={[{ label: '홈 피드', onClick: onHome }, { label: '카테고리 관리' }]} />
        {contents}
      </div>
    </section>
  );
}
