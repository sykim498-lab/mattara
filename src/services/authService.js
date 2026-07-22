import { isSupabaseConfigured, supabase } from './supabase';
import {
  signInLocally,
  signOutLocally,
  signUpLocally,
} from './localAuthService';

export async function signInWithPassword(identifier, password) {
  if (!isSupabaseConfigured) return signInLocally(identifier, password);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: identifier.trim(),
    password,
  });
  if (error) throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
  return { user: data.user, requiresEmailConfirmation: false };
}

export async function signUpWithPassword(identifier, password) {
  if (!isSupabaseConfigured) return signUpLocally(identifier, password);
  const { data, error } = await supabase.auth.signUp({
    email: identifier.trim(),
    password,
  });
  if (error) throw error;
  return {
    user: data.user,
    requiresEmailConfirmation: Boolean(data.user && !data.session),
  };
}

export async function signInWithSocial(provider) {
  if (!isSupabaseConfigured) {
    throw new Error('소셜 로그인 환경 변수가 아직 설정되지 않았습니다.');
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${location.origin}${location.pathname}` },
  });
  if (error) throw error;
}

export async function signOut() {
  if (!supabase) {
    signOutLocally();
    return;
  }
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function submitRestaurant(values) {
  if (!supabase) throw new Error('서버 저장소가 아직 연결되지 않았습니다.');
  const { data, error } = await supabase
    .from('restaurant_submissions')
    .insert(values)
    .select('id, status')
    .single();
  if (error) throw error;
  return data;
}
