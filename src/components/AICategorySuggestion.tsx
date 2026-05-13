/**
 * Component to display AI-powered category suggestions
 * Shows predicted category with confidence level
 */

import React from 'react';

interface AICategorySuggestionProps {
  suggestedCategory: string | null;
  confidence: number;
  onAccept?: (category: string) => void;
  onDismiss?: () => void;
  isVisible: boolean;
}

export const AICategorySuggestion: React.FC<AICategorySuggestionProps> = ({
  suggestedCategory,
  confidence,
  onAccept,
  onDismiss,
  isVisible,
}) => {
  if (!isVisible || !suggestedCategory) return null;

  const confidencePercentage = Math.round(confidence * 100);
  const confidenceColor =
    confidencePercentage >= 80
      ? 'text-green-600'
      : confidencePercentage >= 60
        ? 'text-amber-600'
        : 'text-orange-600';

  return (
    <div className="mb-4 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="mb-1 font-semibold text-blue-900">
            🤖 AI Suggestion
          </h4>
          <p className="mb-2 text-sm text-blue-800">
            Based on your image, this appears to be related to:{' '}
            <span className="font-semibold">{suggestedCategory}</span>
          </p>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${confidenceColor}`}>
              Confidence: {confidencePercentage}%
            </span>
            {confidencePercentage >= 80 && (
              <span className="text-xs text-green-600">✓ High confidence</span>
            )}
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="mt-1 text-blue-400 hover:text-blue-600"
          aria-label="Dismiss suggestion"
        >
          ✕
        </button>
      </div>
      {onAccept && (
        <button
          onClick={() => onAccept(suggestedCategory)}
          className="mt-3 inline-block rounded bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
        >
          Use This Category
        </button>
      )}
    </div>
  );
};

export default AICategorySuggestion;
