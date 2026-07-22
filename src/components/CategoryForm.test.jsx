import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CategoryForm } from './CategoryForm';

describe('CategoryForm', () => {
  it('필수값이 없으면 저장하지 않는다', () => {
    const onSave = vi.fn();
    render(<CategoryForm onSave={onSave} />);

    fireEvent.click(screen.getByRole('button', { name: '카테고리 추가' }));

    expect(screen.getByRole('alert')).toHaveTextContent('이름을 입력');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('입력값을 정리해 새 카테고리를 저장한다', () => {
    const onSave = vi.fn();
    render(<CategoryForm onSave={onSave} />);

    fireEvent.change(screen.getByLabelText('카테고리 이름'), {
      target: { value: '혼밥 맛집' },
    });
    fireEvent.change(screen.getByPlaceholderText('쉼표로 구분: 혼밥, 가성비'), {
      target: { value: '혼밥, 가성비' },
    });
    fireEvent.click(screen.getByRole('button', { name: '카테고리 추가' }));

    expect(onSave).toHaveBeenCalledWith({
      label: '혼밥 맛집',
      icon: '',
      matchTags: ['혼밥', '가성비'],
    });
  });
});
