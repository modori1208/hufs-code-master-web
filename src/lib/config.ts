/**
 * 환경변수에서 읽어온 런타임 설정을 한 곳에 모읍니다.
 * 추가/변경 시 `.env.example` 과 `vite-env.d.ts` 의 타입도 함께 갱신하세요.
 */
export const config = {
  /** IdP authorize 엔드포인트. 프론트엔드가 사용자를 직접 보냅니다. */
  ssoAuthorizeUrl:
    import.meta.env.VITE_SSO_AUTHORIZE_URL ||
    'https://api.gdghufs.com/v1/sso/authorize',
  /** 백엔드와 매핑되는 SSO 클라이언트 ID. */
  ssoClientId: import.meta.env.VITE_SSO_CLIENT_ID || 'ps',
  /** API base URL. 비어있으면 동일 origin (Vite proxy 사용). */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
} as const;
