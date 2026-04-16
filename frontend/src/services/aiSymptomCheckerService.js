// src/services/aiSymptomCheckerService.js
import { AI_SYMPTOM_CHECKER_API } from './api';

export const analyzeSymptoms = (symptoms) =>
  AI_SYMPTOM_CHECKER_API.post('/analyze', { symptoms });
