import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  saveBookmark,
  subscribeToBookmarkCounts,
  subscribeToBookmarks,
} from '../services/firestoreService';
import { useBookmarks } from './useBookmarks';

vi.mock('../services/firestoreService', () => ({
  saveBookmark: vi.fn(),
  subscribeToBookmarkCounts: vi.fn(),
  subscribeToBookmarks: vi.fn(),
}));

describe('useBookmarks', () => {
  beforeEach(() => {
    localStorage.clear();
    saveBookmark.mockResolvedValue({ saved: true, count: 4 });
    subscribeToBookmarks.mockImplementation(async (_userId, onBookmarks) => {
      onBookmarks([]);
      return () => {};
    });
    subscribeToBookmarkCounts.mockImplementation(async (_type, onCounts) => {
      onCounts(new Map([['1', 3]]));
      return () => {};
    });
  });

  it('클릭 직후 개수를 올리고 서버 응답 값으로 동기화한다', async () => {
    const { result } = renderHook(() => useBookmarks({ uid: 'member-1' }));
    await waitFor(() => expect(result.current.bookmarkCounts.get('1')).toBe(3));

    act(() => result.current.toggleBookmark(1));

    expect(result.current.bookmarkedIds.has(1)).toBe(true);
    expect(result.current.bookmarkCounts.get('1')).toBe(4);
    expect(saveBookmark).toHaveBeenCalledWith('member-1', 1, true);
    await waitFor(() => expect(result.current.bookmarkCounts.get('1')).toBe(4));
  });
});
