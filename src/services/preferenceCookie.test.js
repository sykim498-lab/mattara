import { describe, expect, it } from 'vitest';
import { guryeCourses } from '../data/guryeCourses';
import { rankRelatedCourses } from './preferenceCookie';

describe('rankRelatedCourses', () => {
  it('현재 게시물 연관성과 저장된 태그 선호도로 코스를 정렬한다', () => {
    const post = { tags: ['한옥', '전통'] };
    const ranked = rankRelatedCourses(guryeCourses, post, {
      tagScores: { 감성카페: 4 },
      regionScores: {},
      recentViews: [],
    });

    expect(ranked[0].id).toBe('local-emotion-pause');
    expect(ranked).toHaveLength(8);
  });

  it('상세에서 보고 있는 코스 자체는 추천 결과에서 제외한다', () => {
    const source = guryeCourses[0];
    const ranked = rankRelatedCourses(guryeCourses, source, {
      tagScores: {}, regionScores: {}, recentViews: [],
    });

    expect(ranked.map(({ id }) => id)).not.toContain(source.id);
    expect(ranked).toHaveLength(7);
  });
});
