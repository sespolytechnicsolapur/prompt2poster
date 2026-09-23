import { validateEvaluationScore } from '../utils/scoreValidation';

/**
 * Sends poster data to AI evaluation backend service.
 * @param {Object} payload - { posterDataUrl, topic, contestantName, aiPrompt }
 * @returns {Promise<Object>} Validated evaluation result
 */
export async function evaluatePosterWithAI({ posterDataUrl, topic, contestantName, aiPrompt }) {
  try {
    const response = await fetch('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ posterDataUrl, topic, contestantName, aiPrompt })
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

/**
 * Requests AI to re-evaluate a submission with a new target total score.
 * The AI redistributes sub-scores across 7 criteria and generates matching reasoning.
 *
 * @param {Object} params
 * @param {number} params.newTotalScore - Target total score (0-100)
 * @param {string} params.topic - Competition topic
 * @param {string} params.contestantName - Contestant name
 * @param {string} params.adminPassword - Admin password for authorization
 * @returns {Promise<Object>} New evaluation data with redistributed scores
 */
export async function reEvaluateWithNewScore({ newTotalScore, topic, contestantName, adminPassword }) {
  try {
    const response = await fetch('/api/re-evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newTotalScore, topic, contestantName, adminPassword })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Re-evaluation API returned status ${response.status}`);
    }

    const data = await response.json();
    if (!data.success || !data.evaluation) {
      throw new Error(data.error || 'Failed to receive re-evaluation result');
    }

    return {
      evaluation: data.evaluation,
      source: data.source || 'groq-api-reevaluation'
    };

  } catch (error) {
    console.error('[Re-Evaluation Service Error]:', error);
    throw error;
  }
}
