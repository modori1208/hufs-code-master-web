import { t } from '@/i18n';

const SECONDS_PER_DAY = 86400;
const DAYS_PER_MONTH = 30;
const DAYS_PER_YEAR = 365;

/**
 * 상대 시간 표기 (예: "방금", "5분 전", "3시간 전", "2일 전", "6개월 전", "2년 전").
 *
 * <p>제출/채점 목록 등에서 쓰는 간소 표기. 정확한 시각이 필요하면 호출부에서 함께
 * {@link formatFullDateTime} 결과를 hover 툴팁 등으로 노출하세요.
 *
 * @param iso ISO 형식 datetime 문자열
 * @returns 상대 시간 문자열. 파싱 실패 시 원본 반환
 */
export function formatRelativeTime(iso: string): string {
  try {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return iso;
    const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
    if (seconds < 10) return t.common.justNow;
    if (seconds < 60) return t.common.secondsAgo(seconds);
    if (seconds < 3600) return t.common.minutesAgo(Math.floor(seconds / 60));
    if (seconds < SECONDS_PER_DAY) return t.common.hoursAgo(Math.floor(seconds / 3600));
    const days = Math.floor(seconds / SECONDS_PER_DAY);
    if (days < DAYS_PER_MONTH) return t.common.daysAgo(days);
    if (days < DAYS_PER_YEAR) return t.common.monthsAgo(Math.floor(days / DAYS_PER_MONTH));
    return t.common.yearsAgo(Math.floor(days / DAYS_PER_YEAR));
  } catch {
    return iso;
  }
}

/**
 * 자세한 절대 시각 표기 (예: "2026. 5. 17. 14:32:45").
 *
 * <p>{@link formatRelativeTime} 과 함께 hover 툴팁에서 정확한 시간을 보여줄 때 사용합니다.
 *
 * @param iso ISO 형식 datetime 문자열
 * @returns 사람이 읽을 수 있는 절대 시각 문자열
 */
export function formatFullDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString('ko-KR', { hour12: false });
  } catch {
    return iso;
  }
}
