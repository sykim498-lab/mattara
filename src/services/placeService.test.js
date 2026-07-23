import { afterEach, describe, expect, it, vi } from 'vitest';
import { lookupPlaceDetails } from './placeService';

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
});
