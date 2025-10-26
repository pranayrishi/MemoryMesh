import React from 'react';
import { MessageSquare, AlertTriangle, Bell, CheckCircle, Volume2 } from 'lucide-react';

function InterventionCard({ intervention }) {
  if (!intervention) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-primary-600" />
            Latest Intervention
          </h2>
        </div>

        <div className="text-center py-12 text-gray-400">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No interventions yet</p>
          <p className="text-sm">AI is monitoring - all is well</p>
        </div>
      </div>
    );
  }

  const decision = intervention.decision;
  const level = intervention.level;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          {getInterventionIcon(level)}
          Latest Intervention
        </h2>
        <span className={`badge ${getInterventionBadge(level)}`}>
          {level}
        </span>
      </div>

      {/* Intervention Details */}
      <div className="space-y-4">
        {/* Timestamp */}
        <div className="text-sm text-gray-500">
          {new Date(intervention.timestamp).toLocaleTimeString()}
        </div>

        {/* Scenarios */}
        {intervention.scenarios && intervention.scenarios.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Scenario Detected</h3>
            <div className="flex flex-wrap gap-2">
              {intervention.scenarios.map((scenario, idx) => (
                <span key={idx} className="badge badge-info">
                  {scenario.type.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AI Reasoning */}
        {decision && decision.reasoning && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">AI Reasoning</h3>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {decision.reasoning}
            </p>
          </div>
        )}

        {/* Voice Message */}
        {decision && decision.voice_message && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Volume2 className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-primary-900 mb-1">
                  Spoken to {decision.patient_name || 'Patient'}
                </h3>
                <p className="text-sm text-primary-800 italic">
                  "{decision.voice_message}"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions Taken - Support both string array and object array */}
        {decision && decision.actions && decision.actions.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Actions Planned</h3>
            <div className="space-y-2">
              {decision.actions.map((action, idx) => {
                // Handle both string format and object format
                const actionText = typeof action === 'string' ? action : action.type;
                const actionSong = typeof action === 'object' ? action.song : null;
                const actionPhotos = typeof action === 'object' ? action.photos : null;
                
                return (
                  <div key={idx} className="flex items-center space-x-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-success-600" />
                    <span className="capitalize">{actionText.replace(/_/g, ' ')}</span>
                    {actionSong && <span className="text-gray-500">- {actionSong}</span>}
                    {actionPhotos && (
                      <span className="text-gray-500">- {actionPhotos.length} photos</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Executed Actions (from intervention coordinator) */}
        {intervention.actions && intervention.actions.length > 0 && intervention.actions[0].type !== 'no_action' && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Actions Executed</h3>
            <div className="space-y-2">
              {intervention.actions.map((action, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-success-600" />
                  <span className="capitalize">{action.type.replace(/_/g, ' ')}</span>
                  {action.song && <span className="text-gray-500">- {action.song}</span>}
                  {action.photos && (
                    <span className="text-gray-500">- {action.photos.length} photos</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Caregiver Notification */}
        {intervention.notifications && intervention.notifications.length > 0 && (
          <div className={`p-3 rounded-lg ${getNotificationStyle(intervention.notifications[0].priority)}`}>
            <div className="flex items-start space-x-2">
              <Bell className="w-4 h-4 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium">Caregiver Notified</h4>
                <p className="text-sm mt-1">{intervention.notifications[0].message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Learning Notes */}
        {decision && decision.learning_notes && (
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            <strong>AI Learning:</strong> {decision.learning_notes}
          </div>
        )}
      </div>
    </div>
  );
}

function getInterventionIcon(level) {
  switch (level) {
    case 'EMERGENCY':
      return <AlertTriangle className="w-5 h-5 mr-2 text-danger-600" />;
    case 'NOTIFY':
      return <Bell className="w-5 h-5 mr-2 text-warning-600" />;
    default:
      return <MessageSquare className="w-5 h-5 mr-2 text-primary-600" />;
  }
}

function getInterventionBadge(level) {
  switch (level) {
    case 'EMERGENCY':
      return 'badge-danger';
    case 'NOTIFY':
      return 'badge-warning';
    default:
      return 'badge-success';
  }
}

function getNotificationStyle(priority) {
  switch (priority) {
    case 'critical':
      return 'bg-danger-50 border border-danger-200 text-danger-800';
    case 'high':
      return 'bg-warning-50 border border-warning-200 text-warning-800';
    default:
      return 'bg-primary-50 border border-primary-200 text-primary-800';
  }
}

export default InterventionCard;
