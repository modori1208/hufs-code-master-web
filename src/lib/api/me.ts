import { apiDelete, apiPut } from './client';
import { config } from '@/lib/config';
import { t } from '@/i18n';
import type { MemberProfile } from './types';

/**
 * 닉네임 설정/변경. 백엔드가 형식 검증과 중복 검사를 수행합니다.
 */
export function updateNickname(nickname: string): Promise<MemberProfile> {
  return apiPut<MemberProfile>('/api/v1/me/nickname', { nickname });
}

/**
 * 상태 메시지 설정/변경. null/빈 문자열이면 제거.
 */
export function updateStatusMessage(message: string | null): Promise<MemberProfile> {
  return apiPut<MemberProfile>('/api/v1/me/status-message', { message });
}

export type UpdateSocialAccountsRequest = {
  github: string | null;
  twitter: string | null;
  linkedin: string | null;
};

/**
 * SNS 계정 사용자명 일괄 설정/변경. 빈 문자열/null 은 해당 계정 제거.
 */
export function updateSocialAccounts(
  request: UpdateSocialAccountsRequest,
): Promise<MemberProfile> {
  return apiPut<MemberProfile>('/api/v1/me/social-accounts', request);
}

/**
 * 현재 시행 중인 개인정보 처리방침에 동의. 서버가 자신의 시행일 상수를 기록합니다.
 */
export function agreeCurrentPolicy(): Promise<MemberProfile> {
  return apiPut<MemberProfile>('/api/v1/me/agree-policy', {});
}

export type ImageKind = 'profile' | 'cover';

/**
 * 프로필/배경 이미지 업로드. multipart/form-data 로 직접 전송하므로 fetch 를 따로 호출합니다.
 */
export async function uploadImage(
  kind: ImageKind,
  file: File,
): Promise<MemberProfile> {
  const form = new FormData();
  form.append('file', file);
  form.append('kind', kind);
  const url = `${config.apiBaseUrl}/api/v1/me/image`;
  const response = await fetch(url, {
    method: 'PUT',
    body: form,
    credentials: 'include',
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body?.message ?? t.user.image.uploadFailed);
  }
  return body.data as MemberProfile;
}

/**
 * 프로필/배경 이미지 삭제.
 */
export function deleteImage(kind: ImageKind): Promise<MemberProfile> {
  return apiDelete<MemberProfile>(`/api/v1/me/image?kind=${kind}`);
}
