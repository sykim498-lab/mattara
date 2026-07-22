import { describe, expect, it } from 'vitest';
import { filterGuryePosts, isFranchisePlace, isGuryeCourse } from './gurye';

describe('구례 지역 데이터 제한', () => {
  it('구례군 밖의 게시물을 제외한다', () => {
    const posts = [
      { id: 1, region: '전라남도 구례군', address: '전라남도 구례군 구례읍' },
      { id: 2, region: '서울특별시', address: '서울특별시 마포구' },
    ];
    expect(filterGuryePosts(posts).map(({ id }) => id)).toEqual([1]);
  });

  it('모든 경유지가 구례군인 코스만 허용한다', () => {
    expect(isGuryeCourse({ steps: [{ address: '전라남도 구례군 마산면' }] })).toBe(true);
    expect(isGuryeCourse({ steps: [{ address: '전라남도 순천시' }] })).toBe(false);
  });

  it('구례 주소라도 대기업 프랜차이즈는 제외한다', () => {
    const franchise = {
      name: '스타벅스 구례점',
      region: '전라남도 구례군',
      address: '전라남도 구례군 구례읍',
    };
    expect(isFranchisePlace(franchise)).toBe(true);
    expect(filterGuryePosts([franchise])).toEqual([]);
    expect(isGuryeCourse({ steps: [franchise] })).toBe(false);
  });
});
