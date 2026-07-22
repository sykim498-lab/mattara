import { describe, expect, it } from 'vitest';
import { createCourses } from './createCourses';
import { posts } from './posts';

describe('createCourses', () => {
  const courses = createCourses(posts[0]);

  it('세 가지 코스를 생성한다', () => {
    expect(courses).toHaveLength(3);
  });

  it('각 코스는 세 장소와 이동 거리를 포함한다', () => {
    courses.forEach((course) => {
      expect(course.steps).toHaveLength(3);
      expect(course.distance).toMatch(/km$/);
      expect(course.steps.every(({ address }) => address.includes('구례군'))).toBe(true);
    });
  });

  it('선택 태그 가중치가 높은 코스를 먼저 추천한다', () => {
    const ranked = createCourses(posts[0], { 산수유: 10 });
    expect(ranked[0].tags).toContain('산수유');
  });
});
