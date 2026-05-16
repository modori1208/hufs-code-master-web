/**
 * 백엔드 응답 envelope. 모든 JSON 응답은 이 형태로 감싸집니다.
 */
export type ApiResponse<T> = {
  data: T | null;
  error_code: string | null;
  message: string | null;
};

/** 개인정보 처리방침 한 버전. */
export type PrivacyPolicy = {
  id: number;
  effective_date: string; // YYYY-MM-DD
  content: string; // Markdown
  created_at: string;
};

/**
 * Spring Data의 `Page<T>` 가 PagedModel(VIA_DTO)로 직렬화된 형태 (SNAKE_CASE 변환 후).
 * 백엔드 Application에 {@code @EnableSpringDataWebSupport(pageSerializationMode = VIA_DTO)}
 * 가 적용되어 있어, content와 page 메타가 분리되어 직렬화됩니다.
 *
 * first / last / number_of_elements는 응답에 없으므로 헬퍼({@link isFirstPage}, {@link isLastPage})
 * 로 계산합니다.
 */
export type Page<T> = {
  content: T[];
  page: {
    size: number;
    number: number;
    total_elements: number;
    total_pages: number;
  };
};

export function isFirstPage(page: Page<unknown>): boolean {
  return page.page.number <= 0;
}

export function isLastPage(page: Page<unknown>): boolean {
  return page.page.number >= page.page.total_pages - 1;
}

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
  /** GitHub 사용자명 (https://github.com/{value}). */
  github_username: string | null;
  /** X(Twitter) 사용자명 (https://x.com/{value}). */
  twitter_username: string | null;
  /** LinkedIn vanity slug (https://www.linkedin.com/in/{value}). */
  linkedin_username: string | null;
  /** 사용자가 동의한 처리방침 시행일 (ISO YYYY-MM-DD). 미동의면 null. */
  agreed_policy_effective_date: string | null;
  /** 현재 시행 중인 처리방침 시행일 (서버 상수). 위 값과 다르면 재동의 필요. */
  current_policy_effective_date: string;
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

/**
 * 문제별 채점 방식.
 *
 * - LINE_DIFF: 줄 단위 비교 (기본). 각 줄 trailing whitespace와 파일 끝 빈 줄을 무시.
 * - TOKEN: 공백 무시 토큰 단위 비교.
 * - FLOAT_EPS: 부동소수점 허용오차 비교. compare_arg에 epsilon (예: "1e-6").
 * - CUSTOM: 운영진이 업로드한 sh 스크립트로 채점.
 */
export type CompareMode = 'LINE_DIFF' | 'TOKEN' | 'FLOAT_EPS' | 'CUSTOM';

export type ProblemDetail = {
  id: number;
  title: string;
  difficulty: Difficulty;
  description_markdown: string;
  time_limit_ms: number;
  memory_limit_mb: number;
  /**
   * 채점 방식. admin 호출자에게만 채워서 내려옵니다. 일반 사용자 응답에서는 백엔드의
   * `default-property-inclusion: non_null` 정책에 의해 필드 자체가 빠지므로 undefined.
   */
  compare_mode?: CompareMode;
  /** 채점 파라미터 (FLOAT_EPS에서 epsilon). admin만 노출. */
  compare_arg?: string;
  /** CUSTOM 모드에서 스크립트가 업로드된 상태인지. admin만 노출. */
  has_custom_comparator?: boolean;
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
  problem_title: string;
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
 * 잔디(heatmap) 응답. 풀이가 1 건 이상인 날짜만 포함됩니다.
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
  /** 차단된 회원 프로필 여부. 본인/관리자만 조회 가능하며 UI에 제한 배너를 표시합니다. */
  restricted: boolean;
  github_username: string | null;
  twitter_username: string | null;
  linkedin_username: string | null;
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
  /** 채점 방식. 생략하면 백엔드 기본값 LINE_DIFF. */
  compare_mode?: CompareMode;
  /** FLOAT_EPS의 epsilon 등. */
  compare_arg?: string | null;
};

export type UpdateProblemRequest = CreateProblemRequest;

export type UploadComparatorRequest = {
  /** sh 스크립트 본문. shebang(#!)으로 시작해야 함. */
  script: string;
};

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

// ----- Admin - Audit logs -----

export type AdminAuditLog = {
  id: number;
  member_id: number | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  ip: string | null;
  http_method: string | null;
  uri: string | null;
  metadata: string | null;
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
