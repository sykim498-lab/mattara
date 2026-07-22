import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DEFAULT_CATEGORIES } from '../data/categories';
import { posts } from '../data/posts';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  it('관리 데이터로 카테고리 필터를 렌더링하고 피드를 거른다', () => {
    render(
      <HomePage
        posts={posts}
        categories={DEFAULT_CATEGORIES}
        onOpenPost={() => {}}
      />,
    );

    expect(screen.getByText('구례 맛집·명소 6곳')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /한옥카페/ }));
    expect(screen.getByText('구례 맛집·명소 1곳')).toBeInTheDocument();
    expect(screen.getByText('쌍산재 한옥차담')).toBeInTheDocument();
    expect(screen.queryByText('광양숯불갈비')).not.toBeInTheDocument();
  });
});
