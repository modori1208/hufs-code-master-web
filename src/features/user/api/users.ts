import { apiGet } from '@/lib/api/client';
import type { UserHeatmap, UserPublicProfile } from '@/lib/api/types';

/**
 * 내부 ID 로 다른 사용자의 공개 프로필을 조회합니다.
 */
export function getUserById(id: number): Promise<UserPublicProfile> {
  return apiGet<UserPublicProfile>(`/api/v1/users/${id}`);
}

/**
 * 사용자 잔디(heatmap). 최근 약 1년치 일별 풀이 카운트.
 */
export function getUserHeatmap(id: number): Promise<UserHeatmap> {
  return apiGet<UserHeatmap>(`/api/v1/users/${id}/heatmap`);
}
