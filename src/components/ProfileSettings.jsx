import { useState } from 'react';
import { savePublicProfile } from '../services/profileService';

export function ProfileSettings({ user, profile }) {
  const [displayName, setDisplayName] = useState(
    () => profile?.displayName ?? user.displayName ?? user.email?.split('@')[0] ?? '',
  );
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(() => profile?.avatar ?? user.photoURL ?? '');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const selectAvatar = (event) => {
    const [file] = event.target.files;
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) {
      setMessage('프로필 사진은 10MB 이하 이미지 파일만 선택할 수 있어요.');
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(file);
    setMessage('');
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await savePublicProfile(user, {
        displayName,
        avatarFile,
        currentAvatar: profile?.avatar,
      });
      setAvatarFile(null);
      setMessage('프로필을 저장했어요. 피드 작성자 정보에도 바로 반영됩니다.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="profile-settings panel" onSubmit={submit}>
      <div>
        <p className="eyebrow">PUBLIC PROFILE</p>
        <h2>내 프로필</h2>
        <p>아이디와 사진을 바꾸면 내가 올린 모든 게시물에 실시간 반영됩니다.</p>
      </div>
      <div className="profile-editor">
        <div className="profile-avatar-preview">
          {preview ? <img src={preview} alt="프로필 미리보기" /> : <span>🙂</span>}
        </div>
        <div className="profile-fields">
          <label><span>아이디</span><input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength="30" /></label>
          <label><span>프로필 사진</span><input type="file" accept="image/*" onChange={selectAvatar} /></label>
        </div>
      </div>
      {message && <p className="profile-message" role="status">{message}</p>}
      <button className="primary" type="submit" disabled={saving}>
        {saving ? '저장 중…' : '프로필 저장'}
      </button>
    </form>
  );
}
