import { apiGet, apiPost, buildQuery } from '@/lib/api/client';
import type { MyProblemStatus, Page, Submission, SubmissionRequest } from '@/lib/api/types';

export type ListMySubmissionsParams = {
  page?: number;
  size?: number;
  sort?: string;
};

export function submitCode(body: SubmissionRequest): Promise<Submission> {
  return apiPost<Submission>('/api/v1/submissions', body);
}

export function listMySubmissions(
  params: ListMySubmissionsParams = {},
): Promise<Page<Submission>> {
  return apiGet<Page<Submission>>(
    `/api/v1/submissions/me${buildQuery(params)}`,
  );
}

/**
 * 본인의 풀이 상태 조회. 문제 목록 ✓ / ○ 표시에 사용됩니다.
 */
export function getMyProblemStatus(): Promise<MyProblemStatus> {
  return apiGet<MyProblemStatus>('/api/v1/me/problem-status');
}
