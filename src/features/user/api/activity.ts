import { apiGet } from '@/lib/api/client';
import type { Activity } from '@/lib/api/types';

export function getMyActivity(): Promise<Activity> {
  return apiGet<Activity>('/api/v1/me/activity');
}
