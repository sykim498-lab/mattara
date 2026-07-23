import { useState } from 'react';
import { lookupPlaceDetails } from '../services/placeService';

const INITIAL_FORM = {
  name: '',
  region: '전라남도 구례군',
  address: '',
  menu: '',
  hours: '',
  phone: '',
  lat: '',
  lng: '',
  description: '',
  tags: '',
};

export function RestaurantForm({ userId, onSubmit }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupMessage, setLookupMessage] = useState('');

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };
  const selectPhotos = (event) => {
    const files = [...event.target.files].slice(0, 8);
    const invalid = files.find((file) => !file.type.startsWith('image/') || file.size > 10 * 1024 * 1024);
    if (invalid) {
      setError('사진은 장당 10MB 이하의 이미지 파일만 올릴 수 있어요.');
      return;
    }
    setPhotos(files.map((file) => ({
      file,
      comment: '',
      lat: form.lat,
      lng: form.lng,
    })));
    setError('');
  };
  const updatePhoto = (index, field, value) => {
    setPhotos((current) => current.map((photo, photoIndex) =>
      photoIndex === index ? { ...photo, [field]: value } : photo,
    ));
  };
  const lookupPlace = async () => {
    setLookingUp(true);
    setLookupMessage('');
    try {
      const details = await lookupPlaceDetails(form.name, form.address);
      setForm((current) => ({
        ...current,
        hours: details.hours || current.hours,
        phone: details.phone || current.phone,
        lat: details.lat ?? current.lat,
        lng: details.lng ?? current.lng,
      }));
      setPhotos((current) => current.map((photo) => ({
        ...photo,
        lat: photo.lat || details.lat || '',
        lng: photo.lng || details.lng || '',
      })));
      setLookupMessage(details.hours || details.phone
        ? '공개 장소 정보를 자동으로 채웠어요. · © OpenStreetMap contributors'
        : '장소는 찾았지만 공개된 운영시간·전화번호가 없어요. · © OpenStreetMap contributors');
    } catch (lookupError) {
      setLookupMessage(lookupError.message);
    } finally {
      setLookingUp(false);
    }
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
    if (!photos.length || photos.some(({ comment }) => !comment.trim())) {
      setError('사진을 한 장 이상 선택하고 사진별 설명을 모두 입력해 주세요.');
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
        hours: form.hours.trim() || '방문 전 운영시간 확인',
        phone: form.phone.trim() || '매장 문의',
        description: form.description.trim(),
        tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        photos,
      });
      setForm(INITIAL_FORM);
      setPhotos([]);
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
      <div className="place-lookup-row">
        <button className="ghost" type="button" onClick={lookupPlace} disabled={lookingUp}>
          {lookingUp ? '장소 정보 조회 중…' : '운영시간·전화번호 자동 채우기'}
        </button>
        {lookupMessage && <small role="status">{lookupMessage}</small>}
      </div>
      <label><span>대표 메뉴 *</span><input name="menu" value={form.menu} onChange={updateField} /></label>
      <div className="form-grid">
        <label><span>운영시간</span><input name="hours" value={form.hours} onChange={updateField} placeholder="예: 매일 11:00~20:00" /></label>
        <label><span>전화번호</span><input name="phone" value={form.phone} onChange={updateField} placeholder="예: 061-000-0000" /></label>
      </div>
      <label>
        <span>나만의 후기 *</span>
        <textarea name="description" value={form.description} onChange={updateField} rows="5" />
      </label>
      <label><span>태그</span><input name="tags" value={form.tags} onChange={updateField} placeholder="산수유, 로컬푸드, 자연" /></label>
      <label className="photo-upload-field">
        <span>여행 사진 * <small>최대 8장 · 각 10MB 이하</small></span>
        <input type="file" accept="image/*" multiple onChange={selectPhotos} />
      </label>
      {photos.length > 0 && (
        <div className="upload-photo-list">
          {photos.map((photo, index) => (
            <article className="upload-photo-row" key={`${photo.file.name}-${index}`}>
              <div className="upload-photo-index"><b>{index + 1}</b><span>{photo.file.name}</span></div>
              <label>
                <span>사진 {index + 1} 설명 *</span>
                <textarea value={photo.comment} onChange={(event) => updatePhoto(index, 'comment', event.target.value)} rows="2" placeholder="이 사진에서 꼭 봐야 할 장면을 알려주세요." />
              </label>
              <div className="form-grid">
                <label><span>위도 (선택)</span><input type="number" step="any" value={photo.lat} onChange={(event) => updatePhoto(index, 'lat', event.target.value)} /></label>
                <label><span>경도 (선택)</span><input type="number" step="any" value={photo.lng} onChange={(event) => updatePhoto(index, 'lng', event.target.value)} /></label>
              </div>
            </article>
          ))}
        </div>
      )}
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="primary form-submit" type="submit" disabled={submitting}>
        {submitting ? '게시 중…' : '바로 게시하기'}
      </button>
    </form>
  );
}
