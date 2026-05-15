import { ko, type Messages } from './ko';

/**
 * 활성 메시지 사전. 현재 한국어 고정.
 *
 * <p>나중에 다국어 토글을 만들면 다음과 같이 확장:
 * <pre>
 *   const locale = useLocale();
 *   const messages = locale === 'en' ? en : ko;
 * </pre>
 *
 * <p>지금은 정적 import 한 줄로 끝나기 때문에 hook / Provider 없이 그대로 사용합니다.
 */
export const t: Messages = ko;

export type { Messages } from './ko';
