import { useState } from 'react';
import { MEMBER_LEVELS, roleLabel } from '../../features/admin/roles';
import { updateMemberRole } from '../../services/adminService';

export function AdminMembers({ users, currentUserId }) {
  const [savingId, setSavingId] = useState('');
  const [message, setMessage] = useState('');

  const changeRole = async (member, role) => {
    if (member.documentId === currentUserId && role !== 'admin') {
      setMessage('현재 로그인한 관리자 계정은 스스로 강등할 수 없습니다.');
      return;
    }
    setSavingId(member.documentId);
    setMessage('');
    try {
      await updateMemberRole(member.documentId, role);
      setMessage(`${member.email ?? '회원'}의 레벨을 ${roleLabel(role)}로 변경했습니다.`);
    } catch {
      setMessage('회원 레벨 변경에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSavingId('');
    }
  };

  return (
    <section className="admin-table-panel panel">
      <div className="admin-panel-heading">
        <div><p className="eyebrow">MEMBER LEVEL</p><h2>회원 관리</h2></div>
        <span>{users.length}명</span>
      </div>
      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead><tr><th>회원</th><th>현재 레벨</th><th>가입일</th><th>레벨 변경</th></tr></thead>
          <tbody>
            {users.map((member) => (
              <tr key={member.documentId}>
                <td><b>{member.displayName || member.email || '이름 없음'}</b><small>{member.documentId}</small></td>
                <td><span className={`role-badge ${member.role ?? 'admin'}`}>{roleLabel(member.role ?? 'admin')}</span></td>
                <td>{member.createdAt?.toDate?.().toLocaleDateString('ko-KR') ?? '-'}</td>
                <td>
                  <select
                    value={member.role ?? 'admin'}
                    disabled={savingId === member.documentId}
                    onChange={(event) => changeRole(member, event.target.value)}
                    aria-label={`${member.email ?? '회원'} 레벨 변경`}
                  >
                    {MEMBER_LEVELS.map((level) => <option value={level.value} key={level.value}>{level.label}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {message && <p className="admin-feedback" role="status">{message}</p>}
    </section>
  );
}
