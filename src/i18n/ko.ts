import type { Difficulty, Language, SubmissionVerdict } from '@/lib/api/types';

/**
 * 한국어 메시지 사전.
 *
 * <p>관리자(/admin) 영역은 운영자 전용이므로 번역하지 않고 페이지 내부에 그대로 둡니다.
 * 이 사전은 일반 사용자가 보는 모든 화면의 사용자 노출 문자열만 다룹니다.
 *
 * <p>다국어 추가 시 같은 구조의 {@link Messages} 를 만족하는 별도 파일 (`en.ts` 등) 을
 * 추가하고 {@code src/i18n/index.ts} 의 {@code t} export 를 locale 에 따라 선택하면 됩니다.
 */
export const ko = {
  // 도메인 enum 라벨
  difficulty: {
    BRONZE: '브론즈',
    SILVER: '실버',
    GOLD: '골드',
    PLATINUM: '플래티넘',
    DIAMOND: '다이아',
    RUBY: '루비',
  } satisfies Record<Difficulty, string>,

  language: {
    C: 'C',
    CPP: 'C++',
    JAVA: 'Java',
    PYTHON3: 'Python 3',
  } satisfies Record<Language, string>,

  verdict: {
    PENDING: '대기 중',
    JUDGING: '채점 중',
    ACCEPTED: '맞았습니다',
    WRONG_ANSWER: '틀렸습니다',
    TIME_LIMIT_EXCEEDED: '시간 초과',
    MEMORY_LIMIT_EXCEEDED: '메모리 초과',
    OUTPUT_LIMIT_EXCEEDED: '출력 초과',
    RUNTIME_ERROR: '런타임 에러',
    COMPILE_ERROR: '컴파일 에러',
    JUDGEMENT_ERROR: '채점 오류',
  } satisfies Record<SubmissionVerdict, string>,

  common: {
    cancel: '취소',
    save: '저장',
    confirm: '확인',
    close: '닫기',
    previous: '이전',
    next: '다음',
    loading: '불러오는 중...',
    none: '아직 없음',
    today: '오늘',
    yesterday: '어제',
    daysAgo: (n: number) => `${n}일 전`,
    minutesAgo: (n: number) => `${n}분 전`,
    hoursAgo: (n: number) => `${n}시간 전`,
    secondsAgo: (n: number) => `${n}초 전`,
    justNow: '방금',
    unknownError: '알 수 없는 오류',
    saveFailed: '저장에 실패했습니다.',
    pageOf: (current: number, total: number, count: number, unit: string) =>
      `${current} / ${total} 페이지 (총 ${count}${unit})`,
  },

  layout: {
    brandShort: 'CM',
    brandFull: 'HUFS CODE MASTER',
    footer: {
      copyright: (year: number) => `© ${year} HUFSTORY · 한국외국어대학교`,
      sponsor: '이 플랫폼은 교수학습개발센터의 Bring Your Own Ideas 지원으로 제작되었습니다.',
    },
    nav: {
      problems: '문제',
      tracks: '트랙',
      submissions: '내 제출',
    },
  },

  userMenu: {
    myProfile: '내 프로필',
    mySubmissions: '내 제출 기록',
    settings: '설정',
    admin: '관리자',
    logout: '로그아웃',
    logoutSuccess: '로그아웃되었습니다.',
    logoutFailed: '로그아웃에 실패했습니다.',
    theme: {
      light: '라이트',
      dark: '다크',
      system: '시스템',
    },
  },

  auth: {
    loginRequired: '로그인이 필요합니다',
    loginPageDescription: 'HUFS 이메일로 로그인해야 문제를 풀고 활동을 기록할 수 있습니다.',
    loginPageStudentOnly: '한국외대 재학생만 이용 가능합니다.',
    loginButton: 'HUFS 이메일로 로그인',
    loggingIn: '로그인 중...',
    loginShort: '로그인',
    callbackTitle: '로그인 중',
    callbackDescription: 'SSO 인증을 처리하고 있습니다.',
    callbackProcessing: '로그인 처리 중...',
    callbackFailed: '로그인을 완료하지 못했습니다.',
    backHome: '홈으로 돌아가기',
    loginErrors: {
      invalidState: '인증 세션이 만료되었거나 변조되었습니다. 다시 시도해 주세요.',
      invalidCallback: '잘못된 콜백 요청입니다. 다시 시도해 주세요.',
      loginFailed: '로그인에 실패했습니다. 다시 시도해 주세요.',
      unsupportedStatus: '재학생만 이용할 수 있는 서비스입니다.',
    },
    nicknameDialog: {
      title: '사용할 닉네임을 정해주세요',
      description:
        '채점 현황 및 랭킹 등 다른 사용자에게 보이는 화면에서 실명 대신 이 닉네임이 노출됩니다. 닉네임을 설정해야 서비스를 이용할 수 있습니다.',
      label: '닉네임',
      rule: (min: number, max: number) =>
        `${min}~${max}자 사이의 영문, 숫자, 한글만. 다른 사용자와 중복될 수 없습니다.`,
      lengthError: (min: number, max: number) => `닉네임은 ${min}~${max}자여야 합니다.`,
      patternError: '영문, 숫자, 한글만 사용할 수 있습니다.',
      submitButton: '설정 완료',
      saved: '닉네임이 설정되었습니다.',
      saveFailed: '닉네임 설정에 실패했습니다.',
    },
    bannedDialog: {
      title: '계정이 제한된 상태입니다',
      descriptionPermanent: '운영 정책 위반으로 이 계정은 영구 제한되었습니다.',
      descriptionTemporary: '운영 정책 위반으로 이 계정은 일시 제한되었습니다.',
      releaseAt: '제한 해제 예정:',
      reasonTitle: '사유',
      contact: '이의 제기를 원하는 경우 관리자에게 문의하세요.',
    },
    restrictedBanner: {
      title: '계정이 제한되었습니다.',
      description:
        '운영 정책 위반으로 인해 사이트 이용이 제한되었으며 프로필은 본인에게만 표시됩니다.',
    },
  },

  home: {
    landing: {
      badge: '한국외대 학생을 위한 PS 연습장',
      heroLine1: '알고리즘은 매일,',
      heroLine2: '함께 더 깊이.',
      subtitle:
        '트랙별 학습, 매주 갱신되는 스트릭, 그리고 AI 어시스턴트와 함께 HUFS CODE MASTER 에서 문제 풀이를 마스터해보세요.',
      startCta: '시작하기 · HUFS 이메일로 로그인',
      features: {
        tracks: {
          title: '트랙 학습',
          description: '난이도별로 정리된 학습 트랙을 따라 차근차근 실력을 쌓아보세요.',
        },
        streak: {
          title: '주간 스트릭',
          description: '매주 갱신되는 풀이 카운트와 연속 풀이일로 동기 부여를 받으세요.',
        },
        ai: {
          title: 'AI 어시스턴트',
          description: '막힌 문제는 사이트 내 AI 어시스턴트와 함께 풀어나가세요.',
        },
      },
    },
    authenticated: {
      welcomePrefix: '환영해요, ',
      welcomeSuffix: '님 👋',
      welcome: (name: string) => `환영해요, ${name}님 👋`,
      stats: {
        currentStreak: '현재 스트릭',
        longestStreak: '최장 스트릭',
        weeklySolve: '이번 주 풀이',
        lastSolved: '마지막 풀이',
        days: '일',
        problems: '문제',
      },
      quickLinks: {
        sectionTitle: '빠른 이동',
        problems: { title: '문제', description: '난이도별 전체 문제 목록.' },
        tracks: { title: '트랙', description: '주제별 학습 경로 따라가기.' },
        mySubmissions: { title: '내 제출', description: '내가 제출한 코드와 결과.' },
      },
      recent: {
        title: '최근 제출',
        viewAll: '전체 보기',
        loadFailed: '최근 제출을 불러오지 못했습니다.',
        emptyText: '아직 제출 내역이 없습니다. ',
        firstCta: '첫 문제 풀러 가기 →',
        problemPrefix: '문제 #',
      },
    },
  },

  problems: {
    listTitle: '문제',
    listDescription: '전체 문제 목록입니다. 난이도로 필터링할 수 있습니다.',
    difficultyPlaceholder: '난이도',
    allDifficulties: '모든 난이도',
    countUnit: '개',
    empty: '등록된 문제가 없습니다.',
    loadFailed: '문제 목록을 불러오지 못했습니다.',
    columns: {
      id: '#',
      status: '상태',
      title: '제목',
      difficulty: '난이도',
    },
    detail: {
      backToList: '← 목록으로',
      tab: {
        statement: '문제',
        submit: '제출',
        feed: '채점 현황',
      },
      timeLimitLabel: (ms: number) => `시간 제한: ${ms} ms`,
      memoryLimitLabel: (mb: number) => `메모리 제한: ${mb} MiB`,
      samples: '예제',
      sampleInputN: (n: number) => `예제 입력 ${n}`,
      sampleOutputN: (n: number) => `예제 출력 ${n}`,
      loadFailed: '문제를 불러올 수 없습니다.',
      editorLoading: '에디터를 불러오는 중...',
      notFound: '문제를 찾을 수 없습니다.',
    },
    status: {
      solved: '맞은 문제',
      attempted: '시도 중',
    },
  },

  tracks: {
    listTitle: '트랙',
    listDescription: '주제별로 묶인 학습 트랙을 따라 차근차근 풀어보세요.',
    countLabel: (n: number) => `문제 ${n}개`,
    loadFailed: '트랙을 불러오지 못했습니다.',
    empty: '등록된 트랙이 없습니다.',
    detail: {
      backToList: '← 트랙 목록',
      problems: '문제 목록',
      empty: '이 트랙에 등록된 문제가 없습니다.',
      loadFailed: '트랙을 불러올 수 없습니다.',
      notFound: '트랙을 찾을 수 없습니다.',
    },
  },

  submitPanel: {
    cardTitle: '코드 제출',
    languageLabel: '언어',
    sourceLabel: '소스 코드',
    submitButton: '제출하기',
    submitting: '제출 중...',
    submitted: '제출되었습니다. 채점 결과를 기다리는 중입니다.',
    submitFailedWith: (message: string) => `제출에 실패했습니다: ${message}`,
    emptyCode: '빈 코드는 제출할 수 없습니다.',
    confirmReset: '기본 제공 코드로 초기화할까요? 현재 작성한 코드는 사라집니다.',
    afterSubmitHint: '제출 후 채점 결과가 자동으로 갱신됩니다.',
    loginRequiredHint: '로그인 후 코드를 제출할 수 있습니다.',
    recentForProblem: '이 문제 최근 제출',
    placeholder: '여기에 코드를 작성하세요.',
  },

  submissions: {
    myTitle: '내 제출',
    myDescription: '내가 제출한 코드와 채점 결과를 확인합니다.',
    feedColumns: {
      id: '#',
      member: '제출자',
      language: '언어',
      verdict: '결과',
      runtime: '실행시간',
      memory: '메모리',
      time: '시각',
    },
    myColumns: {
      id: '#',
      problem: '문제',
      language: '언어',
      verdict: '결과',
      runtime: '실행시간',
      memory: '메모리',
      time: '제출 시각',
    },
    feedEmpty: '아직 이 문제의 제출 내역이 없습니다.',
    feedLoadFailed: '채점 현황을 불러오지 못했습니다.',
    myEmpty: '아직 제출 내역이 없습니다.',
    myLoadFailed: '제출 내역을 불러오지 못했습니다.',
    countUnit: '개',
  },

  user: {
    invalidId: '잘못된 사용자 ID 입니다.',
    notFound: '사용자를 찾을 수 없습니다.',
    loadFailed: '사용자 정보를 불러오지 못했습니다.',
    adminBadge: '관리자',
    joinedAt: (date: string) => `가입일: ${date}`,
    stats: {
      currentStreak: '현재 스트릭',
      longestStreak: '최장 스트릭',
      weeklySolve: '이번 주 풀이',
      lastSolved: '마지막 풀이',
      days: '일',
      problems: '문제',
    },
    heatmap: {
      title: '풀이 잔디',
      ariaLabel: '풀이 잔디',
      summaryProblemsUnit: ' 문제 · ',
      summaryDaysUnit: '일 활동',
      summaryPrefix: '최근 1년 동안 ',
      summaryPrefixMobile: '최근 3개월 동안 ',
      loadFailed: '잔디를 불러오지 못했습니다.',
      legendLow: '적음',
      legendHigh: '많음',
      tooltipActive: (date: string, count: number) => `${date} · ${count}문제`,
      tooltipEmpty: (date: string) => `${date} · 활동 없음`,
    },
    statusMessage: {
      addCta: '자기소개 추가',
      placeholder: '예: 알고리즘 공부 중인 24학번입니다.',
    },
    editProfile: {
      buttonLabel: '프로필 편집',
      dialog: {
        title: '프로필 편집',
        description: '프로필 정보를 한 번에 수정할 수 있습니다. 값을 비워두면 해당 항목이 제거됩니다.',
        coverLabel: '배경 이미지',
        coverEmpty: '배경 이미지 없음',
        statusMessageLabel: '자기소개',
        githubLabel: 'GitHub',
        githubPlaceholder: 'username',
        githubHint: '영문, 숫자, 하이픈만 사용 가능합니다.',
        twitterLabel: 'Twitter (X)',
        twitterPlaceholder: 'username',
        twitterHint: '영문, 숫자, 언더스코어만 사용 가능합니다.',
        linkedinLabel: 'LinkedIn',
        linkedinPlaceholder: 'vanity-slug',
        linkedinHint: '/in/ 뒤의 영문, 숫자, 하이픈 부분을 입력하세요.',
        submit: '저장',
        saved: '프로필이 저장되었습니다.',
        saveFailed: '프로필 저장에 실패했습니다.',
      },
    },
    image: {
      profileAriaLabel: '프로필 이미지 변경',
      replace: '이미지 교체',
      uploadAction: '이미지 업로드',
      delete: '삭제',
      deleteConfirm: '이미지를 삭제할까요?',
      profileUploaded: '프로필 이미지가 업로드되었습니다.',
      coverUploaded: '배경 이미지가 업로드되었습니다.',
      uploadFailed: '업로드 실패',
      deleted: '이미지가 삭제되었습니다.',
      deleteFailed: '삭제에 실패했습니다.',
      tooLarge: '5MB 이하의 파일만 업로드 가능합니다.',
      cropFailed: '이미지를 처리하지 못했습니다.',
    },
    crop: {
      titleProfile: '프로필 이미지 편집',
      titleCover: '배경 이미지 편집',
      description: '드래그 및 확대로 영역을 조정한 뒤 적용하세요.',
      zoomLabel: '확대',
      apply: '적용',
    },
    social: {
      githubAriaLabel: (username: string) => `GitHub: ${username}`,
      twitterAriaLabel: (username: string) => `X: ${username}`,
      linkedinAriaLabel: (username: string) => `LinkedIn: ${username}`,
      addCta: 'SNS 계정 연결',
    },
  },

  settings: {
    title: '설정',
    description: '계정 정보와 환경을 관리합니다.',
    profile: {
      title: '프로필',
      nicknameLabel: '닉네임',
      nicknameSaved: '닉네임이 변경되었습니다.',
      lengthError: (min: number, max: number) => `닉네임은 ${min}~${max}자여야 합니다.`,
      patternError: '영문, 숫자, 한글만 사용할 수 있습니다.',
      rule: (min: number, max: number) =>
        `${min}~${max}자 사이의 영문, 숫자, 한글만. 다른 사용자와 중복될 수 없습니다.`,
      fields: {
        name: '이름',
        email: '이메일',
        department: '학과',
      },
    },
    editor: {
      title: '코드 에디터',
      description: '이 브라우저에 한정된 설정입니다. 다른 기기에는 동기화되지 않습니다.',
      defaultLanguage: '기본 언어',
      defaultLanguageSaved: '기본 언어가 변경되었습니다.',
      defaultLanguageHint:
        '새 문제의 제출 탭에서 처음 선택될 언어입니다. 문제별 작성 중인 코드는 언어와 함께 저장되며 그대로 보존됩니다.',
    },
  },

  notFound: {
    code: '404',
    title: '페이지를 찾을 수 없습니다.',
    description: '주소를 다시 확인하거나 홈으로 돌아가 다른 메뉴를 이용해주세요.',
    backHome: '홈으로',
  },

  editor: {
    languageLabel: '언어 선택',
    placeholder: '여기에 코드를 작성하세요.',
    loading: '에디터를 불러오는 중...',
  },
} as const;

export type Messages = typeof ko;
