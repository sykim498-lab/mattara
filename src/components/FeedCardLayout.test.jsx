import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { guryeCourses } from '../data/guryeCourses';
import { posts } from '../data/posts';
import { CourseFeedCard } from './CourseFeedCard';
import { FeedCard } from './FeedCard';

function cardSections(container) {
  const card = container.querySelector('.feed-card');
  return Array.from(card.children).map(({ className }) => className);
}

describe('메인 피드 카드 레이아웃', () => {
  it('일반 게시물과 추천 코스가 같은 섹션 순서를 사용한다', () => {
    const postCard = render(<FeedCard post={posts[0]} onOpen={() => {}} />);
    const courseCard = render(
      <CourseFeedCard
        course={guryeCourses[0]}
        onOpen={() => {}}
        onToggleSave={() => {}}
      />,
    );

    expect(cardSections(postCard.container)).toEqual([
      'card-open',
      'social card-actions',
      'comments-section',
    ]);
    expect(cardSections(courseCard.container)).toEqual(cardSections(postCard.container));
  });

  it('평점이 없는 코스도 작성자 영역의 평가 상태를 유지한다', () => {
    const { container, getByText } = render(
      <CourseFeedCard
        course={guryeCourses[0]}
        onOpen={() => {}}
        onToggleSave={() => {}}
      />,
    );

    expect(container.querySelector('.rating-empty')).toBeInTheDocument();
    expect(getByText('평가 전')).toBeInTheDocument();
  });
});
