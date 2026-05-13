import { apiGet } from './client';
import type { Activity } from './types';

export function getMyActivity(): Promise<Activity> {
  return apiGet<Activity>('/api/v1/me/activity');
}
