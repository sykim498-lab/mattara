import { useState } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import {
  signInWithPassword,
  signInWithSocial,
  signUpWithPassword,
} from '../services/authService';

const PROVIDERS = [
  { id: 'kakao', label: '카카오로 계속하기', icon: '💬', className: 'kakao' },
  { id: 'google', label: 'Google로 계속하기', icon: 'G', className: 'google' },
];

export function AuthPage({ mode, configured, onHome, onSwitchMode }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isSignUp = mode === 'signup';

  const submitCredentials = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (isSignUp && password !== passwordConfirm) {
      setError('비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    setSubmitting(true);
    try {
      const result = isSignUp
        ? await signUpWithPassword(identifier, password)
        : await signInWithPassword(identifier, password);
      if (result.requiresEmailConfirmation) {
        setMessage('가입 확인 메일을 보냈습니다. 확인 후 로그인해 주세요.');
      } else {
        onHome();
      }
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const continueWith = async (provider) => {
    setError('');
    try {
      await signInWithSocial(provider);
    } catch (caughtError) {
      setError(caughtError.message);
    }
  };

  return (
    <section className="view auth-view">
      <div className="shell auth-shell">
        <Breadcrumbs items={[{ label: '홈 피드', onClick: onHome }, { label: isSignUp ? '회원가입' : '로그인' }]} />
        <div className="auth-card panel">
          <div className="auth-brand" aria-hidden="true">🍽️</div>
          <p className="eyebrow">WELCOME TO MAT-TARA</p>
          <h1>{isSignUp ? '맛있는 기록을 시작해요' : '다시 만나 반가워요'}</h1>
          <p className="auth-description">
            {isSignUp
              ? '아이디와 비밀번호를 등록하고 맛있는 기록을 시작하세요.'
              : '아이디와 비밀번호로 로그인하면 이전 세션을 이어갈 수 있어요.'}
          </p>
          <form className="credential-form" onSubmit={submitCredentials}>
            <label htmlFor="auth-identifier">{configured ? '이메일' : '아이디'}</label>
            <input
              id="auth-identifier"
              type={configured ? 'email' : 'text'}
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder={configured ? 'name@example.com' : '4~24자 아이디'}
              autoComplete={isSignUp ? 'username' : 'username'}
              required
            />
            <label htmlFor="auth-password">비밀번호</label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="8자 이상 입력"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              minLength="8"
              required
            />
            {isSignUp && (
              <>
                <label htmlFor="auth-password-confirm">비밀번호 확인</label>
                <input
                  id="auth-password-confirm"
                  type="password"
                  value={passwordConfirm}
                  onChange={(event) => setPasswordConfirm(event.target.value)}
                  placeholder="비밀번호를 다시 입력"
                  autoComplete="new-password"
                  minLength="8"
                  required
                />
              </>
            )}
            <button className="primary credential-submit" type="submit" disabled={submitting}>
              {submitting ? '처리 중...' : isSignUp ? '회원가입' : '로그인'}
            </button>
          </form>
          {message && <p className="form-success" role="status">{message}</p>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="auth-divider"><span>또는</span></div>
          <div className="social-login-list">
            {PROVIDERS.map((provider) => (
              <button
                className={`social-login ${provider.className}`}
                type="button"
                onClick={() => continueWith(provider.id)}
                key={provider.id}
              >
                <span aria-hidden="true">{provider.icon}</span>
                {provider.label}
              </button>
            ))}
          </div>
          {!configured && (
            <p className="config-notice">
              현재 로컬 체험 모드입니다. 계정과 세션은 이 브라우저에만 저장됩니다.
              `.env`에 Supabase 정보를 설정하면 서버 인증으로 자동 전환됩니다.
            </p>
          )}
          <p className="auth-switch">
            {isSignUp ? '이미 계정이 있나요?' : '처음 방문하셨나요?'}{' '}
            <button type="button" onClick={onSwitchMode}>
              {isSignUp ? '로그인' : '회원가입'}
            </button>
          </p>
          <small className="terms-copy">
            계속하면 맛따라의 이용약관과 개인정보 처리방침에 동의하게 됩니다.
          </small>
        </div>
      </div>
    </section>
  );
}
