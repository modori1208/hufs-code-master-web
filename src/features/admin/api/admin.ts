import { apiDelete, apiGet, apiPost, apiPut, buildQuery } from '@/lib/api/client';
import type {
  AddTrackProblemRequest,
  AdminAuditLog,
  AdminJudgehost,
  AdminMember,
  AdminTestCase,
  BanPermanentlyRequest,
  BanTemporarilyRequest,
  CreateProblemRequest,
  CreateTestCaseRequest,
  CreateTrackRequest,
  LanguageConfig,
  Page,
  ProblemDetail,
  TrackDetail,
  UpdateLanguageConfigRequest,
  UpdateProblemRequest,
  UpdateTestCaseRequest,
  UpdateTrackRequest,
  UploadComparatorRequest,
} from '@/lib/api/types';

// ----- Problems -----

export function createProblem(body: CreateProblemRequest): Promise<ProblemDetail> {
  return apiPost<ProblemDetail>('/api/v1/admin/problems', body);
}

export function updateProblem(
  id: number,
  body: UpdateProblemRequest,
): Promise<ProblemDetail> {
  return apiPut<ProblemDetail>(`/api/v1/admin/problems/${id}`, body);
}

/**
 * 문제 하드 삭제. force=false (기본) 면 제출 이력이 있는 문제는 거부됩니다. force=true 면
 * 제출까지 함께 삭제하고 강행 — 잔디/스트릭/내 제출이 함께 사라지므로 마지막 수단으로만 사용.
 */
export function deleteProblem(id: number, force = false): Promise<void> {
  const query = force ? '?force=true' : '';
  return apiDelete<void>(`/api/v1/admin/problems/${id}${query}`);
}

/**
 * 문제 공개 여부 토글. true=공개, false=비공개. 비공개 시 일반 사용자에게 즉시
 * 노출/제출 기록에서 사라집니다.
 */
export function setProblemPublished(
  id: number,
  published: boolean,
): Promise<ProblemDetail> {
  return apiPut<ProblemDetail>(`/api/v1/admin/problems/${id}/published`, {
    published,
  });
}

// ----- Test cases -----

export function listAdminTestCases(problemId: number): Promise<AdminTestCase[]> {
  return apiGet<AdminTestCase[]>(`/api/v1/admin/problems/${problemId}/testcases`);
}

export function addTestCase(
  problemId: number,
  body: CreateTestCaseRequest,
): Promise<AdminTestCase> {
  return apiPost<AdminTestCase>(
    `/api/v1/admin/problems/${problemId}/testcases`,
    body,
  );
}

export function updateTestCase(
  problemId: number,
  testCaseId: number,
  body: UpdateTestCaseRequest,
): Promise<AdminTestCase> {
  return apiPut<AdminTestCase>(
    `/api/v1/admin/problems/${problemId}/testcases/${testCaseId}`,
    body,
  );
}

export function deleteTestCase(
  problemId: number,
  testCaseId: number,
): Promise<void> {
  return apiDelete<void>(
    `/api/v1/admin/problems/${problemId}/testcases/${testCaseId}`,
  );
}

// ----- Custom comparator -----

export type ComparatorScript = {
  /** sh 본문. 등록된 스크립트가 없으면 null. */
  script: string | null;
  sha256: string | null;
  size: number | null;
};

/**
 * 문제에 등록된 커스텀 채점 스크립트를 조회합니다. 등록된 스크립트가 없으면 모든 필드가 null.
 */
export function getComparator(problemId: number): Promise<ComparatorScript> {
  return apiGet<ComparatorScript>(
    `/api/v1/admin/problems/${problemId}/comparator`,
  );
}

/**
 * 문제의 커스텀 채점 스크립트를 업로드/교체합니다. 호출 시 백엔드에서 자동으로
 * `compare_mode` 가 `CUSTOM` 으로 전환됩니다.
 */
export function uploadComparator(
  problemId: number,
  body: UploadComparatorRequest,
): Promise<ProblemDetail> {
  return apiPut<ProblemDetail>(
    `/api/v1/admin/problems/${problemId}/comparator`,
    body,
  );
}

/**
 * 커스텀 채점 스크립트 제거. 채점 방식이 LINE_DIFF로 되돌아갑니다.
 */
export function deleteComparator(problemId: number): Promise<void> {
  return apiDelete<void>(`/api/v1/admin/problems/${problemId}/comparator`);
}

// ----- Tracks -----

export function createTrack(body: CreateTrackRequest): Promise<TrackDetail> {
  return apiPost<TrackDetail>('/api/v1/admin/tracks', body);
}

export function updateTrack(
  id: number,
  body: UpdateTrackRequest,
): Promise<TrackDetail> {
  return apiPut<TrackDetail>(`/api/v1/admin/tracks/${id}`, body);
}

export function deleteTrack(id: number): Promise<void> {
  return apiDelete<void>(`/api/v1/admin/tracks/${id}`);
}

export function addTrackProblem(
  trackId: number,
  body: AddTrackProblemRequest,
): Promise<TrackDetail> {
  return apiPost<TrackDetail>(`/api/v1/admin/tracks/${trackId}/problems`, body);
}

export function removeTrackProblem(
  trackId: number,
  problemId: number,
): Promise<void> {
  return apiDelete<void>(
    `/api/v1/admin/tracks/${trackId}/problems/${problemId}`,
  );
}

// ----- Members -----

export type ListAdminMembersParams = {
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
};

export function listAdminMembers(
  params: ListAdminMembersParams = {},
): Promise<Page<AdminMember>> {
  return apiGet<Page<AdminMember>>(`/api/v1/admin/members${buildQuery(params)}`);
}

export function grantAdmin(memberId: number): Promise<AdminMember> {
  return apiPut<AdminMember>(`/api/v1/admin/members/${memberId}/grant-admin`);
}

export function revokeAdmin(memberId: number): Promise<AdminMember> {
  return apiPut<AdminMember>(`/api/v1/admin/members/${memberId}/revoke-admin`);
}

export function banTemporarily(
  memberId: number,
  body: BanTemporarilyRequest,
): Promise<AdminMember> {
  return apiPost<AdminMember>(
    `/api/v1/admin/members/${memberId}/ban-temporarily`,
    body,
  );
}

export function banPermanently(
  memberId: number,
  body: BanPermanentlyRequest,
): Promise<AdminMember> {
  return apiPost<AdminMember>(
    `/api/v1/admin/members/${memberId}/ban-permanently`,
    body,
  );
}

export function unbanMember(memberId: number): Promise<AdminMember> {
  return apiDelete<AdminMember>(`/api/v1/admin/members/${memberId}/ban`);
}

// ----- Judgehosts -----

export function listAdminJudgehosts(): Promise<AdminJudgehost[]> {
  return apiGet<AdminJudgehost[]>('/api/v1/admin/judgehosts');
}

export function setJudgehostEnabled(
  id: number,
  enabled: boolean,
): Promise<AdminJudgehost> {
  return apiPut<AdminJudgehost>(`/api/v1/admin/judgehosts/${id}/enabled`, {
    enabled,
  });
}

export function deleteJudgehost(id: number): Promise<void> {
  return apiDelete<void>(`/api/v1/admin/judgehosts/${id}`);
}

// ----- Languages -----

export function listAdminLanguages(): Promise<LanguageConfig[]> {
  return apiGet<LanguageConfig[]>('/api/v1/admin/languages');
}

export function updateLanguageConfig(
  language: string,
  body: UpdateLanguageConfigRequest,
): Promise<LanguageConfig> {
  return apiPut<LanguageConfig>(`/api/v1/admin/languages/${language}`, body);
}

// ----- Audit logs -----

export type ListAdminAuditLogsParams = {
  memberId?: number;
  action?: string;
  /** ISO local datetime (예: 2026-05-17T00:00:00) */
  from?: string;
  /** ISO local datetime */
  to?: string;
  page?: number;
  size?: number;
  sort?: string;
};

export function listAdminAuditLogs(
  params: ListAdminAuditLogsParams = {},
): Promise<Page<AdminAuditLog>> {
  return apiGet<Page<AdminAuditLog>>(
    `/api/v1/admin/audit-logs${buildQuery(params)}`,
  );
}

/**
 * 현재 DB에 적재된 distinct action 목록. 필터 드롭다운 옵션용.
 */
export function listAdminAuditLogActions(): Promise<string[]> {
  return apiGet<string[]>('/api/v1/admin/audit-logs/actions');
}
