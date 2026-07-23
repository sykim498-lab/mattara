import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { posts } from '../data/posts';
import { guryeCourses } from '../data/guryeCourses';
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

  it('게시물 하단 연관 코스 사진으로 해당 코스를 연다', () => {
    const onOpenCourse = vi.fn();
    render(
      <DetailPage
        post={posts[0]}
        bookmarked={false}
        relatedCourses={guryeCourses.slice(0, 3)}
        onHome={() => {}}
        onOpenCourse={onOpenCourse}
        onToggleBookmark={() => {}}
      />,
    );

    expect(screen.getByText('이 게시물과 함께 보기 좋은 코스')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {
      name: `${guryeCourses[0].theme} 코스 상세 보기`,
    }));
    expect(onOpenCourse).toHaveBeenCalledWith(guryeCourses[0].id);
  });

  it('게시물 하단의 코스 추천하기 버튼으로 전체 코스를 연다', () => {
    const onOpenCourse = vi.fn();
    render(
      <DetailPage
        post={posts[0]}
        bookmarked={false}
        onHome={() => {}}
        onOpenCourse={onOpenCourse}
        onToggleBookmark={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '코스 추천하기 →' }));
    expect(onOpenCourse).toHaveBeenCalledWith();
  });
});
