import React, { useState, useEffect } from 'react';
import { Clock, Coffee, Pill, Activity, MessageSquare, Calendar, Download } from 'lucide-react';
import api from '../services/api';

function TimelineView({ timeline }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (timeline) {
      // Combine activities and interventions into a unified timeline
      const combined = [];

      if (timeline.activities) {
        combined.push(...timeline.activities.map(a => ({
          ...a,
          eventType: 'activity'
        })));
      }

      if (timeline.interventions) {
        combined.push(...timeline.interventions.map(i => ({
          timestamp: i.timestamp,
          type: i.level,
          description: i.decision?.reasoning || 'Intervention',
          eventType: 'intervention',
          data: i
        })));
      }

      // Sort by timestamp descending
      combined.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setEvents(combined.slice(0, 20)); // Show last 20 events
    }
  }, [timeline]);

  const exportToPDF = () => {
    // Create a printable HTML version
    const printWindow = window.open('', '_blank');
    const today = new Date().toLocaleDateString();
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>MemoryMesh Activity Report - ${today}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #2563eb;
            margin: 0 0 10px 0;
            font-size: 28px;
          }
          .header .subtitle {
            color: #666;
            font-size: 14px;
          }
          .report-date {
            text-align: right;
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
          }
          .event {
            margin-bottom: 25px;
            padding: 15px;
            border-left: 4px solid #e5e7eb;
            background: #f9fafb;
            page-break-inside: avoid;
          }
          .event.intervention {
            border-left-color: #2563eb;
            background: #eff6ff;
          }
          .event.emergency {
            border-left-color: #dc2626;
            background: #fef2f2;
          }
          .event.notify {
            border-left-color: #f59e0b;
            background: #fffbeb;
          }
          .event-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          .event-type {
            font-weight: bold;
            color: #111;
            text-transform: capitalize;
            font-size: 16px;
          }
          .event-time {
            color: #666;
            font-size: 14px;
          }
          .event-description {
            color: #444;
            line-height: 1.6;
            margin-bottom: 10px;
          }
          .ai-response {
            background: white;
            padding: 10px;
            border-radius: 4px;
            border: 1px solid #d1d5db;
            margin-top: 10px;
            font-style: italic;
            font-size: 13px;
          }
          .actions {
            margin-top: 10px;
          }
          .actions-label {
            font-weight: bold;
            font-size: 13px;
            margin-bottom: 5px;
          }
          .action-badge {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 12px;
            margin-right: 5px;
            margin-bottom: 5px;
          }
          .level-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            margin-top: 8px;
          }
          .level-emergency {
            background: #dc2626;
            color: white;
          }
          .level-notify {
            background: #f59e0b;
            color: white;
          }
          .level-ai {
            background: #10b981;
            color: white;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          .summary {
            background: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .summary h2 {
            margin: 0 0 15px 0;
            color: #111;
            font-size: 18px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
          }
          .summary-item {
            text-align: center;
          }
          .summary-value {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
          }
          .summary-label {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
          }
          @media print {
            body {
              padding: 20px;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🧠 MemoryMesh Activity Report</h1>
          <div class="subtitle">AI-Powered Cognitive Co-Pilot</div>
        </div>
        
        <div class="report-date">
          <strong>Report Date:</strong> ${today}
        </div>
        
        <div class="summary">
          <h2>Summary</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-value">${events.length}</div>
              <div class="summary-label">Total Events</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${events.filter(e => e.eventType === 'intervention').length}</div>
              <div class="summary-label">Interventions</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${events.filter(e => e.type === 'EMERGENCY').length}</div>
              <div class="summary-label">Emergency Alerts</div>
            </div>
          </div>
        </div>
        
        <h2 style="margin-bottom: 20px; color: #111;">Activity Timeline</h2>
        
        ${events.map(event => {
          const isIntervention = event.eventType === 'intervention';
          const eventClass = isIntervention ? 
            (event.type === 'EMERGENCY' ? 'event intervention emergency' : 
             event.type === 'NOTIFY' ? 'event intervention notify' : 
             'event intervention') : 'event';
          
          return `
            <div class="${eventClass}">
              <div class="event-header">
                <div class="event-type">${(event.type || 'Activity').replace(/_/g, ' ')}</div>
                <div class="event-time">${new Date(event.timestamp).toLocaleString()}</div>
              </div>
              <div class="event-description">
                ${event.description || event.activity || 'Event occurred'}
              </div>
              ${isIntervention && event.data?.decision?.voice_message ? `
                <div class="ai-response">
                  <strong>AI Response:</strong> "${event.data.decision.voice_message}"
                </div>
              ` : ''}
              ${isIntervention && event.data?.decision?.actions && event.data.decision.actions.length > 0 ? `
                <div class="actions">
                  <div class="actions-label">Actions Taken:</div>
                  ${event.data.decision.actions.map(action => {
                    const actionText = typeof action === 'string' ? action : action.type;
                    return `<span class="action-badge">${actionText.replace(/_/g, ' ')}</span>`;
                  }).join('')}
                </div>
              ` : ''}
              ${isIntervention && event.data?.level ? `
                <span class="level-badge level-${event.data.level.toLowerCase().replace('_', '-')}">
                  ${event.data.level.replace('_', ' ')}
                </span>
              ` : ''}
            </div>
          `;
        }).join('')}
        
        <div class="footer">
          <p><strong>MemoryMesh</strong> - AI-Powered Cognitive Co-Pilot for Dementia Care</p>
          <p>This report was automatically generated on ${new Date().toLocaleString()}</p>
          <p style="margin-top: 10px; font-size: 11px;">
            This report is for informational purposes. Please consult with healthcare professionals for medical decisions.
          </p>
        </div>
        
        <div class="no-print" style="text-align: center; margin-top: 30px;">
          <button onclick="window.print()" style="
            background: #2563eb;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
            font-weight: bold;
          ">
            Print / Save as PDF
          </button>
          <button onclick="window.close()" style="
            background: #6b7280;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
            margin-left: 10px;
          ">
            Close
          </button>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-primary-600" />
              Activity Timeline
            </h2>
            <span className="text-sm text-gray-500">Today</span>
          </div>
          {events.length > 0 && (
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              title="Export as PDF Report"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {events.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-base font-medium mb-2">No events yet today</p>
            <p className="text-sm">Trigger a demo scenario to see interventions appear here</p>
            <p className="text-xs mt-4 text-gray-500">Timeline updates automatically when interventions occur</p>
          </div>
        ) : (
          events.map((event, idx) => (
            <TimelineEvent key={idx} event={event} isLast={idx === events.length - 1} />
          ))
        )}
      </div>
    </div>
  );
}

function TimelineEvent({ event, isLast }) {
  const isIntervention = event.eventType === 'intervention';
  const icon = getEventIcon(event);
  const color = getEventColor(event);

  return (
    <div className="flex items-start space-x-4">
      {/* Timeline indicator */}
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
          {icon}
        </div>
        {!isLast && <div className="w-0.5 h-full bg-gray-200 mt-2"></div>}
      </div>

      {/* Event content */}
      <div className="flex-1 pb-6">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-medium text-gray-900 capitalize">
            {event.type?.replace(/_/g, ' ') || 'Activity'}
          </h4>
          <span className="text-xs text-gray-500">
            {new Date(event.timestamp).toLocaleTimeString()}
          </span>
        </div>

        <p className="text-sm text-gray-600">
          {event.description || event.activity || 'Event occurred'}
        </p>

        {isIntervention && event.data?.decision?.voice_message && (
          <div className="mt-2 text-xs italic text-primary-700 bg-primary-50 p-2 rounded border border-primary-200">
            <strong>AI Response:</strong> "{event.data.decision.voice_message.substring(0, 120)}..."
          </div>
        )}

        {/* Show actions from decision (planned actions) */}
        {isIntervention && event.data?.decision?.actions && event.data.decision.actions.length > 0 && (
          <div className="mt-2">
            <p className="text-xs font-medium text-gray-700 mb-1">Actions:</p>
            <div className="flex flex-wrap gap-1">
              {event.data.decision.actions.slice(0, 4).map((action, idx) => {
                const actionText = typeof action === 'string' ? action : action.type;
                return (
                  <span key={idx} className="text-xs badge badge-success">
                    {actionText.replace(/_/g, ' ')}
                  </span>
                );
              })}
              {event.data.decision.actions.length > 4 && (
                <span className="text-xs text-gray-500">
                  +{event.data.decision.actions.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Show intervention level badge */}
        {isIntervention && event.data?.level && (
          <div className="mt-2">
            <span className={`text-xs badge ${getLevelBadge(event.data.level)}`}>
              {event.data.level.replace('_', ' ')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function getLevelBadge(level) {
  switch (level?.toLowerCase()) {
    case 'emergency':
      return 'badge-danger';
    case 'notify':
      return 'badge-warning';
    case 'ai_only':
      return 'badge-success';
    default:
      return 'badge-info';
  }
}

function getEventIcon(event) {
  if (event.eventType === 'intervention') {
    return <MessageSquare className="w-5 h-5 text-white" />;
  }

  switch (event.type) {
    case 'meal':
      return <Coffee className="w-5 h-5 text-white" />;
    case 'medication':
      return <Pill className="w-5 h-5 text-white" />;
    default:
      return <Activity className="w-5 h-5 text-white" />;
  }
}

function getEventColor(event) {
  if (event.eventType === 'intervention') {
    switch (event.type) {
      case 'EMERGENCY':
        return 'bg-danger-600';
      case 'NOTIFY':
        return 'bg-warning-600';
      default:
        return 'bg-primary-600';
    }
  }

  switch (event.type) {
    case 'meal':
      return 'bg-success-600';
    case 'medication':
      return 'bg-primary-600';
    default:
      return 'bg-gray-600';
  }
}

export default TimelineView;
