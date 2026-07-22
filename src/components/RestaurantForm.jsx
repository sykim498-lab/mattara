import { useState } from 'react';

const INITIAL_FORM = {
  name: '',
  region: '전라남도 구례군',
  address: '',
  menu: '',
  description: '',
  tags: '',
  imageUrl: '',
};

export function RestaurantForm({ userId, onSubmit }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const required = ['name', 'region', 'address', 'menu', 'description'];
    if (required.some((field) => !form[field].trim())) {
      setError('필수 항목을 모두 입력해 주세요.');
      return;
    }
    if (!form.address.includes('구례군')) {
      setError('전라남도 구례군에 위치한 주소만 등록할 수 있어요.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onSubmit({
        user_id: userId,
        name: form.name.trim(),
        region: form.region.trim(),
        address: form.address.trim(),
        menu: form.menu.trim(),
        description: form.description.trim(),
        tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        image_url: form.imageUrl.trim() || null,
      });
      setForm(INITIAL_FORM);
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="restaurant-form panel" onSubmit={submit}>
      <div className="form-grid">
        <label><span>맛집 이름 *</span><input name="name" value={form.name} onChange={updateField} /></label>
        <label><span>지역 *</span><input name="region" value={form.region} readOnly /></label>
      </div>
      <label><span>구례군 주소 *</span><input name="address" value={form.address} onChange={updateField} placeholder="전라남도 구례군 ..." /></label>
      <label><span>대표 메뉴 *</span><input name="menu" value={form.menu} onChange={updateField} /></label>
      <label>
        <span>나만의 후기 *</span>
        <textarea name="description" value={form.description} onChange={updateField} rows="5" />
      </label>
      <label><span>태그</span><input name="tags" value={form.tags} onChange={updateField} placeholder="산수유, 로컬푸드, 자연" /></label>
      <label><span>대표 사진 URL</span><input name="imageUrl" type="url" value={form.imageUrl} onChange={updateField} /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="primary form-submit" type="submit" disabled={submitting}>
        {submitting ? '제출 중…' : '검수 요청하기'}
      </button>
    </form>
  );
}
