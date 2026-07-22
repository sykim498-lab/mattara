import { describe, expect, it } from 'vitest';
import { createCourses } from './createCourses';

describe('createCourses', () => {
  const courses = createCourses();

  it('구례 로컬 코스 여덟 개를 생성한다', () => {
    expect(courses).toHaveLength(8);
    expect(courses.map(({ number }) => number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('각 코스는 구례군 내 로컬 장소 네 곳과 이동 거리를 포함한다', () => {
    courses.forEach((course) => {
      expect(course.steps).toHaveLength(4);
      expect(course.distance).toMatch(/^차량 약 \d+km$/);
      expect(course.steps.every(({ address, local }) =>
        address.includes('구례군') && local,
      )).toBe(true);
    });
  });

  it('제공된 장소와 이미지가 지정된 코스에 정확히 매핑된다', () => {
    expect(courses[0].steps.map(({ name }) => name)).toEqual([
      '화엄사', '부부식당', '천은사', '목월빵집',
    ]);
    expect(courses[7].steps[3]).toMatchObject({
      name: '오차커피공방',
      image: 'https://tse1.mm.bing.net/th/id/OIP.gMQuLHnr-SnthgPsmIhY7wHaFj?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
    });
  });

  it('선택 태그 가중치가 높은 코스를 먼저 추천한다', () => {
    const ranked = createCourses({ 산수유: 10 });
    expect(ranked[0].id).toBe('jirisan-scenery-food');
    expect(ranked[0].matchedTags).toContain('산수유');
  });
});
