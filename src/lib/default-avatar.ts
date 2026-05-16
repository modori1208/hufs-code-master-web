/**
 * 프로필 이미지를 등록하지 않은 사용자에게 보여줄 기본 아바타.
 *
 * <p>인라인 SVG data URL로 만들어 두면 항상 {@code <img>}가 렌더되므로 Avatar 내부
 * 콘텐츠가 "이미지가 있을 때 vs 없을 때" 로 갈리지 않습니다. 그 결과 절대 위치한
 * 카메라 버튼 등의 좌표 계산이 흔들리지 않고, 다크/라이트 모드 모두에서 동일하게 노출됩니다.
 */
export const DEFAULT_AVATAR_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
      '<rect width="100" height="100" fill="#e2e8f0"/>' +
      '<circle cx="50" cy="40" r="18" fill="#94a3b8"/>' +
      '<path d="M 14 90 C 14 66, 30 60, 50 60 C 70 60, 86 66, 86 90 L 86 100 L 14 100 Z" fill="#94a3b8"/>' +
      '</svg>',
  );
