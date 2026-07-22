import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { posts } from '../data/posts';
import { FeedCard } from './FeedCard';

describe('FeedCard 이미지 캐러셀', () => {
  it('화살표로 다음 사진을 표시한다', () => {
    const post = posts[0];
    render(<FeedCard post={post} onOpen={() => {}} />);

    expect(screen.getByText(`1 / ${post.images.length}`)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: `${post.name} 다음 사진` }));
    expect(screen.getByText(`2 / ${post.images.length}`)).toBeInTheDocument();
  });
});
