import { apiDelete, apiGet, apiPost, apiPut, buildQuery } from './client';
import type {
  AddTrackProblemRequest,
  AdminMember,
  AdminTestCase,
  BanPermanentlyRequest,
  BanTemporarilyRequest,
  CreateProblemRequest,
  CreateTestCaseRequest,
  CreateTrackRequest,
  Page,
  ProblemDetail,
  TrackDetail,
  UpdateProblemRequest,
  UpdateTestCaseRequest,
  UpdateTrackRequest,
} from './types';

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

export function deleteProblem(id: number): Promise<void> {
  return apiDelete<void>(`/api/v1/admin/problems/${id}`);
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
