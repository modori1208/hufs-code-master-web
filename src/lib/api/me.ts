import { apiDelete, apiPut } from './client';
import { config } from '@/lib/config';
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
    throw new Error(body?.message ?? '이미지 업로드 실패');
  }
  return body.data as MemberProfile;
}

/**
 * 프로필/배경 이미지 삭제.
 */
export function deleteImage(kind: ImageKind): Promise<MemberProfile> {
  return apiDelete<MemberProfile>(`/api/v1/me/image?kind=${kind}`);
}
