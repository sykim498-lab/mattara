export const DEFAULT_CATEGORIES = [
  { id: 'all', label: '전체', icon: '', matchTags: [], protected: true },
  { id: 'cornelian', label: '산수유', icon: '🌼', matchTags: ['산수유'] },
  { id: 'relax', label: '릴랙스', icon: '🌿', matchTags: ['릴랙스'] },
  { id: 'local-food', label: '로컬푸드', icon: '🥢', matchTags: ['로컬푸드'] },
  { id: 'hanok', label: '한옥카페', icon: '🏡', matchTags: ['한옥카페'] },
  { id: 'nature', label: '자연', icon: '⛰️', matchTags: ['자연'] },
  { id: 'hidden', label: '숨은 명소', icon: '✨', matchTags: ['숨은명소'] },
];

export const CATEGORY_STORAGE_KEY = 'mattara.gurye.categories.v2';
