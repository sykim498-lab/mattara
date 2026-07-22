import { useState } from 'react';
import { updateSubmissionStatus } from '../../services/adminService';

export function AdminSubmissions({ submissions }) {
  const [savingId, setSavingId] = useState('');

  const review = async (submission, status) => {
    setSavingId(submission.documentId);
    try {
      await updateSubmissionStatus(submission, status);
    } finally {
      setSavingId('');
    }
  };

  return (
    <section className="admin-table-panel panel">
      <div className="admin-panel-heading">
        <div><p className="eyebrow">LOCAL SUBMISSIONS</p><h2>맛집 제보 검토</h2></div>
        <span>{submissions.length}건</span>
      </div>
      {!submissions.length ? <p className="admin-empty">아직 접수된 맛집 제보가 없습니다.</p> : (
        <div className="submission-list">
          {submissions.map((item) => (
            <article className="submission-row" key={item.documentId}>
              <div>
                <span className={`status-badge ${item.status}`}>{item.status ?? 'pending'}</span>
                <h3>{item.name ?? item.restaurant_name ?? '이름 없는 제보'}</h3>
                <p>{item.address ?? '주소 미입력'} · {item.description ?? item.reason ?? '설명 없음'}</p>
              </div>
              <div className="row-actions">
                <button type="button" disabled={savingId === item.documentId} onClick={() => review(item, 'approved')}>승인·피드 발행</button>
                <button className="danger" type="button" disabled={savingId === item.documentId} onClick={() => review(item, 'rejected')}>반려</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
