import { useMemo, useState } from 'react';
import { GURYE_REGION, isFranchisePlace } from '../../features/region/gurye';
import { deleteAdminResource, saveAdminResource } from '../../services/adminService';
import { lookupPlaceDetails } from '../../services/placeService';

const emptyPost = { name: '', address: '', caption: '', tags: '', rating: '4.5', image: '', lat: '', lng: '', placeId: '', googleMapsUri: '', website: '', hours: '', phone: '' };

function postForm(item) {
  if (!item) return emptyPost;
  return {
    name: item.name ?? '',
    address: item.address ?? '',
    caption: item.caption ?? '',
    tags: item.tags?.join(', ') ?? '',
    rating: String(item.rating ?? 4.5),
    image: item.images?.[0]?.url ?? '',
    lat: item.images?.[0]?.lat ?? item.lat ?? '',
    lng: item.images?.[0]?.lng ?? item.lng ?? '',
    placeId: item.images?.[0]?.placeId ?? item.placeId ?? '',
    googleMapsUri: item.images?.[0]?.googleMapsUri ?? item.googleMapsUri ?? '',
    website: item.images?.[0]?.website ?? item.website ?? '',
    hours: item.hours ?? '',
    phone: item.phone ?? '',
  };
}

function courseForm(item) {
  return {
    theme: item?.theme ?? '',
    description: item?.description ?? '',
    mode: item?.mode ?? '',
    tags: item?.tags?.join(', ') ?? '',
  };
}

export function AdminResourcePanel({ type, items }) {
  const isPost = type === 'posts';
  const [selectedId, setSelectedId] = useState('');
  const selected = useMemo(
    () => items.find(({ documentId }) => documentId === selectedId),
    [items, selectedId],
  );
  const [form, setForm] = useState(() => (isPost ? emptyPost : courseForm()));
  const [message, setMessage] = useState('');
  const [lookingUp, setLookingUp] = useState(false);

  const selectItem = (item) => {
    setSelectedId(item.documentId);
    setForm(isPost ? postForm(item) : courseForm(item));
    setMessage('');
  };
  const createPost = () => {
    setSelectedId('new');
    setForm(emptyPost);
    setMessage('');
  };
  const update = (event) => setForm((current) => ({
    ...current,
    [event.target.name]: event.target.value,
  }));
  const lookupLocation = async () => {
    if (!form.name.trim() || !form.address.trim()) return;
    setLookingUp(true);
    try {
      const details = await lookupPlaceDetails(form.name, form.address);
      setForm((current) => ({ ...current, address: details.address || current.address, lat: details.lat ?? current.lat, lng: details.lng ?? current.lng, placeId: details.placeId || current.placeId, googleMapsUri: details.googleMapsUri || current.googleMapsUri, website: details.website || current.website, hours: details.hours || current.hours, phone: details.phone || current.phone }));
      setMessage('장소 정보를 확인했습니다. 저장 버튼을 눌러 반영하세요.');
    } catch (error) { setMessage(error.message); }
    finally { setLookingUp(false); }
  };

  const save = async (event) => {
    event.preventDefault();
    if (isPost && (!form.address.includes('구례군') || isFranchisePlace({ name: form.name }))) {
      setMessage('구례군 주소의 로컬 장소만 등록할 수 있습니다.');
      return;
    }
    const documentId = selectedId === 'new' ? String(Date.now()) : selectedId;
    const tags = form.tags.split(',').map((tag) => tag.trim()).filter(Boolean);
    const values = isPost ? {
      id: selected?.id ?? Number(documentId),
      name: form.name.trim(),
      region: GURYE_REGION,
      address: form.address.trim(),
      caption: form.caption.trim(),
      rating: Number(form.rating),
      lat: Number(form.lat) || null,
      lng: Number(form.lng) || null,
      placeId: form.placeId,
      googleMapsUri: form.googleMapsUri,
      website: form.website,
      hours: form.hours.trim(),
      phone: form.phone.trim(),
      tags,
      local: true,
      images: form.image ? [{ ...(selected?.images?.[0] ?? {}), url: form.image, address: form.address.trim(), lat: Number(form.lat) || null, lng: Number(form.lng) || null, placeId: form.placeId, googleMapsUri: form.googleMapsUri, website: form.website, description: selected?.images?.[0]?.description || form.caption.trim(), comment: selected?.images?.[0]?.comment || form.caption.trim(), order: 0 }] : selected?.images ?? [],
    } : {
      theme: form.theme.trim(),
      description: form.description.trim(),
      mode: form.mode.trim(),
      tags,
    };
    try {
      await saveAdminResource(type, documentId, values);
      setSelectedId(documentId);
      setMessage('변경 내용을 Firebase에 저장했습니다.');
    } catch {
      setMessage('저장하지 못했습니다. 입력값과 관리자 권한을 확인해 주세요.');
    }
  };

  const remove = async (item) => {
    const title = item.name ?? item.theme;
    if (!window.confirm(`‘${title}’ 항목을 삭제할까요?`)) return;
    await deleteAdminResource(type, item.documentId);
    if (selectedId === item.documentId) setSelectedId('');
  };

  return (
    <div className="admin-resource-layout">
      <section className="admin-table-panel panel">
        <div className="admin-panel-heading">
          <div><p className="eyebrow">CONTENT</p><h2>{isPost ? '게시물 관리' : '추천 코스 관리'}</h2></div>
          {isPost && <button className="primary compact" type="button" onClick={createPost}>새 게시물</button>}
        </div>
        <div className="admin-resource-list">
          {items.map((item) => (
            <article className={selectedId === item.documentId ? 'active' : ''} key={item.documentId}>
              <button type="button" onClick={() => selectItem(item)}>
                <b>{item.name ?? item.theme}</b>
                <span>{item.address ?? item.mode ?? '세부 정보 없음'}</span>
              </button>
              <button className="resource-delete" type="button" onClick={() => remove(item)}>삭제</button>
            </article>
          ))}
        </div>
      </section>
      <form className="admin-editor panel" onSubmit={save}>
        <p className="eyebrow">{selectedId === 'new' ? 'NEW CONTENT' : 'EDITOR'}</p>
        <h2>{selectedId ? '콘텐츠 편집' : '항목을 선택하세요'}</h2>
        {selectedId && (isPost ? (
          <>
            <button className="ghost" type="button" onClick={lookupLocation} disabled={lookingUp}>{lookingUp ? '장소 확인 중' : '지도에서 장소 정보 찾기'}</button>
            <div className="form-grid"><label><span>위도</span><input name="lat" type="number" step="any" value={form.lat} onChange={update} /></label><label><span>경도</span><input name="lng" type="number" step="any" value={form.lng} onChange={update} /></label></div>
            <div className="form-grid"><label><span>영업시간</span><input name="hours" value={form.hours} onChange={update} /></label><label><span>전화번호</span><input name="phone" value={form.phone} onChange={update} /></label></div>
            <label><span>장소명</span><input name="name" value={form.name} onChange={update} required /></label>
            <label><span>구례군 주소</span><input name="address" value={form.address} onChange={update} required /></label>
            <label><span>감성 코멘트</span><textarea name="caption" value={form.caption} onChange={update} rows="3" /></label>
            <div className="form-grid"><label><span>평점</span><input name="rating" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={update} /></label><label><span>태그</span><input name="tags" value={form.tags} onChange={update} /></label></div>
            <label><span>대표 이미지 URL</span><input name="image" value={form.image} onChange={update} /></label>
          </>
        ) : (
          <>
            <label><span>코스명</span><input name="theme" value={form.theme} onChange={update} required /></label>
            <label><span>코스 설명</span><textarea name="description" value={form.description} onChange={update} rows="4" /></label>
            <label><span>이동 방식</span><input name="mode" value={form.mode} onChange={update} /></label>
            <label><span>추천 태그</span><input name="tags" value={form.tags} onChange={update} /></label>
          </>
        ))}
        {message && <p className="admin-feedback" role="status">{message}</p>}
        {selectedId && <button className="primary" type="submit">Firebase에 저장</button>}
      </form>
    </div>
  );
}
