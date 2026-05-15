import { config } from '@/lib/config';

/**
 * 사용자 프로필/배경 이미지 절대 URL. updatedAt 을 캐시 키로 부착합니다.
 */
export function userImageUrl(
  id: number,
  kind: 'profile' | 'cover',
  updatedAt: string | null,
): string {
  const v = updatedAt ? new Date(updatedAt).getTime() : 0;
  const path = `/api/v1/users/${id}/${kind}-image?v=${v}`;
  return `${config.apiBaseUrl}${path}`;
}
