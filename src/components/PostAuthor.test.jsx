import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { posts } from '../data/posts';
import { PostAuthor } from './PostAuthor';

describe('PostAuthor', () => {
  it('게시물 원본보다 최신 공개 프로필을 우선 표시한다', () => {
    render(
      <PostAuthor
        post={posts[0]}
        profile={{
          displayName: '새아이디',
          handle: '@newid',
          avatar: 'https://example.com/new-avatar.jpg',
        }}
      />,
    );

    expect(screen.getByText('새아이디')).toBeInTheDocument();
    expect(screen.getByText('@newid')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/new-avatar.jpg');
  });
});
