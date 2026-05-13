import { apiGet } from './client';
import type { TrackDetail, TrackSummary } from './types';

export function listTracks(): Promise<TrackSummary[]> {
  return apiGet<TrackSummary[]>('/api/v1/tracks');
}

export function getTrack(id: number): Promise<TrackDetail> {
  return apiGet<TrackDetail>(`/api/v1/tracks/${id}`);
}
