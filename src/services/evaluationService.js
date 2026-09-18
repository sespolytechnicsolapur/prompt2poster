import { validateEvaluationScore } from '../utils/scoreValidation';

/**
 * Sends poster data to AI evaluation backend service
 * @param {Object} payload { posterDataUrl, topic, contestantName }
 * @returns {Promise<Object>} Validated evaluation result
 */
export async function evaluatePosterWithAI({ posterDataUrl, topic, contestantName }) {
  try {
    const response = await fetch('/api/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        posterDataUrl,
        topic,
        contestantName
      })
    });

    if (!response.ok) {
      throw new Error(`Evaluation API returned status ${response.status}`);
    }

    const data = await response.json();
    if (!data.success || !data.evaluation) {
      throw new Error(data.error || 'Failed to receive AI evaluation object');
    }

    // MANDATORY SCORE INTEGRITY VALIDATION
    const validationResult = validateEvaluationScore(data.evaluation);

    if (!validationResult.isValid) {
      console.error('[Score Integrity Validation Failure]:', validationResult.errors);
      throw new Error(`AI Score Validation Failed: ${validationResult.errors.join('; ')}`);
    }

    return {
      evaluation: validationResult.normalizedData,
      source: data.source || 'groq-ai'
    };

  } catch (error) {
    console.error('[Evaluation Service Error]:', error);
    throw error;
  }
}
