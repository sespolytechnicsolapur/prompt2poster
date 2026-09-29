/**
 * Score Validation Utility for Prompt2Poster
 * Enforces exact mathematical & structural validity of AI evaluations
 */

export const CRITERIA_DEFINITIONS = [
  { key: 'relevance_to_topic', label: 'Relevance to Topic', maxScore: 20 },
  { key: 'visual_hierarchy', label: 'Visual Hierarchy', maxScore: 15 },
  { key: 'typography_readability', label: 'Typography / Readability', maxScore: 10 },
  { key: 'composition_layout', label: 'Composition / Layout', maxScore: 15 },
  { key: 'creativity_originality', label: 'Creativity / Originality', maxScore: 15 },
  { key: 'color_usage', label: 'Color Usage', maxScore: 10 },
  { key: 'overall_communication', label: 'Overall Communication', maxScore: 5 },
  { key: 'prompt_authenticity', label: 'Prompt Authenticity & Human Element', maxScore: 10 },
];

export const TOTAL_MAX_SCORE = 100;

/**
 * Validates AI Evaluation Object
 * @param {Object} evalData 
 * @returns {Object} { isValid: boolean, errors: string[], normalizedData?: Object }
 */
export function validateEvaluationScore(evalData) {
  const errors = [];

  if (!evalData || typeof evalData !== 'object') {
    return { isValid: false, errors: ['Evaluation data must be a non-null object'] };
  }

  let calculatedSum = 0;
  const normalizedData = { ...evalData };

  for (const item of CRITERIA_DEFINITIONS) {
    const criterionKey = item.key;
    const itemData = evalData[criterionKey];

    if (!itemData) {
      errors.push(`Missing mandatory evaluation criterion: "${item.label}" (${criterionKey})`);
      continue;
    }

    const score = Number(itemData.score);
    if (isNaN(score) || typeof score !== 'number') {
      errors.push(`Score for "${item.label}" must be a valid number`);
      continue;
    }

    if (score < 0) {
      errors.push(`Score for "${item.label}" cannot be negative (received ${score})`);
    }

    if (score > item.maxScore) {
      errors.push(`Score for "${item.label}" cannot exceed maximum of ${item.maxScore} (received ${score})`);
    }

    calculatedSum += Math.round(score);
  }

  // Verify and reconcile total score calculation
  const totalScore = Number(evalData.total_score);
  if (isNaN(totalScore)) {
    // If AI omitted or corrupted total_score, auto-derive from sum of criteria
    normalizedData.total_score = calculatedSum;
  } else if (totalScore !== calculatedSum) {
    console.warn(`[Score Validation] total_score mismatch: AI reported ${totalScore}, auto-correcting to exact sum of 8 criteria (${calculatedSum})`);
    normalizedData.total_score = calculatedSum;
  } else {
    normalizedData.total_score = calculatedSum;
  }

  // Ensure issues is an array of strings
  if (!Array.isArray(evalData.issues)) {
    errors.push('issues field must be an array of string critique points');
  }

  // Ensure overall evaluation string exists
  if (!evalData.overall_evaluation || typeof evalData.overall_evaluation !== 'string') {
    errors.push('overall_evaluation must be a non-empty summary string');
  }

  return {
    isValid: errors.length === 0,
    errors,
    calculatedTotal: calculatedSum,
    normalizedData
  };
}
