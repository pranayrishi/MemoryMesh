import React from 'react';
import { Activity, Shield, Bell, AlertTriangle, TrendingDown, Clock } from 'lucide-react';

function StatisticsPanel({ statistics }) {
  if (!statistics) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Statistics Overview</h2>
          <span className="text-sm text-gray-500">Loading...</span>
        </div>
        <div className="text-center py-8 text-gray-400">
          <Activity className="w-12 h-12 mx-auto mb-3 opacity-50 animate-pulse" />
          <p className="text-sm">Loading statistics...</p>
        </div>
      </div>
    );
  }

  const total = statistics.totalInterventions || 0;
  const responseTime = statistics.averageResponseTime || 0;

  const stats = [
    {
      label: 'Total Interventions',
      value: total,
      icon: Activity,
      color: 'primary',
      subtext: total === 0 ? 'No interventions yet' : 'All time'
    },
    {
      label: 'AI-Only Handled',
      value: total > 0 ? `${statistics.aiOnlyPercentage || 0}%` : '0%',
      icon: Shield,
      color: 'success',
      subtext: `${statistics.aiOnlyCount || 0} interventions`
    },
    {
      label: 'Caregiver Notified',
      value: total > 0 ? `${statistics.notifyPercentage || 0}%` : '0%',
      icon: Bell,
      color: 'warning',
      subtext: `${statistics.notifyCount || 0} notifications`
    },
    {
      label: 'Emergencies',
      value: statistics.emergencyCount || 0,
      icon: AlertTriangle,
      color: 'danger',
      subtext: total > 0 ? `${statistics.emergencyPercentage || 0}% of total` : 'None'
    },
    {
      label: 'Success Rate',
      value: total > 0 ? `${statistics.successRate || 0}%` : 'N/A',
      icon: TrendingDown,
      color: 'success',
      subtext: total > 0 ? `${statistics.successfulRedirections || 0} successful` : 'No data yet'
    },
    {
      label: 'Response Time',
      value: responseTime > 0 ? `${(responseTime / 1000).toFixed(1)}s` : 'N/A',
      icon: Clock,
      color: 'primary',
      subtext: responseTime > 0 ? 'Average' : 'No data yet'
    }
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-lg font-semibold text-gray-900">Statistics Overview</h2>
        <span className="text-sm text-gray-500">Last 24 hours</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      {/* Key Insight */}
      {total > 0 ? (
        <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg border border-primary-200">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-primary-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-primary-900">
                AI Independence: {statistics.aiOnlyPercentage || 0}%
              </h3>
              <p className="text-sm text-primary-700 mt-1">
                The AI is handling {statistics.aiOnlyPercentage || 0}% of situations entirely on its own,
                giving you peace of mind while maintaining vigilant care. {statistics.aiOnlyCount || 0} of {total} interventions
                required no human involvement.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
          <div className="flex items-start space-x-3">
            <Activity className="w-5 h-5 text-gray-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Ready to Monitor
              </h3>
              <p className="text-sm text-gray-700 mt-1">
                The AI is actively monitoring and ready to intervene when needed. 
                Trigger a demo scenario using the ⚡ button to see the system in action.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, subtext }) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
    danger: 'bg-danger-50 text-danger-600'
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorClasses[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-xs font-medium text-gray-700">{label}</div>
      <div className="text-xs text-gray-500 mt-1">{subtext}</div>
    </div>
  );
}

export default StatisticsPanel;
