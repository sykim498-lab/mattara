import { describe, expect, it } from 'vitest';
import { resolveMemberRole, roleLabel } from './roles';

describe('admin member roles', () => {
  it('treats accounts created before the migration cutoff as administrators', () => {
    const user = { metadata: { creationTime: '2026-07-22T08:00:00Z' } };
    expect(resolveMemberRole({}, user)).toBe('admin');
  });

  it('keeps new accounts as regular members', () => {
    const user = { metadata: { creationTime: '2026-07-22T09:00:00Z' } };
    expect(resolveMemberRole({ role: 'member' }, user)).toBe('member');
    expect(roleLabel('member')).toBe('일반회원');
  });

  it('honors an explicit administrator claim', () => {
    expect(resolveMemberRole({ role: 'member' }, {}, { admin: true })).toBe('admin');
  });

  it('grants administrator access to the configured email', () => {
    [
      'SEOULDDDDD@GMAIL.COM',
      'gaingnarim@gmail.com',
      'nm22491@gmail.com',
      'jeungseunga0@gmail.com',
    ].forEach((email) => {
      expect(resolveMemberRole({ role: 'member' }, { email })).toBe('admin');
    });
  });

  it('does not grant access to a misspelled email domain', () => {
    const user = { email: 'seoulddddd@gmail.cpm' };
    expect(resolveMemberRole({ role: 'member' }, user)).toBe('member');
  });
});
