import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { guryeCourses } from '../data/guryeCourses';
import { CoursePage } from './CoursePage';

vi.mock('../components/CourseMap', () => ({
  CourseMap: () => <div data-testid="course-map">지도</div>,
}));
vi.mock('../components/RelatedCourses', () => ({ RelatedCourses: () => null }));
vi.mock('../components/Breadcrumbs', () => ({ Breadcrumbs: () => null }));
vi.mock('../services/placeService', () => ({
  buildCourseDirectionsUrl: () => '#route',
  buildDirectionsUrl: () => '#step',
  lookupPlaceDetails: () => Promise.resolve({
    hours: '매일 11:00-20:00',
    phone: '061-000-0000',
    source: 'Google Places',
    website: 'https://example.com',
  }),
}));

describe('CoursePage 장소 상세 정보', () => {
  it('지도 바로 아래에 현재 장소의 API 상세 정보를 표시한다', async () => {
    const { container } = render(
      <CoursePage
        sourceCourses={guryeCourses}
        initialCourseId={guryeCourses[0].id}
      />,
    );

    const map = screen.getByTestId('course-map');
    expect(map.nextElementSibling).toHaveClass('course-place-info');
    await waitFor(() => expect(screen.getByText('061-000-0000')).toBeInTheDocument());
    expect(container.querySelector('.course-place-info')).toHaveTextContent('매일 11:00-20:00');
  });
});
