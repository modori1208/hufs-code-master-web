import { apiGet, apiPost } from '@/lib/api/client';
import { config } from '@/lib/config';
import type { MemberProfile } from '@/lib/api/types';

/** 프론트엔드 콜백 라우트. IdP 의 redirect_uri 로 사용됩니다. */
export const SSO_CALLBACK_PATH = '/auth/callback';

const STATE_STORAGE_KEY = 'cm:sso:state';
const NEXT_STORAGE_KEY = 'cm:sso:next';

function generateState(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * IdP authorize 페이지로 사용자를 보냅니다. state 와 로그인 후 이동할 경로를
 * sessionStorage 에 저장하여 콜백에서 검증/활용합니다.
 *
 * @param next 로그인 성공 후 이동할 프론트엔드 경로
 */
export function startSsoLogin(next: string = '/'): void {
  const state = generateState();
  sessionStorage.setItem(STATE_STORAGE_KEY, state);
  sessionStorage.setItem(NEXT_STORAGE_KEY, next);

  const redirectUri = `${window.location.origin}${SSO_CALLBACK_PATH}`;
  const params = new URLSearchParams({
    client_id: config.ssoClientId,
    redirect_uri: redirectUri,
    state,
  });
  window.location.href = `${config.ssoAuthorizeUrl}?${params.toString()}`;
}

/**
 * sessionStorage 에 저장된 state 와 next 를 꺼내 반환합니다. 한 번 호출하면 삭제됩니다.
 */
export function consumeSsoState(): { state: string | null; next: string } {
  const state = sessionStorage.getItem(STATE_STORAGE_KEY);
  const next = sessionStorage.getItem(NEXT_STORAGE_KEY) ?? '/';
  sessionStorage.removeItem(STATE_STORAGE_KEY);
  sessionStorage.removeItem(NEXT_STORAGE_KEY);
  return { state, next };
}

/**
 * 콜백에서 받은 code 를 백엔드에 보내 세션을 발급받습니다.
 */
export function exchangeCode(code: string): Promise<MemberProfile> {
  return apiPost<MemberProfile>('/api/v1/auth/exchange', { code });
}

export function getMe(): Promise<MemberProfile> {
  return apiGet<MemberProfile>('/api/v1/auth/me');
}

export function logout(): Promise<void> {
  return apiPost<void>('/api/v1/auth/logout');
}
