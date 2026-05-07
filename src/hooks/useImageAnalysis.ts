/**
 * Hook for handling AI-assisted image analysis and category suggestions
 * Provides real-time feedback to users about detected city problems
 */

import { useCallback, useState } from 'react';

interface ImageAnalysisState {
  isAnalyzing: boolean;
  prediction: {
    category: string;
    confidence: number;
  } | null;
  error: string | null;
}

export function useImageAnalysis() {
  const [state, setState] = useState<ImageAnalysisState>({
    isAnalyzing: false,
    prediction: null,
    error: null,
  });

  const resetAnalysis = useCallback(() => {
    setState({
      isAnalyzing: false,
      prediction: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    resetAnalysis,
  };
}

/**
 * Hook for managing AI category suggestions
 * Monitors image upload responses for category predictions
 */
export function useAICategoryDetection() {
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);

  const processPrediction = useCallback(
    (
      prediction: {
        predictedCategory?: string;
        confidence?: number;
      } | null
    ) => {
      if (prediction?.predictedCategory) {
        setSuggestedCategory(prediction.predictedCategory);
        setConfidence(prediction.confidence || 0);
      }
    },
    []
  );

  const clearSuggestion = useCallback(() => {
    setSuggestedCategory(null);
    setConfidence(0);
  }, []);

  return {
    suggestedCategory,
    confidence,
    processPrediction,
    clearSuggestion,
  };
}
