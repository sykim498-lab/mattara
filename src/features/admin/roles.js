export const ADMIN_CUTOFF = Date.parse('2026-07-22T08:05:00Z');

export const MEMBER_LEVELS = [
  { value: 'member', label: '일반회원' },
  { value: 'editor', label: '에디터' },
  { value: 'admin', label: '관리자' },
];

export function isLegacyAdministrator(profile, user) {
  if (profile?.role) return false;
  const createdAt = profile?.createdAt?.toMillis?.()
    ?? Date.parse(user?.metadata?.creationTime ?? '');
  return Number.isFinite(createdAt) && createdAt <= ADMIN_CUTOFF;
}

export function resolveMemberRole(profile, user, claims = {}) {
  if (claims.admin === true) return 'admin';
  if (isLegacyAdministrator(profile, user)) return 'admin';
  return profile?.role ?? 'member';
}

export function roleLabel(role) {
  return MEMBER_LEVELS.find((level) => level.value === role)?.label ?? '일반회원';
}
