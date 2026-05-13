import { apiPost } from './client';
import type { AssistantAskRequest, AssistantAskResponse } from './types';

export function askAssistant(
  body: AssistantAskRequest,
): Promise<AssistantAskResponse> {
  return apiPost<AssistantAskResponse>('/api/v1/assistant/ask', body);
}
