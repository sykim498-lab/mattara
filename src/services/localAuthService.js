const ACCOUNTS_KEY = 'mattara.auth.accounts.v1';
const SESSION_KEY = 'mattara.auth.session.v1';
const AUTH_EVENT = 'mattara-auth-change';
const PASSWORD_ITERATIONS = 120000;

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function normalizeIdentifier(identifier) {
  return identifier.trim().toLocaleLowerCase('ko-KR');
}

function bytesToBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

function base64ToBytes(value) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

async function hashPassword(password, salt) {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations: PASSWORD_ITERATIONS,
    },
    material,
    256,
  );
  return bytesToBase64(new Uint8Array(bits));
}

function toUser(account) {
  return {
    id: account.id,
    email: null,
    app_metadata: { provider: 'local' },
    user_metadata: { username: account.identifier },
  };
}

function notifyAuthChange() {
  window.dispatchEvent(new Event(AUTH_EVENT));
}

function createId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function validateLocalCredentials(identifier, password) {
  const normalized = normalizeIdentifier(identifier);
  if (!/^[\p{L}\p{N}._-]{4,24}$/u.test(normalized)) {
    throw new Error('아이디는 한글, 영문, 숫자, 점, 밑줄로 4~24자 입력해 주세요.');
  }
  if (password.length < 8 || password.length > 64) {
    throw new Error('비밀번호는 8~64자로 입력해 주세요.');
  }
  return normalized;
}

export async function signUpLocally(identifier, password) {
  const normalized = validateLocalCredentials(identifier, password);
  const accounts = readJson(ACCOUNTS_KEY, []);
  if (accounts.some((account) => account.identifier === normalized)) {
    throw new Error('이미 사용 중인 아이디입니다.');
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const account = {
    id: createId(),
    identifier: normalized,
    salt: bytesToBase64(salt),
    passwordHash: await hashPassword(password, salt),
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, account]));
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: account.id }));
  notifyAuthChange();
  return { user: toUser(account), requiresEmailConfirmation: false };
}

export async function signInLocally(identifier, password) {
  const normalized = normalizeIdentifier(identifier);
  const accounts = readJson(ACCOUNTS_KEY, []);
  const account = accounts.find((candidate) => candidate.identifier === normalized);
  if (!account) throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');

  const passwordHash = await hashPassword(password, base64ToBytes(account.salt));
  if (passwordHash !== account.passwordHash) {
    throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: account.id }));
  notifyAuthChange();
  return { user: toUser(account), requiresEmailConfirmation: false };
}

export function getLocalUser() {
  const session = readJson(SESSION_KEY, null);
  if (!session?.userId) return null;
  const accounts = readJson(ACCOUNTS_KEY, []);
  const account = accounts.find((candidate) => candidate.id === session.userId);
  return account ? toUser(account) : null;
}

export function signOutLocally() {
  localStorage.removeItem(SESSION_KEY);
  notifyAuthChange();
}

export function subscribeToLocalAuth(callback) {
  const handleChange = () => callback(getLocalUser());
  const handleStorage = (event) => {
    if (event.key === SESSION_KEY || event.key === ACCOUNTS_KEY) handleChange();
  };
  window.addEventListener(AUTH_EVENT, handleChange);
  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener(AUTH_EVENT, handleChange);
    window.removeEventListener('storage', handleStorage);
  };
}
