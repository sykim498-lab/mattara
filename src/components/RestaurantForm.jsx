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
  placeId: '',
  googleMapsUri: '',
  website: '',
  placeSource: '',
  description: '',
  tags: '',
};

export function RestaurantForm({ userId, onSubmit }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [photoLookupIndex, setPhotoLookupIndex] = useState(null);
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
      title: '',
      description: '',
      comment: '',
      address: form.address,
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
  const lookupPhotoPlace = async (index) => {
    const photo = photos[index];
    if (!photo?.title?.trim() || !photo?.address?.trim()) {
      setError('사진별 장소 제목과 주소를 먼저 입력해 주세요.');
      return;
    }
    setPhotoLookupIndex(index);
    setError('');
    try {
      const details = await lookupPlaceDetails(photo.title, photo.address);
      setPhotos((current) => current.map((item, photoIndex) => photoIndex === index ? {
        ...item,
        address: details.address || item.address,
        lat: details.lat ?? item.lat,
        lng: details.lng ?? item.lng,
        placeId: details.placeId,
        googleMapsUri: details.googleMapsUri,
        website: details.website,
        placeSource: details.source,
      } : item));
    } catch (lookupError) {
      setError(lookupError.message);
    } finally {
      setPhotoLookupIndex(null);
    }
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
        placeId: details.placeId,
        googleMapsUri: details.googleMapsUri,
        website: details.website,
        placeSource: details.source,
      }));
      setPhotos((current) => current.map((photo) => ({
        ...photo,
        lat: photo.lat || details.lat || '',
        lng: photo.lng || details.lng || '',
      })));
      const attribution = details.source === 'Google Places'
        ? 'Google Maps 장소 정보'
        : '© OpenStreetMap contributors';
      setLookupMessage(details.hours || details.phone
        ? `장소 정보를 자동으로 채웠어요. · ${attribution}`
        : `장소는 찾았지만 공개된 운영시간·전화번호가 없어요. · ${attribution}`);
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
    if (!photos.length || photos.some(({ title, description, address }) => (
      !title?.trim() || !description?.trim() || !address?.trim()
    ))) {
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
        placeId: form.placeId,
        googleMapsUri: form.googleMapsUri,
        website: form.website,
        placeSource: form.placeSource,
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
                <span>사진 {index + 1} 장소 제목 *</span>
                <input value={photo.title} onChange={(event) => updatePhoto(index, 'title', event.target.value)} placeholder="예: 화엄사 대웅전" />
              </label>
              <label>
                <span>사진별 주소 *</span>
                <input value={photo.address} onChange={(event) => updatePhoto(index, 'address', event.target.value)} placeholder="장소의 상세 주소" />
              </label>
              <button className="ghost photo-place-lookup" type="button" onClick={() => lookupPhotoPlace(index)} disabled={photoLookupIndex === index}>
                {photoLookupIndex === index ? '장소 확인 중' : '이 사진 장소 검색'}
              </button>
              <label>
                <span>사진 {index + 1} 설명 *</span>
                <textarea value={photo.description} onChange={(event) => updatePhoto(index, 'description', event.target.value)} rows="3" placeholder="이 장소와 사진에서 이용자가 알아야 할 내용을 입력하세요." />
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
