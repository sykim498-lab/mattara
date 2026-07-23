import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  saveLike,
  subscribeToLikeCounts,
  subscribeToLikes,
} from '../services/firestoreService';
import { useLikes } from './useLikes';

vi.mock('../services/firestoreService', () => ({
  saveLike: vi.fn(),
  subscribeToLikeCounts: vi.fn(),
  subscribeToLikes: vi.fn(),
}));

describe('useLikes', () => {
  beforeEach(() => {
    localStorage.clear();
    saveLike.mockResolvedValue({ liked: true, count: 1 });
    subscribeToLikes.mockImplementation(async (_userId, onLikes) => {
      onLikes([]);
      return () => {};
    });
    subscribeToLikeCounts.mockImplementation(async (onCounts) => {
      onCounts(new Map());
      return () => {};
    });
  });

  it('좋아요 클릭 직후 상태와 카운트를 올리고 서버 값으로 확정한다', async () => {
    const { result } = renderHook(() => useLikes({ uid: 'member-1' }));
    await waitFor(() => expect(result.current.getLikeCount('post', 1, 128)).toBe(128));

    act(() => result.current.toggleLike('post', 1));

    expect(result.current.isLiked('post', 1)).toBe(true);
    expect(result.current.getLikeCount('post', 1, 128)).toBe(129);
    expect(saveLike).toHaveBeenCalledWith('member-1', 'post', 1, true);
  });
});
