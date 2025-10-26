import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity, Clock, CheckCircle, AlertTriangle, BarChart3 } from 'lucide-react';

const StatisticsPage = () => {
  const [statistics, setStatistics] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [dailySummary, setDailySummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
    const interval = setInterval(fetchStatistics, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatistics = async () => {
    try {
      const [statsRes, timelineRes, summaryRes] = await Promise.all([
        fetch('http://localhost:5000/api/statistics'),
        fetch('http://localhost:5000/api/timeline'),
        fetch('http://localhost:5000/api/summary/daily'),
      ]);

      const stats = await statsRes.json();
      const timelineData = await timelineRes.json();
      const summary = await summaryRes.json();

      setStatistics(stats);
      setTimeline(timelineData.interventions || []);
      setDailySummary(summary);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const interventionLevelData = [
    { name: 'AI Only', value: statistics?.aiOnlyCount || 0, color: '#10b981' },
    { name: 'Notify', value: statistics?.notifyCount || 0, color: '#f59e0b' },
    { name: 'Emergency', value: statistics?.emergencyCount || 0, color: '#ef4444' },
  ];

  const scenarioData = dailySummary?.topScenarios?.map(s => ({
    name: s.type.replace('_', ' '),
    count: s.count,
  })) || [];

  const hourlyData = dailySummary?.patterns?.peakConfusionTimes?.map(p => ({
    hour: `${p.hour}:00`,
    interventions: p.count,
  })) || [];

  const successData = [
    { name: 'Successful', value: statistics?.successfulRedirections || 0, color: '#10b981' },
    { name: 'Pending', value: (statistics?.totalInterventions || 0) - (statistics?.successfulRedirections || 0), color: '#6b7280' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Statistics & Analytics
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive insights into intervention patterns and outcomes
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-medium">Total Interventions</h3>
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{statistics?.totalInterventions || 0}</p>
            <p className="text-sm text-gray-500 mt-1">All time</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-medium">Success Rate</h3>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{statistics?.successRate || 0}%</p>
            <p className="text-sm text-gray-500 mt-1">Successful redirections</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-medium">Avg Response Time</h3>
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {(statistics?.averageResponseTime / 1000).toFixed(1)}s
            </p>
            <p className="text-sm text-gray-500 mt-1">AI response speed</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-medium">Emergency Alerts</h3>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{statistics?.emergencyCount || 0}</p>
            <p className="text-sm text-gray-500 mt-1">Critical situations</p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Intervention Levels Pie Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Intervention Levels</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={interventionLevelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {interventionLevelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium">AI Only</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-1">{statistics?.aiOnlyCount || 0}</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-sm font-medium">Notify</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-1">{statistics?.notifyCount || 0}</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm font-medium">Emergency</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-1">{statistics?.emergencyCount || 0}</p>
              </div>
            </div>
          </div>

          {/* Success Rate Pie Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Success Rate</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={successData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {successData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
              <p className="text-4xl font-bold text-green-600">{statistics?.successRate || 0}%</p>
              <p className="text-gray-600 mt-1">of interventions successful</p>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top Scenarios Bar Chart */}
          {scenarioData.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Top Scenarios</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scenarioData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Hourly Pattern Line Chart */}
          {hourlyData.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Peak Confusion Times</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="interventions" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recent Interventions Table */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Interventions</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Time</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Level</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Scenario</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {timeline.slice(0, 10).map((intervention, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(intervention.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        intervention.level === 'emergency' ? 'bg-red-100 text-red-800' :
                        intervention.level === 'notify' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {intervention.level}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {intervention.scenarios?.[0]?.type || 'Unknown'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        intervention.success ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {intervention.success ? 'Success' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Recommendations */}
        {dailySummary?.patterns?.recommendations && dailySummary.patterns.recommendations.length > 0 && (
          <div className="mt-6 bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              AI Recommendations
            </h3>
            <ul className="space-y-2">
              {dailySummary.patterns.recommendations.map((rec, idx) => (
                <li key={idx} className="text-blue-800 flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticsPage;
