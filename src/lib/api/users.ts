import { apiGet } from './client';
import type { UserPublicProfile } from './types';

/**
 * 닉네임으로 다른 사용자의 공개 프로필을 조회합니다.
 */
export function getUserByNickname(nickname: string): Promise<UserPublicProfile> {
  return apiGet<UserPublicProfile>(`/api/v1/users/${encodeURIComponent(nickname)}`);
}
