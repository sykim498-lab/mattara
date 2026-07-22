import { describe, expect, it } from 'vitest';
import { rankPostsForUser } from './preferenceCookie';

const posts = [
  { id: 1, region: '전라남도 구례군', address: '전라남도 구례군 구례읍', tags: ['산수유'], likes: 20 },
  { id: 2, region: '전라남도 구례군', address: '전라남도 구례군 마산면', tags: ['한옥카페'], likes: 30 },
  { id: 3, region: '전라남도 구례군', address: '전라남도 구례군 산동면', tags: ['자연'], likes: 10 },
];

describe('rankPostsForUser', () => {
  it('태그와 지역 선호 점수가 높은 게시물을 먼저 추천한다', () => {
    const ranked = rankPostsForUser(posts, {
      tagScores: { 산수유: 4 },
      regionScores: { '전라남도 구례군': 2 },
      recentViews: [],
    });

    expect(ranked.map(({ id }) => id)).toEqual([1, 2, 3]);
  });
});
