import { apiGet, apiPost, buildQuery } from './client';
import type { Page, Submission, SubmissionRequest } from './types';

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
