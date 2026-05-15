import { create } from 'zustand';

type BannedDialogState = {
  open: boolean;
  show: () => void;
  hide: () => void;
};

/**
 * 차단 안내 모달의 표시 상태. 로그인 직후 자동 표시(BannedScreenDialog 자체 로직)외에도
 * 본인 프로필의 제한 배너 등 외부에서 다시 열어달라는 트리거를 제공합니다.
 */
export const useBannedDialog = create<BannedDialogState>((set) => ({
  open: false,
  show: () => set({ open: true }),
  hide: () => set({ open: false }),
}));
