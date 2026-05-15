/**
 * 백엔드 응답 envelope. 모든 JSON 응답은 이 형태로 감싸집니다.
 */
export type ApiResponse<T> = {
  data: T | null;
  error_code: string | null;
  message: string | null;
};

/**
 * Spring Data 의 `Page<T>` 직렬화 형태 (SNAKE_CASE 변환 후).
 */
export type Page<T> = {
  content: T[];
  number: number;
  size: number;
  total_elements: number;
  total_pages: number;
  number_of_elements: number;
  first: boolean;
  last: boolean;
};

// ----- User -----

export type MemberStatus =
  | 'ATTENDING'
  | 'GRADUATED'
  | 'PROFESSOR'
  | 'COMMON_ID'
  | 'STAFF';

export type MemberRole = 'STUDENT' | 'ADMIN';

export type MemberProfile = {
  id: number;
  email: string;
  /** 실명 (SSO 제공). */
  name: string;
  /** 사이트 닉네임. 미설정 상태면 null. */
  nickname: string | null;
  department: string;
  status: MemberStatus;
  role: MemberRole;
  status_message: string | null;
  has_profile_image: boolean;
  profile_image_updated_at: string | null;
  has_cover_image: boolean;
  cover_image_updated_at: string | null;
  /** 영구 차단 여부. */
  banned_permanently: boolean;
  /** 임시 차단 종료 시각 (ISO local datetime). */
  banned_until: string | null;
  /** 차단 사유 (있다면). */
  ban_reason: string | null;
};

// ----- Problem -----

export type Difficulty =
  | 'BRONZE'
  | 'SILVER'
  | 'GOLD'
  | 'PLATINUM'
  | 'DIAMOND'
  | 'RUBY';

export type ProblemSummary = {
  id: number;
  title: string;
  difficulty: Difficulty;
};

export type ProblemSample = {
  order_index: number;
  input: string;
  output: string;
};

export type ProblemDetail = {
  id: number;
  title: string;
  difficulty: Difficulty;
  description_markdown: string;
  time_limit_ms: number;
  memory_limit_mb: number;
  samples: ProblemSample[];
};

// ----- Track -----

export type TrackSummary = {
  id: number;
  name: string;
  problem_count: number;
};

export type TrackDetail = {
  id: number;
  name: string;
  description_markdown: string;
  problems: ProblemSummary[];
};

// ----- Submission -----

export type Language = 'C' | 'CPP' | 'JAVA' | 'PYTHON3';

export type SubmissionVerdict =
  | 'PENDING'
  | 'JUDGING'
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'TIME_LIMIT_EXCEEDED'
  | 'MEMORY_LIMIT_EXCEEDED'
  | 'OUTPUT_LIMIT_EXCEEDED'
  | 'RUNTIME_ERROR'
  | 'COMPILE_ERROR'
  | 'JUDGEMENT_ERROR';

export type Submission = {
  id: number;
  problem_id: number;
  language: Language;
  verdict: SubmissionVerdict;
  runtime_ms: number | null;
  memory_kb: number | null;
  created_at: string;
};

export type SubmissionRequest = {
  problem_id: number;
  language: Language;
  source_code: string;
};

/**
 * 본인의 풀이 상태. 문제 목록 ✓ / ○ 표시에 사용됩니다.
 * `attempted` 는 `solved` 와 겹치지 않습니다.
 */
export type MyProblemStatus = {
  solved: number[];
  attempted: number[];
};

/**
 * 잔디(heatmap) 응답. 풀이가 1건 이상인 날짜만 포함됩니다.
 */
export type UserHeatmap = {
  days: Array<{
    /** ISO local date (YYYY-MM-DD). */
    date: string;
    /** 그날 푼 고유 문제 수. */
    count: number;
  }>;
};

/**
 * 채점 현황 등 공개 목록용. 소스 코드는 없고 제출자 이름이 포함됩니다.
 */
export type PublicSubmission = {
  id: number;
  member_id: number;
  nickname: string;
  department: string;
  language: Language;
  verdict: SubmissionVerdict;
  runtime_ms: number | null;
  memory_kb: number | null;
  created_at: string;
};

// ----- Public profile (다른 사용자) -----

export type UserPublicProfile = {
  id: number;
  nickname: string;
  department: string;
  role: MemberRole;
  status_message: string | null;
  has_profile_image: boolean;
  profile_image_updated_at: string | null;
  has_cover_image: boolean;
  cover_image_updated_at: string | null;
  joined_at: string;
  current_streak: number;
  longest_streak: number;
  weekly_solve_count: number;
  last_solved_date: string | null;
  /** 차단된 회원 프로필 여부. 본인/관리자만 조회 가능하며 UI 에 제한 배너를 표시합니다. */
  restricted: boolean;
};

// ----- Activity -----

export type Activity = {
  current_streak: number;
  longest_streak: number;
  weekly_solve_count: number;
  weekly_window_start: string;
  last_solved_date: string | null;
};

// ----- Assistant -----

export type AssistantAskRequest = {
  problem_id?: number;
  source_code?: string;
  language?: Language;
  message: string;
};

export type AssistantAskResponse = {
  reply: string;
  model: string;
  stub: boolean;
};

// ----- Admin -----

export type CreateProblemRequest = {
  title: string;
  description_markdown: string;
  time_limit_ms: number;
  memory_limit_mb: number;
  difficulty: Difficulty;
};

export type UpdateProblemRequest = CreateProblemRequest;

export type AdminTestCase = {
  id: number;
  order_index: number;
  sample: boolean;
  input: string;
  input_sha256: string;
  input_size: number;
  output: string;
  output_sha256: string;
  output_size: number;
};

export type CreateTestCaseRequest = {
  order_index: number;
  sample: boolean;
  input: string;
  output: string;
};

export type UpdateTestCaseRequest = CreateTestCaseRequest;

export type CreateTrackRequest = {
  name: string;
  description_markdown: string;
};

export type UpdateTrackRequest = CreateTrackRequest;

export type AddTrackProblemRequest = {
  problem_id: number;
  order_index: number;
};

// ----- Admin - Members -----

export type AdminMember = {
  id: number;
  email: string;
  name: string;
  nickname: string | null;
  department: string;
  status: MemberStatus;
  role: MemberRole;
  banned_permanently: boolean;
  banned_until: string | null;
  banned_at: string | null;
  ban_reason: string | null;
  created_at: string;
};

export type BanTemporarilyRequest = {
  /** ISO-8601 local datetime, 예: 2026-06-01T00:00:00 */
  until: string;
  reason?: string | null;
};

export type BanPermanentlyRequest = {
  reason?: string | null;
};

// ----- Admin - Judgehosts -----

export type AdminJudgehost = {
  id: number;
  hostname: string;
  enabled: boolean;
  last_seen_at: string | null;
  created_at: string;
};

// ----- Languages -----

export type LanguageConfig = {
  language: string;
  display_name: string;
  file_extension: string;
  monaco_language: string;
  compile_command: string | null;
  run_command: string;
  time_factor: number;
  memory_factor: number;
  enabled: boolean;
};

export type UpdateLanguageConfigRequest = {
  display_name: string;
  file_extension: string;
  monaco_language: string;
  compile_command: string | null;
  run_command: string;
  time_factor: number;
  memory_factor: number;
  enabled: boolean;
};
