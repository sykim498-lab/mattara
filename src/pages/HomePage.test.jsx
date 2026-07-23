import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { guryeCourses } from '../data/guryeCourses';
import { posts } from '../data/posts';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  it('8개의 작성자별 코스 게시물만 메인 피드에 표시한다', () => {
    render(
      <HomePage
        courses={guryeCourses}
        onOpenCourse={() => {}}
      />,
    );

    expect(screen.getAllByRole('link', { name: /코스 상세 보기/ })).toHaveLength(8);
    expect(screen.getByText('구례 여행자 추천 피드')).toBeInTheDocument();
    expect(screen.queryByText(posts[0].name)).not.toBeInTheDocument();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });

  it('서버에 저장된 회원 게시물을 코스와 같은 추천 그리드에 표시한다', () => {
    const memberPost = { ...posts[0], id: 100, ownerId: 'member-1', name: '회원 등록 맛집' };
    render(
      <HomePage
        posts={[memberPost, posts[1]]}
        courses={guryeCourses}
        onOpenCourse={() => {}}
        onOpenPost={() => {}}
      />,
    );

    expect(screen.getByText('회원 등록 맛집')).toBeInTheDocument();
    expect(screen.queryByText(posts[1].name)).not.toBeInTheDocument();
    expect(screen.getByText('회원 등록 맛집').closest('.course-feed')).toBeInTheDocument();
  });
});
