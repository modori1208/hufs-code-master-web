import { apiGet, buildQuery } from './client';
import type {
  Difficulty,
  Page,
  ProblemDetail,
  ProblemSummary,
  PublicSubmission,
} from './types';

export type ListProblemsParams = {
  difficulty?: Difficulty;
  page?: number;
  size?: number;
  sort?: string;
};

export function listProblems(
  params: ListProblemsParams = {},
): Promise<Page<ProblemSummary>> {
  return apiGet<Page<ProblemSummary>>(`/api/v1/problems${buildQuery(params)}`);
}

export function getProblem(id: number): Promise<ProblemDetail> {
  return apiGet<ProblemDetail>(`/api/v1/problems/${id}`);
}

export type ListProblemSubmissionsParams = {
  page?: number;
  size?: number;
  sort?: string;
};

/**
 * 특정 문제의 채점 현황 (모든 사용자의 제출).
 */
export function listProblemSubmissions(
  problemId: number,
  params: ListProblemSubmissionsParams = {},
): Promise<Page<PublicSubmission>> {
  return apiGet<Page<PublicSubmission>>(
    `/api/v1/problems/${problemId}/submissions${buildQuery(params)}`,
  );
}
