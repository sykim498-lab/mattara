import { useState } from 'react';

const EMPTY_FORM = { label: '', icon: '', tags: '' };

function toForm(category) {
  if (!category) return EMPTY_FORM;
  return {
    label: category.label,
    icon: category.icon,
    tags: category.matchTags.join(', '),
  };
}

export function CategoryForm({ editingCategory, onCancel, onSave }) {
  const [form, setForm] = useState(() => toForm(editingCategory));
  const [error, setError] = useState('');

  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const submit = (event) => {
    event.preventDefault();
    const matchTags = form.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (!form.label.trim()) {
      setError('카테고리 이름을 입력해 주세요.');
      return;
    }
    if (!editingCategory?.protected && !matchTags.length) {
      setError('피드 분류에 사용할 연결 태그를 하나 이상 입력해 주세요.');
      return;
    }

    onSave({
      label: form.label.trim(),
      icon: form.icon.trim(),
      matchTags: editingCategory?.protected ? [] : matchTags,
    });
    if (!editingCategory) setForm(EMPTY_FORM);
    setError('');
  };

  return (
    <form className="category-form panel" onSubmit={submit}>
      <div className="form-heading">
        <div>
          <p className="eyebrow">CATEGORY EDITOR</p>
          <h2>{editingCategory ? '카테고리 수정' : '새 카테고리 추가'}</h2>
        </div>
        {editingCategory && (
          <button className="text-button" type="button" onClick={onCancel}>취소</button>
        )}
      </div>
      <div className="form-grid">
        <label>
          <span>카테고리 이름</span>
          <input
            name="label"
            value={form.label}
            onChange={updateField}
            placeholder="예: 혼밥 맛집"
          />
        </label>
        <label>
          <span>아이콘</span>
          <input
            name="icon"
            value={form.icon}
            onChange={updateField}
            placeholder="예: 🍚"
            maxLength={8}
          />
        </label>
      </div>
      <label>
        <span>연결 태그</span>
        <input
          name="tags"
          value={form.tags}
          onChange={updateField}
          placeholder="쉼표로 구분: 혼밥, 가성비"
          disabled={editingCategory?.protected}
        />
        <small>
          게시물 태그 중 하나라도 일치하면 해당 카테고리에 표시됩니다.
        </small>
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="primary form-submit" type="submit">
        {editingCategory ? '변경 내용 저장' : '카테고리 추가'}
      </button>
    </form>
  );
}
