import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { guryeCourses } from '../data/guryeCourses';
import { CourseFeedCard } from './CourseFeedCard';

describe('CourseFeedCard 코스 진입', () => {
  it('상세 버튼 대신 코스 사진을 눌렀을 때 코스를 연다', () => {
    const course = guryeCourses[0];
    const onOpen = vi.fn();
    render(
      <CourseFeedCard
        course={course}
        onOpen={onOpen}
        onToggleSave={() => {}}
      />,
    );

    expect(screen.queryByRole('button', { name: '코스 상세' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: `${course.theme} 코스 상세 보기` }));
    expect(onOpen).toHaveBeenCalledWith(course.id);
  });

  it('사진 캐러셀 화살표는 상세 페이지를 열지 않는다', () => {
    const onOpen = vi.fn();
    render(
      <CourseFeedCard
        course={guryeCourses[0]}
        onOpen={onOpen}
        onToggleSave={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '다음 장소' }));
    expect(onOpen).not.toHaveBeenCalled();
  });
});
