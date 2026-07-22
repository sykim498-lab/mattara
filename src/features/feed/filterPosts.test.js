import { describe, expect, it } from 'vitest';
import { filterPosts } from './filterPosts';

const samplePosts = [
  { id: 1, region: '전라남도 구례군', address: '전라남도 구례군 구례읍', tags: ['자연', '릴랙스'] },
  { id: 2, region: '전라남도 구례군', address: '전라남도 구례군 마산면', tags: ['한옥카페', '전통'] },
];

describe('filterPosts', () => {
  it('전체 카테고리에서는 모든 게시물을 반환한다', () => {
    expect(filterPosts(samplePosts, { id: 'all' })).toHaveLength(2);
  });

  it('연결 태그 중 하나라도 일치하는 게시물을 반환한다', () => {
    const category = { id: 'hanok', matchTags: ['한옥카페'] };
    expect(filterPosts(samplePosts, category)).toEqual([samplePosts[1]]);
  });
});
