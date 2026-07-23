import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildCourseDirectionsUrl,
  buildDirectionsUrl,
  lookupPlaceDetails,
} from './placeService';

afterEach(() => vi.unstubAllGlobals());

describe('lookupPlaceDetails', () => {
  it('공개 장소 데이터에서 운영시간과 전화번호를 가져온다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{
        lat: '35.2',
        lon: '127.4',
        extratags: { opening_hours: 'Mo-Su 11:00-20:00', phone: '061-000-0000' },
      }],
    }));

    const result = await lookupPlaceDetails('구례식당', '전라남도 구례군 구례읍');
    expect(result).toMatchObject({
      hours: 'Mo-Su 11:00-20:00',
      phone: '061-000-0000',
      lat: 35.2,
      lng: 127.4,
    });
  });

  it('좌표와 장소 ID를 Google 지도 길찾기 URL에 연결한다', () => {
    const url = buildDirectionsUrl({
      name: '구례 식당',
      lat: 35.2,
      lng: 127.4,
      placeId: 'google-place-id',
    });
    expect(url).toContain('destination=35.2%2C127.4');
    expect(url).toContain('destination_place_id=google-place-id');
  });

  it('코스의 중간 장소를 경유지로 연결한다', () => {
    const url = buildCourseDirectionsUrl([
      { name: '첫 장소', address: '구례군 1' },
      { name: '마지막 장소', address: '구례군 2' },
    ]);
    expect(url).toContain('destination=');
    expect(url).toContain('waypoints=');
  });
});
