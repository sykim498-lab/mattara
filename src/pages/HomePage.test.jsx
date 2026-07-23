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
    expect(screen.getByText('작성자별 구례 코스 피드')).toBeInTheDocument();
    expect(screen.queryByText(posts[0].name)).not.toBeInTheDocument();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });
});
