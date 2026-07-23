import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NewRestaurantPage } from './NewRestaurantPage';

const serviceMocks = vi.hoisted(() => ({ publishRestaurant: vi.fn() }));

vi.mock('../services/authService', () => serviceMocks);
vi.mock('../components/RestaurantForm', () => ({
  RestaurantForm: ({ onSubmit }) => (
    <button type="button" onClick={() => onSubmit({ name: '구례 새 맛집' })}>테스트 게시</button>
  ),
}));

describe('NewRestaurantPage', () => {
  it('회원 게시물을 승인 대기 없이 즉시 공개한다', async () => {
    serviceMocks.publishRestaurant.mockResolvedValue({ id: 10, status: 'published' });
    render(
      <NewRestaurantPage
        user={{ uid: 'user-1', email: 'member@example.com', displayName: '회원' }}
        loading={false}
        onHome={() => {}}
        onLogin={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '테스트 게시' }));
    await waitFor(() => expect(screen.getByText('새 게시물이 공개됐어요')).toBeInTheDocument());
    expect(serviceMocks.publishRestaurant).toHaveBeenCalledWith(expect.objectContaining({
      name: '구례 새 맛집',
      author_email: 'member@example.com',
      author_name: '회원',
    }));
  });
});
