import { apiGet, apiPost } from '@/lib/api/client';
import type { PrivacyPolicy } from '@/lib/api/types';

/**
 * 현재 시행 중인 개인정보 처리방침을 가져옵니다. (공개 엔드포인트)
 */
export function getCurrentPolicy(): Promise<PrivacyPolicy> {
  return apiGet<PrivacyPolicy>('/api/v1/policy/current');
}

export type UpsertPolicyRequest = {
  effective_date: string; // YYYY-MM-DD
  content: string;
};

/**
 * 신규 버전 등록 또는 같은 시행일 본문 갱신. 관리자만 호출 가능.
 */
export function upsertPolicy(request: UpsertPolicyRequest): Promise<PrivacyPolicy> {
  return apiPost<PrivacyPolicy>('/api/v1/admin/policy', request);
}

/**
 * 전체 버전 목록 (시행일 내림차순). 관리자만 호출 가능.
 */
export function listAllPolicies(): Promise<PrivacyPolicy[]> {
  return apiGet<PrivacyPolicy[]>('/api/v1/admin/policy');
}
