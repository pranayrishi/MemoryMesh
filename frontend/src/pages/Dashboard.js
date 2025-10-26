import React, { useState, useEffect } from 'react';
import VideoMonitor from '../components/VideoMonitor';
import InterventionCard from '../components/InterventionCard';
import TimelineView from '../components/TimelineView';
import BehavioralPatterns from '../components/BehavioralPatterns';
import api from '../services/api';
import websocket from '../services/websocket';

function Dashboard({ patient, latestIntervention, visionAnalysis, statistics }) {
  const [timeline, setTimeline] = useState([]);
  const [dailySummary, setDailySummary] = useState(null);

  useEffect(() => {
    loadDashboardData();

    // Refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update data when new intervention comes in
  useEffect(() => {
    if (latestIntervention) {
      loadDashboardData();
    }
  }, [latestIntervention]);

  const loadDashboardData = async () => {
    try {
      const [timelineData, summary] = await Promise.all([
        api.getTimeline(),
        api.getDailySummary()
      ]);

      setTimeline(timelineData);
      setDailySummary(summary);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Video Analysis - Full Width on Top */}
      <div className="w-full">
        <VideoMonitor patient={patient} />
      </div>

      {/* Latest Intervention - Full Width Below Video */}
      <div className="w-full">
        <InterventionCard intervention={latestIntervention} />
      </div>

      {/* Timeline and Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TimelineView timeline={timeline} />
        </div>
        <div>
          <BehavioralPatterns dailySummary={dailySummary} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
