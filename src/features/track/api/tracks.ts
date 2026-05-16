import { apiGet } from '@/lib/api/client';
import type { TrackDetail, TrackSummary } from '@/lib/api/types';

export function listTracks(): Promise<TrackSummary[]> {
  return apiGet<TrackSummary[]>('/api/v1/tracks');
}

export function getTrack(id: number): Promise<TrackDetail> {
  return apiGet<TrackDetail>(`/api/v1/tracks/${id}`);
}
