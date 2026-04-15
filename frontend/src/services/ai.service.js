import { createApiClient } from './api';
import { serviceUrls } from './serviceUrls';

const aiApi = createApiClient(serviceUrls.aiSymptomChecker);

export async function analyzeSymptoms(payload) {
  const res = await aiApi.post('/analyze', payload);
  return res.data;
}
