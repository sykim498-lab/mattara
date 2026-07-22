import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { posts } from '../data/posts';
import { DetailPage } from './DetailPage';

vi.mock('../components/DetailMap', () => ({ DetailMap: () => <div>지도</div> }));

describe('DetailPage 이미지 코멘트', () => {
  it('사진을 넘기면 연결된 코멘트도 함께 바뀐다', () => {
    const post = posts[0];
    render(
      <DetailPage
        post={post}
        bookmarked={false}
        onHome={() => {}}
        onOpenCourse={() => {}}
        onToggleBookmark={() => {}}
      />,
    );

    expect(screen.getByText(post.images[0].comment)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '다음 사진' }));
    expect(screen.getByText(post.images[1].comment)).toBeInTheDocument();
    expect(screen.queryByText(post.images[0].comment)).not.toBeInTheDocument();
  });
});
