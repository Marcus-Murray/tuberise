/**
 * AI Bias Detection Module
 * Enhanced bias detection with multiple types
 */

import type { BiasResult } from '../../types';

/**
 * Detect bias in content
 */
export function detectBias(content: string): BiasResult {
  const lowerContent = content.toLowerCase();

  // Check for gender bias
  const genderBias = detectGenderBias(lowerContent);
  if (genderBias.hasBias) return genderBias;

  // Check for racial bias
  const racialBias = detectRacialBias(lowerContent);
  if (racialBias.hasBias) return racialBias;

  // Check for age bias
  const ageBias = detectAgeBias(lowerContent);
  if (ageBias.hasBias) return ageBias;

  // Check for religious bias
  const religiousBias = detectReligiousBias(lowerContent);
  if (religiousBias.hasBias) return religiousBias;

  // Check for political bias
  const politicalBias = detectPoliticalBias(lowerContent);
  if (politicalBias.hasBias) return politicalBias;

  return { hasBias: false };
}

/**
 * Detect gender bias
 */
function detectGenderBias(content: string): BiasResult {
  const genderBiasPatterns = [
    /women are not as good at/gi,
    /men are naturally better/gi,
    /gender stereotype/gi,
    /traditional gender roles/gi,
    /women belong in/gi,
    /men should not/gi,
  ];

  const hasBias = genderBiasPatterns.some(pattern => pattern.test(content));

  if (hasBias) {
    return {
      hasBias: true,
      type: 'gender',
      severity: 'medium',
      confidence: 0.8,
      details: 'Potential gender bias detected in content',
    };
  }

  return { hasBias: false };
}

/**
 * Detect racial bias
 */
function detectRacialBias(content: string): BiasResult {
  const racialBiasPatterns = [
    /racial stereotype/gi,
    /ethnic bias/gi,
    /discriminatory language/gi,
    /prejudiced remarks/gi,
    /racial profiling/gi,
  ];

  const hasBias = racialBiasPatterns.some(pattern => pattern.test(content));

  if (hasBias) {
    return {
      hasBias: true,
      type: 'racial',
      severity: 'high',
      confidence: 0.9,
      details: 'Potential racial bias detected in content',
    };
  }

  return { hasBias: false };
}

/**
 * Detect age bias
 */
function detectAgeBias(content: string): BiasResult {
  const ageBiasPatterns = [
    /age stereotype/gi,
    /too old for/gi,
    /too young for/gi,
    /age discrimination/gi,
    /generational bias/gi,
  ];

  const hasBias = ageBiasPatterns.some(pattern => pattern.test(content));

  if (hasBias) {
    return {
      hasBias: true,
      type: 'age',
      severity: 'low',
      confidence: 0.7,
      details: 'Potential age bias detected in content',
    };
  }

  return { hasBias: false };
}

/**
 * Detect religious bias
 */
function detectReligiousBias(content: string): BiasResult {
  const religiousBiasPatterns = [
    /religious stereotype/gi,
    /faith-based bias/gi,
    /religious discrimination/gi,
    /anti-religious sentiment/gi,
  ];

  const hasBias = religiousBiasPatterns.some(pattern => pattern.test(content));

  if (hasBias) {
    return {
      hasBias: true,
      type: 'religious',
      severity: 'medium',
      confidence: 0.8,
      details: 'Potential religious bias detected in content',
    };
  }

  return { hasBias: false };
}

/**
 * Detect political bias
 */
function detectPoliticalBias(content: string): BiasResult {
  const politicalBiasPatterns = [
    /political bias/gi,
    /partisan language/gi,
    /political stereotype/gi,
    /ideological bias/gi,
  ];

  const hasBias = politicalBiasPatterns.some(pattern => pattern.test(content));

  if (hasBias) {
    return {
      hasBias: true,
      type: 'political',
      severity: 'medium',
      confidence: 0.8,
      details: 'Potential political bias detected in content',
    };
  }

  return { hasBias: false };
}

/**
 * Analyze multiple insights for bias
 */
export function analyzeInsightsBias(insights: string[]): {
  hasBias: boolean;
  biasTypes: string[];
  severity: 'low' | 'medium' | 'high';
  recommendations: string[];
} {
  const biasTypes: string[] = [];
  let maxSeverity: 'low' | 'medium' | 'high' = 'low';

  insights.forEach(insight => {
    const biasResult = detectBias(insight);
    if (biasResult.hasBias) {
      biasTypes.push(biasResult.type || 'unknown');
      if (biasResult.severity === 'high') maxSeverity = 'high';
      else if (biasResult.severity === 'medium' && maxSeverity !== 'high') {
        maxSeverity = 'medium';
      }
    }
  });

  const hasBias = biasTypes.length > 0;
  const recommendations = hasBias
    ? [
        'Review AI training data for bias patterns',
        'Implement bias mitigation strategies',
        'Add human oversight for bias-sensitive content',
        'Regular bias auditing of AI outputs',
      ]
    : [];

  return {
    hasBias,
    biasTypes: [...new Set(biasTypes)],
    severity: maxSeverity,
    recommendations,
  };
}
