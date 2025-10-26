import React from 'react';
import { TrendingUp, Brain, Lightbulb, AlertCircle } from 'lucide-react';

function BehavioralPatterns({ dailySummary }) {
  if (!dailySummary || dailySummary.totalInterventions === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-primary-600" />
            Behavioral Patterns
          </h2>
          <span className="badge badge-info">AI Insights</span>
        </div>
        <div className="text-center py-8 text-gray-400">
          <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-base font-medium mb-2">No patterns yet</p>
          <p className="text-sm">Trigger interventions to see AI-generated behavioral insights</p>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
            <p className="text-xs text-gray-600">
              <strong>What you'll see:</strong>
            </p>
            <ul className="text-xs text-gray-600 mt-2 space-y-1">
              <li>• Peak confusion time windows</li>
              <li>• Common scenario patterns</li>
              <li>• AI-generated recommendations</li>
              <li>• Intervention effectiveness breakdown</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const { patterns, topScenarios } = dailySummary;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Brain className="w-5 h-5 mr-2 text-primary-600" />
          Behavioral Patterns
        </h2>
        <span className="badge badge-info">AI Insights</span>
      </div>

      <div className="space-y-6">
        {/* Peak Confusion Times */}
        {patterns?.peakConfusionTimes && patterns.peakConfusionTimes.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <TrendingUp className="w-4 h-4 text-warning-600" />
              <h3 className="text-sm font-medium text-gray-900">Peak Confusion Windows</h3>
            </div>

            <div className="space-y-2">
              {patterns.peakConfusionTimes.map((peak, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-warning-900">
                      {formatHour(peak.hour)}
                    </div>
                    <div className="text-xs text-warning-700">
                      {peak.count} {peak.count === 1 ? 'intervention' : 'interventions'}
                    </div>
                  </div>
                  <AlertCircle className="w-5 h-5 text-warning-600" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Scenarios */}
        {topScenarios && topScenarios.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Brain className="w-4 h-4 text-primary-600" />
              <h3 className="text-sm font-medium text-gray-900">Common Scenarios</h3>
            </div>

            <div className="space-y-2">
              {topScenarios.map((scenario, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700 capitalize">
                    {scenario.type.replace('_', ' ')}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {scenario.count}x
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        {patterns?.recommendations && patterns.recommendations.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Lightbulb className="w-4 h-4 text-success-600" />
              <h3 className="text-sm font-medium text-gray-900">AI Recommendations</h3>
            </div>

            <div className="space-y-3">
              {patterns.recommendations.map((rec, idx) => (
                <div key={idx} className="p-3 bg-success-50 border border-success-200 rounded-lg">
                  <p className="text-sm text-success-800">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Learning Progress */}
        <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg border border-primary-200">
          <div className="flex items-start space-x-3">
            <Brain className="w-5 h-5 text-primary-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-primary-900 mb-1">
                AI Continuous Learning
              </h4>
              <p className="text-xs text-primary-700">
                The AI is analyzing {dailySummary.totalInterventions || 0} interventions today
                to improve future care strategies for Margaret.
              </p>
            </div>
          </div>
        </div>

        {/* Intervention Breakdown */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Intervention Breakdown</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">AI-Only</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success-600"
                    style={{
                      width: `${dailySummary.byLevel ? (dailySummary.byLevel.aiOnly / dailySummary.totalInterventions * 100) : 0}%`
                    }}
                  ></div>
                </div>
                <span className="font-medium text-gray-900 w-8 text-right">
                  {dailySummary.byLevel?.aiOnly || 0}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Notify</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-warning-600"
                    style={{
                      width: `${dailySummary.byLevel ? (dailySummary.byLevel.notify / dailySummary.totalInterventions * 100) : 0}%`
                    }}
                  ></div>
                </div>
                <span className="font-medium text-gray-900 w-8 text-right">
                  {dailySummary.byLevel?.notify || 0}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Emergency</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-danger-600"
                    style={{
                      width: `${dailySummary.byLevel ? (dailySummary.byLevel.emergency / dailySummary.totalInterventions * 100) : 0}%`
                    }}
                  ></div>
                </div>
                <span className="font-medium text-gray-900 w-8 text-right">
                  {dailySummary.byLevel?.emergency || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatHour(hour) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:00 ${period}`;
}

export default BehavioralPatterns;
