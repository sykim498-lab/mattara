import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuthPage } from './AuthPage';

const authMocks = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signInWithSocial: vi.fn(),
  signUpWithPassword: vi.fn(),
}));

vi.mock('../services/authService', () => authMocks);

describe('AuthPage', () => {
  it('아이디와 비밀번호로 로그인한 뒤 홈으로 이동한다', async () => {
    const onHome = vi.fn();
    authMocks.signInWithPassword.mockResolvedValue({ user: { id: 'user-1' } });
    render(
      <AuthPage
        mode="login"
        configured={false}
        onHome={onHome}
        onSwitchMode={() => {}}
      />,
    );

    fireEvent.change(screen.getByLabelText('아이디'), { target: { value: 'matlover' } });
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => expect(authMocks.signInWithPassword).toHaveBeenCalledWith(
      'matlover',
      'password123',
    ));
    expect(onHome).toHaveBeenCalled();
  });

  it('회원가입 비밀번호 확인이 다르면 요청하지 않는다', () => {
    render(
      <AuthPage
        mode="signup"
        configured={false}
        onHome={() => {}}
        onSwitchMode={() => {}}
      />,
    );
    fireEvent.change(screen.getByLabelText('아이디'), { target: { value: 'matlover' } });
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('비밀번호 확인'), {
      target: { value: 'different123' },
    });
    fireEvent.click(screen.getByRole('button', { name: '회원가입' }));

    expect(screen.getByRole('alert')).toHaveTextContent('일치하지 않습니다');
    expect(authMocks.signUpWithPassword).not.toHaveBeenCalled();
  });
});
